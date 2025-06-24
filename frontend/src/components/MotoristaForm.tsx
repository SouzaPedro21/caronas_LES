import { useState } from 'react';

const initialState = {
  nome: '',
  cpf: '',
  sexo: '',
  telefone: '',
  cnh: '',
};

type Motorista = typeof initialState;

const MotoristaForm = () => {
  const [form, setForm] = useState<Motorista>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Motorista>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      const resp = await fetch('http://localhost:3333/motoristas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },        body: JSON.stringify(form),
      });
      if (resp.ok) {
        setMensagem('Motorista cadastrado com sucesso!');
        setForm(initialState);
        setErros({});
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao cadastrar motorista.');
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
          <h2 className="card-title">� Cadastro de Motorista</h2>
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
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Motorista'
                )}
              </button>
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MotoristaForm;