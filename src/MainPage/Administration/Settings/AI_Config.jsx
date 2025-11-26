import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAIModel } from "../../../Redux/Reducer/permissions/aiConfigSlice";

export default function AI_Config() {
  const dispatch = useDispatch();
  const selectedModel = useSelector((state) => state.aiConfig.selectedModel);

  const handleChange = (e) => {
    dispatch(setAIModel(e.target.value));
    console.log("Redux state:", e.target.value);
  };

  return (
    <div className="card p-4">
      <h4 className="mb-3">AI Model Configuration</h4>

      <div className="form-group">
        <label>Select AI Model</label>

        <select
          className="form-control"
          value={selectedModel}
          onChange={handleChange}
        >
          <option value="openai">OpenAI</option>
          <option value="deepSeek">DeepSeek</option>
        </select>
      </div>

      <p className="mt-3 text-muted">
        Selected Model: <strong>{selectedModel}</strong>
      </p>
    </div>
  );
}
