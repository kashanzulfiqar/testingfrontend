import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPresetId: null,
};

export const resumePresetSlice = createSlice({
  name: "resumePreset",
  initialState,
  reducers: {
    setSelectedPresetId: (state, action) => {
      state.selectedPresetId = action.payload;
    },
    clearSelectedPreset: (state) => {
      state.selectedPresetId = null;
    },
  },
});

export const { setSelectedPresetId, clearSelectedPreset } = resumePresetSlice.actions;
export default resumePresetSlice.reducer;
