/**
 * Configuración de la URL base para peticiones API
 * En desarrollo: http://localhost:5000
 * En producción: usa rutas relativas (/api/...)
 */

// Verificar si estamos en localhost
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE_URL = isLocalhost ? 'http://localhost:5000' : '';

export default API_BASE_URL;
