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
  Button,
  DatePicker,
  Card,
  Dropdown,
  Menu,
} from "antd";
import { PlusCircleOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined, CloseCircleOutlined, CheckOutlined, CloseOutlined, UploadOutlined, PaperClipOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, EllipsisOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import { user_icon } from "../../../Entryfile/imagepath";
import moment from 'moment';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activityTab, setActivityTab] = useState("comments");
  const [assignee, setAssignee] = useState(taskData?.assignee || null);
  const [priority, setPriority] = useState(taskData?.priority || null);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [assigneeSelectOpen, setAssigneeSelectOpen] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [editingLabels, setEditingLabels] = useState(false);
  const [dueDateValue, setDueDateValue] = useState(taskData.dueDate ? moment(taskData.dueDate) : null);
  const [labelsValue, setLabelsValue] = useState(taskData.labels || []);
  const [labelsInput, setLabelsInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add refs for dropdowns
  const statusDropdownRef = React.useRef(null);
  const membersDropdownRef = React.useRef(null);
  const addMembersRef = React.useRef(null);
  const descriptionDropdownRef = React.useRef(null);
  const fileInputRef = React.useRef();

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

  // Fetch all employees for assignee dropdown
  useEffect(() => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then(res => {
        if (res?.data?.success) setAllEmployees(res.data.User || []);
      });
  }, []);

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

  // Fetch comments for a task
  const fetchComments = async (taskId) => {
    setCommentsLoading(true);
    try {
      const res = await apiServices("GET", `tasks/${taskId}/comments`, null, user_state);
      if (res?.data?.success) {
        setComments(res.data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      setComments([]);
    }
    setCommentsLoading(false);
  };
  // Post a new comment
  const postComment = async () => {
    if (!comment.trim() || !taskData?._id) return;
    setPostingComment(true);
    try {
      const res = await apiServices("POST", `tasks/${taskData._id}/comments`, { text: comment }, user_state);
      if (res?.data?.success) {
        setComment("");
        fetchComments(taskData._id);
      }
    } catch (err) {}
    setPostingComment(false);
  };
  // Fetch comments when taskData changes
  useEffect(() => {
    if (taskData?._id) {
      fetchComments(taskData._id);
    } else {
      setComments([]);
    }
  }, [taskData?._id]);

  const fetchHistory = async (taskId) => {
    setHistoryLoading(true);
    try {
      const res = await apiServices("GET", `tasks/${taskId}/history`, null, user_state);
      if (res?.data?.success) {
        setHistory(res.data.history);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setHistory([]);
    }
    setHistoryLoading(false);
  };
  console.log("Active Tab",activeTab)

  useEffect(() => {
    if (activeTab === "activity" && taskData?._id) {
      fetchHistory(taskData._id);
    }
  }, [activeTab, taskData?._id]);

  const handleAssignToMe = async () => {
    setAssigneeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, assignee: user_state.user }, user_state);
      if (res?.data?.success) {
        setAssignee(user_state.user);
        fetchTaskDetails();
        message.success("Assigned to you");
      }
    } catch (err) {
      message.error("Failed to assign");
    }
    setAssigneeLoading(false);
  };
  const handlePriorityChange = async (value) => {
    setPriorityLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, priority: value }, user_state);
      if (res?.data?.success) {
        setPriority(value);
        fetchTaskDetails();
        message.success("Priority updated");
      }
    } catch (err) {
      message.error("Failed to update priority");
    }
    setPriorityLoading(false);
  };
  const priorityOptions = [
    { value: 'Highest', label: (<><ArrowUpOutlined style={{color: '#e74c3c'}} /> Highest</>) },
    { value: 'High', label: (<><ArrowUpOutlined style={{color: '#e67e22'}} /> High</>) },
    { value: 'Medium', label: (<><MinusOutlined style={{color: '#f1c40f'}} /> Medium</>) },
    { value: 'Low', label: (<><ArrowDownOutlined style={{color: '#3498db'}} /> Low</>) },
    { value: 'Lowest', label: (<><ArrowDownOutlined style={{color: '#2980b9'}} /> Lowest</>) },
  ];

  const handleAssignToUser = async (userId) => {
    setAssigneeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, assignee: userId }, user_state);
      if (res?.data?.success) {
        setAssignee(allEmployees.find(u => u._id === userId) || null);
        fetchTaskDetails();
        message.success("Assignee updated");
      }
    } catch (err) {
      message.error("Failed to assign");
    }
    setAssigneeLoading(false);
  };
  const handleUnassign = async () => {
    setAssigneeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, assignee: null }, user_state);
      if (res?.data?.success) {
        setAssignee(null);
        fetchTaskDetails();
        message.success("Unassigned");
      }
    } catch (err) {
      message.error("Failed to unassign");
    }
    setAssigneeLoading(false);
  };

  const handleDueDateSave = async () => {
    try {
      await apiServices('PUT', 'tasks', { _id: taskData._id, dueDate: dueDateValue ? dueDateValue.toISOString() : null }, user_state);
      message.success('Due date updated');
      setEditingDueDate(false);
      fetchTaskDetails();
    } catch (err) {
      message.error('Failed to update due date');
    }
  };
  const handleLabelsSave = async () => {
    try {
      await apiServices('PUT', 'tasks', { _id: taskData._id, labels: labelsValue }, user_state);
      message.success('Labels updated');
      setEditingLabels(false);
      fetchTaskDetails();
    } catch (err) {
      message.error('Failed to update labels');
    }
  };

  // Fetch attachments
  const fetchAttachments = async () => {
    if (!taskData?._id) return;
    setAttachmentsLoading(true);
    try {
      const res = await apiServices("GET", `tasks/${taskData._id}/attachments`, null, user_state);
      if (res?.data?.success) {
        setAttachments(res.data.files || []);
      } else {
        setAttachments([]);
      }
    } catch (err) {
      setAttachments([]);
    }
    setAttachmentsLoading(false);
  };

  useEffect(() => {
    fetchAttachments();
  }, [taskData?._id]);

  const API_URL = process.env.REACT_APP_API_BASE_URL || '';
  // Upload handler
  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !taskData?._id) return;
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const xhr = new XMLHttpRequest();
      // Use the correct token path and fallback
      const token = user_state?.access_token?.accessToken || localStorage.getItem('token');
      console.log('Uploading with token:', token);
      // Use environment variable for backend API URL
      xhr.open('POST', `${API_URL}/tasks/${taskData._id}/attachments`);
      xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        setUploading(false);
        setUploadProgress(0);
        if (xhr.status === 200) {
          fetchAttachments();
          message.success('Attachment uploaded');
        } else {
          message.error('Failed to upload attachment');
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        setUploadProgress(0);
        message.error('Failed to upload attachment');
      };
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      message.error('Failed to upload attachment');
    }
  };

  const handleUploadButtonClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.value = null; // reset so same file can be picked again
      fileInputRef.current.click();
    }
  };

  // Delete handler
  const handleDeleteAttachment = async (fileId) => {
    if (!taskData?._id || !fileId) return;
    setAttachmentsLoading(true);
    try {
      const res = await apiServices('DELETE', `tasks/${taskData._id}/attachments/${fileId}`, null, user_state);
      if (res?.data?.success) {
        message.success('Attachment deleted');
        fetchAttachments();
      } else {
        message.error('Failed to delete attachment');
      }
    } catch (err) {
      message.error('Failed to delete attachment');
    }
    setAttachmentsLoading(false);
  };

  const handleHideAttachment = (fileId) => {
    // Implement hide logic or just stub for now
    message.info('Hide on card clicked (not implemented)');
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
              <div className="card">
                <div className="card-body">
                  <h5 style={{fontWeight: 600, marginBottom: 24}}>Details</h5>
                  {/* Assignee */}
                  <div style={{marginBottom: 20}}>
                    <div style={{fontWeight: 500}}>Assignee <span><i className="fa fa-thumb-tack" style={{fontSize: 13}} /></span></div>
                    <Select
                      showSearch
                      style={{width: '100%', marginTop: 4}}
                      placeholder="Assignee"
                      value={assignee?._id || 'unassigned'}
                      onChange={val => {
                        if (val === 'unassigned') handleUnassign();
                        else handleAssignToUser(val);
                      }}
                      loading={assigneeLoading}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children[1]?.props?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      dropdownMatchSelectWidth={false}
                      open={assigneeSelectOpen}
                      onDropdownVisibleChange={setAssigneeSelectOpen}
                      dropdownRender={menu => (
                        <div>
                          {menu}
                        </div>
                      )}
                    >
                      <Select.Option key="unassigned" value="unassigned">
                        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                          <UserOutlined style={{fontSize: 18}} />
                          <span>Unassigned</span>
                        </span>
                      </Select.Option>
                      {allEmployees.map(user => (
                        <Select.Option key={user._id} value={user._id}>
                          <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <Avatar size={24} src={user.imageUrl} style={{background: '#2d3e50', fontWeight: 600}}>
                              {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <span>{user.fullName}</span>
                          </span>
                        </Select.Option>
                      ))}
                    </Select>
                    {/* Assign to me button below dropdown */}
                    {(!assignee || assignee?._id !== user_state?.user?._id) && (
                      <div style={{marginTop: 8}}>
                        <a style={{color: '#1890ff', fontSize: 13, cursor: 'pointer'}} onClick={handleAssignToMe} disabled={assigneeLoading}>
                          Assign to me
                        </a>
                      </div>
                    )}
                  </div>
                  {/* Priority */}
                  <div style={{marginBottom: 20}}>
                    <div style={{fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6}}>Priority <span><i className="fa fa-thumb-tack" style={{fontSize: 13}} /></span></div>
                    <Select
                      style={{width: '100%', marginTop: 4}}
                      placeholder="Select Priority"
                      value={priority}
                      onChange={handlePriorityChange}
                      loading={priorityLoading}
                      optionLabelProp="label"
                    >
                      {priorityOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  {/* Due Date */}
                  <div style={{marginBottom: 20}}>
                    <div style={{fontWeight: 500}}>Due date</div>
                    <div style={{marginTop: 4, color: '#555'}}>
                      {editingDueDate ? (
                        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                          <DatePicker
                            value={dueDateValue}
                            onChange={setDueDateValue}
                            allowClear
                            style={{minWidth: 120}}
                          />
                          <CheckOutlined style={{color: '#52c41a', cursor: 'pointer'}} onClick={handleDueDateSave} />
                          <CloseOutlined style={{color: '#f5222d', cursor: 'pointer'}} onClick={() => { setEditingDueDate(false); setDueDateValue(taskData.dueDate ? moment(taskData.dueDate) : null); }} />
                        </span>
                      ) : (
                        <span style={{cursor: 'pointer'}} onClick={() => setEditingDueDate(true)}>
                          {taskData.dueDate ? moment(taskData.dueDate).format('YYYY-MM-DD') : 'None'}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Labels */}
                  <div style={{marginBottom: 20}}>
                    <div style={{fontWeight: 500}}>Labels</div>
                    <div style={{marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap'}}>
                      {editingLabels ? (
                        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                          <Select
                            mode="tags"
                            style={{minWidth: 180}}
                            value={labelsValue}
                            onChange={setLabelsValue}
                            open={true}
                            tokenSeparators={[',']}
                            placeholder="Add labels"
                          />
                          <CheckOutlined style={{color: '#52c41a', cursor: 'pointer'}} onClick={handleLabelsSave} />
                          <CloseOutlined style={{color: '#f5222d', cursor: 'pointer'}} onClick={() => { setEditingLabels(false); setLabelsValue(taskData.labels || []); }} />
                        </span>
                      ) : (
                        <span style={{cursor: 'pointer'}} onClick={() => setEditingLabels(true)}>
                          {taskData.labels && taskData.labels.length > 0 ? (
                            taskData.labels.map((label, idx) => (
                              <Tag key={idx} color="blue">{label}</Tag>
                            ))
                          ) : (
                            <span style={{color: '#888'}}>None</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
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
          </div>
          <div className="col-xl-9">
            <div className="contact-tab-wrap">
              <ul className="contact-nav nav">
                <li>
                  <a
                    onClick={() => setActiveTab("description")}
                    className={activeTab === "description" ? "active" : ""}
                  >
                    <i className="las la-file" />
                    Description
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setActiveTab("activity")}
                    className={activeTab === "activity" ? "active" : ""}
                  >
                    <i className="las la-history" />
                    Activity
                  </a>
                </li>
              </ul>
            </div>
            <div className="contact-tab-view">
              <div className="tab-content pt-0">
                {/* Description Tab */}
                <div
                  className={`tab-pane fade ${activeTab === "description" ? "active show" : ""}`}
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
                      <ReactQuill
                        value={descriptionValue}
                        onChange={setDescriptionValue}
                        theme="snow"
                        style={{ minHeight: 150 }}
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
                      dangerouslySetInnerHTML={{ __html: descriptionValue || taskData?.description || '' }}
                    />
                  )}
                </div>
                {/* Attachments Section (inside Description tab, after description) */}
                {activeTab === "description" && (
                  <div style={{ margin: '24px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}><PaperClipOutlined /> Attachments</span>
                      <span style={{
                        background: '#eee',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        marginLeft: 8,
                        padding: '2px 8px',
                      }}>{attachments.length}</span>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleAttachmentUpload}
                        disabled={uploading}
                      />
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploading}
                        disabled={uploading}
                        size="small"
                        style={{ marginLeft: 'auto' }}
                        onClick={handleUploadButtonClick}
                        type="button"
                      >
                        Upload
                      </Button>
                    </div>
                    {uploading && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ width: 200 }}>
                          <div style={{ background: '#f0f0f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                            <div style={{ width: `${uploadProgress}%`, background: '#1890ff', height: 8 }} />
                          </div>
                          <span style={{ fontSize: 12 }}>{uploadProgress}%</span>
                        </div>
                      </div>
                    )}
                    <div style={{ minHeight: 40 }}>
                      {attachmentsLoading ? <Spin /> : attachments.length === 0 ? <Empty description="No attachments" /> : (
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {attachments.map(file => {
                            const isImage = file.imageUrl && /\.(jpg|jpeg|png|gif)$/i.test(file.fileName || '');
                            const menu = (
                              <Menu>
                                <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleDeleteAttachment(file._id)}>
                                  Delete
                                </Menu.Item>
                              </Menu>
                            );
                            return (
                              <Card
                                key={file._id}
                                hoverable
                                style={{ width: 180, borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2', padding: 0, position: 'relative' }}
                                cover={
                                  <div style={{ position: 'relative' }}>
                                    {isImage
                                      ? <img alt={file.fileName} src={file.imageUrl} style={{ borderRadius: '12px 12px 0 0', height: 100, objectFit: 'cover', width: '100%' }} />
                                      : <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '12px 12px 0 0' }}>No Preview</div>
                                    }
                                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, zIndex: 2 }}>
                                      <Tooltip title="Download">
                                        <a
                                          href={file.imageUrl}
                                          download={file.fileName}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            background: '#fff',
                                            borderRadius: '50%',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 4,
                                            transition: 'box-shadow 0.2s',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <DownloadOutlined style={{ fontSize: 18 }} />
                                        </a>
                                      </Tooltip>
                                      <Dropdown overlay={menu} trigger={['click']}>
                                        <Button
                                          shape="circle"
                                          icon={<EllipsisOutlined style={{ fontSize: 18 }} />}
                                          style={{
                                            background: '#fff',
                                            border: 'none',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'box-shadow 0.2s',
                                            cursor: 'pointer',
                                          }}
                                        />
                                      </Dropdown>
                                    </div>
                                  </div>
                                }
                              >
                                <div style={{ fontWeight: 500, fontSize: 13, wordBreak: 'break-all' }}>{file.fileName}</div>
                                <div style={{ fontSize: 11, color: '#888' }}>
                                  {file.createdAt ? new Date(file.createdAt).toLocaleString() : ''}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Activity Tab */}
                <div className={`tab-pane fade ${activeTab === "activity" ? "active show" : ""}`}>
                  <div style={{marginTop: 24}}>
                    <div style={{ borderBottom: '1px solid #eee', marginBottom: 16, display: 'flex', gap: 24 }}>
                      <div
                        style={{
                          padding: '8px 0',
                          cursor: 'pointer',
                          borderBottom: activityTab === 'comments' ? '2px solid #1890ff' : 'none',
                          fontWeight: activityTab === 'comments' ? 600 : 400
                        }}
                        onClick={() => setActivityTab('comments')}
                      >
                        Comments
              </div>
                      <div
                        style={{
                          padding: '8px 0',
                          cursor: 'pointer',
                          borderBottom: activityTab === 'history' ? '2px solid #1890ff' : 'none',
                          fontWeight: activityTab === 'history' ? 600 : 400
                        }}
                        onClick={() => setActivityTab('history')}
                      >
                        History
            </div>
          </div>
                    {activityTab === 'comments' && (
                      <div className="comments-section">
                        <h5>Comments</h5>
                        <div style={{ maxHeight: 250, overflowY: 'auto', paddingRight: 8 }}>
                          {commentsLoading ? (
                            <Spin />
                          ) : comments.length === 0 ? (
                            <Empty description="No comments yet" />
                          ) : (
                            comments.map((c, idx) => (
                              <div key={idx} style={{display: 'flex', alignItems: 'flex-start', marginBottom: 12}}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 600, marginRight: 12
                                }}>
                                  {c.userName ? c.userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div style={{fontWeight: 500}}>{c.userName || 'User'} <span style={{color: '#888', fontSize: 12, marginLeft: 8}}>{new Date(c.createdAt).toLocaleString()}</span></div>
                                  <div>{c.text}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div style={{marginTop: 16}}>
                          <Input.TextArea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            onPressEnter={e => { e.preventDefault(); postComment(); }}
                            disabled={postingComment}
                          />
                          <div style={{marginTop: 8, display: 'flex', gap: 8}}>
                            {["Who is working on this...?", "Status update...", "Thanks..."].map((txt, i) => (
                              <Button key={i} size="small" onClick={() => setComment(txt)}>{txt}</Button>
                            ))}
                            <Button type="primary" onClick={postComment} loading={postingComment} style={{marginLeft: 'auto'}}>Post</Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {activityTab === 'history' && (
                      <div>
                        <h5>Activity</h5>
                        <div style={{ maxHeight: 250, overflowY: 'auto', paddingRight: 8 }}>
                          {historyLoading ? (
                            <Spin />
                          ) : history.length === 0 ? (
                            <Empty description="No history yet" />
                          ) : (
                            history.map((h, idx) => (
                              <div key={idx} style={{display: 'flex', alignItems: 'flex-start', marginBottom: 18}}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 600, marginRight: 12
                                }}>
                                  {h.userName ? h.userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div style={{fontWeight: 500}}>
                                    {h.userName || 'User'} {h.action}
                                    {h.field && (
                                      <>
                                        {" "}
                                        <span style={{fontWeight: 400}}>
                                          {h.field === "status" && (
                                            <>
                                              <span style={{border: '1px solid #bbb', borderRadius: 4, padding: '2px 8px', margin: '0 4px'}}>{h.from || "None"}</span>
                                              <span style={{margin: '0 4px'}}>→</span>
                                              <span style={{border: '1px solid #bbb', borderRadius: 4, padding: '2px 8px', margin: '0 4px'}}>{h.to || "None"}</span>
                                            </>
                                          )}
                                          {h.field !== "status" && (
                                            <>
                                              <span style={{color: '#888', margin: '0 4px'}}>{h.from || "None"}</span>
                                              <span style={{margin: '0 4px'}}>→</span>
                                              <span style={{color: '#888', margin: '0 4px'}}>{h.to || "None"}</span>
                                            </>
                                          )}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div style={{color: '#888', fontSize: 12}}>{new Date(h.createdAt).toLocaleString()}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
