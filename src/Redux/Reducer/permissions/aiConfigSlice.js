// src/redux/aiConfigSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedModel: localStorage.getItem("aiModel") || "deepSeek", // default
};

const aiConfigSlice = createSlice({
  name: "aiConfig",
  initialState,
  reducers: {
    setAIModel: (state, action) => {
      state.selectedModel = action.payload;
      localStorage.setItem("aiModel", action.payload); // persist
    },
  },
});

export const { setAIModel } = aiConfigSlice.actions;
export default aiConfigSlice.reducer;
