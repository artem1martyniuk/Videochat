import React, {useCallback} from 'react';
import styles from './ButtonsContainer.module.css'
import {CiMicrophoneOn, CiMicrophoneOff} from "react-icons/ci";
import {HiOutlineVideoCamera, HiOutlineVideoCameraSlash} from "react-icons/hi2";
import {MdBlurOn, MdOutlineBlurOff, MdOutlineRecordVoiceOver, MdOutlineVoiceOverOff} from "react-icons/md";
import {PiPhoneDisconnectLight} from "react-icons/pi";
import {MdOutlineScreenShare, MdOutlineStopScreenShare} from "react-icons/md";
import {useDispatch, useSelector} from "react-redux";
import type {RootState} from '../../redux/store.ts'
import { store } from '../../redux/store';
import {
    disableMedia,
    toggleAudioState,
    toggleBlur,
    toggleDisplayScreen, toggleNoiseSuppression,
    toggleVideo
} from '../../redux/reducers/video_audio_reducer.ts'
import {useNavigate} from "react-router-dom";
import throttle from "../../utils/Throttle.ts";
import {Button} from "antd";
import {FaUsersViewfinder} from "react-icons/fa6";
import {toggleParticipantsModal} from "../../redux/reducers/modal_window_reducer.ts";

interface Props {
    setNoiseSuppression: (isEnable: boolean, isMicSwitchedOff?: boolean) => Promise<void>;
    setBlur: (isEnable: boolean, isCamSwitchedOff?: boolean) => Promise<void>
}

function ButtonsContainer(props: Props) {
    const dispatch = useDispatch();
    const {video, audio, displayScreen, blur, noiseSuppression} = useSelector((state: RootState) => state.callReducer);
    const navigate = useNavigate();
    const {userData} = useSelector((state: RootState) => state.userReducer)

    const handleMicroToggle = useCallback(
        throttle(() => {
            const audio = store.getState().callReducer.audio;
            const noiseSuppression = store.getState().callReducer.noiseSuppression;
            if(audio && noiseSuppression) {
                dispatch(toggleNoiseSuppression())
            }
            dispatch(toggleAudioState());
        }, 1000),
        [dispatch]
    );

    const handleBlurToggle = useCallback(
        throttle(() => {
            const video = store.getState().callReducer.video;
            if(!video) {
                return;
            }
            dispatch(toggleBlur());
            const newBlur = store.getState().callReducer.blur;
            console.log(`Blur: ${newBlur}`)

            props.setBlur(newBlur);
        }, 2000),
        [dispatch]
    )

    const handleNoiseSuppressionToggle = useCallback(
        throttle(() => {
            const audio = store.getState().callReducer.audio;
            if(!audio) {
                return;
            }
            dispatch(toggleNoiseSuppression());
            const newNoiseSuppression = store.getState().callReducer.noiseSuppression;
            console.log(`Noise Suppression: ${newNoiseSuppression}`)

            props.setNoiseSuppression(newNoiseSuppression);
        }, 2000),
        [dispatch]
    )

    const handleCameraToggle = useCallback(
        throttle(() => {
            const video = store.getState().callReducer.video;
            const blur = store.getState().callReducer.blur;
            if(video && blur) {
                dispatch(toggleBlur())
            }
            dispatch(toggleVideo());
        }, 1000),
        [dispatch]
    );

    const handleDisplayScreenToggle = useCallback(
        throttle(() => {
            dispatch(toggleDisplayScreen());
        }, 1500),
        [dispatch]
    );

    const handleLeave = () => {
        dispatch(disableMedia());
        navigate('/');
    }

    const handleShowParticipants = () => {
        dispatch(toggleParticipantsModal());
    }

    const microToggleButton = audio ? (
        <CiMicrophoneOn onClick={handleMicroToggle} className={styles.circle}/>
    ) : (
        <CiMicrophoneOff onClick={handleMicroToggle} className={styles.circle}/>
    );

    const videoToggleButton = video ? (
        <HiOutlineVideoCamera onClick={handleCameraToggle} className={styles.circle}/>
    ) : (
        <HiOutlineVideoCameraSlash onClick={handleCameraToggle} className={styles.circle}/>
    )

    const blurToggleButton = blur ? (
        <MdBlurOn onClick={handleBlurToggle} className={styles.circle}/>
    ) : (
        <MdOutlineBlurOff onClick={handleBlurToggle} className={styles.circle}/>
    )

    const noiseSuppressionToggleButton = noiseSuppression ? (
        <MdOutlineRecordVoiceOver onClick={handleNoiseSuppressionToggle} className={styles.circle}/>
    ) : (
        <MdOutlineVoiceOverOff onClick={handleNoiseSuppressionToggle} className={styles.circle}/>
    )

    const displayScreenToggleButton = displayScreen ? (
        <MdOutlineScreenShare onClick={handleDisplayScreenToggle} className={styles.circle}/>
    ) : (
        <MdOutlineStopScreenShare onClick={handleDisplayScreenToggle} className={styles.circle}/>
    )

    const showParticipants = <FaUsersViewfinder onClick={handleShowParticipants} className={styles.circle} />

    return (
        <div className={styles.main_container}>
            {microToggleButton}
            {videoToggleButton}
            {showParticipants}
            {userData && blurToggleButton}
            {userData && noiseSuppressionToggleButton}
            {displayScreenToggleButton}
            <PiPhoneDisconnectLight onClick={handleLeave} className={styles.circle}/>
        </div>
    );
}

export default ButtonsContainer;