import logo from '../imagenes/logo.png'

export default function Header() {
  return (
    <header className="header">
      <img src={logo} alt="SKALA Logo" className="header-logo" />
    </header>
  );
}
