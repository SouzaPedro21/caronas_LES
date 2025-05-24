import { AceiteCarona } from "../models/AceiteCarona.js";
import { Cliente } from "../models/Cliente.js";
import { OferecimentoCarona } from "../models/OferecimentoCarona.js";
import { Op } from "sequelize";
import sequelize from "../config/database-connection.js";
//PEDRO HENRIQUE BRAIDO DE SOUZA

class AceiteCaronaService {
  static async findAll() {
    const objs = await AceiteCarona.findAll({ include: { all: true, nested: true } });
    return objs;
  }

  static async findByPk(req) {
    const { id } = req.params;
    const obj = await AceiteCarona.findByPk(id, { include: { all: true, nested: true } });
    return obj;
  }

  static async create(req) {
    const { clienteId, oferecimentoCaronaId } = req.body;
    const errors = [];
    
    // Validação dos campos obrigatórios
    if (!clienteId) {
      errors.push('O ID do cliente deve ser preenchido!');
    }
    
    if (!oferecimentoCaronaId) {
      errors.push('O ID da carona deve ser preenchido!');
    }

    // Se houver erros de validação, retorna todos eles
    if (errors.length > 0) {
      throw errors.join('\n');
    }
    
    // Busca o cliente e a carona para validação
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) throw "Cliente não encontrado!";
    
    const oferecimentoCarona = await OferecimentoCarona.findByPk(oferecimentoCaronaId);
    if (!oferecimentoCarona) throw "Carona não encontrada!";
    
    // Adiciona os objetos completos ao req.body para as regras de negócio
    req.body.cliente = cliente;
    req.body.oferecimentoCarona = oferecimentoCarona;

    // Verifica as regras de negócio
    await this.verificarRegrasDeNegocio(req);

    // Verifica vagas disponíveis
    if (oferecimentoCarona.vagas <= 0) {
      throw "Não há vagas disponíveis para esta carona!";
    }

    try {
      // Inicia uma transação
      const t = await sequelize.transaction();
      
      try {
        // Atualiza as vagas
        oferecimentoCarona.vagas -= 1;
        await oferecimentoCarona.save({ transaction: t });

        // Cria o aceite
        const obj = await AceiteCarona.create(
          { clienteId, oferecimentoCaronaId },
          { transaction: t }
        );

        await t.commit();
        
        return await AceiteCarona.findByPk(obj.id, { 
          include: { all: true, nested: true } 
        });
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Erro ao criar aceite:', error);
      throw "Erro ao criar o aceite de carona!";
    }
  }

  static async update(req) {
    const { id } = req.params;
    const { clienteId, oferecimentoCaronaId } = req.body;
    const obj = await AceiteCarona.findByPk(id, { include: { all: true, nested: true } });
    if (obj == null) throw 'Aceite de carona não encontrado!';
    Object.assign(obj, { clienteId, oferecimentoCaronaId });
    await obj.save();
    return await AceiteCarona.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await AceiteCarona.findByPk(id);
    if (obj == null)
      throw 'Aceite de carona não encontrado!';
    await obj.destroy();
    return obj;
  }

  static async verificarRegrasDeNegocio(req) {
    const { cliente, oferecimentoCarona } = req.body;

    // Busca todas as caronas aceitas pelo cliente
    const caronasAgendadas = await AceiteCarona.findAll({
      where: { clienteId: cliente.id },
      include: [{
        model: OferecimentoCarona,
        as: 'oferecimentoCarona',
        required: true
      }]
    });

    const inicioNova = new Date(oferecimentoCarona.data);
    const terminoNova = new Date(oferecimentoCarona.previsaoTermino);

    // Regra de Negócio 1: O Cliente não pode aceitar duas Caronas com horários sobrepostos
    for (let agendada of caronasAgendadas) {
      const inicioExistente = new Date(agendada.oferecimentoCarona.data);
      const terminoExistente = new Date(agendada.oferecimentoCarona.previsaoTermino);

      // Verifica se há sobreposição de horários
      if ((inicioNova >= inicioExistente && inicioNova < terminoExistente) ||
          (terminoNova > inicioExistente && terminoNova <= terminoExistente) ||
          (inicioNova <= inicioExistente && terminoNova >= terminoExistente)) {
        throw "Não é possível aceitar esta carona pois existe conflito de horário com outra carona já aceita";
      }
    }

    // Regra de Negócio 2: O Cliente não pode aceitar mais que quatro Caronas no mesmo dia
    const dataDia = new Date(oferecimentoCarona.data).toISOString().slice(0, 10);
    const caronasMesmoDia = caronasAgendadas.filter(agendada => {
      const dataAgendada = new Date(agendada.oferecimentoCarona.data).toISOString().slice(0, 10);
      return dataAgendada === dataDia;
    });

    if (caronasMesmoDia.length >= 4) {
      throw "O cliente não pode aceitar mais que quatro caronas no mesmo dia!";
    }
  }
}

export { AceiteCaronaService };