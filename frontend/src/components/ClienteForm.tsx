import { useState, useEffect } from 'react';

const initialState = {
  nome: '',
  cpf: '',
  sexo: '',
  telefone: '',
};

type Cliente = typeof initialState & { id?: number };

type ClienteListado = {
  id: number;
  nome: string;
  cpf: string;
  sexo: string;
  telefone: string;
};

const ClienteForm = () => {
  const [form, setForm] = useState<Cliente>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Cliente>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientes, setClientes] = useState<ClienteListado[]>([]);
  const [mostrarLista, setMostrarLista] = useState<boolean>(true);
  const [carregandoLista, setCarregandoLista] = useState<boolean>(false);
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);
  const [excluindoCliente, setExcluindoCliente] = useState<number | null>(null);

  const buscarClientes = async () => {
    setCarregandoLista(true);
    try {
      const resp = await fetch('http://localhost:3333/clientes');
      if (resp.ok) {
        const data = await resp.json();
        setClientes(data);
      } else {
        console.error('Erro ao buscar clientes');
      }
    } catch (err) {
      console.error('Erro de conexão ao buscar clientes:', err);
    } finally {
      setCarregandoLista(false);
    }
  };

  useEffect(() => {
    buscarClientes();
  }, []);

  const editarCliente = (cliente: ClienteListado) => {
    setForm({
      nome: cliente.nome,
      cpf: cliente.cpf,
      sexo: cliente.sexo,
      telefone: cliente.telefone,
      id: cliente.id
    });
    setClienteEditando(cliente.id);
    setMensagem('');
    setErros({});
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setForm(initialState);
    setClienteEditando(null);
    setErros({});
    setMensagem('');
  };

  const excluirCliente = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    setExcluindoCliente(id);
    try {
      const resp = await fetch(`http://localhost:3333/clientes/${id}`, {
        method: 'DELETE',
      });
      
      if (resp.ok) {
        setMensagem('Cliente excluído com sucesso!');
        buscarClientes();
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao excluir cliente.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    } finally {
      setExcluindoCliente(null);
    }
  };

  const validar = (): boolean => {
    const novosErros: Partial<Cliente> = {};
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
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpar erro específico quando o usuário começar a digitar
    if (erros[e.target.name as keyof Cliente]) {
      setErros({ ...erros, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    if (!validar()) return;
    
    setIsLoading(true);
    try {
      const isEdit = clienteEditando !== null;
      const url = isEdit 
        ? `http://localhost:3333/clientes/${clienteEditando}`
        : 'http://localhost:3333/clientes';
      const method = isEdit ? 'PUT' : 'POST';
      
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (resp.ok) {
        setMensagem(isEdit ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
        setForm(initialState);
        setErros({});
        setClienteEditando(null);
        // Atualizar a lista de clientes após cadastro/edição
        buscarClientes();
      } else {
        const data = await resp.json();
        setMensagem(data.message || `Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} cliente.`);
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
            <span className="icon-badge icon-badge-pessoa">👤</span> 
            {clienteEditando ? 'Editar Cliente' : 'Cadastro de Cliente'}
          </h2>
          {clienteEditando && (
            <div className="alert alert-info mt-2 mb-0">
              ℹ️ Editando cliente ID: <strong>{clienteEditando}</strong>
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
              
              <div className="form-group full-width">
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
            </div>
            
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {clienteEditando ? 'Atualizando...' : 'Cadastrando...'}
                  </>
                ) : (
                  clienteEditando ? 'Atualizar Cliente' : 'Cadastrar Cliente'
                )}
              </button>
              
              {clienteEditando ? (
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

      {/* Seção de listagem de clientes */}
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title">
            <span className="icon-badge icon-badge-pessoa">📋</span> Clientes Cadastrados
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
                <span className="ms-2">Carregando clientes...</span>
              </div>
            ) : clientes.length === 0 ? (
              <div className="alert alert-info">
                ℹ️ Nenhum cliente cadastrado ainda.
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
                      <th className="text-center" style={{ width: '100px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>
                          <span className="badge bg-secondary">{cliente.id}</span>
                        </td>
                        <td>
                          <strong>{cliente.nome}</strong>
                        </td>
                        <td>
                          <code style={{ whiteSpace: 'nowrap' }}>{cliente.cpf}</code>
                        </td>
                        <td>
                          <span className={`badge ${cliente.sexo === 'M' ? 'bg-primary' : 'bg-success'}`}>
                            {cliente.sexo === 'M' ? 'Masculino' : 'Feminino'}
                          </span>
                        </td>
                        <td>
                          <code style={{ whiteSpace: 'nowrap' }}>📞 {cliente.telefone}</code>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm p-1"
                              onClick={() => editarCliente(cliente)}
                              disabled={clienteEditando === cliente.id || excluindoCliente === cliente.id}
                              title="Editar cliente"
                              style={{ minWidth: '32px', height: '32px' }}
                            >
                              {clienteEditando === cliente.id ? (
                                <span className="loading-spinner" style={{ fontSize: '12px' }}></span>
                              ) : (
                                "✏️"
                              )}
                            </button>
                            
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm p-1"
                              onClick={() => excluirCliente(cliente.id)}
                              disabled={excluindoCliente === cliente.id || clienteEditando === cliente.id}
                              title="Excluir cliente"
                              style={{ minWidth: '32px', height: '32px' }}
                            >
                              {excluindoCliente === cliente.id ? (
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
                    Total de clientes: <strong>{clientes.length}</strong>
                  </small>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-center">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={buscarClientes}
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

export default ClienteForm; 