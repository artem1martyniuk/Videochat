import { configureStore } from '@reduxjs/toolkit'
import callReducer from "./reducers/video_audio_reducer.ts";
import userReducer from './reducers/user_reducer.ts'
import modalReducer from './reducers/modal_window_reducer.ts'

export const store = configureStore({
    reducer: {callReducer, userReducer, modalReducer},
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch