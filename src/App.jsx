import { useState } from "react";

import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import IdentifyPage from "./pages/IdentifyPage";
import DashboardPage from "./pages/DashboardPage";
import LocalInfoPage from "./pages/LocalInfoPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [activePage, setActivePage] = useState("Identify");

  const renderPage = () => {
    if (activePage === "Identify") return <IdentifyPage />;
    if (activePage === "My Dashboard") return <DashboardPage />;
    if (activePage === "Local Info") return <LocalInfoPage />;
    if (activePage === "About") return <AboutPage />;
    return <HomePage setPage={setActivePage} />;
  };

  // 🔐 AUTH FLOW
  if (screen === "login") {
    return (
      <LoginPage
        onLogin={() => setScreen("app")}
        onGoRegister={() => setScreen("register")}
      />
    );
  }

  if (screen === "register") {
    return (
      <RegisterPage
        onLogin={() => setScreen("app")}
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
        onLogout={() => setScreen("login")}
      />
      {renderPage()}
    </>
  );
}