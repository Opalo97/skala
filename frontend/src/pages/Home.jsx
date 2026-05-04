import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import API_BASE_URL from '../config/api'

export default function Home() {
  const [inspiraciones, setInspiraciones] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('inspiraciones')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resInspiraciones, resProductos] = await Promise.all([
          fetch(`${API_BASE_URL}/api/inspiraciones`),
          fetch(`${API_BASE_URL}/api/productos`)
        ])
        if (!resInspiraciones.ok || !resProductos.ok) throw new Error('Error al obtener datos')

        const [dataInsp, dataProd] = await Promise.all([
          resInspiraciones.json(),
          resProductos.json()
        ])
        setInspiraciones(dataInsp)
        setProductos(dataProd)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="home-container"><p>Cargando datos...</p></div>
  if (error) return <div className="home-container"><p>Error: {error}</p></div>

  return (
    <div className="home-container">
      <div className="tabs-wrapper">
        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'inspiraciones'}
            className={`tab ${activeTab === 'inspiraciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('inspiraciones')}
          >
            Inspiraciones
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'productos'}
            className={`tab ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            Productos
          </button>
        </div>
      </div>

      {activeTab === 'inspiraciones' && (
        <div className="inspiraciones-grid">
          {inspiraciones.map((inspiracion) => (
            inspiracion.multimedia?.imagenes?.length > 0 && (
              <Link
                key={inspiracion._id}
                to={`/inspiracion/${inspiracion._id}`}
                className="inspiracion-item"
              >
                <img
                  src={inspiracion.multimedia.imagenes[0]}
                  alt={inspiracion.nombre}
                  className="inspiracion-imagen"
                />
              </Link>
            )
          ))}
        </div>
      )}

      {activeTab === 'productos' && (
        <div className="inspiraciones-grid">
          {productos.map((producto) => (
            <Link
              key={producto._id}
              to={`/item/${producto._id}`}
              className="inspiracion-item producto-item"
            >
              {producto.imagenes?.length > 0 ? (
                <img
                  src={producto.imagenes[0]}
                  alt={producto.nombre}
                  className="inspiracion-imagen"
                />
              ) : (
                <div className="producto-placeholder" />
              )}
              <p className="producto-nombre">{producto.nombre}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}