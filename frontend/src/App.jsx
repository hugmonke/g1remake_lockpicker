import { useState } from "react";
import axios from "axios";

function App() {
  const [lockState, setLockState] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [lockConfig, setLockConfig] = useState(
    {
    0: [1, 0, 0, 0, 0, 0, 0], 
    1: [0, 1, 0, 0, 0, 0, 0], 
    2: [0, 0, 1, 0, 0, 0, 0], 
    3: [0, 0, 0, 1, 0, 0, 0], 
    4: [0, 0, 0, 0, 1, 0, 0], 
    5: [0, 0, 0, 0, 0, 1, 0], 
    6: [0, 0, 0, 0, 0, 0, 1]
    }
  );
  const [result, setResult] = useState(null);

  function sliderChange(index, value)
  {
    const newLockState = [...lockState];
    newLockState[index] = Number(value);
    setLockState(newLockState);
  };

  function configChange(rowIndex, colIndex, value) 
  {
    setLockConfig(function(prev) {
      const updatedConfig = { ...prev };
      const updatedRow = prev[rowIndex].map(function(val, cIdx)
      {
        if (cIdx === colIndex)
          {
          return Number(value);
        } else 
          {
          return val;
        }
      });
      updatedConfig[rowIndex] = updatedRow;

      return updatedConfig;
    });
  };

  async function sendLock()
  {
    try 
    {
      const response = await axios.post("http://localhost:8000/lock_input",
      {
        lock_state: 
        {
        start_lock_state: lockState,
        },
        lock_config: 
        {
          start_lock_config: lockConfig,
        },
      });
      setResult(response.data);
    } 
    catch(error) 
    {
      console.error("Error sending data to API:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "serif" }}>
      <h2>Gothic 1 Remake Lock Solver</h2>
      <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
        <div style={{ minWidth: "10px" }}>
          <h3>Lock State (1 - 7)</h3>
          {lockState.map((slideVal, slideIdx) => (
            <div key={slideIdx} style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <label style={{ width: "80px" }}>Pin {slideIdx}:</label>
              <input
                type="range"
                min="0"
                max="6"
                value={slideVal}
                onChange={(slideInput) => sliderChange(slideIdx, slideInput.target.value)}
              />
              <span style={{ fontWeight: "bold", width: "20px" }}>{slideVal+1}</span>
            </div>
          ))}
        </div>

        <div>
          <h3>Lock Dependencies</h3>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th></th>
                {Array.from({ length: 7 }).map((_, col) => (
                  <th key={col} style={{ padding: "4px 8px" }}>Col {col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(lockConfig).map((rowKey) => {
                const rowIdx = Number(rowKey);
                return (
                  <tr key={rowKey}>
                    <td style={{ fontWeight: "bold", paddingRight: "8px" }}>Row {rowKey}:</td>
                    {lockConfig[rowKey].map((configValue, colIdx) => {
                      const isDiagonal = rowIdx === colIdx;
                      return (
                        <td key={colIdx} style={{ padding: "4px" }}>
                          <select
                            value={configValue}
                            disabled={isDiagonal}
                            onChange={(configInput) => configChange(rowKey, colIdx, configInput.target.value)}
                            style={{
                              padding: "4px",
                              backgroundColor: isDiagonal ? "#e0e0e0" : "white",
                              fontWeight: isDiagonal ? "bold" : "normal",
                              cursor: isDiagonal ? "not-allowed" : "pointer"
                            }}
                          >
                            <option value={-1}>-1</option>
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button 
          onClick={sendLock} 
          style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", cursor: "pointer" }}
        >
          SEND
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "2rem", background: "#f4f4f4", padding: "1rem", borderRadius: "8px" }}>
          <h3>RESULT:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;