import React, { useEffect, useState } from 'react';

type Motorista = {
  id: number;
  nome: string;
  cnh: string;
};

const initialState = {
  placa: '',
  marca: '',
  modelo: '',
  chassi: '',
  motoristaId: '',
};

type Veiculo = typeof initialState & { id?: number };

type VeiculoListado = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  chassi: string;
  motoristaId: number;
  motorista?: {
    id: number;
    nome: string;
  };
};

const VeiculoForm: React.FC = () => {
  const [form, setForm] = useState<Veiculo>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Veiculo>>({});
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [veiculos, setVeiculos] = useState<VeiculoListado[]>([]);
  const [mostrarLista, setMostrarLista] = useState<boolean>(true);
  const [carregandoLista, setCarregandoLista] = useState<boolean>(false);
  const [veiculoEditando, setVeiculoEditando] = useState<number | null>(null);
  const [excluindoVeiculo, setExcluindoVeiculo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const buscarVeiculos = async () => {
    setCarregandoLista(true);
    try {
      const resp = await fetch('http://localhost:3333/veiculos');
      if (resp.ok) {
        const data = await resp.json();
        setVeiculos(data);
      } else {
        console.error('Erro ao buscar veículos');
      }
    } catch (err) {
      console.error('Erro de conexão ao buscar veículos:', err);
    } finally {
      setCarregandoLista(false);
    }
  };

  const editarVeiculo = (veiculo: VeiculoListado) => {
    setForm({
      placa: veiculo.placa,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      chassi: veiculo.chassi,
      motoristaId: veiculo.motoristaId.toString(),
      id: veiculo.id
    });
    setVeiculoEditando(veiculo.id);
    setMensagem('');
    setErros({});
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setForm(initialState);
    setVeiculoEditando(null);
    setErros({});
    setMensagem('');
  };

  const excluirVeiculo = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) {
      return;
    }

    setExcluindoVeiculo(id);
    try {
      const resp = await fetch(`http://localhost:3333/veiculos/${id}`, {
        method: 'DELETE',
      });
      
      if (resp.ok) {
        setMensagem('Veículo excluído com sucesso!');
        buscarVeiculos();
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao excluir veículo.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    } finally {
      setExcluindoVeiculo(null);
    }
  };

  useEffect(() => {
    // Buscar motoristas
    fetch('http://localhost:3333/motoristas')
      .then(res => res.json())
      .then(data => setMotoristas(data));
    
    // Buscar veículos
    buscarVeiculos();
  }, []);

  const validar = (): boolean => {
    const novosErros: Partial<Veiculo> = {};
    if (!form.placa || !/^[A-Z]{3}-\d{1}[A-Z0-9]{1}\d{2}$/.test(form.placa)) {
      novosErros.placa = 'A placa deve seguir o padrão AAA-9A99';
    }
    if (!form.marca || form.marca.length < 2 || form.marca.length > 50) {
      novosErros.marca = 'A marca deve ter entre 2 e 50 letras';
    }
    if (!form.modelo || form.modelo.length < 2 || form.modelo.length > 50) {
      novosErros.modelo = 'O modelo deve ter entre 2 e 50 letras';
    }
    if (!form.chassi || form.chassi.length < 2 || form.chassi.length > 50) {
      novosErros.chassi = 'O chassi deve ter entre 2 e 50 letras';
    }
    if (!form.motoristaId) {
      novosErros.motoristaId = 'Selecione um motorista';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    if (!validar()) return;
    
    setIsLoading(true);
    try {
      const isEdit = veiculoEditando !== null;
      const url = isEdit 
        ? `http://localhost:3333/veiculos/${veiculoEditando}`
        : 'http://localhost:3333/veiculos';
      const method = isEdit ? 'PUT' : 'POST';
      
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, motoristaId: Number(form.motoristaId) }),
      });
      
      if (resp.ok) {
        setMensagem(isEdit ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!');
        setForm(initialState);
        setErros({});
        setVeiculoEditando(null);
        // Atualizar a lista de veículos após cadastro/edição
        buscarVeiculos();
      } else {
        const data = await resp.json();
        setMensagem(data.message || `Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} veículo.`);
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="form-container">
      <div className="card">        <div className="card-header">
          <h2 className="card-title">
            🚙 {veiculoEditando ? 'Editar Veículo' : 'Cadastro de Veículo'}
          </h2>
          {veiculoEditando && (
            <div className="alert alert-info mt-2 mb-0">
              ℹ️ Editando veículo ID: <strong>{veiculoEditando}</strong>
            </div>
          )}
        </div>
        <div className="card-body">
          {mensagem && (
            <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'}`}>
              {mensagem}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Placa</label>
                <input 
                  type="text" 
                  className={`form-control${erros.placa ? ' is-invalid' : ''}`} 
                  name="placa" 
                  value={form.placa} 
                  onChange={handleChange} 
                  placeholder="AAA-9A99"
                  style={{ textTransform: 'uppercase' }}
                />
                {erros.placa && <div className="invalid-feedback">{erros.placa}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Marca</label>
                <input 
                  type="text" 
                  className={`form-control${erros.marca ? ' is-invalid' : ''}`} 
                  name="marca" 
                  value={form.marca} 
                  onChange={handleChange}
                  placeholder="Ex: Toyota"
                />
                {erros.marca && <div className="invalid-feedback">{erros.marca}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Modelo</label>
                <input 
                  type="text" 
                  className={`form-control${erros.modelo ? ' is-invalid' : ''}`} 
                  name="modelo" 
                  value={form.modelo} 
                  onChange={handleChange}
                  placeholder="Ex: Corolla"
                />
                {erros.modelo && <div className="invalid-feedback">{erros.modelo}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Chassi</label>
                <input 
                  type="text" 
                  className={`form-control${erros.chassi ? ' is-invalid' : ''}`} 
                  name="chassi" 
                  value={form.chassi} 
                  onChange={handleChange}
                  placeholder="Número do chassi"
                />
                {erros.chassi && <div className="invalid-feedback">{erros.chassi}</div>}
              </div>
              <div className="form-group full-width">
                <label className="form-label">Motorista</label>
                <select 
                  className={`form-control${erros.motoristaId ? ' is-invalid' : ''}`} 
                  name="motoristaId" 
                  value={form.motoristaId} 
                  onChange={handleChange}
                >
                  <option value="">Selecione um motorista</option>
                  {motoristas.map(m => (
                    <option key={m.id} value={m.id}>{m.nome} (CNH: {m.cnh})</option>
                  ))}
                </select>
                {erros.motoristaId && <div className="invalid-feedback">{erros.motoristaId}</div>}
              </div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {veiculoEditando ? 'Atualizando...' : 'Cadastrando...'}
                  </>
                ) : (
                  veiculoEditando ? 'Atualizar Veículo' : 'Cadastrar Veículo'
                )}
              </button>
              
              {veiculoEditando ? (
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={cancelarEdicao}
                >
                  Cancelar Edição
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setForm(initialState);
                    setErros({});
                    setMensagem('');
                  }}
                >
                  Limpar Formulário
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Seção de listagem de veículos */}
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title">
            📋 Veículos Cadastrados
          </h3>
          <button 
            type="button" 
            className="btn btn-outline-primary btn-sm"
            onClick={() => setMostrarLista(!mostrarLista)}
          >
            {mostrarLista ? 'Ocultar Lista' : 'Mostrar Lista'}
          </button>
        </div>
        
        {mostrarLista && (
          <div className="card-body">
            {carregandoLista ? (
              <div className="text-center">
                <span className="loading-spinner"></span>
                <span className="ms-2">Carregando veículos...</span>
              </div>
            ) : veiculos.length === 0 ? (
              <div className="alert alert-info">
                ℹ️ Nenhum veículo cadastrado ainda.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th style={{ width: '120px' }}>Placa</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th style={{ width: '150px' }}>Chassi</th>
                      <th>Motorista</th>
                      <th className="text-center" style={{ width: '100px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculos.map((veiculo) => (
                      <tr key={veiculo.id}>
                        <td>
                          <span className="badge bg-secondary">{veiculo.id}</span>
                        </td>
                        <td>
                          <code style={{ whiteSpace: 'nowrap' }}>🚗 {veiculo.placa}</code>
                        </td>
                        <td>
                          <strong>{veiculo.marca}</strong>
                        </td>
                        <td>
                          {veiculo.modelo}
                        </td>
                        <td>
                          <code style={{ whiteSpace: 'nowrap' }}>{veiculo.chassi}</code>
                        </td>
                        <td>
                          {veiculo.motorista ? (
                            <span className="badge bg-info">
                              👤 {veiculo.motorista.nome}
                            </span>
                          ) : (
                            <span className="text-muted">Não encontrado</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm p-1"
                              onClick={() => editarVeiculo(veiculo)}
                              disabled={veiculoEditando === veiculo.id || excluindoVeiculo === veiculo.id}
                              title="Editar veículo"
                              style={{ minWidth: '32px', height: '32px' }}
                            >
                              {veiculoEditando === veiculo.id ? (
                                <span className="loading-spinner" style={{ fontSize: '12px' }}></span>
                              ) : (
                                "✏️"
                              )}
                            </button>
                            
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm p-1"
                              onClick={() => excluirVeiculo(veiculo.id)}
                              disabled={excluindoVeiculo === veiculo.id || veiculoEditando === veiculo.id}
                              title="Excluir veículo"
                              style={{ minWidth: '32px', height: '32px' }}
                            >
                              {excluindoVeiculo === veiculo.id ? (
                                <span className="loading-spinner" style={{ fontSize: '12px' }}></span>
                              ) : (
                                "🗑️"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-3">
                  <small className="text-muted">
                    Total de veículos: <strong>{veiculos.length}</strong>
                  </small>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-center">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={buscarVeiculos}
                disabled={carregandoLista}
              >
                🔄 Atualizar Lista
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VeiculoForm; 