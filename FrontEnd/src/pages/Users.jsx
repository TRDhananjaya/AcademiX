import { useEffect, useState } from "react";
import axios from "axios";

function Users() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/test")
            .then((res) => setMessage(res.data.message))
            .catch(() => setMessage("Backend not reachable"));
    }, []);

    return (
        <section className="page">
            <h1>Users</h1>
            <p>{message}</p>
        </section>
    );
}

export default Users;
