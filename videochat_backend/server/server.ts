import express from "express";
import http from "http";
import {Server} from "socket.io";
import SocketService from "./services/SocketService";

const PORT = process.env.PORT || 3200;
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'http://frontend:3000',
            'http://main_backend:3200',
            'http://127.0.0.1:3000',
        ],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    },
});

const socketService = new SocketService();

server.listen(PORT as number, '0.0.0.0', () => {
    console.log(`Server4 is running on http://localhost:${PORT}`);
});