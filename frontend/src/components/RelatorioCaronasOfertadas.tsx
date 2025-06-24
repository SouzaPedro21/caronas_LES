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
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [dataEspecifica, setDataEspecifica] = useState<string>('');
  const [origemSelecionada, setOrigemSelecionada] = useState<string>('');
  const [destinoSelecionado, setDestinoSelecionado] = useState<string>('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [relatorioOfertadas, setRelatorioOfertadas] = useState<RelatorioCaronasOfertadas[]>([]);

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
    if (!dataEspecifica) {
      setErro('Selecione uma data específica para filtrar');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
      // Buscar dados dos endpoints que funcionam
      const [motoristasResponse, oferecimentoCaronaResponse] = await Promise.all([
        fetch('http://localhost:3333/motoristas'),
        fetch('http://localhost:3333/oferecimentoCarona')
      ]);

      if (!motoristasResponse.ok || !oferecimentoCaronaResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const motoristas = await motoristasResponse.json();
      const oferecimentos = await oferecimentoCaronaResponse.json();

      // Processar dados no frontend
      const dataEspecificaObj = new Date(dataEspecifica);
      const relatorioProcessado: RelatorioCaronasOfertadas[] = [];

      oferecimentos.forEach((oferta: any) => {
        const dataOferta = new Date(oferta.data);
        
        // Filtrar por data específica (mesmo dia)
        if (dataOferta.toDateString() === dataEspecificaObj.toDateString()) {
          const motorista = motoristas.find((m: any) => m.id === oferta.motoristaId);
          
          // Filtros opcionais por origem e destino (se implementados no futuro)
          let incluir = true;
          
          // Por enquanto, como não temos origem/destino nos dados, incluímos todos
          // if (origemSelecionada && oferta.origemId !== parseInt(origemSelecionada)) {
          //   incluir = false;
          // }
          // if (destinoSelecionado && oferta.destinoId !== parseInt(destinoSelecionado)) {
          //   incluir = false;
          // }

          if (incluir && motorista) {
            relatorioProcessado.push({
              carona_id: oferta.id,
              motorista: motorista.nome,
              horario_saida: oferta.data,
              valor: oferta.preco,
              origem: oferta.origem || 'N/A',
              destino: oferta.destino || 'N/A'
            });
          }
        }
      });

      setRelatorioOfertadas(relatorioProcessado);
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
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label">Data Específica</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dataEspecifica}
                    onChange={(e) => setDataEspecifica(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Origem (Opcional)</label>
                  <select
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
                  <label className="form-label">Destino (Opcional)</label>
                  <select
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
            
            {relatorioOfertadas.length === 0 ? (
              <div className="alert alert-info">
                Nenhuma carona encontrada para os filtros selecionados. Clique em "Buscar" para carregar os dados.
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioCaronasOfertadas;
