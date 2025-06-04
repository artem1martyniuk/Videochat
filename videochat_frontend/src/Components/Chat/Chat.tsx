import React, {useEffect, useRef, useState} from 'react';
import styles from './Chat.module.css'
import {BsSend} from "react-icons/bs";
import useChat from "../../hooks/useChat.ts";
import Message from "../Message/Message.tsx";

function Chat({roomId}: { roomId: string }) {
    const [message, setMessage] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [error, setError] = useState('');

    const {sendMessage, allMessages} = useChat(roomId)

    function checkAndSendMessage() {
        if (message.length === 0 || message.length > 50) {
            setError("You can only send messages that are at least 1 character long and no more than 50 characters long");

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                setError('');
                timeoutRef.current = null;
            }, 4000);

            return;
        }

        setMessage('');
        sendMessage(message);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkAndSendMessage();
        }
    }

    return (
        <div className={styles.main_container}>
            <div className={styles.message_container}>
                {allMessages.map((message, index) => {
                    return <Message key={index} message={message}/>
                })}
            </div>
            <div className={styles.input_container}>
                {error ? <div className={styles.error}>{error}</div> :
                    <>
                        <input
                            className={styles.input}
                            type="text"
                            value={message}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your message here"
                            onChange={e => setMessage(e.target.value)}
                        />
                        <BsSend onClick={checkAndSendMessage} className={styles.send_button}/>
                    </>
                }
            </div>
        </div>
    );
}

export default Chat;