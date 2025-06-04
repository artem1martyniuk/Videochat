import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    isParticipantsModalOpen: false
}

export const modalSlice = createSlice({
    name: "modal_windows",
    initialState,
    reducers: {
        toggleParticipantsModal: (state) => {
            state.isParticipantsModalOpen = !state.isParticipantsModalOpen ;
        }
    },
})

export const { toggleParticipantsModal } = modalSlice.actions;

export default modalSlice.reducer