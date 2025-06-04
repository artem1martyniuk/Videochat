import React from 'react';
import {Alert} from "antd";

function ErrorAlert({error}) {
    return (
        <div style={{minHeight: '10vh', width: '20%'}}>
            {error && (Array.isArray(error) ? (error as Array<any>).map(err => {
                return (
                    <Alert key={err.msg} message={err.msg} type="error"
                           style={{marginBottom: '10px', width: '100%', height: 'fit-content', textAlign: 'center'}}/>
                )
            }) : <Alert message={error} type="error" style={{width: '100%', textAlign: 'center'}} />)}
        </div>
    );
}

export default ErrorAlert;