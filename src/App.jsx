import { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";
import fontData from "./bengaliFont.json";

// Default cost settings for the two meal options
const defaultMealCosts = {
  "ভাত , ডিমের ঝোল": {
    motherEgg: 6.5,
    childMalEgg: 6.5,
    childOtherEgg: 6.5,
    workerEgg: 6.5,
    motherVeg: 0.84,
    childMalVeg: 0,
    childOtherVeg: 0,
    workerVeg: 0.84,
  },
  "খিচুড়ি ও ডিম্": {
    motherEgg: 6.5,
    childMalEgg: 3.25,
    childOtherEgg: 3.25,
    workerEgg: 6.5,
    motherVeg: 1.63,
    childMalVeg: 1.09,
    childOtherVeg: 1.09,
    workerVeg: 1.63,
  },
};

// Default meal option selection for each weekday (1=Monday, 2=Tuesday, …, 6=Saturday)
// Sunday (0) is a holiday and isn’t used.
const defaultMealOptions = {
  1: "ভাত , ডিমের ঝোল", // Monday
  2: "খিচুড়ি ও ডিম্",    // Tuesday
  3: "ভাত , ডিমের ঝোল", // Wednesday
  4: "খিচুড়ি ও ডিম্",    // Thursday
  5: "ভাত , ডিমের ঝোল", // Friday
  6: "খিচুড়ি ও ডিম্",    // Saturday
};

const App = () => {
  // -------------------------------
  // Default Headcount State Variables
  // -------------------------------
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  const [motherCount, setMotherCount] = useState("");
  const [childMalCount, setChildMalCount] = useState("");
  const [childOtherCount, setChildOtherCount] = useState("");
  const [workerCount, setWorkerCount] = useState("");
  const [extraHolidayStr, setExtraHolidayStr] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Error state for default headcount inputs
  const [defaultErrors, setDefaultErrors] = useState({
    motherCount: false,
    childOtherCount: false,
    selectedMonth: false,
    selectedYear: false,
  });

  // -------------------------------
  // Exception Overrides State
  // -------------------------------
  const [exceptions, setExceptions] = useState([]);
  const [newException, setNewException] = useState({
    day: "",
    mother: "",
    childMal: "",
    childOther: "",
    worker: "",
  });
  const [newExcErrors, setNewExcErrors] = useState({
    day: false,
    mother: false,
    childMal: false,
    childOther: false,
    worker: false,
  });

  // -------------------------------
  // Month Mapping
  // -------------------------------
  const monthMapping = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  // -------------------------------
  // Meal Cost and Option Settings
  // -------------------------------
  // Global cost settings for meal options
  const [costSettings, setCostSettings] = useState(defaultMealCosts);
  // Global meal option selections per weekday (key: weekday number; value: meal option)
  const [mealOptionSettings, setMealOptionSettings] = useState(defaultMealOptions);

  // Popup visibility state
  const [showCostPopup, setShowCostPopup] = useState(false);
  // Local states for editing in the popup
  const [localCostSettings, setLocalCostSettings] = useState(costSettings);
  const [localMealOptionSettings, setLocalMealOptionSettings] = useState(mealOptionSettings);

  const [showPreview, setShowPreview] = useState(false);

  // -------------------------------
  // Helper: Parse Extra Holidays from comma-separated string
  // -------------------------------
  const getExtraHolidays = () => {
    return extraHolidayStr
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  };

  // -------------------------------
  // Calculation Function (Generic using cost settings)
  // -------------------------------
  const calcCostByMealOption = (mealOption, counts, currentCostSettings) => {
    const cost = currentCostSettings[mealOption];
    const mother = counts.mother;
    const childMal = counts.childMal;
    const childOther = counts.childOther;
    const worker = counts.worker;
    const totalTH = mother + childMal + childOther + worker;

    const motherEgg = mother * cost.motherEgg;
    const childMalEgg = childMal * cost.childMalEgg;
    const childOtherEgg = childOther * cost.childOtherEgg;
    const workerEgg = worker * cost.workerEgg;
    const eggTotal = motherEgg + childMalEgg + childOtherEgg + workerEgg;

    const motherVeg = mother * cost.motherVeg;
    const childMalVeg = childMal * cost.childMalVeg;
    const childOtherVeg = childOther * cost.childOtherVeg;
    const workerVeg = worker * cost.workerVeg;
    const vegTotal = motherVeg + childMalVeg + childOtherVeg + workerVeg;

    const misc = 0;
    const grandTotal = eggTotal + vegTotal + misc;

    return {
      motherTH: mother,
      childMalTH: childMal,
      childOtherTH: childOther,
      workerTH: worker,
      totalTH,
      motherEgg,
      childMalEgg,
      childOtherEgg,
      workerEgg,
      eggTotal,
      motherVeg,
      childMalVeg,
      childOtherVeg,
      workerVeg,
      vegTotal,
      misc,
      grandTotal,
    };
  };

  // -------------------------------
  // Exception Handling Functions
  // -------------------------------
  const validateNewException = () => {
    let errors = {
      day: false,
      mother: false,
      childMal: false,
      childOther: false,
      worker: false,
    };
    let valid = true;
    Object.keys(newException).forEach((field) => {
      if (newException[field] === "" || newException[field] === null) {
        errors[field] = true;
        valid = false;
      }
    });
    setNewExcErrors(errors);
    return valid;
  };

  const addNewException = () => {
    if (!validateNewException()) {
      return;
    }
    const dayNum = Number(newException.day);
    const existingIndex = exceptions.findIndex((exc) => Number(exc.day) === dayNum);
    if (existingIndex > -1) {
      let updatedExceptions = [...exceptions];
      updatedExceptions[existingIndex] = {
        day: dayNum,
        mother: Number(newException.mother),
        childMal: Number(newException.childMal),
        childOther: Number(newException.childOther),
        worker: Number(newException.worker),
      };
      setExceptions(updatedExceptions);
    } else {
      setExceptions([
        ...exceptions,
        {
          day: dayNum,
          mother: Number(newException.mother),
          childMal: Number(newException.childMal),
          childOther: Number(newException.childOther),
          worker: Number(newException.worker),
        },
      ]);
    }
    setNewException({
      day: "",
      mother: "",
      childMal: "",
      childOther: "",
      worker: "",
    });
    setNewExcErrors({
      day: false,
      mother: false,
      childMal: false,
      childOther: false,
      worker: false,
    });
  };

  const removeException = (day) => {
    setExceptions(exceptions.filter((exc) => Number(exc.day) !== Number(day)));
  };

  // -------------------------------
  // PDF Generation Function (Now uses updated cost settings & meal options)
  // -------------------------------
  const generatePDF = () => {
    // Validate default fields
    let errors = {};
    if (motherCount === "" || motherCount === undefined) {
      errors.motherCount = true;
    }
    if (childOtherCount === "" || childOtherCount === undefined) {
      errors.childOtherCount = true;
    }
    if (!selectedMonth) {
      errors.selectedMonth = true;
    }
    if (!selectedYear) {
      errors.selectedYear = true;
    }

    setDefaultErrors(errors);

    if (Object.keys(errors).length > 0) {
      alert("সমস্ত ঘর পূরণ করা বাধ্যতামূলক!");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    doc.addFileToVFS("PotroSans.ttf", fontData.bengaliFontBase64);
    doc.addFont("PotroSans.ttf", "PotroSans", "normal");

    const displayVal = (val) =>
      val === "" || val === null || isNaN(val) ? "" : Number(val).toFixed(1);

    let yPos = 15;
    const marginLeft = 10;
    const tableWidth = 190;

    // Title Section in PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Ration Chart", 105, yPos, { align: "center" });
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Month: ${selectedMonth} / ${selectedYear}`, 105, yPos, { align: "center" });
    yPos += 10;

    // HEADER SECTION
    const row1Height = 7;
    const row2Height = 7;
    const row3Height = 7;
    const totalHeaderHeight = row1Height + row2Height + row3Height;
    const headerY = yPos;
    const colX = [
      marginLeft,
      marginLeft + 10,
      marginLeft + 20,
      marginLeft + 30,
      marginLeft + 40,
      marginLeft + 50,
      marginLeft + 60,
      marginLeft + 70,
      marginLeft + 80,
      marginLeft + 90,
      marginLeft + 100,
      marginLeft + 110,
      marginLeft + 120,
      marginLeft + 130,
      marginLeft + 140,
      marginLeft + 150,
      marginLeft + 160,
      marginLeft + 175,
      marginLeft + 190,
    ];

    doc.setFont("helvetica", "bold");
    doc.setFont("PotroSans");
    doc.setFontSize(10);

    // Group Headers
    doc.rect(colX[0], headerY, colX[1] - colX[0], totalHeaderHeight);
    doc.text("Date", (colX[0] + colX[1]) / 2, headerY + totalHeaderHeight / 2 + 3, { align: "center" });
    doc.rect(colX[1], headerY, colX[6] - colX[1], row1Height);
    doc.text("Total Headcount", (colX[1] + colX[6]) / 2, headerY + row1Height / 2, { align: "center" });
    doc.rect(colX[6], headerY, colX[11] - colX[6], row1Height);
    doc.text("Egg Cost", (colX[6] + colX[11]) / 2, headerY + row1Height / 2, { align: "center" });
    doc.rect(colX[11], headerY, colX[16] - colX[11], row1Height);
    doc.text("Veg Cost", (colX[11] + colX[16]) / 2, headerY + row1Height / 2, { align: "center" });
    doc.rect(colX[16], headerY, colX[17] - colX[16], totalHeaderHeight);
    doc.text("Misc", (colX[16] + colX[17]) / 2, headerY + totalHeaderHeight / 2 + 3, { align: "center" });
    doc.rect(colX[17], headerY, colX[18] - colX[17], totalHeaderHeight);
    doc.text("Grand \nTotal", (colX[17] + colX[18]) / 2, headerY + totalHeaderHeight / 2 + 3, { align: "center" });

    // Subheaders for groups
    const row2Y = headerY + row1Height;
    doc.rect(colX[1], row2Y, colX[2] - colX[1], row2Height + row3Height);
    doc.text("Mother", (colX[1] + colX[2]) / 2, row2Y + (row2Height + row3Height) / 2 + 6, null, 90);
    doc.rect(colX[2], row2Y, colX[4] - colX[2], row2Height);
    doc.text("Child", (colX[2] + colX[4]) / 2, row2Y + row2Height / 2, { align: "center" });
    doc.rect(colX[4], row2Y, colX[5] - colX[4], row2Height + row3Height);
    doc.text("Worker/\nHelper", (colX[4] + colX[5]) / 2, row2Y + (row2Height + row3Height) / 2 + 6, null, 90);
    doc.rect(colX[5], row2Y, colX[6] - colX[5], row2Height + row3Height);
    doc.text("Total", (colX[5] + colX[6]) / 2, row2Y + (row2Height + row3Height) / 2 + 3, { align: "center" });
    // Egg Cost group
    doc.rect(colX[6], row2Y, colX[7] - colX[6], row2Height + row3Height);
    doc.text("Mother", (colX[6] + colX[7]) / 2, row2Y + (row2Height + row3Height) / 2 + 6, null, 90);
    doc.rect(colX[7], row2Y, colX[9] - colX[7], row2Height);
    doc.text("Child", (colX[7] + colX[9]) / 2, row2Y + row2Height / 2, { align: "center" });
    doc.rect(colX[9], row2Y, colX[10] - colX[9], row2Height + row3Height);
    doc.text("Worker/\nHelper", (colX[9] + colX[10]) / 2, row2Y + (row2Height + row3Height) / 2 + 6, null, 90);
    doc.rect(colX[10], row2Y, colX[11] - colX[10], row2Height + row3Height);
    doc.text("Total", (colX[10] + colX[11]) / 2, row2Y + (row2Height + row3Height) / 2 + 3, { align: "center" });
    // Veg Cost group
    doc.rect(colX[11], row2Y, colX[12] - colX[11], row2Height + row3Height);
    doc.text("Mother", (colX[11] + colX[12]) / 2, row2Y + (row2Height + row3Height) / 2 + 6, null, 90);
    doc.rect(colX[12], row2Y, colX[14] - colX[12], row2Height);
    doc.text("Child", (colX[12] + colX[14]) / 2, row2Y + row2Height / 2, { align: "center" });
    doc.rect(colX[14], row2Y, colX[15] - colX[14], row2Height + row3Height);
    doc.text("Worker/\nHelper", (colX[14] + colX[15]) / 2, row2Y + (row2Height + row3Height) / 2 + 6, null, 90);
    doc.rect(colX[15], row2Y, colX[16] - colX[15], row2Height + row3Height);
    doc.text("Total", (colX[15] + colX[16]) / 2, row2Y + (row2Height + row3Height) / 2 + 3, { align: "center" });
    // Row 3: Subdivision for "Child" cells
    const row3Y = headerY + row1Height + row2Height;
    doc.rect(colX[2], row3Y, colX[3] - colX[2], row3Height);
    doc.text("Mal.", (colX[2] + colX[3]) / 2, row3Y + row3Height / 2, { align: "center" });
    doc.rect(colX[3], row3Y, colX[4] - colX[3], row3Height);
    doc.text("Oth.", (colX[3] + colX[4]) / 2, row3Y + row3Height / 2, { align: "center" });
    doc.rect(colX[7], row3Y, colX[8] - colX[7], row3Height);
    doc.text("Mal.", (colX[7] + colX[8]) / 2, row3Y + row3Height / 2, { align: "center" });
    doc.rect(colX[8], row3Y, colX[9] - colX[8], row3Height);
    doc.text("Oth.", (colX[8] + colX[9]) / 2, row3Y + row3Height / 2, { align: "center" });
    doc.rect(colX[12], row3Y, colX[13] - colX[12], row3Height);
    doc.text("Mal.", (colX[12] + colX[13]) / 2, row3Y + row3Height / 2, { align: "center" });
    doc.rect(colX[13], row3Y, colX[14] - colX[13], row3Height);
    doc.text("Oth.", (colX[13] + colX[14]) / 2, row3Y + row3Height / 2, { align: "center" });

    yPos = headerY + totalHeaderHeight + 1;

    // DATA ROWS: Loop through each day of the month
    const dataRowHeight = 5;
    let sumMotherTH = 0,
      sumChildMalTH = 0,
      sumChildOtherTH = 0,
      sumWorkerTH = 0,
      sumTH = 0;
    let sumMotherEgg = 0,
      sumChildMalEgg = 0,
      sumChildOtherEgg = 0,
      sumWorkerEgg = 0,
      sumEggTotal = 0;
    let sumMotherVeg = 0,
      sumChildMalVeg = 0,
      sumChildOtherVeg = 0,
      sumWorkerVeg = 0,
      sumVegTotal = 0;
    let sumMisc = 0,
      sumGrandTotal = 0;

    const monthNumber = monthMapping[selectedMonth];
    const daysInMonth = new Date(selectedYear, monthNumber, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(selectedYear, monthNumber - 1, day);
      const weekday = dateObj.getDay();
      const isHoliday = weekday === 0 || getExtraHolidays().includes(day);

      const exceptionForDay = exceptions.find((exc) => Number(exc.day) === day);
      let counts;
      if (exceptionForDay && exceptionForDay.day) {
        counts = {
          mother: Number(exceptionForDay.mother) || 0,
          childMal: Number(exceptionForDay.childMal) || 0,
          childOther: Number(exceptionForDay.childOther) || 0,
          worker: Number(exceptionForDay.worker) || 0,
        };
      } else {
        counts = {
          mother: Number(motherCount) || 0,
          childMal: Number(childMalCount) || 0,
          childOther: Number(childOtherCount) || 0,
          worker: Number(workerCount) || 0,
        };
      }

      let rowData;
      if (isHoliday) {
        rowData = {
          dayStr: day < 10 ? `0${day}` : `${day}`,
          motherTH: "",
          childMalTH: "",
          childOtherTH: "",
          workerTH: "",
          totalTH: "",
          motherEgg: "",
          childMalEgg: "",
          childOtherEgg: "",
          workerEgg: "",
          eggTotal: "",
          motherVeg: "",
          childMalVeg: "",
          childOtherVeg: "",
          workerVeg: "",
          vegTotal: "",
          misc: "",
          grandTotal: "",
        };
      } else {
        const mealOption = localMealOptionSettings[weekday] || mealOptionSettings[weekday] || "ভাত , ডিমের ঝোল";
        const costs = calcCostByMealOption(mealOption, counts, costSettings);
        rowData = { dayStr: day < 10 ? `0${day}` : `${day}`, ...costs };

        sumMotherTH += costs.motherTH;
        sumChildMalTH += costs.childMalTH;
        sumChildOtherTH += costs.childOtherTH;
        sumWorkerTH += costs.workerTH;
        sumTH += costs.totalTH;

        sumMotherEgg += costs.motherEgg;
        sumChildMalEgg += costs.childMalEgg;
        sumChildOtherEgg += costs.childOtherEgg;
        sumWorkerEgg += costs.workerEgg;
        sumEggTotal += costs.eggTotal;

        sumMotherVeg += costs.motherVeg;
        sumChildMalVeg += costs.childMalVeg;
        sumChildOtherVeg += costs.childOtherVeg;
        sumWorkerVeg += costs.workerVeg;
        sumVegTotal += costs.vegTotal;

        sumMisc += costs.misc;
        sumGrandTotal += costs.grandTotal;
      }

      if (isHoliday) {
        doc.setFillColor(230, 230, 230);
        doc.rect(marginLeft, yPos, tableWidth, dataRowHeight, "F");
      }

      doc.rect(marginLeft, yPos, tableWidth, dataRowHeight);
      for (let i = 0; i < colX.length; i++) {
        doc.line(colX[i], yPos, colX[i], yPos + dataRowHeight);
      }
      doc.line(marginLeft + tableWidth, yPos, marginLeft + tableWidth, yPos + dataRowHeight);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(rowData.dayStr, colX[0] + 1, yPos + 3);
      doc.text(String(rowData.motherTH), colX[1] + 1, yPos + 3);
      doc.text(String(rowData.childMalTH), colX[2] + 1, yPos + 3);
      doc.text(String(rowData.childOtherTH), colX[3] + 1, yPos + 3);
      doc.text(String(rowData.workerTH), colX[4] + 1, yPos + 3);
      doc.text(rowData.totalTH !== "" ? String(Math.round(rowData.totalTH)) : "", colX[5] + 1, yPos + 3);
      doc.text(rowData.motherEgg !== "" ? displayVal(rowData.motherEgg) : "", colX[6] + 1, yPos + 3);
      doc.text(rowData.childMalEgg !== "" ? displayVal(rowData.childMalEgg) : "", colX[7] + 1, yPos + 3);
      doc.text(rowData.childOtherEgg !== "" ? displayVal(rowData.childOtherEgg) : "", colX[8] + 1, yPos + 3);
      doc.text(rowData.workerEgg !== "" ? displayVal(rowData.workerEgg) : "", colX[9] + 1, yPos + 3);
      doc.text(rowData.eggTotal !== "" ? displayVal(rowData.eggTotal) : "", colX[10] + 1, yPos + 3);
      doc.text(rowData.motherVeg !== "" ? displayVal(rowData.motherVeg) : "", colX[11] + 1, yPos + 3);
      doc.text(rowData.childMalVeg !== "" ? displayVal(rowData.childMalVeg) : "", colX[12] + 1, yPos + 3);
      doc.text(rowData.childOtherVeg !== "" ? displayVal(rowData.childOtherVeg) : "", colX[13] + 1, yPos + 3);
      doc.text(rowData.workerVeg !== "" ? displayVal(rowData.workerVeg) : "", colX[14] + 1, yPos + 3);
      doc.text(rowData.vegTotal !== "" ? displayVal(rowData.vegTotal) : "", colX[15] + 1, yPos + 3);
      doc.text(rowData.misc !== "" ? displayVal(rowData.misc) : "", colX[16] + 1, yPos + 3);
      doc.text(rowData.grandTotal !== "" ? displayVal(rowData.grandTotal) : "", colX[17] + 1, yPos + 3);

      yPos += dataRowHeight;
      if (yPos > 270 && day < daysInMonth) {
        doc.addPage();
        yPos = 15;
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.rect(marginLeft, yPos, tableWidth, dataRowHeight);
    for (let i = 0; i < colX.length; i++) {
      doc.line(colX[i], yPos, colX[i], yPos + dataRowHeight);
    }
    doc.line(marginLeft + tableWidth, yPos, marginLeft + tableWidth, yPos + dataRowHeight);

    doc.text("Total", colX[0] + 1, yPos + 3);
    doc.text(String(sumMotherTH), colX[1] + 1, yPos + 3);
    doc.text(String(sumChildMalTH), colX[2] + 1, yPos + 3);
    doc.text(String(sumChildOtherTH), colX[3] + 1, yPos + 3);
    doc.text(String(sumWorkerTH), colX[4] + 1, yPos + 3);
    doc.text(displayVal(sumTH), colX[5] + 1, yPos + 3);
    doc.text(displayVal(sumMotherEgg), colX[6] + 1, yPos + 3);
    doc.text(displayVal(sumChildMalEgg), colX[7] + 1, yPos + 3);
    doc.text(displayVal(sumChildOtherEgg), colX[8] + 1, yPos + 3);
    doc.text(displayVal(sumWorkerEgg), colX[9] + 1, yPos + 3);
    doc.text(displayVal(sumEggTotal), colX[10] + 1, yPos + 3);
    doc.text(displayVal(sumMotherVeg), colX[11] + 1, yPos + 3);
    doc.text(displayVal(sumChildMalVeg), colX[12] + 1, yPos + 3);
    doc.text(displayVal(sumChildOtherVeg), colX[13] + 1, yPos + 3);
    doc.text(displayVal(sumWorkerVeg), colX[14] + 1, yPos + 3);
    doc.text(displayVal(sumVegTotal), colX[15] + 1, yPos + 3);
    doc.text(displayVal(sumMisc), colX[16] + 1, yPos + 3);
    doc.text(displayVal(sumGrandTotal), colX[17] + 1, yPos + 3);

    doc.save("RationChart.pdf");
  };

  // -------------------------------
  // Popup Handlers for Cost and Meal Option Edit
  // -------------------------------
  const openPopup = () => {
    setLocalCostSettings(costSettings);
    setLocalMealOptionSettings(mealOptionSettings);
    setShowPreview(false)
    setShowCostPopup(true);
  };

  const closePopup = () => {
    setShowCostPopup(false);
    setShowPreview(false);
  };

  const savePopupChanges = () => {
    setCostSettings(localCostSettings);
    setMealOptionSettings(localMealOptionSettings);
    setShowCostPopup(false);
    setShowPreview(false)
  };

  const openPreview = () => {
    setShowPreview(true)
    setShowCostPopup(false);
  }

  // Handler for updating cost values in the local cost settings table
  const handleCostChange = (mealOption, field, value) => {
    setLocalCostSettings((prev) => ({
      ...prev,
      [mealOption]: {
        ...prev[mealOption],
        [field]: value,
      },
    }));
  };

  // Handler for meal option checkbox change per day
  const handleMealOptionChange = (weekday, selectedOption) => {
    setLocalMealOptionSettings((prev) => ({
      ...prev,
      [weekday]: selectedOption,
    }));
  };

  // -------------------------------
  // FRONTEND: UI Rendering Section
  // -------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-white p-6">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md transform transition duration-300 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Generate Ration Chart PDF
        </h2>

        {(!showCostPopup && !showPreview) && (
          /* Edit icon to open the cost & meal settings popup */
          <div className="flex justify-end mb-4" style={{ display: "flex", justifyContent: "flex-end", margin: "5px 0px" }} >            
            <button onClick={openPopup} title="Edit Meal Settings" className="p-2 border rounded-full" style={{width:150}}>
            Edit Cost✏️
            </button>
          </div>
        )}

        {(!showCostPopup && !showPreview) && (

          <div className="space-y-6 modal-enter ">
            {/* Default Headcount Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                গর্ভবতী/প্রসূতি মা এর সংখ্যা :
              </label>
              <input
                type="number"
                value={motherCount}
                onChange={(e) => setMotherCount(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${defaultErrors.motherCount ? "border-red-500" : "border-gray-300"
                  }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                অপুষ্ট শিশু এর সংখ্যা :
              </label>
              <input
                type="number"
                value={childMalCount}
                onChange={(e) => setChildMalCount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                অন্যান্য শিশু এর সংখ্যা:
              </label>
              <input
                type="number"
                value={childOtherCount}
                onChange={(e) => setChildOtherCount(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${defaultErrors.childOtherCount ? "border-red-500" : "border-gray-300"
                  }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                কর্মী/ সহায়িকা এর সংখ্যা:
              </label>
              <input
                type="number"
                value={workerCount}
                onChange={(e) => setWorkerCount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ছুটির দিন (একাধিক হলে কমা দিয়ে লিখুন যেমন 5,14):
              </label>
              <input
                type="text"
                placeholder="e.g., 5,15"
                value={extraHolidayStr}
                onChange={(e) => setExtraHolidayStr(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                মাস:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {Object.keys(monthMapping).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                বছর:
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${defaultErrors.selectedYear ? "border-red-500" : "border-gray-300"
                  }`}
              />
            </div>

            {/* Single Exception Input Form */}
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">
                বিশেষ দিনের সংখ্যা (ডিফল্ট থেকে ভিন্ন)
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={newException.day}
                  onChange={(e) =>
                    setNewException({ ...newException, day: e.target.value })
                  }
                  className={`p-2 border rounded-lg ${newExcErrors.day ? "border-red-500" : "border-gray-300"
                    }`}
                >
                  <option value="">দিন নির্বাচন করুন</option>
                  {Array.from(
                    { length: new Date(selectedYear, monthMapping[selectedMonth], 0).getDate() },
                    (_, i) => i + 1
                  ).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="মা"
                  value={newException.mother}
                  onChange={(e) =>
                    setNewException({ ...newException, mother: e.target.value })
                  }
                  className={`p-2 border rounded-lg ${newExcErrors.mother ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <input
                  type="number"
                  placeholder="অপুষ্ট শিশু"
                  value={newException.childMal}
                  onChange={(e) =>
                    setNewException({ ...newException, childMal: e.target.value })
                  }
                  className={`p-2 border rounded-lg ${newExcErrors.childMal ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <input
                  type="number"
                  placeholder="অন্যান্য শিশু"
                  value={newException.childOther}
                  onChange={(e) =>
                    setNewException({ ...newException, childOther: e.target.value })
                  }
                  className={`p-2 border rounded-lg ${newExcErrors.childOther ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <input
                  type="number"
                  placeholder="কর্মী"
                  value={newException.worker}
                  onChange={(e) =>
                    setNewException({ ...newException, worker: e.target.value })
                  }
                  className={`p-2 border rounded-lg ${newExcErrors.worker ? "border-red-500" : "border-gray-300"
                    }`}
                />
              </div>
              <button
                onClick={addNewException}
                className="bg-green-500 text-white p-2 rounded-lg mt-2"
              >
                বিশেষ দিন যুক্ত করুন
              </button>
            </div>

            {/* Exceptions Preview List */}
            {exceptions.length > 0 && (
              <div className="border p-4 rounded-lg">
                <h4 className="font-bold mb-2">বর্তমান বিশেষ দিনসমূহ:</h4>
                <ul className="list-disc ml-5">
                  {exceptions.map((exc, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>
                        দিন {exc.day}: মা: {exc.mother}, অপুষ্ট শিশু: {exc.childMal}, অন্যান্য শিশু: {exc.childOther}, কর্মী: {exc.worker}
                      </span>
                      <button
                        onClick={() => removeException(exc.day)}
                        title="মুছে ফেলুন"
                        className="remove-icon"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                          viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={generatePDF}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              PDF জেনারেট করুন
            </button>
          </div>

        )}

      </div>


      {/* Popup for editing Meal Cost and Option Settings */}
      {showCostPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-enter bg-white rounded-lg p-6 w-11/12 max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-center">Meal Cost & Option Settings</h3>
            {/* Cost Edit Table */}
            <div className="overflow-auto mb-4">
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border p-2">Cost Item</th>
                    <th className="border p-2">ভাত , ডিমের ঝোল</th>
                    <th className="border p-2">খিচুড়ি ও ডিম্</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Mother Egg", key: "motherEgg" },
                    { label: "Child Mal Egg", key: "childMalEgg" },
                    { label: "Child Other Egg", key: "childOtherEgg" },
                    { label: "Worker Egg", key: "workerEgg" },
                    { label: "Mother Veg", key: "motherVeg" },
                    { label: "Child Mal Veg", key: "childMalVeg" },
                    { label: "Child Other Veg", key: "childOtherVeg" },
                    { label: "Worker Veg", key: "workerVeg" },
                  ].map((item) => (
                    <tr key={item.key}>
                      <td className="border p-2">{item.label}</td>
                      <td className="border p-2">
                        <input
                          type="number"
                          value={localCostSettings["ভাত , ডিমের ঝোল"][item.key]}
                          onChange={(e) => handleCostChange("ভাত , ডিমের ঝোল", item.key, Number(e.target.value))}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          value={localCostSettings["খিচুড়ি ও ডিম্"][item.key]}
                          onChange={(e) => handleCostChange("খিচুড়ি ও ডিম্", item.key, Number(e.target.value))}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Meal Option Selection for each day */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Select Meal Option for Each Day</h4>


              <div className="flex items-center mb-2" style={{ display: "flex", justifyContent: "space-around" }} >
                <span className="w-24" style={{ width: 5 }}></span>
                <label className="flex items-center space-x-1" style={{ width: 140 }}>
                  <span className="text-sm">ভাত , ডিমের ঝোল</span>
                </label>
                <label className="flex items-center space-x-1" style={{ width: 140 }}>
                  <span className="text-sm">খিচুড়ি ও ডিম্</span>
                </label>

              </div>

              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
                const weekdayNum = index + 1;
                return (
                  <div key={day} className="flex items-center mb-2" style={{ display: "flex" }}>
                    <span className="w-24" style={{ width: 165 }}>{day}:</span>
                    <label className="flex items-center space-x-1" style={{ width: 165 }}>
                      <input
                        type="checkbox"
                        checked={localMealOptionSettings[weekdayNum] === "ভাত , ডিমের ঝোল"}
                        onChange={() => handleMealOptionChange(weekdayNum, "ভাত , ডিমের ঝোল")}
                      />
                    </label>
                    <label className="flex items-center space-x-1" style={{ width: 165 }}>
                      <input
                        type="checkbox"
                        checked={localMealOptionSettings[weekdayNum] === "খিচুড়ি ও ডিম্"}
                        onChange={() => handleMealOptionChange(weekdayNum, "খিচুড়ি ও ডিম্")}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end space-x-3" style={{ display: "flex", justifyContent: "space-around", margin: "11px 0px" }}>
              <button onClick={closePopup} className="px-4 py-2 border rounded w-24 " style={{ width: 140 }}>
                Cancel
              </button>
              <button onClick={openPreview} className="px-4 py-2 bg-blue-600 text-white rounded w-24  " style={{ width: 140 }}>
                Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="modal-enter bg-white rounded-lg p-6 w-11/12 max-w-lg">
              {/* Preview of current changes */}
              <div className="mb-4 p-2 border rounded">
                <h4 className="font-bold mb-1">Preview:</h4>
                <div className="text-sm">
                  <p>Meal Costs:</p>
                  <ul className="list-disc ml-5">
                    {Object.keys(localCostSettings).map((option) => (
                      <li key={option}>
                        {option}: Mother Egg: {localCostSettings[option].motherEgg}, Child Mal Egg: {localCostSettings[option].childMalEgg}, Child Other Egg: {localCostSettings[option].childOtherEgg}, Worker Egg: {localCostSettings[option].workerEgg}, Mother Veg: {localCostSettings[option].motherVeg}, Child Mal Veg: {localCostSettings[option].childMalVeg}, Child Other Veg: {localCostSettings[option].childOtherVeg}, Worker Veg: {localCostSettings[option].workerVeg}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2">Meal Option by Day:</p>
                  <ul className="list-disc ml-5">
                    {Object.keys(localMealOptionSettings).map((weekday) => (
                      <li key={weekday}>
                        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekday]}: {localMealOptionSettings[weekday]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex justify-end space-x-3" style={{ display: "flex", justifyContent: "space-around", margin: "11px 0px" }}>
                <button onClick={openPopup} className="px-4 py-2 border rounded w-24 " style={{ width: 140 }}>
                  Edit
                </button>
                <button onClick={savePopupChanges} className="px-4 py-2 bg-blue-600 text-white rounded w-24  " style={{ width: 150 }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}





    </div >
  );
};

export default App;
