import { ArrowRight, ScanIcon, GlobeIcon, UsersIcon } from "../components/Icons";

export default function HomePage({ setPage }) {
  return (
    <div className="page">
      <section className="hero">
        <h1 className="text-red-500 text-5xl font-bold">
    Waste Management
</h1>
        <p className="hero-sub">
          Join the movement to tackle Nepal's waste crisis with intelligent waste
          identification and sustainable disposal solutions.
        </p>
        <button className="btn-hero" onClick={() => setPage("Identify")}>
          Start Identifying <ArrowRight />
        </button>
      </section>

      <section className="section section-center" style={{ background: "#fff" }}>
        <h2 className="section-title">Our Mission</h2>
        <p className="section-sub">
          Solving Nepal's landfill crisis through AI-powered waste management,
          contributing to UN Sustainable Development Goals 12 and 11.
        </p>
        <div className="mission-cards">
          <div className="mission-card">
            <div className="mission-icon"><ScanIcon /></div>
            <h3>Smart Identification</h3>
            <p>Use AI to instantly identify waste types and learn proper disposal methods.</p>
          </div>
          <div className="mission-card">
            <div className="mission-icon"><GlobeIcon /></div>
            <h3>SDG Impact</h3>
            <p>Directly contribute to achieving SDG 11 and 12 through responsible waste management.</p>
          </div>
          <div className="mission-card">
            <div className="mission-icon"><UsersIcon /></div>
            <h3>Community Driven</h3>
            <p>Join thousands of Nepalis working together to create cleaner, sustainable cities.</p>
          </div>
        </div>
      </section>

      <div className="stats-banner">
        <div className="stat-item"><div className="stat-num">12,450+</div><div className="stat-label">Kg Waste Diverted</div></div>
        <div className="stat-item"><div className="stat-num">3,280+</div><div className="stat-label">Active Users</div></div>
        <div className="stat-item"><div className="stat-num">8,750+</div><div className="stat-label">User Points Earned</div></div>
      </div>

      <section className="cta-section">
        <h2 className="cta-title">Ready to Make a Difference?</h2>
        <p className="cta-sub">Start identifying waste today and contribute to a cleaner Nepal.</p>
        <button className="btn-hero" onClick={() => setPage("Identify")}>
          Get Started Now <ArrowRight />
        </button>
      </section>
    </div>
  );
}