import React, {useEffect, useState, useMemo} from 'react';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Video from "../../Components/Video/Video.tsx";
import styles from './Room.module.css';
import ButtonsContainer from "../../Components/ButtonsContainer/ButtonsContainer.tsx";
import {LOCAL_MEDIA, Streams, useTestMediasoup} from "../../hooks/Mediasoup/useTestMediasoup.ts";
import useDisplayMedia from "../../hooks/useDisplayMedia.ts";
import Chat from "../../Components/Chat/Chat.tsx";
import {StreamType} from "../../hooks/Mediasoup/types";
import {useDispatch, useSelector} from "react-redux";
import type {RootState} from "../../redux/store.ts";
import {scaleVideo, toggleAudioState, toggleVideo as toggleVideoState} from "../../redux/reducers/video_audio_reducer.ts";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";
import GetLink from "../../Components/GetLink/GetLink.tsx";
import ParticipantsModal from "../../Components/PeopleModal/ParticipantsModal.tsx";
import Center from "../../Components/Center/Center.tsx";
import {Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";

interface VideoLocation {
    leftSide: Array<Streams>,
    central: Array<Streams>,
    rightSide: Array<Streams>
}

enum ButtonSide {
    leftSide = 'leftSide',
    rightSide = 'rightSide',
}

function getNow() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function Room() {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [currentVideoLocation, setCurrentVideoLocation] = useState<VideoLocation>({
        leftSide: [],
        central: [],
        rightSide: []
    });
    const videosInScreen = 6;
    const remoteVideosInRow = videosInScreen - 2;
    const {roomId} = useParams<{ roomId: string }>();
    const location = useLocation();
    const userName = location.state.userName || 'LOCAL_MEDIA';
    const isCreate = location.state.isCreate !== false;
    const dispatch = useDispatch();
    const {videoScaled: scaledVideo, audio, video} = useSelector((state: RootState) => state.callReducer);

    const {
        streams,
        getStream,
        toggleVideo,
        toggleAudio,
        toggleDisplayScreen,
        setBlur,
        setNoiseSuppression,
        getUsers,
        errorWhileJoining
    } = useTestMediasoup(roomId || "", userName, isCreate);

    console.log("broooo")

    useEffect(() => {
        console.log("Must works, " + errorWhileJoining)
        if(errorWhileJoining) {
            navigate('/',
                {
                    state: {
                        error: errorWhileJoining
                    }
                })
        }
    }, [errorWhileJoining])

    useEffect(() => {
        async function checkIfCanJoin() {
            try {
                const users = await getUsers();
                if(users.length > 9) {
                    navigate('/',
                        {
                            state: {
                                error: 'Maximum participants in this room'
                            }
                        })
                }
            }catch(e) {
                console.error(e);
                navigate('/',
                    {
                        state: {
                            error: 'An error occurred while joining room'
                        }
                    });
            } finally {
                setIsLoading(false)
            }
        }

        checkIfCanJoin();
    }, []);

    useDisplayMedia(toggleDisplayScreen);

    useEffect(() => {
        let isExist = false;

        for(let i = 0; i < streams.length; i++) {
            if(scaledVideo.newClientVideo === `${streams[i].clientId}-${streams[i].type}`) {
                isExist = true;
            }
        }

        if(!isExist) {
            dispatch(scaleVideo(null))
        }
    }, [streams])

    const remoteInRow: Array<Streams> = useMemo(() => {
        return streams.filter(stream => {
            return !(stream.clientId === LOCAL_MEDIA && stream.type === StreamType.userMedia) &&
                !(scaledVideo.newClientVideo === `${stream.clientId}-${stream.type}`);
        })
    }, [streams, scaledVideo])

    useEffect(() => {
        function removeMissingStream(side: string) {
            if(currentVideoLocation[side].length > 0) {
                let isOdd: Streams | null = null;

                currentVideoLocation[side].forEach(stream => {
                    if(!remoteInRow.includes(stream)) {
                        isOdd = stream;
                    }
                })
                if(isOdd) {
                    const newSide = currentVideoLocation[side].filter(stream => stream !== isOdd)
                    const newLocation: VideoLocation = {
                        leftSide: currentVideoLocation.leftSide,
                        central: currentVideoLocation.central,
                        rightSide: currentVideoLocation.rightSide
                    };

                    switch(side) {
                        case 'leftSide': {
                            newLocation.leftSide = newSide;
                            break;
                        }

                        case 'rightSide': {
                            newLocation.rightSide = newSide;
                            break;
                        }

                        case 'central': {
                            let isAdded = false;
                            if(currentVideoLocation.rightSide.length > 0) {
                                    newSide.push(currentVideoLocation.rightSide[0])
                                    newLocation.rightSide = currentVideoLocation.rightSide.slice(1);
                                    isAdded = true;
                            }
                            if(!isAdded && currentVideoLocation.leftSide.length > 0) {
                                    newSide.push(currentVideoLocation.leftSide[0])
                                    newLocation.leftSide = currentVideoLocation.leftSide.slice(1);
                            }

                            newLocation.central = newSide;
                        }
                    }

                    setCurrentVideoLocation(Object.assign(currentVideoLocation, newLocation));
                }
            }
        }

        removeMissingStream('leftSide')
        removeMissingStream('rightSide')
        removeMissingStream('central');

        if(currentVideoLocation.central.length < remoteVideosInRow) {
            const newLocation = {
                leftSide: [],
                central: remoteInRow.slice(0, remoteVideosInRow),
                rightSide: remoteInRow.length > remoteVideosInRow ?
                    remoteInRow.slice(remoteVideosInRow) : []
            }

            setCurrentVideoLocation(newLocation);
            return;
        }

        if(currentVideoLocation.central.length === remoteVideosInRow) {
            const newLocation: VideoLocation = {
                leftSide: currentVideoLocation?.leftSide,
                central: currentVideoLocation?.central,
                rightSide: remoteInRow.filter(stream => {
                    return !currentVideoLocation.leftSide.includes(stream) &&
                        !currentVideoLocation.central.includes(stream)
                })
            }

            setCurrentVideoLocation(newLocation);
            return;
        }
    }, [streams, scaledVideo]);

    useEffect(() => {
        if(!video) {
            dispatch(toggleVideoState())
        }
        if(!audio){
            dispatch(toggleAudioState());
        }
    }, []);

    const onSliderButtonClick = (bs: ButtonSide) => {

        const numberOfVideos = currentVideoLocation[bs].length > remoteVideosInRow ?
            remoteVideosInRow: currentVideoLocation[bs].length;

        const newLocation: VideoLocation = {
            leftSide: currentVideoLocation.leftSide,
            central: currentVideoLocation.central,
            rightSide: currentVideoLocation.rightSide
        };

        if(bs === ButtonSide.rightSide) {
            const videos = newLocation.rightSide.splice(0, numberOfVideos)

            newLocation.leftSide.push(...newLocation.central.splice(0, numberOfVideos))

            videos.forEach(video => {
                newLocation.central.push(video);
            })
        } else {

            const leftLen = newLocation.leftSide.length;
            const videos = newLocation.leftSide.splice(leftLen - numberOfVideos, numberOfVideos)

            newLocation.rightSide.unshift(...newLocation.central.splice(remoteVideosInRow - numberOfVideos, numberOfVideos))

            newLocation.central.splice(0, 0, ...videos);
        }

        setCurrentVideoLocation(newLocation);
    }

    const remoteStreams = streams.filter(
        stream => !(stream.clientId === LOCAL_MEDIA && stream.type === StreamType.userMedia)
    );
    const firstRemoteId = remoteStreams.length > 0 ? remoteStreams[0].clientId : null;

    if(isLoading) {
        const spinner = <Spin indicator={<LoadingOutlined style={{fontSize: 50}} spin/>}/>;
        return (
            <Center>
                {spinner}
            </Center>
        )
    }

    return (
        <div className={styles.full_container}>
            <GetLink />
            <section className={styles.main_section}>
                <ParticipantsModal getUsers={getUsers}/>
                    <div
                        className={`${styles.slide} ${styles.slide_up} ${currentVideoLocation.leftSide.length === 0 
                        && styles.slide_hide}`}

                        onClick={() => {onSliderButtonClick(ButtonSide.leftSide)}}
                    ><IoArrowUp/></div>
                    {
                        streams.map(({clientId, type, userName}, index) => {

                            const isFirstRemote = (clientId === firstRemoteId && type === StreamType.userMedia);

                            let shouldRender = (clientId === LOCAL_MEDIA && type === StreamType.userMedia) ||
                                (`${clientId}-${type}` === scaledVideo.newClientVideo)

                            if(!shouldRender) {
                                currentVideoLocation.central.forEach((stream) => {
                                    if(stream.clientId === clientId && stream.type === type) {
                                        shouldRender = true;
                                    }
                                })
                            }

                            if(shouldRender) {
                                return (
                                    <Video
                                        key={`${clientId}-${type}`}
                                        userName={userName}
                                        clientId={clientId}
                                        type={type}
                                        stream={getStream(clientId, type)}
                                        isFirstRemote={isFirstRemote}
                                        toggleVideo={toggleVideo}
                                        toggleAudio={toggleAudio}
                                        toggleDisplayScreen={toggleDisplayScreen}
                                    />
                                )
                            }
                        })
                    }
                    <div
                        className={`${styles.slide} ${styles.slide_down} ${currentVideoLocation.rightSide.length === 0 
                        && styles.slide_hide}`}
                        onClick={() => {onSliderButtonClick(ButtonSide.rightSide)}}
                    ><IoArrowDown/></div>
                <ButtonsContainer setNoiseSuppression={setNoiseSuppression} setBlur={setBlur}/>
            </section>
            <section className={styles.chat_section}>
                <Chat roomId={roomId || ''}/>
            </section>
        </div>
    );
}

export default Room;