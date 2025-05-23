import { AceiteCarona } from "../models/AceiteCarona.js";
import { Cliente } from "../models/Cliente.js";
import { OferecimentoCarona } from "../models/OferecimentoCarona.js";
import { Op } from "sequelize";

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
    
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) throw "Cliente não encontrado!";
    
    const oferecimentoCarona = await OferecimentoCarona.findByPk(oferecimentoCaronaId);
    if (!oferecimentoCarona) throw "Carona não encontrada!";
    
    // Adiciona os objetos completos ao req.body
    req.body.cliente = cliente;
    req.body.oferecimentoCarona = oferecimentoCarona;

    // Verifica as regras de negócio
    const validacao = await this.verificarRegrasDeNegocio(req);
    if (!validacao) throw "Não foi possível validar as regras de negócio!";

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
    Object.assign(obj, { clienteId, oferecimentoCaronaId });
    await obj.save();
    return await AceiteCarona.findByPk(obj.id, { include: { all: true, nested: true } });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await AceiteCarona.findByPk(id);
    if (obj == null)
      throw 'AceiteCarona não encontrada!';
    await obj.destroy();
    return obj;
  }

  static async verificarRegrasDeNegocio(req) {
    const { cliente, oferecimentoCarona } = req.body;

    // Busca todas as caronas aceitas pelo cliente
    const caronasAgendadas = await AceiteCarona.findAll({
      where: { clienteId: cliente.id },
      include: [{
        model: OferecimentoCarona,  // Mudança aqui: usar model ao invés de association
        as: 'oferecimentoCarona',
        required: true  // Garante que só trará registros com oferecimentoCarona
      }]
    });

    const inicioNova = new Date(oferecimentoCarona.data);
    const terminoNova = new Date(oferecimentoCarona.previsaoTermino);

    console.log('Nova carona:', {
      inicio: inicioNova,
      termino: terminoNova
    });

    for (let agendada of caronasAgendadas) {
      const inicioExistente = new Date(agendada.oferecimentoCarona.data);
      const terminoExistente = new Date(agendada.oferecimentoCarona.previsaoTermino);

      console.log('Carona existente:', {
        inicio: inicioExistente,
        termino: terminoExistente
      });

      // Lógica simplificada e mais rigorosa
      if (inicioNova <= terminoExistente && terminoNova >= inicioExistente) {
        throw `Conflito de horário detectado:\n` +
        `Carona existente: ${inicioExistente.toLocaleTimeString()} até ${terminoExistente.toLocaleTimeString()}\n` +
        `Nova carona: ${inicioNova.toLocaleTimeString()} até ${terminoNova.toLocaleTimeString()}`;
      }
    }

    // Regra de Negócio 2: O Cliente não pode aceitar mais que quatro Caronas no mesmo dia
    const dataDia = new Date(oferecimentoCarona.data).toISOString().slice(0, 10);
    const caronasMesmoDia = caronasAgendadas.filter(agendada => {
      if (!agendada.oferecimentoCarona) return false;
      const dataAgendada = new Date(agendada.oferecimentoCarona.data).toISOString().slice(0, 10);
      return dataAgendada === dataDia;
    });
    if (caronasMesmoDia.length >= 4) {
      throw "O cliente não pode aceitar mais que quatro caronas no mesmo dia!";
    }
    return true;
  }
}

export { AceiteCaronaService };