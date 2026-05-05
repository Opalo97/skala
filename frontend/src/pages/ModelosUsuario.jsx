import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BiHeart, BiCommentDetail } from 'react-icons/bi';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './ModelosUsuario.css';

function TarjetaInspiracion({ inspiracion }) {
  const imagenUrl = inspiracion.multimedia?.imagenes?.[0] || 'https://via.placeholder.com/400x500';

  return (
    <Link 
      to={`/inspiracion/${inspiracion._id}`}
      className="model-card inspiration-card"
    >
      <div className="image-container">
        <img src={imagenUrl} alt={inspiracion.nombre} className="model-image" />
      </div>
      <div className="card-footer">
        <div className="card-stats">
          <span className="stat"><BiHeart size={18} /> {inspiracion.likes || 0}</span>
          <span className="stat"><BiCommentDetail size={18} /> {inspiracion.comentarios?.length || 0}</span>
        </div>
      </div>
    </Link>
  );
}

function TarjetaProducto({ producto }) {
  const imagenUrl = producto.imagenes?.[0] || 'https://via.placeholder.com/400';

  return (
    <Link 
      to={`/item/${producto._id}`}
      className="model-card product-card"
    >
      <div className="image-container">
        <img src={imagenUrl} alt={producto.nombre} className="model-image" />
      </div>
      <div className="card-footer">
        <div className="card-stats">
          <span className="stat"><BiHeart size={18} /> {producto.likes || 0}</span>
          <span className="stat"><BiCommentDetail size={18} /> {producto.comentarios?.length || 0}</span>
        </div>
      </div>
    </Link>
  );
}

export default function ModelosUsuario() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [inspiraciones, setInspiraciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resUser, resInsp, resProd] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/usuarios/${id}`),
          axios.get(`${API_BASE_URL}/api/inspiraciones/usuario/${id}`),
          axios.get(`${API_BASE_URL}/api/productos/usuario/${id}`)
        ]);

        setUsuario(resUser.data);
        setInspiraciones(resInsp.data);
        setProductos(resProd.data);
      } catch (err) {
        console.error("Error cargando modelos del usuario:", err);
        setError('No se pudieron cargar las publicaciones de este usuario.');
      }
      setCargando(false);
    };

    if (id) {
      cargarDatos();
    }
  }, [id]);

  if (cargando) return <div className="modelos-usuario-container"><p className="status-msg">Cargando...</p></div>;
  if (error) return <div className="modelos-usuario-container"><p className="status-msg error">{error}</p></div>;

  return (
    <div className="modelos-usuario-container">
      
      {/* CABECERA DEL PERFIL */}
      {usuario && (
        <header className="perfil-info-header-modelos">
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

      {/* SECCIÓN: INSPIRACIONES */}
      <section className="modelos-section">
        <div className="section-header">
          <div className="header-titles">
            <h1>Inspiraciones</h1>
          </div>
        </div>

        {inspiraciones.length === 0 ? (
          <p className="empty-msg">Este usuario no ha subido ninguna inspiración.</p>
        ) : (
          <div className="horizontal-scroll-container">
            {inspiraciones.map(insp => (
              <TarjetaInspiracion 
                key={insp._id} 
                inspiracion={insp}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN: PRODUCTOS */}
      <section className="modelos-section">
        <div className="section-header">
          <div className="header-titles">
            <h1>Productos</h1>
          </div>
        </div>

        {productos.length === 0 ? (
          <p className="empty-msg">Este usuario no ha subido ningún producto.</p>
        ) : (
          <div className="horizontal-scroll-container">
            {productos.map(prod => (
              <TarjetaProducto 
                key={prod._id} 
                producto={prod}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
