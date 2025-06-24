import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClienteForm from './components/ClienteForm';
import MotoristaForm from './components/MotoristaForm';
import VeiculoForm from './components/VeiculoForm';
import CidadeForm from './components/CidadeForm';
import OferecimentoCaronaForm from './components/OferecimentoCaronaForm';
import AceiteCaronaForm from './components/AceiteCaronaForm';

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <h1 className="mb-4">Sistema de Caronas</h1>
        <nav className="mb-4">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <Link className="nav-link" to="/clientes">Clientes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/motoristas">Motoristas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/veiculos">Veículos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cidades">Cidades</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/oferecimento">Oferecimento de Carona</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/aceite">Aceite de Carona</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/clientes" element={<ClienteForm />} />
          <Route path="/motoristas" element={<MotoristaForm />} />
          <Route path="/veiculos" element={<VeiculoForm />} />
          <Route path="/cidades" element={<CidadeForm />} />
          <Route path="/oferecimento" element={<OferecimentoCaronaForm />} />
          <Route path="/aceite" element={<AceiteCaronaForm />} />
          {/* As demais rotas serão adicionadas aqui */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
