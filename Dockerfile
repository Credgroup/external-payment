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
ARG VITE_THEME_BLOBS_KEY
ARG VITE_URL_API_CONVERT_TEMPLATE

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários
COPY package.json ./
COPY package-lock.json ./

# Instala TODAS as dependências (incluindo devDependencies para o build)
RUN npm ci

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

# Etapa 2: Servidor HTTP simples
FROM node:20-alpine

# Instala dependências de segurança
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S app-user && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G app-user -g app-user app-user

# Copia os arquivos gerados na etapa anterior
COPY --from=builder /app/dist /app/dist

# Copia servidor HTTP simples
COPY server.js /app/server.js

# Remove arquivos desnecessários para segurança
RUN rm -rf /app/dist/*.map && \
    rm -rf /app/dist/*.txt && \
    rm -rf /app/dist/*.md

# Configura permissões de segurança
RUN chown -R app-user:app-user /app && \
    chmod -R 755 /app && \
    chmod 644 /app/dist/*

# Configuração de saúde
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Muda para usuário não-root
USER app-user

# Expondo a porta da aplicação
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "/app/server.js"]
