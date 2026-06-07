import "./StudyPlan.css";

const studyPlanItems = [
	{
		title: "Review Short Notes",
		details: "Derivatives and Integrals (15 min)",
	},
	{
		title: "Practice Questions",
		details: "10 Adaptive MCQs",
	},
];

const communityItems = [
	{
		name: "Sarah J.",
		initials: "SJ",
		text: "Found this interactive periodic table that makes memorizing valencies easier.",
		meta: "12 likes",
	},
	{
		name: "Study Group: Calculus 101",
		initials: "MK",
		text: "Meeting tonight at 8 PM to review practice exam questions. All are welcome!",
		meta: "4 min",
	},
];

export default function StudyPlan() {
	return (
		<div className="study-plan-page">
			<aside className="study-sidebar">
				<div className="brand">
					<span className="brand-mark">A</span>
					<span className="brand-text">AcademiX</span>
				</div>
				<nav className="nav">
					<button className="nav-item" type="button">
						<span className="nav-dot" />
						Dashboard
					</button>
					<button className="nav-item" type="button">
						<span className="nav-dot" />
						Lessons
					</button>
					<button className="nav-item" type="button">
						<span className="nav-dot" />
						Quizzes
					</button>
					<button className="nav-item active" type="button">
						<span className="nav-dot" />
						Study Plans
					</button>
					<button className="nav-item" type="button">
						<span className="nav-dot" />
						Community
					</button>
					<button className="nav-item" type="button">
						<span className="nav-dot" />
						Notifications
					</button>
				</nav>
				<div className="sidebar-footer">
					<div className="mini-card">
						<p>Weekly streak</p>
						<strong>6 days</strong>
					</div>
				</div>
			</aside>

			<div className="study-main">
				<header className="study-topbar">
					<div className="search">
						<span className="search-icon" aria-hidden="true" />
						<input
							type="text"
							placeholder="Search courses, plans, community..."
							aria-label="Search courses, plans, community"
						/>
					</div>
					<div className="topbar-actions">
						<button className="icon-button" type="button" aria-label="Open planner">
							<span className="icon-grid" aria-hidden="true" />
						</button>
						<button className="icon-button" type="button" aria-label="View notifications">
							<span className="icon-bell" aria-hidden="true" />
						</button>
						<div className="avatar">AL</div>
					</div>
				</header>

				<section className="study-hero">
					<div>
						<p className="eyebrow">Today&apos;s focus</p>
						<h1>Ready to crush your goals, Alex?</h1>
						<p className="subtext">
							Here is your AI-curated study roadmap for today.
						</p>
					</div>
					<button className="primary-button" type="button">
						Start session
					</button>
				</section>

				<section className="study-grid">
					<div className="card plan-card reveal">
						<div className="card-header">
							<div>
								<h2>Your AI Study Plan</h2>
								<p>Focused on weak areas: Advanced Calculus</p>
							</div>
							<span className="pill">Active</span>
						</div>
						<div className="plan-list">
							{studyPlanItems.map((item) => (
								<div key={item.title} className="plan-item">
									<div className="plan-icon" aria-hidden="true" />
									<div>
										<strong>{item.title}</strong>
										<p>{item.details}</p>
									</div>
									<span className="chevron" aria-hidden="true" />
								</div>
							))}
						</div>
					</div>

					<div className="card next-quiz-card reveal delay-1">
						<div className="ring">
							<div className="ring-inner">
								<p className="eyebrow">Next Quiz</p>
								<h3>Adaptive Physics Follow-up</h3>
								<div className="countdown">02:45:00</div>
								<button className="ghost-button" type="button">
									Review material
								</button>
							</div>
						</div>
					</div>
				</section>

				<section className="study-lower">
					<div className="card performance-card reveal delay-2">
						<div className="card-header">
							<div>
								<h3>Recent Performance</h3>
								<p>Last 7 days</p>
							</div>
							<button className="ghost-button" type="button">
								View report
							</button>
						</div>
						<div className="chart">
							<div className="bar bar-1" />
							<div className="bar bar-2" />
							<div className="bar bar-3" />
							<div className="bar bar-4" />
							<div className="bar bar-5" />
						</div>
						<div className="chart-labels">
							<span>Mon</span>
							<span>Tue</span>
							<span>Wed</span>
							<span>Thu</span>
							<span>Fri</span>
						</div>
					</div>

					<div className="card community-card reveal delay-3">
						<div className="card-header">
							<div>
								<h3>Community Highlights</h3>
								<p>See what your cohort shares</p>
							</div>
							<button className="ghost-button" type="button">
								View all
							</button>
						</div>
						<div className="community-list">
							{communityItems.map((item) => (
								<div key={item.name} className="community-item">
									<div className="avatar soft">{item.initials}</div>
									<div>
										<strong>{item.name}</strong>
										<p>{item.text}</p>
										<span>{item.meta}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
