import React, { useEffect, useState } from 'react';

type Carona = {
  id: number;
  data: string;
  previsaoTermino: string;
  vagas: number;
  preco: number;
  origem: { nomeCidade: string };
  destino: { nomeCidade: string };
  veiculo: { placa: string; marca: string; modelo: string };
  motorista: { nome: string };
};

type Cliente = {
  id: number;
  nome: string;
};

const AceiteCaronaForm: React.FC = () => {
  const [caronas, setCaronas] = useState<Carona[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');
  const [mensagem, setMensagem] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [caronasRes, clientesRes] = await Promise.all([
          fetch('http://localhost:3333/oferecimentoCarona'),
          fetch('http://localhost:3333/clientes')
        ]);
        
        const caronasData = await caronasRes.json();
        const clientesData = await clientesRes.json();
        
        setCaronas(caronasData);
        setClientes(clientesData);
      } catch (error) {
        setMensagem('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, []);

  const handleAceitarCarona = async (caronaId: number) => {
    if (!clienteSelecionado) {
      setMensagem('Selecione um cliente primeiro');
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/aceiteCarona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: Number(clienteSelecionado),
          oferecimentoCaronaId: caronaId,
        }),
      });

      if (response.ok) {
        setMensagem('Carona aceita com sucesso!');
        // Atualizar a lista de caronas (opcional)
        // Aqui você pode remover a carona da lista ou decrementar as vagas
      } else {
        const data = await response.json();
        setMensagem(data.message || 'Erro ao aceitar carona');
      }
    } catch (error) {
      setMensagem('Erro de conexão com o servidor');
    }
  };

  if (loading) {
    return (
      <div className="form-container">
        <div className="card">
          <div className="card-body text-center">
            <div className="loading-spinner"></div>
            <p>Carregando caronas disponíveis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="icon-badge icon-badge-aceitar"></span>
            Aceitar Carona
          </h2>
        </div>
        <div className="card-body">
          {mensagem && (
            <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'}`}>
              {mensagem}
            </div>
          )}

          {/* Seleção de Cliente */}
          <div className="mb-4">
            <label className="form-label">Selecione o Cliente</label>
            <select 
              className="form-control"
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
            >
              <option value="">Escolha um cliente...</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de Caronas */}
          {caronas.length === 0 ? (
            <div className="alert alert-info">
              Nenhuma carona disponível no momento.
            </div>
          ) : (
            <div className="caronas-list">
              <h4 className="mb-3">Caronas Disponíveis ({caronas.length})</h4>
              {caronas.map((carona) => (
                <div key={carona.id} className="card mb-3" style={{ border: '1px solid #dee2e6' }}>
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div className="carona-info">
                          <h5 className="mb-2">
                            <span className="icon-badge icon-badge-cidade"></span>
                            {carona.origem?.nomeCidade || 'N/A'} → {carona.destino?.nomeCidade || 'N/A'}
                          </h5>
                          <div className="carona-details">
                            <p className="mb-1">
                              <strong>📅 Data:</strong> {new Date(carona.data).toLocaleString('pt-BR')}
                            </p>
                            <p className="mb-1">
                              <strong>⏰ Término:</strong> {new Date(carona.previsaoTermino).toLocaleString('pt-BR')}
                            </p>
                            <p className="mb-1">
                              <strong>🚗 Veículo:</strong> {carona.veiculo?.placa} - {carona.veiculo?.marca} {carona.veiculo?.modelo}
                            </p>
                            <p className="mb-1">
                              <strong>👨‍💼 Motorista:</strong> {carona.motorista?.nome || 'N/A'}
                            </p>
                            <div className="row">
                              <div className="col-sm-6">
                                <p className="mb-1">
                                  <strong>👥 Vagas:</strong> {carona.vagas}
                                </p>
                              </div>
                              <div className="col-sm-6">
                                <p className="mb-1">
                                  <strong>💰 Preço:</strong> R$ {carona.preco?.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 text-center">
                        <button
                          className="btn btn-success btn-lg"
                          onClick={() => handleAceitarCarona(carona.id)}
                          disabled={!clienteSelecionado || carona.vagas === 0}
                          style={{ minWidth: '140px' }}
                        >
                          {carona.vagas === 0 ? 'Lotada' : 'Aceitar Carona'}
                        </button>
                        {!clienteSelecionado && (
                          <small className="text-muted d-block mt-2">
                            Selecione um cliente primeiro
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AceiteCaronaForm; 