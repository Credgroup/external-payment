# Etapa 1: Build do App com Vite
FROM node:20-alpine AS builder

# ARGS SECTION
ARG VITE_ENV
ARG VITE_IMAGE_VERSION
ARG VITE_URL_DOTCORE
ARG VITE_URL_AUTH_DOTCORE
ARG VITE_PLATFORM
ARG VITE_AES_KEY
ARG VITE_AES_IV
ARG VITE_ENTERPRISE_NAME
ARG VITE_THEME_FILENAME
ARG VITE_THEME_BLOBS_PATH
ARG VITE_THEME_FAVICON
ARG VITE_WS_PAYMENT_URL

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários
COPY package.json ./
COPY package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Copia os scripts
COPY entrypoint.sh ./entrypoint.sh
COPY definetheme.sh ./definetheme.sh

# Permissões de execução
RUN chmod +x ./entrypoint.sh ./definetheme.sh

# Executa o entrypoint para gerar o .env
RUN ./entrypoint.sh

# Substitui o tema no index.html com base no nome da empresa
RUN ./definetheme.sh

# Build do projeto
RUN npm run build

# Etapa 2: Servindo o App com NGINX
FROM nginx:latest

# Copia os arquivos gerados na etapa anterior para a pasta padrão do NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Expondo a porta padrão do NGINX
EXPOSE 80

# Comando padrão para rodar o NGINX
CMD ["nginx", "-g", "daemon off;"]
