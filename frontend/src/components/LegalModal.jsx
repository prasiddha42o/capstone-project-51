import { useEffect } from "react";
import { CloseIcon } from "./Icons";

export default function LegalModal({ title, sections, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close-btn" aria-label="Dismiss" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          {sections.map((section) => (
            <div key={section.heading} className="modal-section">
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
