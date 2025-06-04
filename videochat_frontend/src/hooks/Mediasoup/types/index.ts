import {Consumer, MediaKind, Producer} from "mediasoup-client/lib/types";

export type ConsumersData = {
    [producerId: string]: Consumer
}

export type ProducerData = Array<{
    id: string,
    producerSocketId: string,
    kind: MediaKind,
    type: string
}>

export type userDTO = {
    id: string,
    userName: string
}

export type Producers = {
    audio: Producer | null,
    video: Producer | null,
}

export type MediaStreamObject = {
    [socketId: string]: {
        userMedia: MediaStream | null,
        displayMedia: MediaStream | null
    }
}

export enum TrackType {
    video = 'video',
    audio = 'audio',
    video_audio = 'video_audio'
}

export enum StreamType {
    userMedia = 'userMedia',
    displayMedia = 'displayMedia',
}