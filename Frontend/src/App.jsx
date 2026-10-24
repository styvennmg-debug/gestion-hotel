
import { useState, useEffect } from "react";

import Sidebar from "./components/sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Clients from "./pages/Clients";
import Reservations from "./pages/Reservations";
import Payments from "./pages/Payments";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";

const API_BASE_URL =
  "https://gestion-hotel-backend-x1st.onrender.com/api";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hotelUser")) || null;
    } catch {
      return null;
    }
  });

  // Vérifier la session Django au démarrage
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const csrfResponse = await fetch(`${API_BASE_URL}/csrf/`, {
          method: "GET",
          credentials: "include",
        });

        if (!csrfResponse.ok) {
          throw new Error("Impossible de contacter Django.");
        }

        const response = await fetch(`${API_BASE_URL}/chambres/`, {
          method: "GET",
          credentials: "include",
        });

        if (cancelled) return;

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem("hotelUser");
        }
      } catch (error) {
        console.error("Vérification de session :", error);

        if (!cancelled) {
          setIsLoggedIn(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Appelée après une connexion réussie
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser || null);
    setIsLoggedIn(true);
  };

  // Déconnexion de la session Django
  const handleLogout = async () => {
    try {
      const csrfResponse = await fetch(`${API_BASE_URL}/csrf/`, {
        method: "GET",
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Impossible de récupérer le jeton CSRF.");
      }

      const csrfData = await csrfResponse.json();

      if (!csrfData.csrfToken) {
        throw new Error("Jeton CSRF manquant.");
      }

      const response = await fetch(`${API_BASE_URL}/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfData.csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error("La déconnexion côté serveur a échoué.");
      }
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    } finally {
      localStorage.removeItem("hotelUser");
      setUser(null);
      setIsLoggedIn(false);
      setActivePage("dashboard");
    }
  };

  // Affichage des pages
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

  if (checkingSession) {
    return (
      <div className="session-loading">
        Vérification de la session...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

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
