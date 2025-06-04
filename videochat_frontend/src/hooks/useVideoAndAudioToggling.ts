import {RefObject, useEffect} from "react";
import {LOCAL_MEDIA} from "./Mediasoup/useTestMediasoup.ts";
import {StreamType} from "./Mediasoup/types";
import {useSelector} from "react-redux";
import type {RootState} from "../redux/store.ts";

interface Params {
    clientId: string,
    type: StreamType,
    videoRef: RefObject<HTMLVideoElement>,
    toggleVideo: (state: boolean) => void,
    toggleAudio: (state: boolean) => void
}

const useVideoAndAudioToggling = (params: Params) => {
    const audioState = useSelector((state: RootState) => state.callReducer.audio);
    const videoState = useSelector((state: RootState) => state.callReducer.video);
    const {clientId, videoRef, type, toggleVideo, toggleAudio} = params;

    useEffect(() => {
        if (clientId === LOCAL_MEDIA && type === StreamType.userMedia) {
            toggleAudio(audioState);
        }
    }, [audioState]);

    useEffect(() => {
        if (clientId === LOCAL_MEDIA && type === StreamType.userMedia) {
            toggleVideo(videoState);
        }
    }, [videoState]);
}

export default useVideoAndAudioToggling;