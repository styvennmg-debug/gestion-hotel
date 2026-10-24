import { useEffect, useState } from "react";
import "./Payments.css";

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "../services/api";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [formData, setFormData] = useState({
    reservation: "",
    montant: "",
    mode_paiement: "especes",
    statut: "en_attente",
    reference: "",
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
        paymentsData,
        reservationsData,
      ] = await Promise.all([
        apiGet("/paiements/"),
        apiGet("/reservations/"),
      ]);

      setPayments(
        Array.isArray(paymentsData)
          ? paymentsData
          : paymentsData?.results || []
      );

      setReservations(
        Array.isArray(reservationsData)
          ? reservationsData
          : reservationsData?.results || []
      );

    } catch (err) {
      console.error(
        "Erreur chargement paiements :",
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
    setEditingPayment(null);

    setFormData({
      reservation: "",
      montant: "",
      mode_paiement: "especes",
      statut: "en_attente",
      reference: "",
      remarque: "",
    });

    setShowModal(true);
  };

  // =========================
  // MODIFICATION
  // =========================

  const openEditModal = (payment) => {
    setEditingPayment(payment);

    setFormData({
      reservation: payment.reservation || "",
      montant: payment.montant || "",
      mode_paiement:
        payment.mode_paiement || "especes",
      statut:
        payment.statut || "en_attente",
      reference:
        payment.reference || "",
      remarque:
        payment.remarque || "",
    });

    setShowModal(true);
  };

  // =========================
  // FERMER
  // =========================

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  // =========================
  // ENREGISTRER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // Vérifier la réservation
      if (!formData.reservation) {
        throw new Error(
          "Veuillez sélectionner une réservation."
        );
      }

      // Vérifier le montant
      if (
        !formData.montant ||
        Number(formData.montant) <= 0
      ) {
        throw new Error(
          "Le montant doit être supérieur à 0."
        );
      }

      // Données à envoyer au backend
      const paymentData = {
        reservation:
          Number(formData.reservation),

        montant:
          formData.montant,

        mode_paiement:
          formData.mode_paiement,

        statut:
          formData.statut,

        reference:
          formData.reference,

        remarque:
          formData.remarque,
      };

      // =========================
      // MODIFICATION
      // =========================

      if (editingPayment) {

        await apiPut(
          `/paiements/${editingPayment.id}/`,
          paymentData
        );

      } else {

        // =========================
        // AJOUT
        // =========================

        await apiPost(
          "/paiements/",
          paymentData
        );
      }

      // Recharger les données
      await loadData();

      // Fermer le modal
      closeModal();

    } catch (err) {
      console.error(
        "Erreur paiement :",
        err
      );

      setError(
        err.message ||
        "Impossible d'enregistrer le paiement."
      );
    }
  };

  // =========================
  // SUPPRIMER
  // =========================

  const deletePayment = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce paiement ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");

      await apiDelete(
        `/paiements/${id}/`
      );

      await loadData();

    } catch (err) {
      console.error(
        "Erreur suppression paiement :",
        err
      );

      setError(
        err.message ||
        "Impossible de supprimer le paiement."
      );
    }
  };

  // =========================
  // RÉSERVATION
  // =========================

  const getReservation = (id) => {
    return reservations.find(
      (reservation) =>
        reservation.id === id
    );
  };

  const getReservationLabel = (id) => {
    const reservation =
      getReservation(id);

    if (!reservation) {
      return `Réservation #${id}`;
    }

    return `Réservation #${reservation.id} — Chambre ${
      reservation.chambre_numero ||
      reservation.chambre
    }`;
  };

  // =========================
  // MODE DE PAIEMENT
  // =========================

  const getPaymentMethod = (method) => {
    const methods = {
      especes: "Espèces",
      carte: "Carte bancaire",
      mobile_money: "Mobile Money",
      virement: "Virement bancaire",
    };

    return methods[method] || method;
  };

  // =========================
  // STATUT
  // =========================

  const getStatusLabel = (status) => {
    const statuses = {
      en_attente: "En attente",
      paye: "Payé",
      rembourse: "Remboursé",
      annule: "Annulé",
    };

    return statuses[status] || status;
  };

  // =========================
  // RECHERCHE
  // =========================

  const filteredPayments =
    payments.filter((payment) => {

      const text = `
        ${payment.id || ""}
        ${payment.reference || ""}
        ${payment.mode_paiement || ""}
        ${payment.statut || ""}
        ${getReservationLabel(
          payment.reservation
        )}
      `.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  // =========================
  // STATISTIQUES
  // =========================

  const totalPayments =
    payments.length;

  const paidPayments =
    payments.filter(
      (payment) =>
        payment.statut === "paye"
    );

  const totalAmount =
    paidPayments.reduce(
      (total, payment) =>
        total +
        Number(payment.montant || 0),
      0
    );

  const pendingPayments =
    payments.filter(
      (payment) =>
        payment.statut === "en_attente"
    ).length;

  const refundedAmount =
    payments
      .filter(
        (payment) =>
          payment.statut === "rembourse"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(payment.montant || 0),
        0
      );

  // =========================
  // RENDU
  // =========================

  return (
    <div className="payments-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>

          <h1>
            Paiements
          </h1>

          <p>
            Gérez les paiements et transactions de
            votre hôtel.
          </p>

        </div>

        <button
          type="button"
          className="add-payment-btn"
          onClick={openAddModal}
        >
          + Nouveau paiement
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

      <div className="payment-stats">

        <div className="stat-card">

          <div className="stat-icon blue">
            💳
          </div>

          <div>

            <span>
              Total paiements
            </span>

            <strong>
              {totalPayments}
            </strong>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon green">
            Ar
          </div>

          <div>

            <span>
              Total encaissé
            </span>

            <strong>
              {totalAmount.toLocaleString(
                "fr-FR"
              )}{" "}
              Ar
            </strong>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            ⏳
          </div>

          <div>

            <span>
              En attente
            </span>

            <strong>
              {pendingPayments}
            </strong>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon red">
            ↩
          </div>

          <div>

            <span>
              Remboursé
            </span>

            <strong>
              {refundedAmount.toLocaleString(
                "fr-FR"
              )}{" "}
              Ar
            </strong>

          </div>

        </div>

      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="payments-container">

        <div className="payments-toolbar">

          <div>

            <h2>
              Liste des paiements
            </h2>

            <span>
              {filteredPayments.length} paiement(s)
            </span>

          </div>

          <div className="search-box">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Rechercher un paiement..."
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
              Chargement des paiements...
            </p>

          </div>

        ) : filteredPayments.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              💳
            </div>

            <h3>
              Aucun paiement trouvé
            </h3>

            <p>
              {search
                ? "Aucun paiement ne correspond à votre recherche."
                : "Commencez par enregistrer un paiement."}
            </p>

            {!search && (
              <button
                type="button"
                className="add-payment-btn"
                onClick={openAddModal}
              >
                + Nouveau paiement
              </button>
            )}

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="payments-table">

              <thead>

                <tr>
                  <th>PAIEMENT</th>
                  <th>RÉSERVATION</th>
                  <th>MONTANT</th>
                  <th>MODE</th>
                  <th>DATE</th>
                  <th>STATUT</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {filteredPayments.map(
                  (payment) => (

                    <tr
                      key={payment.id}
                    >

                      <td>

                        <div className="payment-info">

                          <div className="payment-icon">
                            💳
                          </div>

                          <div>

                            <strong>
                              Paiement #
                              {payment.id}
                            </strong>

                            <small>
                              {payment.reference ||
                                "Sans référence"}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="reservation-badge">

                          {getReservationLabel(
                            payment.reservation
                          )}

                        </span>

                      </td>

                      <td>

                        <strong className="payment-amount">

                          {Number(
                            payment.montant || 0
                          ).toLocaleString(
                            "fr-FR"
                          )}{" "}
                          Ar

                        </strong>

                      </td>

                      <td>

                        {getPaymentMethod(
                          payment.mode_paiement
                        )}

                      </td>

                      <td>

                        {payment.date_paiement
                          ? new Date(
                              payment.date_paiement
                            ).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}

                      </td>

                      <td>

                        <span
                          className={`status-badge ${payment.statut}`}
                        >
                          {getStatusLabel(
                            payment.statut
                          )}
                        </span>

                      </td>

                      <td>

                        <div className="actions">

                          <button
                            type="button"
                            className="action-btn edit"
                            title="Modifier"
                            onClick={() =>
                              openEditModal(
                                payment
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
                              deletePayment(
                                payment.id
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

          <div className="payment-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingPayment
                    ? "Modifier le paiement"
                    : "Nouveau paiement"}
                </h2>

                <p>
                  {editingPayment
                    ? "Modifiez les informations du paiement."
                    : "Enregistrez un nouveau paiement."}
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

            <form
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                {/* RÉSERVATION */}

                <div className="form-group">

                  <label>
                    Réservation *
                  </label>

                  <select
                    name="reservation"
                    value={
                      formData.reservation
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Sélectionner une réservation
                    </option>

                    {reservations.map(
                      (reservation) => (

                        <option
                          key={reservation.id}
                          value={reservation.id}
                        >
                          Réservation #
                          {reservation.id}
                          {" — "}
                          Chambre{" "}
                          {reservation.chambre_numero ||
                            reservation.chambre}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* MONTANT */}

                <div className="form-group">

                  <label>
                    Montant *
                  </label>

                  <input
                    type="number"
                    name="montant"
                    value={formData.montant}
                    onChange={handleChange}
                    placeholder="Ex : 150000"
                    min="1"
                    step="0.01"
                    required
                  />

                </div>

                {/* MODE DE PAIEMENT */}

                <div className="form-group">

                  <label>
                    Mode de paiement *
                  </label>

                  <select
                    name="mode_paiement"
                    value={
                      formData.mode_paiement
                    }
                    onChange={handleChange}
                    required
                  >

                    <option value="especes">
                      Espèces
                    </option>

                    <option value="carte">
                      Carte bancaire
                    </option>

                    <option value="mobile_money">
                      Mobile Money
                    </option>

                    <option value="virement">
                      Virement bancaire
                    </option>

                  </select>

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

                    <option value="paye">
                      Payé
                    </option>

                    <option value="rembourse">
                      Remboursé
                    </option>

                    <option value="annule">
                      Annulé
                    </option>

                  </select>

                </div>

                {/* RÉFÉRENCE */}

                <div className="form-group full">

                  <label>
                    Référence
                  </label>

                  <input
                    type="text"
                    name="reference"
                    value={
                      formData.reference
                    }
                    onChange={handleChange}
                    placeholder="Ex : PAY-2026-001"
                  />

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
                    placeholder="Informations supplémentaires..."
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
                  {editingPayment
                    ? "Enregistrer"
                    : "Enregistrer le paiement"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Payments;