
# 💳 Projeto: Página de Pagamento com WebSocket

Este projeto é uma aplicação em React + TypeScript para exibir e gerenciar o processo de pagamento de um produto ou serviço, com integração em tempo real via WebSocket. Ele simula o fluxo completo desde o resumo da compra até a confirmação do pagamento.

---

## 🛠️ Tecnologias Utilizadas

- **React** + **TypeScript**
- **TailwindCSS** – Estilização
- **Zustand** – Gerenciamento de estado global
- **React Query (@tanstack/react-query)** – Requisições e cache
- **shadcn/ui** – Componentes de UI
- **WebSocket** – Comunicação em tempo real com o backend
- **React Router** – Gerenciamento de rotas

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### Acesso à Aplicação
A aplicação estará disponível em `http://localhost:3000`

Para testar com parâmetros, use uma URL como:
```
http://localhost:3000/resume?info={"policyId":"00001","idSeguro":"abc-123","paymentCode":"xyz-789"}
```

---

## 🔄 Visão Geral do Fluxo

### 1. Acesso à Aplicação

O usuário acessa a aplicação por meio de um shortlink no seguinte formato:

```
https://meuapppagamento.com/?info={policyId:"00001",idSeguro:"abc-123",paymentCode:"xyz-789"}
```

Ao carregar a aplicação:

- A URL é lida e seus parâmetros extraídos
- A conexão com o WebSocket (`ws://localhost:8080`) é estabelecida
- O usuário entra na **sala** identificada pelo `idSeguro`
- Um evento `ENTERED_SUMMARY` é emitido via WebSocket

---

### 2. `/resume` – Resumo da Compra

A primeira página exibe:

- **Imagem e nome do produto**
- **Plano contratado**
- **Dados do segurado** (nome, CPF, idade etc.)
- **Detalhes do produto** (nome, plano, data de aquisição…)

O botão **"Prosseguir para o pagamento"**:

- Emite o trigger `CLICKED_PROCEED`
- Redireciona para `/payment`

---

### 3. `/payment` – Escolha e Execução do Pagamento

Na tela de pagamento:

- Os **métodos de pagamento disponíveis** são carregados via API usando `useQuery`
- Cada método é um botão clicável
- Ao selecionar um método, é disparado o evento `PAYMENT_METHOD_CHANGED`

> **Implementação atual**: Apenas o método **PIX**

#### Ao clicar em "Pagar":
- O evento `CLICKED_PAY` é emitido
- O formulário exibe:
  - QR Code para pagamento
  - Código PIX com botão "copiar"

#### O frontend escuta eventos via WebSocket:
- `PAYMENT_SUCCESS` → redireciona para `/success-pay`
- `PAYMENT_ERROR` → exibe mensagem de erro

---

### 4. `/success-pay` – Confirmação de Pagamento

Após o pagamento ser aprovado, o usuário é redirecionado para a tela de sucesso com:

- Produto adquirido
- Valor da parcela
- Mensagem de agradecimento
- Bilhete de pagamento

---

## 🧠 Estado Global (Zustand)

As seguintes variáveis globais são armazenadas no Zustand:

- `product`: dados do produto
- `userData`: dados do segurado
- `wsRoomId`: identificador da sala (idSeguro)
- (opcional) `paymentMethod`

---

## 🔌 WebSocket – Triggers e Eventos

### Eventos Enviados:
| Trigger | Descrição |
|--------|-----------|
| `ENTERED_SUMMARY` | Usuário entrou na tela de resumo |
| `CLICKED_PROCEED` | Clicou em "Prosseguir" |
| `PAYMENT_METHOD_CHANGED` | Método de pagamento selecionado |
| `CLICKED_PAY` | Clicou em "Pagar" |

### Eventos Recebidos:
| Trigger | Descrição |
|--------|-----------|
| `PAYMENT_SUCCESS` | Pagamento confirmado |
| `PAYMENT_ERROR` | Erro no pagamento |

---

