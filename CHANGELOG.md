# 📋 Changelog - Fiber.Net Telecom

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - Versão de Lançamento (Atual)

Esta é a versão de produção completa da aplicação web Fiber.Net Telecom. Inclui integração total com API, módulos de Inteligência Artificial, geração de documentos e otimizações de SEO.

### 🚀 Novas Funcionalidades (Highlights)

#### 🤖 Módulo de Inteligência Artificial
- **Suporte IA (Chatbot):** Integração com **Google Gemini 2.5 Flash**.
  - O Chatbot responde dúvidas sobre faturas, conexão e suporte técnico.
  - Interface otimizada: Input fixo no rodapé, histórico de mensagens e indicador de digitação.
- **Monitoramento de Status (NOC):**
  - Sistema autônomo que varre a internet (via Google Search Tool) para identificar quedas em bancos, redes sociais e streamings.
  - Execução em *background* para não travar a interface do usuário.
  - Sistema de Cache inteligente (20 min) para economia de tokens.
- **AI Insights:** Componente no Dashboard que analisa dados do cliente e fornece dicas proativas (ex: fatura vencendo, alto consumo).

#### 👤 Área do Cliente (Dashboard)
- **Autenticação:** Sistema de Login via JWT com "Lembrar-me" e Recuperação de Senha.
- **Visão Geral:** Cards resumidos de Contratos Ativos, Faturas em Aberto e Status da Conexão.
- **Gestão Financeira:**
  - **Faturas:** Listagem completa com filtros (Aberto/Pago).
  - **PIX Copia e Cola:** Geração de QR Code e código hash em modal dedicado.
  - **PDF:** Geração/Download de boletos (Integração com múltiplos endpoints de fallback).
- **Gestão de Conexão:**
  - Telemetria da ONU: Sinal RX/TX, Temperatura, Uptime e Modelo do equipamento.
  - Status em Tempo Real: Indicador visual (Online/Offline) na lista de logins.
  - Ações Remotas: Botões para "Desconectar", "Limpar MAC" e "Diagnóstico".
- **Configurações:** Alteração de senha do portal.

#### 📄 Documentação e Legal
- **Gerador de PDF Client-Side:** Implementação do `jspdf` para criar o "Código de Ética e Conduta" formatado em A4 diretamente no navegador, sem backend.
- **Página de Compliance:** Seção dedicada à LGPD, Marco Civil da Internet e Licenças SCM da ANATEL.
- **Guia do Cliente:** Tutoriais visuais sobre como ler a fatura e melhorar o Wi-Fi.

#### 🌐 Site Institucional
- **Geolocalização:** Mapa interativo (Leaflet) no rodapé com coordenadas exatas da sede (-22.183377, -43.601004).
- **SEO Local:** Implementação massiva de JSON-LD (Schema.org), Meta Tags e Geo Tags focadas em "Rio das Flores" e "Internet Fibra".
- **Feed de Notícias:** Parser de RSS que agrega notícias de tecnologia (G1, TecMundo, Olhar Digital) com filtro anti-spam.
- **2ª Via Rápida:** Modal público para retirada de boleto apenas com CPF/CNPJ.
- **Google Reviews:** Integração visual para incentivar avaliações.

### 🎨 Melhorias de UI/UX
- **Navegação Suave:** Scroll automático para o topo do conteúdo ao trocar de abas no Dashboard.
- **Layout Responsivo:** Ajustes finos no Menu Mobile e tabelas do Dashboard.
- **Feedback Visual:** Skeletons (Loaders) durante carregamento de dados e animações de transição (FadeIn).
- **Hero Section:** Restauração do Mascote 3D com animação de flutuação.

### 🛠️ Correções e Infraestrutura
- **Build System:**
  - Configuração do `vite.config.ts` para externalizar bibliotecas pesadas (`jspdf`, `leaflet`) e usar CDN via `importmap`.
  - Configuração de Proxy reverso para evitar CORS em desenvolvimento.
- **Typescript:**
  - Correção de todos os caminhos de importação (remoção de alias `@/` problemáticos).
  - Definição estrita de tipos em `src/types/api.ts`.
- **Performance:**
  - Integração com **Vercel Speed Insights**.
  - Lazy Loading de componentes pesados (`React.lazy` + `Suspense`).
  - Cacheamento agressivo no `localStorage` para Dashboard e Notícias.
- **Ambiente:** Lógica em `src/config.ts` para alternar automaticamente entre API Local (Proxy) e API de Produção.

---

## [0.9.0] - Beta (Desenvolvimento)

### Adicionado
- Estrutura inicial do projeto React + Vite.
- Configuração do Tailwind CSS com tema "Fiber Dark" (Laranja/Preto).
- Componentes base: Button, Navbar, Footer, PlanCard.
- Serviço de API (`apiService.ts`) base.

### Conhecido
- O sistema de chat era estático (mock).
- A geração de PDF dependia exclusivamente do backend.
- O mapa era uma imagem estática.

---

> **Desenvolvido por:** Equipe de Desenvolvimento Fiber.Net Telecom
