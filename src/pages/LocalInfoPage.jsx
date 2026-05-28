
import { useState } from "react";
import { PhoneIcon, ClockIcon, ChevronDown, InfoIcon } from "../components/Icons";
import { DISTRICTS, COLLECTION_DATA } from "../data/localData";

export default function LocalInfoPage() {
  const [district, setDistrict] = useState("Kathmandu");
  const data = COLLECTION_DATA[district] || COLLECTION_DATA["Kathmandu"];

  return (
    <div className="page">
      <div className="page-inner">
        <div className="local-header">
          <h1>Regional Info & Resources</h1>
          <p>Find collection services and waste disposal rules specific to your district.</p>
        </div>

        <label className="select-label">Select Your District</label>
        <div className="select-wrap">
          <select value={district} onChange={(e) => setDistrict(e.target.value)}>
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <span className="select-arrow"><ChevronDown /></span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-800)", marginBottom: 4 }}>
            Collection Directory
          </div>
          <div style={{ fontSize: 13, color: "var(--gray-500)" }}>
            Contact numbers for municipal trucks and local scrap dealers in {district}.
          </div>
        </div>

        <div className="collection-grid">
          {data.centers.map((c, i) => (
            <div key={i} className="collection-card">
              <div className="collection-card-header">
                <div className="collection-card-name">{c.name}</div>
                <span className={`tag ${c.tagClass}`}>{c.tag}</span>
              </div>
              <div className="collection-detail"><PhoneIcon /> {c.phone}</div>
              <div className="collection-detail"><ClockIcon /> {c.hours}</div>
            </div>
          ))}
        </div>

        <div className="rules-card">
          <div className="rules-title">
            <InfoIcon style={{ color: "#fff" }} /> Waste Disposal Rules for {district}
          </div>
          <ul className="rules-list">
            {data.rules.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <p className="rules-note">
            Note: Rules may vary by ward. Contact your local municipal office for specific guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}