import { Model, DataTypes } from 'sequelize';
//PEDRO HENRIQUE BRAIDO DE SOUZA
class Veiculo extends Model {

  static init(sequelize) {
    super.init({
      placa: { 
        type: DataTypes.STRING, 
        validate: {
          notEmpty: { msg: "Placa do Veículo deve ser preenchida!" },
          is: {args: ["[A-Z]{3}-[0-9]{1}[0-Z]{1}[0-9]{2}"], msg: "Placa do Veículo deve seguir o padrão AAA-9999!" },
        }
      },
      marca: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Marca do Veículo deve ser preenchida!" },
          len: { args: [2, 50], msg: "Marca do Veículo deve ter entre 2 e 50 letras!" }
        }
      },
      modelo: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Modelo do Veículo deve ser preenchido!" },
          len: { args: [2, 50], msg: "Modelo do Veículo deve ter entre 2 e 50 letras!" }
        }
      },
      chassi: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Chassis do Veículo deve ser preenchido!" },
          len: { args: [2, 50], msg: "Chassis do Veículo deve ter entre 2 e 50 letras!" }
        }
      }
      
    }, { sequelize, modelName: 'Veiculo', tableName: 'veiculos' })
  }
  static associate(models) {
    this.belongsTo(models.Motorista, { as: 'motorista', foreignKey: { name: 'motoristaId', allowNull: false, validate: { notNull: { msg: 'Motorista tem que ser preenchido' } } } });
}
}

export { Veiculo };