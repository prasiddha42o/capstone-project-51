import { useState } from "react";
import { getCategoryInfo } from "../data/wasteCategories";

const API_BASE = "http://localhost:3001/api";
const ML_API_BASE = "http://localhost:8000";

export default function IdentifyPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const analyzeWaste = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Send image to the FastAPI model service
      const formData = new FormData();
      formData.append("file", file);

      const mlResponse = await fetch(`${ML_API_BASE}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!mlResponse.ok) {
        const errData = await mlResponse.json().catch(() => ({}));
        throw new Error(errData.detail || "Model service failed to analyze the image.");
      }

      const prediction = await mlResponse.json();
      // prediction = { predicted_class, confidence, top3 }

      const categoryInfo = getCategoryInfo(prediction.predicted_class);

      const finalResult = {
        name: categoryInfo.name,
        confidence: Math.round(prediction.confidence * 100),
        points: categoryInfo.points,
        instructions: categoryInfo.instructions,
        emoji: categoryInfo.emoji,
        type: categoryInfo.type,
        weight: "N/A",
        top3: prediction.top3,
      };

      setResult(finalResult);
      setLoading(false);

      // 2. Log the result + award points via the Node/Express backend
      const user = JSON.parse(localStorage.getItem("wa_user"));

      await fetch(`${API_BASE}/dashboard/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          result: finalResult,
        }),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong analyzing the image.");
      setLoading(false);
    }
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

            <input
              type="file"
              accept="image/*"
              id="fileUpload"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

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
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="result-card" style={{ borderColor: "#ef4444" }}>
            <div className="result-title" style={{ color: "#ef4444" }}>
              Analysis Failed
            </div>
            <p>{error}</p>
            <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Make sure the model service is running at {ML_API_BASE}.
            </p>
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