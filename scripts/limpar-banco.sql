-- Script para limpar todas as tabelas do banco de dados
-- ATENÇÃO: Este script irá apagar TODOS os dados!
-- Execute apenas se tiver certeza de que deseja perder todos os dados

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = 'replica';

-- Truncar todas as tabelas (mais rápido que DELETE)
TRUNCATE TABLE aceite_carona RESTART IDENTITY CASCADE;
TRUNCATE TABLE oferecimento_carona RESTART IDENTITY CASCADE;
TRUNCATE TABLE veiculo RESTART IDENTITY CASCADE;
TRUNCATE TABLE motorista RESTART IDENTITY CASCADE;
TRUNCATE TABLE cliente RESTART IDENTITY CASCADE;
TRUNCATE TABLE cidade RESTART IDENTITY CASCADE;

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = 'origin';

-- Confirmar que as tabelas estão vazias
SELECT 'aceite_carona' as tabela, COUNT(*) as registros FROM aceite_carona
UNION ALL
SELECT 'oferecimento_carona' as tabela, COUNT(*) as registros FROM oferecimento_carona
UNION ALL
SELECT 'veiculo' as tabela, COUNT(*) as registros FROM veiculo
UNION ALL
SELECT 'motorista' as tabela, COUNT(*) as registros FROM motorista
UNION ALL
SELECT 'cliente' as tabela, COUNT(*) as registros FROM cliente
UNION ALL
SELECT 'cidade' as tabela, COUNT(*) as registros FROM cidade;
