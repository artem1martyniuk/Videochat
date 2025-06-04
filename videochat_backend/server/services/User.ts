import {Consumer, MediaKind, Producer, Router, WebRtcTransport} from "mediasoup/node/lib/types";
import transportParams from "../config/transportParams";
import {StreamType} from "../config/StreamType";

interface Producers {
    audioProducer: Producer | null,
    videoProducer: Producer | null,
    displayScreenAudioProducer: Producer | null,
    displayScreenVideoProducer: Producer | null,
}

interface Consumers {
    [producerId: string]: Consumer
}

class User {

    userName: string;
    socketId: string;
    producerTransport!: WebRtcTransport;
    consumerTransport!: WebRtcTransport;
    producers!: Producers;
    consumers!: Consumers;

    constructor(userName: string, socketId: string) {
        this.userName = userName;
        this.socketId = socketId;
        this.initializeFields();
    }

    initializeFields() {
        this.producers = {
            audioProducer: null,
            videoProducer: null,
            displayScreenAudioProducer: null,
            displayScreenVideoProducer: null,
        }

        this.consumers = {}
    }

    async setProducerTransport(router: Router): Promise<WebRtcTransport> {
        this.producerTransport = await router.createWebRtcTransport(transportParams)
        return this.producerTransport;
    }

    async setConsumerTransport(router: Router): Promise<WebRtcTransport> {
        this.consumerTransport = await router.createWebRtcTransport(transportParams)
        return this.consumerTransport;
    }

    setProducers(kind: MediaKind, type: StreamType, producer: Producer): void {
        if (type === StreamType.displayMedia) {
            if (kind === 'video') {
                this.producers.displayScreenVideoProducer = producer;
            } else {
                this.producers.displayScreenAudioProducer = producer;
            }
        } else {
            if (kind === 'video') {
                this.producers.videoProducer = producer;
            } else {
                this.producers.audioProducer = producer;
            }
        }
    }

    setConsumers(producerId: string, consumer: Consumer): void {
        this.consumers[producerId] = consumer;

        consumer.on('transportclose', () => {
            delete this.consumers[producerId];
            consumer.close();
        });

        consumer.on('producerclose', () => {
            delete this.consumers[producerId];
            consumer.close();
        });
    }

    getConsumer(producerId: string): Consumer {
        return this.consumers[producerId]
    }

    stopAllProducers() {
        Object.values(this.producers).forEach((producer: Producer | null) => {
            if(producer) {
                producer.close();
            }
        })
    }

    stopCertainProducers(type: StreamType) {
        let isUserMedia = type === StreamType.userMedia;

        if(isUserMedia) {
            this.producers.audioProducer?.close();
            this.producers.videoProducer?.close();
        } else {
            console.log("Stopping display producers")
            this.producers.displayScreenVideoProducer?.close();
            this.producers.displayScreenAudioProducer?.close();
            if(this.producers) {
                this.producers.displayScreenAudioProducer = null;
                this.producers.displayScreenVideoProducer = null;
            }
        }
    }
}

export default User;