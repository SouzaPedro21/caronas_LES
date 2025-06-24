import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ClienteForm from './components/ClienteForm';
import MotoristaForm from './components/MotoristaForm';
import VeiculoForm from './components/VeiculoForm';
import CidadeForm from './components/CidadeForm';
import OferecimentoCaronaForm from './components/OferecimentoCaronaForm';
import AceiteCaronaForm from './components/AceiteCaronaForm';
import RelatorioCaronasAceitasMotorista from './components/RelatorioCaronasAceitasMotorista';
import RelatorioCaronasAceitasCidade from './components/RelatorioCaronasAceitasCidade';
import RelatorioCaronasOfertadas from './components/RelatorioCaronasOfertadas';
import RelatorioMontanteMotorista from './components/RelatorioMontanteMotorista';
import './App.css';

function AppHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <button 
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-label="Abrir/Fechar menu de listagens"
        >
          <span className="icon-badge icon-badge-cidade"></span>
        </button>
        <h1 className="app-title centered">
          <span className="icon-badge icon-badge-veiculo"></span>
          RIDE4US - Sistema de Caronas
        </h1>
        <div className="header-spacer"></div>
      </div>
    </header>
  );
}

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <ul className="nav-pills">
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === '/clientes' ? 'active' : ''}`} 
              to="/clientes"
            >
              <span className="icon-badge icon-badge-pessoa"></span> Clientes
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === '/motoristas' ? 'active' : ''}`} 
              to="/motoristas"
            >
              <span className="icon-badge icon-badge-motorista"></span> Motoristas
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === '/veiculos' ? 'active' : ''}`} 
              to="/veiculos"
            >
              <span className="icon-badge icon-badge-veiculo"></span> Veículos
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === '/cidades' ? 'active' : ''}`} 
              to="/cidades"
            >
              <span className="icon-badge icon-badge-cidade"></span> Cidades
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === '/oferecimento' ? 'active' : ''}`} 
              to="/oferecimento"
            >
              <span className="icon-badge icon-badge-oferecer"></span> Oferecer Carona
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === '/aceite' ? 'active' : ''}`} 
              to="/aceite"
            >
              <span className="icon-badge icon-badge-aceitar"></span> Aceitar Carona
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  
  return (
    <>
      {/* Overlay para fechar sidebar em mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar-nav ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>
            <span className="icon-badge icon-badge-cidade"></span>
            Listagens
          </h3>
          <button 
            className="sidebar-close"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            
          </button>
        </div>
        <nav className="sidebar-menu">
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span className="icon-badge icon-badge-oferecer"></span>
              Relatórios
            </div>
            <Link 
              to="/relatorio/caronas-aceitas-motorista" 
              className={`sidebar-link ${location.pathname === '/relatorio/caronas-aceitas-motorista' ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon-badge icon-badge-motorista"></span>
              Caronas por Motorista
            </Link>
            <Link 
              to="/relatorio/caronas-aceitas-cidade" 
              className={`sidebar-link ${location.pathname === '/relatorio/caronas-aceitas-cidade' ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon-badge icon-badge-cidade"></span>
              Caronas por Cidade
            </Link>
            <Link 
              to="/relatorio/caronas-ofertadas" 
              className={`sidebar-link ${location.pathname === '/relatorio/caronas-ofertadas' ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon-badge icon-badge-oferecer"></span>
              Caronas Ofertadas
            </Link>
            <Link 
              to="/relatorio/montante-motorista" 
              className={`sidebar-link ${location.pathname === '/relatorio/montante-motorista' ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon-badge icon-badge-aceitar"></span>
              Montante por Motorista
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}

function Home() {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="icon-badge icon-badge-veiculo"></span>
          Bem-vindo ao RIDE4US
        </h2>
      </div>
      <div className="card-body">
        <p className="text-center mb-4">
          Gerencie caronas de forma fácil e organizada. Use o menu superior para cadastros ou a sidebar lateral para visualizar listagens.
        </p>
        <div className="form-grid">
          <div className="card">
            <div className="card-body p-4">
              <h3 style={{ color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
                <span className="icon-badge icon-badge-pessoa"></span>
                Gestão de Pessoas
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                Cadastre e gerencie clientes e motoristas do sistema
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body p-4">
              <h3 style={{ color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
                <span className="icon-badge icon-badge-veiculo"></span>
                Gestão de Veículos
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                Registre veículos e associe aos motoristas
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body p-4">
              <h3 style={{ color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
                <span className="icon-badge icon-badge-cidade"></span>
                Gestão de Locais
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                Cadastre cidades para rotas de caronas
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body p-4">
              <h3 style={{ color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
                <span className="icon-badge icon-badge-oferecer"></span>
                Sistema de Caronas
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                Ofereça e aceite caronas facilmente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      <div className="app">
        <AppHeader onMenuToggle={toggleSidebar} />
        <Navigation />
        <div className="app-layout">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          <main className="main-content">
            <Routes>
              <Route path="/clientes" element={<ClienteForm />} />
              <Route path="/motoristas" element={<MotoristaForm />} />
              <Route path="/veiculos" element={<VeiculoForm />} />
              <Route path="/cidades" element={<CidadeForm />} />
              <Route path="/oferecimento" element={<OferecimentoCaronaForm />} />
              <Route path="/aceite" element={<AceiteCaronaForm />} />
              <Route path="/relatorio/caronas-aceitas-motorista" element={<RelatorioCaronasAceitasMotorista />} />
              <Route path="/relatorio/caronas-aceitas-cidade" element={<RelatorioCaronasAceitasCidade />} />
              <Route path="/relatorio/caronas-ofertadas" element={<RelatorioCaronasOfertadas />} />
              <Route path="/relatorio/montante-motorista" element={<RelatorioMontanteMotorista />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
