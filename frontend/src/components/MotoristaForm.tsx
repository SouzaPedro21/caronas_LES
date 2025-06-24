import React, { useState } from 'react';

const initialState = {
  nome: '',
  cpf: '',
  sexo: '',
  telefone: '',
  cnh: '',
};

type Motorista = typeof initialState;

const MotoristaForm: React.FC = () => {
  const [form, setForm] = useState<Motorista>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Motorista>>({});

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    if (!validar()) return;
    try {
      const resp = await fetch('http://localhost:3000/motoristas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (resp.ok) {
        setMensagem('Motorista cadastrado com sucesso!');
        setForm(initialState);
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao cadastrar motorista.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="card p-4">
      <h2>Cadastro de Motorista</h2>
      {mensagem && <div className="alert alert-info">{mensagem}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input type="text" className={`form-control${erros.nome ? ' is-invalid' : ''}`} name="nome" value={form.nome} onChange={handleChange} />
          {erros.nome && <div className="invalid-feedback">{erros.nome}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">CPF</label>
          <input type="text" className={`form-control${erros.cpf ? ' is-invalid' : ''}`} name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
          {erros.cpf && <div className="invalid-feedback">{erros.cpf}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Sexo</label>
          <select className={`form-select${erros.sexo ? ' is-invalid' : ''}`} name="sexo" value={form.sexo} onChange={handleChange}>
            <option value="">Selecione</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
          {erros.sexo && <div className="invalid-feedback">{erros.sexo}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Telefone</label>
          <input type="text" className={`form-control${erros.telefone ? ' is-invalid' : ''}`} name="telefone" value={form.telefone} onChange={handleChange} placeholder="99 99999-9999" />
          {erros.telefone && <div className="invalid-feedback">{erros.telefone}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">CNH</label>
          <input type="text" className={`form-control${erros.cnh ? ' is-invalid' : ''}`} name="cnh" value={form.cnh} onChange={handleChange} placeholder="Somente números" />
          {erros.cnh && <div className="invalid-feedback">{erros.cnh}</div>}
        </div>
        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
    </div>
  );
};

export default MotoristaForm; 