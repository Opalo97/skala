import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { BiHeart, BiSolidHeart } from "react-icons/bi";
import { TbCube } from "react-icons/tb";
import axios from "axios";
import "./ItemDetail.css";
import API_BASE_URL from '../config/api';
import Breadcrumb from '../components/Breadcrumb';

export default function ItemDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mediaActual, setMediaActual] = useState(null);
  const [modalGaleriaAbierto, setModalGaleriaAbierto] = useState(false);
  const [esFavorito, setEsFavorito] = useState(false);
  const [inspiracionesRelacionadas, setInspiracionesRelacionadas] = useState([]);
  const [modalModeloAbierto, setModalModeloAbierto] = useState(false);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        const [resProd, resInsp, resUser] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/productos/${id}`),
          axios.get(`${API_BASE_URL}/api/inspiraciones/producto/${id}`),
          usuarioId ? axios.get(`${API_BASE_URL}/api/usuarios/${usuarioId}`) : Promise.resolve(null)
        ]);

        const prod = resProd.data;
        if (prod) {
          setProducto(prod);
          const primerMedia =
            prod.imagenes?.[0] ? { type: 'image', url: prod.imagenes[0] } :
            prod.videos?.[0]   ? { type: 'video', url: prod.videos[0] }   : null;
          if (primerMedia) setMediaActual(primerMedia);
        }
        setInspiracionesRelacionadas(resInsp.data || []);
        if (resUser?.data?.favoritosProductos) {
          setEsFavorito(resUser.data.favoritosProductos.map(String).includes(String(id)));
        }
      } catch (error) {
        console.error("Error al cargar producto:", error);
        setProducto(null);
      } finally {
        setCargando(false);
      }
    };
    fetchProducto();
  }, [id]);

  const toggleFavorito = async () => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/usuarios/${usuarioId}/favorito-producto`,
        { productoId: id }
      );
      setEsFavorito(res.data.favorito);
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

