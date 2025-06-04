const iceServers = [
    {urls: "stun:stun.l.google.com:19302"},
    {urls: "stun:stun1.l.google.com:19302"},
    {urls: "stun:stun2.l.google.com:19302"},
    {urls: "stun:stun3.l.google.com:19302"},
    {urls: "stun:stun4.l.google.com:19302"},
    {urls: "stun:stun.stunprotocol.org"},
    {urls: "stun:stun.voipstunt.com"},
    {urls: "stun:stun.ekiga.net"},
    {urls: "stun:stun.sipgate.net"},
    {urls: "stun:stun.ideasip.com"},
    {urls: "stun:stun.voxgratia.org"},
    {
        urls: "turn:relay.metered.ca:80",
        username: "open",
        credential: "open"
    }
];

export default iceServers;