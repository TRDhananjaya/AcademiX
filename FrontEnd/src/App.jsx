import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Users from "./pages/Users";

function App() {
    return (
        <div className="app">
            <header className="app-header">
                <span className="logo">AcademiX</span>
                <nav className="nav">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/about">About</NavLink>
                    <NavLink to="/users">Users</NavLink>
                </nav>
            </header>
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/users" element={<Users />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;