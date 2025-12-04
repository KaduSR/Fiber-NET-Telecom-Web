# Fiber.Net Telecom - Web App & Portal do Cliente

Aplicação Web moderna desenvolvida para o provedor de internet **Fiber.Net Telecom**. O projeto inclui uma Landing Page institucional, uma Área do Cliente completa (Dashboard), Central de Ajuda, Status de Serviços em tempo real e Suporte via Inteligência Artificial.

## 🚀 Tecnologias Utilizadas

- **Core:** React 18, TypeScript, Vite.
- **Estilização:** Tailwind CSS.
- **Ícones:** Lucide React.
- **Inteligência Artificial:** Google Gemini API (`@google/genai`).
- **Mapas:** Leaflet & React-Leaflet.
- **PDF:** jsPDF (Geração de documentos no front-end).
- **Integração:** Fetch API com Proxy reverso (para contornar CORS).

---

## ✨ Funcionalidades Principais

### 1. Landing Page Institucional
- Apresentação de planos com destaque visual.
- Teste de Velocidade (SpeedTest).
- Feed de Notícias de Tecnologia (consumindo RSS feeds externos).
- Mapa de Cobertura/Localização interativo.

### 2. Área do Cliente (Dashboard)
- **Autenticação:** Login seguro com JWT.
- **Modo Demo:** Funcionalidade de demonstração para testes sem backend.
- **Visão Geral:** Resumo de contratos, status da conexão e financeiro.
- **Financeiro:** 
  - Listagem de faturas (Aberto/Pago).
  - Cópia de linha digitável.
  - **PIX Copia e Cola:** Geração dinâmica de QR Code.
  - Download de PDF da fatura.
- **Conexões:**
  - Status em tempo real da ONU (Online/Offline).
  - Telemetria: Nível de sinal óptico (RX/TX), temperatura e Uptime.
  - Ações remotas: Desconectar, Limpar MAC, Diagnóstico.
- **Consumo:** Gráficos interativos de uso de banda (Download/Upload).

### 3. Suporte Inteligente (IA)
- Chatbot integrado com **Google Gemini 2.5**.
- Capacidade de responder dúvidas sobre faturas, conexão e suporte técnico.
- **Grounding:** A IA pode realizar buscas no Google para verificar se serviços externos (WhatsApp, Instagram, Bancos) estão fora do ar.

### 4. Utilitários
- **2ª Via Rápida:** Modal público para consulta de boletos apenas com CPF/CNPJ.
- **Status dos Serviços:** Monitoramento de serviços populares (Netflix, Bancos, Redes Sociais) para informar o cliente sobre instabilidades externas.
- **Código de Ética:** Visualização e geração de PDF do código de conduta da empresa.

---

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior).
- Gerenciador de pacotes (npm, yarn ou pnpm).

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/fibernet-telecom.git
   cd fibernet-telecom
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configuração de Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto (ou configure no seu ambiente de deploy):

   ```env
   # Chave da API do Google Gemini (Obrigatório para o Chatbot)
   API_KEY=sua_chave_gemini_aqui
   ```

4. **Executar em Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:5173`.

---

## 📂 Estrutura do Projeto

```
/
├── components/          # Componentes Reutilizáveis de UI
│   ├── ClientArea.tsx   # Lógica principal do Dashboard do Cliente
│   ├── AIInsights.tsx   # Componente de análise da IA no Dashboard
│   ├── HelpCenter.tsx   # Central de Ajuda (FAQ)
│   ├── ServiceStatus.tsx# Página de Status de Serviços Externos
│   └── ...
├── src/
│   ├── services/
│   │   └── apiService.ts # Camada de abstração para comunicação com Backend
│   ├── types/           # Definições de Tipos TypeScript (Interfaces)
│   └── config.ts        # Configurações globais e Endpoints
├── utils/               # Funções utilitárias (Geradores de PDF, Formatadores)
├── App.tsx              # Componente Raiz e Roteamento (SPA)
├── index.html           # Ponto de entrada e Metadados SEO
└── vite.config.ts       # Configuração do Vite e Proxy
```

---

## 🔌 Integração com Backend (API)

O projeto utiliza um arquivo centralizado de serviços (`src/services/apiService.ts`).

- **Proxy:** Para evitar problemas de CORS em desenvolvimento e produção, as requisições para `/api-proxy/*` são redirecionadas para o backend real configurado no `vite.config.ts` ou `vercel.json`.
- **Endpoints:** Definidos em `src/config.ts`.
- **Cache:** O Dashboard utiliza `localStorage` para cachear dados do cliente (`fiber_dashboard_cache_v13...`) e melhorar a velocidade de carregamento.

## 🤖 Configuração da IA (Gemini)

A integração com a IA está localizada em `components/ClientArea.tsx`.
- **Modelo:** `gemini-2.5-flash`.
- **Tools:** Utiliza `googleSearch` para buscar informações em tempo real sobre quedas de serviços na internet.
- **System Instruction:** O prompt do sistema instrui a IA a agir como um suporte técnico de provedor, focado em soluções de conectividade.

---

## 📦 Deploy

O projeto já contém um arquivo `vercel.json` configurado para deploy na **Vercel**, incluindo as regras de reescrita (rewrites) para o proxy da API.

Para fazer deploy:
1. Suba o código para o GitHub.
2. Importe o projeto na Vercel.
3. Adicione a variável de ambiente `API_KEY`.
4. O deploy será automático.

---

**Desenvolvido por Fiber.Net Telecom**
