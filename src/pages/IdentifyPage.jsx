import { useState, useRef } from "react";
import { UploadIcon, ScanIcon, StarIcon, InfoIcon } from "../components/Icons";

export default function IdentifyPage() {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const mockAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        type: "PET Plastic Bottle",
        confidence: 94,
        disposal:
          "Rinse thoroughly, remove cap and label, flatten if possible. Place in the blue recycling bin. Can be recycled into new bottles, fiber, or packaging materials.",
        points: 10,
      });
    }, 1800);
  };

  return (
    <div className="page">
      <div className="page-inner">
        <div className="identify-header">
          <h1>AI Waste Identification Hub</h1>
          <p>Upload an image to identify waste type with AI-powered analysis</p>
          <div className="ai-badge">✦ AI-powered</div>
        </div>

        <div className="guidelines-card">
          <div className="guidelines-card-header">
            <div className="guidelines-title"><InfoIcon /> Image Capture Guidelines</div>
          </div>
          <ul className="guidelines-list">
            <li><strong>Plain background:</strong> Place item on a solid, contrasting surface</li>
            <li><strong>Good lighting:</strong> Ensure bright, even lighting without shadows</li>
            <li><strong>Avoid reflections:</strong> Minimize glare on glass or shiny surfaces</li>
            <li><strong>Flatten objects:</strong> Unwrap and flatten items like wrappers</li>
            <li><strong>One item only:</strong> Scan one waste item at a time</li>
            <li><strong>Clear focus:</strong> Hold camera steady and ensure object is in focus</li>
          </ul>
        </div>

        {!preview ? (
          <div
            className={`dropzone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
          >
            <div className="dropzone-icon"><UploadIcon /></div>
            <h3>Drag and Drop Waste Image Here</h3>
            <p className="dropzone-or">or</p>
            <button className="btn-select" onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>
              Select File
            </button>
            <p className="dropzone-hint">Supports JPG, PNG, WEBP (Max size: 10MB)</p>
            <input
              ref={fileRef} type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div style={{ textAlign: "center", border: "1.5px solid var(--gray-200)", borderRadius: 14, padding: "24px 20px" }}>
            <img src={preview} className="preview-img" alt="preview" />
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-analyze" onClick={mockAnalyze} disabled={analyzing}>
                {analyzing ? "⏳ Analyzing…" : <><ScanIcon /> Analyze Waste</>}
              </button>
              <button
                style={{ padding: "11px 20px", border: "1.5px solid var(--gray-300)", borderRadius: 9, background: "var(--white)", cursor: "pointer", fontSize: 14 }}
                onClick={() => { setPreview(null); setResult(null); }}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="result-title">✦ Identification Result</div>
            <div className="result-type">{result.type}</div>
            <div className="result-conf">Confidence: {result.confidence}%</div>
            <div className="result-disposal">
              <strong>Disposal Instructions:</strong><br />{result.disposal}
            </div>
            <div className="result-points"><StarIcon /> +{result.points} points earned!</div>
          </div>
        )}
      </div>
    </div>
  );
}