import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { BiHome, BiSearch, BiPlus, BiUser, BiHeart, BiSliderAlt } from "react-icons/bi";
import "./Sidebar.css";
import AuthModal from "./AuthModal";

const navItems = [
  { to: "/", label: "Inicio", Icon: BiHome },
  { to: "/buscar", label: "Buscar", Icon: BiSearch },
  { to: "/upload", label: "Subir", Icon: BiPlus },
  { type: "user", label: "Perfil", Icon: BiUser },
  { to: "/guardados", label: "Guardados", Icon: BiHeart },
  { to: "/filtros", label: "Filtros", Icon: BiSliderAlt },
];

export default function Sidebar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isUserLoggedIn = () => {
    return localStorage.getItem("usuarioId") !== null;
  };

  const isUserIconActive = () => {
    const path = location.pathname;
    return path === "/perfil" || path === "/login" || path === "/register" || showAuthModal;
  };

  const handleUserIconClick = () => {
    if (isUserLoggedIn()) {
      navigate("/perfil");
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <nav className="sidebar">
        {navItems.map((item) => {
          if (item.type === "user") {
            return (
              <button
                key="user"
                className={`sidebar-item user-btn ${isUserIconActive() ? "active" : ""}`}
                onClick={handleUserIconClick}
                title={item.label}
              >
                <item.Icon size={28} />
              </button>
            );
          }
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                if (isUserIconActive()) {
                  return "sidebar-item";
                }
                return isActive ? "sidebar-item active" : "sidebar-item";
              }}
              title={item.label}
            >
              <item.Icon size={28} />
            </NavLink>
          );
        })}
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}