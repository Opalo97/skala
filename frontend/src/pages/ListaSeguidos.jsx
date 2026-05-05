import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ListaUsuarios.css';
import API_BASE_URL from '../config/api';

const DEFAULT_FOTO = 'https://res.cloudinary.com/skala/image/upload/v1777538122/foto_perfil_bmu1ge.jpg';

export default function ListaSeguidos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const myId = localStorage.getItem('usuarioId');

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAccion, setLoadingAccion] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/usuarios/${id}/seguidos`)
      .then(r => r.json())
      .then(data => setDatos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDejarDeSeguir = async (targetId) => {
    if (!myId) { navigate('/login'); return; }
    setLoadingAccion(prev => ({ ...prev, [targetId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${targetId}/seguir`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seguidorId: myId }),
      });
      if (res.ok) {
        setDatos(prev => ({
          ...prev,
          usuario: { ...prev.usuario, seguidos: prev.usuario.seguidos - 1 },
          lista: prev.lista.filter(u => String(u._id) !== String(targetId)),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccion(prev => ({ ...prev, [targetId]: false }));
    }
  };

  if (loading) return <div className="page-container"><p>Cargando...</p></div>;
  if (!datos) return <div className="page-container"><p>Error al cargar</p></div>;

  const { usuario, lista } = datos;

  return (
    <div className="page-container lista-usuarios-container">
      <div className="lista-card">
        <p className="lista-username">@{usuario.username}</p>

        <div className="lista-stats">
          <button className="stat-pill" onClick={() => navigate(`/seguidores/${id}`)}>
            <span className="stat-pill-value">{usuario.seguidores}</span>
            <span className="stat-pill-label">seguidores</span>
          </button>
          <button className="stat-pill active" onClick={() => navigate(`/seguidos/${id}`)}>
            <span className="stat-pill-value">{usuario.seguidos}</span>
            <span className="stat-pill-label">seguidos</span>
          </button>
        </div>

        <h2 className="lista-titulo">Lista de seguidos</h2>

        <div className="lista-usuarios">
          {lista.length === 0 && <p className="lista-vacia">No sigues a nadie todavía</p>}
          {lista.map(u => (
            <div key={u._id} className="usuario-row">
              <img
                src={u.fotoPerfil || DEFAULT_FOTO}
                alt={u.username}
                className="usuario-row-foto"
              />
              <span className="usuario-row-name" onClick={() => navigate(`/perfil/${u._id}`)}>
                @{u.username}
              </span>
              <div className="usuario-row-btns">
                <button
                  className="btn-eliminar-seguidor"
                  onClick={() => handleDejarDeSeguir(u._id)}
                  disabled={loadingAccion[u._id]}
                >
                  - Dejar de seguir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
