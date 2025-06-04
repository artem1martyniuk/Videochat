import MediasoupDevice from "./MediasoupDevice.ts";
import TransportManager from "./TransportManager.ts";
import StreamManager from "./StreamManager.ts";
import SocketHandler from "./SocketHandler.ts";
import {ConsumersData, Producers, StreamType, TrackType, userDTO} from "../types";
import {socket} from "../../../config/otherConfig/socket.ts";
import videoTrackParams from "../../../config/trackConfig/VideoTrackParams.ts";
import audioTrackParams from "../../../config/trackConfig/AudioTrackParams.ts";
import {Producer} from "mediasoup-client/lib/types";
import {LOCAL_MEDIA, Streams} from "../useTestMediasoup.ts";
import BlurService from "./StreamProcessor/BlurService.ts";
import getAvatar from "../../../utils/getAvatar.ts";
import NoiseSuppressionService from "./StreamProcessor/NoiseSpressionService.ts";

class MediasoupRoom {
    private device: MediasoupDevice;
    private transportManager: TransportManager;
    private readonly roomId: string;
    private streamManager: StreamManager;
    private socketHandler: SocketHandler;
    private blurService: BlurService | null = null;
    private noiseSuppressionService: NoiseSuppressionService | null = null;

    private producerUserMedia: Producers = {
        audio: null,
        video: null
    };

    private producerDisplayMedia: Producers = {
        audio: null,
        video: null
    }

    private consumers: ConsumersData = {};

    constructor(roomId: string) {
        this.roomId = roomId;
        this.device = new MediasoupDevice();
        this.transportManager = new TransportManager();
        this.streamManager = new StreamManager();
        this.socketHandler = new SocketHandler(roomId, socket);
    }

    async join(userName: string, isCreate: boolean): Promise<void | string> {
        this.socketHandler.connect();
        const capabilities = await this.socketHandler.getRtpCapabilitiesAndSetName(userName, isCreate);

        if(capabilities.error) {
            return capabilities.msg;
        }
        if(!capabilities.rtpCab) {
            return 'Can not take router capabilities';
        }

        const caps = capabilities.rtpCab;
        await this.device.loadDevice(caps);
        await this.setupTransports();
    }

    async listenForNewProducer(onNewProducer: any) {
        this.socketHandler.listenForNewProducer(async (producerData) => {
            const clients = await this.createConsumer([producerData]);

            if (clients.length > 0) {
                onNewProducer(clients[0]);
            }
        });
    }

    private async setupTransports(): Promise<void> {
        const producerParams = await this.socketHandler.createTransport(true);
        const producerTransport = this.device.createSendTransport(producerParams);
        this.transportManager.setProducerTransport(producerTransport);
        this.socketHandler.setOnConnectProducerTransport(producerTransport, this.roomId);
        this.socketHandler.setOnProduceTransport(producerTransport, this.roomId);

        const consumerParams = await this.socketHandler.createTransport(false);
        const consumerTransport = this.device.createRecvTransport(consumerParams);
        this.transportManager.setConsumerTransport(consumerTransport);
        this.socketHandler.setOnConnectConsumerTransport(consumerTransport, this.roomId);
    }

    async loadAllProducers() {
        const producersData: any = await this.socketHandler.getProducersDataInRoom(this.roomId);
        return this.createConsumer(producersData);
    }

    async produceMedia(trackType: TrackType) {
        const stream = await this.streamManager.createUserMediaStream(trackType);

        await this.connectProducers(stream, StreamType.userMedia);
    }

    async connectProducers(stream: MediaStream, streamType: StreamType): Promise<void> {

        for (const track of stream.getTracks()) {
            this.streamManager.setTrack(LOCAL_MEDIA, track, streamType)

            let trackParams = {
                track: track,
                appData: {type: streamType},
            }

            if (track.kind === 'video') {
                trackParams = {
                    ...trackParams,
                    ...videoTrackParams
                }
            } else {
                trackParams = {
                    ...trackParams,
                    ...audioTrackParams
                }
            }

            const producer = await this.transportManager.getProducerTransport()?.produce({...trackParams})

            if (producer) {
                if (producer.kind === 'video') {
                    this.setProducers(producer, streamType, TrackType.video)
                } else {
                    this.setProducers(producer, streamType, TrackType.audio)
                }
            }
        }
    }

