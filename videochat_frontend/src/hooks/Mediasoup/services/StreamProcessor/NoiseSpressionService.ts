import StreamProcessor from "./StreamProcessor.ts";
import {TrackType} from "../../types";

class NoiseSuppressionService extends StreamProcessor {
    constructor() {
        const URL = window.location.hostname === 'localhost'
            ? 'http://localhost:5002'
            : `http://${window.location.hostname}:5002`;

        console.log(URL)
        super(URL)
    }

    public getSuppressedAudio() {
        return super.getStream(TrackType.audio);
    }
}

export default NoiseSuppressionService;