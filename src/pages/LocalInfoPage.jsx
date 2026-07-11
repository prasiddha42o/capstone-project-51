import { useState } from "react";
import {
PhoneIcon,
ClockIcon,
ChevronDown,
InfoIcon,
LocationIcon,
RecycleIcon,
TruckIcon,
BuildingIcon,
} from "../components/Icons";
import { DISTRICTS, COLLECTION_DATA } from "../data/localData";

export default function LocalInfoPage() {
const DEFAULT_DISTRICT = "Kathmandu";

const [district, setDistrict] = useState(DEFAULT_DISTRICT);
const data = COLLECTION_DATA[district] || COLLECTION_DATA[DEFAULT_DISTRICT];
return (
<div className="page">
<div className="page-inner">
<div className="local-header">
<div
style={{
display: "flex",
alignItems: "center",
gap: "14px",
marginBottom: "12px",
}}
>
<RecycleIcon size={34} />
<h1 style={{ margin: 0 }}>Regional Info & Resources</h1>
</div>

      <p>
        Find collection services, recycling resources, and waste disposal
        rules specific to your district.
      </p>
    </div>

    <label
      className="select-label"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <LocationIcon />
      Select Your District
    </label>

    <div className="select-wrap">
      <select
  value={district}
  aria-label="Select district"
  onChange={(e) => setDistrict(e.target.value)}
>
        {DISTRICTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      <span className="select-arrow">
        <ChevronDown />
      </span>
    </div>

    {/* Collection Directory */}
    <div
      style={{
        marginTop: "40px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <TruckIcon size={28} />

      <div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "var(--gray-900)",
          }}
        >
          Collection Directory
        </div>

        <div
          style={{
            fontSize: "18px",
            color: "var(--gray-500)",
            marginTop: "4px",
          }}
        >
          Contact numbers for municipal trucks and local recycling centers
          in {district}.
        </div>
      </div>
    </div>

    <div className="collection-grid">
      {data.centers.map((c) => (
  <div key={c.name} className="collection-card">
          <div className="collection-card-header">
            <div className="collection-card-name">{c.name}</div>

            <span className={`tag ${c.tagClass}`}>
              {c.tag}
            </span>
          </div>

          <div className="collection-detail">
            <LocationIcon />
            {district}, Nepal
          </div>

          <div className="collection-detail">
            <PhoneIcon />
            {c.phone}
          </div>

          <div className="collection-detail">
            <ClockIcon />
            {c.hours}
          </div>
        </div>
      ))}
    </div>

    {/* Waste Rules */}
    <div className="rules-card">
      <div className="rules-title">
        <InfoIcon style={{ color: "#fff" }} />
        Waste Disposal Rules for {district}
      </div>

      <ul className="rules-list">
       {data.rules.map((rule) => (
  <li key={rule}>{rule}</li>
))}
      </ul>

      <p className="rules-note">
        Note: Rules may vary by ward. Contact your local municipal office
        for the latest guidelines and collection schedules.
      </p>
    </div>

    {/* Municipality Information */}
    <div
      className="rules-card"
      style={{
        marginTop: "32px",
      }}
    >
      <div className="rules-title">
        <BuildingIcon />
        Municipality Information
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div className="collection-card">
          <div className="collection-card-name">
            District Office
          </div>

          <div className="collection-detail">
            <LocationIcon />
            {district}
          </div>
        </div>

        <div className="collection-card">
          <div className="collection-card-name">
            Waste Management
          </div>

          <div className="collection-detail">
            <RecycleIcon />
            Recycling & Disposal Support
          </div>
        </div>

        <div className="collection-card">
          <div className="collection-card-name">
            Collection Services
          </div>

          <div className="collection-detail">
            <TruckIcon />
            Municipal Collection Network
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

);
}