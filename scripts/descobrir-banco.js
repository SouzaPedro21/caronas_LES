import pg from 'pg';
import { databaseConfig } from '../src/config/database-config.js';

const { Client } = pg;

console.log('🔍 DESCOBRINDO ESTRUTURA DO BANCO');

(async () => {
  let client;
  
  try {
    console.log('🔌 Conectando...');
    client = new Client({
      host: databaseConfig.host,
      port: databaseConfig.port || 5432,
      database: databaseConfig.database,
      user: databaseConfig.username,
      password: databaseConfig.password,
      ssl: databaseConfig.dialectOptions?.ssl || false
    });
    
    await client.connect();
    console.log('✅ CONECTADO!');
    
    // Descobrir todas as tabelas
    console.log('\n📋 DESCOBRINDO TABELAS...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const allTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Tabelas encontradas:');
    allTables.forEach(table => console.log(`  - ${table}`));
    
    if (allTables.length === 0) {
      console.log('❌ Nenhuma tabela encontrada!');
      return;
    }
    
    // Contar registros em cada tabela
    console.log('\n📊 CONTANDO REGISTROS...');
    let totalGeral = 0;
    const dadosTabelas = [];
    
    for (const table of allTables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        const count = parseInt(countResult.rows[0].count);
        totalGeral += count;
        dadosTabelas.push({ nome: table, registros: count });
        
        if (count > 0) {
          console.log(`  ✅ ${table}: ${count} registros`);
        } else {
          console.log(`  ⚪ ${table}: vazia`);
        }
      } catch (error) {
        console.log(`  ❌ ${table}: erro - ${error.message}`);
        dadosTabelas.push({ nome: table, registros: -1 });
      }
    }
    
    console.log(`\n📊 TOTAL GERAL: ${totalGeral} registros`);
    
    // Mostrar apenas tabelas com dados
    const tabelasComDados = dadosTabelas.filter(t => t.registros > 0);
    if (tabelasComDados.length > 0) {
      console.log('\n🎯 TABELAS COM DADOS:');
      tabelasComDados.forEach(t => {
        console.log(`  📦 ${t.nome}: ${t.registros} registros`);
      });
      
      console.log('\n💡 Para limpar essas tabelas, execute:');
      console.log('   node scripts/limpar-especifico.js');
    } else {
      console.log('\n✅ Todas as tabelas estão vazias!');
    }
    
    // Descobrir foreign keys para ordem de limpeza
    console.log('\n🔗 DESCOBRINDO FOREIGN KEYS...');
    const fkResult = await client.query(`
      SELECT 
        tc.table_name as tabela_filho,
        ccu.table_name as tabela_pai,
        tc.constraint_name as constraint_nome
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);
    
    if (fkResult.rows.length > 0) {
      console.log('🔗 Dependências encontradas:');
      fkResult.rows.forEach(fk => {
        console.log(`  ${fk.tabela_filho} → ${fk.tabela_pai}`);
      });
      
      // Sugerir ordem de limpeza
      const filhas = fkResult.rows.map(fk => fk.tabela_filho);
      const pais = fkResult.rows.map(fk => fk.tabela_pai);
      const independentes = allTables.filter(t => !pais.includes(t));
      const dependentes = [...new Set(filhas)];
      
      console.log('\n📝 ORDEM SUGERIDA DE LIMPEZA:');
      console.log('  1️⃣ Filhas (com FK): ', dependentes.join(', '));
      console.log('  2️⃣ Independentes: ', independentes.join(', '));
    } else {
      console.log('⚪ Nenhuma foreign key encontrada');
      console.log('💡 Pode limpar qualquer ordem');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO:');
    console.error(error.message);
  } finally {
    if (client) {
      await client.end();
      console.log('\n🔌 Desconectado');
    }
  }
})();
