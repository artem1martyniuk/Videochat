import {TrackType} from "../../types";
import StreamProcessor from "./StreamProcessor.ts";

class BlurService extends StreamProcessor {
    constructor() {
        const URL = window.location.hostname === 'localhost'
            ? 'http://localhost:5001'
            : `http://${window.location.hostname}:5001`;

        console.log(URL)
        super(URL)
    }

    public getBlurryVideo() {
        return super.getStream(TrackType.video);
    }
}

export default BlurService;