    private setProducers(producer: Producer, streamType: StreamType, trackType: TrackType): void {
        if (streamType === StreamType.userMedia) {
            this.producerUserMedia[trackType] = producer;
        } else {
            this.producerDisplayMedia[trackType] = producer;
        }
    }

    private calculateTracksNeeded(producersData: any) {
        const pairs = {}

        for (let i = 0; i < producersData.length; i++) {
            const socket = producersData[i].producerSocketId
            const type = producersData[i].type
            if(!pairs[socket]) {
                pairs[socket] = {}
            }

            if(pairs[socket][type]) {
                pairs[socket][type] += 1;
            } else {
                pairs[socket][type] = 1;
            }
        }

        return pairs;
    }

    private async createConsumer(producersData: any) {

        const clients: Streams[] = [];

        const tracksNeededForEachStream = this.calculateTracksNeeded(producersData);

        for (const producerData of producersData) {
            const params = await this.socketHandler.getConsumerParams(
                this.device.getRtpCapabilities(),
                producerData.id,
                this.roomId
            );

            const socketId = producerData.producerSocketId;
            const consumer = await this.transportManager.consumerTransportConnect(params);

            this.streamManager.setTrack(socketId, consumer.track, producerData.type);

            this.consumers[producerData.id] = consumer;

            const neededTracks = tracksNeededForEachStream[producerData.producerSocketId][producerData.type];

            if (this.shouldAddClient(socketId, producerData.type, neededTracks)) {
                clients.push({clientId: socketId, type: producerData.type, userName: producerData.producerUserName});
            }

            this.socketHandler.resumeTrack(this.roomId, producerData.id);
        }

        return clients;
    }

    shouldAddClient(clientId: string, type: StreamType, neededTracks = 2): boolean {
        const stream = this.getStream(clientId, type);
        return stream?.getTracks().length === neededTracks;
    }

    getUsers(): Promise<userDTO[]> {
        return this.socketHandler.getUsers(this.roomId);
    }

    async toggleVideo(isEnable: boolean, userName: string) {
        const currentStream = this.streamManager.getStream(LOCAL_MEDIA, StreamType.userMedia);

        if (isEnable && currentStream) {
            await this.updateVideo();
        } else if (currentStream?.getVideoTracks()[0]) {
            const currentTrack = currentStream?.getVideoTracks()[0]
            currentTrack.stop();
            currentStream.removeTrack(currentTrack);
            const avatarTrack = getAvatar(userName);
            currentStream?.addTrack(avatarTrack);

            await this.producerUserMedia.video?.replaceTrack({track: avatarTrack});
        }
    }

    async toggleAudio(isEnable: boolean) {
        if(!isEnable) {
            const stream = this.streamManager.getStream(LOCAL_MEDIA, StreamType.userMedia);

            if (stream) {
                stream.getAudioTracks()[0].enabled = isEnable;
            }
        } else {
            await this.updateAudio();
        }
    }

    onDeleteStream(callback: any) {
        this.socketHandler.onDeleteStream((clientId: string, type: StreamType) => {
            this.streamManager.deleteStream(clientId, type);

            callback(clientId, type)
        });
    }

    async toggleDisplayScreen(isEnable: boolean, switchOff: any) {
        if (isEnable) {
            try {
                const stream = await this.streamManager.createDisplayMediaStream();

                stream.getTracks().forEach(track => {
                    track.onended = () => {
                        switchOff();
                    };
                });

                await this.connectProducers(stream, StreamType.displayMedia);

                return LOCAL_MEDIA;
            } catch (e) {
                console.log(e);
                switchOff();
            }
        } else {
            const video = this.producerDisplayMedia.video;

            // console.log(this.producerDisplayMedia.video)
            // console.log(this.producerDisplayMedia.audio)

            const params: { type: StreamType, roomId: string, producerIds?: string[] } = {
                type: StreamType.displayMedia,
                roomId: this.roomId
            };

            if (video) {
                this.socketHandler.disconnectProducers(params);                             //Check only video because you can display screen without audio but not without video
            } else {
                throw new Error('Trying to turn off a non-existent stream');
            }

            if(this.producerDisplayMedia.video) {
                this.producerDisplayMedia.video.close();
                this.producerDisplayMedia.video = null;
            }
            if( this.producerDisplayMedia.audio) {
                this.producerDisplayMedia.audio.close();
                this.producerDisplayMedia.audio = null
            }

            this.streamManager.clearStreamByClient(LOCAL_MEDIA, StreamType.displayMedia);
        }
    }

