import React, { useEffect, useState } from "react";

import { Modal } from "@mui/material";
import { useSelector } from "react-redux";
import { CloseOutlined } from '@ant-design/icons';
import TaskContent from "./taskContents";


function TaskModal({
  data,
  viewModal,
  closeViewModal,
  getAllTasks,
  getTaskBoard,
  isFromTasksPage = false
}) {
   
    const user_state = useSelector((state) => state.user.loginvalue);
   
    
   
 
  const [taskData, setTaskData] = useState(data);

  useEffect(() => {
    setTaskData(data);
  }, [data]);

  useEffect(() => {
    if (!viewModal) {
      setTaskData(null);
    }
  }, [viewModal]);

  // Sync description with form and data
 
  const [commentRichText, setCommentRichText] = useState("");



  const fetchTaskDetails = async (id) => {
    if (!id) return;
    try {
      const res = await apiServices("GET", `tasks?taskId=${id}`, null, user_state);
      if (res?.data?.success) {
        const updatedTask = res?.data?.Task;
        setTaskData(updatedTask);
      
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch comments and history when modal opens or task changes


  

  // Sync local states with taskData when it changes
 
  const handleCloseModal = () => {
    // Refresh taskboard data when modal closes
    if (getAllTasks && getTaskBoard) {
      // Get the board/project ID from the task data
      const boardId = data?.projectId?._id || data?.boardId?._id || data?.ProjectData?._id;
      if (boardId) {
        getAllTasks(boardId);
        getTaskBoard(boardId);
      }
    }
    closeViewModal();
  };

  return (
    <Modal
      open={viewModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      className="modalScroll"
      aria-describedby="modal-modal-description"
      disableRestoreFocus
      BackdropProps={{
        style: { backgroundColor: "rgb(0 0 0 / 70%)" },
      }}
      sx={{ overflowY: "auto" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{
          maxWidth: "85vw",
          width: "85vw",
          margin: "20px auto",
        
        }}
        role="document"
      >
        <div className="modal-content" style={{padding:"20px", background:"#F7F7F7", position: "relative"}}>
          <button
            onClick={handleCloseModal}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s",
              zIndex: 1000
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#F7F7F7"}
          >
            <CloseOutlined style={{ fontSize: "18px", color: "#666" }} />
          </button>
          <TaskContent taskDatas={taskData} />
        </div>
      </div>  
    </Modal>
  );
}

export default TaskModal;
