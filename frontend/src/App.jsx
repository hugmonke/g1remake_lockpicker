import { useEffect, useState } from "react";
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
  const selectStyle = {
    color: "#cfbebe",
    fontSize: "20px",
    padding: "4px 8px",
    backgroundColor: "#211818",
    fontWeight: "normal",
    cursor: "pointer",
    borderRadius: "8px",
    border: "3px solid #3a2b2b",
    fontFamily: "Georgia, serif",
    margin: "0 6px"
  };
  function sliderChange(index, value) {
    const newLockState = [...lockState];
    newLockState[index] = Number(value);
    setLockState(newLockState);
  }
  
  const [lockDependencies, setDependencies] = useState([{ targetSlider: 0, sourceSlider: 1, direction: 1 }]);
  
  function configChange(rowIndex, colIndex, value) {
    setLockConfig(function(prev) {
      const updatedConfig = { ...prev };
      const updatedRow = [...prev[rowIndex]];
      updatedRow[colIndex] = value;
      updatedConfig[rowIndex] = updatedRow;
      return updatedConfig;
    });
  }


  const [errorMessage, setErrorMessage] = useState(null);
  async function sendLock() {
    setIsSolving(true);
    setResult(null);
    try {
      const response = await axios.post("http://localhost:8000/lock_input", {
        lock_state: { start_lock_state: lockState },
        lock_config: { start_lock_config: lockConfig },
      });

      if (!response.data.solution) {
        setErrorMessage("No solutions found!");
      } else {
        setErrorMessage(null)
        setResult(response.data);
      }

    } catch(error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setErrorMessage(`Error: ${error.response.data.detail}`);
      } else {
        setErrorMessage("An unexpected error occurred while trying to solve the lock :(");
      }
      console.error("Error sending data to API:", error);
    } finally {
      setIsSolving(false)
    }
  }
  
  useEffect(() => {
    const baseConfig = {
      0: [1, 0, 0, 0, 0, 0, 0], 
      1: [0, 1, 0, 0, 0, 0, 0], 
      2: [0, 0, 1, 0, 0, 0, 0], 
      3: [0, 0, 0, 1, 0, 0, 0], 
      4: [0, 0, 0, 0, 1, 0, 0], 
      5: [0, 0, 0, 0, 0, 1, 0], 
      6: [0, 0, 0, 0, 0, 0, 1]
    };
    setLockConfig(baseConfig);
    lockDependencies.forEach((dependency) => {
      const row = Number(dependency.targetSlider);
      const col = Number(dependency.sourceSlider);
      const val = Number(dependency.direction);
      configChange(row, col, val)
    });
  }, [lockDependencies]);

  function lockDependenciesChange(idx, key, val) {
    const newLockDependencies = [...lockDependencies];
    const dependency = newLockDependencies[idx];
    const value = Number(val);

    if (key === "targetSlider") {
      if (value === Number(dependency.sourceSlider)) {
        dependency.sourceSlider = Number(dependency.targetSlider);
      }
      dependency.targetSlider = value;
    } else if (key === "sourceSlider") {
        if (value === Number(dependency.targetSlider)) {
          dependency.targetSlider = Number(dependency.sourceSlider);
        }
        dependency.sourceSlider = value;
      } else {
        dependency[key] = val;
    }

    setDependencies(newLockDependencies);
  }

  function addDependency() {
    setDependencies([...lockDependencies, { targetSlider: 0, sourceSlider: 1, direction: 1 }]);
  }

  function delDependency(index) {
    setDependencies(lockDependencies.filter((_, i) => i !== index));
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
          width: "550px",
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
      <div style={{ display: "flex", gap: "12rem", flexWrap: "wrap",  }}>
        
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
                    <div key={sliderIdx}>
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
                
          {lockDependencies.map((rule, idx) => (

          <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", padding: "0.8rem 1rem", backgroundColor: "#211818", borderRadius: "12px", border: "4px solid #3a2b2b", flexWrap: "wrap", gap: "5px", fontSize: "20px" }}>
          <span>Slider no.</span>
          <select 
            value={rule.targetSlider}
            onChange={(el) => lockDependenciesChange(idx, "targetSlider", el.target.value)}
            style={selectStyle}> 
            {Array.from({ length: 7 }).map((_, i) => (
              <option 
                key={i} 
                value={i}
                // disabled={i === Number(rule.sourceSlider)}
                >{i+1}
            </option>))}
          </select>
          <span>moves in the</span>
          <select 
          value={rule.direction}
          onChange={(el) => lockDependenciesChange(idx, "direction", el.target.value)}
          style={selectStyle}>
            <option value="-1">opposite</option>
            <option value="1">same</option>
          </select>
          <span>direction as slider no. </span>
          <select 
            value={rule.sourceSlider}
            onChange={(el) => lockDependenciesChange(idx, "sourceSlider", el.target.value)}
            style={selectStyle}> 
            {Array.from({ length: 7 }).map((_, i) => (
              <option 
                key={i} 
                value={i}
                // disabled={i === Number(rule.targetSlider)}
                >{i+1}
            </option>))}
          </select>
          <div style = {{display: "flex", justifyContent: "space-between", width: "100%"}}>
          <button // Delete dependency button
            onClick={() => delDependency(idx)}
            style={{
              padding: "6px 12px",
              fontSize: "16px",
              backgroundColor: "#3a2b2b",
              color: "#e2ae59",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >- Delete
          </button>
            
          <button // Add dependency button
            onClick={addDependency}
            style={{
              padding: "6px 12px",
              fontSize: "16px",
              backgroundColor: "#3a2b2b",
              color: "#e2ae59",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          > + Add
          </button>
          </div>
          </div>
          ))}
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
          {errorMessage && (
            <div style={{ background: "#211818", padding: "2rem", borderRadius: "40px", border: "1px solid #000000", width: "100%", boxSizing: "border-box", marginTop: "50px" }}>
              <h3 style={{ color: "#f4a261" }}>
                {errorMessage}
                </h3>
            </div>
          )}
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