import { useState } from "react";
import "./Settings.css";

function Settings() {
  const [hotel, setHotel] = useState({
    nom: "Hotel Management",
    email: "contact@hotel.com",
    telephone: "+261 34 00 000 00",
    adresse: "Antananarivo, Madagascar",
    description: "Gestion professionnelle de l'établissement hôtelier.",
  });

  const [preferences, setPreferences] = useState({
    devise: "Ar",
    langue: "Français",
    dureeMax: "30",
    notifications: true,
    confirmation: true,
  });

  const [saved, setSaved] = useState(false);

  const handleHotelChange = (e) => {
    const { name, value } = e.target;

    setHotel({
      ...hotel,
      [name]: value,
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;

    setPreferences({
      ...preferences,
      [name]: value,
    });
  };

  const toggleNotification = () => {
    setPreferences({
      ...preferences,
      notifications: !preferences.notifications,
    });
  };

  const toggleConfirmation = () => {
    setPreferences({
      ...preferences,
      confirmation: !preferences.confirmation,
    });
  };

  const handleSave = () => {
    localStorage.setItem(
      "hotelSettings",
      JSON.stringify({
        hotel,
        preferences,
      })
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleReset = () => {
    setHotel({
      nom: "Hotel Management",
      email: "contact@hotel.com",
      telephone: "+261 34 00 000 00",
      adresse: "Antananarivo, Madagascar",
      description: "Gestion professionnelle de l'établissement hôtelier.",
    });

    setPreferences({
      devise: "Ar",
      langue: "Français",
      dureeMax: "30",
      notifications: true,
      confirmation: true,
    });
  };

  return (
    <div className="settings-page">

      {/* HEADER */}

      <div className="settings-header">

        <div>
          <h1>Paramètres</h1>
          <p>
            Configurez les paramètres de votre établissement
          </p>
        </div>

        {saved && (
          <div className="save-message">
            ✓ Paramètres enregistrés
          </div>
        )}

      </div>

      {/* INFORMATIONS HÔTEL */}

      <div className="settings-section">

        <div className="section-title">
          <div className="section-icon blue-icon">
            🏨
          </div>

          <div>
            <h2>Informations de l'hôtel</h2>
            <p>
              Informations générales de votre établissement
            </p>
          </div>
        </div>

        <div className="settings-form">

          <div className="form-group">
            <label>Nom de l'hôtel</label>

            <input
              type="text"
              name="nom"
              value={hotel.nom}
              onChange={handleHotelChange}
              placeholder="Nom de l'hôtel"
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={hotel.email}
              onChange={handleHotelChange}
              placeholder="Email"
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>

            <input
              type="text"
              name="telephone"
              value={hotel.telephone}
              onChange={handleHotelChange}
              placeholder="Téléphone"
            />
          </div>

          <div className="form-group">
            <label>Adresse</label>

            <input
              type="text"
              name="adresse"
              value={hotel.adresse}
              onChange={handleHotelChange}
              placeholder="Adresse"
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>

            <textarea
              name="description"
              value={hotel.description}
              onChange={handleHotelChange}
              rows="4"
              placeholder="Description de l'établissement"
            ></textarea>
          </div>

        </div>

      </div>

      {/* PRÉFÉRENCES */}

      <div className="settings-section">

        <div className="section-title">
          <div className="section-icon purple-icon">
            ⚙
          </div>

          <div>
            <h2>Préférences</h2>
            <p>
              Configurez le comportement général de l'application
            </p>
          </div>
        </div>

        <div className="settings-form">

          <div className="form-group">
            <label>Devise</label>

            <select
              name="devise"
              value={preferences.devise}
              onChange={handlePreferenceChange}
            >
              <option value="Ar">Ariary (Ar)</option>
              <option value="€">Euro (€)</option>
              <option value="$">Dollar ($)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Langue</label>

            <select
              name="langue"
              value={preferences.langue}
              onChange={handlePreferenceChange}
            >
              <option value="Français">Français</option>
              <option value="English">English</option>
              <option value="Malagasy">Malagasy</option>
            </select>
          </div>

          <div className="form-group">
            <label>Durée maximale du séjour</label>

            <div className="input-with-unit">
              <input
                type="number"
                name="dureeMax"
                value={preferences.dureeMax}
                onChange={handlePreferenceChange}
                min="1"
              />

              <span>jours</span>
            </div>
          </div>

        </div>

      </div>

      {/* NOTIFICATIONS */}

      <div className="settings-section">

        <div className="section-title">
          <div className="section-icon orange-icon">
            🔔
          </div>

          <div>
            <h2>Notifications</h2>
            <p>
              Gérez les notifications du système
            </p>
          </div>
        </div>

        <div className="settings-options">

          <div className="setting-option">

            <div>
              <strong>Notifications générales</strong>

              <span>
                Recevoir les alertes importantes du système
              </span>
            </div>

            <button
              type="button"
              className={`toggle ${
                preferences.notifications ? "active" : ""
              }`}
              onClick={toggleNotification}
            >
              <span></span>
            </button>

          </div>

          <div className="setting-option">

            <div>
              <strong>Confirmation des réservations</strong>

              <span>
                Afficher une confirmation après une réservation
              </span>
            </div>

            <button
              type="button"
              className={`toggle ${
                preferences.confirmation ? "active" : ""
              }`}
              onClick={toggleConfirmation}
            >
              <span></span>
            </button>

          </div>

        </div>

      </div>

      {/* ACTIONS */}

      <div className="settings-actions">

        <button
          type="button"
          className="reset-button"
          onClick={handleReset}
        >
          Réinitialiser
        </button>

        <button
          type="button"
          className="save-button"
          onClick={handleSave}
        >
          ✓ Enregistrer les modifications
        </button>

      </div>

    </div>
  );
}

export default Settings;