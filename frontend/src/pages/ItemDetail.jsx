import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BiHeart, BiSolidHeart } from "react-icons/bi";
import axios from "axios";
import "./ItemDetail.css";

export default function ItemDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState("");
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/productos/${id}`);
        const prod = res.data;
        
        if (prod) {
          setProducto(prod);
          if (prod.imagenes && prod.imagenes.length > 0) {
            setImagenPrincipal(prod.imagenes[0]);
          }
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

  const toggleFavorito = () => {
    // Logica local para interactuar con la funcion favorita si existiera,
    setEsFavorito(!esFavorito);
  };

  const handleImagenClick = (img) => {
    setImagenPrincipal(img);
  };

  const handleAddThumbnail = () => {
    // Podría abrir un modal para añadir fotos si el usuario actual es dueño o simplemente un alert por ahora.
  };

  if (cargando) return <div className="p-10 text-center">Cargando producto...</div>;
  if (!producto) return <div className="p-10 text-center">Producto no encontrado</div>;

  const mMockImgs = producto.imagenes?.length > 1 ? producto.imagenes.slice(0, 3) : [
    "https://via.placeholder.com/100x120?text=IMG1",
    "https://via.placeholder.com/100x120?text=IMG2"
  ];
  
  const mockPrincipal = imagenPrincipal || "https://via.placeholder.com/600x800?text=Butaca";

  return (
    <div className="item-detail-page">
      <div className="item-detail-container" style={{flexDirection: "column"}}>
        <div style={{display: "flex", gap: "40px"}}>
          {/* Lado Izquierdo: Galería */}
          <div className="gallery-section">
            <div className="main-image-container">
              <img src={mockPrincipal} alt={producto.nombre} className="main-image" />
            </div>
            <div className="thumbnails-column">
              {mMockImgs.map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt={`Thumbnail ${i}`}
                  className={`thumbnail-img ${mockPrincipal === imgUrl ? 'active' : ''}`}
                  onClick={() => handleImagenClick(imgUrl)}
                />
              ))}
              <button className="add-thumbnail-btn" onClick={handleAddThumbnail}>+</button>
            </div>
          </div>

          {/* Lado Derecho: Detalles */}
          <div className="info-section">
            <div className="info-header">
              <div className="title-price">
                <h1 className="product-title">{producto.nombre}</h1>
                <p className="product-price">€{producto.precio}</p>
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
                <Link to={`/perfil/${producto.subidoPor._id || producto.subidoPor}`} className="uploader-pill">
                  @{producto.subidoPor.username || 'usuario'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Inspiraciones Relacionadas */}
        <div className="related-inspirations-container">
          <h2 className="related-title" style={{textAlign: "left"}}>Aparece en estas inspiraciones</h2>
          <div className="inspirations-grid">
            <div className="inspiration-card">
              <img src="https://via.placeholder.com/800x400?text=Inspiracion+1" alt="Insp 1" className="inspiration-img" />
            </div>
            <div className="inspiration-card">
              <img src="https://via.placeholder.com/800x400?text=Inspiracion+2" alt="Insp 2" className="inspiration-img" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}