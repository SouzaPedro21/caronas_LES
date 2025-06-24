import React, { useState } from 'react';

const initialState = {
  nomeCidade: '',
  uf: '',
  codigo: '',
};

type Cidade = typeof initialState;

const CidadeForm: React.FC = () => {
  const [form, setForm] = useState<Cidade>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Cidade>>({});

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
    try {
      const resp = await fetch('http://localhost:3333/cidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (resp.ok) {
        setMensagem('Cidade cadastrada com sucesso!');
        setForm(initialState);
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao cadastrar cidade.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };
  return (
    <div className="form-container">
      <div className="card">        <div className="card-header">
          <h2 className="card-title">📍 Cadastro de Cidade</h2>
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
            <div className="d-flex justify-content-center mt-4">
              <button type="submit" className="btn btn-primary">
                Cadastrar Cidade
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CidadeForm; 