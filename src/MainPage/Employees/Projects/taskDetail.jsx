import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Input, message, Select, Spin, Tag, Tooltip } from "antd";
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

  // Add this useEffect to initialize members
  useEffect(() => {
    if (taskData?._id) {
      setSelectedMembers(taskData?.assignedDevelopers || []);
      setMemberLoading(false);
    }
  }, [taskData]);

  // Add this useEffect to initialize available members
  useEffect(() => {
    if (taskData?._id) {
      const developers =
        taskData?.projectId?.assignedDevelopers ||
        taskData?.boardId?.assignedDevelopers ||
        [];
      setAvailableMembers(developers);
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
    setIsEditingMembers(false);
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

  // Modify add members click handler
  const handleAddMembersClick = () => {
    closeAllDropdowns();
    setMemberDropdownOpen(true);
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
    const newTags = taskData.tags.filter((tag) => tag !== removedTag);

    const data = {
      _id: taskData._id,
      tags: newTags,
    };

    apiServices("PUT", "tasks", data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          fetchTaskDetails();
          message.success(t("Tag removed successfully"));
        } else {
          message.error(t("Failed to remove tag"));
        }
      })
      .catch((err) => {
        message.error(
          err?.response?.data?.msg ||
            err?.response?.data?.validation?.body?.message ||
            t("Error removing tag")
        );
      });
  };

  const handleMemberChange = (values) => {
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
                            closable={inputVisible}
                            onClose={() => handleRemoveTag(tag)}
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
                  <li>
                    <label
                      className="other-title"
                      style={{ minWidth: "120px" }}
                    >
                      {t("Team Members")}
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                        padding: "8px",
                        minHeight: "38px",
                        background: "#fff",
                      }}
                    >
                      {memberLoading ? (
                        <Spin size="small" />
                      ) : isEditingMembers ? (
                        <Select
                          mode="multiple"
                          style={{ width: "100%" }}
                          placeholder={t("Select team members")}
                          onChange={handleMemberChange}
                          value={selectedMembers?.map((member) => member._id)}
                        >
                          {(
                            taskData?.projectId?.assignedDevelopers ||
                            taskData?.boardId?.assignedDevelopers ||
                            []
                          ).map((developer) => (
                            <Select.Option
                              key={developer._id}
                              value={developer._id}
                            >
                              {developer.fullName}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        <div className="project-members">
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                            }}
                          >
                            {selectedMembers
                              ?.slice(0, 3)
                              .map((member, index) => (
                                <div
                                  key={index}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "rgba(247, 247, 248, 1)",
                                    padding: "4px 12px 4px 4px",
                                    borderRadius: "20px",
                                    gap: "8px",
                                  }}
                                >
                                  <Avatar
                                    size={24}
                                    src={member?.imageUrl || user_icon}
                                    style={{
                                      cursor: "pointer",
                                      minWidth: "24px",
                                    }}
                                  />
                                  <span
                                    style={{
                                      color: "rgba(111, 125, 138, 1)",
                                      fontSize: "14px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {member?.fullName}
                                  </span>
                                </div>
                              ))}

                            {selectedMembers?.length > 3 && (
                              <li
                                className="dropdown avatar-dropdown"
                                ref={membersDropdownRef}
                              >
                                <Link
                                  className="all-users dropdown-toggle projectTeamMember"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "32px",
                                    width: "32px",
                                    borderRadius: "50%",
                                    backgroundColor: "#E9ECEF",
                                    color: "#333",
                                    textDecoration: "none",
                                    fontSize: "13px",
                                  }}
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  +{selectedMembers?.length - 3}
                                </Link>
                                <div
                                  className="dropdown-menu dropdown-menu-right"
                                  style={{
                                    minWidth: "120px",
                                    padding: "8px",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <div
                                    className="avatar-group"
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "repeat(3, 1fr)",
                                      gap: "8px",
                                      justifyItems: "center",
                                    }}
                                  >
                                    {selectedMembers
                                      ?.slice(3)
                                      .map((member, index) => (
                                        <Tooltip
                                          key={index}
                                          title={member?.fullName}
                                        >
                                          <Avatar
                                            className="avatar-xs"
                                            src={member?.imageUrl || user_icon}
                                            style={{
                                              cursor: "pointer",
                                              width: "32px",
                                              height: "32px",
                                            }}
                                          />
                                        </Tooltip>
                                      ))}
                                  </div>
                                </div>
                              </li>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Add Member Button and Dropdown */}
                    <div
                      className="dropdown"
                      ref={addMembersRef}
                      style={{ textAlign: "right", marginTop: "5px" }}
                    >
                      <span
                        onClick={handleAddMembersClick}
                        style={{
                          cursor: "pointer",
                          color: "rgba(255, 155, 68, 1)",
                        }}
                      >
                        <PlusCircleOutlined /> Add Members
                      </span>
                      <div
                        className={`dropdown-menu dropdown-menu-right ${
                          memberDropdownOpen ? "show" : ""
                        }`}
                        style={{
                          minWidth: "250px",
                          padding: "10px",
                          border: "1px solid rgba(0,0,0,0.1)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Select
                          mode="multiple"
                          style={{ width: "100%" }}
                          placeholder={t("Select team members")}
                          value={selectedMembers?.map((member) => member._id)}
                          onChange={handleMemberChange}
                          open={true}
                          dropdownStyle={{ display: "none" }}
                        >
                          {availableMembers.map((member) => (
                            <Select.Option key={member._id} value={member._id}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Avatar
                                  size={24}
                                  src={member?.imageUrl || user_icon}
                                />
                                <span>{member.fullName}</span>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-xl-9">
            <div className="card">
              <div className="card-body">
                <div className="view-header">
                  <h3>Description</h3>
                </div>
                <div className="description-content" style={{ 
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  margin: '15px 0',
                  minHeight: '150px',
                  color: '#6c757d',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}>
                  {taskData?.description || "No description available"}
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
