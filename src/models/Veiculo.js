import { Model, DataTypes } from 'sequelize';
//PEDRO HENRIQUE BRAIDO DE SOUZA
class Veiculo extends Model {
  static init(sequelize) {
    super.init({
      placa: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "A placa do veículo deve ser preenchida!" },
          notEmpty: { msg: "A placa do veículo deve ser preenchida!" },
          is: { args: ["[A-Z]{3}-[0-9]{1}[0-Z]{1}[0-9]{2}"], msg: "A placa do veículo deve seguir o padrão AAA-9999!" }
        }
      },
      marca: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "A marca do veículo deve ser preenchida!" },
          notEmpty: { msg: "A marca do veículo deve ser preenchida!" },
          len: { args: [2, 50], msg: "A marca do veículo deve ter entre 2 e 50 letras!" }
        }
      },
      modelo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O modelo do veículo deve ser preenchido!" },
          notEmpty: { msg: "O modelo do veículo deve ser preenchido!" },
          len: { args: [2, 50], msg: "O modelo do veículo deve ter entre 2 e 50 letras!" }
        }
      },
      chassi: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "O chassi do veículo deve ser preenchido!" },
          notEmpty: { msg: "O chassi do veículo deve ser preenchido!" },
          len: { args: [2, 50], msg: "O chassi do veículo deve ter entre 2 e 50 letras!" }
        }
      }
    }, { sequelize, modelName: 'Veiculo', tableName: 'veiculos' })
  }

  static associate(models) {
    this.belongsTo(models.Motorista, { 
      as: 'motorista', 
      foreignKey: { 
        name: 'motoristaId', 
        allowNull: false,
        validate: { 
          notNull: { msg: 'O motorista do veículo deve ser preenchido!' } 
        } 
      } 
    });
  }
}

export { Veiculo };