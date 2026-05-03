import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiEdit, BiCheck, BiX } from 'react-icons/bi';
import './Perfil.css';

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState({ nombreCompleto: false, email: false, password: false });
  const [editedValues, setEditedValues] = useState({ nombreCompleto: '', email: '', password: '' });

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuarioId');
    
    if (!usuarioId) {
      navigate('/login');
      return;
    }

    fetchUsuario(usuarioId);
  }, [navigate]);

  const fetchUsuario = async (usuarioId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuarioId}`);
      if (!response.ok) {
        throw new Error('Error al obtener el perfil');
      }
      const data = await response.json();
      setUsuario(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor sube un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe pesar más de 5MB');
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('fotoPerfil', file);

      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario._id}/actualizar-foto`, {
        method: 'PUT',
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || 'Error al actualizar la foto');
      }

      const updatedUser = await response.json();
      setUsuario(updatedUser);
      alert('Foto de perfil actualizada correctamente');
    } catch (err) {
      alert(err.message || 'Error al actualizar la foto');
    } finally {
      setUploading(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  const handleEditClick = (field) => {
    setEditedValues(prev => ({ ...prev, [field]: field === 'password' ? '' : (usuario[field] || '') }));
    setEditing(prev => ({ ...prev, [field]: true }));
  };

  const handleCancelEdit = (field) => {
    setEditedValues(prev => ({ ...prev, [field]: '' }));
    setEditing(prev => ({ ...prev, [field]: false }));
  };

  const handleChangeField = (field, value) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (field) => {
    const value = editedValues[field];
    if (field !== 'password' && (!value || value.trim() === '')) {
      alert('El campo no puede estar vacío');
      return;
    }

    try {
      const body = {};
      body[field] = value;

      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || 'Error al actualizar');
      }

      const updatedUser = await response.json();
      setUsuario(updatedUser);
      setEditing(prev => ({ ...prev, [field]: false }));
      setEditedValues(prev => ({ ...prev, [field]: '' }));
      alert('Campo actualizado correctamente');
    } catch (err) {
      alert(err.message || 'Error al actualizar');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // TODO: Implementar eliminar cuenta
      console.log('Eliminar cuenta');
    }
  };

  if (loading) {
    return <div className="page-container"><p>Cargando perfil...</p></div>;
  }

  if (error) {
    return <div className="page-container"><p>Error: {error}</p></div>;
  }

  if (!usuario) {
    return <div className="page-container"><p>Usuario no encontrado</p></div>;
  }

  return (
    <div className="page-container perfil-container">
      <div className="perfil-card">
        <div className="perfil-header-section">
          <div className="perfil-image-wrapper">
            <img 
              src={usuario.fotoPerfil || 'https://res.cloudinary.com/skala/image/upload/v1777538122/foto_perfil_bmu1ge.jpg'} 
              alt={usuario.username} 
              className="perfil-image-large" 
            />
            <label htmlFor="photo-input" className="edit-photo-btn" title="Cambiar foto de perfil">
              {uploading ? 'Cargando...' : 'Cambiar foto de perfil'}
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </div>
          
          <div className="perfil-info-header">
            <div className="name-block">
              <h1>{usuario.nombreCompleto}</h1>
              <p className="username">@{usuario.username}</p>
            </div>

            <div className="perfil-stats-horizontal centered">
              <div className="stat-item">
                <span className="stat-value">{usuario.seguidores || 0}</span>
                <span className="stat-label">seguidores</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{usuario.seguidos || 0}</span>
                <span className="stat-label">seguidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Mis datos */}
          <div className="mis-datos-section">
          <h3>Mis datos</h3>
          
          <div className="datos-field">
            <label>Nombre completo</label>
            <div className="field-with-edit">
              <input type="text" value={editing.nombreCompleto ? editedValues.nombreCompleto : usuario.nombreCompleto} disabled={!editing.nombreCompleto} onChange={(e) => handleChangeField('nombreCompleto', e.target.value)} />
              {editing.nombreCompleto ? (
                <>
                  <button className="edit-btn" title="Guardar" onClick={() => handleSaveField('nombreCompleto')}><BiCheck size={18} /></button>
                  <button className="edit-btn" title="Cancelar" onClick={() => handleCancelEdit('nombreCompleto')}><BiX size={18} /></button>
                </>
              ) : (
                <button className="edit-btn" title="Editar" onClick={() => handleEditClick('nombreCompleto')}><BiEdit size={18} /></button>
              )}
            </div>
          </div>

          <div className="datos-field">
            <label>Contraseña</label>
            <div className="field-with-edit">
              <input type="password" value={editing.password ? editedValues.password : '••••••••••••••••'} disabled={!editing.password} onChange={(e) => handleChangeField('password', e.target.value)} />
              {editing.password ? (
                <>
                  <button className="edit-btn" title="Guardar" onClick={() => handleSaveField('password')}><BiCheck size={18} /></button>
                  <button className="edit-btn" title="Cancelar" onClick={() => handleCancelEdit('password')}><BiX size={18} /></button>
                </>
              ) : (
                <button className="edit-btn" title="Editar" onClick={() => handleEditClick('password')}><BiEdit size={18} /></button>
              )}
            </div>
          </div>

          <div className="datos-field">
            <label>Correo electrónico</label>
            <div className="field-with-edit">
              <input type="email" value={editing.email ? editedValues.email : usuario.email} disabled={!editing.email} onChange={(e) => handleChangeField('email', e.target.value)} />
              {editing.email ? (
                <>
                  <button className="edit-btn" title="Guardar" onClick={() => handleSaveField('email')}><BiCheck size={18} /></button>
                  <button className="edit-btn" title="Cancelar" onClick={() => handleCancelEdit('email')}><BiX size={18} /></button>
                </>
              ) : (
                <button className="edit-btn" title="Editar" onClick={() => handleEditClick('email')}><BiEdit size={18} /></button>
              )}
            </div>
          </div>
        </div>

        {/* Sección Mis modelos */}
        <div className="mis-modelos-section">
          <button className="mis-modelos-btn" onClick={() => navigate('/mis-modelos')}>
            <div className="mis-modelos-placeholder">
              Mis modelos
            </div>
          </button>
        </div>

        {/* Botones de acción */}
        <div className="perfil-actions">
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
          <button className="btn-delete" onClick={handleDeleteAccount}>Eliminar cuenta</button>
        </div>
      </div>
    </div>
  );
}

