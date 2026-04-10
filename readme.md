# 🎬 Guía de Inicio Rápido - Equipo Skala (MERN Stack)

¡Hola equipo! Este es el documento oficial para que todos podamos configurar el proyecto en nuestros ordenadores y empezar a programar sin que nos den errores de conexión o de Git. 

Nuestra plataforma está basada en el stack MERN (MongoDB, Express, React, Node.js) y el objetivo es tener un producto 100% operativo para la asignatura de Usabilidad y Accesibilidad WEB.

---

## 🛠️ 1. Requisitos Previos (Antes de tocar nada)
Asegúrate de tener instalados estos tres programas en tu ordenador:
1. **Node.js** (Esto incluye `npm`, que nos permite descargar las librerías).
2. **Git** (Para descargar el código y subir nuestros cambios).
3. **Visual Studio Code (VS Code)** (Nuestro editor de código).

---

## 🚀 2. Pasos para la Instalación (Solo la primera vez)

Abre la terminal de tu ordenador (o la de VS Code) y sigue estos pasos EXACTAMENTE en este orden:

**Paso A: Descargar el código**
```bash
git clone [https://github.com/Opalo97/skala.git](https://github.com/Opalo97/skala.git)
cd skala

Paso B: Instalar el servidor (Backend)

Bash
cd backend
npm install
Paso C: Instalar la interfaz web (Frontend)

Bash
cd ../frontend
npm install
🔐 3. Conexión a la Base de Datos (¡SÚPER IMPORTANTE!)
Por motivos de seguridad, la contraseña de nuestra base de datos de MongoDB Atlas NO está subida a GitHub. Si intentas arrancar el proyecto ahora mismo, te dará un error rojo.

Tienes que crear tu propia "llave" localmente:

Abre VS Code y entra en la carpeta backend.

Crea un archivo nuevo y llámalo EXACTAMENTE .env (con el punto delante).

Pídele a Miriam por privado que te pase el texto de la conexión (la MONGO_URI).

Pega ese texto dentro de tu archivo .env para que quede así:

Fragmento de código
MONGO_URI=mongodb+srv://... (la_url_que_te_pase_miriam_aqui)
PORT=5000
Guarda el archivo. (Nota: Este archivo nunca se subirá a GitHub porque está protegido, es solo para tu ordenador).

🏃‍♀️ 4. Cómo arrancar la aplicación para trabajar
Cada vez que te sientes a programar, necesitas tener DOS terminales abiertas al mismo tiempo en VS Code (una para el servidor y otra para la web).

Terminal 1 (Arrancar el Servidor / Base de datos):

Bash
cd backend
npm run dev
(Si todo está bien, verás el mensaje: "🔥 Base de datos MongoDB conectada con éxito").

Terminal 2 (Arrancar la Web / React):

Bash
cd frontend
npm run dev
(Te dará una URL como http://localhost:5173. Haz Ctrl+Clic para abrir la web en tu navegador).

🏗️ 5. ¿Para qué sirve cada carpeta? (Estructura)
Para no pisarnos el código, nos dividiremos el trabajo usando esta estructura:

⚙️ BACKEND (Lógica y Base de datos)
📁 models/: Las reglas de los datos. (Ej: Elemento.js obliga a que cada archivo que subamos tenga título, imagen, descripción y tipo, como pide el profesor).

📁 controllers/: Las funciones que hacen el trabajo sucio. (Ej: Guardar un archivo, buscar usuarios).

📁 routes/: Las URLs ocultas de nuestra API (Ej: /api/elementos).

📄 server.js: El archivo que enciende el motor del backend.

🎨 FRONTEND (Vistas de React)
📁 src/pages/: Las pantallas completas (Ej: Home.jsx, Login.jsx, Dashboard.jsx).

📁 src/components/: Trozos de la web que reutilizaremos (botones, tarjetas de archivos, menús).

📄 App.jsx: El mapa de rutas visuales (Para saber qué página cargar según donde pinche el usuario).

⚠️ 6. Reglas de Oro para evitar desastres
Evitar conflictos en Git: Antes de empezar a programar tu parte cada día, escribe git pull origin main en la terminal para bajarte los cambios que hayamos hecho los demás la noche anterior.

Cuidado con los datos de prueba: El profesor prohíbe usar datos como "asdfg". Cuando probéis a subir cosas, usad títulos reales e imágenes de verdad.

NO toques el archivo .gitignore: Está configurado para protegernos.