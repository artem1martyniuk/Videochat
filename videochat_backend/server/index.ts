import express from "express";
import http from "http";
import {Server, Socket} from "socket.io";
import * as mediasoup from "mediasoup";
import transportParams from './config/transportParams'
import {
    Worker,
    Router,
    WebRtcTransport,
    Producer,
    Consumer
} from "mediasoup/node/lib/types";
import {mediaCodecs} from "./config/mediaCodecs";
import {ACTIONS} from "../utils/Actions";
import {StreamType} from "./config/StreamType";
import {setupChatHandlers} from "./chat";

const PORT = process.env.PORT || 3200;
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

const connections = io.of("/mediasoup");

interface Room {
    router: Router,
    sockets: Socket[],
}

interface Rooms {
    [roomId: string]: Room;
}

interface Producers {
    [roomId: string]: {
        [socketId: string]: {
            audioProducer: Producer | null,
            videoProducer: Producer | null,
            displayScreenAudioProducer: Producer | null,
            displayScreenVideoProducer: Producer | null,
        };
    }
}

interface Consumers {
    [roomId: string]: {
        [socketId: string]: {
            [producerId: string]: Consumer
        };
    }
}

interface ProducerTransports {
    [roomId: string]: {
        [socketId: string]: {
            transport: WebRtcTransport | null,
        }
    }
}

interface ConsumerTransports {
    [roomId: string]: {
        [socketId: string]: {
            transport: WebRtcTransport | null,
        }
    }
}

interface Users {
    [roomId: string]: {
        [socketId: string]: string
    }
}

let worker: Worker;
let rooms: Rooms = {};
let producerTransports: ProducerTransports = {}
let consumerTransports: ConsumerTransports = {}
let producers: Producers = {};
let consumers: Consumers = {};
let users: Users = {}

const createWorker = async () => {
    const newWorker = await mediasoup.createWorker();
    console.log(`Worker process ID: ${newWorker.pid}`);

    newWorker.on('died', (e) => {
        console.log(`Worker ${newWorker.pid} was died because ${e}`);
        setTimeout(() => {
            process.exit();
        }, 2000);
    });

    return newWorker;
};

const init = async () => {
    worker = await createWorker();
};

const initializeTransports = (roomId: string, socketId: string, isProducer: boolean) => {
    if (isProducer) {
        if (!producerTransports[roomId]) {
            producerTransports[roomId] = {};
        }
        if (!producerTransports[roomId][socketId]) {
            producerTransports[roomId][socketId] = {
                transport: null
            };
        }
    } else {
        if (!consumerTransports[roomId]) {
            consumerTransports[roomId] = {};
        }
        if (!consumerTransports[roomId][socketId]) {
            consumerTransports[roomId][socketId] = {
                transport: null
            };
        }
    }
};

const initializeProducers = (roomId: string) => {
    if (!producers[roomId]) {
        producers[roomId] = {};
    }
};

const initializeConsumers = (roomId: string, socketId: string) => {
    if (!consumers[roomId]) {
        consumers[roomId] = {};
    }
    if (!consumers[roomId][socketId]) {
        consumers[roomId][socketId] = {};
    }
};

const initializeUsers = (roomId: string) => {
    if (!users[roomId]) {
        users[roomId] = {};
    }
}

init().catch(error => {
    console.error('Failed to create worker:', error);
    process.exit(1);
});

server.setMaxListeners(20)