    getStream = (clientId: string, type: StreamType) => {
        return this.streamManager.getStream(clientId, type);
    }

    public async setVideoBlur(isEnable: boolean, isCamSwitchedOff: boolean = false) {
        if(isEnable) {
            this.blurService = new BlurService();
            const blurryStream = await this.blurService.getBlurryVideo();
            const currentStream = this.streamManager.getStream(LOCAL_MEDIA, StreamType.userMedia);

            if (currentStream) {
                const oldTrack = currentStream.getVideoTracks()[0]
                if (oldTrack) {
                    currentStream.removeTrack(oldTrack);
                    oldTrack.stop();
                }
                currentStream.addTrack(blurryStream.getVideoTracks()[0]);
            }
            await this.producerUserMedia.video?.replaceTrack({track: blurryStream.getVideoTracks()[0]});
            return;
        }

        if(!isCamSwitchedOff) {
            this.blurService?.destroy();
            this.blurService = null;
            await this.updateVideo();
            return;
        }
        this.blurService?.destroy();
        this.blurService = null;
    }

    public async setNoiseSuppression(isEnable: boolean, isMicSwitchedOff: boolean = false) {
        if(isEnable) {
            this.noiseSuppressionService = new NoiseSuppressionService();
            const noiseSuppressedStream = await this.noiseSuppressionService.getSuppressedAudio()
            const currentStream = this.streamManager.getStream(LOCAL_MEDIA, StreamType.userMedia);

            if (currentStream) {
                const oldTrack = currentStream.getAudioTracks()[0]
                if (oldTrack) {
                    currentStream.removeTrack(oldTrack);
                    oldTrack.stop();
                }
                currentStream.addTrack(noiseSuppressedStream.getAudioTracks()[0]);
            }
            await this.producerUserMedia.audio?.replaceTrack({track: noiseSuppressedStream.getAudioTracks()[0]});
            return;
        }

        if(!isMicSwitchedOff) {
            this.noiseSuppressionService?.destroy();
            this.noiseSuppressionService = null;
            await this.updateAudio();
            return;
        }
        this.noiseSuppressionService?.destroy();
        this.noiseSuppressionService = null;
    }

    private async updateAudio() {
        const currentStream = this.streamManager.getStream(LOCAL_MEDIA, StreamType.userMedia);

        const stream = await this.streamManager.createUserMediaStream(TrackType.audio)
        const newAudioTrack = stream.getAudioTracks()[0];
        if (currentStream) {
            const oldTrack = currentStream.getAudioTracks()[0]
            if (oldTrack) {
                currentStream.removeTrack(oldTrack);
                oldTrack.stop();
            }
            currentStream.addTrack(newAudioTrack);
        }
        await this.producerUserMedia.audio?.replaceTrack({track: newAudioTrack});
    }

    private async updateVideo() {
        const currentStream = this.streamManager.getStream(LOCAL_MEDIA, StreamType.userMedia);

        const stream = await this.streamManager.createUserMediaStream(TrackType.video)
        const newVideoTrack = stream.getVideoTracks()[0];
        if (currentStream) {
            const oldTrack = currentStream.getVideoTracks()[0]
            if (oldTrack) {
                currentStream.removeTrack(oldTrack);
                oldTrack.stop();
            }
            currentStream.addTrack(newVideoTrack);
        }
        await this.producerUserMedia.video?.replaceTrack({track: newVideoTrack});
    }

    listenOnDisconnect(callback: any) {
        this.socketHandler.onDisconnect(clientId => {
            callback(clientId)
        })
    }

    disconnect() {
        this.socketHandler.disconnect();
        this.streamManager.clearStreams();
        this.transportManager.clearTransports();
        this.clearProducersConsumers();
    }

    private clearProducersConsumers() {
        if (this.consumers) {
            Object.values(this.consumers).forEach(consumer => {
                if (consumer && typeof consumer.close === 'function') {
                    consumer.close();
                }
            })
        }

        if (this.producerUserMedia) {
            Object.values(this.producerUserMedia).forEach(producer => {
                if (producer && typeof producer.close === 'function') {
                    producer.close();
                }
            })
        }

        if (this.producerDisplayMedia) {
            Object.values(this.producerDisplayMedia).forEach(producer => {
                if (producer && typeof producer.close === 'function') {
                    producer.close();
                }
            })
        }
    }
}

export default MediasoupRoom;