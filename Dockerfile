# Usando uma imagem leve do Node
FROM node:18-alpine

# Criar diretório do app
WORKDIR /usr/src/app

# Instalar dependências
# Copiamos os arquivos de package primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install --production

# Copiar o restante do código
COPY . .

# Expõe a porta que o Render costuma usar (ou a que você definiu no seu app)
EXPOSE 3000

# Comando para rodar migrations e subir o servidor
# sh -c permite rodar múltiplos comandos
CMD ["sh", "-c", "npx sequelize-cli db:migrate && npm start"]