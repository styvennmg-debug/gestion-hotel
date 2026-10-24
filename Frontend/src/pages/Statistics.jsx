import { useEffect, useState } from "react";
import "./Statistics.css";

import { apiGet } from "../services/api";

function Statistics() {
  const [chambres, setChambres] = useState([]);
  const [clients, setClients] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // CHARGER LES DONNÉES
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        chambresData,
        clientsData,
        reservationsData,
        paiementsData,
      ] = await Promise.all([
        apiGet("/chambres/"),
        apiGet("/clients/"),
        apiGet("/reservations/"),
        apiGet("/paiements/"),
      ]);

      setChambres(
        Array.isArray(chambresData)
          ? chambresData
          : chambresData?.results || []
      );

      setClients(
        Array.isArray(clientsData)
          ? clientsData
          : clientsData?.results || []
      );

      setReservations(
        Array.isArray(reservationsData)
          ? reservationsData
          : reservationsData?.results || []
      );

      setPaiements(
        Array.isArray(paiementsData)
          ? paiementsData
          : paiementsData?.results || []
      );

    } catch (error) {
      console.error(
        "Erreur statistiques :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // STATISTIQUES CHAMBRES
  // =========================

  const chambresDisponibles =
    chambres.filter(
      (chambre) =>
        chambre.statut === "disponible"
    ).length;

  const chambresOccupees =
    chambres.filter(
      (chambre) =>
        chambre.statut === "occupee"
    ).length;

  const chambresMaintenance =
    chambres.filter(
      (chambre) =>
        chambre.statut === "maintenance"
    ).length;

  // =========================
  // STATISTIQUES RÉSERVATIONS
  // =========================

  const reservationsConfirmees =
    reservations.filter(
      (reservation) =>
        reservation.statut === "confirmee"
    ).length;

  const reservationsAttente =
    reservations.filter(
      (reservation) =>
        reservation.statut === "en_attente"
    ).length;

  const reservationsAnnulees =
    reservations.filter(
      (reservation) =>
        reservation.statut === "annulee"
    ).length;

  const reservationsTerminees =
    reservations.filter(
      (reservation) =>
        reservation.statut === "terminee"
    ).length;

  // =========================
  // STATISTIQUES PAIEMENTS
  // =========================

  const paiementsPayes =
    paiements.filter(
      (paiement) =>
        paiement.statut === "paye"
    );

  const totalPaiements =
    paiementsPayes.reduce(
      (total, paiement) =>
        total +
        Number(paiement.montant || 0),
      0
    );

  const paiementsAttente =
    paiements.filter(
      (paiement) =>
        paiement.statut === "en_attente"
    ).length;

  const paiementsRembourses =
    paiements.filter(
      (paiement) =>
        paiement.statut === "rembourse"
    ).length;

  // =========================
  // TAUX OCCUPATION
  // =========================

  const tauxOccupation =
    chambres.length > 0
      ? Math.round(
          (chambresOccupees /
            chambres.length) *
            100
        )
      : 0;

  // =========================
  // CHARGEMENT
  // =========================

  if (loading) {
    return (
      <div className="statistics-page">

        <div className="statistics-loading">

          <div className="loading-spinner"></div>

          <p>
            Chargement des statistiques...
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // RENDU
  // =========================

  return (
    <div className="statistics-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="statistics-header">

        <div>

          <h1>
            Statistiques
          </h1>

          <p>
            Vue globale de l'activité de l'hôtel
          </p>

        </div>

        <button
          className="refresh-button"
          onClick={loadData}
        >
          ↻ Actualiser
        </button>

      </div>

      {/* =========================
          CARTES PRINCIPALES
      ========================= */}

      <div className="statistics-cards">

        <div className="statistics-card">

          <div className="statistics-icon blue">
            🏨
          </div>

          <div>

            <span>
              Total chambres
            </span>

            <strong>
              {chambres.length}
            </strong>

            <small>
              Chambres enregistrées
            </small>

          </div>

        </div>

        <div className="statistics-card">

          <div className="statistics-icon green">
            ✓
          </div>

          <div>

            <span>
              Disponibles
            </span>

            <strong>
              {chambresDisponibles}
            </strong>

            <small>
              Prêtes à accueillir
            </small>

          </div>

        </div>

        <div className="statistics-card">

          <div className="statistics-icon red">
            ●
          </div>

          <div>

            <span>
              Occupées
            </span>

            <strong>
              {chambresOccupees}
            </strong>

            <small>
              Chambres actuellement occupées
            </small>

          </div>

        </div>

        <div className="statistics-card">

          <div className="statistics-icon purple">
            👥
          </div>

          <div>

            <span>
              Total clients
            </span>

            <strong>
              {clients.length}
            </strong>

            <small>
              Clients enregistrés
            </small>

          </div>

        </div>

      </div>

      {/* =========================
          DEUXIÈME SECTION
      ========================= */}

      <div className="statistics-grid">

        {/* =========================
            OCCUPATION
        ========================= */}

        <div className="statistics-panel">

          <div className="panel-header">

            <div>

              <h2>
                Taux d'occupation
              </h2>

              <p>
                État actuel des chambres
              </p>

            </div>

            <span className="panel-value">
              {tauxOccupation}%
            </span>

          </div>

          <div className="progress-container">

            <div
              className="progress-bar"
              style={{
                width: `${tauxOccupation}%`,
              }}
            ></div>

          </div>

          <div className="legend">

            <div>

              <span className="legend-dot green-dot"></span>

              Disponible

              <strong>
                {chambresDisponibles}
              </strong>

            </div>

            <div>

              <span className="legend-dot red-dot"></span>

              Occupée

              <strong>
                {chambresOccupees}
              </strong>

            </div>

            <div>

              <span className="legend-dot orange-dot"></span>

              Maintenance

              <strong>
                {chambresMaintenance}
              </strong>

            </div>

          </div>

        </div>

        {/* =========================
            REVENUS
        ========================= */}

        <div className="statistics-panel revenue-panel">

          <div className="panel-header">

            <div>

              <h2>
                Revenus
              </h2>

              <p>
                Paiements encaissés
              </p>

            </div>

            <div className="revenue-icon">
              Ar
            </div>

          </div>

          <div className="revenue-value">

            {totalPaiements.toLocaleString(
              "fr-FR"
            )}{" "}
            Ar

          </div>

          <div className="revenue-info">

            <span>
              Paiements effectués
            </span>

            <strong>
              {paiementsPayes.length}
            </strong>

          </div>

          <div className="revenue-info">

            <span>
              En attente
            </span>

            <strong>
              {paiementsAttente}
            </strong>

          </div>

          <div className="revenue-info">

            <span>
              Remboursés
            </span>

            <strong>
              {paiementsRembourses}
            </strong>

          </div>

        </div>

      </div>

      {/* =========================
          RÉSERVATIONS
      ========================= */}

      <div className="statistics-panel reservations-panel">

        <div className="panel-header">

          <div>

            <h2>
              Réservations
            </h2>

            <p>
              Répartition des réservations
            </p>

          </div>

          <span className="total-reservations">
            {reservations.length} total
          </span>

        </div>

        <div className="reservation-bars">

          {/* EN ATTENTE */}

          <div className="reservation-row">

            <div className="reservation-label">

              <span className="status-dot orange-dot"></span>

              En attente

              <strong>
                {reservationsAttente}
              </strong>

            </div>

            <div className="bar-background">

              <div
                className="reservation-bar waiting"
                style={{
                  width: `${
                    reservations.length
                      ? (reservationsAttente /
                          reservations.length) *
                        100
                      : 0
                  }%`,
                }}
              ></div>

            </div>

          </div>

          {/* CONFIRMÉES */}

          <div className="reservation-row">

            <div className="reservation-label">

              <span className="status-dot blue-dot"></span>

              Confirmées

              <strong>
                {reservationsConfirmees}
              </strong>

            </div>

            <div className="bar-background">

              <div
                className="reservation-bar confirmed"
                style={{
                  width: `${
                    reservations.length
                      ? (reservationsConfirmees /
                          reservations.length) *
                        100
                      : 0
                  }%`,
                }}
              ></div>

            </div>

          </div>

          {/* TERMINÉES */}

          <div className="reservation-row">

            <div className="reservation-label">

              <span className="status-dot green-dot"></span>

              Terminées

              <strong>
                {reservationsTerminees}
              </strong>

            </div>

            <div className="bar-background">

              <div
                className="reservation-bar finished"
                style={{
                  width: `${
                    reservations.length
                      ? (reservationsTerminees /
                          reservations.length) *
                        100
                      : 0
                  }%`,
                }}
              ></div>

            </div>

          </div>

          {/* ANNULÉES */}

          <div className="reservation-row">

            <div className="reservation-label">

              <span className="status-dot red-dot"></span>

              Annulées

              <strong>
                {reservationsAnnulees}
              </strong>

            </div>

            <div className="bar-background">

              <div
                className="reservation-bar cancelled"
                style={{
                  width: `${
                    reservations.length
                      ? (reservationsAnnulees /
                          reservations.length) *
                        100
                      : 0
                  }%`,
                }}
              ></div>

            </div>

          </div>

        </div>

      </div>

      {/* =========================
          INFORMATIONS GÉNÉRALES
      ========================= */}

      <div className="statistics-summary">

        <div>

          <span>
            Clients
          </span>

          <strong>
            {clients.length}
          </strong>

        </div>

        <div>

          <span>
            Réservations
          </span>

          <strong>
            {reservations.length}
          </strong>

        </div>

        <div>

          <span>
            Paiements
          </span>

          <strong>
            {paiements.length}
          </strong>

        </div>

        <div>

          <span>
            Occupation
          </span>

          <strong>
            {tauxOccupation}%
          </strong>

        </div>

      </div>

    </div>
  );
}

export default Statistics;