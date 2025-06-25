import React, { useState, useEffect } from 'react';

type Cidade = {
  id: number;
  nomeCidade: string;
};

type RelatorioCaronasOfertadas = {
  carona_id: number;
  motorista: string;
  horario_saida: string;
  valor: number;
  origem: string;
  destino: string;
};

const RelatorioCaronasOfertadas: React.FC = () => {
  console.log('🎯 COMPONENTE RelatorioCaronasOfertadas CARREGADO');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [dataEspecifica, setDataEspecifica] = useState<string>('');
  const [origemSelecionada, setOrigemSelecionada] = useState<string>('');
  const [destinoSelecionado, setDestinoSelecionado] = useState<string>('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [relatorioOfertadas, setRelatorioOfertadas] = useState<RelatorioCaronasOfertadas[]>([]);

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
    
    if (!dataEspecifica) {
      console.log('❌ Data não especificada');
      setErro('Selecione uma data específica para filtrar');
      return;
    }

    console.log('✅ Data especificada, iniciando busca...');
    setLoading(true);
    setErro('');
    
    try {
      // Buscar dados dos endpoints que funcionam
      const oferecimentoCaronaResponse = await fetch('http://localhost:3333/oferecimentoCarona');

      if (!oferecimentoCaronaResponse.ok) {
        throw new Error('Erro ao buscar dados de oferecimentos');
      }

      const oferecimentos = await oferecimentoCaronaResponse.json();

      console.log('✅ Dados carregados:', {
        oferecimentos: oferecimentos.length
      });

      // Processar dados no frontend
      const dataEspecificaObj = new Date(dataEspecifica + 'T00:00:00');
      const dataEspecificaFim = new Date(dataEspecifica + 'T23:59:59');
      
      console.log('🎯 Filtros aplicados:', {
        dataEspecifica,
        dataEspecificaObj: dataEspecificaObj.toISOString(),
        dataEspecificaFim: dataEspecificaFim.toISOString(),
        origemSelecionada: origemSelecionada || 'Todas',
        destinoSelecionado: destinoSelecionado || 'Todas'
      });

      const relatorioProcessado: RelatorioCaronasOfertadas[] = [];

      oferecimentos.forEach((oferta: any) => {
        const dataOferta = new Date(oferta.data);
        const dentroIntervalo = dataOferta >= dataEspecificaObj && dataOferta <= dataEspecificaFim;
        
        console.log(`🔍 Oferta ${oferta.id}:`, {
          dataOriginal: oferta.data,
          dataOferta: dataOferta.toISOString(),
          dataEspecificaObj: dataEspecificaObj.toISOString(),
          dataEspecificaFim: dataEspecificaFim.toISOString(),
          dentroIntervalo,
          origemId: oferta.origemId,
          origemNome: oferta.origem?.nomeCidade,
          destinoId: oferta.destinoId,
          destinoNome: oferta.destino?.nomeCidade,
          motoristaId: oferta.motoristaId,
          motoristaNome: oferta.motorista?.nome
        });
        
        // Verificar especificamente a oferta 4 (Jerônimo Monteiro → Alegre)
        if (oferta.id === 4) {
          console.log('🎯 OFERTA 4 (Jerônimo Monteiro → Alegre) ENCONTRADA:', {
            data: oferta.data,
            dataOferta: dataOferta,
            dentroIntervalo,
            origem: oferta.origem,
            destino: oferta.destino,
            motorista: oferta.motorista
          });
        }
        
        // Filtrar por data específica
        if (dentroIntervalo) {
          console.log(`✅ Oferta ${oferta.id} está dentro do período`);
          
          // Aplicar filtros de origem e destino se especificados
          let incluir = true;
          
          if (origemSelecionada && oferta.origemId !== parseInt(origemSelecionada)) {
            incluir = false;
            console.log(`❌ Oferta ${oferta.id} filtrada por origem (esperado: ${origemSelecionada}, atual: ${oferta.origemId})`);
          }
          
          if (destinoSelecionado && oferta.destinoId !== parseInt(destinoSelecionado)) {
            incluir = false;
            console.log(`❌ Oferta ${oferta.id} filtrada por destino (esperado: ${destinoSelecionado}, atual: ${oferta.destinoId})`);
          }

          if (incluir) {
            console.log(`✅ Oferta ${oferta.id} incluída no relatório`);
            
            const itemRelatorio = {
              carona_id: oferta.id,
              motorista: oferta.motorista?.nome || 'Motorista não encontrado',
              horario_saida: oferta.data,
              valor: oferta.preco,
              origem: oferta.origem?.nomeCidade || 'N/A',
              destino: oferta.destino?.nomeCidade || 'N/A'
            };
            
            // Log especial para a oferta 4
            if (oferta.id === 4) {
              console.log('🎯 OFERTA 4 ADICIONADA AO RELATÓRIO:', itemRelatorio);
            }
            
            relatorioProcessado.push(itemRelatorio);
          } else {
            console.log(`❌ Oferta ${oferta.id} NÃO incluída no relatório`);
          }
        } else {
          console.log(`⚠️ Oferta ${oferta.id} fora do período`);
        }
      });

      console.log('📊 Relatório final:', relatorioProcessado);
      setRelatorioOfertadas(relatorioProcessado);
      
    } catch (error) {
      console.error('❌ Erro:', error);
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
            <span className="icon-badge icon-badge-oferecer"></span>
            Relatório: Caronas Ofertadas
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
                  <label className="form-label" htmlFor="dataEspecifica">Data Específica</label>
                  <input
                    id="dataEspecifica"
                    name="dataEspecifica"
                    type="date"
                    className="form-control"
                    value={dataEspecifica}
                    onChange={(e) => setDataEspecifica(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label" htmlFor="origemSelecionada">Origem (Opcional)</label>
                  <select
                    id="origemSelecionada"
                    name="origemSelecionada"
                    className="form-control"
                    value={origemSelecionada}
                    onChange={(e) => setOrigemSelecionada(e.target.value)}
                  >
                    <option value="">Todas...</option>
                    {cidades.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeCidade}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label" htmlFor="destinoSelecionado">Destino (Opcional)</label>
                  <select
                    id="destinoSelecionado"
                    name="destinoSelecionado"
                    className="form-control"
                    value={destinoSelecionado}
                    onChange={(e) => setDestinoSelecionado(e.target.value)}
                  >
                    <option value="">Todas...</option>
                    {cidades.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeCidade}</option>
                    ))}
                  </select>
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
            <h4>Caronas Ofertadas</h4>
            <p className="text-muted">Listagem de caronas ofertadas para uma data específica, opcionalmente filtradas por origem/destino.</p>
            
            {/* Informações de Debug */}
            {loading && (
              <div className="alert alert-info">
                <div className="spinner-border spinner-border-sm me-2"></div>
                Carregando dados do servidor...
              </div>
            )}
            
            {relatorioOfertadas.length === 0 && !loading ? (
              <div className="alert alert-info">
                <h6>Nenhuma carona encontrada</h6>
                <p>Possíveis motivos:</p>
                <ul>
                  <li>Não há caronas ofertadas para a data selecionada</li>
                  <li>Os filtros de origem/destino estão muito restritivos</li>
                  <li>Verifique se há dados no banco de dados</li>
                </ul>
                <p className="mb-0">
                  <strong>Dica:</strong> Abra o Console do navegador (F12) para ver logs detalhados.
                </p>
                <p className="mt-2 mb-0">
                  <small>
                    <strong>Dados disponíveis (baseado nos últimos dados carregados):</strong><br/>
                    • Oferecimentos com datas: 2025-10-01 e 2025-06-25<br/>
                    • Cidades: Alegre, Cachoeiro de Itapemirim, Castelo, Jerônimo Monteiro<br/>
                    • Para teste, tente usar a data "2025-10-01" sem filtros de origem/destino
                  </small>
                </p>
              </div>
            ) : relatorioOfertadas.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Motorista</th>
                        <th>Horário de Saída</th>
                        <th>Rota</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorioOfertadas.map((item) => (
                        <tr key={item.carona_id}>
                          <td>
                            <span className="badge badge-info">
                              {item.carona_id}
                            </span>
                          </td>
                          <td>
                            <strong>{item.motorista}</strong>
                          </td>
                          <td>
                            {new Date(item.horario_saida).toLocaleString('pt-BR')}
                          </td>
                          <td>
                            <span className="badge badge-primary mr-1">{item.origem}</span>
                            →
                            <span className="badge badge-secondary ml-1">{item.destino}</span>
                          </td>
                          <td>
                            <strong className="text-success">R$ {item.valor.toFixed(2)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Total de oferecimentos: {relatorioOfertadas.length}</strong>
                    </div>
                    <div className="col-md-6 text-right">
                      <strong>Valor total: R$ {relatorioOfertadas.reduce((acc, o) => acc + o.valor, 0).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="alert alert-secondary">
                👆 Selecione uma data específica e clique em "Buscar" para carregar o relatório.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioCaronasOfertadas;
