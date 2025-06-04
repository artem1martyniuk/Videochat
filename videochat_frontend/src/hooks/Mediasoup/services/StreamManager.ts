import {MediaStreamObject, StreamType, TrackType} from "../types";
import gum from "../../../utils/gum.ts";
import {LOCAL_MEDIA} from "../useTestMediasoup.ts";
import gdm from "../../../utils/gdm.ts";

class StreamManager {
    private mediaStreams: MediaStreamObject = {};

    private initializeMediaStreams(clientId: string): void {
        if (!this.mediaStreams[clientId]) {
            this.mediaStreams[clientId] = {
                userMedia: null,
                displayMedia: null
            };
        }
    }

    async createUserMediaStream(tracks: TrackType): Promise<MediaStream> {
        return await gum(tracks);
    }

    async createDisplayMediaStream(): Promise<MediaStream> {
        return gdm();
    }

    deleteStream(clientId: string, type: StreamType) {
        console.log(clientId, type)
        this.mediaStreams[clientId][type]?.getTracks().forEach(track => {
            track.stop();
        });

        this.mediaStreams[clientId][type] = null;
    }

    setTrack(clientId: string, track: MediaStreamTrack, type: StreamType): MediaStream {
        this.initializeMediaStreams(clientId);

        if(!this.mediaStreams[clientId][type]) {
            this.mediaStreams[clientId][type] = new MediaStream([track]);
        } else {
            this.mediaStreams[clientId][type].addTrack(track);
        }

        return this.mediaStreams[clientId][type];
    }

    getStream(clientId: string, type: StreamType): MediaStream | null {
        if (clientId === LOCAL_MEDIA) {
            if (type === StreamType.userMedia) {
                return this.mediaStreams[LOCAL_MEDIA].userMedia;
            } else {
                return this.mediaStreams[LOCAL_MEDIA].displayMedia;
            }
        }

        if(type === StreamType.displayMedia) {
            return this.mediaStreams[clientId].displayMedia;
        } else {
            return this.mediaStreams[clientId].userMedia;
        }
    }

    clearStreamByClient(clientId: string, streamType: StreamType): void {
        if(this.mediaStreams[clientId][streamType]) {
            this.mediaStreams[clientId][streamType].getTracks().forEach(track => track.stop())
            this.mediaStreams[clientId][streamType] = null;
        }
    }

    clearStreams(): void {
        Object.values(this.mediaStreams).forEach((mediaStream) => {
            mediaStream.userMedia?.getTracks().forEach((track) => track.stop());
            mediaStream.displayMedia?.getTracks().forEach((track) => track.stop());
        });
    }
}

export default StreamManager;