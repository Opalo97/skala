import { Link, useLocation } from 'react-router-dom';
import { BiChevronRight } from 'react-icons/bi';
import './Breadcrumb.css';

export default function Breadcrumb({ current }) {
  const location = useLocation();
  const crumbs = location.state?.breadcrumbs;

  if (!crumbs?.length) return null;

  // Garantizar que el primer crumb siempre es Inicio
  const trail = crumbs[0]?.to === '/'
    ? crumbs
    : [{ label: 'Inicio', to: '/' }, ...crumbs];

  return (
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      {trail.map((crumb, i) => (
        <span key={i} className="breadcrumb-item">
          <Link
            to={crumb.to}
            state={{ breadcrumbs: trail.slice(0, i) }}
            className="breadcrumb-link"
          >
            {crumb.label}
          </Link>
          <BiChevronRight size={13} className="breadcrumb-sep" />
        </span>
      ))}
      {current && <span className="breadcrumb-current">{current}</span>}
    </nav>
  );
}
