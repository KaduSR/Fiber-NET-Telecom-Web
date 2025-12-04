
import { NavItem, Plan } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: 'home' },
  { label: 'Planos', href: '#planos' },
  { label: 'SpeedTest', href: 'https://www.speedtest.net/' },
  { label: 'Status', href: 'status' },
  { label: '2ª Via', href: 'segunda-via' },
  { label: 'Notícias', href: 'news' },
  { label: 'Ajuda', href: 'help' },
  { label: 'Guia', href: 'client-guide' },
];

export const PLANS: Plan[] = [
  {
    id: 1,
    speed: '300 MEGA',
    price: '79',
    cents: '90',
    period: '/mês',
    fullPrice: '89,90',
    description: 'O Básico que Funciona',
    benefits: [
      'Instalação Grátis',
      'Ideal para Redes Sociais',
      'Filmes e Séries em HD',
      'Wi-Fi 5 Estável'
    ],
    highlight: false
  },
  {
    id: 2,
    speed: '500 MEGA',
    price: '99',
    cents: '90',
    period: '/mês',
    fullPrice: '109,90',
    description: 'Casa Conectada (Família)',
    benefits: [
      'Instalação Grátis',
      'Wi-Fi 5 Dual Band (5Ghz)',
      'Streaming 4K sem travar',
      'Ideal para Home Office'
    ],
    highlight: true
  },
  {
    id: 3,
    speed: '600 MEGA',
    price: '119',
    cents: '90',
    period: '/mês',
    fullPrice: '129,90',
    description: 'Performance Máxima Wi-Fi 6',
    benefits: [
      'Roteador Wi-Fi 6 (Incluso)',
      'Rota Gamer (Ping Baixo)',
      'IP Público Dinâmico (Jogos)',
      'Suporte Técnico VIP'
    ],
    highlight: false
  }
];

export const CONTACT_INFO = {
  phone: '(24) 2458-1861',
  whatsapp: '(24) 2458-1861',
  email: 'comercial@fibernettelecom.com',
  address: 'RJ 145, KM 93 - Nº53320, Elizabeth, Rio das Flores - RJ'
};

export const HISTORY_TEXT = `A Fiber.Net foi fundada em Rio das Flores em 2017. Nessa época, o que levou ao seu surgimento foi a vontade dos donos de ter um acesso de qualidade à internet. Logo viram que as empresas não ligam muito para seus assinantes e surgiu a ideia de montar um provedor diferente, um provedor que além de prestar o serviço de ISP também fosse uma empresa amiga, que além de ver o lado financeiro da coisa vise o lado humano.

Assim surgiu a Fiber.Net, fundada por um Valenciano e um Rio Florense que queriam fazer algo diferente em nossa cidade. Hoje atendemos um grande volume de residências na região com aceitação de 100% dos nossos clientes. Praticamente 90% dos nossos assinantes chegaram pela indicação - um serviço bem prestado se torna de sucesso por si só.

Nossa infraestrutura técnica é robusta e projetada para alta disponibilidade. Utilizamos um núcleo de rede baseado em BGP, CGNAT e BRAS, garantindo estabilidade e segurança na navegação. Contamos com trânsito IP de alta qualidade através da K2 Telecom, o que nos permite oferecer rotas otimizadas e baixa latência para serviços críticos e jogos.`;