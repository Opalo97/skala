import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CrearInspiracion.css';

export default function CrearInspiracion() {
  const navigate = useNavigate();

  // 1. Estados del formulario
  const [nombre, setNombre] = useState('');
  const [zonaCasa, setZonaCasa] = useState('');
  const [categoria, setCategoria] = useState('');
  
  // 2. Estados para Multimedia
  const [archivos, setArchivos] = useState([]); // { id, file, preview, type }
  const [cargando, setCargando] = useState(false);

  // Estados para modal y muebles
  const [showModal, setShowModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [mueblesSeleccionados, setMueblesSeleccionados] = useState([]);
  const [modalSearch, setModalSearch] = useState('');

  // --- DATOS CLOUDINARY (Usa los mismos que en subir producto) ---
  const CLOUD_NAME = "skala"; 
  const UPLOAD_PRESET = "subida_productos"; 

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const nuevos = files.map(file => ({
      id: Math.random().toString(36).substr(2,9),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));
    setArchivos(prev => [...prev, ...nuevos]);
  };

  const eliminarArchivo = (id) => {
    setArchivos(prev => prev.filter(a => a.id !== id));
  };

  // Modal productos
  const openModalProductos = async () => {
    setShowModal(true);
    setModalSearch('');
    if (productos.length > 0) return;
    try {
      setLoadingProductos(true);
      const res = await axios.get('http://localhost:5000/api/productos');
      setProductos(res.data || []);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoadingProductos(false);
    }
  };

  const cerrarModal = () => setShowModal(false);

  const añadirMueble = (producto) => {
    if (mueblesSeleccionados.find(p => p._id === producto._id)) return;
    setMueblesSeleccionados(prev => [...prev, producto]);
    // Cerrar modal automáticamente tras añadir
    setShowModal(false);
  };

  const eliminarMueble = (id) => {
    setMueblesSeleccionados(prev => prev.filter(m => m._id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (archivos.length === 0) return alert("Por favor, sube al menos una imagen o vídeo");

    setCargando(true);
    try {
      // Enviar archivos y campos al backend; el servidor subirá a Cloudinary
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('zonaCasa', zonaCasa);
      formData.append('categoriaDecoracion', categoria);
      formData.append('autor', localStorage.getItem('usuarioId') || '69f30852bc81edf1454bd806');
      formData.append('muebles', JSON.stringify(mueblesSeleccionados.map(m => m._id)));

      archivos.forEach(a => formData.append('multimedia', a.file));

      await axios.post('http://localhost:5000/api/inspiraciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('¡Inspiración creada con éxito!');
      navigate('/');
    } catch (error) {
      console.error('Error al crear inspiracion:', error.response?.data || error.message || error);
      alert('Error al crear la inspiración');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="crear-insp-container">
      <h1 className="insp-title">Crear Inspiración</h1>

      <form className="insp-form" onSubmit={handleSubmit}>
        
        {/* SECCIÓN MULTIMEDIA */}
        <div className="media-section">
          <label>Añadir multimedia</label>
          <div className="upload-box">
            <div className="media-uploader" onClick={() => document.getElementById('insp-input').click()}>
              {archivos.length === 0 ? (
                <div className="upload-placeholder">
                  <div className="plus-circle">+</div>
                  <span>Click para fotos/vídeos</span>
                </div>
              ) : (
                <div className="media-gallery horizontal-scroll">
                  {archivos.map(item => (
                    <div key={item.id} className="media-item-container">
                      <div className="media-item">
                        {item.type === 'image' ? (
                          <img src={item.preview} alt="media" className="media-thumbnail" />
                        ) : (
                          <div className="media-placeholder">🎥</div>
                        )}
                      </div>
                      <button type="button" className="media-delete" onClick={(e) => { e.stopPropagation(); eliminarArchivo(item.id); }} title="Eliminar">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input id="insp-input" type="file" multiple onChange={handleFileChange} accept="image/*,video/*" style={{ display: 'none' }} />
            </div>
          </div>

        </div>

        <div className="upload-more">
          <button type="button" className="btn-subir-mas" onClick={() => document.getElementById('insp-input').click()}>
            Subir más multimedia
          </button>
        </div>

        {/* CAMPOS DE TEXTO */}
        <div className="fields-section">
          <div className="input-group">
            <label>Nombre de inspiración</label>
            <input 
              type="text" 
              placeholder="Ej: Rincón de lectura" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Zona de la casa</label>
            <input 
              type="text" 
              placeholder="Ej: Salón" 
              value={zonaCasa}
              onChange={(e) => setZonaCasa(e.target.value)}
              required
            />
          </div>

          {/* Modal de selección de productos */}
          {showModal && (
            <div className="modal-overlay" onClick={cerrarModal}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Selecciona muebles</h3>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      style={{padding:8, borderRadius:8, border:'1px solid #ddd'}}
                    />
                    <button onClick={cerrarModal} className="product-add-btn">Cerrar</button>
                  </div>
                </div>
                {loadingProductos ? (
                  <div>Cargando...</div>
                ) : (
                  <div className="modal-grid">
                    {productos
                      .filter(p => !modalSearch || (p.nombre || '').toLowerCase().includes(modalSearch.toLowerCase()))
                      .map(p => (
                        <div key={p._id} className="product-card">
                          <img className="product-thumb" src={(p.imagenes && p.imagenes[0]) || ''} alt={p.nombre} />
                          <div className="product-name">{p.nombre}</div>
                          <div className="product-vendor">{p.vendedor}</div>
                          <button className="product-add-btn" onClick={() => añadirMueble(p)}>Añadir</button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Categoría de decoración</label>
            <input 
              type="text" 
              placeholder="Ej: Minimalista" 
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            />
          </div>

          <div className="add-mueble-section">
            <label>Añadir mueble</label>
            <button type="button" className="btn-add-mueble" onClick={openModalProductos}>+</button>
            <div className="selected-muebles">
              {mueblesSeleccionados.map(m => (
                <div key={m._id} className="mueble-item">
                  <img src={m.imagenes && m.imagenes[0]} alt={m.nombre} className="mueble-thumb" />
                  <div className="mueble-info">
                    <div className="mueble-nombre">{m.nombre}</div>
                    <div className="mueble-vendedor">{m.vendedor}</div>
                  </div>
                  <button type="button" className="mueble-delete" onClick={() => eliminarMueble(m._id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTONES ACCIÓN */}
        <div className="form-footer">
          <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Cancelar</button>
          <button type="submit" className="btn-save" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}