# Estágio 1: Build
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Estágio 2: Produção com Nginx
FROM nginx:stable-alpine as production-stage
# Copia o build
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copia a configuração do Nginx que acabamos de criar
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]