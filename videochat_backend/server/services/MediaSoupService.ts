import User from "./User";
import Room from "./Room";
import {
    Worker,
    Router,
    DtlsParameters,
    MediaKind,
    RtpParameters,
    AppData,
    Transport,
    RtpCapabilities, Consumer
} from "mediasoup/node/lib/types";
import {Socket} from "socket.io";
import {mediaCodecs} from "../config/mediaCodecs";
import {ACTIONS} from "../../utils/Actions";
import {StreamType} from "../config/StreamType";
import WorkerService from "./WorkerService";

interface JoinClientParams {
    roomId: string,
    userName: string,
    socket: Socket,
    isCreate: boolean
}

class MediaSoupService {

    rooms: Room[];
    workerService: WorkerService;
    onError: (error: any, socket: Socket) => void;

    constructor(onError: (error: any, socket: Socket) => void) {
        this.rooms = [];
        this.workerService = new WorkerService();
        this.onError = onError;
    }

    private checkIfRoomExist(roomId: string) {
        let isExistRoom = false;

        this.rooms.forEach(room => {
            if (room.roomId === roomId) {
                isExistRoom = true;
            }
        })

        return isExistRoom;
    }

    private getRoomByRoomId(roomId: string) {
        return this.rooms.find(room => room.roomId === roomId);
    }

    public getUser(roomId: string, socketId: string) {
        const result: {
            info: any,
            errorMsg: string,
        } = {
            info: null,
            errorMsg: ''
        }

        const room = this.rooms.find(room => room.roomId === roomId);
        if(!room) {
            result.errorMsg = 'Could not find room'
            return result;
        }

        const user = room.getUserBySocketId(socketId);
        if(!user) {
            result.errorMsg = 'Could not find user';
            return result;
        }

        result.info = user;
        return result;
    }

    private getTransport(roomId: string, socketId: string, isProducer: boolean) {

        const user = this.getUser(roomId, socketId);
        const result = {
            info: null,
            errorMsg: ''
        }

        if(user.errorMsg) {
            return user;
        }

        let transport;
        if(isProducer) {
           transport = user.info.producerTransport
        } else {
            transport = user.info.consumerTransport
        }

        if(!transport) {
            result.errorMsg = 'Could not find transport';
            return result;
        }
        result.info = transport;

        return result
    }

    async joinClient({ roomId, userName, socket, isCreate}: JoinClientParams) {
        let room: Room;
        let router: Router;
        const isRoomExist = this.checkIfRoomExist(roomId)

        if (!isRoomExist && isCreate) {
            const workerWrapper = await this.workerService.getAvailableWorker();
            router = await workerWrapper.createRouter(mediaCodecs);

            room = new Room(router, roomId, workerWrapper);
            this.rooms.push(room);
        } else if(!isRoomExist && !isCreate) {
            return {
                error: true
            }
        }else {
            const existingRoom = this.getRoomByRoomId(roomId);
            if (!existingRoom) return;
            room = existingRoom;
            router = room.router;
        }
//
        const user = new User(userName, socket.id);
        room.addNewUser(user);
        room.workerWrapper.incrementUsers();

        return {error: false, caps: router.rtpCapabilities};
    }

    async getProducers({roomId, socket}: { roomId: string, socket: Socket }, callback: any) {
        const room = this.getRoomByRoomId(roomId);

        if (!room) {
            console.log("Room not found");
            return this.onError('Could not find a room', socket);
        }

        return room.getProducers();
    }

    async createTransport(
        {roomId, socket, isProducer}:
            { roomId: string, isProducer: boolean, socket: Socket },callback: any
        ) {
        const room = this.getRoomByRoomId(roomId);
        if (!room) {
            return this.onError('Could not find a room', socket);
        }

        const transport = await room.setNewTransportToUser(socket.id, isProducer);

        if (!transport) {
            return this.onError('Could not create a transport', socket);
        }

        return transport;
    }

