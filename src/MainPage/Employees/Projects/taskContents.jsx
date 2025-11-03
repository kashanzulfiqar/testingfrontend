import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RichTextEditor from "../../../Components/RichTextEditor";
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
import { PlusCircleOutlined, PlusOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined, CloseCircleOutlined, CheckOutlined, CloseOutlined, UploadOutlined, PaperClipOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, EllipsisOutlined, EyeInvisibleOutlined, PlayCircleOutlined, FileTextOutlined, FileOutlined } from '@ant-design/icons';
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import { user_icon } from "../../../Entryfile/imagepath";
import moment from 'moment';
import LikeIcon from "../../../assets/Icons/Like.svg";
import EmojiIcon from "../../../assets/Icons/emojicon.svg";
import EditIcon from "../../../assets/Icons/Edit.svg";
import { BASE_URL } from '../../../config/apiConfig';

const getPriorityIcon = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'highest':
      return <ArrowUpOutlined style={{ color: '#FF0000' }} />;
    case 'high':
      return <ArrowUpOutlined style={{ color: '#FF4D4F' }} />;
    case 'medium':
      return <MinusOutlined style={{ color: '#FAAD14' }} />;
    case 'low':
      return <ArrowDownOutlined style={{ color: '#52C41A' }} />;
    case 'lowest':
      return <ArrowDownOutlined style={{ color: '#1890FF' }} />;
    default:
      return <MinusOutlined style={{ color: '#FAAD14' }} />;
  }
};

