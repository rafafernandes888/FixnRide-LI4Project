#!/bin/bash

DB_NAME=${MONGO_INITDB_DATABASE:-"fixnride_db"}
DATA_DIR="/docker-entrypoint-initdb.d"

echo "🚀 [INIT] A iniciar povoamento automático no Docker..."
echo "📂 Diretório de dados: $DATA_DIR"
echo "🗄️  Base de Dados: $DB_NAME"
echo "--------------------------------------------------------"

importar() {
    local colecao=$1
    local ficheiro=$2
    
    if [ -f "$DATA_DIR/$ficheiro" ]; then
        echo "📦 [IMPORT] $colecao..."
        mongoimport --db "$DB_NAME" --collection "$colecao" --file "$DATA_DIR/$ficheiro" --jsonArray --drop
    else
        echo "⚠️  [AVISO] Ficheiro $ficheiro não encontrado em $DATA_DIR"
    fi
}

importar "funcionarios" "funcionarios.json"
importar "clientes" "clientes.json"
importar "trotinetes" "trotinetes.json"
importar "pecas" "pecas.json"
importar "intervencoes_catalogo" "intervencoes_catalogo.json"
importar "servicos" "servicos.json"
importar "vendas" "vendas.json"
importar "faturas" "faturas.json"
importar "encomendas_cliente" "encomendas_cliente.json"
importar "encomendas_stock" "encomendas_stock.json"
importar "promocoes" "promocoes.json"
importar "agenda" "agenda.json"

echo "--------------------------------------------------------"
echo "⚙️  A criar índices e restrições..."

mongosh "$DB_NAME" <<EOF
    print('   -> Índices de Utilizadores');
    db.funcionarios.createIndex({ email: 1 }, { unique: true });
    db.clientes.createIndex({ email: 1 }, { unique: true });

    print('   -> Índices de Relações e Performance');
    db.trotinetes.createIndex({ clienteId: 1 });
    db.servicos.createIndex({ trotineteId: 1 });
    db.servicos.createIndex({ estado: 1 });
    db.faturas.createIndex({ clienteId: 1 });
    db.vendas.createIndex({ operadorId: 1 });
    db.encomendas_cliente.createIndex({ clienteId: 1 });
    db.agenda.createIndex({ mecanicoId: 1, dataHoraInicio: 1 });
    
    print('✅ Índices criados com sucesso!');
EOF

echo "--------------------------------------------------------"
echo "🎉 [SUCESSO] Base de Dados $DB_NAME pronta a usar!"