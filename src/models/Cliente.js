import { Model, DataTypes } from 'sequelize';
//HELIO BREDA NETTO
class Cliente extends Model {

  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Nome do Cliente deve ser preenchido!" },
          len: { args: [2, 50], msg: "Nome do Cliente deve ter entre 2 e 50 letras!" }
        }
      },

      cpf: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "CPF do Cliente deve ser preenchido!" },
          is: { args: ["[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}"], msg: "CPF do Cliente deve seguir o padrão NNN.NNN.NNN-NN!" },
        }
      },

      sexo: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Sexo do Cliente deve ser preenchido!" },
          len: { args: [1, 1], msg: "Sexo do Cliente deve ser M (Masculino) ou F (Feminino)!" }
        }
      },

      telefone: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Telefone do Cliente deve ser preenchido!" },
          is: { args: ["[0-9]{2} [0-9]{5}\-[0-9]{4}"], msg: "Telefone deve seguir o padrão XX XXXXX-XXXX!" }
        }
      },

      nota: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      }

    }, { sequelize, modelName: 'Cliente', tableName: 'clientes' })
  }
  static associate(models) {
    //this.hasMany(models.aceiteCarona, { as: 'aceiteCarona', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}

export { Cliente };