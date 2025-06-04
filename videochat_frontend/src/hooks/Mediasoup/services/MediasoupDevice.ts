import {Device} from "mediasoup-client";
import {RtpCapabilities, Transport} from "mediasoup-client/lib/types";

class MediasoupDevice {
    private device: Device;

    constructor() {
        this.device = new Device();
    }

    async loadDevice(routerRtpCapabilities: RtpCapabilities): Promise<void> {
        await this.device.load({ routerRtpCapabilities });
    }

    getRtpCapabilities(): RtpCapabilities {
        return this.device.rtpCapabilities;
    }

    createRecvTransport(params: any): Transport {
        return this.device.createRecvTransport(params);
    }

    createSendTransport(params: any): Transport {
        return this.device.createSendTransport(params);
    }
}

export default MediasoupDevice;