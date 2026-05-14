import { Link } from 'react-router-dom'
import logo from '../imagenes/logo.png'
import logoCirculo from '../imagenes/logo_circulo.png'

export default function Header() {
  return (
    <header className="header">
      <Link to="/">
        <img src={logo} alt="SKALA Logo" className="header-logo" />
      </Link>
      <Link to="/espacio3d" className="header-espacio3d-btn">
        <img src={logoCirculo} alt="Espacio 3D" className="header-espacio3d-img" />
      </Link>
    </header>
  );
}
