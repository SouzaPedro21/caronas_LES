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
  console.log('🎯 COMPONENTE RelatorioMontanteMotorista CARREGADO');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [relatorioMontante, setRelatorioMontante] = useState<RelatorioMontanteMotorista[]>([]);

  const buscarRelatorioMontanteMotoristas = async () => {
    console.log('🚀 INICIANDO buscarRelatorioMontanteMotoristas()');
    
    if (!dataInicio || !dataFim) {
      console.log('❌ Dados incompletos:', { dataInicio, dataFim });
      setErro('Selecione o período (data início e fim) para filtrar');
      return;
    }

    console.log('✅ Dados completos, iniciando busca...');
    setLoading(true);
    setErro('');
    
    try {
      // Buscar dados dos endpoints que funcionam
      console.log('📡 Fazendo requisições para APIs...');
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

      console.log('✅ Dados carregados:', {
        motoristas: motoristas.length,
        aceites: aceites.length,
        oferecimentos: oferecimentos.length
      });
      
      // Log de alguns dados para debug
      console.log('Primeiros motoristas:', motoristas.slice(0, 3));
      console.log('Primeiros aceites:', aceites.slice(0, 5));
      console.log('Primeiros oferecimentos:', oferecimentos.slice(0, 3));

      // Processar dados no frontend
      const dataInicioObj = new Date(dataInicio + 'T00:00:00');
      const dataFimObj = new Date(dataFim + 'T23:59:59');
      
      console.log('🎯 Filtros aplicados:', {
        dataInicioString: dataInicio,
        dataFimString: dataFim,
        dataInicioObj: dataInicioObj.toISOString(),
        dataFimObj: dataFimObj.toISOString()
      });
      
      // Log das datas dos oferecimentos para debug
      console.log('Datas dos oferecimentos:', oferecimentos.map((o: any) => ({
        id: o.id,
        data: o.data,
        dataObj: new Date(o.data).toISOString(),
        motoristaId: o.motoristaId
      })));

      const relatorioProcessado: RelatorioMontanteMotorista[] = [];

      console.log('🔄 Processando motoristas...');
      motoristas.forEach((motorista: any) => {
        console.log(`👤 Processando motorista: ${motorista.nome} (ID: ${motorista.id})`);
        
        const ofertasDoMotorista = oferecimentos.filter((of: any) => of.motoristaId === motorista.id);
        console.log(`📋 Motorista ${motorista.nome} tem ${ofertasDoMotorista.length} ofertas`);
        
        let valorTotalMotorista = 0;
        const trajetosMotorista: any[] = [];

        ofertasDoMotorista.forEach((oferta: any) => {
          const dataOferta = new Date(oferta.data);
          const dentroIntervalo = dataOferta >= dataInicioObj && dataOferta <= dataFimObj;
          
          console.log(`🔍 Oferta ${oferta.id} do motorista ${motorista.nome}:`, {
            dataOriginal: oferta.data,
            dataOferta: dataOferta.toISOString(),
            dentroIntervalo,
            origemNome: oferta.origem?.nomeCidade,
            destinoNome: oferta.destino?.nomeCidade
          });
          
          // Filtrar por período
          if (dentroIntervalo) {
            console.log(`✅ Oferta ${oferta.id} está dentro do período`);
            
            const aceitesOferta = aceites.filter((aceite: any) => aceite.oferecimentoCaronaId === oferta.id);
            console.log(`📊 Oferta ${oferta.id} tem ${aceitesOferta.length} aceites`);
            
            if (aceitesOferta.length > 0) {
              const valorTotalTrajeto = aceitesOferta.length * oferta.preco;
              valorTotalMotorista += valorTotalTrajeto;

              console.log(`💰 Trajeto adicionado: ${aceitesOferta.length} aceites × R$ ${oferta.preco} = R$ ${valorTotalTrajeto}`);

              trajetosMotorista.push({
                origem: oferta.origem?.nomeCidade || 'N/A',
                destino: oferta.destino?.nomeCidade || 'N/A',
                total_aceites: aceitesOferta.length,
                valor_unitario: oferta.preco,
                valor_total_trajeto: valorTotalTrajeto,
                oferecimento_id: oferta.id
              });
            } else {
              console.log(`⚠️ Oferta ${oferta.id} não tem aceites`);
            }
          } else {
            console.log(`⚠️ Oferta ${oferta.id} fora do período`);
          }
        });

        console.log(`💰 Motorista ${motorista.nome} - Valor total: R$ ${valorTotalMotorista}, Trajetos: ${trajetosMotorista.length}`);

        if (valorTotalMotorista > 0) {
          relatorioProcessado.push({
            motorista_id: motorista.id,
            motorista_nome: motorista.nome,
            valor_total: valorTotalMotorista,
            trajetos: trajetosMotorista
          });
        }
      });

      console.log('📊 Relatório final:', relatorioProcessado);
      setRelatorioMontante(relatorioProcessado);
    } catch (error) {
      console.error('❌ Erro:', error);
      setErro('Erro ao buscar dados para o relatório: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    console.log('🔍 CLICOU NO BOTÃO BUSCAR');
    setErro('');
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
              <div className="alert alert-warning mb-3">
                <small>
                  <strong>💡 Dica:</strong> Os dados de teste incluem oferecimentos em <strong>01/10/2025</strong> e <strong>25/06/2025</strong>.
                  Para ver resultados, use um período que inclua essas datas.
                </small>
              </div>
              <div className="row">
                <div className="col-md-4">
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
                <div className="col-md-4">
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
            
            {/* Informações de Debug */}
            {loading && (
              <div className="alert alert-info">
                <div className="spinner-border spinner-border-sm me-2"></div>
                Carregando dados do servidor...
              </div>
            )}
            
            {relatorioMontante.length === 0 && !loading ? (
              <div className="alert alert-info">
                <h6>Nenhum montante encontrado</h6>
                <p>Possíveis motivos:</p>
                <ul>
                  <li>Não há caronas aceitas no período selecionado</li>
                  <li>Os motoristas não tiveram caronas aceitas neste período</li>
                  <li>Verifique se há dados no banco de dados</li>
                </ul>
                <p className="mb-0">
                  <strong>Dica:</strong> Abra o Console do navegador (F12) para ver logs detalhados.
                </p>
                <p className="mt-2 mb-0">
                  <small>
                    <strong>Para teste, use o período de 2025-10-01 a 2025-10-01</strong><br/>
                    Motoristas com caronas aceitas: Cristiano, Messi
                  </small>
                </p>
              </div>
            ) : relatorioMontante.length > 0 ? (
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
            ) : (
              <div className="alert alert-secondary">
                👆 Selecione o período (data início e fim) e clique em "Buscar" para carregar o relatório.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioMontanteMotorista;
