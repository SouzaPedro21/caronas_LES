import { OferecimentoCarona } from "../models/OferecimentoCarona.js";
import { Veiculo } from "../models/Veiculo.js";
import { Op } from "sequelize";
import sequelize from "../config/database-connection.js";
import { QueryTypes } from "sequelize";
//HELIO BREDA NETTO

class OferecimentoCaronaService {
  static async findAll() {
    const objs = await OferecimentoCarona.findAll({ include: { all: true, nested: true } });
    return objs;
  }

  static async findByPk(req) {
    const { id } = req.params;
    const obj = await OferecimentoCarona.findByPk(id, { include: { all: true, nested: true } });
    return obj;
  }

  static async create(req) {
    let { data, previsaoTermino, vagas, preco, veiculoId, origemId, destinoId } = req.body;
    const errors = [];

    // Validação da data
    if (!data) {
      errors.push('A data da carona deve ser preenchida!');
    } else {
      const dataCarona = new Date(data);
      if (isNaN(dataCarona.getTime())) {
        errors.push('A data da carona deve ser uma data válida!');
      } else if (dataCarona < new Date()) {
        errors.push('A data da carona não pode ser no passado!');
      }
    }

    // Validação da previsão de término
    if (!previsaoTermino) {
      errors.push('A previsão de término da carona deve ser preenchida!');
    } else {
      const dataTermino = new Date(previsaoTermino);
      if (isNaN(dataTermino.getTime())) {
        errors.push('A previsão de término deve ser uma data válida!');
      }
    }

    // Validação das vagas
    if (!vagas) {
      errors.push('O número de vagas deve ser preenchido!');
    } else {
      vagas = Number(vagas);
      if (isNaN(vagas)) {
        errors.push('O número de vagas deve ser um número!');
      } else if (vagas < 1 || vagas > 4) {
        errors.push('A quantidade de vagas deve ser entre 1 e 4!');
      }
    }

    // Validação do preço
    if (!preco) {
      errors.push('O preço da carona deve ser preenchido!');
    } else {
      preco = Number(preco);
      if (isNaN(preco)) {
        errors.push('O preço deve ser um número!');
      } else if (preco < 0) {
        errors.push('O preço não pode ser negativo!');
      }
    }

    // Validação do veículo
    if (!veiculoId) {
      errors.push('O veículo deve ser selecionado!');
    }

    // Validação da origem
    if (!origemId) {
      errors.push('A cidade de origem deve ser selecionada!');
    }    // Validação do destino
    if (!destinoId) {
      errors.push('A cidade de destino deve ser selecionada!');
    }

    // Se houver erros de validação, retorna todos eles
    if (errors.length > 0) {
      throw errors.join('\n');
    }

    // Busca o veículo para obter o motorista
    const veiculo = await Veiculo.findByPk(veiculoId);
    if (!veiculo) throw "Veículo não encontrado!";
    const motoristaId = veiculo.motoristaId;
    req.body.motorista = { id: motoristaId };

    // Verifica as regras de negócio
    await this.verificarRegrasDeNegocio(req);

    const t = await sequelize.transaction();
    try {
      const obj = await OferecimentoCarona.create(
        { data, previsaoTermino, vagas, preco, veiculoId, origemId, destinoId, motoristaId },
        { transaction: t }
      );
      await t.commit();
      return await OferecimentoCarona.findByPk(obj.id, { include: { all: true, nested: true } });
    } catch (error) {
      await t.rollback();
      console.error(error);
      throw "Erro ao criar o oferecimento de carona!";
    }
  }

  static async update(req) {
    const { id } = req.params;
    const { data, previsaoTermino, vagas, preco, veiculoId, origemId, destinoId } = req.body;
    const obj = await OferecimentoCarona.findByPk(id, { include: { all: true, nested: true } });
    if (obj == null) throw 'Oferecimento de carona não encontrado!';
    Object.assign(obj, { data, previsaoTermino, vagas, preco, veiculoId, origemId, destinoId });
    await obj.save();
    return await OferecimentoCarona.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await OferecimentoCarona.findByPk(id);
    if (obj == null)
      throw 'Oferecimento de carona não encontrado!';
    await obj.destroy();
    return obj;
  }

  static async getRelatorioCaronasOfertadas(req) {
    const { data, origemId, destinoId } = req.query;

    const query = `
      SELECT 
        oc.id as carona_id,
        m.nome as motorista,
        oc.data as horario_saida,
        oc.preco as valor,
        co.nome_cidade as origem,
        cd.nome_cidade as destino
      FROM oferecimentoCarona oc
      INNER JOIN motoristas m ON m.id = oc.motorista_id
      INNER JOIN cidades co ON co.id = oc.origem_id
      INNER JOIN cidades cd ON cd.id = oc.destino_id
      WHERE DATE(oc.data) = DATE(:data)
      ${origemId ? 'AND oc.origem_id = :origemId' : ''}
      ${destinoId ? 'AND oc.destino_id = :destinoId' : ''}
      AND oc.vagas > 0
      ORDER BY oc.data ASC`;

    const relatorio = await sequelize.query(query, {
      replacements: {
        data: new Date(data),
        origemId,
        destinoId
      },
      type: QueryTypes.SELECT
    });

    return relatorio;
  }

  static async verificarRegrasDeNegocio(req) {
    const { data, previsaoTermino, motorista } = req.body;
    const dataCarona = new Date(data);

    // Regra 1: O Motorista não pode oferecer mais que quatro Caronas no mesmo dia
    const dataSomenteDia = dataCarona.toISOString().slice(0, 10);
    const totalCaronasDia = await OferecimentoCarona.count({
      where: {
        motoristaId: motorista.id,
        data: {
          [Op.gte]: new Date(dataSomenteDia + "T00:00:00.000Z"),
          [Op.lt]: new Date(dataSomenteDia + "T23:59:59.999Z")
        }
      }
    });

    if (totalCaronasDia >= 4) {
      throw "O motorista não pode oferecer mais que quatro caronas no mesmo dia!";
    }

    // Regra 2: O Motorista não pode oferecer uma Carona até que a anterior seja finalizada
    const agora = new Date();
    const caronasEmAberto = await OferecimentoCarona.findAll({
      where: {
        motoristaId: motorista.id,
        data: { [Op.lt]: agora },
        previsaoTermino: { [Op.gt]: agora }
      }
    });

    if (caronasEmAberto.length > 0) {
      throw "O motorista possui uma carona em andamento e não pode oferecer outra até finalizá-la!";
    }

    return true;
  }
}

export { OferecimentoCaronaService };