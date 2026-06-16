import { useState } from "react";

const API_BASE = "http://localhost:3001/api";

export default function IdentifyPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const analyzeWaste = async () => {
    setLoading(true);

    setTimeout(async () => {
      const fakeResult = {
        name: "PET Plastic Bottle",
        confidence: 94,
        points: 10,
        instructions: "Dispose in recycling bin",
        emoji: "🧴",
        type: "plastic",
        weight: "500g",
      };

      setResult(fakeResult);
      setLoading(false);

      const user = JSON.parse(localStorage.getItem("wa_user"));

      await fetch(`${API_BASE}/dashboard/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          result: fakeResult,
        }),
      });
    }, 2000);
  };

  return (
    <div className="page">
      <div className="page-inner">

        {/* HEADER */}
        <div className="identify-header">
          <h1>AI Waste Identification Hub</h1>
          <p>Upload an image to identify waste type instantly</p>

          <div className="ai-badge">
            🤖 AI-Powered
          </div>
        </div>

        {/* GUIDELINES */}
        <div className="guidelines-card">
          <div className="guidelines-card-header">
            <div className="guidelines-title">
              📌 Image Capture Guidelines
            </div>
          </div>

          <ul className="guidelines-list">
            <li>Supported formats: JPG, PNG, JPEG</li>
            <li>Recommended: 720p or higher resolution</li>
            <li>Good lighting improves accuracy</li>
            <li>Use plain, uncluttered background</li>
          </ul>
        </div>

        {/* DROPZONE */}
        {!file && (
          <div className="dropzone">
            <div className="dropzone-icon">📤</div>

            <h3>Drag and Drop Waste Image Here</h3>
            <div className="dropzone-or">OR</div>

            {/* hidden input */}
            <input
              type="file"
              accept="image/*"
              id="fileUpload"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* FIXED BUTTON (GREEN + CLICKABLE) */}
            <button
              className="btn-select"
              onClick={() => document.getElementById("fileUpload").click()}
            >
              Browse File
            </button>

            <div className="dropzone-hint">
              Only image files are supported
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {preview && (
          <div className="dash-card">
            <img src={preview} alt="preview" className="preview-img" />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-analyze"
                onClick={analyzeWaste}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Waste"}
              </button>

              <button
                className="btn-select"
                style={{ background: "#ef4444" }}
                onClick={removeFile}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div className="result-card">
            <div className="result-title">Analysis Result</div>

            <div className="result-type">
              {result.emoji} {result.name}
            </div>

            <div className="result-conf">
              Confidence: <b>{result.confidence}%</b>
            </div>

            <div className="result-disposal">
              <b>Disposal Instructions:</b> {result.instructions}
            </div>

            <div className="result-points">
              +{result.points} points earned
            </div>
          </div>
        )}

      </div>
    </div>
  );
}