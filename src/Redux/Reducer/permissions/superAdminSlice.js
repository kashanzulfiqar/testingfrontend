import { createSlice } from "@reduxjs/toolkit";


export const superAdminSlice = createSlice({
    name: 'superAdmin',
    initialState: false,
    reducers: {
        superAdmin: (state, action) => {
            return action.payload;
        },
    }
})

export const { superAdmin } = superAdminSlice.actions;
export default superAdminSlice.reducer;