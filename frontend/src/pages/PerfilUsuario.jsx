import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './PerfilUsuario.css';
import API_BASE_URL from '../config/api';

export default function PerfilUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`);
        if (!response.ok) {
          throw new Error('Usuario no encontrado');
        }
        const data = await response.json();
        setUsuario(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUsuario();
    }
  }, [id]);

  if (loading) {
    return <div className="perfil-usuario-container"><p>Cargando perfil...</p></div>;
  }

  if (error) {
    return <div className="perfil-usuario-container"><p>Error: {error}</p></div>;
  }

  if (!usuario) {
    return <div className="perfil-usuario-container"><p>Usuario no encontrado</p></div>;
  }

  return (
    <div className="page-container perfil-usuario-container">
      <div className="perfil-card">
        <div className="perfil-header-section">
          <div className="perfil-image-wrapper">
            <img 
              src={usuario.fotoPerfil || 'https://res.cloudinary.com/skala/image/upload/v1777538122/foto_perfil_bmu1ge.jpg'} 
              alt={usuario.username} 
              className="perfil-image-large" 
            />
          </div>
          
          <div className="perfil-info-header">
            <div className="name-block">
              <h1>{usuario.nombreCompleto}</h1>
              <p className="username">@{usuario.username}</p>
            </div>

            <div className="perfil-stats-horizontal centered">
              <div className="stat-item">
                <span className="stat-value">{usuario.seguidores || 0}</span>
                <span className="stat-label">seguidores</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{usuario.seguidos || 0}</span>
                <span className="stat-label">seguidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Ver modelos */}
        <div className="usuario-modelos-section">
          <Link 
            to={`/modelos-usuario/${usuario._id}`}
            className="usuario-modelos-btn"
          >
            <div className="usuario-modelos-placeholder">
              Ver modelos
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
