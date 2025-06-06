import { Cliente } from "../models/Cliente.js";
import sequelize from "../config/database-connection.js";
//HELIO BREDA NETTO

class ClienteService {
  static async findAll() {
    const objs = await Cliente.findAll({ include: { all: true, nested: true } });
    return objs;
  }

  static async findByPk(req) {
    const { id } = req.params;
    const obj = await Cliente.findByPk(id, { include: { all: true, nested: true } });
    return obj;
  }

  static async create(req) {
    const { nome, cpf, sexo, telefone, nota } = req.body;
    const obj = await Cliente.create({ nome, cpf, sexo, telefone, nota });
    return await Cliente.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, cpf, sexo, telefone, nota } = req.body;
    const obj = await Cliente.findByPk(id, { include: { all: true, nested: true } });
    if (obj == null) throw 'Cliente não encontrado!';
    const t = await sequelize.transaction();
    try {
      Object.assign(obj, { nome, cpf, sexo, telefone, nota });
      await obj.save({ transaction: t });
      await t.commit();
      return await Cliente.findByPk(obj.id, { include: { all: true, nested: true } });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Cliente.findByPk(id);
    if (obj == null) throw 'Cliente não encontrado!';
    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      throw "Não é possível remover um cliente associado a caronas pendentes!";
    }
  }
}

export { ClienteService };