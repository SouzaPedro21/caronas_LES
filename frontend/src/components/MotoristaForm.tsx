import { useState, useEffect } from 'react';

const initialState = {
  nome: '',
  cpf: '',
  sexo: '',
  telefone: '',
  cnh: '',
};

type Motorista = typeof initialState & { id?: number };

type MotoristaListado = {
  id: number;
  nome: string;
  cpf: string;
  sexo: string;
  telefone: string;
  cnh: string;
};

const MotoristaForm = () => {
  const [form, setForm] = useState<Motorista>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Motorista>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [motoristas, setMotoristas] = useState<MotoristaListado[]>([]);
  const [mostrarLista, setMostrarLista] = useState<boolean>(true);
  const [carregandoLista, setCarregandoLista] = useState<boolean>(false);
  const [motoristaEditando, setMotoristaEditando] = useState<number | null>(null);
  const [excluindoMotorista, setExcluindoMotorista] = useState<number | null>(null);

  const buscarMotoristas = async () => {
    setCarregandoLista(true);
    try {
      const resp = await fetch('http://localhost:3333/motoristas');
      if (resp.ok) {
        const data = await resp.json();
        setMotoristas(data);
      } else {
        console.error('Erro ao buscar motoristas');
      }
    } catch (err) {
      console.error('Erro de conexão ao buscar motoristas:', err);
    } finally {
      setCarregandoLista(false);
    }
  };

  useEffect(() => {
    buscarMotoristas();
  }, []);

  const editarMotorista = (motorista: MotoristaListado) => {
    setForm({
      nome: motorista.nome,
      cpf: motorista.cpf,
      sexo: motorista.sexo,
      telefone: motorista.telefone,
      cnh: motorista.cnh,
      id: motorista.id
    });
    setMotoristaEditando(motorista.id);
    setMensagem('');
    setErros({});
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setForm(initialState);
    setMotoristaEditando(null);
    setErros({});
    setMensagem('');
  };

  const excluirMotorista = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este motorista?')) {
      return;
    }

    setExcluindoMotorista(id);
    try {
      const resp = await fetch(`http://localhost:3333/motoristas/${id}`, {
        method: 'DELETE',
      });
      
      if (resp.ok) {
        setMensagem('Motorista excluído com sucesso!');
        buscarMotoristas();
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao excluir motorista.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    } finally {
      setExcluindoMotorista(null);
    }
  };

  const validar = (): boolean => {
    const novosErros: Partial<Motorista> = {};
    if (!form.nome || form.nome.length < 2 || form.nome.length > 50) {
      novosErros.nome = 'O nome deve ter entre 2 e 50 letras';
    }
    if (!form.cpf || !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(form.cpf)) {
      novosErros.cpf = 'O CPF deve seguir o padrão NNN.NNN.NNN-NN';
    }
    if (!form.sexo || !['M', 'F'].includes(form.sexo)) {
      novosErros.sexo = 'O sexo deve ser M ou F';
    }
    if (!form.telefone || !/^\d{2} \d{5}-\d{4}$/.test(form.telefone)) {
      novosErros.telefone = 'O telefone deve seguir o padrão XX XXXXX-XXXX';
    }
    if (!form.cnh || !/^\d{11}$/.test(form.cnh)) {
      novosErros.cnh = 'A CNH deve conter 11 dígitos numéricos';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpar erro específico quando o usuário começar a digitar
    if (erros[e.target.name as keyof Motorista]) {
      setErros({ ...erros, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    if (!validar()) return;
    
    setIsLoading(true);
    try {
      const isEdit = motoristaEditando !== null;
      const url = isEdit 
        ? `http://localhost:3333/motoristas/${motoristaEditando}`
        : 'http://localhost:3333/motoristas';
      const method = isEdit ? 'PUT' : 'POST';
      
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (resp.ok) {
        setMensagem(isEdit ? 'Motorista atualizado com sucesso!' : 'Motorista cadastrado com sucesso!');
        setForm(initialState);
        setErros({});
        setMotoristaEditando(null);
        // Atualizar a lista de motoristas após cadastro/edição
        buscarMotoristas();
      } else {
        const data = await resp.json();
        setMensagem(data.message || `Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} motorista.`);
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
            🚗 {motoristaEditando ? 'Editar Motorista' : 'Cadastro de Motorista'}
          </h2>
          {motoristaEditando && (
            <div className="alert alert-info mt-2 mb-0">
              ℹ️ Editando motorista ID: <strong>{motoristaEditando}</strong>
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
              <div className="form-group full-width">
                <label className="form-label">Nome Completo</label>
                <input 
                  type="text" 
                  name="nome" 
                  value={form.nome} 
                  onChange={handleChange}
                  placeholder="Digite o nome completo"
                  className={`form-control${erros.nome ? ' is-invalid' : ''}`}
                />
                {erros.nome && <div className="invalid-feedback">{erros.nome}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input 
                  type="text" 
                  name="cpf" 
                  value={form.cpf} 
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  className={`form-control${erros.cpf ? ' is-invalid' : ''}`}
                />
                {erros.cpf && <div className="invalid-feedback">{erros.cpf}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select 
                  name="sexo" 
                  value={form.sexo} 
                  onChange={handleChange}
                  className={`form-control${erros.sexo ? ' is-invalid' : ''}`}
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
                {erros.sexo && <div className="invalid-feedback">{erros.sexo}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input 
                  type="text" 
                  name="telefone" 
                  value={form.telefone} 
                  onChange={handleChange}
                  placeholder="99 99999-9999"
                  className={`form-control${erros.telefone ? ' is-invalid' : ''}`}
                />
                {erros.telefone && <div className="invalid-feedback">{erros.telefone}</div>}
              </div>
              
              <div className="form-group full-width">
                <label className="form-label">CNH</label>
                <input 
                  type="text" 
                  name="cnh" 
                  value={form.cnh} 
                  onChange={handleChange}
                  placeholder="11 dígitos numéricos"
                  className={`form-control${erros.cnh ? ' is-invalid' : ''}`}
                />
                {erros.cnh && <div className="invalid-feedback">{erros.cnh}</div>}
              </div>
            </div>
            
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {motoristaEditando ? 'Atualizando...' : 'Cadastrando...'}
                  </>
                ) : (
                  motoristaEditando ? 'Atualizar Motorista' : 'Cadastrar Motorista'
                )}
              </button>
              
              {motoristaEditando ? (
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

      {/* Seção de listagem de motoristas */}
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title">
            📋 Motoristas Cadastrados
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
                <span className="ms-2">Carregando motoristas...</span>
              </div>
            ) : motoristas.length === 0 ? (
              <div className="alert alert-info">
                ℹ️ Nenhum motorista cadastrado ainda.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Nome</th>
                      <th style={{ width: '140px' }}>CPF</th>
                      <th style={{ width: '100px' }}>Sexo</th>
                      <th style={{ width: '150px' }}>Telefone</th>
                      <th style={{ width: '150px' }}>CNH</th>
                      <th className="text-center" style={{ width: '100px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motoristas.map((motorista) => (
                      <tr key={motorista.id}>
                        <td>
                          <span className="badge bg-secondary">{motorista.id}</span>
                        </td>
                        <td>
                          <strong>{motorista.nome}</strong>
                        </td>
                        <td>
                          <code style={{ whiteSpace: 'nowrap' }}>{motorista.cpf}</code>
                        </td>
                        <td>
                          <span className={`badge ${motorista.sexo === 'M' ? 'bg-primary' : 'bg-success'}`}>
                            {motorista.sexo === 'M' ? 'Masculino' : 'Feminino'}
                          </span>
                        </td>
                        <td>
                          <code style={{ whiteSpace: 'nowrap' }}>📞 {motorista.telefone}</code>
                        </td>
                        <td>
                          <code style={{ whiteSpace: 'nowrap' }}>🆔 {motorista.cnh}</code>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm p-1"
                              onClick={() => editarMotorista(motorista)}
                              disabled={motoristaEditando === motorista.id || excluindoMotorista === motorista.id}
                              title="Editar motorista"
                              style={{ minWidth: '32px', height: '32px' }}
                            >
                              {motoristaEditando === motorista.id ? (
                                <span className="loading-spinner" style={{ fontSize: '12px' }}></span>
                              ) : (
                                "✏️"
                              )}
                            </button>
                            
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm p-1"
                              onClick={() => excluirMotorista(motorista.id)}
                              disabled={excluindoMotorista === motorista.id || motoristaEditando === motorista.id}
                              title="Excluir motorista"
                              style={{ minWidth: '32px', height: '32px' }}
                            >
                              {excluindoMotorista === motorista.id ? (
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
                    Total de motoristas: <strong>{motoristas.length}</strong>
                  </small>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-center">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={buscarMotoristas}
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

export default MotoristaForm;