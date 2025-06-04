import sio, {Socket} from "socket.io-client";
import gum from "../../../../utils/gum.ts";
import {TrackType} from "../../types";
import iceServers from "../../../../config/otherConfig/iseServers.ts";

abstract class StreamProcessor {

    socket!: Socket;
    pc!: RTCPeerConnection;

    protected constructor(URL: string) {
        this.socket = sio(URL);
        this.pc = new RTCPeerConnection({iceServers});
        this.setListeners();
    }

    public async getStream(trackType: TrackType) {
        await this.addTracks(trackType);
        await this.createOffer();

        return new Promise<MediaStream>((resolve) => {
            this.pc.ontrack = ({streams: [remoteStream]}) => {
                console.log('[27] on track entered')
                resolve(remoteStream);
            };
        })
    }

    private setListeners() {
        this.onIceCandidateFromBrowser();
        this.onIceCandidateFromServer();
        this.onAnswer();
    }

    private async addTracks(trackType: TrackType) {
        const stream = await gum(trackType);

        for (const track of stream.getTracks()) {
            this.pc.addTrack(track);
        }
    }

    private async createOffer() {
        console.log('Creating tung tung tung sagur offer..');
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        this.socket.emit('create_offer', {offer: this.pc.localDescription});
    }

    private onIceCandidateFromBrowser() {
        console.log("Getting ice candidates from browser")
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('new_ice_candidate', {
                    candidate: event.candidate,
                });
            }
        }
    }

    private onIceCandidateFromServer() {
        console.log("Getting ice candidates from server")
        this.socket.on('add_ice_candidate', (candidate) => {
            if (candidate) {
                this.pc.addIceCandidate(candidate)
                    .catch(e => console.error("Failed to add ICE candidate", e));
            } else {
                console.log("Received null candidate - end of ICE candidates");
            }
        })
    }

    private onAnswer() {
        console.log("Creating answer")
        this.socket.on('create_answer', async (answer) => {
            console.log(typeof(answer))
            console.log(answer)
            const sessionDescription = new RTCSessionDescription(answer)
            await this.pc.setRemoteDescription(sessionDescription);
        })
    }

    public destroy() {
        this.pc.getSenders().forEach(sender => {
            sender.track?.stop();
            this.pc.removeTrack(sender);
        });

        this.pc.close();

        this.socket.disconnect();
    }
}

export default StreamProcessor;