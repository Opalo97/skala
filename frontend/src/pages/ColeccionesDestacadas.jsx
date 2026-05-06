import { useState, useEffect, useRef } from 'react'
import { BiPlus, BiEdit, BiTrash } from 'react-icons/bi'
import { BsThreeDots } from 'react-icons/bs'
import { BiX } from 'react-icons/bi'
import './ColeccionesDestacadas.css'
import API_BASE_URL from '../config/api'

export default function ColeccionesDestacadas() {
  const [activeTab, setActiveTab] = useState('favoritos')
  const [favoritos, setFavoritos] = useState([])
  const [colecciones, setColecciones] = useState([])
  const [loading, setLoading] = useState(true)

  // Menú "..." abierto: { tipo: 'fav' | 'col', id }
  const [menuAbierto, setMenuAbierto] = useState(null)
  const menuRef = useRef(null)

  // Modal crear colección
  const [modalCrear, setModalCrear] = useState(false)

  // Modal editar colección
  const [coleccionEditar, setColeccionEditar] = useState(null)

  // Modal añadir inspiración a colección (desde pestaña favoritos)
  const [inspiracionParaAnadir, setInspiracionParaAnadir] = useState(null)

  // Estado compartido del formulario crear/editar
  const [formNombre, setFormNombre] = useState('')
  const [formInspiraciones, setFormInspiraciones] = useState([])
  const [mostrarPickerInsp, setMostrarPickerInsp] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const usuarioId = localStorage.getItem('usuarioId')

  useEffect(() => {
    if (usuarioId) fetchData()
    else setLoading(false)
  }, [usuarioId])

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resUser, resCol] = await Promise.all([
        fetch(`${API_BASE_URL}/api/usuarios/${usuarioId}`),
        fetch(`${API_BASE_URL}/api/colecciones/usuario/${usuarioId}`)
      ])
      const user = await resUser.json()
      const colData = await resCol.json()

      const favIds = user.favoritosInspiraciones || []
      const inspData = await Promise.all(
        favIds.map(id =>
          fetch(`${API_BASE_URL}/api/inspiraciones/${id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      )
      setFavoritos(inspData.filter(i => i && i._id))
      setColecciones(Array.isArray(colData) ? colData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Helpers thumbnail ──────────────────────────────────────────────────
  const getImagenesColeccion = (col) => {
    const imgs = []
    for (const insp of col.inspiraciones || []) {
      const primera = insp?.multimedia?.imagenes?.[0]
      if (primera) imgs.push(primera)
      if (imgs.length >= 3) break
    }
    return imgs
  }

  // ── Crear colección ────────────────────────────────────────────────────
  const abrirModalCrear = () => {
    setFormNombre('')
    setFormInspiraciones([])
    setMostrarPickerInsp(false)
    setModalCrear(true)
  }

  const crearColeccion = async () => {
    if (!formNombre.trim()) return
    setGuardando(true)
    try {
      await fetch(`${API_BASE_URL}/api/colecciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          creadaPor: usuarioId,
          inspiraciones: formInspiraciones.map(i => i._id)
        })
      })
      setModalCrear(false)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  // ── Editar colección ───────────────────────────────────────────────────
  const abrirModalEditar = (col) => {
    setColeccionEditar(col)
    setFormNombre(col.nombre)
    setFormInspiraciones(col.inspiraciones || [])
    setMostrarPickerInsp(false)
    setMenuAbierto(null)
  }

  const editarColeccion = async () => {
    if (!formNombre.trim() || !coleccionEditar) return
    setGuardando(true)
    try {
      await fetch(`${API_BASE_URL}/api/colecciones/${coleccionEditar._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          inspiraciones: formInspiraciones.map(i => i._id || i)
        })
      })
      setColeccionEditar(null)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  // ── Eliminar colección ─────────────────────────────────────────────────
  const eliminarColeccion = async (colId) => {
    if (!window.confirm('¿Eliminar esta colección?')) return
    setMenuAbierto(null)
    try {
      await fetch(`${API_BASE_URL}/api/colecciones/${colId}`, { method: 'DELETE' })
      await fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  // ── Añadir inspiración a colección (desde pestaña favoritos) ──────────
  const anadirInspAColeccion = async (colId) => {
    if (!inspiracionParaAnadir) return
    const col = colecciones.find(c => c._id === colId)
    if (!col) return
    const idsActuales = (col.inspiraciones || []).map(i => i._id || i)
    if (idsActuales.includes(inspiracionParaAnadir._id)) {
      setInspiracionParaAnadir(null)
      return
    }
    try {
      await fetch(`${API_BASE_URL}/api/colecciones/${colId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspiraciones: [...idsActuales, inspiracionParaAnadir._id] })
      })
      setInspiracionParaAnadir(null)
      await fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  // ── Picker de inspiraciones en modal crear/editar ─────────────────────
  const inspiracionesDisponibles = favoritos.filter(
    fav => !formInspiraciones.some(fi => (fi._id || fi) === fav._id)
  )

  const addInspAlForm = (insp) => {
    setFormInspiraciones(prev => [...prev, insp])
    setMostrarPickerInsp(false)
  }

  const removeInspDelForm = (inspId) => {
    setFormInspiraciones(prev => prev.filter(i => (i._id || i) !== inspId))
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (!usuarioId) {
    return (
      <div className="col-container">
        <p className="col-empty">Inicia sesión para ver tus favoritos.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="col-container">
        <p className="col-empty">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="col-container">
      <div className="col-header-row">
        <h1 className="col-titulo">Inspiraciones favoritas</h1>
        {activeTab === 'colecciones' && (
          <button className="col-nueva-btn" onClick={abrirModalCrear}>
            <BiPlus size={18} /> Nueva Colección
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        <div className="tabs" role="tablist">
          <button
            role="tab"
            className={`tab ${activeTab === 'favoritos' ? 'active' : ''}`}
            onClick={() => setActiveTab('favoritos')}
          >
            Favoritos
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === 'colecciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('colecciones')}
          >
            Colecciones
          </button>
        </div>
      </div>

      {/* ── Pestaña Favoritos ── */}
      {activeTab === 'favoritos' && (
        favoritos.length === 0
          ? <p className="col-empty">Aún no tienes inspiraciones favoritas.</p>
          : (
            <div className="inspiraciones-grid">
              {favoritos.map(insp => (
                <div key={insp._id} className="col-fav-item">
                  {insp.multimedia?.imagenes?.[0] && (
                    <img
                      src={insp.multimedia.imagenes[0]}
                      alt={insp.nombre}
                      className="inspiracion-imagen"
                    />
                  )}
                  <div className="col-fav-menu-row">
                    <button
                      className="col-dots-btn"
                      onClick={() =>
                        setMenuAbierto(prev =>
                          prev?.id === insp._id ? null : { tipo: 'fav', id: insp._id }
                        )
                      }
                    >
                      <BsThreeDots size={20} />
                    </button>

                    {menuAbierto?.tipo === 'fav' && menuAbierto?.id === insp._id && (
                      <div className="col-dropdown" ref={menuRef}>
                        <button
                          className="col-dropdown-item"
                          onClick={() => {
                            setInspiracionParaAnadir(insp)
                            setMenuAbierto(null)
                          }}
                        >
                          Añadir a colección
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {/* ── Pestaña Colecciones ── */}
      {activeTab === 'colecciones' && (
        colecciones.length === 0
          ? <p className="col-empty">Aún no tienes colecciones. ¡Crea una!</p>
          : (
            <div className="col-colecciones-grid">
              {colecciones.map(col => {
                const imgs = getImagenesColeccion(col)
                const count = (col.inspiraciones || []).length
                return (
                  <div key={col._id} className="col-card">
                    {/* Thumbnail collage */}
                    <div className="col-thumb">
                      <div className="col-thumb-main">
                        {imgs[0]
                          ? <img src={imgs[0]} alt="" />
                          : <div className="col-thumb-placeholder" />
                        }
                      </div>
                      <div className="col-thumb-side">
                        <div className="col-thumb-side-item">
                          {imgs[1]
                            ? <img src={imgs[1]} alt="" />
                            : <div className="col-thumb-placeholder" />
                          }
                        </div>
                        <div className="col-thumb-side-item">
                          {imgs[2]
                            ? <img src={imgs[2]} alt="" />
                            : <div className="col-thumb-placeholder" />
                          }
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="col-card-info">
                      <div className="col-card-text">
                        <span className="col-card-nombre">{col.nombre}</span>
                        <span className="col-card-count">{count} inspiracion{count !== 1 ? 'es' : ''}</span>
                      </div>

                      <div className="col-card-menu-wrapper">
                        <button
                          className="col-dots-btn"
                          onClick={() =>
                            setMenuAbierto(prev =>
                              prev?.id === col._id ? null : { tipo: 'col', id: col._id }
                            )
                          }
                        >
                          <BsThreeDots size={20} />
                        </button>

                        {menuAbierto?.tipo === 'col' && menuAbierto?.id === col._id && (
                          <div className="col-dropdown col-dropdown-card" ref={menuRef}>
                            <button
                              className="col-dropdown-item col-dropdown-edit"
                              onClick={() => abrirModalEditar(col)}
                            >
                              <BiEdit size={16} /> Editar
                            </button>
                            <button
                              className="col-dropdown-item col-dropdown-delete"
                              onClick={() => eliminarColeccion(col._id)}
                            >
                              <BiTrash size={16} /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
      )}

      {/* ═══ Modal: Crear colección ═══ */}
      {modalCrear && (
        <div className="col-overlay" onClick={() => setModalCrear(false)}>
          <div className="col-modal" onClick={e => e.stopPropagation()}>
            <h2 className="col-modal-titulo">Crear Nueva Colección</h2>

            <label className="col-modal-label">Nombre de la colección</label>
            <input
              className="col-modal-input"
              placeholder="Ej: Inspo dormitorios"
              value={formNombre}
              onChange={e => setFormNombre(e.target.value)}
            />

            <div className="col-modal-insp-header">
              <label className="col-modal-label">Añadir inspiraciones</label>
              <button
                className="col-add-insp-btn"
                onClick={() => setMostrarPickerInsp(p => !p)}
              >
                <BiPlus size={20} />
              </button>
            </div>

            {mostrarPickerInsp && (
              <div className="col-picker">
                {inspiracionesDisponibles.length === 0
                  ? <p className="col-picker-empty">No hay más favoritos disponibles</p>
                  : inspiracionesDisponibles.map(insp => (
                    <button
                      key={insp._id}
                      className="col-picker-item"
                      onClick={() => addInspAlForm(insp)}
                    >
                      {insp.multimedia?.imagenes?.[0] && (
                        <img src={insp.multimedia.imagenes[0]} alt="" />
                      )}
                      <span>{insp.nombre}</span>
                    </button>
                  ))
                }
              </div>
            )}

            <div className="col-chips">
              {formInspiraciones.map(insp => {
                const id = insp._id || insp
                const nombre = insp.nombre || id
                return (
                  <span key={id} className="col-chip">
                    {nombre.length > 26 ? nombre.slice(0, 26) + '...' : nombre}
                    <button onClick={() => removeInspDelForm(id)}><BiX size={14} /></button>
                  </span>
                )
              })}
            </div>

            <div className="col-modal-actions">
              <button className="col-btn-cancelar" onClick={() => setModalCrear(false)}>Cancelar</button>
              <button
                className="col-btn-guardar"
                onClick={crearColeccion}
                disabled={guardando || !formNombre.trim()}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Editar colección ═══ */}
      {coleccionEditar && (
        <div className="col-overlay" onClick={() => setColeccionEditar(null)}>
          <div className="col-modal" onClick={e => e.stopPropagation()}>
            <h2 className="col-modal-titulo">Editar Colección</h2>

            <label className="col-modal-label">Nombre de la colección</label>
            <input
              className="col-modal-input"
              value={formNombre}
              onChange={e => setFormNombre(e.target.value)}
            />

            <div className="col-modal-insp-header">
              <label className="col-modal-label">Añadir/eliminar inspiraciones</label>
              <button
                className="col-add-insp-btn"
                onClick={() => setMostrarPickerInsp(p => !p)}
              >
                <BiPlus size={20} />
              </button>
            </div>

            {mostrarPickerInsp && (
              <div className="col-picker">
                {inspiracionesDisponibles.length === 0
                  ? <p className="col-picker-empty">No hay más favoritos disponibles</p>
                  : inspiracionesDisponibles.map(insp => (
                    <button
                      key={insp._id}
                      className="col-picker-item"
                      onClick={() => addInspAlForm(insp)}
                    >
                      {insp.multimedia?.imagenes?.[0] && (
                        <img src={insp.multimedia.imagenes[0]} alt="" />
                      )}
                      <span>{insp.nombre}</span>
                    </button>
                  ))
                }
              </div>
            )}

            <div className="col-chips">
              {formInspiraciones.map(insp => {
                const id = insp._id || insp
                const nombre = insp.nombre || id
                return (
                  <span key={id} className="col-chip">
                    {nombre.length > 26 ? nombre.slice(0, 26) + '...' : nombre}
                    <button onClick={() => removeInspDelForm(id)}><BiX size={14} /></button>
                  </span>
                )
              })}
            </div>

            <div className="col-modal-actions">
              <button className="col-btn-cancelar" onClick={() => setColeccionEditar(null)}>Cancelar</button>
              <button
                className="col-btn-guardar"
                onClick={editarColeccion}
                disabled={guardando || !formNombre.trim()}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Añadir inspiración a colección ═══ */}
      {inspiracionParaAnadir && (
        <div className="col-overlay" onClick={() => setInspiracionParaAnadir(null)}>
          <div className="col-modal" onClick={e => e.stopPropagation()}>
            <h2 className="col-modal-titulo">Añadir a colección</h2>
            <p className="col-modal-subtitle">"{inspiracionParaAnadir.nombre}"</p>

            {colecciones.length === 0
              ? <p className="col-empty">Aún no tienes colecciones. Crea una primero.</p>
              : (
                <div className="col-lista-colecciones">
                  {colecciones.map(col => {
                    const yaEsta = (col.inspiraciones || []).some(
                      i => (i._id || i) === inspiracionParaAnadir._id
                    )
                    return (
                      <button
                        key={col._id}
                        className={`col-lista-item ${yaEsta ? 'ya-esta' : ''}`}
                        onClick={() => !yaEsta && anadirInspAColeccion(col._id)}
                        disabled={yaEsta}
                      >
                        <span className="col-lista-nombre">{col.nombre}</span>
                        <span className="col-lista-count">
                          {(col.inspiraciones || []).length} insp.
                          {yaEsta && ' · Ya añadida'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            }

            <div className="col-modal-actions">
              <button className="col-btn-cancelar" onClick={() => setInspiracionParaAnadir(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
