import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UploadItem.css'; // Asegúrate de actualizar el CSS abajo

function UploadProducto() {
    const navigate = useNavigate();

    // 1. Estados para los campos del producto (Adaptado a tu imagen)
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [puntoDeVenta, setPuntoDeVenta] = useState('');
    const [categoria, setCategoria] = useState('');
    
    // 2. Estados para la gestión de imágenes
    const [archivosLocales, setArchivosLocales] = useState([]); // Los archivos crudos para subir
    const [previsualizaciones, setPrevisualizaciones] = useState([]); // Las URLs temporales para ver en pantalla
    
    // 3. Estados de control UI
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // --- CONFIGURACIÓN DE CLOUDINARY (No firmada) ---
    // Busca estos datos en tu Dashboard de Cloudinary y en los ajustes de Upload Preset
    const CLOUD_NAME = "skala";
    const UPLOAD_PRESET = "subida_productos";
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    // Validar que las credenciales estén configuradas
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        return (
            <div className="upload-producto-page">
                <div style={{ padding: '20px', color: 'red' }}>
                    <h2>⚠️ Error de configuración</h2>
                    <p>Las credenciales de Cloudinary no están configuradas.</p>
                    <p>Por favor, actualiza el archivo <code>.env.local</code> en la carpeta frontend con:</p>
                    <pre>VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset</pre>
                    <p>Después reinicia el servidor con: <code>npm run dev</code></p>
                </div>
            </div>
        );
    }


    // Función que se activa cuando el usuario selecciona imágenes
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setArchivosLocales(prev => [...prev, ...files]);

        // Generar URLs temporales (blob:) para ver la previsualización instantánea
        const nuevasPrevisualizaciones = files.map(file => URL.createObjectURL(file));
        setPrevisualizaciones(prev => [...prev, ...nuevasPrevisualizaciones]);
    };

    // Función mágica que sube UN archivo a Cloudinary y devuelve su URL final
    const subirACloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET); // Esto autoriza la subida sin firma

        try {
            const response = await axios.post(CLOUDINARY_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.secure_url; // Devolvemos la URL segura (https)
        } catch (err) {
            console.error("Error subiendo a Cloudinary:", err);
            throw new Error("No se pudo subir una de las imágenes.");
        }
    };

    // Función principal de envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        if (archivosLocales.length === 0) {
            setError('Por favor, selecciona al menos una imagen del producto.');
            setCargando(false);
            return;
        }

        try {
            // FASE 1: Subir todas las imágenes a la nube
            // Usamos Promise.all para subirlas todas en paralelo y esperar a que terminen
            const urlsDeCloudinary = await Promise.all(
                archivosLocales.map(file => subirACloudinary(file))
            );

            // FASE 2: Crear el objeto del producto final con las URLs reales
            const nuevoProducto = {
                nombre,
                precio: parseFloat(precio), // Asegurar que es un número
                puntoDeVenta,
                categoria,
                // Adaptamos al formato que espera tu backend (ej: array de strings)
                imagenes: urlsDeCloudinary 
            };

            console.log("Datos finales para el backend:", nuevoProducto);

            // FASE 3: Enviar los datos completos a TU Backend
            // Importante: No olvides la cabecera de autenticación si tu ruta lo requiere
            await axios.post('http://localhost:5000/api/productos', nuevoProducto, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Si usas JWT
                }
            });

            // Éxito: Navegar al muro o a la vista del producto
            navigate('/'); 

        } catch (err) {
            console.error("Error completo en la subida:", err);
            setError(err.message || 'Error al crear el producto. Inténtalo de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="upload-producto-page">
            <header className="upload-header">
                <h2>Subir Producto</h2>
            </header>

            <main className="upload-content">
                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre del producto</label>
                        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Butaca Nórdica Gris" />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Precio (€)</label>
                            <input type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} required placeholder="59.99" />
                        </div>
                        <div className="form-group">
                            <label>Punto de venta</label>
                            <input type="text" value={puntoDeVenta} onChange={e => setPuntoDeVenta(e.target.value)} required placeholder="IKEA, Maisons du Monde..." />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Categoría</label>
                        <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
                            <option value="">Selecciona categoría</option>
                            <option value="Sillas">Sillas y Butacas</option>
                            <option value="Mesas">Mesas</option>
                            <option value="Decoración">Decoración</option>
                            <option value="Iluminación">Iluminación</option>
                        </select>
                    </div>

                    {/* Zona de subida de archivos - Diseñada como en tu Figma */}
                    <div className="file-upload-zone">
                        <label className="file-upload-label">
                            <div className="upload-icon">☁️</div>
                            <span>Haz clic o arrastra para subir imágenes</span>
                            <small>Sube hasta 3 imágenes en formato JPG, PNG</small>
                            <input type="file" multiple onChange={handleFileChange} accept="image/*" className="hidden-input" />
                        </label>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="submit-btn" disabled={cargando}>
                        {cargando ? 'Subiendo producto a la nube...' : 'Subir Producto'}
                    </button>
                </form>

                {/* Sección de Previsualización (A la derecha como en tu Figma) */}
                <aside className="preview-section">
                    <h3>Previsualización ({previsualizaciones.length})</h3>
                    {previsualizaciones.length === 0 ? (
                        <div className="empty-preview">Las imágenes aparecerán aquí</div>
                    ) : (
                        <div className="preview-grid">
                            {previsualizaciones.map((url, index) => (
                                <div key={index} className="preview-item">
                                    <img src={url} alt={`Previsualización ${index + 1}`} />
                                    <small className="cloudinary-tag">Local (Blob)</small>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}

export default UploadProducto;