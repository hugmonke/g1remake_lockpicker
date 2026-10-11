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
  const [isSolving, setIsSolving] = useState(false);
  const states = result?.solution?.[0] || [];
  const moves = result?.solution?.[1] || [];
  const midStep = Math.ceil(moves.length / 2);
  const leftMoves = moves.slice(0, midStep);
  const rightMoves = moves.slice(midStep);

  function sliderChange(index, value) {
    const newLockState = [...lockState];
    newLockState[index] = Number(value);
    setLockState(newLockState);
  }

  function configChange(rowIndex, colIndex, value) {
    setLockConfig(function(prev) {
      const updatedConfig = { ...prev };
      const updatedRow = prev[rowIndex].map(function(val, cIdx) {
        if (cIdx === colIndex) {
          return Number(value);
        } else {
          return val;
        }
      });
      updatedConfig[rowIndex] = updatedRow;

      return updatedConfig;
    });
  }

  async function sendLock() {
    setIsSolving(true);
    try {
      const response = await axios.post("http://localhost:8000/lock_input", {
        lock_state: { start_lock_state: lockState },
        lock_config: { start_lock_config: lockConfig },
      });
      setResult(response.data);
    } catch(error) {
      console.error("Error sending data to API:", error);
    } finally {
      setIsSolving(false)
    }
  }

  function drawResColumn(move, idx) {
    return (
      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.5rem", background: "#a19f9d", borderRadius: "4px", border: "1px solid #ddd" }}>
        <span style={{ fontWeight: "bold", minWidth: "30px", color: "#130901" }}>{idx + 1}.</span>
        <span style={{ minWidth: "45px", color: "#000000", fontWeight: "500" }}>{move.direction === "L" ? `${move.slider_idx + 1}L` : `${move.slider_idx + 1}R`}</span>
        <div style={{ display: "grid", gap: "0.3rem", flexWrap: "wrap" }}>
          {states[idx + 1]?.map((pin  , i) => (<div key={i} title={`Pin ${i}`}>{drawLock(pin, i === move.slider_idx)}</div>))}
        </div>
      </div>
    );
  }

  function drawLock(pinValue, isHighlighted) {
    // Draws locks in both init state preview and result steps
    return (
      <div 
        // Slider
        style={{ 
          display: "flex", 
          gap: "2px", // Holes gaps
          background: isHighlighted ? "#7e3a3a" : "#927777", 
          padding: "3px", 
          borderRadius: "5px", //Corner rounding
          border: "4px solid #7e3a3a"
        }}
      >
        {
          Array.from({ length: 7 }).map(
            (_, holeIdx) => {
              const hasBolt = holeIdx === Number(pinValue);
              return (
                <div
                  key={holeIdx}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "40px",
                    background: hasBolt ? "#461400" : "#8b8a8a",
                    display: "flex",
                    border: "1px solid #461400"
                  }}
                >
                </div>
              );
            }
          )
        }
      </div>
    );
  }

  return (
    <div style={{ padding: "6rem", fontFamily: "serif", backgroundColor: "#310d0d", color: "#ffffff" }}>
      <h1>Gothic 1 Remake Lock Solver</h1>

      {/* Page layout */}
      <div style={{ display: "flex", gap: "12rem", flexWrap: "wrap" }}>
        
        {/* Left: Initial state and dependencies */}
        <div style={{ flex: "0 1 0px" }}>
          <div>
            <h3>Lock State (1 - 7)</h3>
            {lockState.map((slideVal, sliderIdx) => (
              <div key={sliderIdx} style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <label style={{ width: "50px" }}>Pin {sliderIdx+1}:</label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={slideVal}
                  onChange={(slideInput) => sliderChange(sliderIdx, slideInput.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: "bold", width: "20px" }}>{slideVal+1}</span>
              </div>
            ))}

            {/* Initial state preview */}
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#a19f9d", borderRadius: "4px", border: "5px solid #000000" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#000000" }}>Current State Preview:</div>
              <div style={{ display: "grid", gap: "0.3rem" }}>
                {
                  lockState.map((slideVal, sliderIdx) => (
                    <div key={sliderIdx} title={`Pin ${sliderIdx}`}>
                      {drawLock(slideVal, false)}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Lock dependencies */}
          <div style={{ marginTop: "3rem" }}>
            <h3>Lock Dependencies</h3>
            <table style={{ borderCollapse: "collapse"}}>
              <thead>
                <tr>
                  <th></th>
                  {Array.from({ length: 7 }).map((__, colNum) => (<th key={colNum} style={{ padding: "4px 8px", fontSize: "20px", whiteSpace: "nowrap" }}>Slide {colNum+1}</th>)) /* Python equivalent: headers = [{"Slide": col, "label": f"Slide {col}"} for col in range(7)] */} 
                </tr>
              </thead>
              <tbody>
                {Object.keys(lockConfig).map((rowIdx) => {
                  const rowNum = Number(rowIdx);
                  return (
                    <tr key={rowIdx}>
                      <td style={{ fontWeight: "bold", paddingRight: "8px", fontSize: "20px", whiteSpace: "nowrap" }}>Slide {rowNum+1}</td>
                      {lockConfig[rowIdx].map((configValue, colIdx) => {
                        const isDiagonal = rowNum === colIdx;
                        return (
                          <td key={colIdx} style={{ padding: "4px" }}>
                            <select
                              value={configValue}
                              disabled={isDiagonal}
                              onChange={(configInput) => configChange(rowIdx, colIdx, configInput.target.value)}
                              style={{
                                color: "#000000",
                                fontSize: "30px",
                                padding: "4px",
                                backgroundColor: isDiagonal ? "#ab8989" : "#aba5a5",
                                fontWeight: isDiagonal ? "bold" : "normal",
                                cursor: isDiagonal ? "not-allowed" : "pointer"
                              }}
                            >
                              <option value={-1}> -1</option>
                              <option value={0}>   0</option>
                              <option value={1}>   1</option>
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

          <div style={{ marginTop: "2rem" }}>
            <button onClick={sendLock} style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", cursor: "pointer" }}>
              {isSolving ? "Solving..." : "Solve"}
            </button>
          </div>
        </div>

        {/* Right: Result display */}
        <div style={{ flex: "1 1 500px" }}>
          {result && (
            <div style={{ background: "#b79483", padding: "2rem", borderRadius: "40px", width: "100%", boxSizing: "border-box" }}>

              <h3 style={{ color: "#000000" }}>
                Result:
              </h3>
        
              {/* Steps columns */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))", gap: "1rem", width: "100%", boxSizing: "border-box" }}>

                {/* Left column */}
                <div style={{ display: "grid", gap: "0.8rem", alignContent: "start", width: "100%" }}>
                  {leftMoves.map((move, idx) => drawResColumn(move, idx))}
                </div>

                {/* Right column */}
                <div style={{ display: "grid", gap: "0.8rem", alignContent: "start", width: "100%" }}>
                  {rightMoves.map((move, idx) => drawResColumn(move, midStep + idx)) /* Python equivalent: [draw_res_column(move, mid_step + idx) for idx, move in enumerate(rightMoves)] */} 
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;