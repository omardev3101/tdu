# 1. Imagem base
FROM node:18-alpine

# 2. Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# 3. Copia os arquivos de dependência
# (Com o Root Directory configurado, o arquivo já está na "raiz" para o Docker)
COPY package*.json ./

# 4. Instala apenas o necessário para produção
RUN npm install --omit=dev

# 5. Copia todo o código do backend
COPY . .

# 6. Porta da aplicação
EXPOSE 3000

# 7. Execução
# Nota: certifique-se de que o comando 'start' existe no seu package.json
CMD ["sh", "-c", "npx sequelize-cli db:migrate && npm start"]