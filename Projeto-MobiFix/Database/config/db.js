const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error("❌ ERRO: A variável MONGO_URI não foi definida!");
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB ligado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Erro ao ligar ao MongoDB: ${error.message}`);
        process.exit(1); 
    }
};

module.exports = connectDB;