import Footer from "./components/common/Footer.jsx";
import Navbar from "./components/common/Navbar.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import StudentPlaceholder from "./components/student/StudentPlaceholder.jsx";
import TeacherPlaceholder from "./components/teacher/TeacherPlaceholder.jsx";

export default function App() {
	return (
		<div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
			<Navbar />
			<div style={{ display: "flex", minHeight: "calc(100vh - 112px)" }}>
				<Sidebar />
				<main style={{ padding: "2rem", flex: 1 }}>
					<h1>AcademiX</h1>
					<p>Starter UI is ready. Build your pages under src/pages.</p>
					<div style={{ marginTop: "1.5rem" }}>
						<TeacherPlaceholder />
						<StudentPlaceholder />
					</div>
				</main>
			</div>
			<Footer />
		</div>
	);
}
