function Home() {
    return (
        <section className="page home">
            <div className="home-hero">
                <div className="home-hero-copy">
                    <p className="eyebrow">Unified campus platform</p>
                    <h1>AcademiX</h1>
                    <p className="lead">
                        Manage students, courses, and performance in one clean system built
                        for modern institutions.
                    </p>
                    <div className="cta-row">
                        <button className="cta-primary" type="button">Get Started</button>
                        <button className="cta-ghost" type="button">View Programs</button>
                    </div>
                    <div className="stats">
                        <div>
                            <strong>120+</strong>
                            <span>Departments onboarded</span>
                        </div>
                        <div>
                            <strong>98%</strong>
                            <span>On-time reporting</span>
                        </div>
                        <div>
                            <strong>24/7</strong>
                            <span>Admin visibility</span>
                        </div>
                    </div>
                </div>
                <div className="home-hero-card">
                    <div className="card-header">
                        <span>Live Dashboard</span>
                        <span className="badge">Now</span>
                    </div>
                    <div className="card-grid">
                        <div>
                            <p>Enrollment</p>
                            <h3>4,286</h3>
                            <span className="trend up">+7.4%</span>
                        </div>
                        <div>
                            <p>Attendance</p>
                            <h3>92%</h3>
                            <span className="trend up">+2.1%</span>
                        </div>
                        <div>
                            <p>Risk Alerts</p>
                            <h3>14</h3>
                            <span className="trend down">-3</span>
                        </div>
                        <div>
                            <p>Faculty Load</p>
                            <h3>73%</h3>
                            <span className="trend flat">steady</span>
                        </div>
                    </div>
                    <div className="card-footer">
                        <span>Last sync: 2 min ago</span>
                        <button className="link" type="button">Open analytics</button>
                    </div>
                </div>
            </div>
            <div className="home-highlights">
                <article>
                    <h2>Smart enrollment</h2>
                    <p>Forecast demand, balance classes, and automate waitlists.</p>
                </article>
                <article>
                    <h2>Outcome tracking</h2>
                    <p>See performance by cohort, program, and competency.</p>
                </article>
                <article>
                    <h2>Trusted data</h2>
                    <p>Single source of truth across admissions, academics, and finance.</p>
                </article>
            </div>
        </section>
    );
}

export default Home;
