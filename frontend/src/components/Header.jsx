import { Link } from 'react-router-dom'
import logo from '../imagenes/logo.png'

export default function Header() {
  return (
    <header className="header">
      <Link to="/">
        <img src={logo} alt="SKALA Logo" className="header-logo" />
      </Link>
    </header>
  );
}
