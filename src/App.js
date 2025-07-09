import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListaPecadores from './ListaPecadores';
import DetallePecador from './DetallePecador';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '30px', textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ color: 'darkred' }}>Lista Negra</h1>
          </Link>
        </header>
        
        <Routes>
          <Route path="/" element={<ListaPecadores />} />
          <Route path="/pecador/:id" element={<DetallePecador />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;