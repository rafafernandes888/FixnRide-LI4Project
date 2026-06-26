import { jsPDF } from "jspdf";

export const gerarPDFFatura = (fatura) => {
  if (!fatura) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MobiFix — Fatura', margin, 22);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let y = 52;

  const dataEmissao = fatura.DataEmissao ? new Date(fatura.DataEmissao).toLocaleString('pt-PT') : '—';

  const rows = [
    ['Número', fatura.NumeroFatura ?? '—'],
    ['Data', dataEmissao],
    ['Cliente NIF', fatura.ClienteNIF ?? '—'],
    ['Método', fatura.MetodoPagamento ?? '—'],
    ['Referência', fatura.ServicoID ? `Serviço #${fatura.ServicoID}` : (fatura.VendaID ? `Venda #${fatura.VendaID}` : '—')],
  ];

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 40, y);
    y += 9;
  });

  y += 6;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const total = Number(fatura.ValorTotal ?? 0).toFixed(2);
  doc.text(`Total: €${total}`, margin, y);

  if (Array.isArray(fatura.Devolucoes) && fatura.Devolucoes.length > 0) {
    y += 16;
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text('DEVOLVIDA', margin, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    fatura.Devolucoes.forEach(d => {
      y += 8;
      doc.text(`Motivo: ${d.Motivo ?? '—'}`, margin, y);
    });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeNum = String(fatura.NumeroFatura ?? 'fatura').replace(/[^\w-]/g, '_');
  doc.save(`Fatura_${safeNum}_${timestamp}.pdf`);
};
