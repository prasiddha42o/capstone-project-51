import { useMemo, useState } from "react";
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
import { DISTRICTS, COLLECTION_DATA, MUNICIPALITIES } from "../data/localData";

const DEFAULT_DISTRICT = "Kathmandu";
const DISTRICT_COORDINATES = {
  Kathmandu: { lat: 27.7172, lng: 85.324 },
  Lalitpur: { lat: 27.658, lng: 85.3146 },
  Bhaktapur: { lat: 27.6728, lng: 85.4272 },
};

const toRad = (value) => (value * Math.PI) / 180;

const getDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export default function LocalInfoPage() {
  const [district, setDistrict] = useState(DEFAULT_DISTRICT);
  const defaultMunicipality = (MUNICIPALITIES[DEFAULT_DISTRICT] && MUNICIPALITIES[DEFAULT_DISTRICT][0]?.name) || "";
  const [municipality, setMunicipality] = useState(defaultMunicipality);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(
    "Use your live location or choose your district and municipality to find the nearest waste collector."
  );
  const [isFindingLocation, setIsFindingLocation] = useState(false);

  const data = COLLECTION_DATA[district] || COLLECTION_DATA[DEFAULT_DISTRICT];
  const districtCenter = DISTRICT_COORDINATES[district] || DISTRICT_COORDINATES[DEFAULT_DISTRICT];
  const municipalityEntry = (MUNICIPALITIES[district] || []).find((m) => m.name === municipality);
  const mapCenter = userLocation || municipalityEntry || districtCenter;

  const nearestCollector = useMemo(() => {
    const collectors = data.centers.filter(
      (center) => typeof center.lat === "number" && typeof center.lng === "number"
    );

    if (!collectors.length) {
      return null;
    }

    if (!userLocation) {
      return { ...collectors[0], distance: null };
    }

    return collectors.reduce((closest, center) => {
      const distance = getDistanceKm(userLocation, { lat: center.lat, lng: center.lng });
      if (!closest || distance < closest.distance) {
        return { ...center, distance };
      }
      return closest;
    }, null);
  }, [data.centers, userLocation]);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(mapCenter.lng - 0.05).toFixed(4)}%2C${(mapCenter.lat - 0.05).toFixed(4)}%2C${(mapCenter.lng + 0.05).toFixed(4)}%2C${(mapCenter.lat + 0.05).toFixed(4)}&layer=mapnik&marker=${mapCenter.lat.toFixed(4)}%2C${mapCenter.lng.toFixed(4)}`;

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Live location is not available on this browser.");
      return;
    }

    setIsFindingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("Showing the nearest collector from your current location.");
        setIsFindingLocation(false);
      },
      () => {
        setLocationStatus("Location access was denied. You can still browse by district.");
        setIsFindingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationSearch = (event) => {
    event.preventDefault();
    // No-op: kept to satisfy any potential form submissions (we now use selects)
    setLocationStatus(`Showing collector information for ${district}${municipality ? ', ' + municipality : ''}.`);
  };

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
            onChange={(event) => {
              const selected = event.target.value;
              setDistrict(selected);
              setMunicipality((MUNICIPALITIES[selected] && MUNICIPALITIES[selected][0]?.name) || "");
              setUserLocation(null);
              setLocationStatus(`Showing collector information for ${selected}.`);
            }}
          >
            {DISTRICTS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <span className="select-arrow">
            <ChevronDown />
          </span>
        </div>

        <div
          className="rules-card"
          style={{ marginTop: "24px" }}
        >
          <div className="rules-title">
            <LocationIcon />
            Live Location Map
          </div>

          <p className="rules-note" style={{ marginTop: "10px" }}>
            {locationStatus}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "14px",
              alignItems: 'center'
            }}
          >
            <div style={{ flex: '1 1 240px' }}>
              <label className="select-label" style={{ display: 'block', marginBottom: 6 }}>Select Municipality</label>
              <select
                aria-label="Select municipality"
                value={municipality}
                onChange={(e) => {
                  setMunicipality(e.target.value);
                  setUserLocation(null);
                  setLocationStatus(`Showing collector information for ${e.target.value}, ${district}.`);
                }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 999, border: '1px solid #d1d5db' }}
              >
                {(MUNICIPALITIES[district] || []).map((m) => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleUseMyLocation}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "999px",
                padding: "10px 16px",
                background: "#fff",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {isFindingLocation ? "Locating..." : "Use my location"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                overflow: "hidden",
                minHeight: "280px",
              }}
            >
              <iframe
                title="Live location map"
                src={mapUrl}
                style={{ width: "100%", height: "100%", minHeight: "280px", border: 0 }}
              />
            </div>

            <div className="collection-card">
              <div className="collection-card-name">Nearest Collector</div>
              <div className="collection-detail">
                <LocationIcon />
                {district}, Nepal
              </div>
              <div className="collection-detail">
                <InfoIcon />
                {nearestCollector?.tag || data.centers[0]?.tag}
              </div>
              <div className="collection-detail">
                <ClockIcon />
                {nearestCollector?.hours || data.centers[0]?.hours}
              </div>
              <div className="collection-detail">
                <TruckIcon />
                {nearestCollector?.distance != null
                  ? `${nearestCollector.distance.toFixed(1)} km away`
                  : `Closest service in ${district}`}
              </div>
            </div>
          </div>
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
          {data.centers.map((center) => (
            <div key={center.name} className="collection-card">
              <div className="collection-card-header">
                <div className="collection-card-name">{center.name}</div>

                <span className={`tag ${center.tagClass}`}>{center.tag}</span>
              </div>

              <div className="collection-detail">
                <LocationIcon />
                {district}, Nepal
              </div>

              <div className="collection-detail">
                <PhoneIcon />
                {center.phone}
              </div>

              <div className="collection-detail">
                <ClockIcon />
                {center.hours}
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
              <div className="collection-card-name">District Office</div>

              <div className="collection-detail">
                <LocationIcon />
                {district}
              </div>
            </div>

            <div className="collection-card">
              <div className="collection-card-name">Waste Management</div>

              <div className="collection-detail">
                <RecycleIcon />
                Recycling & Disposal Support
              </div>
            </div>

            <div className="collection-card">
              <div className="collection-card-name">Collection Services</div>

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