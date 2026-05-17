import { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/test")
            .then((res) => setMessage(res.data.message))
            .catch((err) => console.log(err));
    }, []);

    return (
        <div>
            <h1>Welcome to AcademiX</h1>
            <h5>{message}</h5>
        </div>

    );
}

export default App;