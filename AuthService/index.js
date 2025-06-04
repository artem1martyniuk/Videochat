import dotenv from "dotenv";
dotenv.config();
import routes from './src/routes/auth.js';
import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import {db} from "./config/db.js";

const app = express()
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://frontend:3000',
        'http://auth_backend:4000',
        'http://127.0.0.1:3000',
        'http://0.0.0.0:3000'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
}));

app.use('/auth_service', routes)

const PORT = process.env.PORT || 4000
app.listen(PORT, '0.0.0.0', () => {
    db().then(_ => console.log(`Listening first on port ${PORT}`))
})

