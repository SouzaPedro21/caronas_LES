import { Model } from 'sequelize';
//PEDRO HENRIQUE BRAIDO DE SOUZA
class AceiteCarona extends Model {

  static init(sequelize) {
    super.init({
    }, { sequelize, modelName: 'AceiteCarona', tableName: 'aceiteCarona' })
  }

static associate(models) {
    this.belongsTo(models.Cliente, {as: 'cliente', foreignKey: {name: 'clienteId' , allowNull: false, validate: {notNull: {msg: 'Cliente deve ser preenchido!'}}}});
    this.belongsTo(models.OferecimentoCarona, {as: 'oferecimentoCarona', foreignKey: {name: 'oferecimentoCaronaId' , allowNull: false, validate: {notNull: {msg: 'Carona deve ser selecionada!'}}}});
  }
}

export { AceiteCarona };