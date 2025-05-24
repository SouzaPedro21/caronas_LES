import { AceiteCaronaService } from "../services/AceiteCaronaService.js";
//PEDRO HENRIQUE BRAIDO DE SOUZA

class AceiteCaronaController {
  
  static async findAll(req, res, next) {
    AceiteCaronaService.findAll()
        .then(objs => res.json(objs))
        .catch(next);
  }

  static async findByPk(req, res, next) {
    AceiteCaronaService.findByPk(req)
        .then(obj => res.json(obj))
        .catch(next);
  }

  static async create(req, res, next) {
    AceiteCaronaService.create(req)
        .then(obj => res.json(obj))
        .catch(next);
  }

  static async update(req, res, next) {
    AceiteCaronaService.update(req)
        .then(obj => res.json(obj))
        .catch(next);
  }

  static async delete(req, res, next) {
    AceiteCaronaService.delete(req)
        .then(obj => res.json(obj))
        .catch(next);
  }

}

export { AceiteCaronaController };