import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdClose } from 'react-icons/md';
import './CrearProducto.css';
import API_BASE_URL from '../config/api'; // ¡Reutilizamos tu CSS de crear producto!

export default function EditarProducto() {
    const navigate = useNavigate();
    const { id } = useParams(); // Obtenemos la ID del producto de la URL
    const fotosInputRef = useRef(null);

    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [linkCompra, setLinkCompra] = useState('');
    const [precio, setPrecio] = useState('');
    const [vendedor, setVendedor] = useState('');
    const [especificaciones, setEspecificaciones] = useState({
        dimensiones: '', materiales: '', color: '', peso: ''
    });
    const [imagenesExistentes, setImagenesExistentes] = useState([]);
    const [fotosNuevas, setFotosNuevas] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const MAX_FOTOS = 5;
    const MAX_FILE_SIZE = 100 * 1024 * 1024;

    // 1. Cargar los datos actuales del producto al entrar a la página
    useEffect(() => {
        const cargarProducto = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/productos/${id}`);
                const prod = res.data;
                
                // Rellenamos el formulario con los datos de la base de datos
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
            fotosNuevas.forEach(f => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
        };
    }, [fotosNuevas]);

    const validarFoto = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            setError(`El archivo "${file.name}" es demasiado grande. Máximo: 100MB`);
            return false;
        }

        const fotosValidas = ['image/jpeg', 'image/png', 'image/webp'];
        if (!fotosValidas.includes(file.type)) {
            setError(`Formato no permitido para "${file.name}". Solo JPG, PNG, WebP`);
            return false;
        }

        return true;
    };

    const procesarFotos = (files) => {
        const filesArray = Array.from(files || []);
        const validas = filesArray.filter(validarFoto);
        if (validas.length === 0) return;

        if (imagenesExistentes.length + fotosNuevas.length + validas.length > MAX_FOTOS) {
            setError(`Máximo ${MAX_FOTOS} fotos permitidas`);
            return;
        }

        setError('');
        const nuevas = validas.map(file => ({
            id: Math.random().toString(36).substring(2, 11),
            archivo: file,
            preview: URL.createObjectURL(file)
        }));

        setFotosNuevas(prev => [...prev, ...nuevas]);
    };

    const eliminarImagenExistente = (url) => {
        setImagenesExistentes(prev => prev.filter(img => img !== url));
    };

    const eliminarFotoNueva = (idFoto) => {
        setFotosNuevas(prev => {
            const foto = prev.find(f => f.id === idFoto);
            if (foto?.preview) URL.revokeObjectURL(foto.preview);
            return prev.filter(f => f.id !== idFoto);
        });
    };

    // 2. Función para guardar los cambios
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
            fotosNuevas.forEach(f => formData.append('fotos', f.archivo));

            // Hacemos un PUT a la nueva ruta que creamos en el backend
            await axios.put(`${API_BASE_URL}/api/productos/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            alert('¡Producto actualizado con éxito!');
            navigate('/mis-modelos'); // Volver a mis modelos
        } catch (err) {
            console.error("Error:", err);
            setError(err.response?.data?.mensaje || 'Error al actualizar el producto.');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return <div className="crear-producto-page"><p style={{padding: 40}}>Cargando datos del producto...</p></div>;

    return (
        <div className="crear-producto-page">
            <header className="crear-header">
                <h2>Editar Producto</h2>
            </header>

            <main className="crear-content">
                <form className="crear-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre del producto</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Link de compra</label>
                            <input
                                type="url"
                                value={linkCompra}
                                onChange={e => setLinkCompra(e.target.value)}
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
                                />
                                <span>€</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Vendedor</label>
                        <input
                            type="text"
                            value={vendedor}
                            onChange={e => setVendedor(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Especificaciones técnicas</label>
                        <div className="especificaciones-table">
                            <div className="spec-row">
                                <div className="spec-label">Dimensiones</div>
                                <input
                                    type="text"
                                    value={especificaciones.dimensiones}
                                    onChange={e => setEspecificaciones({...especificaciones, dimensiones: e.target.value})}
                                />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Materiales</div>
                                <input
                                    type="text"
                                    value={especificaciones.materiales}
                                    onChange={e => setEspecificaciones({...especificaciones, materiales: e.target.value})}
                                />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Color</div>
                                <input
                                    type="text"
                                    value={especificaciones.color}
                                    onChange={e => setEspecificaciones({...especificaciones, color: e.target.value})}
                                />
                            </div>
                            <div className="spec-row">
                                <div className="spec-label">Peso</div>
                                <input
                                    type="text"
                                    value={especificaciones.peso}
                                    onChange={e => setEspecificaciones({...especificaciones, peso: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="button-group">
                        <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-guardar" disabled={guardando}>
                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>

                <aside className="upload-section">
                    <div className="media-section">
                        <h4 className="media-title">Imágenes del producto</h4>
                        <div className={`media-box ${imagenesExistentes.length + fotosNuevas.length > 0 ? 'with-items' : ''}`}>
                            <button
                                type="button"
                                className="media-button"
                                onClick={() => fotosInputRef.current?.click()}
                                title="Añadir fotos"
                            >
                                <MdAdd className="media-icon" />
                            </button>

                            {imagenesExistentes.length + fotosNuevas.length === 0 && (
                                <span className="media-text">Click para subir imágenes</span>
                            )}

                            {(imagenesExistentes.length + fotosNuevas.length) > 0 && (
                                <div className="media-gallery">
                                    {imagenesExistentes.map((url) => (
                                        <div key={url} className="media-item-container">
                                            <div className="media-item">
                                                <img src={url} alt="Imagen actual" className="media-thumbnail" />
                                            </div>
                                            <button
                                                type="button"
                                                className="media-delete"
                                                onClick={() => eliminarImagenExistente(url)}
                                                title="Eliminar"
                                            >
                                                <MdClose />
                                            </button>
                                        </div>
                                    ))}

                                    {fotosNuevas.map((item) => (
                                        <div key={item.id} className="media-item-container">
                                            <div className="media-item">
                                                <img src={item.preview} alt="Imagen nueva" className="media-thumbnail" />
                                            </div>
                                            <button
                                                type="button"
                                                className="media-delete"
                                                onClick={() => eliminarFotoNueva(item.id)}
                                                title="Eliminar"
                                            >
                                                <MdClose />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <input
                                ref={fotosInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => procesarFotos(e.target.files)}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <small className="media-counter">{imagenesExistentes.length + fotosNuevas.length}/{MAX_FOTOS}</small>
                    </div>
                </aside>
            </main>
        </div>
    );
}