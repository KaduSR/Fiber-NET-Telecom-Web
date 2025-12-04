import { jsPDF } from 'jspdf';

export const generateEthicsCodePDF = () => {
  const doc = new jsPDF();
  
  // Constants for layout
  const ORANGE = '#FF6B00';
  const DARK_GREY = '#1F2937'; // gray-800
  const BODY_GREY = '#4B5563'; // gray-600
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = 20;

  // Helper to add page if needed
  const checkPageBreak = (heightNeeded: number) => {
    if (cursorY + heightNeeded > pageHeight - margin) {
      doc.addPage();
      cursorY = 25; // Reset cursor with top margin
      return true;
    }
    return false;
  };

  // Header Function (to be called if needed on new pages, currently only first page has big header)
  doc.setFontSize(24);
  doc.setTextColor(ORANGE);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO DE ÉTICA E CONDUTA', pageWidth / 2, cursorY, { align: 'center' });
  
  cursorY += 10;
  doc.setFontSize(11);
  doc.setTextColor(DARK_GREY);
  doc.setFont('helvetica', 'normal');
  doc.text('Fiber.Net Telecom - CNPJ 22.969.088/0001-97', pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 8;
  doc.setDrawColor(255, 107, 0); // Orange Line
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 15;

  // Introduction Text
  doc.setFontSize(10);
  doc.setTextColor(BODY_GREY);
  const introText = "Este documento estabelece as diretrizes fundamentais que orientam a conduta profissional e ética de todos os colaboradores e parceiros da Fiber.Net Telecom.";
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, margin, cursorY);
  cursorY += 15;

  // Content Sections
  const sections = [
    {
      title: '1. APRESENTAÇÃO',
      text: 'Este Código estabelece os princípios éticos que regem as relações da Fiber.Net com seus colaboradores, clientes, parceiros e a sociedade. Nosso objetivo é garantir que todas as atividades sejam conduzidas com integridade, transparência e respeito, refletindo nossa missão de conectar pessoas com qualidade e confiança.'
    },
    {
      title: '2. PRINCÍPIOS FUNDAMENTAIS',
      text: 'Nossos pilares são: Integridade, Transparência, Respeito, Responsabilidade Social e Profissionalismo. Repudiamos qualquer forma de corrupção, suborno ou discriminação. Atuamos em conformidade com as leis vigentes e as normas da ANATEL.'
    },
    {
      title: '3. RELACIONAMENTO COM CLIENTES',
      text: 'Comprometemo-nos a oferecer serviços de qualidade, com informações claras e precisas. O atendimento deve ser cordial, ágil e eficiente, respeitando sempre os direitos do consumidor. Não prometemos o que não podemos cumprir e buscamos sempre a satisfação do cliente.'
    },
    {
      title: '4. SEGURANÇA DA INFORMAÇÃO',
      text: 'A proteção de dados é prioridade absoluta. Seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD), garantindo a confidencialidade e segurança das informações de clientes e da empresa. É estritamente proibido o compartilhamento não autorizado de dados sensíveis.'
    },
    {
      title: '5. CANAL DE DENÚNCIAS',
      text: 'Disponibilizamos canais seguros para reporte de violações éticas. As denúncias são tratadas com sigilo absoluto e não haverá retaliação aos denunciantes de boa-fé. Contato: etica@fibernettelecom.com ou (24) 2458-1861.'
    },
    {
      title: '6. DISPOSIÇÕES FINAIS',
      text: 'Este código deve ser seguido por todos os colaboradores. O descumprimento das normas aqui estabelecidas estará sujeito a medidas disciplinares. Este documento é revisado periodicamente para garantir sua atualização e eficácia.'
    }
  ];

  sections.forEach(section => {
    // Calculate heights first
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const splitBody = doc.splitTextToSize(section.text, contentWidth);
    const bodyHeight = splitBody.length * 5; // Approx height per line
    const titleHeight = 8;
    const totalBlockHeight = titleHeight + bodyHeight + 10; // + padding

    checkPageBreak(totalBlockHeight);

    // Render Title
    doc.setFontSize(12);
    doc.setTextColor(ORANGE);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, cursorY);
    cursorY += 7;

    // Render Body
    doc.setFontSize(10);
    doc.setTextColor(BODY_GREY);
    doc.setFont('helvetica', 'normal');
    doc.text(splitBody, margin, cursorY);
    
    cursorY += bodyHeight + 8; // Spacing after section
  });

  // Footer (Add to all pages)
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer Line
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    // Footer Text
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Fiber.Net Telecom - Documento Oficial`, margin, pageHeight - 10);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  doc.save('Codigo-Etica-FiberNet.pdf');
};