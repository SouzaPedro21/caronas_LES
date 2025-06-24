import React, { useState } from 'react';

type RelatorioMontanteMotorista = {
  motorista_id: number;
  motorista_nome: string;
  valor_total: number;
  trajetos: Array<{
    origem: string;
    destino: string;
    total_aceites: number;
    valor_unitario: number;
    valor_total_trajeto: number;
    oferecimento_id: number;
  }>;
};

const RelatorioMontanteMotorista: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [relatorioMontante, setRelatorioMontante] = useState<RelatorioMontanteMotorista[]>([]);

  const buscarRelatorioMontanteMotoristas = async () => {
    if (!dataInicio || !dataFim) {
      setErro('Selecione o período (data início e fim) para filtrar');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
      // Buscar dados dos endpoints que funcionam
      const [motoristasResponse, aceiteCaronaResponse, oferecimentoCaronaResponse] = await Promise.all([
        fetch('http://localhost:3333/motoristas'),
        fetch('http://localhost:3333/aceiteCarona'),
        fetch('http://localhost:3333/oferecimentoCarona')
      ]);

      if (!motoristasResponse.ok || !aceiteCaronaResponse.ok || !oferecimentoCaronaResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const motoristas = await motoristasResponse.json();
      const aceites = await aceiteCaronaResponse.json();
      const oferecimentos = await oferecimentoCaronaResponse.json();

      // Processar dados no frontend
      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);

      const relatorioProcessado: RelatorioMontanteMotorista[] = [];

      motoristas.forEach((motorista: any) => {
        const ofertasDoMotorista = oferecimentos.filter((of: any) => of.motoristaId === motorista.id);
        
        let valorTotalMotorista = 0;
        const trajetosMotorista: any[] = [];

        ofertasDoMotorista.forEach((oferta: any) => {
          const dataOferta = new Date(oferta.data);
          
          // Filtrar por período
          if (dataOferta >= dataInicioObj && dataOferta <= dataFimObj) {
            const aceitesOferta = aceites.filter((aceite: any) => aceite.oferecimentoCaronaId === oferta.id);
            
            if (aceitesOferta.length > 0) {
              const valorTotalTrajeto = aceitesOferta.length * oferta.preco;
              valorTotalMotorista += valorTotalTrajeto;

              trajetosMotorista.push({
                origem: oferta.origem || 'N/A',
                destino: oferta.destino || 'N/A',
                total_aceites: aceitesOferta.length,
                valor_unitario: oferta.preco,
                valor_total_trajeto: valorTotalTrajeto,
                oferecimento_id: oferta.id
              });
            }
          }
        });

        if (valorTotalMotorista > 0) {
          relatorioProcessado.push({
            motorista_id: motorista.id,
            motorista_nome: motorista.nome,
            valor_total: valorTotalMotorista,
            trajetos: trajetosMotorista
          });
        }
      });

      setRelatorioMontante(relatorioProcessado);
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao buscar dados para o relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    buscarRelatorioMontanteMotoristas();
  };

  return (
    <div className="form-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="icon-badge icon-badge-oferecer"></span>
            Montante Arrecadado por Motorista
          </h2>
        </div>
        <div className="card-body">
          {erro && (
            <div className="alert alert-danger">
              {erro}
            </div>
          )}

          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">🔍 Filtros</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Data Início</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Data Fim</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-end h-100">
                    <button
                      className="btn btn-primary"
                      onClick={handleBuscar}
                      disabled={loading}
                    >
                      {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Relatório */}
          <div>
            <h4>Montante Arrecadado por Motorista</h4>
            <p className="text-muted">
              Relatório financeiro com o valor total arrecadado por cada motorista no período, com detalhamento por trajeto.
            </p>
            
            {relatorioMontante.length === 0 ? (
              <div className="alert alert-info">
                Nenhum dado encontrado para o período selecionado. Clique em "Buscar" para carregar os dados.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Motorista</th>
                        <th>Total Arrecadado</th>
                        <th>Detalhes dos Trajetos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorioMontante.map((item) => (
                        <tr key={item.motorista_id}>
                          <td>{item.motorista_id}</td>
                          <td>{item.motorista_nome}</td>
                          <td>
                            <strong>R$ {item.valor_total.toFixed(2)}</strong>
                          </td>
                          <td>
                            <details>
                              <summary>Ver trajetos ({item.trajetos.length})</summary>
                              <div className="mt-2">
                                {item.trajetos.map((trajeto, idx) => (
                                  <div key={idx} className="small mb-1">
                                    <strong>{trajeto.origem} → {trajeto.destino}</strong><br/>
                                    Aceites: {trajeto.total_aceites} | 
                                    Valor unitário: R$ {trajeto.valor_unitario.toFixed(2)} | 
                                    Total: R$ {trajeto.valor_total_trajeto.toFixed(2)}
                                  </div>
                                ))}
                              </div>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <strong>
                    Total geral arrecadado: R$ {relatorioMontante.reduce((acc, m) => acc + m.valor_total, 0).toFixed(2)}
                  </strong>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioMontanteMotorista;
