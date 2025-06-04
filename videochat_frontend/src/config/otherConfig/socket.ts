import sio from 'socket.io-client'

const URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3200/mediasoup'
    : `http://${window.location.hostname}:3200/mediasoup`;

export const socket = sio(URL, {
    autoConnect: false
});
