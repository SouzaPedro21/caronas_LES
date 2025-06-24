import React, { useEffect, useState } from 'react';

type Motorista = {
  id: number;
  nome: string;
};

const initialState = {
  placa: '',
  marca: '',
  modelo: '',
  chassi: '',
  motoristaId: '',
};

type Veiculo = typeof initialState;

const VeiculoForm: React.FC = () => {
  const [form, setForm] = useState<Veiculo>(initialState);
  const [mensagem, setMensagem] = useState<string>('');
  const [erros, setErros] = useState<Partial<Veiculo>>({});
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/motoristas')
      .then(res => res.json())
      .then(data => setMotoristas(data));
  }, []);

  const validar = (): boolean => {
    const novosErros: Partial<Veiculo> = {};
    if (!form.placa || !/^[A-Z]{3}-\d{1}[A-Z0-9]{1}\d{2}$/.test(form.placa)) {
      novosErros.placa = 'A placa deve seguir o padrão AAA-9A99';
    }
    if (!form.marca || form.marca.length < 2 || form.marca.length > 50) {
      novosErros.marca = 'A marca deve ter entre 2 e 50 letras';
    }
    if (!form.modelo || form.modelo.length < 2 || form.modelo.length > 50) {
      novosErros.modelo = 'O modelo deve ter entre 2 e 50 letras';
    }
    if (!form.chassi || form.chassi.length < 2 || form.chassi.length > 50) {
      novosErros.chassi = 'O chassi deve ter entre 2 e 50 letras';
    }
    if (!form.motoristaId) {
      novosErros.motoristaId = 'Selecione um motorista';
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
      const resp = await fetch('http://localhost:3000/veiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, motoristaId: Number(form.motoristaId) }),
      });
      if (resp.ok) {
        setMensagem('Veículo cadastrado com sucesso!');
        setForm(initialState);
      } else {
        const data = await resp.json();
        setMensagem(data.message || 'Erro ao cadastrar veículo.');
      }
    } catch (err) {
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="card p-4">
      <h2>Cadastro de Veículo</h2>
      {mensagem && <div className="alert alert-info">{mensagem}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Placa</label>
          <input type="text" className={`form-control${erros.placa ? ' is-invalid' : ''}`} name="placa" value={form.placa} onChange={handleChange} placeholder="AAA-9A99" />
          {erros.placa && <div className="invalid-feedback">{erros.placa}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Marca</label>
          <input type="text" className={`form-control${erros.marca ? ' is-invalid' : ''}`} name="marca" value={form.marca} onChange={handleChange} />
          {erros.marca && <div className="invalid-feedback">{erros.marca}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Modelo</label>
          <input type="text" className={`form-control${erros.modelo ? ' is-invalid' : ''}`} name="modelo" value={form.modelo} onChange={handleChange} />
          {erros.modelo && <div className="invalid-feedback">{erros.modelo}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Chassi</label>
          <input type="text" className={`form-control${erros.chassi ? ' is-invalid' : ''}`} name="chassi" value={form.chassi} onChange={handleChange} />
          {erros.chassi && <div className="invalid-feedback">{erros.chassi}</div>}
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
        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
    </div>
  );
};

export default VeiculoForm; 