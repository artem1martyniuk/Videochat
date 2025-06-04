import { Router } from "mediasoup/node/lib/types";
import User from "./User";
import WorkerWrapper from "./WorkerWrapper";

class Room {
    router: Router;
    roomId: string;
    users: Array<User>;
    workerWrapper: WorkerWrapper;

    constructor(router: Router, roomId: string, workerWrapper: WorkerWrapper) {
        this.roomId = roomId;
        this.router = router;
        this.workerWrapper = workerWrapper;
        this.users = [];
    }

    addNewUser(user: User) {
        this.users.push(user);
    }

    getUsers() {
        return this.users;
    }

    getUserBySocketId(socketId: string): User | undefined {
        return this.users.find((user) => user.socketId === socketId);
    }

    async setNewTransportToUser(socketId: string, isProducer: boolean) {
        const user = this.getUserBySocketId(socketId);
        if (!user) return;

        return isProducer
            ? user.setProducerTransport(this.router)
            : user.setConsumerTransport(this.router);
    }

    getProducers() {
        return this.users
            .flatMap(user => {
                if (!user.producers) return [];
                return Object.entries(user.producers)
                    .map(([type, producer]) => producer && ({
                        id: producer.id,
                        producerSocketId: producer.appData.socketId,
                        kind: producer.kind,
                        type: type.includes('displayScreen') ? 'displayMedia' : 'userMedia',
                        producerUserName: user.userName
                    }))
                    .filter(Boolean);
            });
    }

    deleteUser(socketId: string) {
        const userIndex = this.users.findIndex(u => u.socketId === socketId);
        if (userIndex !== -1) {
            this.users[userIndex].stopAllProducers();
            this.users.splice(userIndex, 1);
            console.log(`${socketId} disconnected`);
        }
    }
}

export default Room;
