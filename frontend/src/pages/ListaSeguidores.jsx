import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ListaUsuarios.css';
import API_BASE_URL from '../config/api';

const DEFAULT_FOTO = 'https://res.cloudinary.com/skala/image/upload/v1777538122/foto_perfil_bmu1ge.jpg';

export default function ListaSeguidores() {
  const { id } = useParams();
  const navigate = useNavigate();
  const myId = localStorage.getItem('usuarioId');

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set de IDs que YO sigo
  const [sigoSet, setSigoSet] = useState(new Set());
  const [loadingAccion, setLoadingAccion] = useState({});
  const [loadingEliminar, setLoadingEliminar] = useState({});

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const [resSeguidores, resMisSeguidos] = await Promise.all([
          fetch(`${API_BASE_URL}/api/usuarios/${id}/seguidores`),
          myId ? fetch(`${API_BASE_URL}/api/usuarios/${myId}/seguidos`) : Promise.resolve(null),
        ]);

        const dataSeguidores = await resSeguidores.json();
        setDatos(dataSeguidores);

        if (resMisSeguidos && resMisSeguidos.ok) {
          const dataSeguidos = await resMisSeguidos.json();
          setSigoSet(new Set(dataSeguidos.lista.map(u => String(u._id))));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [id, myId]);

  const handleEliminarSeguidor = async (seguidorId) => {
    if (!myId) { navigate('/login'); return; }
    setLoadingEliminar(prev => ({ ...prev, [seguidorId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${id}/seguir`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seguidorId }),
      });
      if (res.ok) {
        setDatos(prev => ({
          ...prev,
          usuario: { ...prev.usuario, seguidores: prev.usuario.seguidores - 1 },
          lista: prev.lista.filter(u => String(u._id) !== String(seguidorId)),
        }));
        setSigoSet(prev => { const next = new Set(prev); next.delete(String(seguidorId)); return next; });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEliminar(prev => ({ ...prev, [seguidorId]: false }));
    }
  };

  const handleToggleSeguir = async (targetId) => {
    if (!myId) { navigate('/login'); return; }
    setLoadingAccion(prev => ({ ...prev, [targetId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${targetId}/seguir`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seguidorId: myId }),
      });
      if (res.ok) {
        setSigoSet(prev => {
          const next = new Set(prev);
          if (next.has(String(targetId))) {
            next.delete(String(targetId));
          } else {
            next.add(String(targetId));
          }
          return next;
        });
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
  const esMiPerfil = String(id) === String(myId);

  return (
    <div className="page-container lista-usuarios-container">
      <div className="lista-card">
        <p className="lista-username">@{usuario.username}</p>

        <div className="lista-stats">
          <button className="stat-pill active" onClick={() => navigate(`/seguidores/${id}`)}>
            <span className="stat-pill-value">{usuario.seguidores}</span>
            <span className="stat-pill-label">seguidores</span>
          </button>
          <button className="stat-pill" onClick={() => navigate(`/seguidos/${id}`)}>
            <span className="stat-pill-value">{usuario.seguidos}</span>
            <span className="stat-pill-label">seguidos</span>
          </button>
        </div>

        <h2 className="lista-titulo">Lista de seguidores</h2>

        <div className="lista-usuarios">
          {lista.length === 0 && <p className="lista-vacia">Sin seguidores todavía</p>}
          {lista.map(u => {
            const yoSigo = sigoSet.has(String(u._id));
            return (
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
                  {yoSigo ? (
                    <button
                      className="btn-eliminar-seguidor"
                      onClick={() => handleToggleSeguir(u._id)}
                      disabled={loadingAccion[u._id]}
                    >
                      - Dejar de seguir
                    </button>
                  ) : (
                    <button
                      className="btn-seguir-lista"
                      onClick={() => handleToggleSeguir(u._id)}
                      disabled={loadingAccion[u._id]}
                    >
                      + Seguir
                    </button>
                  )}
                  {esMiPerfil && (
                    <button
                      className="btn-eliminar-seguidor"
                      onClick={() => handleEliminarSeguidor(u._id)}
                      disabled={loadingEliminar[u._id]}
                    >
                      - Eliminar seguidor
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
