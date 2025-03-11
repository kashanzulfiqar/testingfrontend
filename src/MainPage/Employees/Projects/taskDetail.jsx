import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input, message, Tag } from "antd";
import { PlusCircleOutlined} from "@ant-design/icons";
import { apiServices } from '../../../Services/apiServices';
import { useSelector } from 'react-redux';

const TaskDetails = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { taskData } = location.state || {};
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

  // Add user state from Redux
  const user_state = useSelector((state) => state?.user?.loginvalue);



  useEffect(() => {
    const handleClickOutside = () => {
      setOpenStatusDropdown(false);
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  const getInitials = (name) => {
    console.log("ASDFG", taskData);
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    const initials = nameParts.map((part) => part[0].toUpperCase()).join("");
    return initials.length > 2 ? initials.slice(0, 2) : initials; // Limit to 2 characters
  };

  // Create options array for the dropdown
  const statusOptions =
    taskData?.options?.map((option) => ({
      value: option.title,
      label: option.title,
      color: option.color,
      columnId: option.columnId
    })) || [];

  // Set initial value based on current lane
  const [selectedStatus, setSelectedStatus] = useState({
    value: taskData?.lane,
    label: taskData?.lane,
    color: taskData?.columnColor,
    columnId: taskData?.columnId
  });

  const handleUpdateStatus = (boardId, taskId, sourceId, destinationId) => {
    if (boardId && taskId && sourceId && destinationId) {
    let updated_data = {
      _id: boardId,
      columnId: destinationId,
      prevColumn: sourceId,
      taskId: taskId
    };

    apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          message.success(t('Task status updated successfully'));
          // Update the local state
          const newStatus = statusOptions.find(opt => opt.columnId === destinationId);
          if (newStatus) {
            setSelectedStatus({
              value: newStatus.value,
              label: newStatus.label,
              color: newStatus.color,
              columnId: newStatus.columnId
            });
          }
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error updating status"
          }!`
        );
      });} else {
        message.error(t('Please select a status'));
      }
  };

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
    }
    setInputValue("");
    setInputVisible(false); // Hide input after adding
  };

  const handleRemoveTag = (removedTag) => {
    setTags(tags.filter((tag) => tag !== removedTag));
  };
  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h3 className="page-title">Task</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to={"/projects/tasks"}>
                    <span className="arrow_routes"></span>
                    Task
                  </Link>
                </li>
                <li className="breadcrumb-item active">Task {t("Details")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="contact-wrap">
              <div className="contact-profile">
                <div
                  className="avatar company-avatar"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <label className="text-icon">
                    {getInitials(taskData?.title)}
                  </label>
                </div>
                <div className="name-user">
                  <h4>{taskData?.title}</h4>
                </div>
              </div>
              <div className="dropdown action-label">
                <a
                  className="btn btn-white btn-sm btn-rounded dropdown-toggle"
                  href="javascript:void(0)"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenStatusDropdown(!openStatusDropdown);
                  }}
                  aria-expanded={openStatusDropdown}
                >
                  <i
                    className={`fa fa-dot-circle-o text-${selectedStatus.color}`}
                  />{" "}
                  {selectedStatus.label || "No status"}
                </a>
                <div
                  className={`dropdown-menu dropdown-menu-right ${
                    openStatusDropdown ? "show" : ""
                  }`}
                >
                  {statusOptions.map((option) => (
                    <a
                      key={option.value}
                      className={`dropdown-item ${
                        selectedStatus.value === option.value ? "disabled" : ""
                      }`}
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(
                          taskData?.boardId?._id || taskData?.projectId?._id,
                          taskData?._id,
                          selectedStatus.columnId,
                          option.columnId
                        );
                        setOpenStatusDropdown(false);
                        // Add any additional status update logic here
                      }}
                    >
                      <i
                        className={`fa fa-dot-circle-o text-${option.color}`}
                      />{" "}
                      {option.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={`col-xl-3`}>
            <div className="stickybar">
              <div className="card contact-sidebar">
                {taskData?.projectId && (
                  <h5>
                    <label
                      className="other-title"
                      style={{ minWidth: "120px" }}
                    >
                      {t("Tasks.project")}
                    </label>
                  </h5>
                )}
                {taskData?.boardId && (
                  <h5>
                    <label
                      className="other-title"
                      style={{ minWidth: "120px" }}
                    >
                      {t("Tasks.taskboard")}
                    </label>
                  </h5>
                )}
                <ul className="other-info">
                  <li>
                    {taskData?.projectId && (
                      <>
                        <label
                          className="other-title"
                          style={{ minWidth: "120px" }}
                        >
                          {`${t("Tasks.project")} Name`}
                        </label>
                        <label
                          style={{
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        >
                          {taskData.projectId.projectName}
                        </label>
                      </>
                    )}
                    {taskData?.boardId && (
                      <>
                        <label
                          className="other-title"
                          style={{ minWidth: "120px" }}
                        >
                          {`${t("Tasks.taskboard")} Name`}
                        </label>
                        <label
                          style={{
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        >
                          {taskData.boardId.boardTitle}
                        </label>
                      </>
                    )}
                  </li>
                </ul>
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <h5>
                    <label>Other Information</label>
                  </h5>
                </div>
                <ul className="priority-info">
                  <li>
                    <label
                      className="other-title"
                      style={{ minWidth: "120px" }}
                    >
                      {t("Tasks.tags")}
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "5px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                        padding: "5px",
                        minHeight: "38px",
                        cursor: "text",
                      }}
                      onClick={() => setInputVisible(true)}
                    >
                      {taskData.tags.map((tag, index) => (
                        <Tag
                          key={index}
                          closable={inputVisible}
                          onClose={() => handleRemoveTag(tag)}
                          style={{
                            maxWidth: "100%", // Ensures it stays within the container
                            wordBreak: "break-word", // Breaks long words
                            whiteSpace: "pre-wrap", // Wraps text properly
                            overflowWrap: "break-word", // Ensures it wraps inside the container
                            backgroundColor: "rgba(247, 247, 248, 1)", // Your custom color
                            color: "rgba(111, 125, 138, 1)", // Adjust text color for contrast
                            borderRadius: "70px",
                            border: "0px",
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}

                      {/* Show input only when activated */}
                      {inputVisible && (
                        <Input
                          autoFocus
                          size="small"
                          style={{
                            border: "none",
                            outline: "none",
                            width: "100px",
                          }}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onPressEnter={handleAddTag}
                          onBlur={handleAddTag} // Close input on blur
                        />
                      )}
                    </div>

                    {/* Add Button (Bottom Right) */}
                    <div style={{ textAlign: "right", marginTop: "5px" }}>
                      <span
                        onClick={() => setInputVisible(true)}
                        style={{
                          cursor: "pointer",
                          color: "rgba(255, 155, 68, 1)",
                        }}
                      >
                        <PlusCircleOutlined /> Add Tags
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <div className="project-description">
              <h5 className="card-title">
                {t("finance.Invoices.description")}
              </h5>
              <p>{taskData?.description}</p>
            </div>

            {taskData?.tags && taskData.tags.length > 0 && (
              <div className="project-tags">
                <h5 className="card-title">{t("Tasks.tags")}</h5>
                <div className="tags">
                  {taskData.tags.map((tag, index) => (
                    <span key={index} className="badge badge-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{t("Tasks.details")}</h5>
            {taskData?.projectId && (
              <div className="task-detail">
                <label>{t("Tasks.project")}:</label>
                <span>{taskData.projectId.projectName}</span>
              </div>
            )}
            {taskData?.boardId && (
              <div className="task-detail">
                <label>{t("sideBar.taskBoard")}:</label>
                <span>{taskData.boardId.boardTitle}</span>
              </div>
            )}
            <div className="task-detail">
              <label>{t("Status")}:</label>
              <span>{taskData?.lane}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
