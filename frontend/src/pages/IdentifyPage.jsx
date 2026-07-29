import { useState } from "react";
import { API_BASE } from "../config";

export default function IdentifyPage({
  user,
  file, setFile,
  preview, setPreview,
  result, setResult,
  error, setError,
}) {
  const [loading, setLoading] = useState(false);

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
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const url = user?.id
        ? `${API_BASE}/predict?user_id=${user.id}`
        : `${API_BASE}/predict`;

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Server not reachable");
    } finally {
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
            <div className="guidelines-title">Image Capture Guidelines</div>
          </div>
          <ul className="guidelines-list">
            <li>Supported formats: JPG, PNG, JPEG</li>
            <li>Plain background improves accuracy</li>
            <li>Good lighting improves accuracy</li>
          </ul>
        </div>

        {!file && (
          <div className="dropzone" onClick={() => document.getElementById("fileUpload")?.click()}>
            <div className="dropzone-icon">📤</div>
            <h3>Drag and Drop Waste Image Here</h3>
            <div className="dropzone-or">OR</div>
            <input type="file" accept="image/*" id="fileUpload" onChange={handleFileChange} style={{ display: "none" }} />
            <button className="btn-select" type="button">
              Select File
            </button>
            <div className="dropzone-hint">Only image files are supported</div>
          </div>
        )}

        {preview && (
          <div className="dash-card">
            <img src={preview} alt="preview" className="preview-img" />
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button className="btn-analyze" onClick={analyzeWaste} disabled={loading} type="button">
                {loading ? "Analyzing..." : "Analyze Waste"}
              </button>
              <button className="btn-select" onClick={removeFile} type="button">
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
          <div className="result-card" style={{ marginTop: "20px" }}>
            <div className="result-title">{result.emoji} {result.name}</div>
            <p>{result.confidence}% confidence</p>
            <p>{result.points} points earned</p>
            <div style={{ marginTop: "12px" }}>
              <h3>Disposal Instructions</h3>
              <div>
                {result.steps?.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <strong>{i + 1}.</strong>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
