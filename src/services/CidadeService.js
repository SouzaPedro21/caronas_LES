import { Cidade } from "../models/Cidade.js";

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

}

export { CidadeService };