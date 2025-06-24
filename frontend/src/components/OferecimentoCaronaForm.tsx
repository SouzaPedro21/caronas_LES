import React, { useEffect, useState } from 'react';

type Motorista = { id: number; nome: string };
type Veiculo = { id: number; placa: string };
type Cidade = { id: number; nomeCidade: string };

const initialState = {
  data: '',
  previsaoTermino: '',
  vagas: '',
  preco: '',
  motoristaId: '',
  veiculoId: '',
  origemId: '',
  destinoId: '',
};

type Oferecimento = typeof initialState;

const OferecimentoCaronaForm: React.FC = () => {
  const [form, setForm] = useState<Oferecimento>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Oferecimento>>({});
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/motoristas').then(res => res.json()).then(setMotoristas);
    fetch('http://localhost:3000/veiculos').then(res => res.json()).then(setVeiculos);
    fetch('http://localhost:3000/cidades').then(res => res.json()).then(setCidades);
  }, []);

  const validar = (): boolean => {
    const novosErros: Partial<Oferecimento> = {};
    if (!form.data) {
      novosErros.data = 'Informe a data de início';
    }
    if (!form.previsaoTermino) {
      novosErros.previsaoTermino = 'Informe a previsão de término';
    } else if (form.data && new Date(form.previsaoTermino) <= new Date(form.data)) {
      novosErros.previsaoTermino = 'A previsão de término deve ser após a data de início';
    }
    if (!form.vagas || isNaN(Number(form.vagas)) || Number(form.vagas) < 1) {
      novosErros.vagas = 'Informe um número inteiro de vagas';
    }
    if (!form.preco || isNaN(Number(form.preco))) {
      novosErros.preco = 'Informe um valor numérico para o preço';
    }
    if (!form.motoristaId) {
      novosErros.motoristaId = 'Selecione um motorista';
    }
    if (!form.veiculoId) {
      novosErros.veiculoId = 'Selecione um veículo';
    }
    if (!form.origemId) {
      novosErros.origemId = 'Selecione a cidade de origem';
    }
    if (!form.destinoId) {
      novosErros.destinoId = 'Selecione a cidade de destino';
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
      const resp = await fetch('http://localhost:3000/oferecimentoCarona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vagas: Number(form.vagas),
          preco: Number(form.preco),
          motoristaId: Number(form.motoristaId),
          veiculoId: Number(form.veiculoId),
          origemId: Number(form.origemId),
          destinoId: Number(form.destinoId),
        }),
      });
      if (resp.ok) {
        setMensagem('Carona oferecida com sucesso!');
        setForm(initialState);
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao oferecer carona.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="card p-4">
      <h2>Oferecimento de Carona</h2>
      {mensagem && <div className="alert alert-info">{mensagem}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Data de Início</label>
          <input type="datetime-local" className={`form-control${erros.data ? ' is-invalid' : ''}`} name="data" value={form.data} onChange={handleChange} />
          {erros.data && <div className="invalid-feedback">{erros.data}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Previsão de Término</label>
          <input type="datetime-local" className={`form-control${erros.previsaoTermino ? ' is-invalid' : ''}`} name="previsaoTermino" value={form.previsaoTermino} onChange={handleChange} />
          {erros.previsaoTermino && <div className="invalid-feedback">{erros.previsaoTermino}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Vagas</label>
          <input type="number" className={`form-control${erros.vagas ? ' is-invalid' : ''}`} name="vagas" value={form.vagas} onChange={handleChange} min={1} />
          {erros.vagas && <div className="invalid-feedback">{erros.vagas}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Preço</label>
          <input type="number" step="0.01" className={`form-control${erros.preco ? ' is-invalid' : ''}`} name="preco" value={form.preco} onChange={handleChange} />
          {erros.preco && <div className="invalid-feedback">{erros.preco}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Motorista</label>
          <select className={`form-select${erros.motoristaId ? ' is-invalid' : ''}`} name="motoristaId" value={form.motoristaId} onChange={handleChange}>
            <option value="">Selecione</option>
            {motoristas.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
          {erros.motoristaId && <div className="invalid-feedback">{erros.motoristaId}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Veículo</label>
          <select className={`form-select${erros.veiculoId ? ' is-invalid' : ''}`} name="veiculoId" value={form.veiculoId} onChange={handleChange}>
            <option value="">Selecione</option>
            {veiculos.map(v => (
              <option key={v.id} value={v.id}>{v.placa}</option>
            ))}
          </select>
          {erros.veiculoId && <div className="invalid-feedback">{erros.veiculoId}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Origem</label>
          <select className={`form-select${erros.origemId ? ' is-invalid' : ''}`} name="origemId" value={form.origemId} onChange={handleChange}>
            <option value="">Selecione</option>
            {cidades.map(c => (
              <option key={c.id} value={c.id}>{c.nomeCidade}</option>
            ))}
          </select>
          {erros.origemId && <div className="invalid-feedback">{erros.origemId}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Destino</label>
          <select className={`form-select${erros.destinoId ? ' is-invalid' : ''}`} name="destinoId" value={form.destinoId} onChange={handleChange}>
            <option value="">Selecione</option>
            {cidades.map(c => (
              <option key={c.id} value={c.id}>{c.nomeCidade}</option>
            ))}
          </select>
          {erros.destinoId && <div className="invalid-feedback">{erros.destinoId}</div>}
        </div>
        <button type="submit" className="btn btn-primary">Oferecer Carona</button>
      </form>
    </div>
  );
};

export default OferecimentoCaronaForm; 