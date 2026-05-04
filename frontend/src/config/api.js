/**
 * Configuración de la URL base para peticiones API
 * En desarrollo: http://localhost:5000
 * En producción: usa rutas relativas (/api/...)
 */

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000'
  : '';

export default API_BASE_URL;
