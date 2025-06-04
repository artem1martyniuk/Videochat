import React from 'react';
import styles from './Message.module.css'
import { MessageObj } from '../../hooks/useChat.ts'

function Message({ message }: { message: MessageObj}) {
    return (
        <div className={`${styles.main_container} ${message.isMine ? styles.my_message : styles.remote_message}`}>
            <p>{message.message}</p>
            <span className={styles.sender}>{message.senderUserName}</span>
        </div>
    );
}

export default Message;