if (cargando) return <div className="p-10 text-center">Cargando producto...</div>;
  if (!producto) return <div className="p-10 text-center">Producto no encontrado</div>;

  const allMedia = [
    ...(producto.imagenes || []).map(url => ({ type: 'image', url })),
    ...(producto.videos   || []).map(url => ({ type: 'video', url })),
  ];
  const totalMedia    = allMedia.length;
  const mostrarColumna = totalMedia > 1;
  const thumbnails    = allMedia.slice(0, 3);
  const btnActivo     = totalMedia > 4;
  const mediaEnMain   = mediaActual || allMedia[0] || { type: 'image', url: '' };

  const nextCrumbs = [
    ...(location.state?.breadcrumbs || [{ label: 'Inicio', to: '/' }]),
    { label: producto.nombre, to: `/item/${id}` }
  ]

  return (
    <div className="item-detail-page">
      <Breadcrumb current={producto.nombre} />
      <div className="item-detail-container" style={{flexDirection: "column"}}>
        <div style={{display: "flex", gap: "40px"}}>
          
          {/* Lado Izquierdo: Galería */}
          <div className="gallery-section">
            <div className="main-image-container">
              {mediaEnMain.type === 'image' && (
                <a href={mediaEnMain.url} target="_blank" rel="noreferrer">
                  <img src={mediaEnMain.url} alt={producto.nombre} className="main-image" />
                </a>
              )}
              {mediaEnMain.type === 'video' && (
                <video src={mediaEnMain.url} controls className="main-image main-video" />
              )}
              {mediaEnMain.type === 'model' && (
                <div className="main-image model-placeholder">
                  <span>Modelo 3D</span>
                </div>
              )}
            </div>

            {mostrarColumna && (
              <div className="thumbnails-column">
                {thumbnails.map((media, i) => {
                  const esActivo = mediaActual?.url === media.url;
                  if (media.type === 'image') return (
                    <img
                      key={i}
                      src={media.url}
                      alt={`Vista ${i + 1}`}
                      className={`thumbnail-img${esActivo ? ' active' : ''}`}
                      onClick={() => setMediaActual(media)}
                    />
                  );
                  if (media.type === 'video') return (
                    <video
                      key={i}
                      src={media.url}
                      muted
                      className={`thumbnail-img${esActivo ? ' active' : ''}`}
                      onClick={() => setMediaActual(media)}
                    />
                  );
                  if (media.type === 'model') return (
                    <div
                      key={i}
                      className={`thumbnail-img model-thumb${esActivo ? ' active' : ''}`}
                      onClick={() => setMediaActual(media)}
                    >3D</div>
                  );
                  return null;
                })}
                <button
                  className={`add-thumbnail-btn${btnActivo ? '' : ' disabled'}`}
                  onClick={btnActivo ? () => setModalGaleriaAbierto(true) : undefined}
                  disabled={!btnActivo}
                  title={btnActivo ? 'Mostrar más multimedia' : 'No hay más multimedia subida.'}
                >+</button>
              </div>
            )}
          </div>

          {/* Lado Derecho: Detalles */}
          <div className="info-section">
            <div className="info-header">
              <div className="title-price">
                <h1 className="product-title">{producto.nombre}</h1>
                <p className="product-price">{producto.precio}€</p>
              </div>
              <button className="fav-btn" onClick={toggleFavorito}>
                {esFavorito ? <BiSolidHeart size={28} /> : <BiHeart size={28} />}
              </button>
            </div>

            <a
              href={producto.linkCompra.startsWith("http") ? producto.linkCompra : `https://${producto.linkCompra}`}
              target="_blank"
              rel="noreferrer"
              className="store-btn"
            >
              Ir a la tienda del vendedor
            </a>
            
            {producto.modelo3d && (
              <button className="modelo3d-btn" onClick={() => setModalModeloAbierto(true)}>
                <TbCube size={20} />
                Ver modelo 3D
              </button>
            )}

            <p className="vendor-text">Vendedor: {producto.vendedor || 'Desconocido'}</p>

            <div className="specs-container">
              <h3 className="specs-title">Especificaciones Técnicas</h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td className="specs-label">Dimensiones</td>
                    <td className="specs-value">{producto.especificaciones?.dimensiones || '-'}</td>
                  </tr>
                  <tr>
                    <td className="specs-label">Materiales</td>
                    <td className="specs-value">{producto.especificaciones?.materiales || '-'}</td>
                  </tr>
                  <tr>
                    <td className="specs-label">Color</td>
                    <td className="specs-value">{producto.especificaciones?.color || '-'}</td>
                  </tr>
                  <tr>
                    <td className="specs-label">Peso</td>
                    <td className="specs-value">{producto.especificaciones?.peso || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="uploader-section">
              <span className="uploader-title">Subido por ...</span>
              {producto.subidoPor && (
                <Link to={`/perfil/${producto.subidoPor._id || producto.subidoPor}`} state={{ breadcrumbs: nextCrumbs }} className="uploader-pill">
                  @{producto.subidoPor.username || 'usuario'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Inspiraciones Relacionadas */}
        {inspiracionesRelacionadas.length > 0 && (
          <div className="related-inspirations-container">
            <h2 className="related-title">Aparece en estas inspiraciones</h2>
            <div className="inspirations-grid">
              {inspiracionesRelacionadas.map((insp) => (
                insp.multimedia?.imagenes?.length > 0 && (
                  <Link
                    key={insp._id}
                    to={`/inspiracion/${insp._id}`}
                    state={{ breadcrumbs: nextCrumbs }}
                    className="inspiration-card"
                  >
                    <img
                      src={insp.multimedia.imagenes[0]}
                      alt={insp.nombre}
                      className="inspiration-img"
                    />
                  </Link>
                )
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal visor 3D */}
      {modalModeloAbierto && (
        <div className="galeria-overlay" onClick={() => setModalModeloAbierto(false)}>
          <div className="modelo3d-modal" onClick={e => e.stopPropagation()}>
            <button className="galeria-modal-close" onClick={() => setModalModeloAbierto(false)}>×</button>
            <h3 className="galeria-modal-titulo">Vista 3D — {producto.nombre}</h3>
            {/* eslint-disable-next-line */}
            <model-viewer
              src={producto.modelo3d}
              alt={producto.nombre}
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '500px', borderRadius: '16px', background: '#f5ece0' }}
            />
          </div>
        </div>
      )}

      {/* Modal galería completa (solo accesible con 5+ multimedias) */}
      {modalGaleriaAbierto && (
        <div className="galeria-overlay" onClick={() => setModalGaleriaAbierto(false)}>
          <div className="galeria-modal" onClick={e => e.stopPropagation()}>
            <button className="galeria-modal-close" onClick={() => setModalGaleriaAbierto(false)}>×</button>
            <h3 className="galeria-modal-titulo">Galería completa</h3>
            <div className="galeria-modal-grid">
              {allMedia.map((media, i) => {
                const esSeleccionada = mediaActual?.url === media.url;
                if (media.type === 'image') return (
                  <img
                    key={i}
                    src={media.url}
                    alt={`Media ${i + 1}`}
                    className={`galeria-modal-item${esSeleccionada ? ' seleccionada' : ''}`}
                    onClick={() => { setMediaActual(media); setModalGaleriaAbierto(false); }}
                  />
                );
                if (media.type === 'video') return (
                  <video
                    key={i}
                    src={media.url}
                    muted
                    className={`galeria-modal-item${esSeleccionada ? ' seleccionada' : ''}`}
                    onClick={() => { setMediaActual(media); setModalGaleriaAbierto(false); }}
                  />
                );
                if (media.type === 'model') return (
                  <div
                    key={i}
                    className={`galeria-modal-item model-thumb${esSeleccionada ? ' seleccionada' : ''}`}
                    onClick={() => { setMediaActual(media); setModalGaleriaAbierto(false); }}
                  >3D</div>
                );
                return null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}