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
  console.log('🎯 COMPONENTE RelatorioCaronasAceitasCidade CARREGADO');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [relatorioCidades, setRelatorioCidades] = useState<RelatorioCaronasAceitasCidade[]>([]);

  useEffect(() => {
    console.log('📡 useEffect executado - buscando cidades...');
    const buscarCidades = async () => {
      try {
        console.log('🌆 Fazendo requisição para /cidades');
        const response = await fetch('http://localhost:3333/cidades');
        const cidadesData = await response.json();
        console.log('🌆 Cidades recebidas:', cidadesData);
        setCidades(cidadesData);
      } catch (error) {
        console.error('❌ Erro ao carregar cidades:', error);
        setErro('Erro ao carregar cidades');
      }
    };

    buscarCidades();
  }, []);

  const buscarRelatorio = async () => {
    console.log('🚀 INICIANDO buscarRelatorio()');
    
    if (!dataInicio || !dataFim || !cidadeSelecionada) {
      console.log('❌ Dados incompletos:', { dataInicio, dataFim, cidadeSelecionada });
      setErro('Selecione a cidade e o período (data início e fim) para filtrar');
      return;
    }

    console.log('✅ Dados completos, iniciando busca...');
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

      console.log('Dados recebidos:', {
        cidades: cidadesTodas.length,
        aceites: aceites.length,
        oferecimentos: oferecimentos.length
      });

      // Log de alguns dados para debug
      console.log('Primeiros oferecimentos:', oferecimentos.slice(0, 3));
      console.log('Primeiros aceites:', aceites.slice(0, 3));

      // Processar dados no frontend
      const dataInicioObj = new Date(dataInicio + 'T00:00:00');
      const dataFimObj = new Date(dataFim + 'T23:59:59');
      const cidadeEscolhidaId = parseInt(cidadeSelecionada);
      const cidadeEscolhida = cidadesTodas.find((c: any) => c.id === cidadeEscolhidaId);

      console.log('🎯 Filtros aplicados:', {
        cidadeId: cidadeEscolhidaId,
        cidadeNome: cidadeEscolhida?.nomeCidade,
        dataInicioString: dataInicio,
        dataFimString: dataFim,
        dataInicioObj: dataInicioObj.toISOString(),
        dataFimObj: dataFimObj.toISOString()
      });

      if (!cidadeEscolhida) {
        setErro('Cidade não encontrada');
        return;
      }

      // Log das datas dos oferecimentos para debug
      console.log('Datas dos oferecimentos:', oferecimentos.map((o: any) => ({
        id: o.id,
        data: o.data,
        dataObj: new Date(o.data),
        origemId: o.origemId,
        destinoId: o.destinoId
      })));

      // Log dos aceites para debug
      console.log('Aceites disponíveis:', aceites.map((a: any) => ({
        id: a.id,
        oferecimentoCaronaId: a.oferecimentoCaronaId,
        clienteId: a.clienteId
      })));

      console.log('Aceites para oferta 4:', aceites.filter((a: any) => a.oferecimentoCaronaId === 4));

      let totalComoOrigem = 0;
      let totalComoDestino = 0;

      // Processar oferecimentos que têm aceites
      oferecimentos.forEach((oferta: any) => {
        const dataOferta = new Date(oferta.data);
        const dentroIntervalo = dataOferta >= dataInicioObj && dataOferta <= dataFimObj;
        
        console.log(`🔍 Oferta ${oferta.id}:`, {
          dataOriginal: oferta.data,
          dataOferta: dataOferta.toISOString(),
          dataInicio: dataInicioObj.toISOString(),
          dataFim: dataFimObj.toISOString(),
          dentroIntervalo,
          origemId: oferta.origemId,
          destinoId: oferta.destinoId
        });
        
        // Verificar se a data está no período
        if (dentroIntervalo) {
          console.log(`✅ Oferta ${oferta.id} está dentro do período`);
          
          // Buscar aceites para esta oferta
          const aceitesOferta = aceites.filter((aceite: any) => aceite.oferecimentoCaronaId === oferta.id);
          
          console.log(`📋 Oferta ${oferta.id} tem ${aceitesOferta.length} aceites:`, aceitesOferta.map((a: any) => `Aceite ${a.id} (Cliente ${a.clienteId})`));
          
          if (aceitesOferta.length > 0) {
            // Verificar se a cidade escolhida é origem
            if (oferta.origemId === cidadeEscolhidaId) {
              totalComoOrigem += aceitesOferta.length;
              console.log(`✅ Cidade como ORIGEM: +${aceitesOferta.length} caronas (total: ${totalComoOrigem})`);
            }
            
            // Verificar se a cidade escolhida é destino
            if (oferta.destinoId === cidadeEscolhidaId) {
              totalComoDestino += aceitesOferta.length;
              console.log(`✅ Cidade como DESTINO: +${aceitesOferta.length} caronas (total: ${totalComoDestino})`);
            }

            // Log adicional se a cidade não é nem origem nem destino
            if (oferta.origemId !== cidadeEscolhidaId && oferta.destinoId !== cidadeEscolhidaId) {
              console.log(`⚠️ Oferta ${oferta.id} não envolve a cidade escolhida (origem: ${oferta.origemId}, destino: ${oferta.destinoId}, escolhida: ${cidadeEscolhidaId})`);
            }
          } else {
            console.log(`⚠️ Oferta ${oferta.id} não tem aceites`);
          }
        } else {
          console.log(`⚠️ Oferta ${oferta.id} fora do período (${dataOferta.toISOString()} não está entre ${dataInicioObj.toISOString()} e ${dataFimObj.toISOString()})`);
        }
      });

      console.log('Totais calculados:', {
        totalComoOrigem,
        totalComoDestino
      });

      const relatorioProcessado: RelatorioCaronasAceitasCidade[] = [];

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
        relatorioProcessado.push({
          cidade: cidadeEscolhida.nomeCidade,
          total_caronas: 0,
          tipo: 'DESTINO'
        });
      }

      console.log('Relatório final:', relatorioProcessado);
      setRelatorioCidades(relatorioProcessado);
      
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao buscar dados para o relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    console.log('🔍 CLICOU NO BOTÃO BUSCAR');
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
              <div className="alert alert-warning mb-3">
                <small>
                  <strong>💡 Dica:</strong> Os dados de teste incluem oferecimentos em <strong>01/10/2025</strong> e <strong>25/06/2025</strong>.
                  Para ver resultados, use uma dessas datas no filtro.
                </small>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label" htmlFor="cidadeSelecionada">Cidade</label>
                  <select
                    id="cidadeSelecionada"
                    name="cidadeSelecionada"
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
                  <label className="form-label" htmlFor="dataInicio">Data Início</label>
                  <input
                    id="dataInicio"
                    name="dataInicio"
                    type="date"
                    className="form-control"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label" htmlFor="dataFim">Data Fim</label>
                  <input
                    id="dataFim"
                    name="dataFim"
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
            
            {/* Informações de Debug */}
            {loading && (
              <div className="alert alert-info">
                <div className="spinner-border spinner-border-sm me-2"></div>
                Carregando dados do servidor...
              </div>
            )}
            
            {relatorioCidades.length === 0 && !loading ? (
              <div className="alert alert-info">
                <h6>Nenhuma carona encontrada</h6>
                <p>Possíveis motivos:</p>
                <ul>
                  <li>Não há caronas aceitas para a cidade selecionada no período</li>
                  <li>Verifique se o período inclui datas com oferecimentos</li>
                  <li>Verifique se há dados no banco de dados</li>
                </ul>
                <p className="mb-0">
                  <strong>Dica:</strong> Abra o Console do navegador (F12) para ver logs detalhados.
                </p>
                <p className="mt-2 mb-0">
                  <small>
                    <strong>Dados disponíveis (baseado nos últimos dados carregados):</strong><br/>
                    • Oferecimentos com datas: 2025-10-01 e 2025-06-25<br/>
                    • Cidades: Alegre (ID: 1), Cachoeiro de Itapemirim (ID: 2), Castelo (ID: 3), Jerônimo Monteiro (ID: 4)<br/>
                    • <strong>Rotas com aceites em 01/10/2025:</strong><br/>
                    &nbsp;&nbsp;- Alegre → Cachoeiro de Itapemirim (múltiplas caronas)<br/>
                    &nbsp;&nbsp;- Cachoeiro de Itapemirim → Castelo<br/>
                    &nbsp;&nbsp;- Castelo → Jerônimo Monteiro<br/>
                    &nbsp;&nbsp;- Jerônimo Monteiro → Alegre ✨ (recém adicionada)<br/>
                    • Para teste, tente filtrar pela cidade "Jerônimo Monteiro" no período 2025-10-01 a 2025-10-01
                  </small>
                </p>
              </div>
            ) : relatorioCidades.length > 0 ? (
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
                            <span className="badge badge-black badge-lg">
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
            ) : (
              <div className="alert alert-secondary">
                👆 Use os filtros acima e clique em "Buscar" para carregar o relatório.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioCaronasAceitasCidade;