    async produce({roomId, kind, rtpParameters, appData, socket}:
                {
                    roomId: string, kind: MediaKind,
                    rtpParameters: RtpParameters,
                    appData: AppData,
                    socket: Socket
                }
    ) {
        const {type} = appData;

        const transportObj = this.getTransport(roomId, socket.id, true);
        if(transportObj.errorMsg) {
            return this.onError(transportObj.errorMsg, socket);
        }

        const producer = await transportObj.info.produce({
            kind,
            rtpParameters,
            appData: {
                socketId: socket.id
            }
        });

        const userObj = this.getUser(roomId, socket.id);
        if(userObj.errorMsg) {
            return this.onError(userObj.errorMsg, socket);
        }

        userObj.info.setProducers(kind, type, producer);

        return {producer, type, userName: userObj.info.userName}
    }

    async connectTransport({roomId, dtlsParameters, socket, isProducer}: {
        roomId: string,
        dtlsParameters: DtlsParameters,
        socket: Socket,
        isProducer: boolean,
    }) {
        const transportObj = this.getTransport(roomId, socket.id, isProducer);
        if(transportObj.errorMsg) {
            return this.onError(transportObj.errorMsg, socket);
        }

        try {
            await transportObj.info.connect({dtlsParameters});
        } catch (error) {
            console.error('Error connecting transport:', error);
            return this.onError(`Could not connect a transport\n${error}`, socket)
        }
    }

    async consume(
        {rtpCapabilities, producerId, roomId, socket}:
            {
                rtpCapabilities: RtpCapabilities,
                producerId: string,
                roomId: string,
                socket: Socket
            }
    ) {
        const transportObj = this.getTransport(roomId, socket.id, false);
        if(transportObj.errorMsg) {
            return this.onError(transportObj.errorMsg, socket);
        }

        try{
            const consumer = await transportObj.info.consume({
                producerId,
                rtpCapabilities,
                paused: true
            });

            const user = this.getUser(roomId, socket.id)

            user.info.setConsumers(producerId, consumer);

            const params = {
                id: consumer.id,
                producerId: producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
            }

            return params;
        }catch(e) {
            console.error(`Error in consume: ${e}`)
            return this.onError(`Error connecting transport\n${e}`, socket)
        }
    }

    getUsers(roomId: string, socket: Socket)  {
        const room = this.getRoomByRoomId(roomId);
        if(!room) {
            return []
        }

        const users = room.getUsers()
        const usersResult: Array<{userName: string, id: string}> = []

        users.forEach(user => {
            usersResult.push({userName: user.userName, id: user.socketId})
        })

        return usersResult;
    }

    async consumerResume(
        {roomId, producerId, socket}:
            {
                roomId: string,
                producerId: string,
                socket: Socket
            }
        ) {

        const user = this.getUser(roomId, socket.id)
        if(user.errorMsg) {
            console.error(user.errorMsg)
            return this.onError(user.errorMsg, socket);
        }
        const consumer: Consumer = user.info.getConsumer(producerId);
        if(!consumer) {
            console.error(user.errorMsg)
            return this.onError('Consumer was not found', socket);
        }
        try{
            await consumer.resume();
        }catch(e) {
            console.error(e);
            return this.onError('Can not resume track', socket);
        }
    }

    deleteProducers({params, socket}: {
        params: {
            roomId: string,
            type: StreamType
        },
        socket: Socket
    }) {
        const user = this.getUser(params.roomId, socket.id);
        if(user.errorMsg) {
            return this.onError('Could not find user', socket);
        }

        user.info.stopCertainProducers(params.type);
    }

    disconnect(socket: Socket) {

        const currentRoom = Array.from(socket.rooms).filter(r => r !== socket.id)[0]
        if(!currentRoom) {
            return this.onError('Could not find room', socket);
        }

        const room = this.getRoomByRoomId(currentRoom);
        if (!room) {
            return this.onError('Could not find a room', socket);
        }

        room.deleteUser(socket.id);
        room.workerWrapper.decrementUsers();

        socket.to(room.roomId).emit(ACTIONS.SOCKET_DISCONNECTED, {
            socketId: socket.id,
        })
    }
}

export default MediaSoupService;