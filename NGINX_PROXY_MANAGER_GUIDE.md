# 🌐 Guia de Configuração - Nginx Proxy Manager

Este guia explica como configurar o **Nginx Proxy Manager** para o projeto **external-payment** com todas as configurações de segurança necessárias.

## 📋 Pré-requisitos

- Nginx Proxy Manager instalado e funcionando
- Container da aplicação rodando na porta 3000
- Acesso ao painel administrativo do NPM

---

## 🚀 **1. Configuração Básica do Proxy Host**

### **Passo 1: Criar Proxy Host**

1. Acesse o painel do Nginx Proxy Manager
2. Vá em **Proxy Hosts** → **Add Proxy Host**
3. Configure os campos:

```
Domain Names: seu-dominio.com (ou subdominio)
Scheme: http
Forward Hostname/IP: IP_DO_CONTAINER (ex: 172.17.0.2)
Forward Port: 3000
```

### **Passo 2: Configurações Avançadas**

Clique em **Advanced** e adicione:

```nginx
# Configurações de cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options "nosniff";
}

# Configurações para HTML
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
}

# Configuração principal para SPA
location / {
    try_files $uri $uri/ /index.html;
}

# Health check
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

---

## 🔒 **2. Headers de Segurança**

### **Passo 3: Adicionar Headers de Segurança**

Na seção **Custom Nginx Configuration**, adicione:

```nginx
# Headers de Segurança
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'self';" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Headers da aplicação
add_header X-App-Version "1.0.0" always;
add_header X-Build-Date "2024-01-01" always;
add_header X-API-Version "1.0" always;
add_header X-Request-ID $request_id always;

# Remover headers sensíveis
proxy_hide_header X-Powered-By;
proxy_hide_header Server;
proxy_hide_header X-AspNet-Version;
proxy_hide_header X-AspNetMvc-Version;
```

---

## 🛡️ **3. Rate Limiting**

### **Passo 4: Configurar Rate Limiting**

Adicione na seção **Custom Nginx Configuration**:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

# Aplicar rate limiting
limit_req zone=api burst=20 nodelay;
limit_req_status 429;

# Rate limiting específico para APIs
location /api/ {
    limit_req zone=api burst=20 nodelay;
    limit_req_status 429;
}
```

---

## 🔐 **4. Configuração SSL/HTTPS**

### **Passo 5: Configurar Certificado SSL**

1. **SSL Certificate**: Selecione "Request a new SSL Certificate"
2. **Force SSL**: ✅ Marque esta opção
3. **HTTP/2 Support**: ✅ Marque esta opção
4. **HSTS Enabled**: ✅ Marque esta opção
5. **HSTS Subdomains**: ✅ Marque esta opção

### **Configurações SSL Avançadas**

```nginx
# Configurações SSL
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

---

## 🚫 **5. Proteção contra Ataques**

### **Passo 6: Adicionar Proteções**

```nginx
# Proteção contra ataques de força bruta
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

location ~ ~$ {
    deny all;
    access_log off;
    log_not_found off;
}

# Proteção contra acesso a arquivos sensíveis
location ~* \.(env|config|ini|conf|json|xml|yml|yaml)$ {
    deny all;
    access_log off;
    log_not_found off;
}

# Proteção contra arquivos de backup
location ~* \.(bak|backup|old|orig|save|swp|tmp)$ {
    deny all;
    access_log off;
    log_not_found off;
}

# Bloquear métricas e debug
location /metrics {
    deny all;
    access_log off;
    log_not_found off;
}

location /debug {
    deny all;
    access_log off;
    log_not_found off;
}
```

---

## ⚡ **7. Otimizações de Performance**

### **Passo 7: Configurar Gzip e Cache**

```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;

# Configurações de proxy
proxy_connect_timeout 30s;
proxy_send_timeout 30s;
proxy_read_timeout 30s;
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;

# Headers de proxy
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

---

## 📊 **8. Configuração de Logs**

### **Passo 8: Configurar Logs**

```nginx
# Configuração de logs
access_log /var/log/nginx/access.log combined buffer=512k flush=1m;
error_log /var/log/nginx/error.log warn;

# Logs específicos para APIs
location /api/ {
    access_log /var/log/nginx/api_access.log combined;
    error_log /var/log/nginx/api_error.log warn;
}
```

---

## 🔧 **9. Configuração Completa Final**

