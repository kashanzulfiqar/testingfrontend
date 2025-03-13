import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Input,
  message,
  Select,
  Spin,
  Tag,
  Tooltip,
  Empty,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import { user_icon } from "../../../Entryfile/imagepath";

const TaskDetails = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [taskData, setTaskData] = useState(location.state.taskData || {});
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [tagLoading, setTagLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberLoading, setMemberLoading] = useState(true);
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isEditing, setIsEditing] = useState(false);

  // Add refs for dropdowns
  const statusDropdownRef = React.useRef(null);
  const membersDropdownRef = React.useRef(null);
  const addMembersRef = React.useRef(null);

  // Add user state from Redux
  const user_state = useSelector((state) => state?.user?.loginvalue);

  useEffect(() => {
    if (taskData?._id) {
      fetchTaskDetails();
    }
  }, []);

  // Update useEffect to get developers from projectId
  useEffect(() => {
    if (taskData?._id) {
      setSelectedMembers(taskData?.assignedDevelopers || []);
      setAvailableMembers(
        taskData?.projectId?.associatedBoard?.assignedDevelopers ||
          taskData?.boardId?.assignedDevelopers ||
          []
      );
      setMemberLoading(false);
    }
  }, [taskData]);

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setOpenStatusDropdown(false);
    setMemberDropdownOpen(false);
    const membersDropdown =
      membersDropdownRef.current?.querySelector(".dropdown-menu");
    if (membersDropdown) {
      membersDropdown.classList.remove("show");
    }
    // Only close member editing if we're not in the Select component area
    const selectContainer = document.getElementById("area");
    const activeElement = document.activeElement;
    if (!selectContainer?.contains(activeElement)) {
      setIsEditingMembers(false);
    }
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !statusDropdownRef.current?.contains(event.target) &&
        !membersDropdownRef.current?.contains(event.target) &&
        !addMembersRef.current?.contains(event.target)
      ) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Modify status dropdown click handler
  const handleStatusDropdownClick = (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    setOpenStatusDropdown(true);
  };

  const fetchTaskDetails = async () => {
    const taskId = taskData?._id;
    if (!taskId) return;

    setTagLoading(true);
    try {
      apiServices("GET", `tasks?taskId=${taskId}`, null, user_state).then(
        (res) => {
          if (res?.data?.success) {
            setTaskData(res?.data?.Task);
          } else {
            message.error(t("Failed to fetch task details"));
          }
          setTagLoading(false);
        }
      );
    } catch (err) {
      message.error(
        err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
          t("Error fetching task details")
      );
      setTagLoading(false);
    }
  };

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
      columnId: option.columnId,
    })) || [];

  const handleUpdateStatus = (boardId, taskId, sourceId, destinationId) => {
    if (boardId && taskId && sourceId && destinationId) {
      let updated_data = {
        _id: boardId,
        columnId: destinationId,
        prevColumn: sourceId,
        taskId: taskId,
      };

      apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            message.success(t("Task status updated successfully"));
            fetchTaskDetails();
          }
        })
        .catch((err) => {
          message.error(
            err?.response?.data?.msg ||
              err?.response?.data?.validation?.body?.message ||
              t("Error updating status")
          );
        });
    } else {
      message.error(t("Please select a status"));
    }
  };

  const handleAddTag = () => {
    if (inputValue.trim() && !taskData.tags.includes(inputValue.trim())) {
      const newTags = [...taskData.tags, inputValue.trim()];
      console.log("newTags add", newTags);
      // Prepare data for API call
      const data = {
        _id: taskData._id,
        tags: newTags,
      };

      apiServices("PUT", "tasks", data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchTaskDetails();
            message.success(t("Tags updated successfully"));
          } else {
            message.error(t("Failed to update tags"));
          }
        })
        .catch((err) => {
          message.error(
            err?.response?.data?.msg ||
              err?.response?.data?.validation?.body?.message ||
              t("Error updating tags")
          );
        });
    }
    setInputValue("");
    setInputVisible(false); // Hide input after adding
  };

  const handleRemoveTag = (removedTag) => {
    console.log("removedTag", removedTag);
    const newTags = taskData.tags.filter((tag) => tag !== removedTag);

    const data = {
      _id: taskData._id,
      tags: newTags,
    };

    // Prevent input from being hidden when removing a tag
    setTimeout(() => {
      apiServices("PUT", "tasks", data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchTaskDetails();
            message.success(t("Tag removed successfully"));
          } else {
            message.error(t("Failed to remove tag"));
          }
          setInputVisible(false);
        })
        .catch((err) => {
          message.error(
            err?.response?.data?.msg ||
              err?.response?.data?.validation?.body?.message ||
              t("Error removing tag")
          );
        });
    }, 0);
  };

  const handleMemberChange = (values) => {
    // Close dropdown and remove focus
    setIsEditingMembers(false);
    
    // Update state first
    const selectedDevelopers = values
      .map((value) => availableMembers.find((member) => member._id === value))
      .filter(Boolean);

    setSelectedMembers(selectedDevelopers);

    // Remove focus from the select component
    setTimeout(() => {
      document.activeElement?.blur();
      const selectInput = document.querySelector("#area .ant-select-selector");
      if (selectInput) {
        selectInput.blur();
      }
    }, 0);

    // Debounce API call to avoid multiple calls at once
    clearTimeout(window.teamUpdateTimeout);
    window.teamUpdateTimeout = setTimeout(() => {
      const data = {
        _id: taskData._id,
        assignedDevelopers: values,
      };

      apiServices("PUT", "tasks", data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchTaskDetails();
            message.success(t("Team members updated successfully"));
          } else {
            message.error(t("Failed to update team members"));
          }
        })
        .catch((err) => {
          message.error(
            err?.response?.data?.msg ||
              err?.response?.data?.validation?.body?.message ||
              t("Error updating team members")
          );
        });
    }, 100);
  };

  // Add a new function to handle dropdown visibility
  const handleDropdownVisibility = (open) => {
    if (!open) {
      // Only close if clicking outside the dropdown
      const activeElement = document.activeElement;
      const selectContainer = document.getElementById("area");
      if (!selectContainer?.contains(activeElement)) {
        setIsEditingMembers(false);
      }
    }
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
              <div className="dropdown action-label" ref={statusDropdownRef}>
                <a
                  className="btn btn-white btn-sm btn-rounded dropdown-toggle"
                  href="javascript:void(0)"
                  onClick={handleStatusDropdownClick}
                  aria-expanded={openStatusDropdown}
                >
                  <i
                    className={`fa fa-dot-circle-o text-${taskData?.columnColor}`}
                  />{" "}
                  {taskData?.lane || "No status"}
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
                        taskData?.lane === option.value ? "disabled" : ""
                      }`}
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(
                          taskData?.boardId?._id || taskData?.projectId?._id,
                          taskData?._id,
                          taskData?.columnId,
                          option.columnId
                        );
                        setOpenStatusDropdown(false);
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
                    >
                      {tagLoading ? (
                        <Spin size="small" />
                      ) : (
                        taskData.tags.map((tag, index) => (
                          <Tag
                            key={index}
                            onClose={(e) => {
                              e.stopPropagation(); // Prevent input field from losing focus when clicking the close button
                              handleRemoveTag(tag);
                            }}
                            closable={inputVisible}
                            style={{
                              maxWidth: "100%",
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "break-word",
                              backgroundColor: "rgba(247, 247, 248, 1)",
                              color: "rgba(111, 125, 138, 1)",
                              borderRadius: "20px",
                              border: "0px",
                              padding: "5px",
                            }}
                          >
                            {tag}
                          </Tag>
                        ))
                      )}

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
                          onBlur={(e) => {
                            // Only hide input if we're not clicking a tag's close button
                            const closestTag =
                              e.relatedTarget?.closest(".ant-tag");
                            if (!closestTag) {
                              handleAddTag();
                            }
                          }}
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
                  <li>
                    <label
                      className="other-title"
                      style={{ minWidth: "120px" }}
                    >
                      {t("Team Members")}
                    </label>
                    <div style={{ position: "relative" }} id="area">
                      <Select
                        mode="multiple"
                        style={{ width: "100%" }}
                        placeholder={t("Select team members")}
                        onChange={(values, option) => {
                          handleMemberChange(values);
                        }}
                        value={selectedMembers?.map((member) => member._id)}
                        open={isEditingMembers}
                        onDropdownVisibleChange={handleDropdownVisibility}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isEditingMembers) {
                            e.preventDefault();
                          }
                        }}
                        showSearch={isEditingMembers}
                        showArrow={false}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.props.children[1].props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        className="customselect-height custom-select"
                        notFoundContent={
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                        maxTagCount={3}
                        maxTagPlaceholder={(omittedValues) =>
                          `+${omittedValues.length} more`
                        }
                        tagRender={(props) => {
                          const member = selectedMembers.find(
                            (m) => m._id === props.value
                          );
                          return (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                background: "rgba(247, 247, 248, 1)",
                                padding: "4px 12px 4px 4px",
                                borderRadius: "20px",
                                gap: "8px",
                                marginRight: "8px",
                              }}
                            >
                              <Avatar
                                size={24}
                                src={member?.imageUrl || user_icon}
                                style={{
                                  minWidth: "24px",
                                }}
                              />
                              <span
                                style={{
                                  color: "rgba(111, 125, 138, 1)",
                                  fontSize: "14px",
                                  overflowWrap: "break-word",
                                  wordBreak: "break-word",
                                }}
                              >
                                {member?.fullName}
                              </span>
                              {isEditingMembers && (
                                <span
                                  style={{
                                    cursor: "pointer",
                                    color: "#999",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newValues = selectedMembers
                                      .filter((m) => m._id !== props.value)
                                      .map((m) => m._id);
                                    handleMemberChange(newValues);
                                  }}
                                >
                                  ×
                                </span>
                              )}
                            </span>
                          );
                        }}
                        dropdownStyle={{
                          minWidth: "200px",
                        }}
                      >
                        {availableMembers
                          .filter(
                            (developer) =>
                              !selectedMembers.some(
                                (member) => member._id === developer._id
                              )
                          )
                          .map((developer) => (
                            <Select.Option
                              key={developer._id}
                              value={developer._id}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Avatar
                                  size={24}
                                  src={developer?.imageUrl || user_icon}
                                />
                                <span>{developer.fullName}</span>
                              </div>
                            </Select.Option>
                          ))}
                      </Select>
                      <div style={{ textAlign: "right", marginTop: "5px" }}>
                        <span
                          onClick={() => {
                            setIsEditingMembers(true);
                            // Focus the select input to show the dropdown
                            const selectInput = document.querySelector(
                              "#area .ant-select-selector"
                            );
                            if (selectInput) {
                              selectInput.click();
                            }
                          }}
                          style={{
                            cursor: "pointer",
                            color: "rgba(255, 155, 68, 1)",
                          }}
                        >
                          <PlusCircleOutlined /> Add Members
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-xl-9">
            <div className="contact-tab-wrap">
              <ul className="contact-nav nav">
                <li>
                  <a
                    onClick={() => setActiveTab("description")}
                    data-bs-toggle="tab"
                    data-bs-target="#description"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                    }}
                    className={activeTab === "description" ? "active" : ""}
                  >
                    <i className="las la-file" />
                    Description
                  </a>
                </li>
              </ul>
            </div>
            <div className="contact-tab-view">
              <div className="tab-content pt-0">
                {/* Description Tab */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "description" ? "active show" : ""
                  }`}
                  id="description"
                >
                  <div className="view-header">
                    <h3>Description</h3>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ minWidth: "60px" }}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      Edit
                    </button>
                  </div>
                  {isEditing ? (
                    <div
                      className="editor-container"
                      style={{ margin: "15px 0" }}
                    >
                      <div
                        className="editor-toolbar"
                        style={{
                          padding: "10px",
                          backgroundColor: "#f8f9fa",
                          borderTopLeftRadius: "8px",
                          borderTopRightRadius: "8px",
                          border: "1px solid #CFD4D8",
                          borderBottom: "none",
                        }}
                      >
                        <select
                          className="editor-font"
                          defaultValue="CircularStd"
                        >
                          <option value="CircularStd">CircularStd</option>
                        </select>
                        <button className="editor-btn">
                          <i className="fas fa-undo"></i>
                        </button>
                        <button className="editor-btn">
                          <i className="fas fa-redo"></i>
                        </button>
                        <select className="editor-size" defaultValue="15">
                          <option value="15">15</option>
                        </select>
                        <button className="editor-btn">B</button>
                        <button className="editor-btn">I</button>
                        <button className="editor-btn">U</button>
                        <button className="editor-btn">
                          <i className="fas fa-highlighter"></i>
                        </button>
                        <button className="editor-btn">A</button>
                        <button className="editor-btn">
                          <i className="fas fa-list-ul"></i>
                        </button>
                        <button className="editor-btn">
                          <i className="fas fa-list-ol"></i>
                        </button>
                        <button className="editor-btn">
                          <i className="fas fa-align-left"></i>
                        </button>
                        <button className="editor-btn">
                          <i className="fas fa-link"></i>
                        </button>
                        <button className="editor-btn">
                          <i className="fas fa-image"></i>
                        </button>
                      </div>
                      <textarea
                        style={{
                          width: "100%",
                          minHeight: "150px",
                          padding: "20px",
                          border: "1px solid #CFD4D8",
                          borderBottomLeftRadius: "8px",
                          borderBottomRightRadius: "8px",
                          resize: "vertical",
                        }}
                        defaultValue={taskData?.description || ""}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          className="btn btn-light"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            // Add save logic here
                            setIsEditing(false);
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="description-content"
                      style={{
                        padding: "20px",
                        border: "1px solid #CFD4D8",
                        borderRadius: "8px",
                        margin: "15px 0",
                        minHeight: "150px",
                        color: "#6c757d",
                        lineHeight: "1.6",
                        fontSize: "14px",
                      }}
                    >
                      {taskData?.description || "No description available"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
