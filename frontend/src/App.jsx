import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import CrearProducto from './pages/CrearProducto'
import ItemDetail from './pages/ItemDetail'
import PrivacyPolicy from './pages/PrivacyPolicy'
import InspiracionDetail from './pages/InspiracionDetail'
import Buscar from './pages/Buscar'
import Perfil from './pages/Perfil'
import PerfilUsuario from './pages/PerfilUsuario'
import ModelosUsuario from './pages/ModelosUsuario'
import Guardados from './pages/Guardados'
import Filtros from './pages/Filtros'
import CrearInspiracion from './pages/CrearInspiracion'
import MisModelos from './pages/MisModelos'
import EditarInspiracion from './pages/EditarInspiracion'
import EditarProducto from './pages/EditarProducto'
import ColeccionesDestacadas from './pages/ColeccionesDestacadas'
import ListasDestacadas from './pages/ListasDestacadas'
import ColeccionDetalle from './pages/ColeccionDetalle'
import ListaDetalle from './pages/ListaDetalle'
import ListaSeguidores from './pages/ListaSeguidores'
import ListaSeguidos from './pages/ListaSeguidos'


function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<CrearProducto />} />
          <Route path="/crear-inspiracion" element={<CrearInspiracion />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/inspiracion/:id" element={<InspiracionDetail />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/:id" element={<PerfilUsuario />} />
          <Route path="/modelos-usuario/:id" element={<ModelosUsuario />} />
          <Route path="/mis-modelos" element={<MisModelos />} />
          <Route path="/editar-inspiracion/:id" element={<EditarInspiracion />} />
          <Route path="/editar-producto/:id" element={<EditarProducto />} />
          <Route path="/guardados" element={<Guardados />} />
          <Route path="/colecciones-destacadas" element={<ColeccionesDestacadas />} />
          <Route path="/coleccion/:id" element={<ColeccionDetalle />} />
          <Route path="/listas-destacadas" element={<ListasDestacadas />} />
          <Route path="/lista/:id" element={<ListaDetalle />} />
          <Route path="/filtros" element={<Filtros />} />
          <Route path="/seguidores/:id" element={<ListaSeguidores />} />
          <Route path="/seguidos/:id" element={<ListaSeguidos />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
