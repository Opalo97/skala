import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './CrearProducto.css';
import API_BASE_URL from '../config/api'; // ¡Reutilizamos tu CSS de crear producto!

export default function EditarProducto() {
    const navigate = useNavigate();
    const { id } = useParams(); // Obtenemos la ID del producto de la URL

    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [linkCompra, setLinkCompra] = useState('');
    const [precio, setPrecio] = useState('');
    const [vendedor, setVendedor] = useState('');
    const [especificaciones, setEspecificaciones] = useState({
        dimensiones: '', materiales: '', color: '', peso: ''
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

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
                
                setCargando(false);
            } catch (err) {
                setError('Error al cargar los datos del producto.');
                setCargando(false);
            }
        };
        cargarProducto();
    }, [id]);

    // 2. Función para guardar los cambios
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setGuardando(true);

        try {
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('linkCompra', linkCompra);
            formData.append('precio', parseFloat(precio) || 0);
            formData.append('vendedor', vendedor);
            formData.append('especificaciones', JSON.stringify(especificaciones));

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

                {/* Zona multimedia desactivada para edición rápida */}
                <aside className="upload-section" style={{opacity: 0.5, pointerEvents: 'none'}}>
                    <div style={{background: 'white', padding: 20, borderRadius: 16}}>
                        <h4>Imágenes</h4>
                        <p style={{fontSize: 14, color: '#666'}}>Para editar imágenes, por favor elimina el producto y súbelo de nuevo por ahora.</p>
                    </div>
                </aside>
            </main>
        </div>
    );
}