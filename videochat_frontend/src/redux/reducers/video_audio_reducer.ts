import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Call_State {
    audio: boolean,
    video: boolean,
    blur: boolean,
    noiseSuppression: boolean,
    displayScreen: boolean,
    videoScaled: {oldClientVideo: string | null, newClientVideo: string | null}
}

const initialState: Call_State = {
    audio: true,
    video: true,
    blur: false,
    noiseSuppression: false,
    displayScreen: false,
    videoScaled: {oldClientVideo: null, newClientVideo: null}
}

export const callSlice = createSlice({
    name: 'audio_video',
    initialState,
    reducers: {
        toggleAudioState: (state) => {
            state.audio = !state.audio
        },
        toggleVideo: (state) => {
            state.video = !state.video
        },
        toggleBlur: (state) => {
            if(!state.video) {
                return;
            }

            state.blur = !state.blur;
        },
        toggleNoiseSuppression: (state) => {
            if(!state.audio) {
                return;
            }

            state.noiseSuppression = !state.noiseSuppression;
        },
        toggleDisplayScreen: (state) => {
            state.displayScreen = !state.displayScreen
        },
        scaleVideo: (state, action) => {
            state.videoScaled.oldClientVideo = state.videoScaled.newClientVideo
            state.videoScaled.newClientVideo = action.payload
        },
        disableMedia: (state) => {
            state.audio = false;
            state.video = false;
            state.displayScreen = false;
            state.noiseSuppression = false;
            state.blur = false;
        }
    },
})

export const { toggleAudioState, toggleVideo, toggleDisplayScreen, scaleVideo, disableMedia, toggleBlur, toggleNoiseSuppression} = callSlice.actions

export default callSlice.reducer