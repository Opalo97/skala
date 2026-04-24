import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuarioId');
    
    if (!usuarioId) {
      navigate('/login');
      return;
    }

    fetchUsuario(usuarioId);
  }, [navigate]);

  const fetchUsuario = async (usuarioId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuarioId}`);
      if (!response.ok) {
        throw new Error('Error al obtener el perfil');
      }
      const data = await response.json();
      setUsuario(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('username');
    navigate('/');
  };

  if (loading) {
    return <div className="page-container"><p>Cargando perfil...</p></div>;
  }

  if (error) {
    return <div className="page-container"><p>Error: {error}</p></div>;
  }

  if (!usuario) {
    return <div className="page-container"><p>Usuario no encontrado</p></div>;
  }

  return (
    <div className="page-container perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
      </div>

      <div className="perfil-card">
        {usuario.fotoPerfil && (
          <img src={usuario.fotoPerfil} alt={usuario.username} className="perfil-image" />
        )}
        
        <div className="perfil-info">
          <h2>{usuario.nombreCompleto}</h2>
          <p className="username">@{usuario.username}</p>
          <p className="email">{usuario.email}</p>
          
          {usuario.bio && (
            <p className="bio">{usuario.bio}</p>
          )}

          <div className="perfil-stats">
            <div className="stat">
              <span className="stat-label">Seguidores</span>
              <span className="stat-value">{usuario.seguidores || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Siguiendo</span>
              <span className="stat-value">{usuario.seguidos || 0}</span>
            </div>
            {usuario.favoritosInspiraciones && (
              <div className="stat">
                <span className="stat-label">Inspiraciones Guardadas</span>
                <span className="stat-value">{usuario.favoritosInspiraciones.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

