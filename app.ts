import express from 'express'

const PORT = 5000

const app = express()
const auth_router = require('./src/routes/auth.router')

app.use('/auth', auth_router)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})