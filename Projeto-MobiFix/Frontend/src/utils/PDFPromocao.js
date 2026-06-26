import { jsPDF } from 'jspdf';

/**
 * Gera um PDF de marketing para uma promoção MobiFix
 */
export function gerarPDFPromocao(promo, pecas = []) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const centerX = pageWidth / 2;

  // === FUNDO GRADIENTE (faixa superior) ===
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 0, pageWidth, 100, 'F');

  // Faixa decorativa mais escura
  doc.setFillColor(29, 78, 216); // Blue-700
  doc.rect(0, 85, pageWidth, 15, 'F');

  // === BADGE "PROMOÇÃO" ===
  doc.setFillColor(239, 68, 68); // Red-500
  doc.roundedRect(centerX - 30, 12, 60, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('OFERTA ESPECIAL', centerX, 20, { align: 'center' });

  // === LOGO / MARCA ===
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('MobiFix', centerX, 38, { align: 'center' });

  // === DESCONTO GRANDE ===
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.text(`-${promo.desconto}%`, centerX, 70, { align: 'center' });

  // === NOME DA CAMPANHA ===
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(promo.nome.toUpperCase(), centerX, 95, { align: 'center' });

  // === CORPO ===
  let y = 115;

  // Caixa de validade
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(margin, y, contentWidth, 20, 4, 4, 'F');

  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('VALIDADE DA CAMPANHA', centerX, y + 8, { align: 'center' });

  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const dataInicioFormatted = new Date(promo.dataInicio).toLocaleDateString('pt-PT');
  const dataFimFormatted = new Date(promo.dataFim).toLocaleDateString('pt-PT');
  doc.text(`${dataInicioFormatted}  a  ${dataFimFormatted}`, centerX, y + 17, { align: 'center' });

  y += 32;

  // === PEÇAS EM PROMOÇÃO ===
  if (pecas.length > 0) {
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUTOS EM CAMPANHA', centerX, y + 6, { align: 'center' });
    y += 16;

    pecas.forEach((peca) => {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }

      // Linha do produto
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');

      // Nome
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(peca.Nome, margin + 6, y + 7);

      // Categoria
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(peca.Categoria || '', margin + 6, y + 13);

      // Preço original riscado
      const pvpOriginal = `${peca.PVP.toFixed(2)}€`;
      const pvpComDesconto = (peca.PVP * (1 - promo.desconto / 100)).toFixed(2);
      const precoX = pageWidth - margin - 6;

      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const originalWidth = doc.getTextWidth(pvpOriginal);
      doc.text(pvpOriginal, precoX - 30, y + 7, { align: 'right' });
      // Linha a riscar o preço original
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);
      doc.line(precoX - 30 - originalWidth, y + 5.5, precoX - 30, y + 5.5);

      // Preço com desconto
      doc.setTextColor(239, 68, 68); // Red-500
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`${pvpComDesconto}€`, precoX, y + 11, { align: 'right' });

      y += 22;
    });
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Aplicável a produtos selecionados em loja.', centerX, y + 5, { align: 'center' });
    y += 15;
  }

  // === RODAPÉ ===
  // Faixa inferior
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Promoção sujeita a disponibilidade de stock. Não acumulável com outras promoções.', centerX, pageHeight - 18, { align: 'center' });
  doc.text('MobiFix - Assistência Técnica de Trotinetes Elétricas', centerX, pageHeight - 12, { align: 'center' });

  // Salvar
  const nomeFile = promo.nome.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Promo_${nomeFile}.pdf`);
}
