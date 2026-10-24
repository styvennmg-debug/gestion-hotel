import { useEffect, useState } from "react";
import "./Rooms.css";

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "../services/api";

function Rooms() {
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    numero: "",
    type_chambre: "simple",
    prix: "",
    capacite: 1,
    statut: "disponible",
    description: "",
  });

  // =========================
  // CHARGER LES CHAMBRES
  // =========================

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/chambres/");

      setRooms(
        Array.isArray(data)
          ? data
          : data?.results || []
      );

    } catch (err) {
      console.error(
        "Erreur chargement chambres :",
        err
      );

      setError(
        err.message ||
        "Impossible de récupérer les chambres."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // =========================
  // CHANGEMENT FORMULAIRE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // OUVRIR AJOUT
  // =========================

  const openAddModal = () => {
    setEditingRoom(null);

    setFormData({
      numero: "",
      type_chambre: "simple",
      prix: "",
      capacite: 1,
      statut: "disponible",
      description: "",
    });

    setShowModal(true);
  };

  // =========================
  // OUVRIR MODIFICATION
  // =========================

  const openEditModal = (room) => {
    setEditingRoom(room);

    setFormData({
      numero: room.numero || "",
      type_chambre:
        room.type_chambre || "simple",
      prix: room.prix || "",
      capacite: room.capacite || 1,
      statut:
        room.statut || "disponible",
      description:
        room.description || "",
    });

    setShowModal(true);
  };

  // =========================
  // FERMER MODAL
  // =========================

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  // =========================
  // AJOUT / MODIFICATION
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const roomData = {
        numero: formData.numero,
        type_chambre:
          formData.type_chambre,
        prix: formData.prix,
        capacite:
          Number(formData.capacite),
        statut: formData.statut,
        description:
          formData.description,
      };

      if (editingRoom) {

        // MODIFICATION
        await apiPut(
          `/chambres/${editingRoom.id}/`,
          roomData
        );

      } else {

        // AJOUT
        await apiPost(
          "/chambres/",
          roomData
        );
      }

      await loadRooms();

      closeModal();

    } catch (err) {
      console.error(
        "Erreur ajout/modification chambre :",
        err
      );

      setError(
        err.message ||
        "Une erreur est survenue."
      );
    }
  };

  // =========================
  // SUPPRIMER
  // =========================

  const deleteRoom = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette chambre ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");

      await apiDelete(
        `/chambres/${id}/`
      );

      await loadRooms();

    } catch (err) {
      console.error(
        "Erreur suppression chambre :",
        err
      );

      setError(
        err.message ||
        "Impossible de supprimer cette chambre."
      );
    }
  };

  // =========================
  // RECHERCHE
  // =========================

  const filteredRooms = rooms.filter(
    (room) => {
      const text = `
        ${room.numero || ""}
        ${room.type_chambre || ""}
        ${room.statut || ""}
        ${room.description || ""}
      `.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    }
  );

  // =========================
  // STATISTIQUES
  // =========================

  const totalRooms = rooms.length;

  const availableRooms = rooms.filter(
    (room) =>
      room.statut === "disponible"
  ).length;

  const occupiedRooms = rooms.filter(
    (room) =>
      room.statut === "occupee"
  ).length;

  const maintenanceRooms = rooms.filter(
    (room) =>
      room.statut === "maintenance"
  ).length;

  // =========================
  // NOM TYPE
  // =========================

  const getRoomType = (type) => {
    const types = {
      simple: "Simple",
      double: "Double",
      triple: "Triple",
      suite: "Suite",
    };

    return types[type] || type;
  };

  // =========================
  // NOM STATUT
  // =========================

  const getStatusLabel = (status) => {
    const statuses = {
      disponible: "Disponible",
      occupee: "Occupée",
      maintenance: "Maintenance",
    };

    return statuses[status] || status;
  };

  return (
    <div className="rooms-page">

      {/* =========================
          EN-TÊTE
      ========================= */}

      <div className="page-header">

        <div>

          <h1>
            Chambres
          </h1>

          <p>
            Gérez les chambres de votre hôtel.
          </p>

        </div>

        <button
          type="button"
          className="add-room-btn"
          onClick={openAddModal}
        >
          + Ajouter une chambre
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

      <div className="room-stats">

        <div className="stat-card">

          <div className="stat-icon blue">
            🛏️
          </div>

          <div>

            <span>
              Total chambres
            </span>

            <strong>
              {totalRooms}
            </strong>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <div>

            <span>
              Disponibles
            </span>

            <strong>
              {availableRooms}
            </strong>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon red">
            ●
          </div>

          <div>

            <span>
              Occupées
            </span>

            <strong>
              {occupiedRooms}
            </strong>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            ⚙
          </div>

          <div>

            <span>
              Maintenance
            </span>

            <strong>
              {maintenanceRooms}
            </strong>

          </div>

        </div>

      </div>

      {/* =========================
          CONTENU
      ========================= */}

      <div className="rooms-container">

        <div className="rooms-toolbar">

          <div>

            <h2>
              Liste des chambres
            </h2>

            <span>
              {filteredRooms.length} chambre(s)
            </span>

          </div>

          <div className="search-box">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Rechercher une chambre..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {/* =========================
            CHARGEMENT
        ========================= */}

        {loading ? (

          <div className="loading">

            <div className="loader"></div>

            <p>
              Chargement des chambres...
            </p>

          </div>

        ) : filteredRooms.length === 0 ? (

          /* =========================
             AUCUNE CHAMBRE
          ========================= */

          <div className="empty-state">

            <div className="empty-icon">
              🛏️
            </div>

            <h3>
              Aucune chambre trouvée
            </h3>

            <p>
              {search
                ? "Aucune chambre ne correspond à votre recherche."
                : "Commencez par ajouter une chambre."}
            </p>

            {!search && (

              <button
                type="button"
                className="add-room-btn"
                onClick={openAddModal}
              >
                + Ajouter une chambre
              </button>

            )}

          </div>

        ) : (

          /* =========================
             TABLEAU
          ========================= */

          <div className="table-wrapper">

            <table className="rooms-table">

              <thead>

                <tr>
                  <th>CHAMBRE</th>
                  <th>TYPE</th>
                  <th>PRIX / NUIT</th>
                  <th>CAPACITÉ</th>
                  <th>STATUT</th>
                  <th>DESCRIPTION</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {filteredRooms.map(
                  (room) => (

                    <tr key={room.id}>

                      <td>

                        <div className="room-number">

                          <div className="room-icon">
                            🛏️
                          </div>

                          <div>

                            <strong>
                              Chambre{" "}
                              {room.numero}
                            </strong>

                            <small>
                              ID #{room.id}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="type-badge">

                          {getRoomType(
                            room.type_chambre
                          )}

                        </span>

                      </td>

                      <td>

                        <strong className="price">

                          {Number(
                            room.prix || 0
                          ).toLocaleString(
                            "fr-FR"
                          )}{" "}
                          Ar

                        </strong>

                      </td>

                      <td>
                        {room.capacite} personne(s)
                      </td>

                      <td>

                        <span
                          className={`status-badge ${room.statut}`}
                        >

                          <span className="status-dot"></span>

                          {getStatusLabel(
                            room.statut
                          )}

                        </span>

                      </td>

                      <td>

                        <span className="description">

                          {room.description ||
                            "Aucune description"}

                        </span>

                      </td>

                      <td>

                        <div className="actions">

                          <button
                            type="button"
                            className="action-btn edit"
                            title="Modifier"
                            onClick={() =>
                              openEditModal(room)
                            }
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="action-btn delete"
                            title="Supprimer"
                            onClick={() =>
                              deleteRoom(
                                room.id
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

          <div className="room-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>

                  {editingRoom
                    ? "Modifier la chambre"
                    : "Ajouter une chambre"}

                </h2>

                <p>

                  {editingRoom
                    ? "Modifiez les informations de la chambre."
                    : "Remplissez les informations de la nouvelle chambre."}

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

            {/* FORMULAIRE */}

            <form
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                {/* NUMÉRO */}

                <div className="form-group">

                  <label>
                    Numéro de chambre *
                  </label>

                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="Ex : 101"
                    required
                  />

                </div>

                {/* TYPE */}

                <div className="form-group">

                  <label>
                    Type de chambre *
                  </label>

                  <select
                    name="type_chambre"
                    value={
                      formData.type_chambre
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="simple">
                      Simple
                    </option>

                    <option value="double">
                      Double
                    </option>

                    <option value="triple">
                      Triple
                    </option>

                    <option value="suite">
                      Suite
                    </option>

                  </select>

                </div>

                {/* PRIX */}

                <div className="form-group">

                  <label>
                    Prix par nuit *
                  </label>

                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleChange}
                    placeholder="Ex : 80000"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

                {/* CAPACITÉ */}

                <div className="form-group">

                  <label>
                    Capacité *
                  </label>

                  <input
                    type="number"
                    name="capacite"
                    value={
                      formData.capacite
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
                    value={
                      formData.statut
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="disponible">
                      Disponible
                    </option>

                    <option value="occupee">
                      Occupée
                    </option>

                    <option value="maintenance">
                      Maintenance
                    </option>

                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    placeholder="Description de la chambre..."
                    rows="4"
                  />

                </div>

              </div>

              {/* FOOTER */}

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

                  {editingRoom
                    ? "Enregistrer les modifications"
                    : "Ajouter la chambre"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Rooms;