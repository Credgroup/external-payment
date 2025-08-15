# Etapa 1: Build do App com Vite
FROM node:20-alpine AS builder

# Define valores padrão para as variáveis de ambiente durante o build
ENV VITE_ENV=development
ENV VITE_IMAGE_VERSION=1.0.0
ENV VITE_URL_DOTCORE=https://devapi.keepins.app/
ENV VITE_URL_AUTH_DOTCORE=https://devapiauth.keepins.app/
ENV VITE_PLATFORM=18844
ENV VITE_AES_KEY=7061737323313233
ENV VITE_AES_IV=7061737323313233
ENV VITE_ENTERPRISE_NAME=keepins
ENV VITE_THEME_FILENAME=themepay.css
ENV VITE_THEME_BLOBS_PATH=https://wkfkeepinsmarsh.blob.core.windows.net
ENV VITE_THEME_FAVICON=favicon.png
ENV VITE_WS_PAYMENT_URL=wss://devwspayment.ekio.digital
ENV VITE_THEME_BLOBS_KEY=?sp=r&st=2025-05-21T01:16:44Z&se=2026-05-21T09:16:44Z&spr=https&sv=2024-11-04&sr=c&sig=0o75S62Z761Xs2J5GX5XaVRwz%2BlqaGD3trx2uaKZzYw%3D
ENV VITE_URL_API_CONVERT_TEMPLATE=https://devapiconverttemplate.ekio.digital

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários
COPY package.json ./
COPY package-lock.json ./

# Instala TODAS as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copia o restante do código
COPY . .

# Build do projeto (sem depender de scripts externos)
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
