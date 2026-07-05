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
  const [user, setUser]             = useState(() => getCurrentUser());
  const [screen, setScreen]         = useState(() => getCurrentUser() ? "app" : "login");
  const [activePage, setActivePage] = useState("Identify");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen("app");
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setScreen("login");
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    setRefreshKey((k) => k + 1);
  };

  const renderPage = () => {
    if (activePage === "Identify")     return <IdentifyPage />;
    if (activePage === "My Dashboard") return <DashboardPage user={user} refreshKey={refreshKey} />;
    if (activePage === "Local Info")   return <LocalInfoPage />;
    if (activePage === "About")        return <AboutPage />;
    return <HomePage setPage={handlePageChange} />;
  };

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

  return (
    <>
      <Navbar
        activePage={activePage}
        setPage={handlePageChange}
        onLogout={handleLogout}
      />
      {renderPage()}
    </>
  );
}