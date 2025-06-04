import { Socket } from "socket.io";
import Queue from "./utils/Queue";

const queue = new Queue();

interface ChatMessage {
    sender: string;
    message: string;
    timestamp: number;
    roomId: string;
}

interface ChatRooms {
    [roomId: string]: ChatMessage[];
}

const chatRooms: ChatRooms = {};
const CHAT_MESSAGE = "CHAT_MESSAGE";

export const setupChatHandlers = (socket: Socket, users: any) => {

    socket.on(CHAT_MESSAGE, ({ roomId, message }) => {
        if (!users[roomId] || !users[roomId][socket.id]) {
            return;
        }

        const userName = users[roomId][socket.id];
        const newMessage: ChatMessage = {
            sender: userName,
            message,
            timestamp: Date.now(),
            roomId
        };

        socket.to(roomId).emit(CHAT_MESSAGE, newMessage);
    });
};

export const cleanupChat = (roomId: string) => {
    delete chatRooms[roomId];
};

