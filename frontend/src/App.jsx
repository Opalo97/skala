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
import UploadItem from './pages/UploadItem'
import ItemDetail from './pages/ItemDetail'
import PrivacyPolicy from './pages/PrivacyPolicy'
import InspiracionDetail from './pages/InspiracionDetail'
import Buscar from './pages/Buscar'
import Perfil from './pages/Perfil'
import Guardados from './pages/Guardados'
import Filtros from './pages/Filtros'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadItem />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/inspiracion/:id" element={<InspiracionDetail />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/guardados" element={<Guardados />} />
          <Route path="/filtros" element={<Filtros />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  )
}

export default App
