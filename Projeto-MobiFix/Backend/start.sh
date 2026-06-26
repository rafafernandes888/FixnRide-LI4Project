#!/bin/bash

DATA_API_URL=${DataApiSettings__BaseUrl:-"http://data-api:3001"}

echo "🚀 A iniciar MobiFix.LN (Camada de Lógica)..."
echo "------------------------------------------------"

echo "⏳ A aguardar que a Data API ($DATA_API_URL) fique pronta..."
for i in $(seq 1 30); do
  if curl -s "$DATA_API_URL/funcionarios" > /dev/null 2>&1; then
    echo "✅ Data API acessível!"
    break
  fi
  
  if [ $i -eq 30 ]; then
    echo "❌ Erro: Data API não ficou pronta a tempo. A abortar..."
    exit 1
  fi

  echo "  (tentativa $i/30...) a aguardar..."
  sleep 3
done

echo "------------------------------------------------"
echo "🔥 A arrancar MobiFix.API (LN) na porta 5001..."

exec dotnet MobiFix.API.dll --urls "http://+:5001"