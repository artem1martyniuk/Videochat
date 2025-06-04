import {Socket} from "socket.io";

class ChatService {

    onError: (error: any, socket: Socket) => void;

    constructor(onError: (error: any, socket: Socket) => void) {
        this.onError = onError;
    }

    onMessage(userObj: any, message: string, socket: Socket) {
        if(userObj.errorMsg) {
            console.error(userObj.errorMsg)
            return this.onError(userObj.errorMsg, socket);
        }

        return {
            message: message,
            sender: socket.id,
            senderUserName: userObj.info.userName,
        }
    }
}

export default ChatService;