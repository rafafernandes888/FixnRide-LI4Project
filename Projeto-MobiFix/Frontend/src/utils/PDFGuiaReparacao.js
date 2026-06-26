import { jsPDF } from 'jspdf';

/**
 * Gera um PDF profissional para o diagnóstico da trotinete
 */
export function generateDiagnosticPDF(repair, interventions = [], parts = [], notes = '') {
  if (!repair) {
    console.warn('[PDF] repair vazio — ignorado.');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  const normIntervs = interventions.map(i => ({
    name: i.name ?? i.Descricao ?? `Intervenção #${i.IntervencaoID ?? ''}`,
    code: i.code ?? i.IntervencaoID ?? '—',
    category: i.category ?? i.Especialidade ?? '—',
    estimatedTime: Number(i.estimatedTime ?? i.TempoEstimadoMinutos ?? 0),
    price: Number(i.price ?? i.PrecoFixoMaoDeObra ?? 0),
  }));

  const normParts = parts.map(p => ({
    name: p.name ?? p.Nome ?? 'Peça',
    ean: p.ean ?? p.CodigoEAN ?? '—',
    quantity: Number(p.quantity ?? p.StockAtual ?? 1),
  }));

  // --- FUNÇÕES AUXILIARES ---
  const checkPageFlow = (neededHeight) => {
    if (y + neededHeight > 275) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const drawSectionHeader = (title) => {
    checkPageFlow(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(title.toUpperCase(), margin + 2, y + 6);
    y += 15;
  };

  // --- CABEÇALHO ---
  // Logo / Título Principal
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO TÉCNICO', margin, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ordem de Serviço: ${repair.id}`, margin, 30);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, pageWidth - margin, 30, { align: 'right' });
  
  y = 50;
  doc.setTextColor(0, 0, 0);

  // --- DADOS DO VEÍCULO E CLIENTE ---
  drawSectionHeader('Informações do Equipamento');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const vehicleInfo = [
    ['Matrícula/ID:', repair.vehiclePlate ?? '—', 'Cliente NIF:', repair.clientNif ?? repair.clientName ?? '—'],
    ['Marca/Modelo:', `${repair.vehicleBrand ?? '—'} ${repair.vehicleModel ?? ''}`.trim(), 'Serviço:', `#${repair.servicoId ?? repair.id ?? '—'}`],
    ['Nº Série:', repair.vehiclePlate ?? 'N/A', 'Hora:', repair.scheduledTime ?? '—'],
  ];

  vehicleInfo.forEach(row => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(row[1]), margin + 35, y);
    
    doc.setFont('helvetica', 'bold');
    doc.text(row[2], margin + 90, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(row[3]), margin + 115, y);
    y += 7;
  });

  y += 5;

  // --- INTERVENÇÕES ---
  if (normIntervs.length > 0) {
    drawSectionHeader('Intervenções a Realizar');

    normIntervs.forEach((item, index) => {
      checkPageFlow(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${item.name}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`€${item.price.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
      y += 5;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Código: #${item.code} | Categoria: ${item.category}`, margin + 4, y);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      y += 8;
    });

    const totalMaoObra = normIntervs.reduce((sum, i) => sum + i.price, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Mão de Obra: €${totalMaoObra.toFixed(2)}`, margin, y);
    y += 12;
  }

  // --- PEÇAS ---
  if (normParts.length > 0) {
    drawSectionHeader('Peças Necessárias');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Descrição', margin, y);
    doc.text('EAN', margin + 80, y);
    doc.text('Qtd', pageWidth - margin, y, { align: 'right' });
    y += 4;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    normParts.forEach(part => {
      checkPageFlow(8);
      doc.text(String(part.name), margin, y);
      doc.text(String(part.ean), margin + 80, y);
      doc.text(String(part.quantity), pageWidth - margin, y, { align: 'right' });
      y += 7;
    });
    y += 5;
  }

  // --- NOTAS ---
  if (notes.trim()) {
    drawSectionHeader('Observações do Técnico');
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(notes, contentWidth);
    checkPageFlow(splitNotes.length * 7);
    doc.text(splitNotes, margin, y);
    y += (splitNotes.length * 6) + 10;
  }

  // --- RODAPÉ E NUMERAÇÃO ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `Documento gerado pelo Sistema de Oficina - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safePlate = String(repair.vehiclePlate ?? 'SN').replace(/[^\w-]/g, '_');
  doc.save(`Relatorio_${safePlate}_${repair.id ?? 'X'}_${timestamp}.pdf`);
}