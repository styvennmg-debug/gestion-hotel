
import { useState } from "react";
import "./Login.css";

const API_BASE_URL =
  "https://gestion-hotel-backend-x1st.onrender.com/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      // 1. Demander le jeton CSRF à Django.
      const csrfResponse = await fetch(
        `${API_BASE_URL}/csrf/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!csrfResponse.ok) {
        throw new Error(
          "Impossible de préparer la connexion sécurisée."
        );
      }

      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;

      if (!csrfToken) {
        throw new Error(
          "Django n'a pas fourni le jeton CSRF."
        );
      }

      // 2. Envoyer les identifiants à Django.
      const response = await fetch(
        `${API_BASE_URL}/login/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            data.detail ||
            "Nom d'utilisateur ou mot de passe incorrect."
        );
        return;
      }

      // 3. Conserver uniquement les informations utilisateur.
      // La session est conservée dans le cookie Django.
      localStorage.setItem(
        "hotelUser",
        JSON.stringify(data.user)
      );

      if (onLogin) {
        onLogin(data.user);
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);

      setError(
        err.message ||
          "Impossible de contacter le serveur Django."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-logo">H</div>
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
            Tantano ny hotelinao
            <br />
            <span>ho voaharamaso</span>
          </h2>

          <p>
            Une solution moderne pour gérer
            vos chambres, clients, réservations
            et paiements depuis une seule interface.
          </p>

          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Gestion des chambres</strong>
                <span>
                  Disponibilité et occupation en temps réel
                </span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Gestion des clients</strong>
                <span>
                  Centralisez toutes les informations clients
                </span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Réservations et paiements</strong>
                <span>
                  Suivez facilement les opérations de votre hôtel
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer"></div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="mobile-logo">
            <div className="brand-logo">H</div>
            <div>
              <h1>HOTEL</h1>
              <span>Management</span>
            </div>
          </div>

          <div className="login-header">
            <span className="login-small-title">
              ESPACE ADMINISTRATEUR
            </span>

            <h2>Tongasoa</h2>

            <p>
              Connectez-vous à votre espace de gestion.
            </p>
          </div>

          {error && (
            <div className="login-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom d'utilisateur</label>

              <div className="input-wrapper">
                <span className="input-icon">♙</span>

                <input
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label">
                <label>Mot de passe</label>
              </div>

              <div className="input-wrapper">
                <span className="input-icon">●</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                >
                  {showPassword ? "◉" : "◌"}
                </button>
              </div>
            </div>

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
            <span></span>
            <p>Connexion sécurisée par Django</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
