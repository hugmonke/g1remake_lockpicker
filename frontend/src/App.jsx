import { useState } from "react";
import axios from "axios";

function App() {
  const [item, setItem] = useState({lock_state: "", lock_config: ""});
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setItem({...item, [e.target.name]: e.target.value });
  };

  const sendLock = async () => {
      const response = await axios.post("http://localhost:8000/lock_input", {
        lock_state: {
          start_lock_state: JSON.parse(item.lock_state),
        },
        lock_config: {
          start_lock_config: JSON.parse(item.lock_config),
        },
      });

      setResult(response.data);

    };

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h2>nie umiesz zamka zrobic???? wpisz se</h2>
      <input
        name="lock_state"
        placeholder='lock state, np. [1, 2, 6]'
        onChange={handleChange}
      />
      <br />
      <input
        name="lock_config"
        placeholder='lock config, np. {"0":[1,0,0],"1":[0,1,1],"2":[1,0,1]}'
        onChange={handleChange}
      />
      <br />
      <button onClick={sendLock}>Send to API</button>

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h3>API Response:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
