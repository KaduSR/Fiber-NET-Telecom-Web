# Transformação do Logo Fiber.Net em SVG

Este documento detalha o processo de transformação do componente `FiberNetTextLogo.tsx` de uma estrutura baseada em `span` e HTML para um componente SVG nativo, garantindo melhor escalabilidade, performance e consistência visual.

## 🎯 Objetivos
- Converter a representação textual do logo em um formato vetorial (SVG).
- Manter a compatibilidade com as classes do Tailwind CSS para estilização dinâmica.
- Melhorar o tempo de carregamento e a nitidez em diferentes densidades de tela (Retina/4K).

## 🛠️ Implementação

### Cores Identificadas
Com base na análise do ecossistema Fiber.Net, as seguintes cores foram mapeadas:
- **Fiber (Lime):** `#A3E635` (Aproximado do Tailwind Lime-400 para contraste vibrante).
- **Dot (Blue):** `#1E90FF` (Dodger Blue).
- **NET (Orange):** `#FF6B00` (Fiber Orange oficial).

### Estrutura do SVG
O novo componente utiliza a tag `<svg>` com elementos `<text>` e `<tspan>`, permitindo que o texto permaneça acessível (SEO) e ao mesmo tempo se comporte como um elemento gráfico puro.

### Vantagens da Mudança
1. **Escalabilidade Infinita:** O logo não perde qualidade ao ser ampliado.
2. **Consistência de Fonte:** O uso da classe `font-marker` dentro do SVG garante que a tipografia da marca seja respeitada.
3. **Performance:** Menos elementos no DOM comparado à estrutura anterior de múltiplos spans aninhados.

---
*Desenvolvido por Kadu Dev*
[WhatsApp](https://wa.me/5524992686868) | [Instagram](https://instagram.com/kadudev) | [LinkedIn](https://linkedin.com/in/kadudev)
