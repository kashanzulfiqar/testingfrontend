import { createSlice } from "@reduxjs/toolkit";
import { getPermissionList } from "./actions";
 
const initialState = {
  data: [],
  isLoading: false,
  isSuccess: false,
  errorMessage: ''
}
 
export const permissionsSlice = createSlice({
  name: 'permission',
  initialState,
  extraReducers: {
    [getPermissionList.pending]: (state) => {
      state.isLoading = true;
    },
    [getPermissionList.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.data = payload;
    },
    [getPermissionList.rejected]: (state, { payload }) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.errorMessage = payload
    }
  }
})
 
export default permissionsSlice.reducer;