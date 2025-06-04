import { TrackType } from "../hooks/Mediasoup/types";

const gum = (trackType: TrackType) => {
    switch (trackType) {
        case TrackType.audio:
            return navigator.mediaDevices.getUserMedia({ audio: true });
        case TrackType.video:
            return navigator.mediaDevices.getUserMedia({ video: true });
        default:
            return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }
}

export default gum;