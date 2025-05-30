import { Cidade } from "../models/Cidade.js";
import { Sequelize, QueryTypes } from "sequelize";
import { databaseConfig } from "../config/database-config.js";
const sequelize = new Sequelize(databaseConfig);
//HELIO BREDA NETTO

class CidadeService {

  static async findAll() {
    const objs = await Cidade.findAll({ include: { all: true, nested: true } });
    return objs;
  }

  static async findByPk(req) {
    const { id } = req.params;
    const obj = await Cidade.findByPk(id, { include: { all: true, nested: true } });
    return obj;
  }

  static async create(req) {
    const { nomeCidade, uf, codigo } = req.body;
    const obj = await Cidade.create({ nomeCidade, uf, codigo });
    return await Cidade.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async update(req) {
    const { id } = req.params;
    const { nomeCidade, uf, codigo } = req.body;
    const obj = await Cidade.findByPk(id, { include: { all: true, nested: true } });
    if (obj == null) throw 'Cidade não encontrada!';
    Object.assign(obj, { nomeCidade, uf, codigo });
    await obj.save();
    return await Cidade.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Cidade.findByPk(id);
    if (obj == null)
      throw 'Cidade não encontrada!';
    await obj.destroy();
    return obj;
  }

  static async getRelatorioCaronasPorCidade(req) {
    const { dataInicio, dataFim, cidade } = req.query;

    const query = `
      SELECT 
        c.nome_cidade as cidade,
        COUNT(ac.id) as total_caronas,
        'ORIGEM' as tipo
      FROM motoristas m
      INNER JOIN oferecimentoCarona oc ON oc.motorista_id = m.id
      INNER JOIN aceiteCarona ac ON ac.oferecimento_carona_id = oc.id
      INNER JOIN cidades c ON c.id = oc.origem_id
      WHERE ac.created_at BETWEEN :dataInicio AND :dataFim
      ${cidade ? 'AND c.nome LIKE :cidade' : ''}
      GROUP BY c.nome_cidade
      
      UNION ALL
      
      SELECT 
        c.nome_cidade as cidade,
        COUNT(ac.id) as total_caronas,
        'DESTINO' as tipo
      FROM motoristas m
      INNER JOIN oferecimentoCarona oc ON oc.motorista_id = m.id
      INNER JOIN aceiteCarona ac ON ac.oferecimento_carona_id = oc.id
      INNER JOIN cidades c ON c.id = oc.destino_id
      WHERE ac.created_at BETWEEN :dataInicio AND :dataFim
      ${cidade ? 'AND c.nome LIKE :cidade' : ''}
      GROUP BY c.nome_cidade
      ORDER BY cidade, tipo`;

    const relatorio = await sequelize.query(query, {
      replacements: {
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        cidade: cidade ? `%${cidade}%` : undefined
      },
      type: QueryTypes.SELECT
    });

    return relatorio;
}

}

export { CidadeService };