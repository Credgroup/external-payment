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

# Instala as dependências
RUN npm ci --only=production && npm cache clean --force

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
FROM nginx:alpine

# Instala dependências de segurança
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

# Copia os arquivos gerados na etapa anterior para a pasta padrão do NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração de segurança do Nginx
COPY nginx-security.conf /etc/nginx/conf.d/default.conf

# Configurações de segurança do Nginx
RUN echo "server_tokens off;" >> /etc/nginx/nginx.conf && \
    echo "client_max_body_size 10M;" >> /etc/nginx/nginx.conf && \
    echo "client_body_timeout 30s;" >> /etc/nginx/nginx.conf && \
    echo "client_header_timeout 30s;" >> /etc/nginx/nginx.conf

# Remove arquivos desnecessários para segurança
RUN rm -rf /usr/share/nginx/html/*.map && \
    rm -rf /usr/share/nginx/html/*.txt && \
    rm -rf /usr/share/nginx/html/*.md

# Configura permissões de segurança
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 644 /usr/share/nginx/html/* && \
    chmod 644 /etc/nginx/conf.d/default.conf

# Cria diretório para logs com permissões corretas
RUN mkdir -p /var/log/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx

# Configuração de saúde
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Muda para usuário não-root
USER nginx-user

# Expondo a porta padrão do NGINX
EXPOSE 80

# Comando padrão para rodar o NGINX
CMD ["nginx", "-g", "daemon off;"]
