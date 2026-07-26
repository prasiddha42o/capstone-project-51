import { AlertIcon, CheckIcon } from "../components/Icons";

export default function AboutPage() {
  return (
    <div className="page">
      <div className="about-page">
        <h1 className="about-page-title">About & SDG Knowledge</h1>
        <p className="about-page-sub">Understanding the crisis and our solution for a sustainable Nepal.</p>

        <div className="about-section">
          <div className="about-section-header">
            <div className="about-icon-circle icon-red"><AlertIcon /></div>
            <div>
              <div className="about-section-title">The "Why"</div>
              <div className="about-section-subtitle">The Sisdole/Bancharedanda Crisis</div>
            </div>
          </div>
          <p className="about-body">
            Nepal's capital region faces a severe waste management crisis. The Sisdole (Bancharedanda)
            landfill in Nuwakot district has become a symbol of this challenge, receiving over{" "}
            <strong>1,300 metric tons of waste daily</strong> from the Kathmandu Valley.
          </p>
          <p className="about-body">The landfill has exceeded its capacity multiple times, leading to:</p>
          <ul className="bullet-list">
            <li><strong>Environmental contamination:</strong> Leachate polluting nearby rivers and groundwater</li>
            <li><strong>Health hazards:</strong> Toxic fumes and disease outbreaks affecting local communities</li>
            <li><strong>Social conflicts:</strong> Protests from local residents demanding better solutions</li>
            <li><strong>Economic burden:</strong> Millions spent on waste transportation with no sustainable plan</li>
          </ul>
          <div className="alert-box alert-red">
            <strong>⚠ Critical Fact</strong>
            Only about 15% of Kathmandu's waste is recycled or composted, while the remaining 85% ends
            up in landfills, creating an unsustainable system that threatens our environment and public health.
          </div>
          <p className="about-body">
            The root cause? <strong>Lack of waste segregation at source</strong> and limited public awareness
            about proper waste management.
          </p>
        </div>

        <hr className="divider-h" />

        <div className="about-section">
          <div className="about-section-header">
            <div className="about-icon-circle icon-green"><CheckIcon /></div>
            <div>
              <div className="about-section-title">The "How"</div>
              <div className="about-section-subtitle">Our AI-Powered Solution</div>
            </div>
          </div>
          <p className="about-body">
            The AI Waste Assistant for Nepal leverages cutting-edge artificial intelligence technology
            to empower citizens with instant, accurate waste identification and disposal guidance.
          </p>
          <p className="about-body"><strong>Technical Infrastructure:</strong></p>
          <ul className="infra-list">
            <li><strong>Computer Vision AI Model:</strong> Trained on thousands of waste images specific to Nepal's context</li>
            <li><strong>Real-time Classification:</strong> Instant identification of waste categories with confidence scores</li>
            <li><strong>Localized Database:</strong> Disposal instructions tailored to Nepal's waste management infrastructure</li>
            <li><strong>Gamification System:</strong> Points and badges to encourage continued participation</li>
          </ul>
          <div className="alert-box alert-blue">
            <strong>🎯 Supporting SDG 12: Responsible Consumption and Production</strong>
            Our platform directly contributes to United Nations Sustainable Development Goal 12 by
            promoting responsible consumption patterns and significantly reducing waste generation.
          </div>
          <div className="alert-box alert-green">
            <strong>🏙 Supporting SDG 11: Sustainable Cities and Communities</strong>
            By improving waste management and reducing environmental impact, we help create inclusive,
            safe, resilient, and sustainable cities — addressing one of the most pressing urban challenges in Nepal.
          </div>
        </div>

        <hr className="divider-h" />

        <div className="team-card">
          <div className="team-card-title">👥 Team & Contact</div>
          <div className="team-card-sub">Get in touch with us</div>
          <div className="contact-grid">
            <div className="contact-item">
              <h4>✉ Email Support</h4>
              <p>For general inquiries and support</p>
              <a href="mailto:support@wasteassistant.np">support@wasteassistant.np</a>
            </div>
            <div className="contact-item">
              <h4>💬 Feedback</h4>
              <p>Help us improve our service</p>
              <a href="mailto:feedback@wasteassistant.np">feedback@wasteassistant.np</a>
            </div>
          </div>
          <p className="about-body" style={{ fontSize: "13.5px" }}>
            We are a dedicated team of environmental scientists, AI engineers, and sustainability advocates
            committed to solving Nepal's waste crisis through technology and community engagement.
          </p>
          <p className="partnership">
            Partnership inquiries:{" "}
            <a href="mailto:partnerships@wasteassistant.np">partnerships@wasteassistant.np</a>
          </p>
        </div>
      </div>
    </div>
  );
}