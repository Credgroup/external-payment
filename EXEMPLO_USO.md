# 📋 Exemplo de Uso da Aplicação

## 🚀 Como Testar

### 1. Instalação e Execução
```bash
# Instalar dependências
npm install

# Executar o projeto
npm run dev
```

### 2. URLs de Teste

#### URL Básica (sem parâmetros)
```
http://localhost:3000/resume
```
- Resultado: Página de erro "Parâmetros Inválidos"

#### URL com Parâmetros Válidos
```
http://localhost:3000/resume?info={"policyId":"00001","idSeguro":"abc-123","paymentCode":"xyz-789"}
```
- Resultado: Página de resumo carregada com dados simulados

#### URL com Parâmetros Codificados
```
http://localhost:3000/resume?info=%7B%22policyId%22%3A%2200001%22%2C%22idSeguro%22%3A%22abc-123%22%2C%22paymentCode%22%3A%22xyz-789%22%7D
```
- Resultado: Mesmo resultado da URL anterior

### 3. Fluxo de Teste

1. **Acesse a URL com parâmetros válidos**
2. **Página de Resumo**: Visualize os dados do produto e segurado
3. **Clique em "Prosseguir para o pagamento"**
4. **Página de Pagamento**: Selecione o método PIX
5. **Clique em "Gerar PIX"**: Veja o QR Code e código PIX
6. **Teste as funcionalidades**:
   - Copiar código PIX
   - Baixar QR Code
   - Gerar novo PIX

### 4. Simulação de Pagamento

Para simular um pagamento bem-sucedido, você pode:

#### Opção A: Usar o Console do Navegador
```javascript
// Simular evento de sucesso do WebSocket
window.dispatchEvent(new MessageEvent('message', {
  data: JSON.stringify({
    type: 'PAYMENT_SUCCESS',
    data: { transactionId: '123456' }
  })
}));
```

#### Opção B: Modificar o Hook useWebSocket
No arquivo `src/hooks/useWebSocket.ts`, adicione temporariamente:
```typescript
// Simulação para teste
setTimeout(() => {
  handleWebSocketMessage({
    type: 'PAYMENT_SUCCESS',
    data: { transactionId: '123456' }
  });
}, 5000); // Redireciona após 5 segundos
```

### 5. Dados Simulados

#### Produto
- Nome: "Seguro Auto Premium"
- Plano: "Cobertura Completa"
- Preço: R$ 89,90
- Data de Aquisição: 15/01/2024

#### Usuário
- Nome: "João Silva Santos"
- CPF: "123.456.789-00"
- Idade: 35 anos
- E-mail: "joao.silva@email.com"
- Telefone: "(11) 99999-9999"

### 6. Funcionalidades Disponíveis

#### Página de Resumo
- ✅ Exibição dos dados do produto
- ✅ Exibição dos dados do segurado
- ✅ Formatação de CPF e moeda
- ✅ Botão para prosseguir

#### Página de Pagamento
- ✅ Seleção de método de pagamento (apenas PIX disponível)
- ✅ Geração de QR Code PIX
- ✅ Código PIX copiável
- ✅ Download do QR Code
- ✅ Geração de novo PIX

#### Página de Sucesso
- ✅ Confirmação visual do pagamento
- ✅ Detalhes do produto pago
- ✅ Bilhete de pagamento
- ✅ Download do comprovante
- ✅ Compartilhamento

### 7. WebSocket Events

#### Eventos Enviados
- `ENTERED_SUMMARY`: Ao carregar a página de resumo
- `CLICKED_PROCEED`: Ao clicar em "Prosseguir"
- `PAYMENT_METHOD_CHANGED`: Ao selecionar método de pagamento
- `CLICKED_PAY`: Ao gerar o PIX

#### Eventos Recebidos
- `PAYMENT_SUCCESS`: Redireciona para página de sucesso
- `PAYMENT_ERROR`: Exibe erro no console

### 8. Responsividade

A aplicação é totalmente responsiva e otimizada para:
- 📱 Dispositivos móveis (foco principal)
- 💻 Tablets
- 🖥️ Desktops

### 9. Tratamento de Erros

- ✅ Parâmetros de URL inválidos
- ✅ Falha no carregamento de dados
- ✅ Erro na conexão WebSocket
- ✅ Erro na geração do PIX

### 10. Performance

- ✅ Lazy loading de componentes
- ✅ Cache com React Query
- ✅ Otimização de bundle com Vite
- ✅ Code splitting automático 