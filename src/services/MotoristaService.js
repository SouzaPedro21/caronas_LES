import { Motorista } from "../models/Motorista.js";
import { Sequelize, QueryTypes } from "sequelize";
import { databaseConfig } from "../config/database-config.js";
const sequelize = new Sequelize(databaseConfig);
//PEDRO HENRIQUE BRAIDO DE SOUZA

class MotoristaService {

  static async findAll() {
    const objs = await Motorista.findAll({ include: { all: true, nested: true } });
    return objs;
  }

  static async findByPk(req) {
    const { id } = req.params;
    const obj = await Motorista.findByPk(id, { include: { all: true, nested: true } });
    return obj;
  }

  static async create(req) {
    const { nome, cpf, telefone, sexo, cnh, nota } = req.body;
    const obj = await Motorista.create({ nome, cpf, telefone, sexo, cnh, nota });
    return await Motorista.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, cpf, telefone, sexo, cnh, nota } = req.body;
    const obj = await Motorista.findByPk(id, { include: { all: true, nested: true } });
    if (obj == null) throw 'Motorista não encontrado!';
    Object.assign(obj, { nome, cpf, telefone, sexo, cnh, nota });
    await obj.save();
    return await Motorista.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Motorista.findByPk(id);
    if (obj == null)
      throw 'Motorista não encontrada!';
    await obj.destroy();
    return obj;
  }

  static async getRelatorioCaronasAceitas(req) {
    const { dataInicio, dataFim } = req.query;

    const query = `
      SELECT 
        m.id,
        m.nome,
        COUNT(ac.id) as total_caronas_aceitas
      FROM motoristas m
      INNER JOIN oferecimentoCarona oc ON oc.motorista_id = m.id
      INNER JOIN aceiteCarona ac ON ac.oferecimento_carona_id = oc.id
      WHERE ac.created_at BETWEEN :dataInicio AND :dataFim
      GROUP BY m.id, m.nome
      ORDER BY total_caronas_aceitas DESC`;

    const relatorio = await sequelize.query(query, {
      replacements: {
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim)
      },
      type: QueryTypes.SELECT
    });

    return relatorio;
  }

  static async getRelatorioValorCaronasAceitas(req) {
    const { dataInicio, dataFim, motoristaId } = req.query;

    const query = `
      SELECT 
        m.id as motorista_id,
        m.nome as motorista_nome,
        co.nome_cidade as cidade_origem,
        cd.nome_cidade as cidade_destino,
        COUNT(ac.id) as total_aceites_trajeto,
        oc.preco as valor_unitario,
        (COUNT(ac.id) * oc.preco) as valor_total_trajeto,
        oc.id as oferecimento_id
      FROM motoristas m
      INNER JOIN oferecimentoCarona oc ON oc.motorista_id = m.id
      INNER JOIN aceiteCarona ac ON ac.oferecimento_carona_id = oc.id
      INNER JOIN cidades co ON co.id = oc.origem_id
      INNER JOIN cidades cd ON cd.id = oc.destino_id
      WHERE ac.created_at BETWEEN :dataInicio AND :dataFim
      ${motoristaId ? 'AND m.id = :motoristaId' : ''}
      GROUP BY m.id, m.nome, oc.id, co.nome_cidade, cd.nome_cidade, oc.preco
      ORDER BY m.nome, co.nome_cidade, cd.nome_cidade`;

    const detalhes = await sequelize.query(query, {
      replacements: {
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        motoristaId
      },
      type: QueryTypes.SELECT
    });

    // Agrupa os resultados por motorista
    const relatorio = detalhes.reduce((acc, current) => {
      const motorista = acc.find(m => m.motorista_id === current.motorista_id);

      if (!motorista) {
        acc.push({
          motorista_id: current.motorista_id,
          motorista_nome: current.motorista_nome,
          valor_total: 0,
          trajetos: []
        });
      }

      const index = acc.findIndex(m => m.motorista_id === current.motorista_id);
      acc[index].valor_total += Number(current.valor_total_trajeto);
      acc[index].trajetos.push({
        origem: current.cidade_origem,
        destino: current.cidade_destino,
        total_aceites: current.total_aceites_trajeto,
        valor_unitario: current.valor_unitario,
        valor_total_trajeto: current.valor_total_trajeto,
        oferecimento_id: current.oferecimento_id
      });

      return acc;
    }, []);

    return relatorio;
  }

}

export { MotoristaService };