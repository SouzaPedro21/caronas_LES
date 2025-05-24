import { Model, DataTypes } from 'sequelize';
//HELIO BREDA NETTO
class Cliente extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O nome do cliente deve ser preenchido!" },
          notEmpty: { msg: "O nome do cliente deve ser preenchido!" },
          len: { args: [2, 50], msg: "O nome do cliente deve ter entre 2 e 50 letras!" }
        }
      },
      cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O CPF do cliente deve ser preenchido!" },
          notEmpty: { msg: "O CPF do cliente deve ser preenchido!" },
          is: { args: ["[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}\\-[0-9]{2}"], msg: "O CPF do cliente deve seguir o padrão NNN.NNN.NNN-NN!" }
        }
      },
      sexo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O sexo do cliente deve ser preenchido!" },
          notEmpty: { msg: "O sexo do cliente deve ser preenchido!" },
          isIn: {
            args: [['M', 'F']],
            msg: "O sexo do cliente deve ser M (Masculino) ou F (Feminino)!"
          }
        }
      },
      telefone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O telefone do cliente deve ser preenchido!" },
          notEmpty: { msg: "O telefone do cliente deve ser preenchido!" },
          is: { args: ["[0-9]{2} [0-9]{5}\\-[0-9]{4}"], msg: "O telefone deve seguir o padrão XX XXXXX-XXXX!" }
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