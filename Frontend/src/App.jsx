import { useState } from "react";

import Sidebar from "./components/sidebar";

import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Clients from "./pages/Clients";
import Reservations from "./pages/Reservations";
import Payments from "./pages/Payments";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("hotelLoggedIn") === "true"
  );

  const [activePage, setActivePage] =
    useState("dashboard");


  const handleLogin = () => {

    setIsLoggedIn(true);

    setActivePage("dashboard");

  };


  const handleLogout = () => {

    localStorage.removeItem("hotelLoggedIn");

    localStorage.removeItem("hotelToken");

    localStorage.removeItem("hotelUser");

    setIsLoggedIn(false);

    setActivePage("dashboard");

  };


  if (!isLoggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }


  const renderPage = () => {

    switch (activePage) {

      case "dashboard":
        return <Dashboard />;

      case "chambres":
        return <Rooms />;

      case "clients":
        return <Clients />;

      case "reservations":
        return <Reservations />;

      case "paiements":
        return <Payments />;

      case "statistiques":
        return <Statistics />;

      case "parametres":
        return <Settings />;

      default:
        return <Dashboard />;

    }

  };


  return (
    <div className="app">

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {renderPage()}
      </main>

    </div>
  );
}

export default App;