import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Buscar.css'
import API_BASE_URL from '../config/api'

export default function Buscar() {
  const [inspiraciones, setInspiraciones] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('inspiraciones')
  const [searchTerm, setSearchTerm] = useState('')

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

  const filterItems = (items, searchText) => {
    if (!searchText.trim()) return items
    return items.filter(item => 
      item.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  const filteredInspiraciones = filterItems(inspiraciones, searchTerm)
  const filteredProductos = filterItems(productos, searchTerm)

  if (loading) return <div className="buscar-container"><p>Cargando datos...</p></div>
  if (error) return <div className="buscar-container"><p>Error: {error}</p></div>

  return (
    <div className="buscar-container">
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

      <div className="search-bar-wrapper">
        <input
          type="text"
          className="search-bar"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'inspiraciones' && (
        <div className="inspiraciones-grid">
          {filteredInspiraciones.length > 0 ? (
            filteredInspiraciones.map((inspiracion) => (
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
            ))
          ) : (
            <p className="no-results">No se encontraron inspiraciones</p>
          )}
        </div>
      )}

      {activeTab === 'productos' && (
        <div className="inspiraciones-grid">
          {filteredProductos.length > 0 ? (
            filteredProductos.map((producto) => (
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
            ))
          ) : (
            <p className="no-results">No se encontraron productos</p>
          )}
        </div>
      )}
    </div>
  )
}
