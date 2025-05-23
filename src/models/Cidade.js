import { Model, DataTypes } from 'sequelize';
//HELIO BREDA NETTO
class Cidade extends Model {

  static init(sequelize) {
    super.init({
      nomeCidade: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Nome da Cidade deve ser preenchido!" },
          len: { args: [2, 50], msg: "Nome da Cidade deve ter entre 2 e 50 letras!" }
        }
      },
      uf: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "a UF deve ser preenchida" },
          len: { args: [2, 50], msg: "A UF deve seguir o padrão (XX)" }
        }
      },
      codigo: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "O codigo deve ser preenchida" },
          len: { args: [2, 50], msg: "Codigo deve ter o padrão (xxxxxxx)" }
        }
      },


    }, { sequelize, modelName: 'Cidade', tableName: 'cidades' })
  }
  static associate(models) {
    //this.hasMany(models.oferecimentoCarona, { as: 'oferecimentoCarona', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}

export { Cidade };