import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <p>© SKALA 2026</p>
      <Link to="/privacy-policy">Política de privacidad</Link>
    </footer>
  );
}