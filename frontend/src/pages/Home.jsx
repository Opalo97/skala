import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const [inspiraciones, setInspiraciones] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resInspiraciones, resProductos] = await Promise.all([
          fetch('http://localhost:5000/api/inspiraciones'),
          fetch('http://localhost:5000/api/productos')
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
      <h2>Inspiraciones</h2>
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

      <h2 style={{ marginTop: '40px' }}>Productos</h2>
      <div className="inspiraciones-grid">
        {productos.map((producto) => (
          <Link 
            key={producto._id} 
            to={`/item/${producto._id}`}
            className="inspiracion-item"
            style={{ backgroundColor: '#f0f0f0', padding: '10px', textDecoration: 'none', color: '#333' }}
          >
            {producto.imagenes?.length > 0 ? (
              <img 
                src={producto.imagenes[0]} 
                alt={producto.nombre}
                className="inspiracion-imagen"
              />
            ) : (
              <div style={{width:'100%', height:'150px', background:'#ccc'}}></div>
            )}
            <p>{producto.nombre}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}