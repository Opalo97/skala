import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.nombreCompleto || !formData.username || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreCompleto: formData.nombreCompleto,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          fotoPerfil: '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || 'Error al registrar');
      }

      const newUser = await response.json();
      
      // Guardar el ID del usuario en localStorage
      localStorage.setItem('usuarioId', newUser._id);
      localStorage.setItem('username', newUser.username);

      // Redirigir al perfil
      navigate('/perfil');
    } catch (err) {
      setError(err.message || 'Error al registrar. Intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Crear Cuenta</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombreCompleto">Nombre Completo</label>
            <input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tu nombre de usuario"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Biografía (Opcional)</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuéntanos sobre ti"
              rows="3"
            />
          </div>

          <div className="auth-form-buttons">
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
            <button type="button" className="auth-signup-btn" onClick={() => navigate('/login')}>
              Ya tengo cuenta
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>Al registrarte aceptas nuestros <a href="/privacy-policy">términos y condiciones</a></p>
        </div>
      </div>
    </div>
  );
}
