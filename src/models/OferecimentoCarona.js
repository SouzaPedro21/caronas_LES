import { Model, DataTypes } from 'sequelize';
//HELIO BREDA NETTO
class OferecimentoCarona extends Model {

    static init(sequelize) {
        super.init({

            data: {
                type: DataTypes.DATE,
                validate: {
                    notEmpty: { msg: "Data da carona deve ser preenchida" },
                    isDate: { msg: "Data da carona deve ser uma data" }
                }
            },            previsaoTermino: {
                type: DataTypes.DATE,
                validate: {
                    notEmpty: { msg: "Previsão de término da carona deve ser preenchida" },
                    isDate: { msg: "Previsão de término da carona deve ser uma data" },                    isAfterData(value) {
                        const dataInicio = this.dataValues.data || this.data;
                        if (dataInicio) {
                            const dataInicioDate = new Date(dataInicio);
                            const dataTerminoDate = new Date(value);
                            
                            if (dataTerminoDate <= dataInicioDate) {
                                throw new Error('A previsão de término deve ser posterior à data de início da carona');
                            }
                        }
                    }
                }
            },
            vagas: {
                type: DataTypes.INTEGER,
                validate: {
                    notEmpty: { msg: "Número de vagas deve ser preenchido" },
                    isInt: { msg: "Número de vagas deve ser um número inteiro" }
                }
            },
            preco: {
                type: DataTypes.FLOAT,
                validate: {
                    notEmpty: { msg: "Preço da carona deve ser preenchido" },
                    isFloat: { msg: "Preço da carona deve ser um número" }
                }
            },
            motoristaId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: { msg: "Motorista deve ser informado" }
                }
            }

        }, { sequelize, modelName: 'OferecimentoCarona', tableName: 'oferecimentoCarona' })
    }

    static associate(models) {
        this.belongsTo(models.Motorista, { as: 'motorista', foreignKey: { name: 'motoristaId', allowNull: false, validate: { notNull: { msg: 'Motorista deve ser preenchido!' } } } });
        this.belongsTo(models.Veiculo, { as: 'veiculo', foreignKey: { name: 'veiculoId', allowNull: false, validate: { notNull: { msg: 'Veículo tem que ser preenchido' } } } });
        this.belongsTo(models.Cidade, { as: 'origem', foreignKey: { name: 'origemId', allowNull: false, validate: { notNull: { msg: 'Origem deve ser preenchida' } } } });
        this.belongsTo(models.Cidade, { as: 'destino', foreignKey: { name: 'destinoId', allowNull: false, validate: { notNull: { msg: 'Destino deve ser preenchido' } } } });
        //this.hasMany(models.aceiteCarona, { as: 'aceiteCarona', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
}

export { OferecimentoCarona };