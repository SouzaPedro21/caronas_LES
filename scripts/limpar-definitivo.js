import pg from 'pg';
import { databaseConfig } from '../src/config/database-config.js';

const { Client } = pg;

console.log('🗑️ LIMPEZA DEFINITIVA - ORDEM CORRETA');

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
    
    // Ordem correta baseada nas foreign keys descobertas:
    // 1. aceiteCarona (depende de oferecimentoCarona + clientes)
    // 2. oferecimentoCarona (depende de motoristas + veiculos + cidades)  
    // 3. veiculos (depende de motoristas)
    // 4. motoristas (independente)
    // 5. clientes (independente)  
    // 6. cidades (independente)
    
    const ordemLimpeza = [
      'aceiteCarona',       // Filha de oferecimentoCarona + clientes
      'oferecimentoCarona', // Filha de motoristas + veiculos + cidades
      'veiculos',           // Filha de motoristas
      'motoristas',         // Independente
      'clientes',           // Independente
      'cidades'             // Independente
    ];
    
    console.log('📋 Ordem de limpeza:', ordemLimpeza.join(' → '));
    
    // Contar registros antes
    console.log('\n📊 CONTANDO ANTES DA LIMPEZA...');
    let totalAntes = 0;
    const contadores = {};
    
    for (const tabela of ordemLimpeza) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM "${tabela}"`);
        const count = parseInt(result.rows[0].count);
        contadores[tabela] = count;
        totalAntes += count;
        console.log(`  ${tabela}: ${count} registros`);
      } catch (error) {
        console.log(`  ❌ ${tabela}: ${error.message}`);
        contadores[tabela] = 0;
      }
    }
    
    console.log(`\n📊 TOTAL ANTES: ${totalAntes} registros`);
    
    if (totalAntes === 0) {
      console.log('✅ Já está limpo!');
      return;
    }
    
    // LIMPEZA NA ORDEM CORRETA
    console.log('\n🗑️ INICIANDO LIMPEZA...');
    let totalRemovidos = 0;
    
    for (const tabela of ordemLimpeza) {
      if (contadores[tabela] > 0) {
        console.log(`\n🗑️ Limpando ${tabela} (${contadores[tabela]} registros)...`);
        
        try {
          const result = await client.query(`DELETE FROM "${tabela}"`);
          const removidos = result.rowCount || 0;
          totalRemovidos += removidos;
          console.log(`  ✅ ${tabela}: ${removidos} registros removidos`);
          
        } catch (error) {
          console.log(`  ❌ ${tabela}: ERRO - ${error.message}`);
          
          // Se der erro de FK, mostrar as dependências
          if (error.message.includes('foreign key') || error.message.includes('violates')) {
            console.log(`  🔍 Verificando dependências de ${tabela}...`);
            
            // Tentar novamente após pequeno delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
              const retryResult = await client.query(`DELETE FROM "${tabela}"`);
              const removidos = retryResult.rowCount || 0;
              totalRemovidos += removidos;
              console.log(`  ✅ ${tabela}: ${removidos} registros removidos (retry)`);
            } catch (retryError) {
              console.log(`  ❌ ${tabela}: FALHA DEFINITIVA - ${retryError.message}`);
              
              // Tentar descobrir qual registro está causando problema
              try {
                const sample = await client.query(`SELECT * FROM "${tabela}" LIMIT 3`);
                console.log(`  🔍 Primeiros registros em ${tabela}:`, sample.rows);
              } catch (sampleError) {
                console.log(`  ⚠️ Não foi possível examinar ${tabela}`);
              }
            }
          }
        }
      } else {
        console.log(`⏭️ ${tabela}: já está vazia`);
      }
    }
    
    // RESET DOS IDS
    console.log('\n🔄 RESETANDO AUTO-INCREMENT...');
    for (const tabela of ordemLimpeza) {
      try {
        await client.query(`ALTER SEQUENCE IF EXISTS "${tabela}_id_seq" RESTART WITH 1`);
        console.log(`  ✅ ${tabela}_id_seq resetada`);
      } catch (error) {
        // Tentar variações do nome da sequence
        const variations = [
          `${tabela}_id_seq`,
          `${tabela.toLowerCase()}_id_seq`,
          `"${tabela}_id_seq"`,
          `public."${tabela}_id_seq"`
        ];
        
        let resetSuccess = false;
        for (const variation of variations) {
          try {
            await client.query(`ALTER SEQUENCE IF EXISTS ${variation} RESTART WITH 1`);
            console.log(`  ✅ ${variation} resetada`);
            resetSuccess = true;
            break;
          } catch (e) {
            // Continuar tentando
          }
        }
        
        if (!resetSuccess) {
          console.log(`  ⚠️ ${tabela}: sequence não encontrada`);
        }
      }
    }
    
    // VERIFICAÇÃO FINAL
    console.log('\n📊 VERIFICAÇÃO FINAL...');
    let totalDepois = 0;
    
    for (const tabela of ordemLimpeza) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM "${tabela}"`);
        const count = parseInt(result.rows[0].count);
        totalDepois += count;
        
        if (count === 0) {
          console.log(`  ✅ ${tabela}: LIMPA (0 registros)`);
        } else {
          console.log(`  ⚠️ ${tabela}: AINDA TEM ${count} registros`);
        }
      } catch (error) {
        console.log(`  ❌ ${tabela}: erro na verificação`);
      }
    }
    
    // RESULTADO FINAL
    console.log('\n' + '='.repeat(50));
    console.log('🎯 RESULTADO DA LIMPEZA:');
    console.log(`📊 Registros iniciais: ${totalAntes}`);
    console.log(`🗑️ Registros removidos: ${totalRemovidos}`);
    console.log(`📊 Registros restantes: ${totalDepois}`);
    console.log('='.repeat(50));
    
    if (totalDepois === 0) {
      console.log('\n🎉 SUCESSO COMPLETO!');
      console.log('✅ Todos os dados foram removidos');
      console.log('🏗️ Estrutura das tabelas mantida');
      console.log('🔄 IDs resetados para começar do 1');
      console.log('\n💡 O banco está pronto para novos dados!');
    } else {
      console.log(`\n⚠️ ATENÇÃO: Ainda restam ${totalDepois} registros`);
      console.log('💡 Possíveis causas:');
      console.log('   - Foreign keys impedindo exclusão');
      console.log('   - Dados órfãos ou inconsistências');
      console.log('   - Permissões insuficientes');
      
      console.log('\n🔧 Soluções:');
      console.log('   1. Execute o script novamente');
      console.log('   2. Verifique as foreign keys manualmente');
      console.log('   3. Use TRUNCATE CASCADE se tiver permissão');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO PRINCIPAL:');
    console.error(`Tipo: ${error.constructor.name}`);
    console.error(`Mensagem: ${error.message}`);
    
    if (error.message.includes('permission')) {
      console.error('\n💡 ERRO DE PERMISSÃO:');
      console.error('   O usuário não tem permissão para essa operação');
      console.error('   Contacte o administrador do banco');
    } else if (error.message.includes('foreign key')) {
      console.error('\n💡 ERRO DE FOREIGN KEY:');
      console.error('   Há dependências entre as tabelas');
      console.error('   Execute novamente ou remova as FKs temporariamente');
    }
    
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('\n🔌 Conexão fechada');
      } catch (error) {
        console.error('❌ Erro ao fechar:', error.message);
      }
    }
    console.log('\n👋 Script finalizado');
  }
})();
