import Sequelize from 'sequelize';
import { databaseConfig } from "./database-config.js";

import { Cidade } from '../models/Cidade.js';
import { Cliente } from '../models/Cliente.js';
import { Veiculo } from '../models/Veiculo.js';
import { Motorista } from '../models/Motorista.js';
import { OferecimentoCarona } from '../models/OferecimentoCarona.js';
import { AceiteCarona } from '../models/AceiteCarona.js';
import * as fs from 'fs';

const sequelize = new Sequelize(databaseConfig);

Cidade.init(sequelize);
Cliente.init(sequelize);
Veiculo.init(sequelize);
Motorista.init(sequelize);
OferecimentoCarona.init(sequelize);
AceiteCarona.init(sequelize);

Cidade.associate(sequelize.models);
Cliente.associate(sequelize.models);
Veiculo.associate(sequelize.models);
Motorista.associate(sequelize.models);
OferecimentoCarona.associate(sequelize.models);
AceiteCarona.associate(sequelize.models);

databaseInserts(); // comentar quando estiver em ambiente de produção (não criar tabelas e não inserir registros de teste)

function databaseInserts() {
    (async () => {

        await sequelize.sync({ force: true }); 

        await Cidade.create({ nomeCidade: "Alegre", uf: "ES", codigo: "3200201" });
        await Cidade.create({ nomeCidade: "Cachoeiro de Itapemirim", uf: "ES", codigo: "3201209" });
        await Cidade.create({ nomeCidade: "Castelo", uf: "ES", codigo: "3201407" });
        await Cidade.create({ nomeCidade: "Jerônimo Monteiro", uf: "ES", codigo: "3203106" });

        await Cliente.create({ nome: "Cristiano", cpf: "111.111.111-11", sexo: "M", telefone: "89 12345-6789", nota: "0" });
        await Cliente.create({ nome: "Messi", cpf: "222.222.222-22", sexo: "F", telefone: "09 22345-6789", nota: "0" });
        await Cliente.create({ nome: "Neymar", cpf: "111.111.111-11", sexo: "M", telefone: "89 32345-6789", nota: "0" });
        await Cliente.create({ nome: "Arrascaeta", cpf: "222.222.222-22", sexo: "M", telefone: "09 42345-6789", nota: "0" });

        await Motorista.create({ nome: "Cristiano", cpf: "111.111.111-11", sexo: "M", telefone: "89 12345-6789", cnh: "12345678910", nota: "0" });
        await Motorista.create({ nome: "Messi", cpf: "222.222.222-22", sexo: "F", telefone: "09 22345-6789", cnh: "12345678911", nota: "0" });
        await Motorista.create({ nome: "Neymar", cpf: "111.111.111-11", sexo: "M", telefone: "89 32345-6789", cnh: "12345678912", nota: "0" });
        await Motorista.create({ nome: "Arrascaeta", cpf: "222.222.222-22", sexo: "M", telefone: "09 42345-6789", cnh: "12345678913", nota: "0" });

        await Veiculo.create({ motoristaId: 1, placa: "ABC-1A34", marca: "Volkswagen", modelo: "Gol", chassi: "1234567890" });
        await Veiculo.create({ motoristaId: 2, placa: "DEF-5678", marca: "Chevrolet", modelo: "Corsa", chassi: "0987654321" });
        await Veiculo.create({ motoristaId: 3, placa: "GHI-9012", marca: "Ford", modelo: "Fiesta", chassi: "1122334455" });
        await Veiculo.create({ motoristaId: 4, placa: "JKL-3456", marca: "Fiat", modelo: "Palio", chassi: "5566778899" });
    
        let veiculo = await Veiculo.findByPk(1);
        await OferecimentoCarona.create({ veiculoId: 1, origemId: 1, destinoId: 2, data: "2023-10-01T10:00:00.000Z", previsaoTermino: "2023-10-01T11:30:00.000Z", vagas: 4, preco: 10.0, motoristaId: veiculo.motoristaId });
        veiculo = await Veiculo.findByPk(2);
        await OferecimentoCarona.create({ veiculoId: 2, origemId: 2, destinoId: 3, data: "2023-10-02T11:00:00.000Z", previsaoTermino: "2023-10-01T12:30:00.000Z", vagas: 4, preco: 20.0, motoristaId: veiculo.motoristaId });
        veiculo = await Veiculo.findByPk(3);
        await OferecimentoCarona.create({ veiculoId: 3, origemId: 3, destinoId: 4, data: "2023-10-03T12:00:00.000Z", previsaoTermino: "2023-10-01T13:30:00.000Z", vagas: 4, preco: 30.0, motoristaId: veiculo.motoristaId });
        veiculo = await Veiculo.findByPk(4);
        await OferecimentoCarona.create({ veiculoId: 4, origemId: 4, destinoId: 1, data: "2023-10-04T13:00:00.000Z", previsaoTermino: "2023-10-01T14:30:00.000Z", vagas: 4, preco: 40.0, motoristaId: veiculo.motoristaId });

        await AceiteCarona.create({ clienteId: 1, oferecimentoCaronaId: 1});
        await AceiteCarona.create({ clienteId: 2, oferecimentoCaronaId: 1});
        await AceiteCarona.create({ clienteId: 3, oferecimentoCaronaId: 1});
        await AceiteCarona.create({ clienteId: 4, oferecimentoCaronaId: 1});
    })();
}

export default sequelize;