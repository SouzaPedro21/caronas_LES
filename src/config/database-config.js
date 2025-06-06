/*
// Configuração do banco de dados no ambiente de teste
export const databaseConfig = {
  dialect: 'sqlite',
  storage: 'database.sqlite',
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  }
};
*/

// Configuração do banco de dados no ambiente de desenvolvimento
/*export const databaseConfig = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'bd',
  database: 'db_caronas',
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  }
};
*/

// Configuração do banco de dados no ambiente de produção
export const databaseConfig = {
  dialect: 'postgres',
  host: 'dpg-d11f8jc9c44c73f95ik0-a.oregon-postgres.render.com',
  username: 'db_caronas_user',
  password: 'OJdkdgOQVg8heTa2IdHKt4LrVKOY9P9c',
  database: 'db_caronas',
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  },
  dialectOptions: {
    ssl: true
  }
};