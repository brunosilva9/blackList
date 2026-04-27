import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ListaPecadores from './ListaPecadores'
import DetallePecador from './DetallePecador'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-content">
            <Link to="/" className="logo-link">
              <span className="logo-icon">☠</span>
              <div className="logo-text">
                <span className="logo-title">Lista Negra</span>
                <span className="logo-sub">Registro oficial de pecados</span>
              </div>
            </Link>
          </div>
          <div className="header-glow" />
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<ListaPecadores />} />
            <Route path="/pecador/:id" element={<DetallePecador />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <span>☠ Lista Negra — Nadie escapa</span>
        </footer>
      </div>
    </Router>
  )
}

export default App
