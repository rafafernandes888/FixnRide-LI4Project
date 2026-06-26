const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];


    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Formato de token inválido.' });
    }

    try {
        const secret = process.env.JWT_SECRET; 
        const decoded = jwt.verify(token, secret);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Acesso negado. Token inválido ou expirado.' });
    }
};

module.exports = verificarToken;