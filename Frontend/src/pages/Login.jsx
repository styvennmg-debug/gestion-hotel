import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Vérification des champs
    if (!username.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login/", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Nom d'utilisateur ou mot de passe incorrect."
        );

        setLoading(false);
        return;
      }

      // Enregistrer le token
      localStorage.setItem(
        "hotelToken",
        data.token
      );

      // Enregistrer les informations utilisateur
      localStorage.setItem(
        "hotelUser",
        JSON.stringify(data.user)
      );

      // Indiquer que l'utilisateur est connecté
      localStorage.setItem(
        "hotelLoggedIn",
        "true"
      );

      setLoading(false);

      // Retour vers App.jsx
      if (onLogin) {
        onLogin();
      }

  //   } catch (error) {
  //     console.error(error);

  //     setError(
  //       "Impossible de contacter le serveur Django."
  //     );

  //     setLoading(false);
  //   }
  // };

  return (
    <div className="login-page">

      {/* =========================
          PARTIE GAUCHE
      ========================== */}

      <div className="login-left">

        <div className="login-brand">

          <div className="brand-logo">
            H
          </div>

          <div>
            <h1>HOTEL</h1>
            <span>Management</span>
          </div>

        </div>


        <div className="login-presentation">

          <span className="welcome-badge">
            ✦ Système de gestion hôtelier
          </span>

          <h2>
            Gérez votre hôtel
            <br />
            <span>simplement.</span>
          </h2>

          <p>
            Une solution moderne pour gérer
            vos chambres, clients, réservations
            et paiements depuis une seule interface.
          </p>


          <div className="login-features">

            <div className="feature-item">

              <div className="feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Gestion des chambres
                </strong>

                <span>
                  Disponibilité et occupation
                  en temps réel
                </span>
              </div>

            </div>


            <div className="feature-item">

              <div className="feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Gestion des clients
                </strong>

                <span>
                  Centralisez toutes les
                  informations clients
                </span>
              </div>

            </div>


            <div className="feature-item">

              <div className="feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Réservations et paiements
                </strong>

                <span>
                  Suivez facilement les opérations
                  de votre hôtel
                </span>
              </div>

            </div>

          </div>

        </div>


        <div className="login-footer">
          © 2026 Hotel Management
        </div>

      </div>


      {/* =========================
          PARTIE DROITE
      ========================== */}

      <div className="login-right">

        <div className="login-card">

          <div className="mobile-logo">

            <div className="brand-logo">
              H
            </div>

            <div>
              <h1>HOTEL</h1>
              <span>Management</span>
            </div>

          </div>


          <div className="login-header">

            <span className="login-small-title">
              ESPACE ADMINISTRATEUR
            </span>

            <h2>
              Bienvenue 
            </h2>

            <p>
              Connectez-vous à votre espace
              de gestion.
            </p>

          </div>


          {/* ERREUR */}

          {error && (

            <div className="login-error">
              <span>!</span>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* FORMULAIRE */}

          <form onSubmit={handleSubmit}>

            {/* USERNAME */}

            <div className="form-group">

              <label>
                Nom d'utilisateur
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ♙
                </span>

                <input
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="username"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <div className="password-label">

                <label>
                  Mot de passe
                </label>

              </div>


              <div className="input-wrapper">

                <span className="input-icon">
                  ●
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="current-password"
                />


                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "◉"
                    : "◌"}
                </button>

              </div>

            </div>


            {/* BOUTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          <div className="login-security">

            <span>🔒</span>

            <p>
              Connexion sécurisée par Django
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;