import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { BiHeart, BiCommentDetail, BiDotsHorizontalRounded, BiEdit, BiTrash } from 'react-icons/bi';
import './MisModelos.css';

// Componente para el menú flotante tipo "bocadillo" (Kebab Menu)
function MenuOpciones({ isOpen, onClose, onEdit, onDelete }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="menu-overlay" onClick={onClose}></div>
      <div className="kebab-dropdown">
        <button className="kebab-action-btn" onClick={onEdit} title="Editar">
          <BiEdit size={20} />
        </button>
        <button className="kebab-action-btn" onClick={onDelete} title="Eliminar">
          <BiTrash size={20} />
        </button>
      </div>
    </>
  );
}

function TarjetaInspiracion({ inspiracion, openMenuId, onToggleMenu, onEliminar }) {
  const imagenUrl = inspiracion.multimedia?.imagenes?.[0] || 'https://via.placeholder.com/400x500';
  const isMenuOpen = openMenuId === `insp-${inspiracion._id}`;

  return (
    <div className="model-card inspiration-card">
      <div className="image-container">
        <img src={imagenUrl} alt={inspiracion.nombre} className="model-image" />
      </div>
      <div className="card-footer">
        <div className="card-stats">
          <span className="stat"><BiHeart size={18} /> {inspiracion.likes || 0}</span>
          <span className="stat"><BiCommentDetail size={18} /> {inspiracion.comentarios?.length || 0}</span>
        </div>
        <div className="kebab-container">
          <button className="kebab-dot-btn" onClick={() => onToggleMenu(`insp-${inspiracion._id}`)}>
            <BiDotsHorizontalRounded size={24} />
          </button>
          <MenuOpciones 
            isOpen={isMenuOpen} 
            onClose={() => onToggleMenu(null)}
            onEdit={() => alert('Función de editar próximamente')}
            onDelete={() => onEliminar(inspiracion._id, 'inspiracion')}
          />
        </div>
      </div>
    </div>
  );
}

function TarjetaProducto({ producto, openMenuId, onToggleMenu, onEliminar }) {
  const navigate = useNavigate();
  const imagenUrl = producto.imagenes?.[0] || 'https://via.placeholder.com/400';
  const isMenuOpen = openMenuId === `prod-${producto._id}`;

  return (
    <div className="model-card product-card">
      <div className="image-container">
        <img src={imagenUrl} alt={producto.nombre} className="model-image" />
      </div>
      <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        {/* Div vacío para mantener la estructura y empujar los puntos a la derecha */}
        <div className="card-stats"></div> 
        
        <div className="kebab-container" style={{ flexGrow: 0 }}>
          <button className="kebab-dot-btn" onClick={() => onToggleMenu(`prod-${producto._id}`)}>
            <BiDotsHorizontalRounded size={24} />
          </button>
          <MenuOpciones 
            isOpen={isMenuOpen} 
            onClose={() => onToggleMenu(null)}
            onEdit={() => navigate(`/editar-producto/${producto._id}`)}
            onDelete={() => onEliminar(producto._id, 'producto')}
          />
        </div>
      </div>
    </div>
  );
}

export default function MisModelos() {
  const [usuario, setUsuario] = useState(null);
  const [misInspiraciones, setMisInspiraciones] = useState([]);
  const [misProductos, setMisProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para controlar qué menú de los 3 puntitos está abierto
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('usuarioId');
    if (!userId) {
      setError('No se pudo encontrar la ID del usuario. Asegúrate de estar logueado.');
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        const [resUser, resInsp, resProd] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/usuarios/${userId}`),
          axios.get(`${API_BASE_URL}/api/inspiraciones/usuario/${userId}`),
          axios.get(`${API_BASE_URL}/api/productos/usuario/${userId}`)
        ]);

        setUsuario(resUser.data);
        setMisInspiraciones(resInsp.data);
        setMisProductos(resProd.data);
      } catch (err) {
        console.error("Error cargando tus modelos:", err);
        setError('No se pudieron cargar tus publicaciones.');
      }
      setCargando(false);
    };

    cargarDatos();
  }, []);

  const handleToggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleEliminar = async (id, tipo) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar est${tipo === 'inspiracion' ? 'a' : 'e'} ${tipo}?`)) {
      setOpenMenuId(null); // Cierra el menú
      try {
        const endpoint = tipo === 'inspiracion' ? 'inspiraciones' : 'productos';
        await axios.delete(`${API_BASE_URL}/api/${endpoint}/${id}`);
        
        if (tipo === 'inspiracion') {
          setMisInspiraciones(prev => prev.filter(item => item._id !== id));
        } else {
          setMisProductos(prev => prev.filter(item => item._id !== id));
        }
      } catch (error) {
        console.error(error);
        alert("Error al eliminar");
      }
    }
  };

  if (cargando) return <div className="mis-modelos-container"><p className="status-msg">Cargando...</p></div>;
  if (error) return <div className="mis-modelos-container"><p className="status-msg error">{error}</p></div>;

  return (
    <div className="mis-modelos-container">
      
      {/* CABECERA DEL PERFIL */}
      {usuario && (
        <header className="perfil-info-header-mis-modelos">
          <img 
            src={usuario.fotoPerfil || 'https://res.cloudinary.com/skala/image/upload/v1777538122/foto_perfil_bmu1ge.jpg'} 
            alt={usuario.username} 
            className="avatar-perfil" 
          />
          <div className="perfil-textos">
            <h2>{usuario.username}</h2>
            <p>{usuario.biografia || 'Me mola diseñar habitaciones'}</p>
          </div>
        </header>
      )}

      {/* SECCIÓN: MIS INSPIRACIONES */}
      <section className="modelos-section">
        <div className="section-header">
          <div className="header-titles">
            <h1>Mis Inspiraciones</h1>
            <div className="tabs">
              <span className="tab active">Publicados</span>
              <span className="tab">Borradores</span>
            </div>
          </div>
          <Link to="/crear-inspiracion" className="btn-crear-accion">
            + Crear Inspiración
          </Link>
        </div>

        {misInspiraciones.length === 0 ? (
          <p className="empty-msg">No has subido ninguna inspiración.</p>
        ) : (
          <div className="horizontal-scroll-container">
            {misInspiraciones.map(insp => (
              <TarjetaInspiracion 
                key={insp._id} 
                inspiracion={insp} 
                openMenuId={openMenuId}
                onToggleMenu={handleToggleMenu}
                onEliminar={handleEliminar} 
              />
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN: MIS MUEBLES */}
      <section className="modelos-section">
        <div className="section-header">
          <div className="header-titles">
            <h1>Mis muebles</h1>
          </div>
          <Link to="/upload" className="btn-crear-accion">
            + Subir Mueble
          </Link>
        </div>

        {misProductos.length === 0 ? (
          <p className="empty-msg">No has subido ningún mueble.</p>
        ) : (
          <div className="horizontal-scroll-container">
            {misProductos.map(prod => (
              <TarjetaProducto 
                key={prod._id} 
                producto={prod} 
                openMenuId={openMenuId}
                onToggleMenu={handleToggleMenu}
                onEliminar={handleEliminar} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}