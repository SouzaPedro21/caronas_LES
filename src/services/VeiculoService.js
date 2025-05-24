import { Veiculo } from "../models/Veiculo.js";

class VeiculoService {

  static async findAll() {
    const objs = await Veiculo.findAll({ include: { all: true, nested: true } });
    return objs;
  }

  static async findByPk(req) {
    const { id } = req.params;
    const obj = await Veiculo.findByPk(id, { include: { all: true, nested: true } });
    return obj;
  }

  static async create(req) {
    const { placa, marca, modelo, chassi, motoristaId } = req.body;
    const obj = await Veiculo.create({ placa, marca, modelo, chassi, motoristaId });
    return await Veiculo.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async update(req) {
    const { id } = req.params;
    const { placa, marca, modelo, chassi, motoristaId } = req.body;
    const obj = await Veiculo.findByPk(id, { include: { all: true, nested: true } });
    if (obj == null) throw 'Veiculo não encontrado!';
    Object.assign(obj, { placa, marca, modelo, chassi, motoristaId });
    await obj.save();
    return await Veiculo.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Veiculo.findByPk(id);
    if (obj == null)
      throw 'Veiculo não encontrada!';
    await obj.destroy();
    return obj;
  }

}

export { VeiculoService };