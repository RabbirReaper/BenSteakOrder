import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'

dotenv.config()
const app = express()
const port = 3000

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = join(__dirname, 'src', 'views', 'index.html');

mongoose.connect(`${process.env.MongoDB_url}`)
  .then(() => {
    console.log("MongoDB connected")
  })
  .catch((err) => {
    console.log("MongoDB connection failed")
    console.log(err)
  })

