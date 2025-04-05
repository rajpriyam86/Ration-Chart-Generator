import { useState } from "react";
import jsPDF from "jspdf";
import "./App.css"
import fontData from './bengaliFont.json';

const App = () => {
  // -------------------------------
  // User Input State Variables
  // -------------------------------
  const [motherCount, setMotherCount] = useState(0);
  const [childMalCount, setChildMalCount] = useState(0);
  const [childOtherCount, setChildOtherCount] = useState(0);
  const [workerCount, setWorkerCount] = useState(0);
  const [extraHolidayStr, setExtraHolidayStr] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedYear, setSelectedYear] = useState(2025);

  // Mapping for month names to month numbers
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
  // Helper: Parse Extra Holidays
  // -------------------------------
  const getExtraHolidays = () => {
    return extraHolidayStr
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  };

  // -------------------------------
  // Allocation Formulas
  // -------------------------------
  const calcTypeA = () => {
    const motherTH = motherCount;
    const childMalTH = childMalCount;
    const childOtherTH = childOtherCount;
    const workerTH = workerCount;
    const totalTH = motherTH + childMalTH + childOtherTH + workerTH;

    const motherEgg = motherCount * 6.5;
    const childMalEgg = childMalCount * 6.5;
    const childOtherEgg = childOtherCount * 6.5;
    const workerEgg = workerCount * 6.5;
    const eggTotal = motherEgg + childMalEgg + childOtherEgg + workerEgg;

    const motherVeg = motherCount * 0.84;
    const childMalVeg = childMalCount * 0;
    const childOtherVeg = childOtherCount * 0;
    const workerVeg = workerCount * 0.84;
    const vegTotal = motherVeg + childMalVeg + childOtherVeg + workerVeg;

    const misc = 0;
    const grandTotal = eggTotal + vegTotal + misc;

    return {
      motherTH,
      childMalTH,
      childOtherTH,
      workerTH,
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

  const calcTypeB = () => {
    const motherTH = motherCount;
    const childMalTH = childMalCount;
    const childOtherTH = childOtherCount;
    const workerTH = workerCount;
    const totalTH = motherTH + childMalTH + childOtherTH + workerTH;

    const motherEgg = motherCount * 6.5;
    const childMalEgg = childMalCount * 3.25;
    const childOtherEgg = childOtherCount * 3.25;
    const workerEgg = workerCount * 6.5;
    const eggTotal = motherEgg + childMalEgg + childOtherEgg + workerEgg;

    const motherVeg = motherCount * 1.63;
    const childMalVeg = childMalCount * 1.09;
    const childOtherVeg = childOtherCount * 1.09;
    const workerVeg = workerCount * 1.63;
    const vegTotal = motherVeg + childMalVeg + childOtherVeg + workerVeg;

    const misc = 0;
    const grandTotal = eggTotal + vegTotal + misc;

    return {
      motherTH,
      childMalTH,
      childOtherTH,
      workerTH,
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
  // PDF Generation Function
  // -------------------------------
  const generatePDF = () => {
    // Create a new jsPDF document (A4 portrait)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    doc.addFileToVFS('PotroSans.ttf', fontData.bengaliFontBase64);
    doc.addFont('PotroSans.ttf', 'PotroSans', 'normal');


    // Helper: Round value to 1 decimal place
    const displayVal = (val) =>
      val === "" || val === null || isNaN(val) ? "" : Number(val).toFixed(1);

    let yPos = 15;
    const marginLeft = 10;
    const tableWidth = 190; // Total width of the table

    // -------------------------------
    // FRONTEND: Title Section
    // -------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Ration Chart", 105, yPos, { align: "center" });
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Month: ${selectedMonth} / ${selectedYear}`, 105, yPos, {
      align: "center",
    });
    yPos += 10;

    // -------------------------------
    // HEADER SECTION: Merged Header
    // -------------------------------
    // We will use 3 header rows:
    // Row 1: Group Headers (Date, Total Headcount, Egg Cost, Veg Cost, Misc, Grand Total)
    // Row 2: Subheaders for each group; "Child" column will be merged horizontally (to be subdivided in row 3)
    // Row 3: Subdivision for "Child": "Mal." and "Oth."
    const row1Height = 7;
    const row2Height = 7;
    const row3Height = 7;
    const totalHeaderHeight = row1Height + row2Height + row3Height;
    const headerY = yPos;

    // Define column boundaries.
    // We'll assume each cell is 10 mm wide.
    const colX = [
      marginLeft, // 0: Date
      marginLeft + 10, // 1
      marginLeft + 20, // 2
      marginLeft + 30, // 3
      marginLeft + 40, // 4
      marginLeft + 50, // 5
      marginLeft + 60, // 6
      marginLeft + 70, // 7
      marginLeft + 80, // 8
      marginLeft + 90, // 9
      marginLeft + 100, // 10
      marginLeft + 110, // 11
      marginLeft + 120, // 12
      marginLeft + 130, // 13
      marginLeft + 140, // 14
      marginLeft + 150, // 15
      marginLeft + 160, // 16: Misc
      marginLeft + 175, // 17: Grand Total
      marginLeft + 190, // 18: End
    ];
    // Explanation:
    // colX[0] to colX[1]: Date (1 cell)
    // colX[1] to colX[6]: Total Headcount group (5 cells)
    // colX[6] to colX[11]: Egg Cost group (5 cells)
    // colX[11] to colX[16]: Veg Cost group (5 cells)
    // colX[16] to colX[17]: Misc (1 cell)
    // colX[17] to colX[18]: Grand Total (1 cell)

    doc.setFont("helvetica", "bold");
    doc.setFont("PotroSans");
    doc.setFontSize(10);

    // Row 1: Top Group Headers
    // "Date" (merged vertically over rows 1-3)
    doc.rect(colX[0], headerY, colX[1] - colX[0], totalHeaderHeight);
    doc.text(
      "Date",
      (colX[0] + colX[1]) / 2,
      headerY + totalHeaderHeight / 2 + 3,
      { align: "center" }
    );

    // "Total Headcount" merged horizontally (cells 1 to 6)
    doc.rect(colX[1], headerY, colX[6] - colX[1], row1Height);
    doc.text(
      "Total Headcount",
      (colX[1] + colX[6]) / 2,
      headerY + row1Height / 2,
      { align: "center" }
    );

    // "Egg Cost" merged horizontally (cells 6 to 11)
    doc.rect(colX[6], headerY, colX[11] - colX[6], row1Height);
    doc.text(
      "Egg Cost",
      (colX[6] + colX[11]) / 2,
      headerY + row1Height / 2,
      { align: "center" }
    );

    // "Veg Cost" merged horizontally (cells 11 to 16)
    doc.rect(colX[11], headerY, colX[16] - colX[11], row1Height);
    doc.text(
      "Veg Cost",
      (colX[11] + colX[16]) / 2,
      headerY + row1Height / 2,
      { align: "center" }
    );

    // "Misc" merged vertically (rows 1-3)
    doc.rect(colX[16], headerY, colX[17] - colX[16], totalHeaderHeight);
    doc.text(
      "Misc",
      (colX[16] + colX[17]) / 2,
      headerY + totalHeaderHeight / 2 + 3,
      { align: "center" }
    );


    // "Grand Total" merged vertically (rows 1-3)
    doc.rect(colX[17], headerY, colX[18] - colX[17], totalHeaderHeight);
    doc.text(
      "Grand \nTotal",
      (colX[17] + colX[18]) / 2,
      headerY + totalHeaderHeight / 2 + 3,
      { align: "center" }
    );

    // Row 2: Subheaders for Groups
    const row2Y = headerY + row1Height;
    // For Total Headcount group:
    // "Mother" (merged vertically over rows 2-3)
    doc.rect(colX[1], row2Y, colX[2] - colX[1], row2Height + row3Height);
    doc.text(
      "Mother",
      (colX[1] + colX[2]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 6,
      null, 90
    );
    // "Child" (merged horizontally over cells 2 to 4, to be subdivided in row 3)
    doc.rect(colX[2], row2Y, colX[4] - colX[2], row2Height);
    doc.text("Child", (colX[2] + colX[4]) / 2, row2Y + row2Height / 2, {
      align: "center",
    });
    // "Worker" (merged vertically over rows 2-3)
    doc.rect(colX[4], row2Y, colX[5] - colX[4], row2Height + row3Height);
    doc.text(
      "Worker/\nHelper",
      (colX[4] + colX[5]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 6,
      null,90
    );
    // "Total" (merged vertically over rows 2-3)
    doc.rect(colX[5], row2Y, colX[6] - colX[5], row2Height + row3Height);
    doc.text(
      "Total",
      (colX[5] + colX[6]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 3,
      { align: "center" }
    );

    // For Egg Cost group:
    doc.rect(colX[6], row2Y, colX[7] - colX[6], row2Height + row3Height);
    doc.text(
      "Mother",
      (colX[6] + colX[7]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 6,
      null,90
    );
    doc.rect(colX[7], row2Y, colX[9] - colX[7], row2Height);
    doc.text("Child", (colX[7] + colX[9]) / 2, row2Y + row2Height / 2, {
      align: "center",
    });
    doc.rect(colX[9], row2Y, colX[10] - colX[9], row2Height + row3Height);
    doc.text(
      "Worker/\nHelper",
      (colX[9] + colX[10]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 6,
      null,90
    );
    doc.rect(colX[10], row2Y, colX[11] - colX[10], row2Height + row3Height);
    doc.text(
      "Total",
      (colX[10] + colX[11]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 3,
      { align: "center" }
    );

    // For Veg Cost group:
    doc.rect(colX[11], row2Y, colX[12] - colX[11], row2Height + row3Height);
    doc.text(
      "Mother",
      (colX[11] + colX[12]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 6,
      null,90
    );
    doc.rect(colX[12], row2Y, colX[14] - colX[12], row2Height);
    doc.text("Child", (colX[12] + colX[14]) / 2, row2Y + row2Height / 2, {
      align: "center",
    });
    doc.rect(colX[14], row2Y, colX[15] - colX[14], row2Height + row3Height);
    doc.text(
      "Worker/\nHelper",
      (colX[14] + colX[15]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 6,
      null,90
    );
    doc.rect(colX[15], row2Y, colX[16] - colX[15], row2Height + row3Height);
    doc.text(
      "Total",
      (colX[15] + colX[16]) / 2,
      row2Y + (row2Height + row3Height) / 2 + 3,
      { align: "center" }
    );

    // Row 3: Subdivision for "Child" cells only
    const row3Y = headerY + row1Height + row2Height;
    // For Total Headcount group, subdivide "Child":
    doc.rect(colX[2], row3Y, colX[3] - colX[2], row3Height);
    doc.text("Mal.", (colX[2] + colX[3]) / 2, row3Y + row3Height / 2, {
      align: "center",
    });
    doc.rect(colX[3], row3Y, colX[4] - colX[3], row3Height);
    doc.text("Oth.", (colX[3] + colX[4]) / 2, row3Y + row3Height / 2, {
      align: "center",
    });

    // For Egg Cost group, subdivide "Child":
    doc.rect(colX[7], row3Y, colX[8] - colX[7], row3Height);
    doc.text("Mal.", (colX[7] + colX[8]) / 2, row3Y + row3Height / 2, {
      align: "center",
    });
    doc.rect(colX[8], row3Y, colX[9] - colX[8], row3Height);
    doc.text("Oth.", (colX[8] + colX[9]) / 2, row3Y + row3Height / 2, {
      align: "center",
    });

    // For Veg Cost group, subdivide "Child":
    doc.rect(colX[12], row3Y, colX[13] - colX[12], row3Height);
    doc.text("Mal.", (colX[12] + colX[13]) / 2, row3Y + row3Height / 2, {
      align: "center",
    });
    doc.rect(colX[13], row3Y, colX[14] - colX[13], row3Height);
    doc.text("Oth.", (colX[13] + colX[14]) / 2, row3Y + row3Height / 2, {
      align: "center",
    });

    // Update yPos to start data rows below the header
    yPos = headerY + totalHeaderHeight + 1;

    // -------------------------------
    // DATA ROWS SECTION
    // -------------------------------
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
      const weekday = dateObj.getDay(); // 0=Sunday,...,6=Saturday

      // Determine if it's a holiday
      const isHoliday = weekday === 0 || getExtraHolidays().includes(day);
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
        const costs = weekday % 2 === 1 ? calcTypeA() : calcTypeB();
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

      // If holiday, fill the row with a light grey background
      if (isHoliday) {
        doc.setFillColor(230, 230, 230);
        doc.rect(marginLeft, yPos, tableWidth, dataRowHeight, "F");
      }

      // Draw grid for the row
      doc.rect(marginLeft, yPos, tableWidth, dataRowHeight);
      for (let i = 0; i < colX.length; i++) {
        doc.line(colX[i], yPos, colX[i], yPos + dataRowHeight);
      }
      doc.line(
        marginLeft + tableWidth,
        yPos,
        marginLeft + tableWidth,
        yPos + dataRowHeight
      );

      // Write data in the row (using font size 8)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(rowData.dayStr, colX[0] + 1, yPos + 3);
      doc.text(String(rowData.motherTH), colX[1] + 1, yPos + 3);
      doc.text(String(rowData.childMalTH), colX[2] + 1, yPos + 3);
      doc.text(String(rowData.childOtherTH), colX[3] + 1, yPos + 3);
      doc.text(String(rowData.workerTH), colX[4] + 1, yPos + 3);
      doc.text(
        rowData.totalTH !== "" ? displayVal(rowData.totalTH) : "",
        colX[5] + 1,
        yPos + 3
      );

      doc.text(
        rowData.motherEgg !== "" ? displayVal(rowData.motherEgg) : "",
        colX[6] + 1,
        yPos + 3
      );
      doc.text(
        rowData.childMalEgg !== "" ? displayVal(rowData.childMalEgg) : "",
        colX[7] + 1,
        yPos + 3
      );
      doc.text(
        rowData.childOtherEgg !== "" ? displayVal(rowData.childOtherEgg) : "",
        colX[8] + 1,
        yPos + 3
      );
      doc.text(
        rowData.workerEgg !== "" ? displayVal(rowData.workerEgg) : "",
        colX[9] + 1,
        yPos + 3
      );
      doc.text(
        rowData.eggTotal !== "" ? displayVal(rowData.eggTotal) : "",
        colX[10] + 1,
        yPos + 3
      );

      doc.text(
        rowData.motherVeg !== "" ? displayVal(rowData.motherVeg) : "",
        colX[11] + 1,
        yPos + 3
      );
      doc.text(
        rowData.childMalVeg !== "" ? displayVal(rowData.childMalVeg) : "",
        colX[12] + 1,
        yPos + 3
      );
      doc.text(
        rowData.childOtherVeg !== "" ? displayVal(rowData.childOtherVeg) : "",
        colX[13] + 1,
        yPos + 3
      );
      doc.text(
        rowData.workerVeg !== "" ? displayVal(rowData.workerVeg) : "",
        colX[14] + 1,
        yPos + 3
      );
      doc.text(
        rowData.vegTotal !== "" ? displayVal(rowData.vegTotal) : "",
        colX[15] + 1,
        yPos + 3
      );

      doc.text(
        rowData.misc !== "" ? displayVal(rowData.misc) : "",
        colX[16] + 1,
        yPos + 3
      );
      doc.text(
        rowData.grandTotal !== "" ? displayVal(rowData.grandTotal) : "",
        colX[17] + 1,
        yPos + 3
      );

      yPos += dataRowHeight;
      if (yPos > 270 && day < daysInMonth) {
        doc.addPage();
        yPos = 15;
      }
    }

    // -------------------------------
    // SUMMARY ROW SECTION
    // -------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.rect(marginLeft, yPos, tableWidth, dataRowHeight);
    for (let i = 0; i < colX.length; i++) {
      doc.line(colX[i], yPos, colX[i], yPos + dataRowHeight);
    }
    doc.line(
      marginLeft + tableWidth,
      yPos,
      marginLeft + tableWidth,
      yPos + dataRowHeight
    );

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

    // Save the PDF
    doc.save("RationChart.pdf");
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
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              গর্ভবতী/প্রসূতি মা এর সংখ্যা :
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={motherCount}
              onChange={(e) => setMotherCount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              অপুষ্ট শিশু এর সংখ্যা :
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={childMalCount}
              onChange={(e) => setChildMalCount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              অন্যান্য শিশু এর সংখ্যা:
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={childOtherCount}
              onChange={(e) => setChildOtherCount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              কর্মী/ সহায়িকা এর সংখ্যা:
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={workerCount}
              onChange={(e) => setWorkerCount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ছুটির দিন ( এক এর বেশি দিন হলে কমা দিয়ে লিখুন যেমন 5,14):
            </label>
            <input
              type="text"
              placeholder="e.g., 5,15"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={extraHolidayStr}
              onChange={(e) => setExtraHolidayStr(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              মাস:
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            />
          </div>
          <button
            onClick={generatePDF}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            PDF জেনারেট করুন
          </button>
        </div>
      </div>
    </div>
  );

};

export default App;
