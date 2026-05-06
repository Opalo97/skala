import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { BiTrash, BiArrowBack } from 'react-icons/bi'
import { BsThreeDots } from 'react-icons/bs'
import './DetalleColeccion.css'
import API_BASE_URL from '../config/api'

export default function ListaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lista, setLista] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [confirmItem, setConfirmItem] = useState(null) // { id, nombre }
  const menuRef = useRef(null)

  useEffect(() => {
    fetchLista()
  }, [id])

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchLista = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/listas/${id}`)
      const data = await res.json()
      setLista(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const pedirConfirmacion = (prod) => {
    setMenuAbierto(null)
    setConfirmItem({ id: prod._id, nombre: prod.nombre })
  }

  const confirmarEliminar = async () => {
    if (!lista || !confirmItem) return
    const nuevosIds = (lista.productos || [])
      .map(p => p._id || p)
      .filter(pid => String(pid) !== String(confirmItem.id))
    try {
      await fetch(`${API_BASE_URL}/api/listas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: nuevosIds })
      })
      setConfirmItem(null)
      await fetchLista()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="det-loading">Cargando...</div>
  if (!lista) return <div className="det-loading">Lista no encontrada</div>

  const productos = lista.productos || []

  return (
    <div className="det-container">
      <button className="det-back-btn" onClick={() => navigate(-1)}>
        <BiArrowBack size={20} /> Volver
      </button>

      <div className="det-header">
        <h1 className="det-titulo">{lista.nombre}</h1>
        <span className="det-count">{productos.length} producto{productos.length !== 1 ? 's' : ''}</span>
      </div>

      {productos.length === 0
        ? <p className="det-empty">Esta lista no tiene productos todavía.</p>
        : (
          <div className="det-grid-prod">
            {productos.map(prod => (
              <div key={prod._id} className="det-prod-card">
                <Link to={`/item/${prod._id}`}>
                  <div className="det-prod-img-wrap">
                    {prod.imagenes?.[0]
                      ? <img src={prod.imagenes[0]} alt={prod.nombre} />
                      : <div className="det-prod-placeholder" />
                    }
                  </div>
                </Link>

                <div className="det-prod-info">
                  <p className="det-prod-nombre">{prod.nombre}</p>
                  {prod.precio != null && (
                    <p className="det-prod-precio">{prod.precio}€</p>
                  )}
                </div>

                <div className="det-menu-row">
                  <button
                    className="det-dots-btn"
                    onClick={() => setMenuAbierto(prev => prev === prod._id ? null : prod._id)}
                  >
                    <BsThreeDots size={20} />
                  </button>

                  {menuAbierto === prod._id && (
                    <div className="det-dropdown" ref={menuRef}>
                      <button
                        className="det-dropdown-item"
                        onClick={() => pedirConfirmacion(prod)}
                      >
                        <BiTrash size={16} /> Eliminar de la lista
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Modal de confirmación */}
      {confirmItem && (
        <div className="det-overlay" onClick={() => setConfirmItem(null)}>
          <div className="det-confirm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="det-confirm-titulo">¿Eliminar de la lista?</h3>
            <p className="det-confirm-texto">
              Se eliminará <strong>"{confirmItem.nombre}"</strong> de esta lista.
              El producto no se borrará.
            </p>
            <div className="det-confirm-actions">
              <button className="det-btn-cancelar" onClick={() => setConfirmItem(null)}>
                Cancelar
              </button>
              <button className="det-btn-eliminar" onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
