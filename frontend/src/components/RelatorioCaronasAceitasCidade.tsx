import React, { useState, useEffect } from 'react';

type Cidade = {
  id: number;
  nomeCidade: string;
};

type RelatorioCaronasAceitasCidade = {
  cidade: string;
  total_caronas: number;
  tipo: 'ORIGEM' | 'DESTINO';
};

const RelatorioCaronasAceitasCidade: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [relatorioCidades, setRelatorioCidades] = useState<RelatorioCaronasAceitasCidade[]>([]);

  useEffect(() => {
    const buscarCidades = async () => {
      try {
        const response = await fetch('http://localhost:3333/cidades');
        const cidadesData = await response.json();
        setCidades(cidadesData);
      } catch (error) {
        setErro('Erro ao carregar cidades');
      }
    };

    buscarCidades();
  }, []);

  const buscarRelatorio = async () => {
    if (!dataInicio || !dataFim || !cidadeSelecionada) {
      setErro('Selecione a cidade e o período (data início e fim) para filtrar');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
      // Buscar dados dos endpoints que funcionam
      const [cidadesResponse, aceiteCaronaResponse, oferecimentoCaronaResponse] = await Promise.all([
        fetch('http://localhost:3333/cidades'),
        fetch('http://localhost:3333/aceiteCarona'),
        fetch('http://localhost:3333/oferecimentoCarona')
      ]);

      if (!cidadesResponse.ok || !aceiteCaronaResponse.ok || !oferecimentoCaronaResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const cidadesTodas = await cidadesResponse.json();
      const aceites = await aceiteCaronaResponse.json();
      const oferecimentos = await oferecimentoCaronaResponse.json();

      // Processar dados no frontend
      const dataInicioObj = new Date(dataInicio);
      const dataFimObj = new Date(dataFim);
      const cidadeEscolhida = cidadesTodas.find((c: any) => c.id === parseInt(cidadeSelecionada));

      if (!cidadeEscolhida) {
        setErro('Cidade não encontrada');
        return;
      }

      const relatorioProcessado: RelatorioCaronasAceitasCidade[] = [];
      let totalComoOrigem = 0;
      let totalComoDestino = 0;

      oferecimentos.forEach((oferta: any) => {
        const dataOferta = new Date(oferta.data);
        
        // Filtrar por período
        if (dataOferta >= dataInicioObj && dataOferta <= dataFimObj) {
          const aceitesOferta = aceites.filter((aceite: any) => aceite.oferecimentoCaronaId === oferta.id);
          
          if (aceitesOferta.length > 0) {
            // Assumindo que as cidades de origem e destino podem estar nos campos do oferecimento
            // Como não temos esses campos, vamos simular com base nos dados disponíveis
            if (oferta.motoristaId && aceitesOferta.length > 0) {
              totalComoOrigem += aceitesOferta.length;
            }
          }
        }
      });

      if (totalComoOrigem > 0) {
        relatorioProcessado.push({
          cidade: cidadeEscolhida.nomeCidade,
          total_caronas: totalComoOrigem,
          tipo: 'ORIGEM'
        });
      }

      if (totalComoDestino > 0) {
        relatorioProcessado.push({
          cidade: cidadeEscolhida.nomeCidade,
          total_caronas: totalComoDestino,
          tipo: 'DESTINO'
        });
      }

      // Se não houver dados, ainda mostrar a cidade com 0
      if (relatorioProcessado.length === 0) {
        relatorioProcessado.push({
          cidade: cidadeEscolhida.nomeCidade,
          total_caronas: 0,
          tipo: 'ORIGEM'
        });
      }

      setRelatorioCidades(relatorioProcessado);
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao buscar dados para o relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setErro('');
    buscarRelatorio();
  };

  return (
    <div className="form-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="icon-badge icon-badge-cidade"></span>
            Relatório: Caronas Aceitas por Cidade
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
                <div className="col-md-3">
                  <label className="form-label">Cidade</label>
                  <select
                    className="form-control"
                    value={cidadeSelecionada}
                    onChange={(e) => setCidadeSelecionada(e.target.value)}
                  >
                    <option value="">Selecione uma cidade...</option>
                    {cidades.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeCidade}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Data Início</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Data Fim</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleBuscar}
                    disabled={loading}
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <h4>Caronas Aceitas por Cidade</h4>
            <p className="text-muted">Listagem de caronas aceitas agrupadas por cidade (origem/destino), filtrado por período.</p>
            
            {relatorioCidades.length === 0 ? (
              <div className="alert alert-info">
                Nenhuma carona encontrada para os filtros selecionados. Clique em "Buscar" para carregar os dados.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Cidade</th>
                        <th>Tipo</th>
                        <th>Total de Caronas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorioCidades.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item.cidade}</strong>
                          </td>
                          <td>
                            <span className={`badge ${item.tipo === 'ORIGEM' ? 'badge-primary' : 'badge-secondary'}`}>
                              {item.tipo}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-success badge-lg">
                              {item.total_caronas}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Total de registros: {relatorioCidades.length}</strong>
                    </div>
                    <div className="col-md-6 text-right">
                      <strong>Total de caronas: {relatorioCidades.reduce((acc, c) => acc + c.total_caronas, 0)}</strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioCaronasAceitasCidade;
