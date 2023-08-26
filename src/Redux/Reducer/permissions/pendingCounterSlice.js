import { createSlice } from "@reduxjs/toolkit";


export const pendingCounterSlice = createSlice({
    name: 'counter',
    initialState: {},
    reducers: {
        counter: (state, payload) => {
            state.counter = payload
        },
    }
})

export const { counter } = pendingCounterSlice.actions;
export default pendingCounterSlice.reducer;