import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BiPlus, BiEdit, BiTrash } from 'react-icons/bi'
import { BsThreeDots } from 'react-icons/bs'
import { BiX } from 'react-icons/bi'
import './ListasDestacadas.css'
import API_BASE_URL from '../config/api'

export default function ListasDestacadas() {
  const [activeTab, setActiveTab] = useState('favoritos')
  const [favoritos, setFavoritos] = useState([])
  const [listas, setListas] = useState([])
  const [loading, setLoading] = useState(true)

  // Menú "..." abierto: { tipo: 'fav' | 'lista', id }
  const [menuAbierto, setMenuAbierto] = useState(null)
  const menuRef = useRef(null)

  // Modal crear lista
  const [modalCrear, setModalCrear] = useState(false)

  // Modal editar lista
  const [listaEditar, setListaEditar] = useState(null)

  // Modal añadir producto a lista (desde pestaña favoritos)
  const [productoParaAnadir, setProductoParaAnadir] = useState(null)

  // Estado compartido del formulario crear/editar
  const [formNombre, setFormNombre] = useState('')
  const [formProductos, setFormProductos] = useState([])
  const [mostrarPickerProd, setMostrarPickerProd] = useState(false)
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
      const [resUser, resListas] = await Promise.all([
        fetch(`${API_BASE_URL}/api/usuarios/${usuarioId}`),
        fetch(`${API_BASE_URL}/api/listas/usuario/${usuarioId}`)
      ])
      const user = await resUser.json()
      const listasData = await resListas.json()

      const favIds = user.favoritosProductos || []
      const prodData = await Promise.all(
        favIds.map(id =>
          fetch(`${API_BASE_URL}/api/productos/${id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      )
      setFavoritos(prodData.filter(p => p && p._id))
      setListas(Array.isArray(listasData) ? listasData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Helpers thumbnail ──────────────────────────────────────────────────
  const getImagenesLista = (lista) => {
    const imgs = []
    for (const prod of lista.productos || []) {
      const primera = prod?.imagenes?.[0]
      if (primera) imgs.push(primera)
      if (imgs.length >= 3) break
    }
    return imgs
  }

  // ── Crear lista ────────────────────────────────────────────────────────
  const abrirModalCrear = () => {
    setFormNombre('')
    setFormProductos([])
    setMostrarPickerProd(false)
    setModalCrear(true)
  }

  const crearLista = async () => {
    if (!formNombre.trim()) return
    setGuardando(true)
    try {
      await fetch(`${API_BASE_URL}/api/listas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          creadaPor: usuarioId,
          productos: formProductos.map(p => p._id)
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

  // ── Editar lista ───────────────────────────────────────────────────────
  const abrirModalEditar = (lista) => {
    setListaEditar(lista)
    setFormNombre(lista.nombre)
    setFormProductos(lista.productos || [])
    setMostrarPickerProd(false)
    setMenuAbierto(null)
  }

  const editarLista = async () => {
    if (!formNombre.trim() || !listaEditar) return
    setGuardando(true)
    try {
      await fetch(`${API_BASE_URL}/api/listas/${listaEditar._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          productos: formProductos.map(p => p._id || p)
        })
      })
      setListaEditar(null)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  // ── Eliminar lista ─────────────────────────────────────────────────────
  const eliminarLista = async (listaId) => {
    if (!window.confirm('¿Eliminar esta lista?')) return
    setMenuAbierto(null)
    try {
      await fetch(`${API_BASE_URL}/api/listas/${listaId}`, { method: 'DELETE' })
      await fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  // ── Añadir producto a lista (desde pestaña favoritos) ─────────────────
  const anadirProdALista = async (listaId) => {
    if (!productoParaAnadir) return
    const lista = listas.find(l => l._id === listaId)
    if (!lista) return
    const idsActuales = (lista.productos || []).map(p => p._id || p)
    if (idsActuales.includes(productoParaAnadir._id)) {
      setProductoParaAnadir(null)
      return
    }
    try {
      await fetch(`${API_BASE_URL}/api/listas/${listaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: [...idsActuales, productoParaAnadir._id] })
      })
      setProductoParaAnadir(null)
      await fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  // ── Picker de productos en modal crear/editar ──────────────────────────
  const productosDisponibles = favoritos.filter(
    fav => !formProductos.some(fp => (fp._id || fp) === fav._id)
  )

  const addProdAlForm = (prod) => {
    setFormProductos(prev => [...prev, prod])
    setMostrarPickerProd(false)
  }

  const removeProdDelForm = (prodId) => {
    setFormProductos(prev => prev.filter(p => (p._id || p) !== prodId))
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
        <h1 className="col-titulo">Productos favoritos</h1>
        {activeTab === 'listas' && (
          <button className="col-nueva-btn" onClick={abrirModalCrear}>
            <BiPlus size={18} /> Nueva Lista
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
            className={`tab ${activeTab === 'listas' ? 'active' : ''}`}
            onClick={() => setActiveTab('listas')}
          >
            Listas
          </button>
        </div>
      </div>

      {/* ── Pestaña Favoritos ── */}
      {activeTab === 'favoritos' && (
        favoritos.length === 0
          ? <p className="col-empty">Aún no tienes productos favoritos.</p>
          : (
            <div className="inspiraciones-grid">
              {favoritos.map(prod => (
                <div key={prod._id} className="col-fav-item col-fav-producto">
                  <Link to={`/item/${prod._id}`}>
                    {prod.imagenes?.[0] ? (
                      <img
                        src={prod.imagenes[0]}
                        alt={prod.nombre}
                        className="inspiracion-imagen"
                      />
                    ) : (
                      <div className="col-prod-placeholder" />
                    )}
                  </Link>
                  <p className="col-prod-nombre">{prod.nombre}</p>
                  {prod.precio != null && (
                    <p className="col-prod-precio">{prod.precio}€</p>
                  )}

                  <div className="col-fav-menu-row">
                    <button
                      className="col-dots-btn"
                      onClick={() =>
                        setMenuAbierto(prev =>
                          prev?.id === prod._id ? null : { tipo: 'fav', id: prod._id }
                        )
                      }
                    >
                      <BsThreeDots size={20} />
                    </button>

                    {menuAbierto?.tipo === 'fav' && menuAbierto?.id === prod._id && (
                      <div className="col-dropdown" ref={menuRef}>
                        <button
                          className="col-dropdown-item"
                          onClick={() => {
                            setProductoParaAnadir(prod)
                            setMenuAbierto(null)
                          }}
                        >
                          Añadir a lista
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {/* ── Pestaña Listas ── */}
      {activeTab === 'listas' && (
        listas.length === 0
          ? <p className="col-empty">Aún no tienes listas. ¡Crea una!</p>
          : (
            <div className="col-colecciones-grid">
              {listas.map(lista => {
                const imgs = getImagenesLista(lista)
                const count = (lista.productos || []).length
                return (
                  <div key={lista._id} className="col-card">
                    {/* Thumbnail collage */}
                    <Link to={`/lista/${lista._id}`} className="col-thumb">
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
                    </Link>

                    {/* Info */}
                    <div className="col-card-info">
                      <div className="col-card-text">
                        <span className="col-card-nombre">{lista.nombre}</span>
                        <span className="col-card-count">{count} mueble{count !== 1 ? 's' : ''}</span>
                      </div>

                      <div className="col-card-menu-wrapper">
                        <button
                          className="col-dots-btn"
                          onClick={() =>
                            setMenuAbierto(prev =>
                              prev?.id === lista._id ? null : { tipo: 'lista', id: lista._id }
                            )
                          }
                        >
                          <BsThreeDots size={20} />
                        </button>

                        {menuAbierto?.tipo === 'lista' && menuAbierto?.id === lista._id && (
                          <div className="col-dropdown col-dropdown-card" ref={menuRef}>
                            <button
                              className="col-dropdown-item col-dropdown-edit"
                              onClick={() => abrirModalEditar(lista)}
                            >
                              <BiEdit size={16} /> Editar
                            </button>
                            <button
                              className="col-dropdown-item col-dropdown-delete"
                              onClick={() => eliminarLista(lista._id)}
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

      {/* ═══ Modal: Crear lista ═══ */}
      {modalCrear && (
        <div className="col-overlay" onClick={() => setModalCrear(false)}>
          <div className="col-modal" onClick={e => e.stopPropagation()}>
            <h2 className="col-modal-titulo">Crear Nueva Lista</h2>

            <label className="col-modal-label">Nombre de la lista</label>
            <input
              className="col-modal-input"
              placeholder="Ej: Inspo sofás"
              value={formNombre}
              onChange={e => setFormNombre(e.target.value)}
            />

            <div className="col-modal-insp-header">
              <label className="col-modal-label">Añadir productos/muebles</label>
              <button
                className="col-add-insp-btn"
                onClick={() => setMostrarPickerProd(p => !p)}
              >
                <BiPlus size={20} />
              </button>
            </div>

            {mostrarPickerProd && (
              <div className="col-picker">
                {productosDisponibles.length === 0
                  ? <p className="col-picker-empty">No hay más favoritos disponibles</p>
                  : productosDisponibles.map(prod => (
                    <button
                      key={prod._id}
                      className="col-picker-item"
                      onClick={() => addProdAlForm(prod)}
                    >
                      {prod.imagenes?.[0] && (
                        <img src={prod.imagenes[0]} alt="" />
                      )}
                      <span>{prod.nombre}</span>
                    </button>
                  ))
                }
              </div>
            )}

            <div className="col-chips">
              {formProductos.map(prod => {
                const id = prod._id || prod
                const nombre = prod.nombre || id
                return (
                  <span key={id} className="col-chip">
                    {nombre.length > 26 ? nombre.slice(0, 26) + '...' : nombre}
                    <button onClick={() => removeProdDelForm(id)}><BiX size={14} /></button>
                  </span>
                )
              })}
            </div>

            <div className="col-modal-actions">
              <button className="col-btn-cancelar" onClick={() => setModalCrear(false)}>Cancelar</button>
              <button
                className="col-btn-guardar"
                onClick={crearLista}
                disabled={guardando || !formNombre.trim()}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Editar lista ═══ */}
      {listaEditar && (
        <div className="col-overlay" onClick={() => setListaEditar(null)}>
          <div className="col-modal" onClick={e => e.stopPropagation()}>
            <h2 className="col-modal-titulo">Editar Lista</h2>

            <label className="col-modal-label">Nombre de la Lista</label>
            <input
              className="col-modal-input"
              value={formNombre}
              onChange={e => setFormNombre(e.target.value)}
            />

            <div className="col-modal-insp-header">
              <label className="col-modal-label">Añadir/eliminar productos</label>
              <button
                className="col-add-insp-btn"
                onClick={() => setMostrarPickerProd(p => !p)}
              >
                <BiPlus size={20} />
              </button>
            </div>

            {mostrarPickerProd && (
              <div className="col-picker">
                {productosDisponibles.length === 0
                  ? <p className="col-picker-empty">No hay más favoritos disponibles</p>
                  : productosDisponibles.map(prod => (
                    <button
                      key={prod._id}
                      className="col-picker-item"
                      onClick={() => addProdAlForm(prod)}
                    >
                      {prod.imagenes?.[0] && (
                        <img src={prod.imagenes[0]} alt="" />
                      )}
                      <span>{prod.nombre}</span>
                    </button>
                  ))
                }
              </div>
            )}

            <div className="col-chips">
              {formProductos.map(prod => {
                const id = prod._id || prod
                const nombre = prod.nombre || id
                return (
                  <span key={id} className="col-chip">
                    {nombre.length > 26 ? nombre.slice(0, 26) + '...' : nombre}
                    <button onClick={() => removeProdDelForm(id)}><BiX size={14} /></button>
                  </span>
                )
              })}
            </div>

            <div className="col-modal-actions">
              <button className="col-btn-cancelar" onClick={() => setListaEditar(null)}>Cancelar</button>
              <button
                className="col-btn-guardar"
                onClick={editarLista}
                disabled={guardando || !formNombre.trim()}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Añadir producto a lista ═══ */}
      {productoParaAnadir && (
        <div className="col-overlay" onClick={() => setProductoParaAnadir(null)}>
          <div className="col-modal" onClick={e => e.stopPropagation()}>
            <h2 className="col-modal-titulo">Añadir a lista</h2>
            <p className="col-modal-subtitle">"{productoParaAnadir.nombre}"</p>

            {listas.length === 0
              ? <p className="col-empty">Aún no tienes listas. Crea una primero.</p>
              : (
                <div className="col-lista-colecciones">
                  {listas.map(lista => {
                    const yaEsta = (lista.productos || []).some(
                      p => (p._id || p) === productoParaAnadir._id
                    )
                    return (
                      <button
                        key={lista._id}
                        className={`col-lista-item ${yaEsta ? 'ya-esta' : ''}`}
                        onClick={() => !yaEsta && anadirProdALista(lista._id)}
                        disabled={yaEsta}
                      >
                        <span className="col-lista-nombre">{lista.nombre}</span>
                        <span className="col-lista-count">
                          {(lista.productos || []).length} muebles
                          {yaEsta && ' · Ya añadido'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            }

            <div className="col-modal-actions">
              <button className="col-btn-cancelar" onClick={() => setProductoParaAnadir(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
