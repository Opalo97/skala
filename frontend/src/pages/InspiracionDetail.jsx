import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function InspiracionDetail() {
  const { id } = useParams()
  const [inspiracion, setInspiracion] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchInspiracion = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/inspiraciones/${id}`)
        if (!response.ok) throw new Error('No encontrada')
        const data = await response.json()
        setInspiracion(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInspiracion()
  }, [id])

  if (loading) return <div><h1>Cargando...</h1></div>
  if (!inspiracion) return <div><h1>No encontrada</h1></div>

  return (
    <div className="inspiracion-detail">
      <button onClick={() => navigate(-1)}>← Volver</button>
      <h1>{inspiracion.nombre}</h1>
      <p><strong>Zona:</strong> {inspiracion.zonaCasa}</p>
      <p><strong>Categoría:</strong> {inspiracion.categoriaDecoracion}</p>
      
      <div className="images-gallery">
        {inspiracion.multimedia?.imagenes?.map((img, idx) => (
          <img key={idx} src={img} alt={`${inspiracion.nombre} ${idx + 1}`} />
        ))}
      </div>

      {inspiracion.productos && inspiracion.productos.length > 0 && (
        <div className="productos">
          <h2>Productos relacionados</h2>
          {/* Mostrar productos */}
        </div>
      )}
    </div>
  )
}