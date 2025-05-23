import express from "express";

import { CidadeController } from './controllers/CidadeController.js';
import { ClienteController } from './controllers/ClienteController.js';
import { VeiculoController } from './controllers/VeiculoController.js';
import { MotoristaController } from './controllers/MotoristaController.js';
import { OferecimentoCaronaController } from './controllers/OferecimentoCaronaController.js';
import { AceiteCaronaController } from './controllers/AceiteCaronaController.js';

const routes = express.Router();


routes.get('/cidades', CidadeController.findAll);
routes.get('/cidades/:id', CidadeController.findByPk);
routes.post('/cidades', CidadeController.create);
routes.put('/cidades/:id', CidadeController.update);
routes.delete('/cidades/:id', CidadeController.delete);

routes.get('/clientes', ClienteController.findAll);
routes.get('/clientes/:id', ClienteController.findByPk);
routes.post('/clientes', ClienteController.create);
routes.put('/clientes/:id', ClienteController.update);
routes.delete('/clientes/:id', ClienteController.delete);

routes.get('/veiculos', VeiculoController.findAll);
routes.get('/veiculos/:id', VeiculoController.findByPk);
routes.post('/veiculos', VeiculoController.create);
routes.put('/veiculos/:id', VeiculoController.update);
routes.delete('/veiculos/:id', VeiculoController.delete);

routes.get('/motoristas', MotoristaController.findAll);
routes.get('/motoristas/:id', MotoristaController.findByPk);
routes.post('/motoristas', MotoristaController.create);
routes.put('/motoristas/:id', MotoristaController.update);
routes.delete('/motoristas/:id', MotoristaController.delete);

routes.get('/oferecimentoCarona', OferecimentoCaronaController.findAll);
routes.get('/oferecimentoCarona/:id', OferecimentoCaronaController.findByPk);
routes.post('/oferecimentoCarona', OferecimentoCaronaController.create);
routes.put('/oferecimentoCarona/:id', OferecimentoCaronaController.update);
routes.delete('/oferecimentoCarona/:id', OferecimentoCaronaController.delete);

routes.get('/aceiteCarona', AceiteCaronaController.findAll);
routes.get('/aceiteCarona/:id', AceiteCaronaController.findByPk);
routes.post('/aceiteCarona', AceiteCaronaController.create);
routes.put('/aceiteCarona/:id', AceiteCaronaController.update);
routes.delete('/aceiteCarona/:id', AceiteCaronaController.delete);

export default routes;