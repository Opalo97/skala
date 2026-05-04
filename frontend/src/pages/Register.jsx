import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import API_BASE_URL from '../config/api';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState('https://res.cloudinary.com/skala/image/upload/v1777538122/foto_perfil_bmu1ge.jpg');
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

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor sube un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe pesar más de 5MB');
        return;
      }

      setFotoPerfil(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfilPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemovePhoto = () => {
    setFotoPerfil(null);
    setFotoPerfilPreview('https://res.cloudinary.com/skala/image/upload/v1777538122/foto_perfil_bmu1ge.jpg');
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
      // Crear FormData para enviar el archivo
      const form = new FormData();
      form.append('nombreCompleto', formData.nombreCompleto);
      form.append('username', formData.username);
      form.append('email', formData.email);
      form.append('password', formData.password);
      form.append('bio', formData.bio);
      
      // Añadir la foto solo si el usuario la cambió
      if (fotoPerfil) {
        form.append('fotoPerfil', fotoPerfil);
      }

      const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
        method: 'POST',
        body: form,
        // No establecer Content-Type, se establece automáticamente con FormData
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

          <div className="profile-photo-section">
            <label>Foto de Perfil</label>
            <div className="profile-photo-container">
              <img 
                src={fotoPerfilPreview} 
                alt="Foto de perfil preview" 
                className="profile-photo-preview"
              />
            </div>
            <div className="profile-photo-buttons">
              <label htmlFor="photoinput" className="photo-upload-btn">
                {fotoPerfil ? 'Cambiar foto' : 'Subir foto'}
              </label>
              <input
                type="file"
                id="photoinput"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                style={{ display: 'none' }}
              />
              {fotoPerfil && (
                <button 
                  type="button"
                  className="photo-remove-btn"
                  onClick={handleRemovePhoto}
                >
                  Eliminar foto
                </button>
              )}
            </div>
            <p className="photo-help-text">Sube una imagen JPG, PNG o GIF (máx 5MB)</p>
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
