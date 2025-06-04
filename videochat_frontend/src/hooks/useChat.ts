import React, {useEffect, useState} from 'react';
import {socket} from "../config/otherConfig/socket.ts"
import {ACTIONS} from "../config/otherConfig/Actions.ts";

export interface MessageObj {
    message: string;
    sender: string;
    senderUserName: string,
    isMine: boolean,
}

function useChat(roomId: string) {
    const [allMessages, setAllMessages] = useState<Array<MessageObj>>([])

    useEffect(() => {
        socket.on(ACTIONS.BROADCAST_CHAT_MESSAGE, ({messageObject}) => {
            messageObject.isMine = messageObject.sender === socket.id;
            console.log(messageObject);
            setAllMessages(prev => [...prev, messageObject])
        })
    }, []);

    function sendMessage(message: string) {
        socket.emit(ACTIONS.NEW_CHAT_MESSAGE, {roomId, message})
    }

    return {sendMessage, allMessages}
}

export default useChat;