import React, {useEffect, useRef, useState} from 'react';
import {LOCAL_DISPLAY, LOCAL_MEDIA} from '../../hooks/Mediasoup/useTestMediasoup.ts'
import styles from './Video.module.css'
import {StreamType} from "../../hooks/Mediasoup/types";
import useVideoAndAudioToggling from "../../hooks/useVideoAndAudioToggling.ts";
import {useDispatch, useSelector} from "react-redux";
import type {RootState} from "../../redux/store.ts";
import {scaleVideo} from "../../redux/reducers/video_audio_reducer.ts";

interface VideoProps {
    clientId: string,
    stream: MediaStream | null,
    type: StreamType,
    toggleVideo: (isEnable: boolean) => Promise<void>,
    toggleAudio: (isEnable: boolean) => Promise<void>,
    toggleDisplayScreen: (isEnable: boolean) => Promise<void>,
    isFirstRemote: boolean,
    userName: string
}

function Video({clientId, stream, type, toggleVideo, toggleAudio, userName, isFirstRemote}: VideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const dispatch = useDispatch();
    const scaledVideo = useSelector((state: RootState) => state.callReducer.videoScaled);
    useVideoAndAudioToggling({clientId, type, toggleVideo, toggleAudio, videoRef});

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }

        return () => {

        }
    }, [stream]);

    useEffect(() => {
        if(isFirstRemote && !scaledVideo.newClientVideo) {
            dispatch(scaleVideo(`${clientId}-${type}`));
        }
    }, [isFirstRemote]);

    useEffect(() => {
        if(isFirstRemote && scaledVideo.newClientVideo === null) {
            dispatch(scaleVideo(`${clientId}-${type}`));
        }
    }, [scaledVideo]);

    const handleScale = () => {
        dispatch(scaleVideo(`${clientId}-${type}`));
    }

    const useStyle = (): string => {
        let _styles = `${styles.video} `
        const isScaled = (scaledVideo.newClientVideo === `${clientId}-${type}`) &&
            !(clientId === LOCAL_MEDIA && type === StreamType.userMedia);
        if(clientId === LOCAL_MEDIA && type === StreamType.userMedia) {
            _styles += `${styles.local_video} `
        } else {
            if(!isScaled) {
                _styles += `${styles.remote_video} `
            } else {
                _styles += `${styles.scaled_video} `
            }
        }

        return _styles;
    }

    return (
        <div
            className={useStyle()}
            onClick={() => {
                handleScale()
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={clientId === LOCAL_MEDIA || clientId == LOCAL_DISPLAY}
            />
            <span className={styles.label_span}>{userName}</span>
        </div>
    );
}

export default Video;