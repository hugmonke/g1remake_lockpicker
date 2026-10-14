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
      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0.5rem", background: "#221c1a", borderRadius: "4px", border: "1px solid #4a3b35", boxShadow: "inset 0 1px 5px #793c33" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #382c28", paddingBottom: "0.5rem" }}>
          <span style={{ fontWeight: "bold", fontSize: "1.3rem", color: "#e2ae59" }}>Step {idx + 1}.</span>
          <span style={{ background: "#3d261d", color: "#f4a261", padding: "2px 8px", borderRadius: "4px", fontSize: "1.2rem", fontWeight: "bold", border: "1px solid #8d5b4c" }}>{move.direction === "L" ? `${move.slider_idx + 1}L` : `${move.slider_idx + 1}R`}</span>
        </div>
        <div style={{ display: "grid", gap: "0.4rem", flexWrap: "wrap", justifyItems: "center", width: "100%" }}>
          {states[idx + 1]?.map((pin, i) => (<div key={i} title={`Slider ${i}`}>{drawLock(pin, i === move.slider_idx)}</div>))}
        </div>
      </div>
    );
  }

  function drawLock(pinValue, isHighlighted) {
    // Draws locks in both init state preview and result steps
    const holeStep = 32; // 30px (hole) + 2px (gap)
    const transX = holeStep*Number(pinValue+2);

    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          overflow: "hidden",
          width: "500px",
          background: "#110c0c",
          borderRadius: "10px",
          padding: "2px",
          border: "2px solid #251717"
        }}
      >
      <div 
        // Slider
        style={{ 
          display: "flex", 
          gap: "2px", // Holes gaps
          background: isHighlighted ? "#604828" : "#473030", 
          padding: "3px", 
          borderRadius: "5px", // Corner rounding
          border: `4px solid ${isHighlighted ? "#b07430" : "#6c5959"}`,
          transform: `translateX(${transX}px)`
        }}
      >
        {
          Array.from({ length: 7 }).map(
            // Hole
            (_, holeIdx) => {
              const hasBolt = 6-holeIdx === Number(pinValue);
              return (
                <div
                  key={holeIdx}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "40px",
                    background: hasBolt ? "#a98467" : "#110c0c",
                    display: "flex",
                    border: ` ${hasBolt ? "6px solid #110c0c" : "1px solid #4a3b35"}`
                  }}
                >
                  
                </div>
              );
            }
          )
        }
      </div>
    
      </div>
    );
  }

  return (
    <div style={{ zoom: "0.65", padding: "3rem 3rem", fontFamily: "Georgia, serif", backgroundColor: "#140f0f", color: "#cfbebe" }}>
      <h1 style = {{color: "#e2ae59", borderBottom: "2px solid #392922"}}>Gothic Remake Lockpick Solver</h1>

      {/* Page layout */}
      <div style={{ display: "flex", gap: "12rem", flexWrap: "wrap" }}>
        
        {/* Left: Initial state and dependencies */}
        <div style={{ flex: "0 1 10px" }}>
          <div>
            <h3 style = {{paddingTop: "0.5rem", paddingBottom: "0.5rem"}}>Initial Lock State</h3>
            {lockState.map((pinVal, sliderIdx) => (
              <div key={sliderIdx} style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "2rem", borderRadius: "10px", border: "5px solid #3a2b2b", padding: "0.3rem 1rem", background: "#211818" }}>
                <label style={{ width: "70px", whiteSpace: "nowrap", fontSize: "20px", color: "#cfbebe"  }}>Slider {sliderIdx+1}:</label>
                
                <input
                
                  type="range"
                  min="0"
                  max="6"
                  value={pinVal}
                  onChange={(slideInput) => sliderChange(sliderIdx, slideInput.target.value)}
                  style={{ flex: 1, accentColor: "#e2ae59"}}
                />
                
                <span style={{ fontWeight: "bold", width: "20px" }}>{pinVal+1}</span>
              </div>
            ))}

            {/* Initial state preview */}
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#211818", borderRadius: "30px", border: "5px solid #3a2b2b" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#e2ae59" }}>Initial State Preview:</div>
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
          <div style={{ marginTop: "3rem", color: "#cfbebe" }}>
            <h3>Lock Dependencies</h3>
            <table style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th></th>
                  {Array.from({ length: 7 }).map((__, colNum) => (<th key={colNum} style={{ padding: "4px 8px", fontSize: "20px", whiteSpace: "nowrap" }}>Slider {colNum+1}</th>)) /* Python equivalent: headers = [{"Slide": col, "label": f"Slide {col}"} for col in range(7)] */} 
                </tr>
              </thead>
              <tbody>
                {Object.keys(lockConfig).map((rowIdx) => {
                  const rowNum = Number(rowIdx);
                  return (
                    <tr key={rowIdx}>
                      <td style={{ fontWeight: "bold", paddingRight: "8px", fontSize: "20px", whiteSpace: "nowrap" }}>Slider {rowNum+1}</td>
                      {lockConfig[rowIdx].map((configValue, colIdx) => {
                        const isDiagonal = rowNum === colIdx;
                        return (
                          <td key={colIdx} style={{ padding: "4px" }}>
                            <select
                              value={configValue}
                              disabled={isDiagonal}
                              onChange={(configInput) => configChange(rowIdx, colIdx, configInput.target.value)}
                              style={{
                                color: isDiagonal ? "#554141" : "#cfbebe" ,
                                fontSize: "30px",
                                padding: "4px",
                                backgroundColor: isDiagonal ? "#171111" : "#211818",
                                fontWeight: isDiagonal ? "bold" : "normal",
                                cursor: isDiagonal ? "not-allowed" : "pointer",
                                borderRadius: "8px",
                                border: "4px solid #3a2b2b"
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
            <button onClick={sendLock} 
            disabled={isSolving}
            style={{ 
              padding: "1rem 2rem",
               fontSize: "2rem", 
               fontWeight: "bold",
               borderRadius: "15px",
               border: `4px solid ${isSolving ? "#030202" : "#3a2b2b"}`,
               cursor: isSolving ? "default" : "pointer",
               color: "#e2ae59",
               backgroundColor: isSolving ? "#0f0b0b" : "#211818 ",
               minWidth: "725px"       
               }}>
              {isSolving ? "Solving..." : "Solve"}
            </button>
          </div>
        </div>

        {/* Right: Result display */}
        <div style={{ flex: "1 1 auto" }}>
          {result && (
            <div style={{ background: "#251c1c", padding: "2rem", borderRadius: "40px", border: "1px solid #000000", width: "100%", boxSizing: "border-box" }}>

              <h3 style={{ color: "#e2ae59" }}>
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