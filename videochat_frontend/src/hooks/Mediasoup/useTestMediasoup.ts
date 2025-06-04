import {useCallback, useEffect, useRef, useState} from "react";
import MediasoupRoom from "./services/MediaSoupRoom.ts";
import {StreamType, TrackType, userDTO} from "./types";
import {useDispatch, useSelector} from "react-redux";
import {
    disableMedia,
    toggleBlur,
    toggleDisplayScreen as _toggleDisplayScreen
} from "../../redux/reducers/video_audio_reducer.ts";
import {RootState} from "../../redux/store.ts";

export const LOCAL_MEDIA = 'local_media';
export const LOCAL_DISPLAY = 'local_display'

export interface Streams {
    clientId: string,
    type: StreamType,
    userName: string
}

export const useTestMediasoup = (roomId: string, userName: string, isCreate: boolean) => {
    const [streams, setStreams] = useState<Streams[]>([]);
    const [errorWhileJoining, setErrorWhileJoining] = useState<string | null>(null);
    const mediasoupRoom = useRef<MediasoupRoom>(new MediasoupRoom(roomId));
    const dispatch = useDispatch();

    const isIncludeClient = (clientId: string, type: StreamType) => {
        return clientId && streams.some(stream => stream.clientId === clientId && stream.type === type);
    }

    const addStream = useCallback((clientId: string, type: StreamType, userName: string) => {
        if (!isIncludeClient(clientId, type)) {
            setStreams(prev => [...prev, {
                clientId,
                type,
                userName
            }]);
        }
    }, [streams]);

    const deleteStream = (clientId: string, type: StreamType) => {
        setStreams(prevClients => (
            prevClients.filter(stream => stream.clientId !== clientId || stream.type !== type)
        ));
    }

    const getStream = useCallback((clientId: string, type: StreamType) => {
        return mediasoupRoom.current.getStream(clientId, type);
    }, []);

    const toggleVideo = async (isEnabled: boolean) => {
        if(!isEnabled) {
            await setBlur(false, true);
        }
        await mediasoupRoom.current.toggleVideo(isEnabled, userName);
    }

    const toggleAudio = async (isEnabled: boolean) => {
        if(!isEnabled) {
            await setNoiseSuppression(false, true);
        }
        await mediasoupRoom.current.toggleAudio(isEnabled);
    }

    const getUsers = async (): Promise<userDTO[]> => {
        return mediasoupRoom.current.getUsers();
    }

    const setBlur = async (isEnable: boolean, isCamSwitchedOff: boolean = false) => {
        await mediasoupRoom.current.setVideoBlur(isEnable, isCamSwitchedOff);
    }

    const setNoiseSuppression = async(isEnable: boolean, isMicSwitchedOff: boolean = false) => {
        await mediasoupRoom.current.setNoiseSuppression(isEnable, isMicSwitchedOff)
    }

    const toggleDisplayScreen = async (isEnabled: boolean) => {
        mediasoupRoom.current.toggleDisplayScreen(isEnabled, () => {
            dispatch(_toggleDisplayScreen());
        }).then(client => {
            if (client) {
                addStream(client, StreamType.displayMedia, `${userName} (local screen)`);
            } else {
                deleteStream(LOCAL_MEDIA, StreamType.displayMedia);
            }
        })
    }

    useEffect(() => {
        async function connectAndUpdateRoom() {
            const possibleErrorMsg = await mediasoupRoom.current.join(userName, isCreate);

            if(possibleErrorMsg) {
                setErrorWhileJoining(possibleErrorMsg)
                return;
            }

            mediasoupRoom.current.loadAllProducers().then(clients => {
                clients.forEach(stream => {
                    addStream(stream.clientId, stream.type, stream.userName);
                });
            })

            await mediasoupRoom.current.listenForNewProducer(stream => {
                addStream(stream.clientId, stream.type, stream.userName)
            });

            mediasoupRoom.current.produceMedia(TrackType.video_audio)
                .then(() => {
                    addStream(LOCAL_MEDIA, StreamType.userMedia, `${userName} (local)`)
                })

            mediasoupRoom.current.onDeleteStream((clientId: string, type: StreamType) => {
                console.log(clientId, type);
                deleteStream(clientId, type);
            })

            mediasoupRoom.current.listenOnDisconnect(clientId => {
                deleteStream(clientId, StreamType.userMedia);
                deleteStream(clientId, StreamType.displayMedia);
            })
        }

        connectAndUpdateRoom()
            .then(() => console.log('Videochat is living'));

        return () => {
            mediasoupRoom.current.disconnect();
        };
    }, []);

    return {
        streams,
        getStream,
        toggleVideo,
        toggleAudio,
        toggleDisplayScreen,
        setBlur,
        setNoiseSuppression,
        getUsers,
        errorWhileJoining
    };
};