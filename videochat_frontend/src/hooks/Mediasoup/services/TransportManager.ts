import {Transport, Consumer} from "mediasoup-client/lib/types";

class TransportManager {
    private producerTransport: Transport | null = null;
    private consumerTransport: Transport | null = null;

    setProducerTransport(transport: Transport): void {
        this.producerTransport = transport;
    }

    setConsumerTransport(transport: Transport): void {
        this.consumerTransport = transport;
    }

    getProducerTransport(): Transport | null {
        return this.producerTransport;
    }

    getConsumerTransport(): Transport | null {
        return this.consumerTransport;
    }

    async consumerTransportConnect(params: any): Promise<Consumer> {

        const consumer = await this.consumerTransport?.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters
        });

        if(!consumer) {
            throw new Error("Consumer was not created");
        }

        return consumer
    }

    clearTransports(): void {
        if (this.producerTransport) {
            this.producerTransport.close();
            this.producerTransport = null;
        }

        if (this.consumerTransport) {
            this.consumerTransport.close();
            this.consumerTransport = null;
        }
    }
}

export default TransportManager;