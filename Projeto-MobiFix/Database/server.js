require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const logger = require('morgan')
const app = express()


app.use(express.json())
app.use(logger('dev'))
app.use(express.urlencoded({ extended: true }))

const router = require('./routes/index')


connectDB()

const PORT = process.env.PORT || 3001

app.use('/api', router)

app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada na API de Dados.' });
});

app.listen(PORT, () => {
    console.log(`API de dados à escuta na porta ${PORT}...`)
})