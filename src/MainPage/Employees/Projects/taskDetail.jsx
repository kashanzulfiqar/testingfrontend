import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
  const [descriptionValue, setDescriptionValue] = useState("");
  const [descriptionDropdownOpen, setDescriptionDropdownOpen] = useState(false);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  // Add refs for dropdowns
  const statusDropdownRef = React.useRef(null);
  const membersDropdownRef = React.useRef(null);
  const addMembersRef = React.useRef(null);
  const descriptionDropdownRef = React.useRef(null);

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
    setDescriptionDropdownOpen(false);
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
        !addMembersRef.current?.contains(event.target) &&
        !descriptionDropdownRef.current?.contains(event.target)
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

  // Add description dropdown click handler
  const handleDescriptionDropdownClick = (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    setDescriptionDropdownOpen(true);
  };

  const fetchTaskDetails = async () => {
    const taskId = taskData?._id;
    if (!taskId) return;

    try {
      const res = await apiServices(
        "GET",
        `tasks?taskId=${taskId}`,
        null,
        user_state
      );
      if (res?.data?.success) {
        const updatedTask = res?.data?.Task;
        setTaskData(updatedTask);
        // Update the location state to keep it in sync
        navigate(location.pathname, {
          state: { ...location.state, taskData: updatedTask },
          replace: true,
        });
      } else {
        message.error(t("Failed to fetch task details"));
      }
    } catch (err) {
      message.error(
        err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
          t("Error fetching task details")
      );
    } finally {
      setTagLoading(false);
      setIsStatusLoading(false);
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

      setIsStatusLoading(true);
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

      setTagLoading(true);
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

    setTagLoading(true);
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
    // Update state first
    const selectedDevelopers = values
      .map((value) => availableMembers.find((member) => member._id === value))
      .filter(Boolean);

    setSelectedMembers(selectedDevelopers);

    // // Close dropdown and remove focus
    // setTimeout(() => {
    //   setIsEditingMembers(false);

    //   // Remove focus from the select component
    //   document.activeElement?.blur();
    //   const selectInput = document.querySelector("#area .ant-select-selector");
    //   if (selectInput) {
    //     selectInput.blur();
    //   }
    // }, 50);

    // Only close after successful update
    setIsEditingMembers(false);
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

  // Add this useEffect to initialize descriptionValue when taskData changes
  useEffect(() => {
    setDescriptionValue(taskData?.description || "");
  }, [taskData]);

  // Update the description save handler
  const handleSaveDescription = async () => {
    // Validate description
    if (!descriptionValue || descriptionValue.trim() === "") {
      message.error(t("Tasks.pleaseenterdescription"));
      return;
    }
    if (descriptionValue.length <= 4) {
      message.error(t("Tasks.descriptionLength"));
      return;
    }
    setIsEditing(false);
    setIsDescriptionLoading(true);

    // Update local state immediately for better UX
    const updatedTaskData = {
      ...taskData,
      description: descriptionValue,
    };
    setTaskData(updatedTaskData);
    navigate(location.pathname, {
      state: { ...location.state, taskData: updatedTaskData },
      replace: true,
    });

    // Add save logic here
    const data = {
      _id: taskData._id,
      description: descriptionValue,
    };

    try {
      const res = await apiServices("PUT", "tasks", data, user_state);
      if (res?.data?.success === true) {
        await fetchTaskDetails();
        message.success(t("Description updated successfully"));
      } else {
        // Revert changes if API call fails
        setTaskData(taskData);
        navigate(location.pathname, {
          state: { ...location.state, taskData: taskData },
          replace: true,
        });
        message.error(t("Failed to update description"));
      }
    } catch (err) {
      // Revert changes if API call fails
      setTaskData(taskData);
      navigate(location.pathname, {
        state: { ...location.state, taskData: taskData },
        replace: true,
      });
      message.error(
        err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
          t("Error updating description")
      );
    } finally {
      setIsDescriptionLoading(false);
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
                  {isStatusLoading ? (
                    <Spin size="small" />
                  ) : (
                    <>
                      <i
                        className={`fa fa-dot-circle-o text-${taskData?.columnColor}`}
                      />{" "}
                      {taskData?.lane || "No status"}
                    </>
                  )}
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
                      {isEditingMembers ? (
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
                                      e.preventDefault();
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
                          dropdownMatchSelectWidth={false}
                          dropdownStyle={{ minWidth: "200px" }}
                          onBlur={() => {
                            // Only close if not clicking on a member or remove button
                            setTimeout(() => {
                              const activeElement = document.activeElement;
                              if (
                                !document
                                  .getElementById("area")
                                  ?.contains(activeElement)
                              ) {
                                setIsEditingMembers(false);
                              }
                            }, 200);
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
                      ) : (
                        <div className="project-members">
                          <ul
                            className="team-members"
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: "8px",
                              border: "1px solid #d9d9d9",
                              borderRadius: "4px",
                              padding: "5px",
                              minHeight: "38px",
                            }}
                          >
                            {selectedMembers
                              ?.slice(0, 3)
                              .map((member, index) => (
                                <span
                                  key={index}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    background: "rgba(247, 247, 248, 1)",
                                    padding: "4px 12px 4px 4px",
                                    borderRadius: "20px",
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
                                  {member?.fullName}
                                </span>
                              ))}
                            {selectedMembers?.length > 3 && (
                              <li className="dropdown avatar-dropdown">
                                <Link
                                  className="all-users dropdown-toggle projectTeamMember"
                                  style={{
                                    display: "inline-flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    background: "#E9E9E9",
                                    borderRadius: "50%",
                                    color: "#777",
                                    fontSize: "14px",
                                  }}
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  +{selectedMembers?.length - 3}
                                </Link>
                                <div
                                  className="dropdown-menu dropdown-menu-right"
                                  style={{
                                    minWidth: "150px",
                                    padding: "10px",
                                    marginTop: "5px",
                                  }}
                                >
                                  <div className="avatar-group">
                                    {selectedMembers
                                      ?.slice(3)
                                      .map((member, index) => (
                                        <div
                                          key={index}
                                          className="avatar avatar-xs projectTeamMember"
                                          // style={{
                                          //   alignItems: "center",
                                          //   gap: "-8px",
                                          //   padding: "5px",
                                          //   borderRadius: "4px",
                                          //   cursor: "default"
                                          // }}
                                        >
                                          <Tooltip title={member?.fullName}>
                                            <Avatar
                                              src={
                                                member?.imageUrl || user_icon
                                              }
                                              style={{ cursor: "pointer" }}
                                            />
                                          </Tooltip>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      <div style={{ textAlign: "right", marginTop: "5px" }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingMembers(true);
                            setTimeout(() => {
                              const selectInput = document.querySelector(
                                "#area .ant-select-selection-search-input"
                              );
                              selectInput?.focus();
                            }, 100);
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
                    <div
                      className="dropdown"
                      ref={descriptionDropdownRef}
                      style={{ position: "relative" }}
                    >
                      <a
                        href="javascript:void(0)"
                        className="action-icon"
                        onClick={handleDescriptionDropdownClick}
                        aria-expanded={descriptionDropdownOpen}
                      >
                        <i className="material-icons">more_vert</i>
                      </a>
                      <div
                        className={`dropdown-menu dropdown-menu-right ${
                          descriptionDropdownOpen ? "show" : ""
                        }`}
                        style={{
                          position: "absolute",
                          right: 0,
                          left: "auto",
                          transform: "none",
                          top: "100%",
                          minWidth: "120px",
                        }}
                      >
                        <a
                          className="dropdown-item"
                          href="javascript:void(0)"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                            setDescriptionDropdownOpen(false);
                          }}
                        >
                          <i className="fa fa-pencil m-r-5" /> Edit
                        </a>
                      </div>
                    </div>
                  </div>
                  {isEditing ? (
                    <div
                      className="editor-container"
                      style={{ margin: "15px 0" }}
                    >
                      <Input.TextArea
                        style={{
                          width: "100%",
                          minHeight: "150px",
                          padding: "20px",
                          backgroundColor: "rgba(247, 247, 248, 1)",
                          borderRadius: "8px",
                          resize: "vertical",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          color: "#6c757d",
                          border: "none",
                        }}
                        value={descriptionValue}
                        onChange={(e) => setDescriptionValue(e.target.value)}
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
                          onClick={() => {
                            setIsEditing(false);
                            setDescriptionValue(taskData?.description || "");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleSaveDescription}
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
                        minHeight: "195px",
                        color: "#6c757d",
                        lineHeight: "1.6",
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {isDescriptionLoading ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "150px",
                          }}
                        >
                          <Spin size="large" />
                        </div>
                      ) : (
                        taskData?.description || "No description available"
                      )}
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
