import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { BiTrash, BiArrowBack } from 'react-icons/bi'
import { BsThreeDots } from 'react-icons/bs'
import './DetalleColeccion.css'
import API_BASE_URL from '../config/api'

export default function ColeccionDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [coleccion, setColeccion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [confirmItem, setConfirmItem] = useState(null) // { id, nombre }
  const menuRef = useRef(null)

  useEffect(() => {
    fetchColeccion()
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

  const fetchColeccion = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/colecciones/${id}`)
      const data = await res.json()
      setColeccion(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const pedirConfirmacion = (insp) => {
    setMenuAbierto(null)
    setConfirmItem({ id: insp._id, nombre: insp.nombre })
  }

  const confirmarEliminar = async () => {
    if (!coleccion || !confirmItem) return
    const nuevasIds = (coleccion.inspiraciones || [])
      .map(i => i._id || i)
      .filter(iid => String(iid) !== String(confirmItem.id))
    try {
      await fetch(`${API_BASE_URL}/api/colecciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspiraciones: nuevasIds })
      })
      setConfirmItem(null)
      await fetchColeccion()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="det-loading">Cargando...</div>
  if (!coleccion) return <div className="det-loading">Colección no encontrada</div>

  const inspiraciones = coleccion.inspiraciones || []

  return (
    <div className="det-container">
      <button className="det-back-btn" onClick={() => navigate(-1)}>
        <BiArrowBack size={20} /> Volver
      </button>

      <div className="det-header">
        <h1 className="det-titulo">{coleccion.nombre}</h1>
        <span className="det-count">{inspiraciones.length} inspiracion{inspiraciones.length !== 1 ? 'es' : ''}</span>
      </div>

      {inspiraciones.length === 0
        ? <p className="det-empty">Esta colección no tiene inspiraciones todavía.</p>
        : (
          <div className="det-grid-insп">
            {inspiraciones.map(insp => (
              <div key={insp._id} className="det-insp-item">
                <Link to={`/inspiracion/${insp._id}`}>
                  {insp.multimedia?.imagenes?.[0] && (
                    <img src={insp.multimedia.imagenes[0]} alt={insp.nombre} />
                  )}
                </Link>

                <div className="det-menu-row">
                  <button
                    className="det-dots-btn"
                    onClick={() => setMenuAbierto(prev => prev === insp._id ? null : insp._id)}
                  >
                    <BsThreeDots size={20} />
                  </button>

                  {menuAbierto === insp._id && (
                    <div className="det-dropdown" ref={menuRef}>
                      <button
                        className="det-dropdown-item"
                        onClick={() => pedirConfirmacion(insp)}
                      >
                        <BiTrash size={16} /> Eliminar de la colección
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
            <h3 className="det-confirm-titulo">¿Eliminar de la colección?</h3>
            <p className="det-confirm-texto">
              Se eliminará <strong>"{confirmItem.nombre}"</strong> de esta colección.
              La inspiración no se borrará.
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
