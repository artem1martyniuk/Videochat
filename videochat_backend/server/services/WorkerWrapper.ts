import { Worker, Router } from "mediasoup/node/lib/types";

class WorkerWrapper {
    worker: Worker;
    routers: Router[] = [];
    usersCount = 0;

    constructor(worker: Worker) {
        this.worker = worker;
    }

    async createRouter(mediaCodecs: any): Promise<Router> {
        const router = await this.worker.createRouter({ mediaCodecs });
        this.routers.push(router);
        return router;
    }

    incrementUsers() {
        console.log(this.usersCount);
        this.usersCount++;
    }

    decrementUsers() {
        this.usersCount = Math.max(0, this.usersCount - 1);
    }
}

export default WorkerWrapper;
