import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BiHeart, BiSolidHeart } from 'react-icons/bi'
import { BsArrowRight } from 'react-icons/bs'
import axios from 'axios'
import './InspiracionDetail.css'
import API_BASE_URL from '../config/api'

export default function InspiracionDetail() {
  const { id } = useParams()
  const [inspiracion, setInspiracion] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mediaActual, setMediaActual] = useState(null)
  const [modalGaleriaAbierto, setModalGaleriaAbierto] = useState(false)
  const [esFavorito, setEsFavorito] = useState(false)
  const [modalComentarioAbierto, setModalComentarioAbierto] = useState(false)
  const [textoComentario, setTextoComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId')
        const [resInsp, resComentarios, resUser] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/inspiraciones/${id}`),
          axios.get(`${API_BASE_URL}/api/comentarios/inspiracion/${id}`),
          usuarioId ? axios.get(`${API_BASE_URL}/api/usuarios/${usuarioId}`) : Promise.resolve(null)
        ])

        const insp = resInsp.data
        setInspiracion(insp)

        const primerMedia =
          insp.multimedia?.imagenes?.[0] ? { type: 'image', url: insp.multimedia.imagenes[0] } :
          insp.multimedia?.videos?.[0]   ? { type: 'video', url: insp.multimedia.videos[0] }   : null
        if (primerMedia) setMediaActual(primerMedia)

        setComentarios(resComentarios.data || [])

        if (resUser?.data?.favoritosInspiraciones) {
          setEsFavorito(resUser.data.favoritosInspiraciones.map(String).includes(String(id)))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    fetchData()
  }, [id])

  const toggleFavorito = async () => {
    const usuarioId = localStorage.getItem('usuarioId')
    if (!usuarioId) return
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/usuarios/${usuarioId}/favorito-inspiracion`,
        { inspiracionId: id }
      )
      setEsFavorito(res.data.favorito)
    } catch (error) {
      console.error('Error al actualizar favorito:', error)
    }
  }

  const publicarComentario = async () => {
    const usuarioId = localStorage.getItem('usuarioId')
    if (!usuarioId || !textoComentario.trim()) return
    setEnviando(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/api/comentarios`, {
        inspiracion: id,
        usuario: usuarioId,
        texto: textoComentario.trim()
      })
      const username = localStorage.getItem('username')
      setComentarios(prev => [...prev, { ...res.data, usuario: { username } }])
      setTextoComentario('')
      setModalComentarioAbierto(false)
    } catch (error) {
      console.error('Error al publicar comentario:', error)
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <div className="insp-loading">Cargando...</div>
  if (!inspiracion) return <div className="insp-loading">Inspiración no encontrada</div>

  const allMedia = [
    ...(inspiracion.multimedia?.imagenes || []).map(url => ({ type: 'image', url })),
    ...(inspiracion.multimedia?.videos   || []).map(url => ({ type: 'video', url })),
  ]
  const totalMedia     = allMedia.length
  const mostrarColumna = totalMedia > 1
  const thumbnails     = allMedia.slice(0, 3)
  const btnActivo      = totalMedia > 4
  const mediaEnMain    = mediaActual || allMedia[0] || { type: 'image', url: '' }

  return (
    <div className="insp-detail-page">
      <div className="insp-detail-container">

        {/* ── Fila superior: galería + info ── */}
        <div className="insp-top-row">

          {/* Galería */}
          <div className="gallery-section">
            <div className="main-image-container">
              {mediaEnMain.type === 'image' && (
                <a href={mediaEnMain.url} target="_blank" rel="noreferrer">
                  <img src={mediaEnMain.url} alt={inspiracion.nombre} className="main-image" />
                </a>
              )}
              {mediaEnMain.type === 'video' && (
                <video src={mediaEnMain.url} controls className="main-image main-video" />
              )}
            </div>

            {mostrarColumna && (
              <div className="thumbnails-column">
                {thumbnails.map((media, i) => {
                  const esActivo = mediaActual?.url === media.url
                  if (media.type === 'image') return (
                    <img
                      key={i}
                      src={media.url}
                      alt={`Vista ${i + 1}`}
                      className={`thumbnail-img${esActivo ? ' active' : ''}`}
                      onClick={() => setMediaActual(media)}
                    />
                  )
                  if (media.type === 'video') return (
                    <video
                      key={i}
                      src={media.url}
                      muted
                      className={`thumbnail-img${esActivo ? ' active' : ''}`}
                      onClick={() => setMediaActual(media)}
                    />
                  )
                  return null
                })}
                <button
                  className={`add-thumbnail-btn${btnActivo ? '' : ' disabled'}`}
                  onClick={btnActivo ? () => setModalGaleriaAbierto(true) : undefined}
                  disabled={!btnActivo}
                >+</button>
              </div>
            )}
          </div>

          {/* Info derecha */}
          <div className="insp-info-section">
            <div className="insp-info-header">
              <h1 className="insp-title">{inspiracion.nombre}</h1>
              <button className="fav-btn" onClick={toggleFavorito}>
                {esFavorito ? <BiSolidHeart size={28} /> : <BiHeart size={28} />}
              </button>
            </div>

            <div className="insp-products-section">
              <p className="insp-products-label">Productos de la inspiración</p>
              <div className="insp-products-list">
                {inspiracion.productos?.length > 0
                  ? inspiracion.productos.map((prod) => (
                      <Link
                        key={prod._id || prod}
                        to={`/item/${prod._id || prod}`}
                        className="insp-product-btn"
                      >
                        <span>{prod.nombre || 'Ver producto'}</span>
                        <BsArrowRight size={18} />
                      </Link>
                    ))
                  : <p className="insp-no-products">Sin productos asociados</p>
                }
              </div>
            </div>
          </div>
        </div>

        {/* ── Fila inferior: autor + comentarios ── */}
        <div className="insp-bottom-row">

          {/* Autor y añadir comentario */}
          <div className="insp-left-bottom">
            <div className="insp-autor-block">
              <p className="insp-section-label">Autor/a</p>
              {inspiracion.autor && (
                <Link
                  to={`/perfil/${inspiracion.autor._id || inspiracion.autor}`}
                  className="uploader-pill"
                >
                  @{inspiracion.autor.username || 'usuario'}
                </Link>
              )}
            </div>

            <div className="insp-add-comment-block">
              <p className="insp-section-label">Añadir comentario</p>
              <button
                className="add-comment-btn"
                onClick={() => setModalComentarioAbierto(true)}
              >+</button>
            </div>
          </div>

          {/* Comentarios */}
          <div className="insp-comentarios-section">
            <p className="insp-section-label">Comentarios</p>
            <div className="insp-comentarios-list">
              {comentarios.length === 0
                ? <p className="insp-no-comments">Sin comentarios todavía</p>
                : comentarios.map((c) => (
                    <div key={c._id} className="insp-comentario-card">
                      <p className="insp-comentario-autor">@{c.usuario?.username || 'usuario'}</p>
                      <p className="insp-comentario-texto">{c.texto}</p>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal galería completa ── */}
      {modalGaleriaAbierto && (
        <div className="galeria-overlay" onClick={() => setModalGaleriaAbierto(false)}>
          <div className="galeria-modal" onClick={e => e.stopPropagation()}>
            <button className="galeria-modal-close" onClick={() => setModalGaleriaAbierto(false)}>×</button>
            <h3 className="galeria-modal-titulo">Galería completa</h3>
            <div className="galeria-modal-grid">
              {allMedia.map((media, i) => {
                const esSeleccionada = mediaActual?.url === media.url
                if (media.type === 'image') return (
                  <img
                    key={i}
                    src={media.url}
                    alt={`Media ${i + 1}`}
                    className={`galeria-modal-item${esSeleccionada ? ' seleccionada' : ''}`}
                    onClick={() => { setMediaActual(media); setModalGaleriaAbierto(false) }}
                  />
                )
                if (media.type === 'video') return (
                  <video
                    key={i}
                    src={media.url}
                    muted
                    className={`galeria-modal-item${esSeleccionada ? ' seleccionada' : ''}`}
                    onClick={() => { setMediaActual(media); setModalGaleriaAbierto(false) }}
                  />
                )
                return null
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal añadir comentario ── */}
      {modalComentarioAbierto && (
        <div className="galeria-overlay" onClick={() => setModalComentarioAbierto(false)}>
          <div className="comentario-modal" onClick={e => e.stopPropagation()}>
            <h3 className="comentario-modal-titulo">
              Añadir comentario como{' '}
              <span className="comentario-modal-username">
                @{localStorage.getItem('username') || 'usuario'}
              </span>:
            </h3>
            <textarea
              className="comentario-textarea"
              placeholder="Escribe tu comentario..."
              value={textoComentario}
              onChange={e => setTextoComentario(e.target.value)}
              rows={4}
            />
            <div className="comentario-modal-actions">
              <button
                className="comentario-cancel-btn"
                onClick={() => { setModalComentarioAbierto(false); setTextoComentario('') }}
              >
                Cancelar
              </button>
              <button
                className="comentario-publish-btn"
                onClick={publicarComentario}
                disabled={enviando || !textoComentario.trim()}
              >
                {enviando ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
