import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ListaPecadores() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/pecados.json')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar la lista');
        return res.json();
      })
      .then((data) => {
        // Agregar IDs únicos a cada pecador
        const listaConIds = data.map((pecador, index) => ({
          ...pecador,
          id: index + 1,
          tiempoPenitencia: typeof pecador.tiempoPenitencia === 'number' && pecador.tiempoPenitencia > 1000000000 
            ? pecador.tiempoPenitencia 
            : Math.floor(Date.now() / 1000) + pecador.tiempoPenitencia
        }));
        setLista(listaConIds);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar los datos", err);
        setError(err.message);
        setCargando(false);
      });
  }, []);

  if (cargando) return <div>Cargando lista de pecadores...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 style={{ color: '#555', marginBottom: '20px' }}>Pecadores Registrados</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {lista.map((pecador) => (
          <li key={pecador.id} style={{ marginBottom: '15px' }}>
            <Link 
              to={`/pecador/${pecador.id}`} 
              style={{
                display: 'block',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '5px',
                textDecoration: 'none',
                color: '#333',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                ':hover': {
                  backgroundColor: '#e0e0e0',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <strong style={{ color: 'darkred' }}>{pecador.nombre}</strong>
              <div style={{ marginTop: '5px', color: '#666' }}>
                Tiempo restante: <TiempoRestante finPenitencia={pecador.tiempoPenitencia} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TiempoRestante({ finPenitencia }) {
  const [tiempoRestante, setTiempoRestante] = useState(0);

  useEffect(() => {
    const calcularTiempo = () => {
      const ahora = Math.floor(Date.now() / 1000);
      const restante = finPenitencia - ahora;
      setTiempoRestante(restante > 0 ? restante : 0);
    };

    calcularTiempo();
    const interval = setInterval(calcularTiempo, 1000);
    return () => clearInterval(interval);
  }, [finPenitencia]);

  const formatearTiempo = (segundos) => {
    if (segundos <= 0) return 'Penitencia completada';
    
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    
    return `${horas > 0 ? `${horas}h ` : ''}${minutos}m ${segundosRestantes}s`;
  };

  return <span style={{ fontWeight: 'bold' }}>{formatearTiempo(tiempoRestante)}</span>;
}

export default ListaPecadores;