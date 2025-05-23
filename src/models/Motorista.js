import { Model, DataTypes } from 'sequelize';
//PEDRO HENRIQUE BRAIDO DE SOUZA
class Motorista extends Model {

  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Nome do Motorista deve ser preenchido!" },
          len: { args: [2, 50], msg: "Nome do Motorista deve ter entre 2 e 50 letras!" }
        }
      },

      cpf: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "CPF do Motorista deve ser preenchido!" },
          is: { args: ["[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}"], msg: "CPF do Cliente deve seguir o padrão NNN.NNN.NNN-NN!" },
        }
      },

      sexo: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Sexo do Motorista deve ser preenchido!" },
          len: { args: [1, 1], msg: "Sexo do Motorista deve ser M (Masculino) ou F (Feminino)!" }
        }
      },

      telefone: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Telefone do Motorista deve ser preenchido!" },
          is: { args: ["[0-9]{2} [0-9]{5}\-[0-9]{4}"], msg: "Telefone deve seguir o padrão XX XXXXX-XXXX!" }
        }
      },

      cnh: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "CNH do Motorista deve ser preenchido!" },
          is: {args: ["[0-9]{11}"], msg: "CNH do Motorista deve seguir o padrão 00000000000!" }
        }
      },

      nota: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      }

    }, { sequelize, modelName: 'Motorista', tableName: 'motoristas' })
  }

  static associate(models) {
    //this.hasMany(models.veiculos, { as: 'veiculos', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    //this.hasMany(models.oferecimentoCarona, { as: 'oferecimentoCarona', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}

export { Motorista };