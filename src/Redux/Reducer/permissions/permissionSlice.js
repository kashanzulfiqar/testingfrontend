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
  extraReducers: (builder) => {
    builder
      .addCase(getPermissionList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPermissionList.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = payload;
      })
      .addCase(getPermissionList.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.errorMessage = payload
      });
  }
})
 
export default permissionsSlice.reducer;