import { Model, DataTypes } from 'sequelize';
//PEDRO HENRIQUE BRAIDO DE SOUZA
class Motorista extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O nome do motorista deve ser preenchido!" },
          notEmpty: { msg: "O nome do motorista deve ser preenchido!" },
          len: { args: [2, 50], msg: "O nome do motorista deve ter entre 2 e 50 letras!" }
        }
      },
      cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O CPF do motorista deve ser preenchido!" },
          notEmpty: { msg: "O CPF do motorista deve ser preenchido!" },
          is: { args: ["[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}\\-[0-9]{2}"], msg: "O CPF do motorista deve seguir o padrão NNN.NNN.NNN-NN!" }
        }
      },
      sexo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O sexo do motorista deve ser preenchido!" },
          notEmpty: { msg: "O sexo do motorista deve ser preenchido!" },
          isIn: {
            args: [['M', 'F']],
            msg: "O sexo do motorista deve ser M (Masculino) ou F (Feminino)!"
          }
        }
      },
      telefone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O telefone do motorista deve ser preenchido!" },
          notEmpty: { msg: "O telefone do motorista deve ser preenchido!" },
          is: { args: ["[0-9]{2} [0-9]{5}\\-[0-9]{4}"], msg: "O telefone deve seguir o padrão XX XXXXX-XXXX!" }
        }
      },
      cnh: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "A CNH do motorista deve ser preenchida!" },
          notEmpty: { msg: "A CNH do motorista deve ser preenchida!" },
          is: { args: ["[0-9]{11}"], msg: "A CNH do motorista deve seguir o padrão 00000000000!" }
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