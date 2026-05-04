/**
 * Configuración de la URL base para peticiones API
 * En desarrollo: http://localhost:5000
 * En producción en Render: usa la misma URL del servidor (sin especificar dominio, rutas relativas)
 */

// En el navegador, si estamos en localhost, usa localhost:5000
// Si no, usa rutas relativas al mismo servidor
const getAPIBaseURL = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  
  const { hostname, protocol } = window.location;
  
  // En development local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // En producción (Render u otro) - usa rutas relativas al mismo servidor
  return '';
};

const API_BASE_URL = getAPIBaseURL();

console.log('🔧 API_BASE_URL configurada como:', API_BASE_URL || '(raíz del servidor)');

export default API_BASE_URL;
