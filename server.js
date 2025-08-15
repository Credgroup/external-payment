const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Headers de segurança
const securityHeaders = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'self';",
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-App-Version': '1.0.0',
  'X-Build-Date': '2024-01-01'
};

// Função para obter MIME type
function getMimeType(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  return mimeTypes[extname] || 'application/octet-stream';
}

// Função para servir arquivo estático
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Cache-Control': mimeType.includes('text/html') 
        ? 'no-cache, no-store, must-revalidate' 
        : 'public, max-age=31536000, immutable'
    });
    res.end(data);
  });
}

// Função para verificar se arquivo existe
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

// Função para health check
function healthCheck(res) {
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache'
  });
  res.end('healthy\n');
}

// Servidor HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // Log da requisição
  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

  // Health check
  if (pathname === '/health') {
    healthCheck(res);
    return;
  }

  // Adiciona headers de segurança
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Remove trailing slash
  if (pathname.endsWith('/') && pathname.length > 1) {
    pathname = pathname.slice(0, -1);
  }

  // Determina o arquivo a servir
  let filePath;
  
  if (pathname === '' || pathname === '/') {
    filePath = path.join(DIST_PATH, 'index.html');
  } else {
    filePath = path.join(DIST_PATH, pathname);
  }

  // Verifica se o arquivo existe
  if (fileExists(filePath)) {
    serveStaticFile(filePath, res);
  } else {
    // Para SPA, serve index.html para rotas não encontradas
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (fileExists(indexPath)) {
      serveStaticFile(indexPath, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }
});

// Tratamento de erros
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
