import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [chambres, setChambres] = useState([]);
  const [clients, setClients] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // RECUPERATION DES DONNEES
  // =====================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        chambresResponse,
        clientsResponse,
        reservationsResponse
      ] = await Promise.all([
        apiGet("/chambres/"),
        apiGet("/clients/"),
        apiGet("/reservations/")
      ]);

      // Django REST Framework peut retourner :
      // soit directement un tableau []
      // soit { results: [] }

      const chambresData = Array.isArray(chambresResponse)
        ? chambresResponse
        : chambresResponse?.results || [];

      const clientsData = Array.isArray(clientsResponse)
        ? clientsResponse
        : clientsResponse?.results || [];

      const reservationsData = Array.isArray(reservationsResponse)
        ? reservationsResponse
        : reservationsResponse?.results || [];

      setChambres(chambresData);
      setClients(clientsData);
      setReservations(reservationsData);

    } catch (err) {
      console.error("Erreur Dashboard :", err);

      setError(
        err.message ||
        "Impossible de récupérer les données."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHARGEMENT AU DEMARRAGE
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // STATISTIQUES CHAMBRES
  // =====================================================

  const totalChambres = chambres.length;

  const chambresDisponibles = chambres.filter(
    (chambre) => chambre.statut === "disponible"
  ).length;

  const chambresOccupees = chambres.filter(
    (chambre) => chambre.statut === "occupee"
  ).length;

  const chambresMaintenance = chambres.filter(
    (chambre) => chambre.statut === "maintenance"
  ).length;

  // =====================================================
  // STATISTIQUES RESERVATIONS
  // =====================================================

  const totalReservations = reservations.length;

  const reservationsConfirmees = reservations.filter(
    (reservation) => reservation.statut === "confirmee"
  ).length;

  const reservationsAttente = reservations.filter(
    (reservation) => reservation.statut === "en_attente"
  ).length;

  const reservationsAnnulees = reservations.filter(
    (reservation) => reservation.statut === "annulee"
  ).length;

  const reservationsTerminees = reservations.filter(
    (reservation) => reservation.statut === "terminee"
  ).length;

  // =====================================================
  // TAUX D'OCCUPATION
  // =====================================================

  const tauxOccupation =
    totalChambres > 0
      ? Math.round(
          (chambresOccupees / totalChambres) * 100
        )
      : 0;

  // =====================================================
  // FORMATAGE DES DATES
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("fr-FR");
  };

  // =====================================================
  // FORMATAGE DES PRIX
  // =====================================================

  const formatPrix = (prix) => {
    if (prix === undefined || prix === null) {
      return "0 Ar";
    }

    return `${Number(prix).toLocaleString("fr-FR")} Ar`;
  };

  // =====================================================
  // NOM DU CLIENT
  // =====================================================

  const getClientName = (reservation) => {
    if (reservation.client_nom) {
      return reservation.client_nom;
    }

    const client = clients.find(
      (item) => item.id === reservation.client
    );

    if (!client) {
      return "Client inconnu";
    }

    return `${client.prenom || ""} ${client.nom || ""}`.trim();
  };

  // =====================================================
  // NUMERO DE CHAMBRE
  // =====================================================

  const getRoomNumber = (reservation) => {
    if (reservation.chambre_numero) {
      return reservation.chambre_numero;
    }

    const chambre = chambres.find(
      (item) => item.id === reservation.chambre
    );

    return chambre
      ? chambre.numero
      : "Chambre inconnue";
  };

  // =====================================================
  // COULEUR / LABEL STATUT
  // =====================================================

  const getStatusLabel = (statut) => {
    switch (statut) {
      case "confirmee":
        return "Confirmée";

      case "en_attente":
        return "En attente";

      case "annulee":
        return "Annulée";

      case "terminee":
        return "Terminée";

      default:
        return statut || "Inconnu";
    }
  };

  const getStatusClass = (statut) => {
    switch (statut) {
      case "confirmee":
        return "status-confirmed";

      case "en_attente":
        return "status-pending";

      case "annulee":
        return "status-cancelled";

      case "terminee":
        return "status-finished";

      default:
        return "status-default";
    }
  };

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <h3>Chargement du tableau de bord...</h3>

          <p>
            Récupération des données de l'hôtel
          </p>
        </div>

      </div>
    );
  }

  // =====================================================
  // ERREUR
  // =====================================================

  if (error) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">

          <div>
            <span className="dashboard-label">
              GESTION DE L'HÔTEL
            </span>

            <h1>Tableau de bord</h1>

            <p>
              Vue générale de votre établissement
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={loadDashboard}
          >
            ↻ Réessayer
          </button>

        </div>

        <div className="dashboard-error">

          <div className="error-icon">
            !
          </div>

          <h2>Impossible de récupérer les données</h2>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={loadDashboard}
          >
            Réessayer
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>

          <span className="dashboard-label">
            GESTION DE L'HÔTEL
          </span>

          <h1>
            Tableau de bord
          </h1>

          <p>
            Bienvenue dans votre espace de gestion
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={loadDashboard}
        >
          ↻ Actualiser
        </button>

      </div>

      {/* =================================================
          CARTES PRINCIPALES
      ================================================= */}

      <div className="stats-grid">

        {/* CHAMBRES */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon rooms-icon">
              🛏
            </div>

            <span className="stat-card-title">
              Chambres
            </span>

          </div>

          <div className="stat-value">
            {totalChambres}
          </div>

          <div className="stat-description">
            {chambresDisponibles} disponibles
          </div>

        </div>

        {/* CLIENTS */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon clients-icon">
              👤
            </div>

            <span className="stat-card-title">
              Clients
            </span>

          </div>

          <div className="stat-value">
            {clients.length}
          </div>

          <div className="stat-description">
            Clients enregistrés
          </div>

        </div>

        {/* RESERVATIONS */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon reservations-icon">
              📅
            </div>

            <span className="stat-card-title">
              Réservations
            </span>

          </div>

          <div className="stat-value">
            {totalReservations}
          </div>

          <div className="stat-description">
            {reservationsConfirmees} confirmées
          </div>

        </div>

        {/* OCCUPATION */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon occupation-icon">
              ◉
            </div>

            <span className="stat-card-title">
              Occupation
            </span>

          </div>

          <div className="stat-value">
            {tauxOccupation}%
          </div>

          <div className="stat-description">
            Taux d'occupation
          </div>

        </div>

      </div>

      {/* =================================================
          CONTENU PRINCIPAL
      ================================================= */}

      <div className="dashboard-columns">

        {/* =================================================
            ETAT DES CHAMBRES
        ================================================= */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                État des chambres
              </h2>

              <p>
                Situation actuelle des chambres
              </p>

            </div>

          </div>

          <div className="room-status-list">

            <div className="room-status-item">

              <div className="room-status-left">

                <span className="status-dot available"></span>

                <span>
                  Disponibles
                </span>

              </div>

              <strong>
                {chambresDisponibles}
              </strong>

            </div>

            <div className="room-status-item">

              <div className="room-status-left">

                <span className="status-dot occupied"></span>

                <span>
                  Occupées
                </span>

              </div>

              <strong>
                {chambresOccupees}
              </strong>

            </div>

            <div className="room-status-item">

              <div className="room-status-left">

                <span className="status-dot maintenance"></span>

                <span>
                  Maintenance
                </span>

              </div>

              <strong>
                {chambresMaintenance}
              </strong>

            </div>

          </div>

          {/* BARRE OCCUPATION */}

          <div className="occupation-section">

            <div className="occupation-header">

              <span>
                Taux d'occupation
              </span>

              <strong>
                {tauxOccupation}%
              </strong>

            </div>

            <div className="progress-bar">

              <div
                className="progress-value"
                style={{
                  width: `${tauxOccupation}%`
                }}
              ></div>

            </div>

          </div>

        </div>

        {/* =================================================
            RESERVATIONS
        ================================================= */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                État des réservations
              </h2>

              <p>
                Répartition des réservations
              </p>

            </div>

          </div>

          <div className="reservation-status-list">

            <div className="reservation-status">

              <span>
                Confirmées
              </span>

              <strong>
                {reservationsConfirmees}
              </strong>

            </div>

            <div className="reservation-status">

              <span>
                En attente
              </span>

              <strong>
                {reservationsAttente}
              </strong>

            </div>

            <div className="reservation-status">

              <span>
                Terminées
              </span>

              <strong>
                {reservationsTerminees}
              </strong>

            </div>

            <div className="reservation-status">

              <span>
                Annulées
              </span>

              <strong>
                {reservationsAnnulees}
              </strong>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          RESERVATIONS RECENTES
      ================================================= */}

      <div className="dashboard-card recent-card">

        <div className="card-header">

          <div>

            <h2>
              Réservations récentes
            </h2>

            <p>
              Les dernières réservations enregistrées
            </p>

          </div>

        </div>

        {reservations.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              📅
            </div>

            <h3>
              Aucune réservation
            </h3>

            <p>
              Les nouvelles réservations apparaîtront ici.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table className="dashboard-table">

              <thead>

                <tr>

                  <th>
                    Client
                  </th>

                  <th>
                    Chambre
                  </th>

                  <th>
                    Arrivée
                  </th>

                  <th>
                    Départ
                  </th>

                  <th>
                    Personnes
                  </th>

                  <th>
                    Statut
                  </th>

                </tr>

              </thead>

              <tbody>

                {reservations
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((reservation) => (

                    <tr key={reservation.id}>

                      <td>

                        <div className="client-cell">

                          <div className="client-avatar">
                            {(getClientName(reservation)[0] || "C")
                              .toUpperCase()}
                          </div>

                          <span>
                            {getClientName(reservation)}
                          </span>

                        </div>

                      </td>

                      <td>
                        Chambre {getRoomNumber(reservation)}
                      </td>

                      <td>
                        {formatDate(
                          reservation.date_arrivee
                        )}
                      </td>

                      <td>
                        {formatDate(
                          reservation.date_depart
                        )}
                      </td>

                      <td>
                        {reservation.nombre_personnes || 1}
                      </td>

                      <td>

                        <span
                          className={`reservation-status-badge ${getStatusClass(
                            reservation.statut
                          )}`}
                        >
                          {getStatusLabel(
                            reservation.statut
                          )}
                        </span>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =================================================
          INFORMATIONS
      ================================================= */}

      <div className="dashboard-footer-info">

        <div>
          <strong>
            Système de gestion hôtelière
          </strong>

          <span>
            Données synchronisées avec Django
          </span>
        </div>

        <button
          className="small-refresh"
          onClick={loadDashboard}
        >
          ↻ Actualiser les données
        </button>

      </div>

    </div>
  );
}

export default Dashboard;