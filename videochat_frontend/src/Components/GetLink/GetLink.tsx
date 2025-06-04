import React from 'react';
import styles from './GetLink.module.css';
import { useEffect } from "react";

function GetLink() {
    const [isCopied, setCopied] = React.useState(false);

    useEffect(() => {
        if(isCopied) {
            setTimeout(() => {
                setCopied(false);
            }, 1000)
        }
    }, [isCopied]);

    function getLink() {
        const textToCopy = window.location.href.split('rooms/')[1];

        navigator.clipboard.writeText(textToCopy)
            .then(() => setCopied(true))
            .catch(err => console.error(err));
    }

    return (
        <>
            <div onClick={getLink} className={styles.container}>
                Get Link
            </div>
            {isCopied &&
                <div className={styles.copied}>
                    Copied!
                </div>
            }
        </>
    );
}

export default GetLink;