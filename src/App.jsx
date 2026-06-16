// src/App.jsx
import { useState } from "react";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import IdentifyPage from "./pages/IdentifyPage";
import DashboardPage from "./pages/DashboardPage";
import LocalInfoPage from "./pages/LocalInfoPage";
import AboutPage from "./pages/AboutPage";
import { getCurrentUser, logoutUser } from "./utils/auth";

export default function App() {
  // Restore session from localStorage on page refresh
  const [user, setUser] = useState(() => getCurrentUser());
  const [screen, setScreen] = useState(() => getCurrentUser() ? "app" : "login");
  const [activePage, setActivePage] = useState("Identify");

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen("app");
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setScreen("login");
  };

  const renderPage = () => {
    if (activePage === "Identify")     return <IdentifyPage />;
    if (activePage === "My Dashboard") return <DashboardPage user={user} />;
    if (activePage === "Local Info")   return <LocalInfoPage />;
    if (activePage === "About")        return <AboutPage />;
    return <HomePage setPage={setActivePage} />;
  };

  // 🔐 AUTH FLOW
  if (screen === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setScreen("register")}
      />
    );
  }

  if (screen === "register") {
    return (
      <RegisterPage
        onLogin={handleLogin}
        onGoLogin={() => setScreen("login")}
      />
    );
  }

  // 🧭 MAIN APP
  return (
    <>
      <Navbar
        activePage={activePage}
        setPage={setActivePage}
        onLogout={handleLogout}
      />
      {renderPage()}
    </>
  );
}