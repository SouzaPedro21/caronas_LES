import { OferecimentoCarona } from "../models/OferecimentoCarona.js";
import { Veiculo } from "../models/Veiculo.js";
import { Op } from "sequelize";
import sequelize from "../config/database-connection.js";

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
    vagas = Number(vagas);
    if (isNaN(vagas) || vagas < 1 || vagas > 4) {
      throw "A quantidade de vagas deve ser entre 1 e 4!";
    }
    const veiculo = await Veiculo.findByPk(veiculoId);
    if (!veiculo) throw "Veículo não encontrado!";
    const motoristaId = veiculo.motoristaId;
    req.body.motorista = { id: motoristaId };

    await this.verificarRegrasDeNegocio(req); // Não precisa de if, pois lança erro se inválido

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
      console.error(error); // Veja o erro real no console
      throw "Erro ao criar o oferecimento de carona!";
    }
  }

  static async update(req) {
    const { id } = req.params;
    const { data, previsaoTermino, vagas, preco, veiculoId, origemId, destinoId } = req.body;
    const obj = await OferecimentoCarona.findByPk(id, { include: { all: true, nested: true } });
    Object.assign(obj, { data, previsaoTermino, vagas, preco, veiculoId, origemId, destinoId });
    await obj.save();
    return await OferecimentoCarona.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await OferecimentoCarona.findByPk(id);
    await obj.destroy();
    return obj;
  }

  static async verificarRegrasDeNegocio(req) {
    const { data, previsaoTermino, motorista } = req.body;

    // Regra 1: O Motorista não pode oferecer uma Carona até que a anterior seja finalizada
    // Busca caronas do motorista que ainda não foram finalizadas (previsaoTermino > agora)
    const caronasEmAberto = await OferecimentoCarona.findAll({
      where: {
        motoristaId: motorista.id,
        previsaoTermino: { [Op.gt]: new Date() }
      }
    });

    if (caronasEmAberto.length > 0) {
      throw "O motorista possui uma carona em andamento e não pode oferecer outra até finalizá-la!";
    }
    // Regra 2: O Motorista não pode oferecer mais que quatro Caronas no mesmo dia
    // Considera todas as caronas do motorista com a mesma data (ignorando hora)
    const dataSomenteDia = new Date(data).toISOString().slice(0, 10); // "YYYY-MM-DD"
    const totalCaronasDia = await OferecimentoCarona.count({
      where: {
        motoristaId: motorista.id,
        data: {
          [Op.gte]: new Date(dataSomenteDia + "T00:00:00"),
          [Op.lt]: new Date(dataSomenteDia + "T23:59:59")
        }
      }
    });
    if (totalCaronasDia >= 4) {
      throw "O motorista não pode oferecer mais que quatro caronas no mesmo dia!";
    }
    return true;
  }
}

export { OferecimentoCaronaService };