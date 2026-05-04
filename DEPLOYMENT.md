# 🚀 Guía de Deployment en Render

## Configuración del Proyecto

Este proyecto es un **monorepo** con frontend (React + Vite) y backend (Express + MongoDB).

## Pasos para desplegar en Render

### 1. **Crear un nuevo Web Service en Render**

1. Ve a [Render.com](https://render.com)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub

### 2. **Configurar el Web Service**

- **Name**: El nombre que desees para tu aplicación
- **Runtime**: Node
- **Root Directory**: (Dejar vacío - raíz del proyecto)
- **Build Command**: `npm install && npm run build:all`
- **Start Command**: `npm start`

### 3. **Agregar variables de entorno**

En la sección "Environment" de Render, agrega:

```
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/skala
CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_KEY=tu_api_key
CLOUDINARY_SECRET=tu_api_secret
NODE_ENV=production
```

### 4. **Deploy**

¡Listo! Render detectará los cambios en el repositorio y desplegará automáticamente.

---

## Scripts disponibles

```bash
# Instalar todas las dependencias
npm run install:all

# Desarrollo local
npm run dev

# Build completo (frontend + backend)
npm run build:all

# Iniciar servidor
npm start
```

---

## Estructura del Deploy

1. ✅ Frontend se compila a `backend/public/dist`
2. ✅ Backend sirve los archivos estáticos del frontend
3. ✅ Las rutas API funcionan bajo `/api/*`
4. ✅ Las rutas del frontend son manejadas por React Router

---

## Troubleshooting

### "Cannot find module"
- Ejecuta `npm run install:all` localmente para asegurar que todas las dependencias están instaladas

### Frontend no aparece
- Revisa que el `backend/server.js` tenga configurado `app.use(express.static(path.join(__dirname, 'public/dist')))`
- Verifica que `npm run build:all` se ejecutó correctamente

### Variables de entorno no se cargan
- Asegurate de que están en la sección "Environment" de Render
- Reinicia el servicio después de cambiar variables de entorno

---

## Monitoreo

En el dashboard de Render puedes:
- Ver logs en tiempo real
- Reiniciar el servicio
- Ver el estado del deployment
- Configurar auto-deployments
