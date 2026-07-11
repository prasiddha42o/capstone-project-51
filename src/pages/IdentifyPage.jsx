import { useState } from "react";
import { getCategoryInfo } from "../data/wasteCategories";
import { supabase } from "../supabaseClient";

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
      
      // Defensively handle category matching
      const predictedClass = (prediction.predicted_class || "").toLowerCase();
      const categoryInfo = getCategoryInfo(predictedClass);

      const finalResult = {
        name: categoryInfo.name || "Unknown",
        confidence: Math.round((prediction.confidence || 0) * 100),
        points: categoryInfo.points || 0,
        instructions: categoryInfo.instructions || "Please dispose of responsibly.",
        emoji: categoryInfo.emoji || "♻️",
        type: categoryInfo.type || "general_trash",
        weight: "N/A",
        top3: prediction.top3 || [],
      };

      setResult(finalResult);
      setLoading(false);

      // Log to backend dashboard
      const user = JSON.parse(localStorage.getItem("wa_user"));
      await fetch(`${API_BASE}/dashboard/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          result: finalResult,
        }),
      });

      // Log to Supabase
      try {
        await supabase
          .from("identified_items")
          .insert([
            {
              item_name: finalResult.name,
              category: finalResult.type,
              confidence_score: finalResult.confidence
            }
          ]);
      } catch (supabaseErr) {
        console.warn("Telemetry log skipped:", supabaseErr.message);
      }

    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || "Something went wrong analyzing the image.");
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner">
        <div className="identify-header">
          <h1>AI Waste Identification Hub</h1>
          <p>Upload an image to identify waste type instantly</p>
          <div className="ai-badge">🤖 AI-Powered</div>
        </div>

        <div className="guidelines-card">
          <div className="guidelines-card-header">
            <div className="guidelines-title">📌 Image Capture Guidelines</div>
          </div>
          <ul className="guidelines-list">
            <li>Supported formats: JPG, PNG, JPEG</li>
            <li>Recommended: 720p or higher resolution</li>
            <li>Good lighting improves accuracy</li>
          </ul>
        </div>

        {!file && (
          <div className="dropzone" onClick={() => document.getElementById("fileUpload").click()}>
            <div className="dropzone-icon">📤</div>
            <h3>Drag and Drop Waste Image Here</h3>
            <div className="dropzone-or">OR</div>
            <input type="file" accept="image/*" id="fileUpload" onChange={handleFileChange} style={{ display: "none" }} />
            <button className="btn-select">Browse File</button>
            <div className="dropzone-hint">Only image files are supported</div>
          </div>
        )}

        {preview && (
          <div className="dash-card">
            <img src={preview} alt="preview" className="preview-img" />
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-analyze" onClick={analyzeWaste} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze Waste"}
              </button>
              <button className="btn-select" style={{ background: "#ef4444" }} onClick={removeFile} disabled={loading}>
                Remove
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="result-card" style={{ borderColor: "#ef4444", background: "#fef2f2" }}>
            <div className="result-title" style={{ color: "#ef4444" }}>Analysis Failed</div>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="result-title">Analysis Result</div>
            <div className="result-type">{result.emoji} {result.name}</div>
            <div className="result-conf">Confidence: <b>{result.confidence}%</b></div>
            <div className="result-disposal"><b>Disposal Instructions:</b> {result.instructions}</div>
            <div className="result-points">+{result.points} points earned</div>
          </div>
        )}
      </div>
    </div>
  );
}
