import {io} from "../server";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import {Socket} from "socket.io";
import {ACTIONS} from "../../utils/Actions";
import MediaSoupService from "./MediaSoupService";
import ChatService from "./ChatService";

class SocketService {

    private mediaSoupConnections: any;
    private blurSocket: ClientSocket;
    private mediaSoupService!: MediaSoupService;
    private chatService!: ChatService;

    constructor() {
        this.mediaSoupConnections = io.of("/mediasoup");
        this.blurSocket = ioClient('http://localhost:5000');
        this.mediaSoupService = new MediaSoupService(this.onError);
        this.chatService = new ChatService(this.onError);
        this.setUpConnections()
        this.sendHelloWorld();
    }

    onError(error: any, socket: Socket) {
        socket.emit(ACTIONS.ERROR, {error});
    }

    setUpConnections() {
        this.mediaSoupConnections.on('connection', (socket: Socket) => {
            console.log(`${socket.id} was connected`)

            socket.emit('conn-success');

            this.setListeners(socket);
        });
    }

    setListeners(socket: Socket) {
        this.onJoinRoom(socket);
        this.onGetProducers(socket);
        this.onCreateTransport(socket);
        this.onConnectProducerTransport(socket);
        this.onProduce(socket);
        this.onConnectConsumerTransport(socket);
        this.onConsume(socket);
        this.onConsumerResume(socket);
        this.onMessage(socket);
        this.getUsersInRoom(socket);
        this.onDeleteProducers(socket);
        this.onDisconnect(socket);
    }

    sendHelloWorld() {
        this.blurSocket.emit('get_event', {
            message: 'Hello World!'
        });
    }

    onJoinRoom(socket: Socket) {
        socket.on(ACTIONS.JOIN_ROOM, async ({roomId, userName, isCreate}, callback) => {
            let rtpCab;
            const res = await this.mediaSoupService.joinClient(
                {
                    roomId,
                    userName,
                    socket: socket,
                    isCreate
                }
            )

            if(!res || res.error) {
                socket.disconnect();
                console.log(`${socket.id} disconnected`);
                await callback({error: true, msg: 'Could not join this room'})
                return;
            }

            rtpCab = res.caps;

            socket.join(roomId);

            try {
                await callback({error: false, rtpCab})
            } catch (e) {
                console.log(e);
                this.onError('Could not send rtpcapabilities', socket)
            }
        })
    }

    onGetProducers(socket: Socket) {
        socket.on(ACTIONS.GET_PRODUCERS, async ({roomId}, callback) => {
            const producersData = await this.mediaSoupService.getProducers({roomId, socket}, callback)

            callback(producersData);
        });
    }

    onCreateTransport(socket: Socket) {
        socket.on(ACTIONS.CREATE_TRANSPORT, async ({roomId, isProducer}, callback) => {
            const transport = await this.mediaSoupService.createTransport({roomId, isProducer, socket}, callback);
            if(!transport) {
                return;
            }

            callback({
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            })
        })
    }

    onConnectProducerTransport(socket: Socket) {
        socket.on(ACTIONS.SEND_TRANSPORT_CONNECT, async ({roomId, dtlsParameters}) => {
            await this.mediaSoupService.connectTransport({roomId, dtlsParameters, socket, isProducer: true})
        })
    }

    onProduce(socket: Socket) {
        socket.on(ACTIONS.TRANSPORT_PRODUCE, async ({roomId, kind, rtpParameters, appData}, callback) => {
            const res = await this.mediaSoupService.produce({roomId, kind, rtpParameters, appData, socket});
            const producer = res?.producer;

            socket.to(roomId).emit(ACTIONS.NEW_PRODUCER_CREATED, {
                id: producer.id,
                producerSocketId: producer.appData.socketId,
                kind: producer.kind,
                type: res?.type,
                producerUserName: res?.userName
            });

            callback({id: producer.id});
        })
    }

    onConnectConsumerTransport(socket: Socket) {
        socket.on(ACTIONS.CONSUME_TRANSPORT_CONNECT, async ({roomId, dtlsParameters}) => {
            await this.mediaSoupService.connectTransport({roomId, dtlsParameters, socket, isProducer: false})
        })
    }

    onConsume(socket: Socket) {
        socket.on('consume', async ({rtpCapabilities, producerId, roomId}, callback) => {
            const params = await this.mediaSoupService.consume({rtpCapabilities, producerId, roomId, socket});

            callback({params});
        })
    }

    onConsumerResume(socket: Socket) {
        socket.on('consumer-resume', async ({roomId, producerId}) => {
            await this.mediaSoupService.consumerResume({roomId, producerId, socket})
        })
    }

    onMessage(socket: Socket) {
        socket.on(ACTIONS.NEW_CHAT_MESSAGE, async ({roomId, message}) => {
            const userObj = this.mediaSoupService.getUser(roomId, socket.id)
            const messageObject = this.chatService.onMessage(userObj, message, socket)
            console.log(`Користувачі в кімнаті ${roomId}:`, io.sockets.adapter.rooms.get(roomId));
            this.mediaSoupConnections.in(roomId).emit(ACTIONS.BROADCAST_CHAT_MESSAGE, {messageObject})
        })
    }

    getUsersInRoom(socket: Socket) {
        socket.on(ACTIONS.GET_USERS, ({roomId}, callback) => {
            callback({users: this.mediaSoupService.getUsers(roomId, socket)});
        })
    }

    onDeleteProducers(socket: Socket) {
        socket.on(ACTIONS.DISCONNECT_PRODUCERS, params => {
            socket.to(params.roomId).emit(ACTIONS.DELETE_STREAM, {
                socketId: socket.id,
                type: params.type
            })

            this.mediaSoupService.deleteProducers({params, socket});
        })
    }

    onDisconnect(socket: Socket) {
        socket.on(ACTIONS.DISCONNECTING, () => {
            this.mediaSoupService.disconnect(socket);
        })
    }
}

export default SocketService;