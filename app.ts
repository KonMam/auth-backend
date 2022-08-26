import express from 'express'
import { appDataSource } from './src/data-source'
import cors from 'cors'
import bodyParser from 'body-parser'


const PORT = 5000

appDataSource.initialize()
    .then(() => {
    console.log("Data Source has been initialized!")
    }).catch((err) => {
    console.error("Error during Data Source initialization:", err)
})

const app = express()
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
);
app.use(cors())

const auth_router = require('./src/routes/auth.router')
const pokemon_router = require('./src/routes/pokemon.router')
const dbtest_router = require('./src/routes/dbtest.router')

app.use('/', auth_router)
app.use('/pokemon', pokemon_router)
app.use('/db-test', dbtest_router)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})