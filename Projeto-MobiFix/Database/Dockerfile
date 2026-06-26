FROM node:20-alpine

WORKDIR /usr/src/app

# Copia os ficheiros de dependências
COPY package*.json ./

# Instala TODAS as dependências (evita erro de módulos em falta como o morgan)
RUN npm install

# CORRIGIDO: Copia todo o código para a pasta atual (.)
COPY . .

# Expõe a porta 3001 (a que definiste no .env e no compose)
EXPOSE 3001

# Inicia a API
CMD ["npm", "start"]