## 📁 Estrutura de Pastas

```
src/
│
├── pages/
│   ├── ResumePage.tsx
│   ├── PaymentPage.tsx
│   └── SuccessPage.tsx
│
├── components/
│   ├── ProductSummary.tsx
│   ├── PaymentMethods.tsx
│   ├── PixForm.tsx
│   └── PaymentSuccess.tsx
│
├── hooks/
│   └── useWebSocket.ts
│
├── store/
│   └── useGlobalStore.ts
│
├── services/
│   └── api.ts
│
├── types/
│   └── index.ts
│
├── utils/
│   └── urlParser.ts
│
└── App.tsx
```

---

## ✅ Funcionalidades Implementadas

- [x] Conexão automática com WebSocket ao abrir a página
- [x] Navegação entre páginas de resumo, pagamento e sucesso
- [x] Detecção de evento de pagamento com renderização condicional
- [x] Estado global com Zustand
- [x] Layout responsivo com TailwindCSS (com foco no dispositivo mobile)
- [x] Integração com React Query para cache de dados
- [x] Componentes reutilizáveis e bem estruturados
- [x] Tratamento de erros e estados de loading
- [x] Formatação de moeda e CPF
- [x] Funcionalidades de copiar código PIX e download de QR Code

---

## 🎨 Design

O projeto segue um design moderno e responsivo, focado na experiência mobile, com:

- Cores primárias em tons de azul
- Cores de sucesso em tons de verde
- Cards com sombras suaves
- Botões com estados hover
- Animações de loading
- Layout otimizado para dispositivos móveis

---

## 🔧 Configuração do WebSocket

Para testar a funcionalidade completa, você precisará de um servidor WebSocket rodando em `ws://localhost:8080`. O projeto está configurado para:

- **Conexão Global**: Uma única conexão WebSocket é mantida durante toda a sessão
- **Inicialização Automática**: A conexão é estabelecida quando o app inicia
- **Singleton Pattern**: Garante que não há múltiplas conexões simultâneas
- **Persistência**: A conexão não é fechada ao navegar entre páginas
- **Reconexão Automática**: Se a conexão cair, é restabelecida automaticamente

### 📡 Uso da Função sendMessage

A função `sendMessage` foi refatorada para seguir o novo schema de eventos WebSocket. Agora você pode usar:

```typescript
// Enviar evento simples (sem dados adicionais)
sendMessage('ENTERED_SUMMARY');
sendMessage('CLICKED_PROCEED');
sendMessage('CLICKED_PAY');

// Enviar evento com dados adicionais
sendMessage('PAYMENT_METHOD_CHANGED', { method: 'pix' });
sendMessage('DATA_FILLED', { fields: ['name', 'email'] });
```

A função automaticamente:
- Adiciona `roomId` e `deviceId` ao payload
- Constrói o objeto completo seguindo o schema `WebSocketEvents`
- Valida se o WebSocket está conectado
- Loga a mensagem enviada para debug

### 📋 Schema de Eventos

Todos os eventos seguem o padrão:
```typescript
{
  type: 'EVENT_NAME',
  payload: {
    roomId: string,
    deviceId: string,
    // ... dados específicos do evento
  }
}
```

### 🔄 Fluxo de Inicialização

1. **App.tsx**: Extrai parâmetros da URL e carrega dados iniciais
2. **Store Global**: Preenche com dados do produto, usuário e roomId
3. **WebSocket**: Conecta automaticamente quando o app inicia
4. **ResumePage**: Emite `ENTERED_SUMMARY` quando o usuário entra na página
5. **Navegação**: WebSocket permanece conectado durante toda a sessão

---

## 📝 Notas de Desenvolvimento

- O projeto usa dados simulados para demonstração
- As APIs estão mockadas para facilitar o desenvolvimento
- O WebSocket pode ser facilmente configurado para um servidor real
- O design é totalmente responsivo e otimizado para mobile
- Todos os componentes são TypeScript com tipagem completa
