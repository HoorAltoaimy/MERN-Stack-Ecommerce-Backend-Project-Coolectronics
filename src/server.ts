import express, { Application } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
//import mongoose from 'mongoose'
//import { config } from 'dotenv'

//import 'dotenv/config'
import { dev } from './config'
import { connectDB } from './config/db'
import apiErrorHandler from './middlewares/errorHandler'
import usersRouter from './routers/usersRoutes'
import productsRouter from './routers/productsRouter'
import ordersRouter from './routers/ordersRouter'
import categoreisRouter from './routers/categoriesRouter'
import myLogger from './middlewares/logger'
import { createError } from './util/createError'

//config()
const app: Application = express()
const PORT: number = dev.app.port
//const URL = process.env.MONGODB_URL as string

app.use('/public', express.static('public'))
app.use(myLogger)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.get('/', (req, res) => {
  res.send('healthe checkup')
})

app.use('/api/users', usersRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/products', productsRouter)
app.use('/api/categories', categoreisRouter)
//app.use('/auth', authenticationRouter)

// app.use((req, res, next) => {
//   const error = createError(404, 'Rout not found')
//   next(error)
// }) 
// app.use(errorHandler)
app.use(apiErrorHandler)

// mongoose
//   .connect(URL)
//   .then(() => {
//     console.log('Database connected')
//   })
//   .catch((err: Error) => {
//     console.log('MongoDB connection error, ', err)
//   })
connectDB()

app.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`)
})
