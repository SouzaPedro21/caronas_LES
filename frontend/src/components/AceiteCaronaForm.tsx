import React, { useEffect, useState } from 'react';

type Cliente = { id: number; nome: string };
type Carona = { id: number; data: string; origem: { nomeCidade: string }; destino: { nomeCidade: string } };

const initialState = {
  clienteId: '',
  oferecimentoCaronaId: '',
};

type Aceite = typeof initialState;

const AceiteCaronaForm: React.FC = () => {
  const [form, setForm] = useState<Aceite>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Aceite>>({});
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [caronas, setCaronas] = useState<Carona[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/clientes').then(res => res.json()).then(setClientes);
    fetch('http://localhost:3000/oferecimentoCarona').then(res => res.json()).then(setCaronas);
  }, []);

  const validar = (): boolean => {
    const novosErros: Partial<Aceite> = {};
    if (!form.clienteId) {
      novosErros.clienteId = 'Selecione um cliente';
    }
    if (!form.oferecimentoCaronaId) {
      novosErros.oferecimentoCaronaId = 'Selecione uma carona';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    if (!validar()) return;
    try {
      const resp = await fetch('http://localhost:3000/aceiteCarona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: Number(form.clienteId),
          oferecimentoCaronaId: Number(form.oferecimentoCaronaId),
        }),
      });
      if (resp.ok) {
        setMensagem('Carona aceita com sucesso!');
        setForm(initialState);
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao aceitar carona.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="card p-4">
      <h2>Aceite de Carona</h2>
      {mensagem && <div className="alert alert-info">{mensagem}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Cliente</label>
          <select className={`form-select${erros.clienteId ? ' is-invalid' : ''}`} name="clienteId" value={form.clienteId} onChange={handleChange}>
            <option value="">Selecione</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          {erros.clienteId && <div className="invalid-feedback">{erros.clienteId}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Carona</label>
          <select className={`form-select${erros.oferecimentoCaronaId ? ' is-invalid' : ''}`} name="oferecimentoCaronaId" value={form.oferecimentoCaronaId} onChange={handleChange}>
            <option value="">Selecione</option>
            {caronas.map(c => (
              <option key={c.id} value={c.id}>{`${c.origem?.nomeCidade || ''} → ${c.destino?.nomeCidade || ''} (${new Date(c.data).toLocaleString()})`}</option>
            ))}
          </select>
          {erros.oferecimentoCaronaId && <div className="invalid-feedback">{erros.oferecimentoCaronaId}</div>}
        </div>
        <button type="submit" className="btn btn-primary">Aceitar Carona</button>
      </form>
    </div>
  );
};

export default AceiteCaronaForm; 