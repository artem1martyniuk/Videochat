import {Socket} from "socket.io-client";
import {RtpCapabilities, Transport} from "mediasoup-client/lib/types";
import {ACTIONS} from "../../../config/otherConfig/Actions.ts";
import {userDTO} from "../types";

interface RTBCapsResponse {
    error: boolean,
    rtpCab?: RtpCapabilities,
    msg?: string
}

class SocketHandler {
    private socket: Socket;
    private readonly roomId: string;

    constructor(roomId: string, socket: Socket) {
        this.socket = socket;
        this.roomId = roomId;
    }

    connect(): void {
        this.socket.connect();
    }

    disconnect(): void {
        this.socket.off('conn-success');
        this.socket.off(ACTIONS.NEW_PRODUCER_CREATED);
        this.socket.off(ACTIONS.SOCKET_DISCONNECTED);
        this.socket.disconnect();
    }

    async getRtpCapabilitiesAndSetName(userName: string, isCreate: boolean): Promise<RTBCapsResponse> {
        return new Promise((resolve) => {
            this.socket.emit(ACTIONS.JOIN_ROOM, {roomId: this.roomId, userName, isCreate}, (capabilities: RTBCapsResponse) => {
                console.log(capabilities)
                resolve(capabilities);
            });
        });
    }

    async createTransport(isProducer: boolean): Promise<any> {
        return new Promise((resolve) => {
            this.socket.emit(ACTIONS.CREATE_TRANSPORT,
                {roomId: this.roomId, isProducer},
                (params) => resolve(params)
            );
        });
    }

    setOnConnectProducerTransport(transport: Transport, roomId: string) {
        transport.on('connect', async ({dtlsParameters}, callback, errback) => {
            try {
                this.socket.emit(ACTIONS.SEND_TRANSPORT_CONNECT, {
                    roomId: roomId,
                    dtlsParameters: dtlsParameters
                })

                callback();
            } catch (e: any) {
                errback(e);
            }
        })
    }

    setOnProduceTransport(transport: Transport, roomId: string) {
        transport.on('produce', async ({kind, rtpParameters, appData}, callback, errback) => {
            try {
                this.socket.emit(ACTIONS.TRANSPORT_PRODUCE, {
                    roomId,
                    kind,
                    rtpParameters,
                    appData,
                }, ({id}) => {
                    callback(id);
                })
            } catch (e: any) {
                errback(e);
            }
        })
    }

    setOnConnectConsumerTransport(transport: Transport, roomId: string) {
        transport.on('connect', async ({dtlsParameters}, callback, errback) => {
            try {
                this.socket.emit(ACTIONS.CONSUME_TRANSPORT_CONNECT, {
                    roomId: roomId,
                    dtlsParameters: dtlsParameters,
                });
                callback();

            } catch (e: any) {
                errback(e);
            }
        });
    }

    async getProducersDataInRoom(roomId: string) {
        return new Promise((resolve) => {
            this.socket.emit(ACTIONS.GET_PRODUCERS, {roomId}, producersData => {
                console.log(producersData)
                resolve(producersData);
            });
        })
    }

    listenForNewProducer(callback: (producerData: any) => void) {
        this.socket.on(ACTIONS.NEW_PRODUCER_CREATED, (producerData) => {

            callback(producerData);
        });
    }

    getUsers(roomId: string): Promise<userDTO[]> {
        return new Promise((resolve) => {
            this.socket.emit(ACTIONS.GET_USERS, {roomId},(response: { users: userDTO[] }) => {
                resolve(response.users);
            })
        })
    }

    getConsumerParams(rtpCapabilities: RtpCapabilities, producerId: string, roomId: string) {
        return new Promise((resolve) => {
            this.socket.emit('consume', {
                rtpCapabilities,
                producerId,
                roomId
            }, ({params}) => {
                resolve(params);
            })
        })
    }

    resumeTrack(roomId: string, producerId: string) {
        console.log("Resuming")
        this.socket.emit('consumer-resume', {roomId, producerId});
    }

    disconnectProducers(params: any) {
        this.socket.emit(ACTIONS.DISCONNECT_PRODUCERS, params)
    }

    onDeleteStream(callback: any) {
        this.socket.on(ACTIONS.DELETE_STREAM, ({socketId, type}) => {
            callback(socketId, type)
        });
    }

    onDisconnect(callback: any) {
        this.socket.on(ACTIONS.SOCKET_DISCONNECTED, ({socketId}) => {
            callback(socketId)
        })
    }
}

export default SocketHandler;