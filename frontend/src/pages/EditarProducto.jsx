import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdClose } from 'react-icons/md';
import './CrearProducto.css';
import API_BASE_URL from '../config/api';

export default function EditarProducto() {
    const navigate = useNavigate();
    const { id } = useParams();
    const fotosInputRef = useRef(null);
    const videosInputRef = useRef(null);
    const modelo3dInputRef = useRef(null);

    const [nombre, setNombre] = useState('');
    const [linkCompra, setLinkCompra] = useState('');
    const [precio, setPrecio] = useState('');
    const [vendedor, setVendedor] = useState('');
    const [especificaciones, setEspecificaciones] = useState({
        dimensiones: '', materiales: '', color: '', peso: ''
    });

    // Imágenes
    const [imagenesExistentes, setImagenesExistentes] = useState([]);
    const [fotosNuevas, setFotosNuevas] = useState([]);
    // Videos
    const [videosExistentes, setVideosExistentes] = useState([]);
    const [videosNuevos, setVideosNuevos] = useState([]);
    // Modelo 3D
    const [modelo3dExistente, setModelo3dExistente] = useState('');
    const [modelo3dNuevo, setModelo3dNuevo] = useState(null);
    const [eliminarModelo3d, setEliminarModelo3d] = useState(false);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const MAX_FOTOS = 5;
    const MAX_VIDEOS = 3;
    const MAX_FILE_SIZE = 100 * 1024 * 1024;

    useEffect(() => {
        const cargarProducto = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/productos/${id}`);
                const prod = res.data;
                setNombre(prod.nombre || '');
                setLinkCompra(prod.linkCompra || '');
                setPrecio(prod.precio || '');
                setVendedor(prod.vendedor || '');
                setEspecificaciones({
                    dimensiones: prod.especificaciones?.dimensiones || '',
                    materiales: prod.especificaciones?.materiales || '',
                    color: prod.especificaciones?.color || '',
                    peso: prod.especificaciones?.peso || ''
                });
                setImagenesExistentes(Array.isArray(prod.imagenes) ? prod.imagenes : []);
                setVideosExistentes(Array.isArray(prod.videos) ? prod.videos : []);
                setModelo3dExistente(prod.modelo3d || '');
                setCargando(false);
            } catch (err) {
                setError('Error al cargar los datos del producto.');
                setCargando(false);
            }
        };
        cargarProducto();
    }, [id]);

    useEffect(() => {
        return () => {
            fotosNuevas.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
        };
    }, [fotosNuevas]);

    const validarArchivo = (file, tipo) => {
        if (file.size > MAX_FILE_SIZE) {
            setError(`El archivo "${file.name}" es demasiado grande. Máximo: 100MB`);
            return false;
        }
        if (tipo === 'foto') {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setError(`Formato no permitido para "${file.name}". Solo JPG, PNG, WebP`);
                return false;
            }
        } else if (tipo === 'video') {
            if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
                setError(`Formato no permitido para "${file.name}". Solo MP4, WebM`);
                return false;
            }
        } else if (tipo === 'modelo') {
            if (!file.name.match(/\.(gltf|glb|obj|fbx|usdz)$/i)) {
                setError(`Formato no permitido. Solo .glb, .gltf, .obj, .fbx, .usdz`);
                return false;
            }
        }
        return true;
    };

    const procesarFotos = (files) => {
        const arr = Array.from(files || []).filter(f => validarArchivo(f, 'foto'));
        if (!arr.length) return;
        if (imagenesExistentes.length + fotosNuevas.length + arr.length > MAX_FOTOS) {
            setError(`Máximo ${MAX_FOTOS} fotos permitidas`);
            return;
        }
        setError('');
        setFotosNuevas(prev => [...prev, ...arr.map(f => ({
            id: Math.random().toString(36).substring(2, 11),
            archivo: f,
            preview: URL.createObjectURL(f)
        }))]);
    };

    const procesarVideos = (files) => {
        const arr = Array.from(files || []).filter(f => validarArchivo(f, 'video'));
        if (!arr.length) return;
        if (videosExistentes.length + videosNuevos.length + arr.length > MAX_VIDEOS) {
            setError(`Máximo ${MAX_VIDEOS} videos permitidos`);
            return;
        }
        setError('');
        setVideosNuevos(prev => [...prev, ...arr.map(f => ({
            id: Math.random().toString(36).substring(2, 11),
            archivo: f,
            nombre: f.name
        }))]);
    };

    const procesarModelo3d = (files) => {
        const file = Array.from(files || [])[0];
        if (!file) return;
        if (!validarArchivo(file, 'modelo')) return;
        setError('');
        setModelo3dNuevo({ id: Math.random().toString(36).substring(2, 11), archivo: file, nombre: file.name });
        setEliminarModelo3d(false);
    };

    const eliminarImagenExistente = (url) => setImagenesExistentes(prev => prev.filter(i => i !== url));
    const eliminarFotoNueva = (id) => {
        setFotosNuevas(prev => {
            const foto = prev.find(f => f.id === id);
            if (foto?.preview) URL.revokeObjectURL(foto.preview);
            return prev.filter(f => f.id !== id);
        });
    };
    const eliminarVideoExistente = (url) => setVideosExistentes(prev => prev.filter(v => v !== url));
    const eliminarVideoNuevo = (id) => setVideosNuevos(prev => prev.filter(v => v.id !== id));
    const eliminarModelo = () => {
        setModelo3dNuevo(null);
        setModelo3dExistente('');
        setEliminarModelo3d(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setGuardando(true);

        try {
            if (imagenesExistentes.length + fotosNuevas.length === 0) {
                setError('El producto debe tener al menos una imagen.');
                setGuardando(false);
                return;
            }

            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('linkCompra', linkCompra);
            formData.append('precio', parseFloat(precio) || 0);
            formData.append('vendedor', vendedor);
            formData.append('especificaciones', JSON.stringify(especificaciones));
            formData.append('imagenesActuales', JSON.stringify(imagenesExistentes));
            formData.append('videosActuales', JSON.stringify(videosExistentes));
            formData.append('eliminarModelo3d', eliminarModelo3d ? 'true' : 'false');

            fotosNuevas.forEach(f => formData.append('fotos', f.archivo));
            videosNuevos.forEach(v => formData.append('videos', v.archivo));
            if (modelo3dNuevo) formData.append('modelo', modelo3dNuevo.archivo);

            await axios.put(`${API_BASE_URL}/api/productos/${id}`, formData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            alert('¡Producto actualizado con éxito!');
            navigate('/mis-modelos');
        } catch (err) {
            console.error("Error:", err);
            setError(err.response?.data?.mensaje || 'Error al actualizar el producto.');
        } finally {
            setGuardando(false);
        }
    };

    const totalFotos = imagenesExistentes.length + fotosNuevas.length;
    const totalVideos = videosExistentes.length + videosNuevos.length;
    const modelo3dActivo = modelo3dNuevo || (modelo3dExistente && !eliminarModelo3d) ? true : false;

    if (cargando) return <div className="crear-producto-page"><p style={{ padding: 40 }}>Cargando datos del producto...</p></div>;

    return (
        <div className="crear-producto-page">
            <header className="crear-header">
                <h2>Editar Producto</h2>
            </header>

            <main className="crear-content">
                <form className="crear-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre del producto</label>
                        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Link de compra</label>
                            <input type="url" value={linkCompra} onChange={e => setLinkCompra(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Precio</label>
                            <div className="precio-input">
                                <input type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} />
                                <span>€</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Vendedor</label>
                        <input type="text" value={vendedor} onChange={e => setVendedor(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Especificaciones técnicas</label>
                        <div className="especificaciones-table">
                            <div className="spec-row">
                                <div className="spec-label">Dimensiones</div>
                                <input type="text" value={especificaciones.dimensiones} onChange={e => setEspecificaciones({ ...especificaciones, dimensiones: e.target.value })} />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Materiales</div>
                                <input type="text" value={especificaciones.materiales} onChange={e => setEspecificaciones({ ...especificaciones, materiales: e.target.value })} />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Color</div>
                                <input type="text" value={especificaciones.color} onChange={e => setEspecificaciones({ ...especificaciones, color: e.target.value })} />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Peso</div>
                                <input type="text" value={especificaciones.peso} onChange={e => setEspecificaciones({ ...especificaciones, peso: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="button-group">
                        <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>Cancelar</button>
                        <button type="submit" className="btn-guardar" disabled={guardando}>
                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>

                <aside className="upload-section">
                    {/* FOTOS */}
                    <div className="media-section">
                        <h4 className="media-title">Imágenes del producto</h4>
                        <div className={`media-box ${totalFotos > 0 ? 'with-items' : ''}`}>
                            <button type="button" className="media-button" onClick={() => fotosInputRef.current?.click()} title="Añadir fotos">
                                <MdAdd className="media-icon" />
                            </button>
                            {totalFotos === 0 && <span className="media-text">Click para subir imágenes</span>}
                            {totalFotos > 0 && (
                                <div className="media-gallery">
                                    {imagenesExistentes.map(url => (
                                        <div key={url} className="media-item-container">
                                            <div className="media-item">
                                                <img src={url} alt="Imagen actual" className="media-thumbnail" />
                                            </div>
                                            <button type="button" className="media-delete" onClick={() => eliminarImagenExistente(url)} title="Eliminar"><MdClose /></button>
                                        </div>
                                    ))}
                                    {fotosNuevas.map(item => (
                                        <div key={item.id} className="media-item-container">
                                            <div className="media-item">
                                                <img src={item.preview} alt="Nueva imagen" className="media-thumbnail" />
                                            </div>
                                            <button type="button" className="media-delete" onClick={() => eliminarFotoNueva(item.id)} title="Eliminar"><MdClose /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input ref={fotosInputRef} type="file" multiple accept="image/*" onChange={e => procesarFotos(e.target.files)} style={{ display: 'none' }} />
                        </div>
                        <small className="media-counter">{totalFotos}/{MAX_FOTOS}</small>
                    </div>

                    {/* VIDEOS */}
                    <div className="media-section">
                        <h4 className="media-title">Añadir videos</h4>
                        <div className={`media-box ${totalVideos > 0 ? 'with-items' : ''}`}>
                            <button type="button" className="media-button" onClick={() => videosInputRef.current?.click()} title="Añadir videos">
                                <MdAdd className="media-icon" />
                            </button>
                            {totalVideos === 0 && <span className="media-text">Click para subir videos</span>}
                            {totalVideos > 0 && (
                                <div className="media-gallery">
                                    {videosExistentes.map(url => (
                                        <div key={url} className="media-item-container">
                                            <div className="media-item">
                                                <div className="media-placeholder">🎥</div>
                                            </div>
                                            <button type="button" className="media-delete" onClick={() => eliminarVideoExistente(url)} title="Eliminar"><MdClose /></button>
                                        </div>
                                    ))}
                                    {videosNuevos.map(item => (
                                        <div key={item.id} className="media-item-container">
                                            <div className="media-item">
                                                <div className="media-placeholder">🎥</div>
                                            </div>
                                            <button type="button" className="media-delete" onClick={() => eliminarVideoNuevo(item.id)} title="Eliminar"><MdClose /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input ref={videosInputRef} type="file" multiple accept="video/*" onChange={e => procesarVideos(e.target.files)} style={{ display: 'none' }} />
                        </div>
                        <small className="media-counter">{totalVideos}/{MAX_VIDEOS}</small>
                    </div>

                    {/* MODELO 3D */}
                    <div className="media-section">
                        <h4 className="media-title">Añadir modelo/vista 3D</h4>
                        <div className={`media-box ${modelo3dActivo ? 'with-items' : ''}`}>
                            <button type="button" className="media-button" onClick={() => modelo3dInputRef.current?.click()} title="Añadir modelo 3D">
                                <MdAdd className="media-icon" />
                            </button>
                            {!modelo3dActivo && <span className="media-text">Click para subir modelo 3D</span>}
                            {modelo3dActivo && (
                                <div className="media-gallery">
                                    <div className="media-item-container">
                                        <div className="media-item">
                                            <div className="media-placeholder">📦</div>
                                        </div>
                                        <button type="button" className="media-delete" onClick={eliminarModelo} title="Eliminar"><MdClose /></button>
                                    </div>
                                </div>
                            )}
                            <input ref={modelo3dInputRef} type="file" accept=".gltf,.glb,.obj,.fbx,.usdz" onChange={e => procesarModelo3d(e.target.files)} style={{ display: 'none' }} />
                        </div>
                        <small className="media-counter">{modelo3dActivo ? 1 : 0}/1</small>
                    </div>
                </aside>
            </main>
        </div>
    );
}