### **Configuração Completa para NPM**

Copie e cole esta configuração completa na seção **Custom Nginx Configuration**:

```nginx
# =============================================================================
# CONFIGURAÇÃO COMPLETA DE SEGURANÇA - EXTERNAL PAYMENT
# =============================================================================

# Headers de Segurança
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'self';" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Headers da aplicação
add_header X-App-Version "1.0.0" always;
add_header X-Build-Date "2024-01-01" always;
add_header X-API-Version "1.0" always;
add_header X-Request-ID $request_id always;

# Remover headers sensíveis
proxy_hide_header X-Powered-By;
proxy_hide_header Server;
proxy_hide_header X-AspNet-Version;
proxy_hide_header X-AspNetMvc-Version;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;

# Configurações de proxy
proxy_connect_timeout 30s;
proxy_send_timeout 30s;
proxy_read_timeout 30s;
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;

# Headers de proxy
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# Configurações de cache para arquivos estáticos
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options "nosniff";
}

# Configurações para HTML
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
}

# Rate limiting para toda a aplicação
limit_req zone=api burst=50 nodelay;
limit_req_status 429;

# Rate limiting específico para APIs
location /api/ {
    limit_req zone=api burst=20 nodelay;
    limit_req_status 429;
}

# Health check
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}

# Proteção contra ataques
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

location ~ ~$ {
    deny all;
    access_log off;
    log_not_found off;
}

location ~* \.(env|config|ini|conf|json|xml|yml|yaml)$ {
    deny all;
    access_log off;
    log_not_found off;
}

location ~* \.(bak|backup|old|orig|save|swp|tmp)$ {
    deny all;
    access_log off;
    log_not_found off;
}

location /metrics {
    deny all;
    access_log off;
    log_not_found off;
}

location /debug {
    deny all;
    access_log off;
    log_not_found off;
}

# Configuração principal para SPA
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## ✅ **10. Verificação da Configuração**

### **Testes de Segurança**

Após configurar, teste os seguintes pontos:

1. **Headers de Segurança**:
   ```bash
   curl -I https://seu-dominio.com
   ```

2. **Rate Limiting**:
   ```bash
   # Faça muitas requisições rapidamente
   for i in {1..50}; do curl https://seu-dominio.com; done
   ```

3. **Health Check**:
   ```bash
   curl https://seu-dominio.com/health
   ```

4. **Proteção de Arquivos**:
   ```bash
   curl https://seu-dominio.com/.env
   curl https://seu-dominio.com/config.json
   ```

---

## 🔍 **11. Monitoramento**

### **Logs Importantes**

Monitore estes logs no Nginx Proxy Manager:

- **Access Log**: `/var/log/nginx/access.log`
- **Error Log**: `/var/log/nginx/error.log`
- **API Log**: `/var/log/nginx/api_access.log`

### **Métricas de Segurança**

- Tentativas de acesso a arquivos bloqueados
- Rate limiting excedido
- Requisições suspeitas
- Erros 4xx e 5xx

---

## 🚨 **12. Troubleshooting**

### **Problemas Comuns**

1. **Erro 502 Bad Gateway**:
   - Verifique se o container está rodando na porta 3000
   - Confirme o IP do container no Forward Hostname/IP

2. **Headers não aparecem**:
   - Verifique se a configuração custom foi salva
   - Reinicie o proxy host

3. **Rate limiting muito restritivo**:
   - Ajuste os valores de `rate` e `burst`
   - Exemplo: `rate=20r/s` e `burst=50`

4. **SSL não funciona**:
   - Verifique se o domínio está correto
   - Confirme se o DNS está apontando para o servidor

---

## 📚 **13. Recursos Adicionais**

### **Documentação Oficial**
- [Nginx Proxy Manager](https://nginxproxymanager.com/)
- [Nginx Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

### **Ferramentas de Teste**
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

---

## ✅ **Conclusão**

Com esta configuração, seu projeto **external-payment** estará protegido por:

- ✅ **Headers de segurança** completos
- ✅ **Rate limiting** contra ataques de força bruta
- ✅ **SSL/HTTPS** configurado
- ✅ **Proteção de arquivos** sensíveis
- ✅ **Otimizações de performance**
- ✅ **Logs detalhados** para monitoramento

A aplicação continuará funcionando normalmente, mas agora com uma camada robusta de segurança no Nginx Proxy Manager! 🛡️
