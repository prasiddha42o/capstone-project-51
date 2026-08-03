import { useEffect, useState } from "react";
import { RecycleIcon, ChevronDown, StarIcon } from "../components/Icons";
import { API_BASE } from "../config";

export default function KnowledgeBasePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/knowledge-base`);
        if (!res.ok) throw new Error("Failed to load the knowledge base");
        const data = await res.json();
        if (!cancelled) setCategories(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Server not reachable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="page">
      <div className="page-inner">
        <div className="kb-header">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
            <RecycleIcon size={34} />
            <h1 style={{ margin: 0 }}>Disposal Guidance Knowledge Base</h1>
          </div>
          <p>
            Step-by-step disposal instructions for every waste category --
            browse anytime, no photo required.
          </p>
        </div>

        {loading && <p className="kb-status">Loading knowledge base...</p>}
        {error && <p className="kb-status kb-status-error">{error}</p>}

        <div className="kb-grid">
          {categories.map((category) => {
            const isOpen = expandedId === category.id;
            return (
              <div
                key={category.id}
                className="kb-card"
                style={{ borderLeftColor: category.color }}
              >
                <button
                  type="button"
                  className="kb-card-header"
                  onClick={() => toggle(category.id)}
                  aria-expanded={isOpen}
                >
                  <span className="kb-card-emoji">{category.emoji}</span>
                  <span className="kb-card-title">
                    <span className="kb-card-name">{category.name}</span>
                    <span className="kb-card-summary">{category.instructions}</span>
                  </span>
                  <span className="kb-card-points">
                    <StarIcon /> +{category.points}
                  </span>
                  <span className={`kb-chevron${isOpen ? " kb-chevron-open" : ""}`}>
                    <ChevronDown />
                  </span>
                </button>

                {isOpen && (
                  <ol className="kb-steps">
                    {category.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
