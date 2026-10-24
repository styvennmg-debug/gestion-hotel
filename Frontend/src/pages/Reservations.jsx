import { useEffect, useState } from "react";
import "./Reservations.css";

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "../services/api";

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [chambres, setChambres] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const [formData, setFormData] = useState({
    client: "",
    chambre: "",
    date_arrivee: "",
    date_depart: "",
    nombre_personnes: 1,
    statut: "en_attente",
    remarque: "",
  });

  // =========================
  // CHARGER LES DONNÉES
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        reservationsData,
        clientsData,
        chambresData,
      ] = await Promise.all([
        apiGet("/reservations/"),
        apiGet("/clients/"),
        apiGet("/chambres/"),
      ]);

      setReservations(
        Array.isArray(reservationsData)
          ? reservationsData
          : reservationsData?.results || []
      );

      setClients(
        Array.isArray(clientsData)
          ? clientsData
          : clientsData?.results || []
      );

      setChambres(
        Array.isArray(chambresData)
          ? chambresData
          : chambresData?.results || []
      );

    } catch (err) {
      console.error(
        "Erreur chargement réservations :",
        err
      );

      setError(
        err.message ||
        "Impossible de récupérer les données."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // FORMULAIRE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // AJOUT
  // =========================

  const openAddModal = () => {
    setEditingReservation(null);

    setFormData({
      client: "",
      chambre: "",
      date_arrivee: "",
      date_depart: "",
      nombre_personnes: 1,
      statut: "en_attente",
      remarque: "",
    });

    setShowModal(true);
  };

  // =========================
  // MODIFICATION
  // =========================

  const openEditModal = (reservation) => {
    setEditingReservation(reservation);

    setFormData({
      client: reservation.client || "",
      chambre: reservation.chambre || "",
      date_arrivee:
        reservation.date_arrivee || "",
      date_depart:
        reservation.date_depart || "",
      nombre_personnes:
        reservation.nombre_personnes || 1,
      statut:
        reservation.statut || "en_attente",
      remarque:
        reservation.remarque || "",
    });

    setShowModal(true);
  };

  // =========================
  // FERMER
  // =========================

  const closeModal = () => {
    setShowModal(false);
    setEditingReservation(null);
  };

  // =========================
  // ENREGISTRER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // Vérifier client et chambre
      if (
        !formData.client ||
        !formData.chambre
      ) {
        throw new Error(
          "Veuillez sélectionner un client et une chambre."
        );
      }

      // Vérifier les dates
      if (
        formData.date_arrivee &&
        formData.date_depart &&
        formData.date_depart <=
          formData.date_arrivee
      ) {
        throw new Error(
          "La date de départ doit être après la date d'arrivée."
        );
      }

      // Données envoyées au backend
      const reservationData = {
        client: Number(formData.client),
        chambre: Number(formData.chambre),
        date_arrivee:
          formData.date_arrivee,
        date_depart:
          formData.date_depart,
        nombre_personnes:
          Number(formData.nombre_personnes),
        statut: formData.statut,
        remarque:
          formData.remarque,
      };

      // MODIFICATION
      if (editingReservation) {

        await apiPut(
          `/reservations/${editingReservation.id}/`,
          reservationData
        );

      } else {

        // AJOUT
        await apiPost(
          "/reservations/",
          reservationData
        );
      }

      // Recharger les données
      await loadData();

      // Fermer le formulaire
      closeModal();

    } catch (err) {
      console.error(
        "Erreur réservation :",
        err
      );

      setError(
        err.message ||
        "Impossible d'enregistrer la réservation."
      );
    }
  };

  // =========================
  // SUPPRIMER
  // =========================

  const deleteReservation = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette réservation ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");

      await apiDelete(
        `/reservations/${id}/`
      );

      await loadData();

    } catch (err) {
      console.error(
        "Erreur suppression réservation :",
        err
      );

      setError(
        err.message ||
        "Impossible de supprimer la réservation."
      );
    }
  };

  // =========================
  // RECHERCHE
  // =========================

  const filteredReservations =
    reservations.filter((reservation) => {

      const client = clients.find(
        (c) => c.id === reservation.client
      );

      const chambre = chambres.find(
        (c) => c.id === reservation.chambre
      );

      const clientName = client
        ? `${client.prenom} ${client.nom}`
        : "";

      const chambreNumber =
        chambre?.numero || "";

      const text = `
        ${clientName}
        ${chambreNumber}
        ${reservation.date_arrivee || ""}
        ${reservation.date_depart || ""}
        ${reservation.statut || ""}
      `.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  // =========================
  // STATISTIQUES
  // =========================

  const totalReservations =
    reservations.length;

  const confirmedReservations =
    reservations.filter(
      (r) => r.statut === "confirmee"
    ).length;

  const pendingReservations =
    reservations.filter(
      (r) => r.statut === "en_attente"
    ).length;

  const cancelledReservations =
    reservations.filter(
      (r) => r.statut === "annulee"
    ).length;

  // =========================
  // CLIENT
  // =========================

  const getClientName = (id) => {
    const client = clients.find(
      (c) => c.id === id
    );

    if (!client) {
      return `Client #${id}`;
    }

    return `${client.prenom} ${client.nom}`;
  };

  // =========================
  // CHAMBRE
  // =========================

  const getRoomNumber = (id) => {
    const chambre = chambres.find(
      (c) => c.id === id
    );

    if (!chambre) {
      return `Chambre #${id}`;
    }

    return chambre.numero;
  };

  // =========================
  // STATUT
  // =========================

  const getStatusLabel = (status) => {
    const statuses = {
      en_attente: "En attente",
      confirmee: "Confirmée",
      annulee: "Annulée",
      terminee: "Terminée",
    };

    return statuses[status] || status;
  };

  // =========================
  // RENDU
  // =========================

  return (
    <div className="reservations-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <h1>Réservations</h1>

          <p>
            Gérez les réservations de votre hôtel.
          </p>
        </div>

        <button
          type="button"
          className="add-reservation-btn"
          onClick={openAddModal}
        >
          + Nouvelle réservation
        </button>

      </div>

      {/* =========================
          ERREUR
      ========================= */}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* =========================
          STATISTIQUES
      ========================= */}

      <div className="reservation-stats">

        <div className="stat-card">

          <div className="stat-icon blue">
            📅
          </div>

          <div>
            <span>Total</span>

            <strong>
              {totalReservations}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>Confirmées</span>

            <strong>
              {confirmedReservations}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            ⏳
          </div>

          <div>
            <span>En attente</span>

            <strong>
              {pendingReservations}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon red">
            ×
          </div>

          <div>
            <span>Annulées</span>

            <strong>
              {cancelledReservations}
            </strong>
          </div>

        </div>

      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="reservations-container">

        <div className="reservations-toolbar">

          <div>
            <h2>
              Liste des réservations
            </h2>

            <span>
              {filteredReservations.length} réservation(s)
            </span>
          </div>

          <div className="search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {loading ? (

          <div className="loading">

            <div className="loader"></div>

            <p>
              Chargement des réservations...
            </p>

          </div>

        ) : filteredReservations.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              📅
            </div>

            <h3>
              Aucune réservation
            </h3>

            <p>
              {search
                ? "Aucune réservation ne correspond à votre recherche."
                : "Commencez par créer une réservation."}
            </p>

            {!search && (
              <button
                type="button"
                className="add-reservation-btn"
                onClick={openAddModal}
              >
                + Nouvelle réservation
              </button>
            )}

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="reservations-table">

              <thead>

                <tr>
                  <th>CLIENT</th>
                  <th>CHAMBRE</th>
                  <th>ARRIVÉE</th>
                  <th>DÉPART</th>
                  <th>PERSONNES</th>
                  <th>STATUT</th>
                  <th>Nuits</th>
                  <th>Total</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {filteredReservations.map(
                  (reservation) => (

                    <tr
                      key={reservation.id}
                    >

                      <td>

                        <div className="reservation-client">

                          <div className="client-avatar">

                            {getClientName(
                              reservation.client
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {getClientName(
                                reservation.client
                              )}
                            </strong>

                            <small>
                              Réservation #
                              {reservation.id}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="room-badge">

                          🛏️ Chambre{" "}

                          {getRoomNumber(
                            reservation.chambre
                          )}

                        </span>

                      </td>

                      <td>
                        {reservation.date_arrivee}
                      </td>

                      <td>
                        {reservation.date_depart}
                      </td>

                      <td>
                        👥{" "}
                        {reservation.nombre_personnes}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${reservation.statut}`}
                        >
                          {getStatusLabel(
                            reservation.statut
                          )}
                        </span>

                      </td>
                      <td>{reservation.nombre_nuits}</td>

                      <td>{Number(reservation.prix_total || 0).toLocaleString("fr-FR")} Ar</td>
                      <td>

                        <div className="actions">

                          <button
                            type="button"
                            className="action-btn edit"
                            title="Modifier"
                            onClick={() =>
                              openEditModal(
                                reservation
                              )
                            }
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="action-btn delete"
                            title="Supprimer"
                            onClick={() =>
                              deleteReservation(
                                reservation.id
                              )
                            }
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =========================
          MODAL
      ========================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target === e.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="reservation-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingReservation
                    ? "Modifier la réservation"
                    : "Nouvelle réservation"}
                </h2>

                <p>
                  {editingReservation
                    ? "Modifiez les informations de la réservation."
                    : "Remplissez les informations de la réservation."}
                </p>

              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                {/* CLIENT */}

                <div className="form-group">

                  <label>
                    Client *
                  </label>

                  <select
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Sélectionner un client
                    </option>

                    {clients.map((client) => (

                      <option
                        key={client.id}
                        value={client.id}
                      >
                        {client.prenom}{" "}
                        {client.nom}
                      </option>

                    ))}

                  </select>

                </div>

                {/* CHAMBRE */}

                <div className="form-group">

                  <label>
                    Chambre *
                  </label>

                  <select
                    name="chambre"
                    value={formData.chambre}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Sélectionner une chambre
                    </option>

                    {chambres.map((chambre) => (

                      <option
                        key={chambre.id}
                        value={chambre.id}
                      >
                        Chambre{" "}
                        {chambre.numero} —{" "}
                        {Number(
                          chambre.prix || 0
                        ).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        Ar
                      </option>

                    ))}

                  </select>

                </div>

                {/* ARRIVÉE */}

                <div className="form-group">

                  <label>
                    Date d'arrivée *
                  </label>

                  <input
                    type="date"
                    name="date_arrivee"
                    value={
                      formData.date_arrivee
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* DÉPART */}

                <div className="form-group">

                  <label>
                    Date de départ *
                  </label>

                  <input
                    type="date"
                    name="date_depart"
                    value={
                      formData.date_depart
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* PERSONNES */}

                <div className="form-group">

                  <label>
                    Nombre de personnes *
                  </label>

                  <input
                    type="number"
                    name="nombre_personnes"
                    value={
                      formData.nombre_personnes
                    }
                    onChange={handleChange}
                    min="1"
                    required
                  />

                </div>

                {/* STATUT */}

                <div className="form-group">

                  <label>
                    Statut *
                  </label>

                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    required
                  >

                    <option value="en_attente">
                      En attente
                    </option>

                    <option value="confirmee">
                      Confirmée
                    </option>

                    <option value="annulee">
                      Annulée
                    </option>

                    <option value="terminee">
                      Terminée
                    </option>

                  </select>

                </div>

                {/* REMARQUE */}

                <div className="form-group full">

                  <label>
                    Remarque
                  </label>

                  <textarea
                    name="remarque"
                    value={
                      formData.remarque
                    }
                    onChange={handleChange}
                    placeholder="Remarque concernant la réservation..."
                    rows="4"
                  />

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingReservation
                    ? "Enregistrer"
                    : "Créer la réservation"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Reservations;