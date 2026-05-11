import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './PerfilUsuario.css';
import API_BASE_URL from '../config/api';
import Breadcrumb from '../components/Breadcrumb';

export default function PerfilUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [siguiendo, setSiguiendo] = useState(false);
  const [seguidores, setSeguidores] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const usuarioActualId = localStorage.getItem('usuarioId');

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`);
        if (!response.ok) {
          throw new Error('Usuario no encontrado');
        }
        const data = await response.json();
        setUsuario(data);
        setSeguidores(data.seguidores || 0);
        if (usuarioActualId && data.seguidoresList) {
          setSiguiendo(data.seguidoresList.map(String).includes(String(usuarioActualId)));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUsuario();
    }
  }, [id, usuarioActualId]);

  const handleToggleSeguir = async () => {
    if (!usuarioActualId) {
      navigate('/login');
      return;
    }
    setLoadingFollow(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}/seguir`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seguidorId: usuarioActualId }),
      });
      if (!response.ok) throw new Error('Error al actualizar seguimiento');
      const data = await response.json();
      setSiguiendo(data.siguiendo);
      setSeguidores(data.seguidores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) {
    return <div className="perfil-usuario-container"><p>Cargando perfil...</p></div>;
  }

  if (error) {
    return <div className="perfil-usuario-container"><p>Error: {error}</p></div>;
  }

  if (!usuario) {
    return <div className="perfil-usuario-container"><p>Usuario no encontrado</p></div>;
  }

  const esPropioPeril = String(usuarioActualId) === String(usuario._id);

  return (
    <div className="page-container perfil-usuario-container">
      <Breadcrumb current={`@${usuario.username}`} />
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
            <div className="name-follow-block">
              <div className="name-block">
                <h1>{usuario.nombreCompleto}</h1>
                <p className="username">@{usuario.username}</p>
              </div>
              {!esPropioPeril && (
                <button
                  className={`btn-seguir ${siguiendo ? 'siguiendo' : ''}`}
                  onClick={handleToggleSeguir}
                  disabled={loadingFollow}
                >
                  {siguiendo ? 'Siguiendo' : '+ Seguir'}
                </button>
              )}
            </div>

            <div className="perfil-stats-horizontal centered">
              <div className="stat-item">
                <span className="stat-value">{seguidores}</span>
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