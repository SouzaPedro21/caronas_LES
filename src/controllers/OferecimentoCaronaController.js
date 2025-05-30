import { OferecimentoCaronaService } from "../services/OferecimentoCaronaService.js";
//HELIO BREDA NETTO

class OferecimentoCaronaController {
  
  static async findAll(req, res, next) {
    OferecimentoCaronaService.findAll()
        .then(objs => res.json(objs))
        .catch(next);
  }

  static async findByPk(req, res, next) {
    OferecimentoCaronaService.findByPk(req)
        .then(obj => res.json(obj))
        .catch(next);
  }

  static async create(req, res, next) {
    OferecimentoCaronaService.create(req)
        .then(obj => res.json(obj))
        .catch(next);
  }

  static async update(req, res, next) {
    OferecimentoCaronaService.update(req)
        .then(obj => res.json(obj))
        .catch(next);
  }

  static async delete(req, res, next) {
    OferecimentoCaronaService.delete(req)
        .then(obj => res.json(obj))
        .catch(next);
  }

  static async getRelatorioCaronasOfertadas(req, res, next) {
    OferecimentoCaronaService.getRelatorioCaronasOfertadas(req)
        .then(relatorio => res.json(relatorio))
        .catch(next);
  }

}

export { OferecimentoCaronaController };