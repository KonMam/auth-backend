import express from 'express'
import { appDataSource } from './src/data-source'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

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
app.use(cors({ origin: "http://127.0.0.1:5173", credentials: true}))


app.use(cookieParser())

const auth_router = require('./src/routes/auth.router')
const task_router = require('./src/routes/task.router')

// for testing user data
const userdata_router = require('./src/routes/userdata.router')

app.use('/', auth_router)
app.use('/tasks', task_router)
app.use('/db-test', userdata_router)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})