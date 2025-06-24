import React, { useEffect, useState } from 'react';

type Veiculo = { 
  id: number; 
  placa: string; 
  marca: string; 
  modelo: string;
  motoristaId: number;
  motorista: { nome: string };
};
type Cidade = { id: number; nomeCidade: string };

const initialState = {
  data: '',
  previsaoTermino: '',
  vagas: '',
  preco: '',
  veiculoId: '',
  origemId: '',
  destinoId: '',
};

type Oferecimento = typeof initialState;

const OferecimentoCaronaForm: React.FC = () => {
  const [form, setForm] = useState<Oferecimento>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Oferecimento>>({});
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);

  useEffect(() => {
    fetch('http://localhost:3333/veiculos').then(res => res.json()).then(setVeiculos);
    fetch('http://localhost:3333/cidades').then(res => res.json()).then(setCidades);
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
    
    // Se o veículo foi alterado, encontrar o motorista correspondente
    if (e.target.name === 'veiculoId' && e.target.value) {
      const veiculo = veiculos.find(v => v.id === Number(e.target.value));
      setVeiculoSelecionado(veiculo || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    if (!validar()) return;
    
    // Encontrar o motorista do veículo selecionado
    const veiculo = veiculos.find(v => v.id === Number(form.veiculoId));
    if (!veiculo) {
      setMensagem('Veículo não encontrado.');
      return;
    }
    
    try {
      const resp = await fetch('http://localhost:3333/oferecimentoCarona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vagas: Number(form.vagas),
          preco: Number(form.preco),
          motoristaId: veiculo.motoristaId, // Usar o motorista do veículo
          veiculoId: Number(form.veiculoId),
          origemId: Number(form.origemId),
          destinoId: Number(form.destinoId),
        }),
      });
      if (resp.ok) {
        setMensagem('Carona oferecida com sucesso!');
        setForm(initialState);
        setVeiculoSelecionado(null);
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao oferecer carona.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };
  return (
    <div className="form-container">
      <div className="card">        <div className="card-header">
          <h2 className="card-title">➕ Oferecimento de Carona</h2>
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
                <label className="form-label">Data de Início</label>
                <input 
                  type="datetime-local" 
                  className={`form-control${erros.data ? ' is-invalid' : ''}`} 
                  name="data" 
                  value={form.data} 
                  onChange={handleChange} 
                />
                {erros.data && <div className="invalid-feedback">{erros.data}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Previsão de Término</label>
                <input 
                  type="datetime-local" 
                  className={`form-control${erros.previsaoTermino ? ' is-invalid' : ''}`} 
                  name="previsaoTermino" 
                  value={form.previsaoTermino} 
                  onChange={handleChange} 
                />
                {erros.previsaoTermino && <div className="invalid-feedback">{erros.previsaoTermino}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Vagas</label>
                <input 
                  type="number" 
                  className={`form-control${erros.vagas ? ' is-invalid' : ''}`} 
                  name="vagas" 
                  value={form.vagas} 
                  onChange={handleChange} 
                  min={1}
                  placeholder="Número de vagas"
                />
                {erros.vagas && <div className="invalid-feedback">{erros.vagas}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className={`form-control${erros.preco ? ' is-invalid' : ''}`} 
                  name="preco" 
                  value={form.preco} 
                  onChange={handleChange}
                  placeholder="0.00"
                />
                {erros.preco && <div className="invalid-feedback">{erros.preco}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Veículo</label>
                <select 
                  className={`form-control${erros.veiculoId ? ' is-invalid' : ''}`} 
                  name="veiculoId" 
                  value={form.veiculoId} 
                  onChange={handleChange}
                >
                  <option value="">Selecione um veículo</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.marca} {v.modelo} (Motorista: {v.motorista?.nome || 'N/A'})
                    </option>
                  ))}
                </select>
                {erros.veiculoId && <div className="invalid-feedback">{erros.veiculoId}</div>}
              </div>
              {veiculoSelecionado && (
                <div className="form-group">
                  <label className="form-label">Motorista (Automático)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={veiculoSelecionado.motorista?.nome || 'N/A'}
                    disabled
                    style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                  />
                  <small className="form-text text-muted">
                    Motorista definido automaticamente pelo veículo selecionado
                  </small>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Origem</label>
                <select 
                  className={`form-control${erros.origemId ? ' is-invalid' : ''}`} 
                  name="origemId" 
                  value={form.origemId} 
                  onChange={handleChange}
                >
                  <option value="">Selecione a origem</option>
                  {cidades.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeCidade}</option>
                  ))}
                </select>
                {erros.origemId && <div className="invalid-feedback">{erros.origemId}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Destino</label>
                <select 
                  className={`form-control${erros.destinoId ? ' is-invalid' : ''}`} 
                  name="destinoId" 
                  value={form.destinoId} 
                  onChange={handleChange}
                >
                  <option value="">Selecione o destino</option>
                  {cidades.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeCidade}</option>
                  ))}
                </select>
                {erros.destinoId && <div className="invalid-feedback">{erros.destinoId}</div>}
              </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <button type="submit" className="btn btn-primary">
                Oferecer Carona
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OferecimentoCaronaForm; 