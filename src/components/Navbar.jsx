import { LeafIcon, LogoutIcon } from "./Icons";

export default function Navbar({ activePage, setPage, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <LeafIcon size={18} />
        Waste Assistant Nepal
      </div>
      <div className="nav-links">
        {["Identify", "My Dashboard", "Local Info", "About"].map((p) => (
          <button
            key={p}
            className={`nav-link${activePage === p ? " active" : ""}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
        <button className="btn-logout" onClick={onLogout}>
          <LogoutIcon /> Logout
        </button>
      </div>
    </nav>
  );
}