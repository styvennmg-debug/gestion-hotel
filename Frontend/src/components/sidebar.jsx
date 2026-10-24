import React from "react";

function Sidebar({ activePage, onNavigate, onLogout }) {

  const menuItems = [
    {
      id: "dashboard",
      icon: "▣",
      label: "Dashboard"
    },
    {
      id: "chambres",
      icon: "▤",
      label: "Chambres"
    },
    {
      id: "clients",
      icon: "♙",
      label: "Clients"
    },
    {
      id: "reservations",
      icon: "▦",
      label: "Réservations"
    },
    {
      id: "paiements",
      icon: "▣",
      label: "Paiements"
    }
  ];

  const gestionItems = [
    {
      id: "statistiques",
      icon: "◉",
      label: "Statistiques"
    },
    {
      id: "parametres",
      icon: "⚙",
      label: "Paramètres"
    }
  ];

  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="logo">

        <div className="logo-icon">
          H
        </div>

        <div>
          <h2>HOTEL</h2>
          <span>Management</span>
        </div>

      </div>


      {/* MENU */}
      <nav className="menu">

        <p className="menu-title">
          MENU PRINCIPAL
        </p>


        {menuItems.map((item) => (

          <button
            key={item.id}
            type="button"
            className={`menu-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => onNavigate(item.id)}
          >

            <span className="menu-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </button>

        ))}


        <p className="menu-title">
          GESTION
        </p>


        {gestionItems.map((item) => (

          <button
            key={item.id}
            type="button"
            className={`menu-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => onNavigate(item.id)}
          >

            <span className="menu-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </button>

        ))}

      </nav>


      {/* BAS DU SIDEBAR */}
      <div className="sidebar-bottom">

        <div className="user-box">

          <div className="avatar">
            A
          </div>

          <div>
            <strong>
              Administrateur
            </strong>

            <small>
              Administrat
            </small>
          </div>

        </div>


        {/* DÉCONNEXION */}
        <button
          type="button"
          className="logout"
          onClick={onLogout}
        >
          ⇥ Déconnexion
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;