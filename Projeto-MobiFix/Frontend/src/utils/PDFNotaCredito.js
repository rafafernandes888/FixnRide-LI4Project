import jsPDF from 'jspdf';

export function gerarNotaCredito(fatura, motivo) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210; // largura A4
    const margem = 20;
    let y = 0;

    // ── Paleta ────────────────────────────────────────────────────────────────
    const PRETO = [15, 23, 42];   // slate-900
    const CINZENTO = [100, 116, 139];  // slate-500
    const CLARO = [241, 245, 249];  // slate-100
    const VERMELHO = [220, 38, 38];   // red-600

    // ── Helpers ───────────────────────────────────────────────────────────────
    const linha = (cor = CLARO) => {
        doc.setDrawColor(...cor);
        doc.setLineWidth(0.3);
        doc.line(margem, y, W - margem, y);
    };

    const txt = (texto, x, tamanho = 10, cor = PRETO, estilo = 'normal') => {
        doc.setFontSize(tamanho);
        doc.setTextColor(...cor);
        doc.setFont('helvetica', estilo);
        doc.text(String(texto), x, y);
    };

    // ── Cabeçalho ─────────────────────────────────────────────────────────────
    y = 28;
    // Bloco preto à esquerda (identidade)
    doc.setFillColor(...PRETO);
    doc.roundedRect(margem, 14, 60, 20, 3, 3, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('MobiFix', margem + 6, 26.5);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Micromobilidade Urbana', margem + 6, 31);

    // Título à direita
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRETO);
    doc.text('NOTA DE CRÉDITO', W - margem, 22, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CINZENTO);
    doc.text(`Ref. devolução de ${fatura.NumeroFatura}`, W - margem, 29, { align: 'right' });

    // Linha separadora grossa
    y = 40;
    doc.setDrawColor(...PRETO);
    doc.setLineWidth(1);
    doc.line(margem, y, W - margem, y);

    // ── Dados do documento ────────────────────────────────────────────────────
    y = 52;
    // Caixa cinzenta de fundo
    doc.setFillColor(...CLARO);
    doc.roundedRect(margem, y - 6, W - margem * 2, 28, 2, 2, 'F');

    const col1 = margem + 6;
    const col2 = W / 2 + 6;

    // Linha 1
    y = 50;
    txt('Fatura de origem', col1, 7, CINZENTO);
    txt('Cliente (NIF)', col2, 7, CINZENTO);

    y = 56;
    txt(fatura.NumeroFatura, col1, 11, PRETO, 'bold');
    txt(fatura.ClienteNIF, col2, 11, PRETO, 'bold');

    // Linha 2
    y = 64;
    txt('Método de pagamento', col1, 7, CINZENTO);
    txt('Valor a creditar', col2, 7, CINZENTO);

    y = 70;
    txt(fatura.MetodoPagamento ?? '—', col1, 11, PRETO, 'bold');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...VERMELHO);
    doc.text(`-€${Number(fatura.ValorTotal ?? 0).toFixed(2)}`, col2, y);

    // ── Motivo ────────────────────────────────────────────────────────────────
    y = 88;
    txt('MOTIVO DA DEVOLUÇÃO', margem, 7, CINZENTO, 'bold');

    y = 92;
    linha();

    y = 101;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PRETO);
    // Quebra automática de linha se o motivo for longo
    const linhasMotivo = doc.splitTextToSize(motivo, W - margem * 2);
    doc.text(linhasMotivo, margem, y);

    y += linhasMotivo.length * 6 + 6;
    linha();

    // ── Itens da fatura ───────────────────────────────────────────────────────
    if (fatura.Itens?.length > 0) {
        y += 12;
        txt('ITENS DEVOLVIDOS', margem, 7, CINZENTO, 'bold');
        y += 6;
        linha();
        y += 8;

        // Cabeçalho tabela
        doc.setFillColor(...CLARO);
        doc.rect(margem, y - 5, W - margem * 2, 8, 'F');
        txt('Descrição / EAN', margem + 2, 8, CINZENTO, 'bold');
        txt('Qtd', W - margem - 30, 8, CINZENTO, 'bold');
        txt('Total', W - margem - 2, 8, CINZENTO, 'bold');
        y += 6;
        linha();
        y += 6;

        for (const item of fatura.Itens) {
            txt(item.PecaEAN ?? '—', margem + 2, 9, PRETO);
            txt(String(item.Quantidade ?? 1), W - margem - 30, 9, PRETO);
            y += 7;
            linha([220, 220, 226]);
            y += 4;
        }
    }

    // ── Total creditado (destaque) ────────────────────────────────────────────
    y += 10;
    doc.setFillColor(...PRETO);
    doc.roundedRect(W - margem - 70, y - 7, 70, 16, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL CREDITADO', W - margem - 4, y - 1, { align: 'right' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`€${Number(fatura.ValorTotal ?? 0).toFixed(2)}`, W - margem - 4, y + 6, { align: 'right' });

    // ── Rodapé ────────────────────────────────────────────────────────────────
    y = 272;
    linha();
    y = 278;
    txt('MobiFix — Micromobilidade Urbana', margem, 7, CINZENTO);
    txt('Documento gerado automaticamente. Não tem validade fiscal.', W - margem, 7, CINZENTO);

    // ── Download ──────────────────────────────────────────────────────────────
    doc.save(`nota-credito-${fatura.NumeroFatura}.pdf`);
}