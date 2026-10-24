import { useEffect, useState } from "react";
import "./Clients.css";

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "../services/api";

function Clients() {
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    date_naissance: "",
  });

  // =========================
  // CHARGER LES CLIENTS
  // =========================

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/clients/");

      setClients(
        Array.isArray(data)
          ? data
          : data?.results || []
      );

    } catch (err) {
      console.error("Erreur chargement clients :", err);

      setError(
        err.message ||
        "Impossible de récupérer les clients."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
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
    setEditingClient(null);

    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
      date_naissance: "",
    });

    setShowModal(true);
  };

  // =========================
  // OUVRIR MODIFICATION
  // =========================

  const openEditModal = (client) => {
    setEditingClient(client);

    setFormData({
      nom: client.nom || "",
      prenom: client.prenom || "",
      email: client.email || "",
      telephone: client.telephone || "",
      adresse: client.adresse || "",
      date_naissance: client.date_naissance || "",
    });

    setShowModal(true);
  };

  // =========================
  // FERMER MODAL
  // =========================

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  // =========================
  // AJOUT / MODIFICATION
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const clientData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        date_naissance:
          formData.date_naissance || null,
      };

      if (editingClient) {

        // MODIFICATION
        await apiPut(
          `/clients/${editingClient.id}/`,
          clientData
        );

      } else {

        // AJOUT
        await apiPost(
          "/clients/",
          clientData
        );
      }

      await loadClients();

      closeModal();

    } catch (err) {
      console.error(
        "Erreur ajout/modification client :",
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

  const deleteClient = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce client ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");

      await apiDelete(
        `/clients/${id}/`
      );

      await loadClients();

    } catch (err) {
      console.error(
        "Erreur suppression client :",
        err
      );

      setError(
        err.message ||
        "Impossible de supprimer ce client."
      );
    }
  };

  // =========================
  // RECHERCHE
  // =========================

  const filteredClients = clients.filter((client) => {
    const text = `
      ${client.nom || ""}
      ${client.prenom || ""}
      ${client.email || ""}
      ${client.telephone || ""}
      ${client.adresse || ""}
    `.toLowerCase();

    return text.includes(
      search.toLowerCase()
    );
  });

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "fr-FR"
    );
  };

  // =========================
  // INITIALES
  // =========================

  const getInitials = (client) => {
    const first =
      client.prenom?.charAt(0) || "";

    const last =
      client.nom?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="clients-page">

      {/* =========================
          EN-TÊTE
      ========================= */}

      <div className="page-header">

        <div>
          <h1>Clients</h1>

          <p>
            Gérez les clients de votre hôtel.
          </p>
        </div>

        <button
          type="button"
          className="add-client-btn"
          onClick={openAddModal}
        >
          + Ajouter un client
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
          STATISTIQUE
      ========================= */}

      <div className="client-stats">

        <div className="stat-card">

          <div className="stat-icon blue">
            ♙
          </div>

          <div>
            <span>Total clients</span>

            <strong>
              {clients.length}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>Clients enregistrés</span>

            <strong>
              {clients.length}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            ◉
          </div>

          <div>
            <span>Résultats</span>

            <strong>
              {filteredClients.length}
            </strong>
          </div>

        </div>

      </div>

      {/* =========================
          CONTENEUR
      ========================= */}

      <div className="clients-container">

        <div className="clients-toolbar">

          <div>

            <h2>
              Liste des clients
            </h2>

            <span>
              {filteredClients.length} client(s)
            </span>

          </div>

          <div className="search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Rechercher un client..."
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
              Chargement des clients...
            </p>

          </div>

        ) : filteredClients.length === 0 ? (

          /* =========================
             AUCUN CLIENT
          ========================= */

          <div className="empty-state">

            <div className="empty-icon">
              ♙
            </div>

            <h3>
              Aucun client trouvé
            </h3>

            <p>
              {search
                ? "Aucun client ne correspond à votre recherche."
                : "Commencez par ajouter un client."}
            </p>

            {!search && (
              <button
                type="button"
                className="add-client-btn"
                onClick={openAddModal}
              >
                + Ajouter un client
              </button>
            )}

          </div>

        ) : (

          /* =========================
             TABLEAU
          ========================= */

          <div className="table-wrapper">

            <table className="clients-table">

              <thead>

                <tr>
                  <th>CLIENT</th>
                  <th>EMAIL</th>
                  <th>TÉLÉPHONE</th>
                  <th>ADRESSE</th>
                  <th>DATE DE NAISSANCE</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {filteredClients.map((client) => (

                  <tr key={client.id}>

                    {/* CLIENT */}

                    <td>

                      <div className="client-info">

                        <div className="client-avatar">
                          {getInitials(client)}
                        </div>

                        <div>

                          <strong>
                            {client.prenom}{" "}
                            {client.nom}
                          </strong>

                          <small>
                            ID #{client.id}
                          </small>

                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}

                    <td>

                      <span className="client-email">
                        {client.email}
                      </span>

                    </td>

                    {/* TÉLÉPHONE */}

                    <td>
                      {client.telephone || "-"}
                    </td>

                    {/* ADRESSE */}

                    <td>

                      <span className="client-address">
                        {client.adresse ||
                          "Non renseignée"}
                      </span>

                    </td>

                    {/* DATE */}

                    <td>

                      {formatDate(
                        client.date_naissance
                      )}

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="actions">

                        <button
                          type="button"
                          className="action-btn edit"
                          title="Modifier"
                          onClick={() =>
                            openEditModal(client)
                          }
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className="action-btn delete"
                          title="Supprimer"
                          onClick={() =>
                            deleteClient(client.id)
                          }
                        >
                          🗑
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

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

          <div className="client-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {editingClient
                    ? "Modifier le client"
                    : "Ajouter un client"}
                </h2>

                <p>
                  {editingClient
                    ? "Modifiez les informations du client."
                    : "Remplissez les informations du nouveau client."}
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

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                {/* PRÉNOM */}

                <div className="form-group">

                  <label>
                    Prénom *
                  </label>

                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Ex : Jean"
                    required
                  />

                </div>

                {/* NOM */}

                <div className="form-group">

                  <label>
                    Nom *
                  </label>

                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Ex : Rakoto"
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Adresse email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@email.com"
                    required
                  />

                </div>

                {/* TÉLÉPHONE */}

                <div className="form-group">

                  <label>
                    Téléphone *
                  </label>

                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="Ex : 034 00 000 00"
                    required
                  />

                </div>

                {/* DATE DE NAISSANCE */}

                <div className="form-group">

                  <label>
                    Date de naissance
                  </label>

                  <input
                    type="date"
                    name="date_naissance"
                    value={
                      formData.date_naissance
                    }
                    onChange={handleChange}
                  />

                </div>

                {/* ADRESSE */}

                <div className="form-group">

                  <label>
                    Adresse
                  </label>

                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Ex : Antananarivo"
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
                  {editingClient
                    ? "Enregistrer les modifications"
                    : "Ajouter le client"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Clients;