import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdClose } from 'react-icons/md';
import './CrearProducto.css';

function CrearProducto() {
    const navigate = useNavigate();
    const fileInputRef = { fotos: useRef(null), videos: useRef(null), modelo3d: useRef(null) };

    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [linkCompra, setLinkCompra] = useState('');
    const [precio, setPrecio] = useState('');
    const [vendedor, setVendedor] = useState('');
    const [especificaciones, setEspecificaciones] = useState({
        dimensiones: '',
        materiales: '',
        color: '',
        peso: ''
    });

    // Estados para archivos
    const [fotos, setFotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [modelo3d, setModelo3d] = useState([]);

    // Estados de control
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // Límites
    const MAX_FOTOS = 5;
    const MAX_VIDEOS = 3;
    const MAX_MODELOS = 1;
    const MAX_FILE_SIZE = 100 * 1024 * 1024;

    // Configuración de Cloudinary
    const CLOUD_NAME = "skala";
    const UPLOAD_PRESET = "subida_productos";
    const FOLDER = "skala/muebles";

    // Validar archivo
    const validarArchivo = (file, tipo) => {
        if (file.size > MAX_FILE_SIZE) {
            setError(`El archivo "${file.name}" es demasiado grande. Máximo: 100MB`);
            return false;
        }

        if (tipo === 'foto') {
            const fotosValidas = ['image/jpeg', 'image/png', 'image/webp'];
            if (!fotosValidas.includes(file.type)) {
                setError(`Formato no permitido para "${file.name}". Solo JPG, PNG, WebP`);
                return false;
            }
        } else if (tipo === 'video') {
            const videosValidos = ['video/mp4', 'video/webm', 'video/quicktime'];
            if (!videosValidos.includes(file.type)) {
                setError(`Formato no permitido para "${file.name}". Solo MP4, WebM`);
                return false;
            }
        } else if (tipo === 'modelo') {
            if (!file.name.match(/\.(gltf|glb|obj|fbx|usdz)$/i)) {
                setError(`Formato no permitido para "${file.name}". Solo .glb, .gltf, .obj, .fbx, .usdz`);
                return false;
            }
        }
        return true;
    };

    // Procesar archivos
    const procesarArchivos = (files, tipo) => {
        const filesArray = Array.from(files);
        const archivosValidos = filesArray.filter(file => validarArchivo(file, tipo));

        if (archivosValidos.length === 0) return;

        setError('');
        const nuevosArchivos = archivosValidos.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            archivo: file,
            preview: tipo === 'foto' ? URL.createObjectURL(file) : null,
            nombre: file.name,
            tamaño: (file.size / 1024 / 1024).toFixed(2),
        }));

        if (tipo === 'foto') {
            if (fotos.length + nuevosArchivos.length > MAX_FOTOS) {
                setError(`Máximo ${MAX_FOTOS} fotos permitidas`);
                return;
            }
            setFotos(prev => [...prev, ...nuevosArchivos]);
        } else if (tipo === 'video') {
            if (videos.length + nuevosArchivos.length > MAX_VIDEOS) {
                setError(`Máximo ${MAX_VIDEOS} videos permitidos`);
                return;
            }
            setVideos(prev => [...prev, ...nuevosArchivos]);
        } else if (tipo === 'modelo') {
            if (modelo3d.length + nuevosArchivos.length > MAX_MODELOS) {
                setError(`Máximo ${MAX_MODELOS} modelo 3D permitido`);
                return;
            }
            setModelo3d(prev => [...prev, ...nuevosArchivos]);
        }
    };

    // Eliminar archivo
    const eliminarArchivo = (id, tipo) => {
        if (tipo === 'foto') {
            setFotos(prev => prev.filter(f => f.id !== id));
        } else if (tipo === 'video') {
            setVideos(prev => prev.filter(v => v.id !== id));
        } else if (tipo === 'modelo') {
            setModelo3d(prev => prev.filter(m => m.id !== id));
        }
    };

    // Subir a Cloudinary
    const subirACloudinary = async (archivo, fileType) => {
        const formData = new FormData();
        formData.append('file', archivo);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', FOLDER);

        try {
            let url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

            if (fileType === 'video') {
                url += '/video/upload';
            } else if (fileType === 'modelo') {
                url += '/raw/upload';
            } else {
                url += '/image/upload';
            }

            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.secure_url;
        } catch (err) {
            console.error("Error subiendo a Cloudinary:", err);
            throw new Error(`Error al subir ${fileType}`);
        }
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            if (fotos.length === 0) {
                setError('Por favor, sube al menos una foto del producto.');
                setCargando(false);
                return;
            }

            const urlsFotos = await Promise.all(
                fotos.map(f => subirACloudinary(f.archivo, 'foto'))
            );

            let urlsVideos = [];
            if (videos.length > 0) {
                urlsVideos = await Promise.all(
                    videos.map(v => subirACloudinary(v.archivo, 'video'))
                );
            }

            let urlModelo3d = '';
            if (modelo3d.length > 0) {
                urlModelo3d = await subirACloudinary(modelo3d[0].archivo, 'modelo');
            }

            const usuarioId = localStorage.getItem('usuarioId');
            if (!usuarioId) {
                setError('Debes estar autenticado para crear un producto.');
                setCargando(false);
                return;
            }

            const nuevoProducto = {
                nombre,
                linkCompra,
                precio: parseFloat(precio) || 0,
                vendedor,
                especificaciones,
                imagenes: urlsFotos,
                videos: urlsVideos,
                modelo3d: urlModelo3d,
                subidoPor: usuarioId
            };

            await axios.post('http://localhost:5000/api/productos', nuevoProducto, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            navigate('/');
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || 'Error al crear el producto. Inténtalo de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    // Componente de sección multimedia reutilizable
    const MediaSection = ({ titulo, tipo, items, max, inputRef }) => (
        <div className="media-section">
            <h4 className="media-title">{titulo}</h4>
            <div className={`media-box ${items.length > 0 ? 'with-items' : ''}`}>
                <button
                    type="button"
                    className="media-button"
                    onClick={() => inputRef.current?.click()}
                    title={`Añadir ${titulo.toLowerCase()}`}
                >
                    <MdAdd className="media-icon" />
                </button>

                {items.length === 0 && (
                    <span className="media-text">Click para subir {titulo.toLowerCase()}</span>
                )}

                {items.length > 0 && (
                    <div className="media-gallery">
                        {items.map(item => (
                            <div key={item.id} className="media-item-container">
                                <div className="media-item">
                                    {tipo === 'foto' ? (
                                        <img src={item.preview} alt="media" className="media-thumbnail" />
                                    ) : (
                                        <div className="media-placeholder">
                                            {tipo === 'video' ? '🎥' : '📦'}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="media-delete"
                                    onClick={() => eliminarArchivo(item.id, tipo)}
                                    title="Eliminar"
                                >
                                    <MdClose />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    multiple={tipo !== 'modelo'}
                    accept={tipo === 'foto' ? 'image/*' : tipo === 'video' ? 'video/*' : '.gltf,.glb,.obj,.fbx,.usdz'}
                    onChange={(e) => procesarArchivos(e.target.files, tipo)}
                    style={{ display: 'none' }}
                />
            </div>
            <small className="media-counter">{items.length}/{max}</small>
        </div>
    );

    return (
        <div className="crear-producto-page">
            <header className="crear-header">
                <h2>Subir Producto</h2>
            </header>

            <main className="crear-content">
                <form className="crear-form" onSubmit={handleSubmit}>
                    {/* Nombre del producto */}
                    <div className="form-group">
                        <label>Nombre del producto</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Sillón verde vintage"
                            required
                        />
                    </div>

                    {/* Link de compra y Precio */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Link de compra</label>
                            <input
                                type="url"
                                value={linkCompra}
                                onChange={e => setLinkCompra(e.target.value)}
                                placeholder="www.sillon-ikea.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Precio</label>
                            <div className="precio-input">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={precio}
                                    onChange={e => setPrecio(e.target.value)}
                                    placeholder="0.00"
                                />
                                <span>€</span>
                            </div>
                        </div>
                    </div>

                    {/* Vendedor */}
                    <div className="form-group">
                        <label>Vendedor</label>
                        <input
                            type="text"
                            value={vendedor}
                            onChange={e => setVendedor(e.target.value)}
                            placeholder="Ikea"
                        />
                    </div>

                    {/* Especificaciones técnicas */}
                    <div className="form-group">
                        <label>Especificaciones técnicas</label>
                        <div className="especificaciones-table">
                            <div className="spec-row">
                                <div className="spec-label">Dimensiones</div>
                                <input
                                    type="text"
                                    value={especificaciones.dimensiones}
                                    onChange={e => setEspecificaciones({...especificaciones, dimensiones: e.target.value})}
                                    placeholder="74×86×102 cm"
                                />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Materiales</div>
                                <input
                                    type="text"
                                    value={especificaciones.materiales}
                                    onChange={e => setEspecificaciones({...especificaciones, materiales: e.target.value})}
                                    placeholder="Algodón y tea"
                                />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Color</div>
                                <input
                                    type="text"
                                    value={especificaciones.color}
                                    onChange={e => setEspecificaciones({...especificaciones, color: e.target.value})}
                                    placeholder="Naranja"
                                />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Peso</div>
                                <input
                                    type="text"
                                    value={especificaciones.peso}
                                    onChange={e => setEspecificaciones({...especificaciones, peso: e.target.value})}
                                    placeholder="8–12 kg"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="button-group">
                        <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-guardar" disabled={cargando}>
                            {cargando ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>

                {/* Secciones de multimedia */}
                <aside className="upload-section">
                    <MediaSection
                        titulo="Añadir fotos"
                        tipo="foto"
                        items={fotos}
                        max={MAX_FOTOS}
                        inputRef={fileInputRef.fotos}
                    />
                    <MediaSection
                        titulo="Añadir videos"
                        tipo="video"
                        items={videos}
                        max={MAX_VIDEOS}
                        inputRef={fileInputRef.videos}
                    />
                    <MediaSection
                        titulo="Añadir modelo/vista 3D"
                        tipo="modelo"
                        items={modelo3d}
                        max={MAX_MODELOS}
                        inputRef={fileInputRef.modelo3d}
                    />
                </aside>
            </main>
        </div>
    );
}

export default CrearProducto;
