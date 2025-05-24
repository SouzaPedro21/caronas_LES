import { Model, DataTypes } from 'sequelize';
//HELIO BREDA NETTO
class Cidade extends Model {
  static init(sequelize) {
    super.init({
      nomeCidade: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O nome da cidade deve ser preenchido!" },
          notEmpty: { msg: "O nome da cidade deve ser preenchido!" },
          len: { args: [2, 50], msg: "O nome da cidade deve ter entre 2 e 50 letras!" }
        }
      },
      uf: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "A UF deve ser preenchida!" },
          notEmpty: { msg: "A UF deve ser preenchida!" },
          len: { args: [2, 2], msg: "A UF deve seguir o padrão XX (2 letras)!" },
          isUppercase: { msg: "A UF deve estar em maiúsculas!" }
        }
      },
      codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O código deve ser preenchido!" },
          notEmpty: { msg: "O código deve ser preenchido!" },
          len: { args: [7, 7], msg: "O código deve ter exatamente 7 caracteres!" },
          isNumeric: { msg: "O código deve conter apenas números!" }
        }
      }
    }, { sequelize, modelName: 'Cidade', tableName: 'cidades' })
  }

  static associate(models) {
    //this.hasMany(models.oferecimentoCarona, { as: 'oferecimentoCarona', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}

export { Cidade };