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
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cargando, setCargando] = useState(false);

  // --- DATOS CLOUDINARY (Usa los mismos que en subir producto) ---
  const CLOUD_NAME = "skala"; 
  const UPLOAD_PRESET = "subida_productos"; 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreview(URL.createObjectURL(file)); // Para ver la foto antes de subirla
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Por favor, sube una imagen");
    
    setCargando(true);
    try {
      // FASE 1: Subir a Cloudinary
      const formData = new FormData();
      formData.append('file', archivo);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      const resCloud = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      const urlFinal = resCloud.data.secure_url;

      // FASE 2: Enviar a tu Backend
      const nuevaInspiracion = {
        nombre,
        zonaCasa,
        categoriaDecoracion: categoria,
        multimedia: { imagenes: [urlFinal], videos: [] },
        autor: "69f30852bc81edf1454bd806" // Aquí iría el ID del usuario logueado
      };

      await axios.post('http://localhost:5000/api/inspiraciones', nuevaInspiracion);
      
      alert("¡Inspiración creada con éxito!");
      navigate('/'); // Volver al inicio

    } catch (error) {
      console.error(error);
      alert("Error al crear la inspiración");
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
            {preview ? (
              <img src={preview} alt="Vista previa" className="preview-img" />
            ) : (
              <div className="upload-placeholder">
                <div className="plus-circle">+</div>
                <span>Click para fotos/vídeos</span>
              </div>
            )}
            <input type="file" onChange={handleFileChange} accept="image/*" />
          </div>
          <button type="button" className="btn-gallery">Subir desde galería</button>
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
            <button type="button" className="btn-add-mueble">+</button>
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