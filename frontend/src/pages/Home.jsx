import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const [inspiraciones, setInspiraciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInspiraciones = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/inspiraciones')
        if (!response.ok) throw new Error('Error al obtener inspiraciones')
        const data = await response.json()
        setInspiraciones(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInspiraciones()
  }, [])

  if (loading) return <div className="home-container"><p>Cargando inspiraciones...</p></div>
  if (error) return <div className="home-container"><p>Error: {error}</p></div>

  return (
    <div className="home-container">
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
    </div>
  )
}