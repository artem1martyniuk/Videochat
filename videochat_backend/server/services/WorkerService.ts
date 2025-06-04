import { createWorker } from "mediasoup";
import WorkerWrapper from "./WorkerWrapper";

class WorkerService {
    workers: WorkerWrapper[] = [];
    maxUsersPerWorker = 9;

    constructor() {
        this.initWorkers(1); // початковий worker
    }

    async initWorkers(count: number) {
        for (let i = 0; i < count; i++) {
            const worker = await createWorker();
            this.workers.push(new WorkerWrapper(worker));
        }
    }

    async getAvailableWorker(): Promise<WorkerWrapper> {
        const suitable = this.workers.find(w => w.usersCount < this.maxUsersPerWorker);
        if (suitable) return suitable;

        const newWorker = await createWorker();
        const wrapper = new WorkerWrapper(newWorker);
        this.workers.push(wrapper);
        return wrapper;
    }
}

export default WorkerService;
