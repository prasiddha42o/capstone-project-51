import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StarIcon, ScanIcon, AwardIcon } from "../components/Icons";
import { PIE_DATA, HISTORY, BADGES } from "../data/dashboardData";

export default function DashboardPage() {
  return (
    <div className="page">
      <div className="page-inner">
        <div className="dash-header">
          <h1>Personal Impact Dashboard</h1>
          <p>Track your progress and environmental contribution.</p>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-icon icon-bg-green"><StarIcon /></div>
            <div>
              <div className="stat-card-val">380</div>
              <div className="stat-card-label">Total Points</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon icon-bg-blue"><ScanIcon /></div>
            <div>
              <div className="stat-card-val">38</div>
              <div className="stat-card-label">Items Identified</div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">Waste History Breakdown</div>
          <div className="dash-card-sub">Distribution of waste types you've identified</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={2}>
                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
              <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">Gamification Progress</div>
          <div className="dash-card-sub">Items kept out of Bancharedanda landfill</div>
          <div className="gamif-banner">
            <div>
              <div className="gamif-label">Your Points</div>
              <div className="gamif-points">380</div>
              <div className="gamif-motivation">✦ Great job! You're making a real difference!</div>
            </div>
            <AwardIcon />
          </div>
          <div className="progress-section">
            <div className="progress-label">
              <span>Items Diverted from Landfill</span>
              <span>38 / 50</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: "76%" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 5 }}>
              12 more items to reach your next milestone!
            </div>
          </div>
          <div className="badges-row">
            {BADGES.map((b) => (
              <div key={b.name} className={`badge-item${b.earned ? " earned" : ""}`}>
                <span className="badge-emoji">{b.emoji}</span>
                <span className="badge-name">{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">History Log</div>
          <div className="dash-card-sub">
            A scrollable list of previously identified items so you can look back at your habits.
          </div>
          <ul className="history-list">
            {HISTORY.map((h, i) => (
              <li key={i} className="history-item">
                <div className="history-icon">{h.emoji}</div>
                <div className="history-info">
                  <div className="history-name">{h.name}</div>
                  <div className="history-meta">📅 {h.date} · ⚖️ {h.weight}</div>
                </div>
                <div className="history-pts"><StarIcon /> +{h.pts} pts</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}