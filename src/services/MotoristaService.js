import { Motorista } from "../models/Motorista.js";
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

}

export { MotoristaService };