connections.on('connection', async (socket) => {
    console.log(`${socket.id} was connected`)
    socket.emit('conn-success');

    setupChatHandlers(socket, users);

    socket.on(ACTIONS.JOIN_ROOM, async ({roomId, userName}, callback) => {
        initializeUsers(roomId);
        let router1: Router;
        let sockets: Socket[] = [];

        users[roomId][socket.id] = userName;

        if (rooms[roomId]) {
            router1 = rooms[roomId].router;
            sockets = rooms[roomId].sockets;
        } else {
            router1 = await worker.createRouter({mediaCodecs});
        }

        const rtpCapabilities = router1.rtpCapabilities;

        rooms[roomId] = {
            router: router1,
            sockets: [...sockets, socket]
        }

        socket.join(roomId);
        await callback(rtpCapabilities);
    });

    socket.on(ACTIONS.GET_PRODUCERS, async ({roomId}, callback) => {
        if (!producers[roomId] || Object.keys(producers[roomId]).length === 0) {
            return callback([]);
        }


        const producersData = Object.values(producers[roomId]).map(obj => {
            return Object.entries(obj).map(([type, producer]) => { // type буде ключем (audioProducer, videoProducer, і т.д.)
                if (!producer || producer.appData.socketId === socket.id) return null;
                return {
                    id: producer.id,
                    producerSocketId: producer.appData.socketId,
                    kind: producer.kind,
                    type: type.includes('displayScreen') ? 'displayMedia' : 'userMedia',
                    producerUserName: users[roomId][producer.appData.socketId as 'string']
                };
            });
        }).flat().filter(Boolean);

        callback(producersData);
    });

    socket.on('consume', async ({rtpCapabilities, producerId, roomId}, callback) => {

        const consumerTransport = consumerTransports[roomId][socket.id].transport;

        if (!consumerTransport) {
            return callback({error: 'Consumer transport not found'});
        }

        try {
            const consumer = await consumerTransport.consume({
                producerId,
                rtpCapabilities,
                paused: true
            });

            initializeConsumers(roomId, socket.id);

            consumers[roomId][socket.id][producerId] = consumer;

            consumer.on('transportclose', () => {
                delete consumers[roomId][socket.id][producerId];
                consumer.close();
            });

            consumer.on('producerclose', () => {
                delete consumers[roomId][socket.id][producerId];
                consumer.close();
            });

            const params = {
                id: consumer.id,
                producerId: producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
            };

            callback({params});
        } catch (error) {
            console.error('Error in consume:', error);
            callback({error: 'Failed to create consumer'});
        }
    });

    socket.on(ACTIONS.CONSUME_TRANSPORT_CONNECT, async ({roomId, dtlsParameters}) => {

        const consumerTransport = consumerTransports[roomId][socket.id].transport;
        if (consumerTransport) {
            try {
                await consumerTransport.connect({dtlsParameters});
            } catch (error) {
                console.error('Error connecting consumer transport:', error);
            }
        } else {
            console.warn("Consumer transport does not exist");
        }
    });

    socket.on(ACTIONS.CREATE_TRANSPORT, async ({roomId, isProducer}, callback) => {
        try {
            let router: Router;

            router = rooms[roomId].router;
            const transport = await router.createWebRtcTransport(transportParams);

            initializeTransports(roomId, socket.id, isProducer);

            if (isProducer) {
                producerTransports[roomId][socket.id].transport = transport;
            } else {
                consumerTransports[roomId][socket.id].transport = transport;
            }

            callback({
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            });
        } catch (error) {
            console.error('Error creating transport:', error);
            callback({error: 'Failed to create transport'});
        }
    });

    socket.on(ACTIONS.SEND_TRANSPORT_CONNECT, async ({roomId, dtlsParameters}) => {

        const producerTransport = producerTransports[roomId][socket.id].transport
        if (producerTransport) {
            try {
                await producerTransport.connect({dtlsParameters});
            } catch (error) {
                console.error('Error connecting producer transport:', error);
            }
        }
    });

    socket.on(ACTIONS.TRANSPORT_PRODUCE, async ({roomId, kind, rtpParameters, appData}, callback) => {
        try {
            const {type} = appData;

            initializeProducers(roomId);
            const producerTransport = producerTransports[roomId][socket.id].transport;

            if (producerTransport) {
                const producer = await producerTransport.produce({
                    kind,
                    rtpParameters,
                    appData: {
                        socketId: socket.id
                    }
                });

                if (!producers[roomId][socket.id]) {
                    producers[roomId][socket.id] = {
                        audioProducer: null,
                        videoProducer: null,
                        displayScreenAudioProducer: null,
                        displayScreenVideoProducer: null
                    }
                }

                if (type === StreamType.displayMedia) {
                    if (kind === 'video') {
                        producers[roomId][socket.id].displayScreenVideoProducer = producer;
                    } else {
                        producers[roomId][socket.id].displayScreenAudioProducer = producer;
                    }
                } else {
                    if (kind === 'video') {
                        producers[roomId][socket.id].videoProducer = producer;
                    } else {
                        producers[roomId][socket.id].audioProducer = producer;
                    }
                }

                callback({id: producer.id});
                socket.to(roomId).emit(ACTIONS.NEW_PRODUCER_CREATED, {
                    id: producer.id,
                    producerSocketId: producer.appData.socketId,
                    kind: producer.kind,
                    type,
                    producerUserName: users[roomId][producer.appData.socketId as 'string']
                });
            } else {
                callback({error: 'Producer transport not found'});
            }
        } catch (error) {
            console.error('Error in transport produce:', error);
            callback({error: 'Failed to produce'});
        }
    });

    socket.on(ACTIONS.DISCONNECT_PRODUCERS, params => {

        socket.to(params.roomId).emit(ACTIONS.DELETE_STREAM, {
            socketId: socket.id,
            type: params.type
        })

        let isUserMedia = params.type === StreamType.userMedia;

        if(isUserMedia) {
            producers[params.roomId][socket.id].audioProducer?.close();
            producers[params.roomId][socket.id].videoProducer?.close();
        } else {
            producers[params.roomId][socket.id]?.displayScreenVideoProducer?.close();
            producers[params.roomId][socket.id]?.displayScreenAudioProducer?.close();
            if(producers[params.roomId][socket.id]) {
                producers[params.roomId][socket.id].displayScreenAudioProducer = null;
                producers[params.roomId][socket.id].displayScreenVideoProducer = null;
            }
        }

    })

    socket.on('consumer-resume', async ({roomId, producerId}) => {

        await consumers[roomId][socket.id][producerId].resume();
    })

    socket.on('disconnecting', () => {

        const currentRooms = Array.from(socket.rooms).filter(r => r !== socket.id);

        currentRooms.forEach(roomId => {
            socket.to(roomId).emit(ACTIONS.SOCKET_DISCONNECTED, {
                socketId: socket.id,
            })
            if (rooms[roomId]) {
                rooms[roomId].sockets = rooms[roomId].sockets.filter(s => s.id !== socket.id);
                if (producers[roomId]?.[socket.id]) {
                    delete producers[roomId][socket.id];
                }

                if (consumers[roomId]?.[socket.id]) {
                    delete consumers[roomId][socket.id];
                }
                if (producerTransports[roomId]?.[socket.id]) {
                    delete producerTransports[roomId]?.[socket.id];
                }
                if (consumerTransports[roomId]?.[socket.id]) {
                    delete consumerTransports[roomId]?.[socket.id];
                }
            }
            console.log(`${socket.id} disconnected`);
        });
    });
});

server.listen(PORT as number, 'localhost', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});