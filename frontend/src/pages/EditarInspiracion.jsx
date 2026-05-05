import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './CrearInspiracion.css'; // Reutilizamos el mismo CSS
import API_BASE_URL from '../config/api';

export default function EditarInspiracion() {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtenemos la ID de la URL

  // 1. Estados del formulario
  const [nombre, setNombre] = useState('');
  const [zonaCasa, setZonaCasa] = useState('');
  const [categoria, setCategoria] = useState('');

  // 2. Estados para Multimedia (Separamos existentes de nuevos)
  const [archivosExistentes, setArchivosExistentes] = useState([]); // { type: 'image'|'video', url: '...' }
  const [archivosNuevos, setArchivosNuevos] = useState([]); // { id, file, preview, type }
  
  // 3. Estados de control y modal
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [mueblesSeleccionados, setMueblesSeleccionados] = useState([]);
  const [modalSearch, setModalSearch] = useState('');

  // Cargar datos actuales de la inspiración al entrar
  useEffect(() => {
    const cargarInspiracion = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/inspiraciones/${id}`);
        const insp = res.data;

        setNombre(insp.nombre || '');
        setZonaCasa(insp.zonaCasa || '');
        setCategoria(insp.categoriaDecoracion || '');
        setMueblesSeleccionados(insp.productos || []); // Asumimos que el backend devuelve los objetos populados

        // Formatear multimedia existente
        const mediaExistente = [
          ...(insp.multimedia?.imagenes || []).map(url => ({ type: 'image', url })),
          ...(insp.multimedia?.videos || []).map(url => ({ type: 'video', url }))
        ];
        setArchivosExistentes(mediaExistente);

        setCargando(false);
      } catch (err) {
        setError('Error al cargar los datos de la inspiración.');
        setCargando(false);
      }
    };
    cargarInspiracion();
  }, [id]);

  // Limpiar URLs de preview al desmontar
  useEffect(() => {
    return () => {
      archivosNuevos.forEach(a => {
        if (a.preview) URL.revokeObjectURL(a.preview);
      });
    };
  }, [archivosNuevos]);

  // Manejo de archivos nuevos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const nuevos = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    setArchivosNuevos(prev => [...prev, ...nuevos]);
  };

  const eliminarArchivoExistente = (url) => {
    setArchivosExistentes(prev => prev.filter(a => a.url !== url));
  };

  const eliminarArchivoNuevo = (idFoto) => {
    setArchivosNuevos(prev => {
      const foto = prev.find(f => f.id === idFoto);
      if (foto?.preview) URL.revokeObjectURL(foto.preview);
      return prev.filter(f => f.id !== idFoto);
    });
  };

  // Modal productos
  const openModalProductos = async () => {
    setShowModal(true);
    setModalSearch('');
    if (productos.length > 0) return;
    try {
      setLoadingProductos(true);
      const res = await axios.get(`${API_BASE_URL}/api/productos`);
      setProductos(res.data || []);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoadingProductos(false);
    }
  };

  const cerrarModal = () => setShowModal(false);

  const anadirMueble = (producto) => {
    if (mueblesSeleccionados.find(p => p._id === producto._id)) return;
    setMueblesSeleccionados(prev => [...prev, producto]);
    setShowModal(false);
  };

  const eliminarMueble = (idMueble) => {
    setMueblesSeleccionados(prev => prev.filter(m => m._id !== idMueble));
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (archivosExistentes.length + archivosNuevos.length === 0) {
      return alert("Por favor, mantén o sube al menos una imagen o vídeo");
    }

    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('zonaCasa', zonaCasa);
      formData.append('categoriaDecoracion', categoria);
      formData.append('muebles', JSON.stringify(mueblesSeleccionados.map(m => m._id)));
      
      // Separar URLs existentes en imágenes y videos para el backend
      const imagenesActuales = archivosExistentes.filter(a => a.type === 'image').map(a => a.url);
      const videosActuales = archivosExistentes.filter(a => a.type === 'video').map(a => a.url);
      
      formData.append('imagenesActuales', JSON.stringify(imagenesActuales));
      formData.append('videosActuales', JSON.stringify(videosActuales));

      // Adjuntar archivos físicos nuevos
      archivosNuevos.forEach(a => formData.append('multimedia', a.file));

      await axios.put(`${API_BASE_URL}/api/inspiraciones/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      alert('¡Inspiración actualizada con éxito!');
      navigate('/mis-modelos');
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al actualizar la inspiración');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="crear-insp-container"><p style={{padding: 40}}>Cargando datos...</p></div>;

  return (
    <div className="crear-insp-container">
      <h1 className="insp-title">Editar Inspiración</h1>
      <form className="insp-form" onSubmit={handleSubmit}>
        
        {/* SECCIÓN MULTIMEDIA */}
        <div className="media-section">
          <label>Multimedia actual y nueva</label>
          <div className="upload-box">
            <div className="media-uploader" onClick={() => document.getElementById('insp-input').click()}>
              {archivosExistentes.length === 0 && archivosNuevos.length === 0 ? (
                <div className="upload-placeholder">
                  <div className="plus-circle">+</div>
                  <span>Click para fotos/vídeos</span>
                </div>
              ) : (
                <div className="media-gallery horizontal-scroll">
                  {/* Archivos Existentes */}
                  {archivosExistentes.map((item, idx) => (
                    <div key={`exist-${idx}`} className="media-item-container">
                      <div className="media-item">
                        {item.type === 'image' ? (
                          <img src={item.url} alt="media actual" className="media-thumbnail" />
                        ) : (
                          <div className="media-placeholder">🎥</div>
                        )}
                      </div>
                      <button type="button" className="media-delete" onClick={(e) => { e.stopPropagation(); eliminarArchivoExistente(item.url); }} title="Eliminar">
                        ✕
                      </button>
                    </div>
                  ))}
                  {/* Archivos Nuevos */}
                  {archivosNuevos.map(item => (
                    <div key={item.id} className="media-item-container">
                      <div className="media-item">
                        {item.type === 'image' ? (
                          <img src={item.preview} alt="media nueva" className="media-thumbnail" />
                        ) : (
                          <div className="media-placeholder">🎥</div>
                        )}
                      </div>
                      <button type="button" className="media-delete" onClick={(e) => { e.stopPropagation(); eliminarArchivoNuevo(item.id); }} title="Eliminar">
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
                          <button className="product-add-btn" onClick={() => anadirMueble(p)}>Añadir</button>
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
          <button type="button" className="btn-cancel" onClick={() => navigate('/mis-modelos')}>Cancelar</button>
          <button type="submit" className="btn-save" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}