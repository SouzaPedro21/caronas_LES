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
      const resp = await fetch('http://localhost:3000/cidades', {
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
    <div className="card p-4">
      <h2>Cadastro de Cidade</h2>
      {mensagem && <div className="alert alert-info">{mensagem}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nome da Cidade</label>
          <input type="text" className={`form-control${erros.nomeCidade ? ' is-invalid' : ''}`} name="nomeCidade" value={form.nomeCidade} onChange={handleChange} />
          {erros.nomeCidade && <div className="invalid-feedback">{erros.nomeCidade}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">UF</label>
          <input type="text" className={`form-control${erros.uf ? ' is-invalid' : ''}`} name="uf" value={form.uf} onChange={handleChange} placeholder="EX: SP" maxLength={2} />
          {erros.uf && <div className="invalid-feedback">{erros.uf}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Código</label>
          <input type="text" className={`form-control${erros.codigo ? ' is-invalid' : ''}`} name="codigo" value={form.codigo} onChange={handleChange} placeholder="Somente números" maxLength={7} />
          {erros.codigo && <div className="invalid-feedback">{erros.codigo}</div>}
        </div>
        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
    </div>
  );
};

export default CidadeForm; 