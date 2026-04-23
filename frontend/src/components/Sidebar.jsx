import { NavLink } from "react-router-dom";
import { BiHome, BiSearch, BiPlus, BiUser, BiHeart, BiSliderAlt } from "react-icons/bi";
import "./Sidebar.css";

const navItems = [
  { to: "/", label: "Inicio", Icon: BiHome },
  { to: "/buscar", label: "Buscar", Icon: BiSearch },
  { to: "/upload", label: "Subir", Icon: BiPlus },
  { to: "/perfil", label: "Perfil", Icon: BiUser },
  { to: "/guardados", label: "Guardados", Icon: BiHeart },
  { to: "/filtros", label: "Filtros", Icon: BiSliderAlt },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      {navItems.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
          title={label}
        >
          <Icon size={28} />
        </NavLink>
      ))}
    </nav>
  );
}