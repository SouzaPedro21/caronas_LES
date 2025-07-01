import React, { useState, useEffect } from 'react';

const initialState = {
  nomeCidade: '',
  uf: '',
  codigo: '',
};

type Cidade = typeof initialState & { id?: number };

type CidadeListada = {
  id: number;
  nomeCidade: string;
  uf: string;
  codigo: string;
};

const CidadeForm: React.FC = () => {
  const [form, setForm] = useState<Cidade>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Cidade>>({});
  const [cidades, setCidades] = useState<CidadeListada[]>([]);
  const [mostrarLista, setMostrarLista] = useState<boolean>(true);
  const [carregandoLista, setCarregandoLista] = useState<boolean>(false);
  const [cidadeEditando, setCidadeEditando] = useState<number | null>(null);
  const [excluindoCidade, setExcluindoCidade] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const buscarCidades = async () => {
    setCarregandoLista(true);
    try {
      const resp = await fetch('http://localhost:3333/cidades');
      if (resp.ok) {
        const data = await resp.json();
        setCidades(data);
      } else {
        console.error('Erro ao buscar cidades');
      }
    } catch (err) {
      console.error('Erro de conexão ao buscar cidades:', err);
    } finally {
      setCarregandoLista(false);
    }
  };

  useEffect(() => {
    buscarCidades();
  }, []);

  const editarCidade = (cidade: CidadeListada) => {
    setForm({
      nomeCidade: cidade.nomeCidade,
      uf: cidade.uf,
      codigo: cidade.codigo,
      id: cidade.id
    });
    setCidadeEditando(cidade.id);
    setMensagem('');
    setErros({});
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setForm(initialState);
    setCidadeEditando(null);
    setErros({});
    setMensagem('');
  };

  const excluirCidade = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta cidade?')) {
      return;
    }

    setExcluindoCidade(id);
    try {
      const resp = await fetch(`http://localhost:3333/cidades/${id}`, {
        method: 'DELETE',
      });
      
      if (resp.ok) {
        setMensagem('Cidade excluída com sucesso!');
        buscarCidades();
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao excluir cidade.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    } finally {
      setExcluindoCidade(null);
    }
  };

  const validar = (): boolean => {
    const novosErros: Partial<Cidade> = {};
    if (!form.nomeCidade || form.nomeCidade.length < 2 || form.nomeCidade.length > 50) {
      novosErros.nomeCidade = 'O nome da cidade deve ter entre 2 e 50 letras';
    }
    if (!form.uf || !/^[A-Z]{2}$/.test(form.uf)) {
      novosErros.uf = 'A UF deve ter 2 letras maiúsculas';
    }
    if (!form.codigo || !/^\d{7}$/.test(form.codigo)) {
      novosErros.codigo = 'O código deve ter exatamente 7 dígitos numéricos';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    if (!validar()) return;
    
    setIsLoading(true);
    try {
      const isEdit = cidadeEditando !== null;
      const url = isEdit 
        ? `http://localhost:3333/cidades/${cidadeEditando}`
        : 'http://localhost:3333/cidades';
      const method = isEdit ? 'PUT' : 'POST';
      
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (resp.ok) {
        setMensagem(isEdit ? 'Cidade atualizada com sucesso!' : 'Cidade cadastrada com sucesso!');
        setForm(initialState);
        setErros({});
        setCidadeEditando(null);
        // Atualizar a lista de cidades após cadastro/edição
        buscarCidades();
      } else {
        const data = await resp.json();
        setMensagem(data.message || `Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} cidade.`);
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            🏙️ {cidadeEditando ? 'Editar Cidade' : 'Cadastro de Cidade'}
          </h2>
          {cidadeEditando && (
            <div className="alert alert-info mt-2 mb-0">
              ℹ️ Editando cidade ID: <strong>{cidadeEditando}</strong>
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
                <label className="form-label">Nome da Cidade</label>
                <input 
                  type="text" 
                  className={`form-control${erros.nomeCidade ? ' is-invalid' : ''}`} 
                  name="nomeCidade" 
                  value={form.nomeCidade} 
                  onChange={handleChange}
                  placeholder="Digite o nome da cidade"
                />
                {erros.nomeCidade && <div className="invalid-feedback">{erros.nomeCidade}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">UF</label>
                <input 
                  type="text" 
                  className={`form-control${erros.uf ? ' is-invalid' : ''}`} 
                  name="uf" 
                  value={form.uf} 
                  onChange={handleChange} 
                  placeholder="Ex: SP" 
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
                {erros.uf && <div className="invalid-feedback">{erros.uf}</div>}
              </div>
              <div className="form-group full-width">
                <label className="form-label">Código</label>
                <input 
                  type="text" 
                  className={`form-control${erros.codigo ? ' is-invalid' : ''}`} 
                  name="codigo" 
                  value={form.codigo} 
                  onChange={handleChange} 
                  placeholder="7 dígitos numéricos" 
                  maxLength={7}
                />
                {erros.codigo && <div className="invalid-feedback">{erros.codigo}</div>}
              </div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {cidadeEditando ? 'Atualizando...' : 'Cadastrando...'}
                  </>
                ) : (
                  cidadeEditando ? 'Atualizar Cidade' : 'Cadastrar Cidade'
                )}
              </button>
              
              {cidadeEditando ? (
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

      {/* Seção de listagem de cidades */}
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title">
            📋 Cidades Cadastradas
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
                <span className="ms-2">Carregando cidades...</span>
              </div>
            ) : cidades.length === 0 ? (
              <div className="alert alert-info">
                ℹ️ Nenhuma cidade cadastrada ainda.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Nome da Cidade</th>
                      <th style={{ width: '100px' }}>UF</th>
                      <th style={{ width: '150px' }}>Código</th>
                      <th className="text-center" style={{ width: '100px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cidades.map((cidade) => (
                      <tr key={cidade.id}>
                        <td>
                          <span className="badge bg-secondary">{cidade.id}</span>
                        </td>
                        <td>
                          <strong>🏙️ {cidade.nomeCidade}</strong>
                        </td>
                        <td>
                          <span className="badge bg-primary">{cidade.uf}</span>
                        </td>
                        <td>
                          <code style={{ whiteSpace: 'nowrap' }}>{cidade.codigo}</code>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm p-1"
                              onClick={() => editarCidade(cidade)}
                              disabled={cidadeEditando === cidade.id || excluindoCidade === cidade.id}
                              title="Editar cidade"
                              style={{ minWidth: '32px', height: '32px' }}
                            >
                              {cidadeEditando === cidade.id ? (
                                <span className="loading-spinner" style={{ fontSize: '12px' }}></span>
                              ) : (
                                "✏️"
                              )}
                            </button>
                            
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm p-1"
                              onClick={() => excluirCidade(cidade.id)}
                              disabled={excluindoCidade === cidade.id || cidadeEditando === cidade.id}
                              title="Excluir cidade"
                              style={{ minWidth: '32px', height: '32px' }}
                            >
                              {excluindoCidade === cidade.id ? (
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
                    Total de cidades: <strong>{cidades.length}</strong>
                  </small>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-center">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={buscarCidades}
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

export default CidadeForm; 