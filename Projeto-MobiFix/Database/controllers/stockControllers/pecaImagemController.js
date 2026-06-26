const fs = require('fs');
const path = require('path');
const Peca = require('../../models/stocks/Peca');
const { paraPecaDto } = require('../../dtos/stockDtos/pecaDto');

const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads/pecas');

const MIME_TO_EXT = {
    'image/jpeg': '.jpg',
    'image/jpg':  '.jpg',
    'image/png':  '.png',
    'image/webp': '.webp',
    'image/gif':  '.gif'
};

const EXT_TO_MIME = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.webp': 'image/webp',
    '.gif':  'image/gif'
};

function garantirDiretorio() {
    if (!fs.existsSync(UPLOADS_ROOT)) {
        fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
    }
}

function sanitizarEan(ean) {
    return String(ean).replace(/[^a-zA-Z0-9_-]/g, '');
}

function localizarFicheiro(ean) {
    const safe = sanitizarEan(ean);
    for (const ext of Object.keys(EXT_TO_MIME)) {
        const candidato = path.join(UPLOADS_ROOT, safe + ext);
        if (fs.existsSync(candidato)) return { caminho: candidato, ext };
    }
    return null;
}

exports.uploadImagem = async (req, res) => {
    try {
        const { ean } = req.params;
        const mime = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
        const ext = MIME_TO_EXT[mime];

        if (!ext) {
            return res.status(415).json({ error: `Tipo de imagem não suportado: ${mime || 'desconhecido'}.` });
        }
        if (!req.body || !req.body.length) {
            return res.status(400).json({ error: 'Corpo do pedido vazio.' });
        }

        const peca = await Peca.findById(ean);
        if (!peca) {
            return res.status(404).json({ mensagem: 'Peça não encontrada.' });
        }

        garantirDiretorio();

        // Remove qualquer ficheiro anterior associado à peça (independentemente da extensão)
        const safe = sanitizarEan(ean);
        for (const e of Object.keys(EXT_TO_MIME)) {
            const antigo = path.join(UPLOADS_ROOT, safe + e);
            if (fs.existsSync(antigo)) fs.unlinkSync(antigo);
        }

        const nomeFicheiro = safe + ext;
        const destino = path.join(UPLOADS_ROOT, nomeFicheiro);
        fs.writeFileSync(destino, req.body);

        peca.imagem = nomeFicheiro;
        await peca.save();

        return res.status(200).json(paraPecaDto(peca.toObject()));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterImagem = async (req, res) => {
    try {
        const { ean } = req.params;
        const localizado = localizarFicheiro(ean);
        if (!localizado) {
            return res.status(404).json({ mensagem: 'Imagem não encontrada.' });
        }

        const mime = EXT_TO_MIME[localizado.ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, max-age=300');
        return fs.createReadStream(localizado.caminho).pipe(res);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.eliminarImagem = async (req, res) => {
    try {
        const { ean } = req.params;
        const peca = await Peca.findById(ean);
        if (!peca) return res.status(404).json({ mensagem: 'Peça não encontrada.' });

        const safe = sanitizarEan(ean);
        for (const e of Object.keys(EXT_TO_MIME)) {
            const antigo = path.join(UPLOADS_ROOT, safe + e);
            if (fs.existsSync(antigo)) fs.unlinkSync(antigo);
        }

        peca.imagem = null;
        await peca.save();
        return res.status(200).json(paraPecaDto(peca.toObject()));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
