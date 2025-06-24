import React, { useState } from 'react';

type RelatorioCaronasAceitasMotorista = {
  id: number;
  nome: string;
  total_caronas_aceitas: number;
};

const RelatorioCaronasAceitasMotorista: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [relatorioMotoristas, setRelatorioMotoristas] = useState<RelatorioCaronasAceitasMotorista[]>([]);

  const buscarRelatorio = async () => {
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

      const relatorioProcessado: RelatorioCaronasAceitasMotorista[] = [];

      motoristas.forEach((motorista: any) => {
        const ofertasDoMotorista = oferecimentos.filter((of: any) => of.motoristaId === motorista.id);
        
        let totalCaronasAceitas = 0;

        ofertasDoMotorista.forEach((oferta: any) => {
          const dataOferta = new Date(oferta.data);
          
          // Filtrar por período
          if (dataOferta >= dataInicioObj && dataOferta <= dataFimObj) {
            const aceitesOferta = aceites.filter((aceite: any) => aceite.oferecimentoCaronaId === oferta.id);
            totalCaronasAceitas += aceitesOferta.length;
          }
        });

        if (totalCaronasAceitas > 0) {
          relatorioProcessado.push({
            id: motorista.id,
            nome: motorista.nome,
            total_caronas_aceitas: totalCaronasAceitas
          });
        }
      });

      setRelatorioMotoristas(relatorioProcessado);
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
            Relatório: Caronas Aceitas por Motorista
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
                <div className="col-md-4 d-flex align-items-end">
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
            <h4>Caronas Aceitas por Motorista</h4>
            <p className="text-muted">Listagem de caronas aceitas agrupadas por motorista, filtrado por período.</p>
            
            {relatorioMotoristas.length === 0 ? (
              <div className="alert alert-info">
                Nenhuma carona encontrada para o período selecionado. Clique em "Buscar" para carregar os dados.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Motorista</th>
                        <th>Total de Caronas Aceitas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorioMotoristas.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.nome}</td>
                          <td>
                            <span className="badge badge-success badge-lg">
                              {item.total_caronas_aceitas}
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
                      <strong>Total de motoristas: {relatorioMotoristas.length}</strong>
                    </div>
                    <div className="col-md-6 text-right">
                      <strong>Total de caronas aceitas: {relatorioMotoristas.reduce((acc, m) => acc + m.total_caronas_aceitas, 0)}</strong>
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

export default RelatorioCaronasAceitasMotorista;