const TaskContent = ({taskDatas={}, closeModal}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const initialLoad = useRef(false);
  
  // Task type options
  const taskTypes = [
    { value: 'Task', label: 'Task', icon: <CheckOutlined /> },
    { value: 'Story', label: 'Story', icon: <FileTextOutlined /> },
    { value: 'Bug', label: 'Bug', icon: <CloseCircleOutlined style={{ color: '#f5222d' }} /> },
    { value: 'Epic', label: 'Epic', icon: <PlusCircleOutlined style={{ color: '#722ed1' }} /> },
  ];
  const [taskData, setTaskData] = useState(taskDatas);
  const [taskType, setTaskType] = useState(taskDatas?.type || 'Task');

  // Update taskType when taskData changes
  useEffect(() => {
    if (taskData?.type) {
      setTaskType(taskData.type);
    }
  }, [taskData]);
  const [editingType, setEditingType] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [tagLoading, setTagLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("attachments");
  const [isEditing, setIsEditing] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState("");
  const [descriptionDropdownOpen, setDescriptionDropdownOpen] = useState(false);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [commentRichText, setCommentRichText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [updatingComment, setUpdatingComment] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [reactingToComment, setReactingToComment] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activityTab, setActivityTab] = useState("comments");
  const [assignee, setAssignee] = useState(taskData?.assignee || null);
  const [priority, setPriority] = useState(taskData?.priority || null);
  
  // Helper: format history values
  const formatHistoryValue = (field, value) => {
    try {
      if (!value) return 'None';
      // Generic formatting
      if (typeof value === 'object') {
        if (value.fullName) return value.fullName;
        if (value.name) return value.name;
        if (value.title) return value.title;
        if (value.label) return value.label;
        if (value._id) return String(value._id);
        return JSON.stringify(value);
      }
      return String(value);
    } catch (e) {
      return String(value ?? 'None');
    }
  };
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [boardAssociatedUsers, setBoardAssociatedUsers] = useState([]);
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
  const [reporter, setReporter] = useState(taskData?.reporter || null);
  const [reporterLoading, setReporterLoading] = useState(false);
  const [reporterSelectOpen, setReporterSelectOpen] = useState(false);
  // Add a loading state for the initial fetch
  const [initialLoading, setInitialLoading] = useState(true);

  // Update reporter when taskData changes - same pattern as assignee
  useEffect(() => {
    // Always use the populated object from backend fetch
    if (taskData?.reporter && typeof taskData.reporter === 'object') {
      setReporter(taskData.reporter);
    } else if (taskData?.reporter && typeof taskData.reporter === 'string') {
      const found = allEmployees.find(u => u._id === taskData.reporter);
      setReporter(found || null);
    } else {
      setReporter(null);
    }
  }, [taskData, allEmployees]);

  // Update board associated users when taskData changes
  useEffect(() => {
    if (allEmployees.length > 0) {
      if (taskData?._id) {
        // Check if we have board information in taskData
        const hasBoardInfo = taskData?.boardId || taskData?.projectId?.associatedBoard;
        
        if (hasBoardInfo) {
          // Get associated users from board/project data
          const associatedUsers = 
            taskData?.projectId?.associatedBoard?.assignedDevelopers ||
            taskData?.boardId?.assignedDevelopers ||
            taskData?.assignedDevelopers ||
            [];
          
          // Filter users based on board associations
          if (associatedUsers.length > 0) {
            const filteredUsers = allEmployees.filter(employee => 
              associatedUsers.some(dev => dev._id === employee._id || dev === employee._id)
            );
            setBoardAssociatedUsers(filteredUsers);
          } else {
            // Board exists but no assigned developers, show all employees
            setBoardAssociatedUsers(allEmployees);
          }
        } else {
          // No board information found, show all employees
          setBoardAssociatedUsers(allEmployees);
        }
      } else {
        // No taskData yet, show all employees as fallback
        setBoardAssociatedUsers(allEmployees);
      }
    }
  }, [taskData, allEmployees]);

  // Add refs for dropdowns
  const statusDropdownRef = React.useRef(null);
  const descriptionDropdownRef = React.useRef(null);
  const fileInputRef = React.useRef();

  // Add user state from Redux
  const user_state = useSelector((state) => state?.user?.loginvalue);
  const userRole = user_state?.user?.role;
  const isReadOnly = userRole === 'client' || userRole === 'focalperson';

  // Add editing states at the top of the component
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingReporter, setEditingReporter] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [editingTaskName, setEditingTaskName] = useState(false);
  const [taskNameValue, setTaskNameValue] = useState(taskData?.title || "");
  const [taskNameLoading, setTaskNameLoading] = useState(false);

  useEffect(() => {
    if (taskData?._id) {
      setInitialLoading(true);
      fetchTaskDetails().finally(() => setInitialLoading(false));
    }
  }, []);

  useEffect(() => {
    // Initial setup of task data
    if (Object.keys(taskDatas).length !== 0) {
      setTaskData(taskDatas);
    } else if (location.state?.taskData) {
      setTaskData(location.state.taskData);
      // Only fetch details on initial load if we have taskData in location state
      if (!initialLoad.current) {
        initialLoad.current = true;
        fetchTaskDetails().finally(() => setInitialLoading(false));
      }
    }
  }, [taskDatas]);


  // Fetch all employees for assignee dropdown
  useEffect(() => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then(res => {
        if (res?.data?.success) {
          console.log('Fetched employees:', res.data.User);
          setAllEmployees(res.data.User || []);
        }
      });
  }, []);


  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setOpenStatusDropdown(false);
    setDescriptionDropdownOpen(false);
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !statusDropdownRef.current?.contains(event.target) &&
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
  
  console.log("Status options:", statusOptions);
  console.log("Task data:", taskData);

  const handleUpdateStatus = (boardId, taskId, sourceId, destinationId) => {
    console.log("handleUpdateStatus called with:", { boardId, taskId, sourceId, destinationId });
    
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
            setOpenStatusDropdown(false); // Close dropdown after successful update
          }
        })
        .catch((err) => {
          message.error(
            err?.response?.data?.msg ||
              err?.response?.data?.validation?.body?.message ||
              t("Error updating status")
          );
        })
        .finally(() => {
          setIsStatusLoading(false);
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



  // Add this useEffect to initialize descriptionValue when taskData changes
  useEffect(() => {
    setDescriptionValue(taskData?.description || "");
  }, [taskData]);

  // Sync priority state with taskData
  useEffect(() => {
    setPriority(taskData?.priority || null);
  }, [taskData]);

  const handleRewriteDescription = async () => {
    try {
      setIsDescriptionLoading(true);
      const currentDescription = descriptionValue || taskData?.description;
      if (!currentDescription) {
        message.warning(t('Please enter some description first'));
        return;
      }
      
      const response = await apiServices(
        'POST',
        'api/rewrite-description',
        { text: currentDescription },
        user_state
      );
      
      if (response?.data?.success) {
        setDescriptionValue(response.data.rewrittenText);
        message.success(t('Description rewritten successfully'));
      } else {
        message.error(t('Failed to rewrite description'));
      }
    } catch (error) {
      console.error('Error rewriting description:', error);
      message.error(t('Failed to rewrite description'));
    } finally {
      setIsDescriptionLoading(false);
    }
  };

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
    // Enhanced validation for empty comments
    const trimmedComment = commentRichText?.trim();
    if (!trimmedComment || trimmedComment === '' || trimmedComment === '<p></p>' || trimmedComment === '<p><br></p>' || !taskData?._id) {
      return;
    }
    setPostingComment(true);
    try {
      // Extract mentions from the comment text
      const mentionRegex = /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g;
      const mentions = [];
      let match;
      
      while ((match = mentionRegex.exec(commentRichText)) !== null) {
        const mentionedName = match[1];
        // Find user by first two words or first name
        const mentionedUser = allEmployees.find(user => {
          const userFirstTwoWords = user.fullName?.split(' ').slice(0, 2).join(' ').toLowerCase();
          const userFirstName = user.fullName?.split(' ')[0]?.toLowerCase();
          return userFirstTwoWords === mentionedName.toLowerCase() || 
                 userFirstName === mentionedName.toLowerCase();
        });
        if (mentionedUser) {
          mentions.push(mentionedUser._id);
        }
      }

      const res = await apiServices("POST", `tasks/${taskData._id}/comments`, { 
        text: commentRichText,
        mentions: mentions
      }, user_state);
      
      if (res?.data?.success) {
        setCommentRichText("");
        fetchComments(taskData._id);
        // Refresh activity feed
        fetchHistory(taskData._id);
        
        // Show success message with mention info
        if (mentions.length > 0) {
          const mentionedNames = mentions.map(id => 
            allEmployees.find(u => u._id === id)?.fullName
          ).filter(Boolean);
          message.success(`Comment posted and ${mentionedNames.length} user${mentionedNames.length > 1 ? 's' : ''} notified`);
        } else {
          message.success("Comment posted successfully");
        }
      }
    } catch (err) {
      message.error("Failed to post comment");
    }
    setPostingComment(false);
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.text);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const updateComment = async () => {
    // Enhanced validation for empty comments
    const trimmedComment = editingCommentText?.trim();
    if (!trimmedComment || trimmedComment === '' || trimmedComment === '<p></p>' || trimmedComment === '<p><br></p>' || !taskData?._id) {
      return;
    }
    setUpdatingComment(true);
    try {
      // Extract mentions from the comment text
      const mentionRegex = /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g;
      const mentions = [];
      let match;
      
      while ((match = mentionRegex.exec(editingCommentText)) !== null) {
        const mentionedName = match[1];
        // Find user by first two words or first name
        const mentionedUser = allEmployees.find(user => {
          const userFirstTwoWords = user.fullName?.split(' ').slice(0, 2).join(' ').toLowerCase();
          const userFirstName = user.fullName?.split(' ')[0]?.toLowerCase();
          return userFirstTwoWords === mentionedName.toLowerCase() || 
                 userFirstName === mentionedName.toLowerCase();
        });
        if (mentionedUser) {
          mentions.push(mentionedUser._id);
        }
      }

      const res = await apiServices("PUT", `tasks/${taskData._id}/comments/${editingCommentId}`, { 
        text: editingCommentText,
        mentions: mentions
      }, user_state);
      
      if (res?.data?.success) {
        setEditingCommentId(null);
        setEditingCommentText("");
        fetchComments(taskData._id);
        // Refresh activity feed
        fetchHistory(taskData._id);
        
        // Show success message with mention info
        if (mentions.length > 0) {
          const mentionedNames = mentions.map(id => 
            allEmployees.find(u => u._id === id)?.fullName
          ).filter(Boolean);
          message.success(`Comment updated and ${mentionedNames.length} user${mentionedNames.length > 1 ? 's' : ''} notified`);
        } else {
          message.success("Comment updated successfully");
        }
      }
    } catch (err) {
      message.error("Failed to update comment");
    }
    setUpdatingComment(false);
  };

  const addReaction = async (commentId, emoji) => {
    setReactingToComment(true);
    try {
      const res = await apiServices("POST", `tasks/${taskData._id}/comments/${commentId}/reactions`, { 
        emoji: emoji
      }, user_state);
      
      if (res?.data?.success) {
        fetchComments(taskData._id);
        setShowReactionPicker(null);
        message.success("Reaction added!");
      }
    } catch (err) {
      message.error("Failed to add reaction");
    }
    setReactingToComment(false);
  };

  const removeReaction = async (commentId, reactionId) => {
    try {
      const res = await apiServices("DELETE", `tasks/${taskData._id}/comments/${commentId}/reactions/${reactionId}`, null, user_state);
      
      if (res?.data?.success) {
        fetchComments(taskData._id);
        message.success("Reaction removed!");
      }
    } catch (err) {
      message.error("Failed to remove reaction");
    }
  };

  const toggleReactionPicker = (commentId) => {
    setShowReactionPicker(showReactionPicker === commentId ? null : commentId);
  };

  const handleReactionClick = (commentId, emoji) => {
    // Check if user already reacted with this emoji
    const comment = comments.find(c => c._id === commentId);
    if (comment && comment.reactions) {
      const existingReaction = comment.reactions.find(
        reaction => reaction.userId === user_state?.user?._id && reaction.emoji === emoji
      );
      
      if (existingReaction) {
        // Remove reaction
        removeReaction(commentId, existingReaction._id);
      } else {
        // Add reaction
        addReaction(commentId, emoji);
      }
    } else {
      // Add reaction
      addReaction(commentId, emoji);
    }
  };

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReactionPicker) {
        const reactionPicker = event.target.closest('.reaction-picker');
        const emojiIcon = event.target.closest('img[alt="Emoji"]');
        
        if (!reactionPicker && !emojiIcon) {
          setShowReactionPicker(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showReactionPicker]);

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
    if ( taskData?._id) {
      fetchHistory(taskData._id);
    }
  }, [ taskData?._id]);

  const handleAssignToMe = async () => {
    setAssigneeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, assignee: user_state.user }, user_state);
      if (res?.data?.success) {
        setAssignee(user_state.user);
        fetchTaskDetails();
        message.success("Assigned to you");
        // Refresh activity feed
        fetchHistory(taskData._id);
      }
    } catch (err) {
      message.error("Failed to assign");
    }
    setAssigneeLoading(false);
  };
  const handleTypeChange = async (value) => {
    setTypeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, type: value }, user_state);
      if (res?.data?.success) {
        setTaskType(value);
        setTaskData(prev => ({ ...prev, type: value })); // Update local taskData state
        message.success("Task type updated");
        await fetchTaskDetails(); // Refresh all task details
      }
    } catch (err) {
      message.error("Failed to update task type");
    }
    setTypeLoading(false);
    setEditingType(false);
  };

  const handlePriorityChange = async (value) => {
    setPriorityLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, priority: value }, user_state);
      if (res?.data?.success) {
        setPriority(value);
        fetchTaskDetails();
        message.success("Priority updated");
        // Refresh activity feed
        fetchHistory(taskData._id);
      }
    } catch (err) {
      message.error("Failed to update priority");
    }
    setPriorityLoading(false);
  };
  const priorityColors = {
    Highest: '#FF0000',  // Red
    High: '#FF4D4F',     // Light Red
    Medium: '#FAAD14',   // Yellow
    Low: '#52C41A',      // Green
    Lowest: '#1890FF'    // Blue
  };

  const priorityOptions = [
    { value: 'Highest', label: (<><ArrowUpOutlined style={{color: priorityColors.Highest}} /> Highest</>) },
    { value: 'High', label: (<><ArrowUpOutlined style={{color: priorityColors.High}} /> High</>) },
    { value: 'Medium', label: (<><MinusOutlined style={{color: priorityColors.Medium}} /> Medium</>) },
    { value: 'Low', label: (<><ArrowDownOutlined style={{color: priorityColors.Low}} /> Low</>) },
    { value: 'Lowest', label: (<><ArrowDownOutlined style={{color: priorityColors.Lowest}} /> Lowest</>) },
  ];

  const handleAssignToUser = async (userId) => {
    setAssigneeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, assignee: userId }, user_state);
      if (res?.data?.success) {
        setAssignee(allEmployees.find(u => u._id === userId) || null);
        setEditingAssignee(false);
        fetchTaskDetails();
        message.success("Assignee updated");
        // Refresh activity feed
        fetchHistory(taskData._id);
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
        setEditingAssignee(false);
        fetchTaskDetails();
        message.success("Unassigned");
        // Refresh activity feed
        fetchHistory(taskData._id);
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
      // Refresh activity feed
      fetchHistory(taskData._id);
    } catch (err) {
      message.error('Failed to update due date');
    }
  };
  const handleLabelsSave = async () => {
    // Check if tags have actually changed
    const currentTags = taskData.tags || [];
    let newTags = labelsValue || [];
    
    // Filter out empty tags
    newTags = newTags.filter(tag => tag && tag.trim() !== '');
    
    // Compare arrays - check if they have same length and same elements
    const tagsChanged = currentTags.length !== newTags.length || 
                       !currentTags.every(tag => newTags.includes(tag)) ||
                       !newTags.every(tag => currentTags.includes(tag));
    
    if (!tagsChanged) {
      // No changes, just exit edit mode without API call
      setEditingLabels(false);
      return;
    }
    
    try {
      await apiServices('PUT', 'tasks', { _id: taskData._id, tags: newTags }, user_state);
      message.success('Tags updated');
      setEditingLabels(false);
      fetchTaskDetails();
    } catch (err) {
      message.error('Failed to update tags');
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
      xhr.open('POST', `${BASE_URL}/tasks/${taskData._id}/attachments`);
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

  const handleReporterChange = async (userId) => {
    setReporterLoading(true);
    try {
      const data = {
        _id: taskData._id,
        reporter: userId === 'unassigned' ? null : userId
      };
      const res = await apiServices("PUT", "tasks", data, user_state);
      if (res?.data?.success) {
        if (userId === 'unassigned') {
          setReporter(null);
        } else {
          const found = allEmployees.find(u => u._id === userId);
          setReporter(found || null);
        }
        setEditingReporter(false);
        fetchTaskDetails();
        message.success('Reporter updated successfully');
        // Refresh activity feed
        fetchHistory(taskData._id);
      } else {
        message.error('Failed to update reporter');
      }
    } catch (error) {
      console.error('Error updating reporter:', error);
      message.error('Failed to update reporter');
    } finally {
      setReporterLoading(false);
    }
  };

  const handleTaskNameSave = async () => {
    if (!taskNameValue.trim()) {
      message.error('Task name cannot be empty');
      return;
    }
    
    setTaskNameLoading(true);
    try {
      const data = {
        _id: taskData._id,
        title: taskNameValue.trim()
      };
      const res = await apiServices("PUT", "tasks", data, user_state);
      if (res?.data?.success) {
        setEditingTaskName(false);
        fetchTaskDetails();
        message.success('Task name updated successfully');
        // Refresh activity feed
        fetchHistory(taskData._id);
      } else {
        message.error('Failed to update task name');
      }
    } catch (error) {
      console.error('Error updating task name:', error);
      message.error('Failed to update task name');
    } finally {
      setTaskNameLoading(false);
    }
  };

  useEffect(() => {
    // Always use the populated object from backend fetch
    if (taskData?.assignee && typeof taskData.assignee === 'object') {
      setAssignee(taskData.assignee);
    } else if (taskData?.assignee && typeof taskData.assignee === 'string') {
      const found = allEmployees.find(u => u._id === taskData.assignee);
      setAssignee(found || null);
    } else {
      setAssignee(null);
    }
  }, [taskData, allEmployees]);

  const handleDownload = async (file) => {
    try {
      const response = await fetch(file.imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.fileName; // ✅ keeps same filename & extension
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // In the return, show a spinner if initialLoading is true
  if (initialLoading) return <Spin size="large" style={{margin: '100px auto', display: 'block'}} />;

  return (
    <div>
      <div className="content container-fluid bg-[#F7F7F7]">
        <div className="row">
          <div className="col-xl-9">
            {/* Task Name Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 16, 
                color: '#333', 
                marginBottom: 8 
              }}>
                Task Name
                </div>
              <div style={{
                background: '#fff',
                border: '1px solid #e1e5e9',
                borderRadius: 8,
                padding: '12px 16px',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {editingTaskName ? (
                  <Input
                    value={taskNameValue}
                    onChange={(e) => setTaskNameValue(e.target.value)}
                    autoFocus
                    style={{ border: 'none', boxShadow: 'none', padding: 0 }}
                    disabled={taskNameLoading}
                  />
                ) : (
                    <div
                      style={{
                      cursor: 'pointer', 
                      width: '100%',
                      color: taskData?.title ? '#333' : '#999',
                      fontStyle: taskData?.title ? 'normal' : 'italic',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word'
                    }}
                    onClick={() => {
                      if (isReadOnly) return;
                      setTaskNameValue(taskData?.title || "");
                      setEditingTaskName(true);
                    }}
                  >
                    {taskData?.title || "Enter task name..."}
                      </div>
                    )}
                  </div>
              
              {/* Action Buttons - Outside the card */}
              {editingTaskName && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '10px',
                  marginTop: '16px'
                }}>
                  <Button
                          size="small"
                          style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#666',
                      padding: '4px 12px',
                      fontSize: '14px'
                    }}
                    onClick={() => {
                      setEditingTaskName(false);
                      setTaskNameValue(taskData?.title || "");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                          size="small"
                                style={{
                      background: '#FF9B44',
                      border: 'none',
                      color: 'white',
                      padding: '4px 12px',
                      fontSize: '14px'
                    }}
                    onClick={handleTaskNameSave}
                    loading={taskNameLoading}
                  >
                    Save
                  </Button>
                                </div>
                      )}
                        </div>

            {/* Description Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 16, 
                color: '#333', 
                marginBottom: 8 
              }}>
                    Description
            </div>
              <div style={{
                background: isEditing ? '#fff' : 'transparent',
                border: isEditing ? '1px solid #e1e5e9' : 'none',
                borderRadius: isEditing ? 8 : 0,
                padding: isEditing ? '16px' : '0',
                minHeight: isEditing ? 120 : 'auto',
                boxShadow: isEditing ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>
                  {isEditing ? (
                      <RichTextEditor
                        content={descriptionValue}
                        onChange={setDescriptionValue}
                        users={boardAssociatedUsers}
                      />
                ) : (
                      <div
                        style={{
                      color: taskData?.description ? '#333' : '#999',
                      lineHeight: '1.6',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      cursor: 'pointer',
                      minHeight: '80px',
                      fontStyle: taskData?.description ? 'normal' : 'italic'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: taskData?.description || "Enter task description..." 
                    }}
                    onClick={() => {
                      if (isReadOnly) return;
                      setDescriptionValue(taskData?.description || "");
                      setIsEditing(true);
                    }}
                  />
                )}
                                </div>
              
              {/* Action Buttons - Outside the card */}
              {isEditing && !isReadOnly && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '10px',
                  marginTop: '16px'
                }}>
                  <Button
                    size="small"
                            style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#666',
                      padding: '4px 12px',
                      fontSize: '14px'
                    }}
                          onClick={() => {
                            setIsEditing(false);
                            setDescriptionValue(taskData?.description || "");
                          }}
                        >
                          Cancel
                  </Button>
                  <Button
                    size="small"
                                    style={{
                      background: '#FF9B44',
                      border: 'none',
                      color: 'white',
                      padding: '4px 12px',
                      fontSize: '14px'
                    }}
                          onClick={handleSaveDescription}
                        >
                          Save
                  </Button>
                  <Button
                    size="small"
                                  style={{
                      background: 'transparent',
                      border: '1px solid #ddd',
                      color: '#666',
                      padding: '4px 12px',
                      fontSize: '14px'
                    }}
                          onClick={handleRewriteDescription}
                          disabled={isDescriptionLoading}
                        >
                          {isDescriptionLoading ? 'Rewriting...' : 'Rewrite with AI'}
                  </Button>
                      </div>
                  )}
                </div>

                          {/* Attachments Section */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
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
                      { !isReadOnly && (
                      <Button
                    icon={<PlusOutlined />}
                        loading={uploading}
                        size="small"
                    style={{ 
                      marginLeft: 'auto',
                      background: 'transparent',
                      border: '1px solid #ffb74d',
                      color: '#ffb74d',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                        onClick={handleUploadButtonClick}
                        type="button"
                      >
                        Upload
                      </Button>
                      )}
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
                            const isImage = file.imageUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.fileName || '');
                            const isVideo = file.imageUrl && /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(file.fileName || '');
                            const isDocument = file.imageUrl && /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i.test(file.fileName || '');
                            
                            const menu = (
                              <Menu>
                                <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleDeleteAttachment(file._id)}>
                                  Delete
                                </Menu.Item>
                              </Menu>
                            );
                            
                        const fileDate = file.createdAt ? new Date(file.createdAt) : new Date();
                            const formattedDate = fileDate.toLocaleDateString('en-US', { 
                              month: '2-digit', 
                              day: '2-digit', 
                              year: 'numeric' 
                            });
                            const formattedTime = fileDate.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              hour12: true 
                            });
                            
                            return (
                              <div
                                key={file._id}
                            style={{ 
                              width: 200, 
                                  borderRadius: 12,
                                  border: '1px solid #e1e5e9',
                                  backgroundColor: '#fff',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  overflow: 'hidden',
                              position: 'relative',
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                }}
                              >
                                {/* Image Preview */}
                                <div style={{ position: 'relative', height: 140 }}>
                                  {isImage ? (
                                    <img 
                                      alt={file.fileName} 
                                      src={file.imageUrl} 
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                        borderRadius: '12px 12px 0 0'
                                      }} 
                                    />
                                  ) : isVideo ? (
                                    <div style={{ 
                                      height: '100%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      borderRadius: '12px 12px 0 0',
                                      color: 'white',
                                      fontSize: 24
                                    }}>
                                      <PlayCircleOutlined />
                                    </div>
                                  ) : isDocument ? (
                                    <div style={{ 
                                      height: '100%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                      borderRadius: '12px 12px 0 0',
                                      color: 'white',
                                      fontSize: 24
                                    }}>
                                      <FileTextOutlined />
                                    </div>
                                  ) : (
                                    <div style={{ 
                                      height: '100%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                      borderRadius: '12px 12px 0 0',
                                      color: 'white',
                                      fontSize: 24
                                    }}>
                                      <FileOutlined />
                                    </div>
                                  )}
                                  
                                  {/* Action Icons */}
                                  <div style={{ 
                                    position: 'absolute', 
                                    top: 8, 
                                    right: 8, 
                                    display: 'flex', 
                                    gap: 4, 
                                    zIndex: 2 
                                  }}>
                                      <Tooltip title="Download">
      <div
        onClick={() => handleDownload(file)}
        style={{
          background: "#fff",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          cursor: "pointer",
          textDecoration: "none",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        }}
      >
        <DownloadOutlined style={{ fontSize: 16, color: "#1890ff" }} />
      </div>
    </Tooltip>
                                      {!isReadOnly && (
                                      <Dropdown overlay={menu} trigger={['click']}>
                                      <div
                                          style={{
                                            background: '#fff',
                                          borderRadius: '50%',
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          transition: 'all 0.2s',
                                            cursor: 'pointer',
                                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                      >
                                        <EllipsisOutlined style={{ fontSize: 16, color: '#666' }} />
                                      </div>
                                      </Dropdown>
                                      )}
                                    </div>
                                  </div>
                                
                                {/* File Info */}
                            <div style={{ padding: '12px' }}>
                                  <div style={{ 
                                    fontWeight: 500, 
                                    fontSize: 14, 
                                    color: '#333',
                                    wordBreak: 'break-all', 
                                    marginBottom: 8,
                                    lineHeight: '1.3',
                                    minHeight: '40px',
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                  }}>
                                {file.fileName}
                              </div>
                                                                      <div style={{ 
                                      display: 'flex',
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      gap: '8px',
                                      alignItems: 'center'
                                    }}>
                                      <div style={{ 
                                        fontSize: 13, 
                                        color: '#666',
                                        fontWeight: 500,
                                        lineHeight: '1.2'
                                      }}>
                                        {formattedDate}
                              </div>
                                      <div style={{ 
                                        fontSize: 13, 
                                        color: '#666',
                                        fontWeight: 500,
                                        lineHeight: '1.2'
                                      }}>
                                        {formattedTime}
                                </div>
                                    </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

             
              <div className="contact-tab-view">
                <div className="tab-content pt-0">
              
                <div className={`tab-pane fade active show`}>
                  <div style={{marginTop: 24}}>
                    <div className="bg-white" style={{ borderBottom: '1px solid #eee', marginBottom: 16, display: 'flex', gap: 24,paddingLeft:'20px' }}>
                      <div
                        style={{
                          padding: '8px 0',
                          cursor: 'pointer',
                           borderBottom: activityTab === 'comments' ? '2px solid #FF9B44' : 'none',
                           fontWeight: activityTab === 'comments' ? 600 : 400,
                           color: activityTab === 'comments' ? '#333' : '#666'
                        }}
                        onClick={() => setActivityTab('comments')}
                      >
                        Comments
              </div>
                      <div
                        style={{
                          padding: '8px 0',
                          cursor: 'pointer',
                         borderBottom: activityTab === 'history' ? '2px solid #FF9B44' : 'none',
                         fontWeight: activityTab === 'history' ? 600 : 400,
                         color: activityTab === 'history' ? '#333' : '#666'
                        }}
                        onClick={() => setActivityTab('history')}
                      >
                        History
            </div>
          </div>
                    {activityTab === 'comments' && (
                      <div className="comments-section">
                        <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8,paddingLeft:'20px',borderBottom:  '2px solid #f0f0f0' }}>
                          {commentsLoading ? (
                            <Spin />
                          ) : comments.length === 0 ? (
                            <Empty description="No comments yet" />
                          ) : (
                            comments.map((c, idx) => {
                              const commentDate = new Date(c.createdAt);
                              const timeString = commentDate.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                hour12: true 
                              });
                              const daysAgo = Math.floor((new Date() - commentDate) / (1000 * 60 * 60 * 24));
                              const timeAgo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 Day ago' : `${daysAgo} Days ago`;
                              
                              return (
                                <div key={idx} style={{
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  marginBottom: 20,
                                  paddingBottom: 20,
                                  borderBottom: idx < comments.length - 1 ? '2px solid #f0f0f0' : 'none'
                                }}>
                                  {/* Avatar */}
                                <div style={{
                                     width: 40, 
                                     height: 40, 
                                     borderRadius: '50%',
                                     background: '#FF9B44', 
                                     display: 'flex', 
                                     alignItems: 'center', 
                                     justifyContent: 'center',
                                     fontWeight: 600, 
                                     marginRight: 12,
                                     color: 'white',
                                     fontSize: 14
                                }}>
                                  {c.userName ? c.userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </div>
                                  
                                  {/* Comment Content */}
                                  <div style={{ flex: 1 }}>
                                    {/* User Info */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      marginBottom: 4
                                    }}>
                                      <span style={{
                                        fontWeight: 600,
                                        color: '#333',
                                        fontSize: 14
                                      }}>
                                        {c.userName || 'User'}
                                      </span>
                                      <span style={{
                                        color: '#888',
                                        fontSize: 12,
                                        marginLeft: 8
                                      }}>
                                        {timeString}
                                      </span>
                                </div>
                                    
                                    {/* Time Ago */}
                                    <div style={{
                                      color: '#888',
                                      fontSize: 12,
                                      marginBottom: 8
                                    }}>
                                      {timeAgo}
                              </div>
                                    
                                    {/* Comment Text */}
                                    {editingCommentId === c._id ? (
                                      <div style={{ marginBottom: 12 }}>
                                        <div style={{
                                          border: '1px solid #e1e5e9',
                                          borderRadius: 8,
                                          overflow: 'hidden',
                                          padding: "10px",
                                          background: "white"
                                        }}>
                                          <RichTextEditor
                                            content={editingCommentText}
                                            onChange={setEditingCommentText}
                                            users={boardAssociatedUsers}
                                          />
                                          <div style={{
                                            fontSize: '12px',
                                            color: '#666',
                                            marginTop: '8px',
                                            fontStyle: 'italic'
                                          }}>
                                            💡 Tip: Type @ to mention users
                                          </div>
                                        </div>
                                        
                                        {/* Edit Action Buttons */}
                                        <div style={{
                                          display: 'flex',
                                          justifyContent: 'flex-end',
                                          marginTop: 12,
                                          gap: 8
                                        }}>
                                          <Button 
                                            size="small"
                                            onClick={cancelEditComment}
                                            style={{
                                              background: 'transparent',
                                              border: '1px solid #d9d9d9',
                                              borderRadius: 6,
                                              color: '#666'
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button 
                                            size="small"
                                            onClick={updateComment}
                                            loading={updatingComment}
                                            style={{
                                              background: '#FF9B44',
                                              border: '1px solid #FF9B44',
                                              borderRadius: 6,
                                              color: 'white'
                                            }}
                                          >
                                            Update
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{
                                        color: '#333',
                                        fontSize: 14,
                                        lineHeight: '1.5',
                                        marginBottom: 12
                                      }}
                                      dangerouslySetInnerHTML={{ 
                                        __html: c.text.replace(
                                          /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g, 
                                          '<span style="background-color: #e6f7ff; color: #1890ff; padding: 2px 4px; border-radius: 4px; font-weight: 500;">@$1</span>'
                                        )
                                      }}
                                      />
                                    )}
                                    
                                    {/* Reactions Display */}
                                    {c.reactions && c.reactions.length > 0 && (
                                      <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 4,
                                        marginBottom: 8
                                      }}>
                                        {(() => {
                                          // Group reactions by emoji
                                          const groupedReactions = {};
                                          c.reactions.forEach(reaction => {
                                            if (!groupedReactions[reaction.emoji]) {
                                              groupedReactions[reaction.emoji] = [];
                                            }
                                            groupedReactions[reaction.emoji].push(reaction);
                                          });

                                          return Object.entries(groupedReactions).map(([emoji, reactions]) => (
                                            <div
                                              key={emoji}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '2px 6px',
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                cursor: 'pointer',
                                                border: '1px solid #e0e0e0'
                                              }}
                                              onClick={() => handleReactionClick(c._id, emoji)}
                                              title={`${reactions.map(r => r.userName).join(', ')}`}
                                            >
                                              <span style={{ fontSize: 14 }}>{emoji}</span>
                                              <span style={{ color: '#666' }}>{reactions.length}</span>
                                            </div>
                                          ));
                                        })()}
                                      </div>
                                    )}
                                    
                                    {/* Action Icons */}
                                    {editingCommentId !== c._id && (
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16
                                      }}>
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 12
                                        }}>
                                          {/* Reaction Button */}
                                          <div style={{ position: 'relative' }}>
                                            <img 
                                              src={EmojiIcon} 
                                              alt="Emoji" 
                                              style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                cursor: isReadOnly ? 'default' : 'pointer',
                                                opacity: isReadOnly ? 0.4 : 0.7
                                              }}
                                              onClick={(e) => {
                                                if (isReadOnly) return;
                                                e.stopPropagation();
                                                toggleReactionPicker(c._id);
                                              }}
                                            />
                                            
                                            {/* Emoji Picker */}
                                            {showReactionPicker === c._id && !isReadOnly && (
                                              <div 
                                                className="reaction-picker"
                                                style={{
                                                  position: 'absolute',
                                                  top: '100%',
                                                  left: 0,
                                                  zIndex: 9999,
                                                  marginTop: 8,
                                                  backgroundColor: 'white',
                                                  border: '1px solid #e0e0e0',
                                                  borderRadius: 8,
                                                  padding: 8,
                                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                  display: 'grid',
                                                  gridTemplateColumns: 'repeat(6, 1fr)',
                                                  gap: 4,
                                                  minWidth: 200,
                                                  maxWidth: 200
                                                }}
                                              >
                                                {['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🙏', '🎉', '🔥', '💯', '✨'].map((emoji) => (
                                                  <button
                                                    key={emoji}
                                                    onClick={() => handleReactionClick(c._id, emoji)}
                                                    disabled={reactingToComment}
                                                    style={{
                                                      border: 'none',
                                                      background: 'none',
                                                      fontSize: 16,
                                                      padding: 6,
                                                      cursor: 'pointer',
                                                      borderRadius: 4,
                                                      transition: 'background-color 0.2s',
                                                      width: '28px',
                                                      height: '28px',
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                  >
                                                    {emoji}
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                          
                                          {c.userId === user_state?.user?._id && !isReadOnly && (
                                            <img 
                                              src={EditIcon} 
                                              alt="Edit" 
                                              style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                cursor: 'pointer',
                                                opacity: 0.7
                                              }}
                                              onClick={() => startEditComment(c)}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        
                        {/* Comment Input Section */}
                        {!isReadOnly && (
                        <div style={{
                          marginTop: 24,
                    
                          borderRadius: 12,
                         
                        
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            {/* User Avatar */}
                                                         <div style={{
                               width: 40, 
                               height: 40, 
                               borderRadius: '50%',
                               background: '#FF9B44', 
                               display: 'flex', 
                               alignItems: 'center', 
                               justifyContent: 'center',
                               fontWeight: 600,
                               color: 'white',
                               fontSize: 14,
                               flexShrink: 0
                             }}>
                              {user_state?.user?.fullName ? user_state.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                            </div>
                            
                                                              {/* Input Area */}
                                  <div style={{ flex: 1 }}>
                                    <div style={{
                                      border: '1px solid #e1e5e9',
                                      borderRadius: 8,
                                      overflow: 'hidden',
                                      padding:"10px",
                                      background:"white"
                                    }}>
                                      <RichTextEditor
                                        content={commentRichText}
                                        onChange={setCommentRichText}
                                        users={boardAssociatedUsers}
                                      />
                                      {/* Debug info */}
                                      {console.log('Mention users (boardAssociatedUsers):', boardAssociatedUsers.map(u => u.fullName))}
                                      {console.log('All employees:', allEmployees.map(u => u.fullName))}
                                      <div style={{
                                        fontSize: '12px',
                                        color: '#666',
                                        marginTop: '8px',
                                        fontStyle: 'italic'
                                      }}>
                                        💡 Tip: Type @ to mention users
                                      </div>
                                    </div>
                                    
                                    {/* Comment Button */}
                                    <div style={{
                                      display: 'flex',
                                      justifyContent: 'flex-end',
                                      marginTop: 12,
                                      paddingTop: 12,
                                     
                                    }}>
                                      <Button 
                                        onClick={postComment} 
                                        loading={postingComment}
                                        style={{
                                          background: 'transparent',
                                          border: '1px solid #FF9B44',
                                          borderRadius: 8,
                                          fontWeight: 500,
                                          color: '#FF9B44 !important'
                                        }}
                                      >
                                        Comment
                                      </Button>
                                    </div>
                                  </div>
                          </div>
                        </div>
                        )}
                      </div>
                    )}
                    {activityTab === 'history' && (
                      <div>
                        <h5>Activity</h5>
                        <div style={{ maxHeight: 250, overflowY: 'auto', paddingRight: 8, paddingLeft:'20px', marginBottom:'20px' }}>
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
                                              <span style={{color: '#888', margin: '0 4px'}}>{formatHistoryValue(h.field, h.from)}</span>
                                              <span style={{margin: '0 4px'}}>→</span>
                                              <span style={{color: '#888', margin: '0 4px'}}>{formatHistoryValue(h.field, h.to)}</span>
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
          <div className="col-xl-3">
            <div className="stickybar">
              <div className="card" style={{ 
                borderRadius: 16, 
                boxShadow: '0 2px 8px #f0f1f2',
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
                <div className="card-body" style={{
                  padding: '16px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Task Status</span>
                    {!isReadOnly ? (
                    <Dropdown
                      menu={{
                        items: statusOptions.map(option => ({
                          key: option.value,
                          label: (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <i className={`fa fa-dot-circle-o text-${option.color}`} />
                              <span>{option.label}</span>
                            </span>
                          ),
                          disabled: taskData?.lane === option.value,
                          onClick: () => {
                            console.log("Menu.Item clicked:", option);
                            console.log("Task data:", {
                              boardId: taskData?.boardId?._id || taskData?.projectId?._id,
                              taskId: taskData?._id,
                              sourceId: taskData?.columnId,
                              destinationId: option.columnId
                            });
                            handleUpdateStatus(
                              taskData?.boardId?._id || taskData?.projectId?._id,
                              taskData?._id,
                              taskData?.columnId,
                              option.columnId
                            );
                          }
                        }))
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                      overlayStyle={{ zIndex: 9999 }}
                      getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    >
                      <Button
                        size="small"
                        icon={<i className={`fa fa-dot-circle-o text-${taskData?.columnColor}`} />}
                        style={{ borderRadius: 20, background: '#f6f6fa', border: 'none', display: 'flex', gap:"5px",alignItems:"center" }}
                        onClick={() => {
                          console.log("Dropdown button clicked in modal context");
                          console.log("Status options:", statusOptions);
                          console.log("Task data:", taskData);
                        }}
                      >
                        {taskData?.lane || "Backlog"}
                      </Button>
                    </Dropdown>
                    ) : (
                      <Button
                        size="small"
                        icon={<i className={`fa fa-dot-circle-o text-${taskData?.columnColor}`} />}
                        style={{ borderRadius: 20, background: '#f6f6fa', border: 'none', display: 'flex', gap:"5px",alignItems:"center", opacity: 0.6, cursor: 'not-allowed' }}
                        disabled
                      >
                        {taskData?.lane || "Backlog"}
                      </Button>
                    )}
        </div>
                  <div style={{ borderTop: '1px solid #eee', margin: '16px 0' }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>Details</div>
                    {/* Assignee */}
                    <div style={{ 
                      marginBottom: 16, 
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr',
                      gap: 8,
                     
                    }}>
                      <div style={{ 
                        color: '#888', 
                        fontSize: 13,
                        marginTop:"8px",
                        fontWeight: 500
                      }}>Assignee</div>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        minWidth: 0
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32 }}>
                          {editingAssignee ? (
                    <Select
                      showSearch
                              style={{ width: 180 }}
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
                              open={editingAssignee}
                              onBlur={() => setEditingAssignee(false)}
                              autoFocus
                    >
                      <Select.Option key="unassigned" value="unassigned">
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <UserOutlined style={{ fontSize: 18 }} />
                                  <span>Not Assigned</span>
                        </span>
                      </Select.Option>
                      {boardAssociatedUsers.map(user => (
                        <Select.Option key={user._id} value={user._id}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Avatar size={24} src={user.imageUrl} style={{ background: '#2d3e50', fontWeight: 600 }}>
                              {getInitials(user.fullName)}
                            </Avatar>
                            <span>{user.fullName}</span>
                          </span>
                        </Select.Option>
                      ))}
                    </Select>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32, cursor: isReadOnly ? 'default' : 'pointer' }} onClick={() => { if (!isReadOnly) setEditingAssignee(true); }}>
                              <span style={{ 
                                fontWeight: 500, 
                                color: assignee ? '#222' : '#bbb',
                                wordBreak: 'break-word',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                              }}>
                                {assignee ? (
                                  <>
                                    <Avatar size={24} src={assignee.imageUrl} style={{ background: '#2d3e50', fontWeight: 600 }}>
                                      {assignee.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </Avatar>
                                    {assignee.fullName}
                                  </>
                                ) : (
                                  <>
                                    <UserOutlined style={{ fontSize: 18, color: '#888' }} />
                                    None
                                  </>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        {(!assignee || assignee?._id !== user_state?.user?._id) && !editingAssignee && !isReadOnly && (
                          <div style={{ marginTop: 2 }}>
                            <a style={{ color: '#ff9800', fontSize: 12, cursor: 'pointer' }} onClick={handleAssignToMe} disabled={assigneeLoading}>
                          Assign to me
                        </a>
                      </div>
                    )}
                      </div>
                  </div>
                  {/* Task Type */}
                  <div style={{ 
                    marginBottom: 16, 
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr',
                    gap: 16,
                    alignItems: 'start'
                  }}>
                    <div style={{ 
                      color: '#888', 
                      fontSize: 13,
                      fontWeight: 500
                    }}>Type</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {editingType ? (
                        <Select
                          style={{ width: 180 }}
                          value={taskType}
                          onChange={handleTypeChange}
                          loading={typeLoading}
                          onBlur={() => setEditingType(false)}
                          autoFocus
                        >
                          {taskTypes.map(type => (
                            <Select.Option key={type.value} value={type.value}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {type.icon}
                                {type.label}
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32, cursor: isReadOnly ? 'default' : 'pointer' }}
                          onClick={() => { if (!isReadOnly) setEditingType(true); }}
                        >
                          {taskTypes.find(t => t.value === taskType)?.icon || taskTypes[0].icon}
                          <span>{taskType || 'Task'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Priority */}
                    <div style={{ 
                      marginBottom: 16, 
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr',
                      gap: 8,
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        color: '#888', 
                        fontSize: 13,
                        fontWeight: 500
                      }}>Priority</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {editingPriority ? (
                    <Select
                            style={{ width: 180 }}
                      placeholder="Select Priority"
                      value={priority}
                            onChange={val => {
                              setEditingPriority(false);
                              handlePriorityChange(val);
                            }}
                      loading={priorityLoading}
                      optionLabelProp="label"
                            open={editingPriority}
                            onBlur={() => setEditingPriority(false)}
                            autoFocus
                    >
                      {priorityOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32, cursor: isReadOnly ? 'default' : 'pointer', fontWeight: 500 }} onClick={() => { if (!isReadOnly) setEditingPriority(true); }}>
                            {priority && (
                              <>
                                {priority === 'Highest' || priority === 'High' ? (
                                  <ArrowUpOutlined style={{ color: priorityColors[priority] }} />
                                ) : priority === 'Medium' ? (
                                  <MinusOutlined style={{ color: priorityColors[priority] }} />
                                ) : (
                                  <ArrowDownOutlined style={{ color: priorityColors[priority] }} />
                                )}
                                <span style={{ color: priorityColors[priority] }}>{priority}</span>
                              </>
                            )}
                            {!priority && <span style={{ color: '#bbb' }}>None</span>}
                          </div>
                        )}
                      </div>
                  </div>
                  {/* Project */}
                  <div style={{ 
                    marginBottom: 16, 
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr',
                    gap: 16,
                    alignItems: 'start'
                  }}>
                    <div style={{ 
                      color: '#888', 
                      fontSize: 13,
                      fontWeight: 500
                    }}>Project</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ 
                        fontWeight: 500, 
                        color: '#222',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {taskData?.projectId?.projectName || taskData?.boardId?.boardTitle || '--'}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                    <div style={{ 
                      marginBottom: 16, 
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr',
                      gap: 8,
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        color: '#888', 
                        fontSize: 13,
                        fontWeight: 500
                      }}>Due Date</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {editingDueDate ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <DatePicker
                            value={dueDateValue}
                            onChange={setDueDateValue}
                            allowClear
                              style={{ minWidth: 120 }}
                          />
                            <CheckOutlined style={{ color: '#52c41a', cursor: 'pointer' }} onClick={handleDueDateSave} />
                            <CloseOutlined style={{ color: '#f5222d', cursor: 'pointer' }} onClick={() => { setEditingDueDate(false); setDueDateValue(taskData.dueDate ? moment(taskData.dueDate) : null); }} />
                        </span>
                      ) : (
                          <span style={{ cursor: isReadOnly ? 'default' : 'pointer', color: taskData.dueDate ? '#222' : '#bbb' }} onClick={() => { if (!isReadOnly) setEditingDueDate(true); }}>
                            {taskData.dueDate ? moment(taskData.dueDate).format('DD/MM/YYYY') : 'None'}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Reporter */}
                    <div style={{ 
                      marginBottom: 16, 
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr',
                      gap: 8,
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        color: '#888', 
                        fontSize: 13,
                        fontWeight: 500
                      }}>Reported By</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {editingReporter ? (
                    <Select
                      showSearch
                            style={{ width: 180 }}
                      placeholder="Reporter"
                      value={reporter?._id || 'unassigned'}
                            onChange={val => {
                              handleReporterChange(val);
                            }}
                      loading={reporterLoading}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children[1]?.props?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      dropdownMatchSelectWidth={false}
                            open={editingReporter}
                            onBlur={() => setEditingReporter(false)}
                            autoFocus
                    >
                      <Select.Option key="unassigned" value="unassigned">
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <UserOutlined style={{ fontSize: 18 }} />
                          <span>Unassigned</span>
                        </span>
                      </Select.Option>
                      {boardAssociatedUsers.map(user => (
                        <Select.Option key={user._id} value={user._id}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Avatar size={24} src={user.imageUrl} style={{ background: '#2d3e50', fontWeight: 600 }}>
                              {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <span>{user.fullName}</span>
                          </span>
                        </Select.Option>
                      ))}
                    </Select>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32, cursor: isReadOnly ? 'default' : 'pointer' }} onClick={() => { if (!isReadOnly) setEditingReporter(true); }}>
                            {reporter ? (
                              <Avatar size={24} src={reporter.imageUrl} style={{ background: '#ffe082', color: '#333', fontWeight: 600 }}>
                                {reporter.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </Avatar>
                            ) : (
                              <Avatar size={24} style={{ background: '#ffe082', color: '#333', fontWeight: 600 }}>
                                SF
                              </Avatar>
                            )}
                            <span style={{ 
                              fontWeight: 500, 
                              color: reporter ? '#222' : '#bbb',
                              wordBreak: 'break-word',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>{reporter ? reporter.fullName : 'None'}</span>
                  </div>
                        )}
                </div>
                    </div>
                    {/* Tags */}
                    <div style={{ 
                      marginBottom: 16, 
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr',
                      gap: 8,
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        color: '#888', 
                        fontSize: 13,
                        fontWeight: 500
                      }}>Tags</div>
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 8, 
                        flexWrap: 'wrap',
                        minWidth: 0,
                        maxWidth: '100%'
                      }}>
                        {editingTags ? (
                          <Select
                            mode="tags"
                            style={{ minWidth: 120, width: 220 }}
                            value={labelsValue}
                            onChange={vals => setLabelsValue(vals)}
                            open={true}
                            tokenSeparators={[',']}
                            placeholder="Add labels"
                            onBlur={() => {
                              // Save tags and exit edit mode
                              handleLabelsSave();
                              setEditingTags(false);
                            }}
                            autoFocus
                            dropdownStyle={{ minWidth: 180 }}
                            tagRender={(props) => {
                              // Only render tags in dropdown, not in the input field
                              return props.closable ? null : (
                                <Tag closable={props.closable} onClose={props.onClose}>
                                  {props.label}
                                </Tag>
                              );
                            }}
                            maxTagCount={0}
                          />
                        ) : (
                          <div style={{ 
                            marginTop: 0, 
                            display: 'flex', 
                            gap: 8, 
                            flexWrap: 'wrap', 
                            minHeight: 32, 
                            cursor: isReadOnly ? 'default' : 'pointer',
                            maxWidth: '100%',
                            width: '100%'
                          }} onClick={() => { if (!isReadOnly) { setLabelsValue(taskData.tags || []); setEditingTags(true); } }}>
                            {taskData.tags && taskData.tags.length > 0 ? (
                              taskData.tags.map((label, idx) => (
                                <span
                                  key={idx}
                            style={{
                                    display: 'inline-block',
                                    padding: '2px 12px',
                                    borderRadius: 8,
                                    border: `1.5px solid ${idx === 0 ? '#6fdc8c' : '#3da5ff'}`,
                                    background: idx === 0 ? 'rgba(111,220,140,0.08)' : 'rgba(61,165,255,0.08)',
                                    color: idx === 0 ? '#3ca86b' : '#2196f3',
                                    fontWeight: 500,
                                    fontSize: 15,
                                    lineHeight: '22px',
                                    marginRight: 4,
                                    marginBottom: 2,
                                    textAlign: 'center',
                                    boxSizing: 'border-box',
                                    maxWidth: '120px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 1
                                  }}
                                >
                                  {label}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: '#bbb' }}>None</span>
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
        </div>
      </div>
    </div>
  );
};

export default TaskContent;
