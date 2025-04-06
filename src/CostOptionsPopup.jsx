import { useState } from "react";

const CostOptionsPopup = ({
  costSettings,
  mealOptionSettings,
  setCostSettings,
  setMealOptionSettings,
  closePopup,
}) => {
  const [localCostSettings, setLocalCostSettings] = useState(costSettings);
  const [localMealOptionSettings, setLocalMealOptionSettings] = useState(mealOptionSettings);

  const handleCostChange = (mealOption, field, value) => {
    setLocalCostSettings((prev) => ({
      ...prev,
      [mealOption]: {
        ...prev[mealOption],
        [field]: value,
      },
    }));
  };

  const handleMealOptionChange = (weekday, selectedOption) => {
    setLocalMealOptionSettings((prev) => ({
      ...prev,
      [weekday]: selectedOption,
    }));
  };

  const savePopupChanges = () => {
    if (window.confirm("Are you sure you want to apply these changes?")) {
      setCostSettings(localCostSettings);
      setMealOptionSettings(localMealOptionSettings);
      closePopup();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg">
        <h3 className="text-xl font-bold mb-4 text-center">Meal Cost & Option Settings</h3>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-4">
          Warning: Changing these settings will affect the PDF calculation.
        </div>
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
                      onChange={(e) =>
                        handleCostChange("ভাত , ডিমের ঝোল", item.key, Number(e.target.value))
                      }
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={localCostSettings["খিচুড়ি ও ডিম্"][item.key]}
                      onChange={(e) =>
                        handleCostChange("খিচুড়ি ও ডিম্", item.key, Number(e.target.value))
                      }
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
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
            const weekdayNum = index + 1;
            return (
              <div key={day} className="flex items-center mb-2">
                <span className="w-24">{day}:</span>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={localMealOptionSettings[weekdayNum] === "ভাত , ডিমের ঝোল"}
                      onChange={() => handleMealOptionChange(weekdayNum, "ভাত , ডিমের ঝোল")}
                    />
                    <span className="text-sm">ভাত , ডিমের ঝোল</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={localMealOptionSettings[weekdayNum] === "খিচুড়ি ও ডিম্"}
                      onChange={() => handleMealOptionChange(weekdayNum, "খিচুড়ি ও ডিম্")}
                    />
                    <span className="text-sm">খিচুড়ি ও ডিম্</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        {/* Preview */}
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
        <div className="flex justify-end space-x-3">
          <button onClick={closePopup} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button onClick={savePopupChanges} className="px-4 py-2 bg-blue-600 text-white rounded">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostOptionsPopup;
