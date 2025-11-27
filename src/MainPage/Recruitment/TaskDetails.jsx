import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  message,
  Tag,
  Button,
  Descriptions,
  Timeline,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Rate,
  DatePicker,
  Radio,
  Upload,
  Select,
  Tooltip,
  Dropdown,
  Menu,
  Avatar,
} from "antd";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import backBtn from "../../assets/iconsRecruitment/arrow-left.svg";
import RightArrow from "../../assets/iconsRecruitment/RightArrow.svg";
import description from "../../assets/iconsRecruitment/description.svg";
import colored from "../../assets/iconsRecruitment/Colored.svg";
import starIcon from "../../assets/iconsRecruitment/star.svg";
import media from "../../assets/iconsRecruitment/Media.svg";
import gallery from "../../assets/iconsRecruitment/Gallery.svg";
import copyLink from "../../assets/iconsRecruitment/CopyLink.svg";
import emoji from "../../assets/iconsRecruitment/Emoji.svg";
import { Helmet } from "react-helmet";
import list from "../../assets/iconsRecruitment/vertical.svg";
import previewIcon from "../../assets/iconsRecruitment/previewIcon.svg";
import downloadIcon from "../../assets/iconsRecruitment/downloadIcon.svg";
import { user_icon } from "../../Entryfile/imagepath";
import DOMPurify from "dompurify";
import RichTextEditor from "../../Components/RichTextEditor";
import InterviewFeedbackDisplay from "./InterviewFeedbackDisplay";
import { apiUploadToS3 } from "../../Services/uploadImage";

const { TextArea } = Input;

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const authState = useSelector((state) => state.user.loginvalue);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [commentRichText, setCommentRichText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsByTask, setCommentsByTask] = useState({}); // taskId -> comments array
  const [loadingCommentsFor, setLoadingCommentsFor] = useState(null); // taskId
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((chunk, idx) => {
      if (/^https?:\/\//.test(chunk)) {
        return (
          <a key={`l-${idx}`} href={chunk} target="_blank" rel="noreferrer">
            {chunk}
          </a>
        );
      }
      const parts = chunk.split("\n");
      return parts.map((line, i) => (
        <React.Fragment key={`t-${idx}-${i}`}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ));
    });
  };

  const buildCommentHTML = (text) => {
    if (!text) return "";
    let html = String(text);
    // Highlight @mentions
    html = html.replace(
      /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g,
      '<span style="background-color: #e6f7ff; color: #1890ff; padding: 2px 4px; border-radius: 4px; font-weight: 500;">@$1</span>'
    );
    // Linkify plain URLs
    html = html.replace(
      /(https?:\/\/[^\s<]+[^\s<\.)])/g,
      '<a href="$1" target="_blank" rel="noreferrer">$1</a>'
    );
    // Preserve newlines if present
    html = html.replace(/\n/g, "<br/>");
    // Sanitize
    const safe = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "a",
        "span",
        "br",
        "p",
        "strong",
        "em",
        "ul",
        "ol",
        "li",
        "b",
        "i",
        "u",
        "div"
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "style"]
    });
    return safe;
  };

  const extractMentionIdsFromText = (text) => {
    if (!text || !Array.isArray(task?.taskReviewers)) return [];
    const foundNames = [];
    const mentionRegex = /@([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/g;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      foundNames.push(match[1].toLowerCase());
    }
    if (foundNames.length === 0) return [];
    const reviewerList = task.taskReviewers || [];
    const ids = reviewerList
      .filter((rev) => {
        const full = (rev.fullName || '').toLowerCase();
        const parts = full.split(' ').filter(Boolean);
        const first = parts[0] || '';
        const firstTwo = parts.slice(0, 2).join(' ');
        return (
          foundNames.includes(full) ||
          foundNames.includes(firstTwo) ||
          foundNames.includes(first)
        );
      })
      .map((rev) => rev._id)
      .filter(Boolean);
    // de-duplicate
    return Array.from(new Set(ids));
  };
  const [attachments, setAttachments] = useState([]); // {url, fileName, type}
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const mediaInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];
  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  useEffect(() => {
    // Load comments for this task on mount/id change
    fetchTaskComments(id);
  }, [id]);

  const fetchTaskDetails = async () => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      console.log("Fetching task details for ID:", id);
      const response = await apiServices("GET", `task/${id}`, null, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Task details API response:", response);

      if (response?.data?.success) {
        console.log("Task details data:", response.data.data);
        console.log("Current user:", authState?.user);
        console.log("Task reviewers:", response.data.data.taskReviewers);
        setTask(response.data.data);
        // If backend provides comments with task, seed local state
        if (Array.isArray(response?.data?.data?.comments)) {
          setComments(response.data.data.comments);
        }
      } else {
        console.error("Failed to fetch task details:", response?.data);
        message.error(
          response?.data?.message || "Failed to fetch task details"
        );
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      console.error("Error response:", error.response);
      if (error.response?.status === 401) {
        message.error("Unauthorized access. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 404) {
        message.error("Task not found");
        navigate("/recruitment/tasks");
      } else if (error.response?.status === 400) {
        message.error("Invalid task ID");
        navigate("/recruitment/tasks");
      } else {
        message.error("Error fetching task details. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (taskId) => {
    if ((!comment || comment.trim().length === 0) && attachments.length === 0) {
      message.warning("Please enter a comment");
      return;
    }

    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      setPostingComment(true);
      const linksText = attachments.length
        ? "\n" + attachments.map((a) => a.url).join("\n")
        : "";
      const rawText = commentRichText && commentRichText.trim().length > 0 ? commentRichText : comment;
      const mentionsFromText = extractMentionIdsFromText(`${(rawText || '').trim()}${linksText}`);
      const payload = {
        taskId: taskId,
        userId: authState?.user?._id,
        userName: authState?.user?.fullName || authState?.user?.email,
        text: `${(rawText || "").trim()}${linksText}`.trim(),
        mentions: mentionsFromText,
      };

      const response = await apiServices(
        "POST",
        `tasks/${taskId}/comments`,
        payload,
        {
          access_token: {
            accessToken: token,
          },
        }
      );

      if (response?.data?.status || response?.data?.success) {
        message.success("Comment added");
        const created = response?.data?.data || payload;
        setComments((prev) => [created, ...prev]);
        setCommentsByTask((prev) => ({
          ...prev,
          [taskId]: [created, ...(prev[taskId] || [])],
        }));
        setComment("");
        setCommentRichText("");
        setAttachments([]);
      } else {
        message.error(response?.data?.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      message.error("Failed to add comment");
    } finally {
      setPostingComment(false);
    }
  };

  const fetchTaskComments = async (taskId) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;
    if (!token) return;
    try {
      setLoadingCommentsFor(taskId);
      const response = await apiServices(
        "GET",
        `tasks/${taskId}/comments`,
        null,
        {
          access_token: {
            accessToken: token,
          },
        }
      );
      if (response?.data?.success || response?.data?.status) {
        const list = response?.data?.comments || [];
        setCommentsByTask((prev) => ({ ...prev, [taskId]: list }));
      }
    } catch (err) {
      // non-blocking
    } finally {
      setLoadingCommentsFor(null);
    }
  };

  const handleGalleryClick = () => {
    if (galleryInputRef.current) galleryInputRef.current.click();
  };

  const handleMediaClick = () => {
    if (mediaInputRef.current) mediaInputRef.current.click();
  };

  const validateAttachmentFile = (file) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      message.error("File size should not exceed 10MB");
      return false;
    }
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      message.error(
        "Only PDF, DOC, JPG, PNG, JPEG, DOCX, and ZIP files are allowed"
      );
      return false;
    }
    return true;
  };

  const uploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingAttachments(true);
    const uploaded = [];
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const isValid = validateAttachmentFile(file);
        if (!isValid) {
          continue;
        }
        const res = await apiUploadToS3(file);
        const url = res?.data?.result?.secure_url;
        if (url) {
          uploaded.push({ url, fileName: file.name, type: file.type });
        }
      }
      if (uploaded.length > 0) {
        setAttachments((prev) => [...uploaded, ...prev]);
        message.success(`${uploaded.length} file(s) attached`);
      }
    } catch (e) {
      console.error("Attachment upload failed", e);
      message.error("Failed to upload attachment(s)");
    } finally {
      setUploadingAttachments(false);
    }
  };

  const handleGalleryChange = async (e) => {
    const files = e.target.files;
    await uploadFiles(files);
    e.target.value = ""; // reset
  };

  const handleMediaChange = async (e) => {
    const files = e.target.files;
    await uploadFiles(files);
    e.target.value = ""; // reset
  };

  const handleCopyLink = async () => {
    const url = window.prompt("Paste a link to attach");
    if (!url) return;
    try {
      // basic validation
      const parsed = new URL(url);
      setAttachments((prev) => [
        { url: parsed.href, fileName: parsed.href, type: "link" },
        ...prev,
      ]);
      message.success("Link attached");
    } catch (e) {
      message.error("Please enter a valid URL");
    }
  };

  const handleEmoji = () => {
    setComment((prev) => `${prev} 🙂`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "SUBMITTED":
        return "blue";
      case "COMPLETED":
        return "green";
      case "OVERDUE":
        return "red";
      default:
        return "default";
    }
  };

  const handleAddFeedback = () => {
    setFeedbackModalVisible(true);
    feedbackForm.setFieldsValue({
      evaluationDate: moment(),
      evaluatorName: authState?.user?.fullName || "",
      candidateName: `${task.candidateId.firstName} ${task.candidateId.lastName}`,
      jobTitle: task.candidateId.appliedFor?.title || "",
    });
  };

  const handlePreviewTaskFile = () => {
    const file = task?.taskFile;
    if (!file?.imageUrl) {
      message.error("No file available for preview");
      return;
    }
    window.open(file.imageUrl, "_blank");
  };

  const handleDownloadTaskFile = async () => {
    const file = task?.taskFile;
    if (!file?.imageUrl) {
      message.error("No file available for download");
      return;
    }
    try {
      const response = await fetch(file.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Failed to download file");
    }
  };

  const handleFeedbackSubmit = async (values) => {
    setSubmitting(true);
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    // Check if user is a task reviewer
    if (!isUserTaskReviewer()) {
      message.error("Only assigned reviewers can submit feedback");
      setSubmitting(false);
      return;
    }

    try {
      const evaluationDateStr = (
        values?.evaluationDate ? moment(values.evaluationDate) : moment()
      ).format("YYYY-MM-DD");

      // First submit task feedback
      const response = await apiServices(
        "POST",
        `task/${id}/feedback`,
        {
          description: values.description,
          ratings: {
            ProblemSolvingSkills: values.ProblemSolvingSkills,
            PresentationSkills: values.PresentationSkills,
            EfficientWorkingSkills: values.EfficientWorkingSkills,
          },
          decision: values.decision,
          evaluationDate: evaluationDateStr,
        },
        {
          access_token: {
            accessToken: token,
          },
        }
      );

      if (response?.data?.success) {
        message.success("Feedback submitted successfully");
        setFeedbackModalVisible(false);
        feedbackForm.resetFields();
        fetchTaskDetails();
      } else {
        throw new Error(response?.data?.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      if (error.response?.status === 401) {
        message.error("Unauthorized access. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        message.error(
          "You are not authorized to provide feedback for this task"
        );
      } else if (error.response?.status === 404) {
        message.error("Task not found");
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessage = error.response.data.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join(", ");
        message.error(errorMessage);
      } else {
        message.error(
          error.response?.data?.message ||
            "Error submitting feedback. Please try again"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isUserTaskReviewer = () => {
    if (!task?.taskReviewers || !authState?.user?._id) return false;
    return task.taskReviewers.some(
      (reviewer) => reviewer._id === authState.user._id
    );
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdateLoading(true);
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    try {
      const response = await apiServices(
        "PATCH",
        `task/${id}/status`,
        {
          status: newStatus,
        },
        {
          access_token: {
            accessToken: token,
          },
        }
      );

      if (response?.data?.success) {
        message.success("Task status updated successfully");
        fetchTaskDetails(); // Refresh task details
      } else {
        throw new Error(
          response?.data?.message || "Failed to update task status"
        );
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error(
        error.response?.data?.message || "Error updating task status"
      );
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content container-fluid">
        <Spin size="large" />
      </div>
    );
  }

  const FirstName =
    task?.candidateId.firstName.charAt(0).toUpperCase() +
    task?.candidateId.firstName.slice(1).toLowerCase();
  const LastName =
    task?.candidateId.lastName.charAt(0).toUpperCase() +
    task?.candidateId.lastName.slice(1).toLowerCase();
  const FullName = FirstName + " " + LastName;

  return (
    <>
      <Helmet>
        <title>Task Details</title>
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="content container-fluid">
        {/* Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <div className="d-flex align-items-center">
                <div>
                  <h3 className="page-title mb-0">Tasks</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/recruitment/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/recruitment/tasks">Tasks</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            width: "100%",
            borderTop: "1px solid #CFD4D8",
            display: "flex",
            justifySelf: "center",
            height: "50px",
            alignItems: "flex-end",
            marginBottom: "15px",
          }}
        >
          <div style={{ display: "flex", marginBottom: "6px" }}>
            <div>
              <button
                onClick={() => navigate("/recruitment/tasks")}
                style={{
                  marginRight: "16px",
                  padding: "0",
                  border: "none",
                  background: "transparent",
                }}
              >
                <img src={backBtn}></img>
              </button>
            </div>
            <div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/recruitment/tasks">Tasks</Link>
                </li>
                <li className="breadcrumb-item active">{FullName}</li>
              </ul>
            </div>
          </div>
          <div></div>
        </div>

        <div className="initials-div">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="initials-details">
              {task?.candidateId.firstName?.[0].toUpperCase()}
              {task?.candidateId.lastName?.[0].toUpperCase()}
            </div>
            <div>
              <h3
                className="ms-3 mt-2 mb-0"
                style={{
                  fontSize: "20px",
                  fontweight: "500",
                  color: "#000000",
                }}
              >
                {FirstName + " " + LastName}{" "}
              </h3>
              <h5
                className="ms-3"
                style={{
                  fontSize: "14px",
                  fontweight: "450",
                  color: "#444444",
                }}
              >
                {task?.candidateId?.appliedFor?.title
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </h5>
              <div style={{ paddingLeft: "10px" }}>
                <img src={starIcon}></img>
                <span style={{ marginLeft: "10px" }}>
                  {task?.feedback.rating}
                </span>
              </div>
            </div>
            <Tag className="tag-style" style={{ borderRadius: "70px" }}>
              {task?.candidateId?.appliedFor.status[0] +
                task?.candidateId?.appliedFor.status.slice(1).toLowerCase()}
            </Tag>
          </div>
          <div className="custom">
            <div
              onClick={() =>
                navigate(`/recruitment/candidates/${task.candidateId._id}`)
              }
              className="select-btn"
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  marginTop: "8px",
                }}
              >
                Go to Profile
              </h3>
              <div className="imageRightArrow">
                <img
                  src={RightArrow}
                  style={{ height: "20px", width: "20px" }}
                ></img>
              </div>
            </div>
          </div>
        </div>

        <div className="AddFeedback-screen">
          <div className="AddFeedback-innerScreen">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div
                style={{
                  height: "40px",
                  width: "40px",
                  borderRadius: "50%",
                  background: "#f7f7f8",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={description}
                  alt="Task Icon"
                  style={{ maxWidth: "80%", maxHeight: "80%" }}
                />
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  color: "#000000",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {task?.taskName}
              </div>
              <div>
                <Tag
                  color={getStatusColor(task?.status)}
                  style={{
                    borderRadius: "60px",
                    fontSize: "14px",
                    padding: "2px 8px",
                  }} // Adjust padding for smaller screens
                >
                  {task?.status[0] + task?.status.slice(1).toLowerCase()}
                </Tag>
              </div>
            </div>
            {task?.status === "PENDING" && (
              <div className="btn-div">
                <button onClick={handleAddFeedback} className="feedback-btn">
                  <img
                    src={colored}
                    alt="Feedback Icon"
                    style={{ height: "16px", width: "16px" }}
                  />
                  Add Feedback
                </button>
              </div>
            )}
          </div>
          <Row
            gutter={[24, 16]}
            wrap={true}
            style={{ marginTop: "10px", display: "flex", flexWrap: "wrap" }}
          >
            <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "14px",
                  fontWeight: "450",
                  color: "#212529",
                }}
              >
                Task Type
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#3b4249",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                  maxWidth: "100%",
                }}
              >
                {task?.taskName
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </p>
            </Col>
            <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "14px",
                  fontWeight: "450",
                  color: "#212529",
                }}
              >
                Duration
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#3b4249",
                }}
              >
                {task?.taskDuration} Days
              </p>
            </Col>
            <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "14px",
                  fontWeight: "450",
                  color: "#212529",
                }}
              >
                Deadline Date
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#3b4249",
                }}
              >
                {moment(task?.lastDateOfSubmission).format("DD-MMM-YYYY")}
              </p>
            </Col>
            <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "14px",
                  fontWeight: "450",
                  color: "#212529",
                }}
              >
                Task Reviewers
              </p>
              <div className="project-members" style={{ margin: "4px auto" }}>
                <ul
                  className="team-members"
                  style={{ minWidth: "max-content" }}
                >
                  {task?.taskReviewers?.slice(0, 4).map((reviewer, index) => (
                    <li key={index}>
                      <Tooltip title={reviewer?.fullName}>
                        <Avatar
                          style={{ cursor: "pointer" }}
                          src={reviewer?.imageUrl || user_icon}
                        />
                      </Tooltip>
                    </li>
                  ))}
                  {task?.taskReviewers?.length > 4 && (
                    <li className="dropdown avatar-dropdown">
                      <Link
                        className="all-users dropdown-toggle projectTeamMember"
                        style={{
                          display: "inline-flex",
                          height: "33px",
                          width: "33px",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "50%",
                          textDecoration: "none",
                          color: "#333",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        +{task?.taskReviewers?.length - 4}
                      </Link>
                      {/* Dropdown menu for additional interviewers */}
                      <div className="dropdown-menu dropdown-menu-right">
                        <div className="avatar-group">
                          {task?.taskReviewers
                            ?.slice(4)
                            .map((reviewer, index) => (
                              <li key={index}>
                                <Tooltip title={reviewer?.fullName}>
                                  <Avatar
                                    style={{ cursor: "pointer" }}
                                    src={reviewer?.imageUrl || user_icon}
                                  />
                                </Tooltip>
                              </li>
                            ))}
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "14px",
                  fontWeight: "450",
                  color: "#212529",
                }}
              >
                Created By
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#3b4249",
                }}
              >
                {task?.createdBy?.fullName}
              </p>
            </Col>
          </Row>

          {task?.taskFile?.imageUrl && (
            <div
              style={{
                marginTop: "10px",
                border: "1px solid #cfd4d8",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                height: "90px",
                width: "240px",
              }}
            >
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    height: "50px",
                    width: "50px",
                    borderRadius: "50%",
                    background: "lightgrey",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                  }}
                >
                  <img src={description}></img>
                </div>
                <div style={{ padding: "10px 0px 10px 10px", minWidth: 0 }}>
                  <Tooltip title={task?.taskFile?.fileName}>
                    <p
                      style={{
                        marginBottom: "0px",
                        fontSize: "14px",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "140px",
                      }}
                    >
                      {task?.taskFile?.fileName}
                    </p>
                  </Tooltip>
                  <p
                    style={{
                      marginBottom: "0px",
                      fontSize: "12px",
                      fontWeight: "450",
                    }}
                  >
                    {moment(task?.createdAt).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>
              <div style={{ flex: "0 0 24px" }}>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="preview" onClick={handlePreviewTaskFile}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <img src={previewIcon}></img>
                          <p style={{ marginBottom: "0px" }}>Preview</p>
                        </div>
                      </Menu.Item>
                      <Menu.Item
                        key="download"
                        onClick={handleDownloadTaskFile}
                      >
                        <div style={{ display: "flex", gap: "6px" }}>
                          <img src={downloadIcon}></img>
                          <p style={{ marginBottom: "0px" }}>Download</p>
                        </div>
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                  placement="topRight"
                >
                  <div
                    style={{
                      cursor: "pointer",
                      height: "25px",
                      width: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <img src={list} alt="More Options" />
                  </div>
                </Dropdown>
              </div>
            </div>
          )}

          {/* Comments - always visible if any for this task */}
          {(commentsByTask[id] && commentsByTask[id].length > 0) && (
            <div style={{ marginTop: "10px" }}>
              {commentsByTask[id].map((c) => (
                <div
                  key={c._id || c.createdAt}
                  style={{
                    background: "#f5f5f5",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    marginTop: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <img src={c.userImageUrl || user_icon} style={{ height: "40px", width: "40px", borderRadius: "50%" }} />
                      <div style={{fontSize: 16, fontWeight: 500, color: "#222" }}>{c.userName}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 450, color: "#666" }}>
                      {c.createdAt ? moment(c.createdAt).format("ddd, MMM DD [at] hh:mm a") : ""}
                    </div>
                  </div>
                  <div style={{ marginTop: 6, color: "#222" }}
                    dangerouslySetInnerHTML={{ __html: buildCommentHTML(c.text) }}
                  />
                </div>
              ))}
            </div>
          )}

          {(task.status === "REVIEWED" ||
            task.status === "COMPLETED" ||
            task.status === "REJECTED") && (
            <div>
              {task?.feedback.map((feedback, index) => (
                <InterviewFeedbackDisplay key={index} feedback={feedback} />
              ))}
            </div>
          )}
        </div>

        {/* comments if needed! */}
        <div style={{ display: "flex", gap: "15px" }}>
        <div>
            <img
              src={task?.createdBy?.imageUrl || user_icon}
              style={{
                height: "40px",
                width: "40px",
                borderRadius: "50%",
                border: "1px solid transparent",
              }}
            ></img>
        </div>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid transparent",
              borderRadius: "8px",
              padding: "10px 20px 15px 10px",
              width: "100%",
            }}
          >
          <div style={{ border: "1px solid #e1e5e9", borderRadius: 8, overflow: "hidden", padding: "10px", background: "white" }}>
            <RichTextEditor
              content={commentRichText}
              onChange={setCommentRichText}
              users={(task?.taskReviewers || []).map((u) => ({ ...u }))}
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px", fontStyle: "italic" }}>
              Tip: Type @ to mention task reviewers
            </div>
          </div>
            {attachments.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "6px",
                  }}
                >
                  Attachments:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {attachments.map((a, idx) => (
                    <div
                      key={`${a.url}-${idx}`}
                      style={{
                        background: "#f7f7f8",
                        border: "1px solid #eef0f1",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#212529",
                          textDecoration: "underline",
                          maxWidth: "240px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.fileName || a.url}
                      </a>
                      <button
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#ff4d4f",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
            <div className="d-flex gap-1 ms-3">
                <input
                  ref={mediaInputRef}
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleMediaChange}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleGalleryChange}
                />
                <button
                  onClick={handleMediaClick}
                  disabled={uploadingAttachments}
                  style={{
                    border: "2px solid #f7f7f8",
                    borderRadius: "4px",
                    height: "35px",
                    width: "35px",
                  }}
                >
                  <img src={media}></img>
                </button>
                <button
                  onClick={handleGalleryClick}
                  disabled={uploadingAttachments}
                  style={{
                    border: "2px solid #f7f7f8",
                    borderRadius: "4px",
                    height: "35px",
                    width: "35px",
                  }}
                >
                  <img src={gallery}></img>
                </button>
                <button
                  onClick={handleEmoji}
                  style={{
                    border: "2px solid #f7f7f8",
                    borderRadius: "4px",
                    height: "35px",
                    width: "35px",
                  }}
                >
                  <img src={emoji}></img>
                </button>
                <button
                  onClick={handleCopyLink}
                  style={{
                    border: "2px solid #f7f7f8",
                    borderRadius: "4px",
                    height: "35px",
                    width: "35px",
                  }}
                >
                  <img src={copyLink}></img>
                </button>
            </div>
            <div>
                <Button
                  onClick={() => handleCommentSubmit(id)}
                  loading={postingComment || uploadingAttachments}
                  style={{
                    color: "#ff9244",
                    border: "1px solid #ff9244",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "450",
                  }}
                >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

        <Modal
          title="Add Feedback"
          open={feedbackModalVisible}
          onCancel={() => setFeedbackModalVisible(false)}
          footer={null}
          width={450}
          className="custom-modal"
        >
          <Form
            form={feedbackForm}
            layout="vertical"
            onFinish={handleFeedbackSubmit}
          >
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please provide feedback description",
                },
              ]}
            >
              <TextArea
                rows={5}
                placeholder="Enter Description"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <div style={{ background: "#f7f7f8", borderRadius: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #e0e3e6",
                  padding: "12px 12px 8px 12px",
                  fontWeight: "450",
                  color: "black",
                }}
              >
                <span>Rating</span>
                <div
                  style={{
                    display: "flex",
                    gap: "23px",
                    fontSize: "10px",
                    fontWeight: "450",
                    color: "#6f7d8a",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                  }}
                >
                  <div>1</div>
                  <div>2</div>
                  <div>3</div>
                  <div>4</div>
                  <div>5</div>
                </div>
              </div>
              <div style={{ padding: "6px 12px 12px 12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eef0f1",
                    alignItems: "center",
                    height: "45px",
                  }}
                >
                  <label>Problem Solving Skills:</label>
                  <Form.Item
                    name="ProblemSolvingSkills"
                    rules={[
                      {
                        required: true,
                        message: "Please provide rating",
                      },
                    ]}
                    style={{ marginTop: "22px" }}
                  >
                    <Rate count={5} />
                  </Form.Item>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eef0f1",
                    alignItems: "center",
                    height: "45px",
                  }}
                >
                  <label>Presentation Skills</label>
                  <Form.Item
                    name="PresentationSkills"
                    rules={[
                      {
                        required: true,
                        message: "Please provide a presentation rating",
                      },
                    ]}
                    style={{ marginTop: "22px" }}
                  >
                    <Rate count={5} />
                  </Form.Item>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eef0f1",
                    alignItems: "center",
                    height: "45px",
                  }}
                >
                  <label>Efficient Working Skills</label>
                  <Form.Item
                    name="EfficientWorkingSkills"
                    rules={[
                      {
                        required: true,
                        message: "Please provide rating",
                      },
                    ]}
                    style={{ marginTop: "22px" }}
                  >
                    <Rate count={5} />
                  </Form.Item>
                </div>
              </div>
            </div>

            <Form.Item
              name="decision"
              rules={[{ required: true, message: "Please select a decision" }]}
              style={{ marginTop: "15px" }}
            >
              <div
                style={{
                  display: "flex",
                  border: "1px solid transparent",
                  background: "#f7f7f8",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  onClick={() => {
                    feedbackForm.setFieldValue("decision", "STRONG YES");
                  }}
                  style={{ border: "none", background: "transparent" }}
                >
                  Strong Yes
                </Button>
                <Button
                  onClick={() => {
                    feedbackForm.setFieldValue("decision", "YES");
                  }}
                  style={{ border: "none", background: "transparent" }}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    feedbackForm.setFieldValue("decision", "NO");
                  }}
                  style={{ border: "none", background: "transparent" }}
                >
                  No
                </Button>
                <Button
                  onClick={() => {
                    feedbackForm.setFieldValue("decision", "STRONG NO");
                  }}
                  style={{ border: "none", background: "transparent" }}
                >
                  Strong No
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              style={{ display: "flex", justifyContent: "flex-end" }}
              className="pt-3 pb-3"
            >
              <Button
                onClick={() => setFeedbackModalVisible(false)}
                style={{
                  marginRight: "8px",
                  borderRadius: "32px",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#a5adb6",
                  background: "#f7f7f8",
                  border: "1px solid transparent",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{
                  borderRadius: "32px",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#white",
                  background: "#ff9244",
                  border: "1px solid transparent",
                }}
              >
                Submit Feedback
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <style jsx>{`
        .btn-style{
          width:50%;
          font-size:14px; 
          font-weight: 500;
          color: #A5ADB6 ;
          border: 1px solid transparent;
        }
        .info-card {
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .profile-img {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 500;
          color: #666;
          border: 1px solid #e8e8e8;
        }
        .section-title {
          color: #333;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .info-section {
          padding-top: 20px;
          border-top: 1px solid #e8e8e8;
          margin-top: 20px;
        }
        .info-section:first-child {
          padding-top: 0;
          border-top: none;
          margin-top: 0;
        }
        .info-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .info-icon {
          font-size: 16px;
          margin-right: 12px;
          color: #666;
          margin-top: 3px;
        }
        .info-content {
          flex: 1;
        }
        .info-label {
          display: block;
          font-size: 12px;
          margin-bottom: 4px;
          color: #666;
        }
        .info-value {
          display: block;
          font-size: 14px;
          color: #333;
          font-weight: 500;
          line-height: 1.4;
        }
        .info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-row {
          display: none;
        }

        .nav-tabs-custom .ant-tabs-nav {
          margin-bottom: 20px;
        }
        .nav-tabs-custom .ant-tabs-tab {
          padding: 12px 0;
          margin: 0 0 0 32px;
          font-size: 15px;
        }

        .nav-tabs-custom .ant-tabs-tab-active {
          font-weight: 600;
        }
        .timeline-item {
          padding-bottom: 20px;
          border-left: 2px solid #e8e8e8;
          margin-left: 16px;
          padding-left: 20px;
          position: relative;
        }
        .timeline-item::before {
          content: "";
          position: absolute;
          left: -7px;
          top: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #f4a261;
        }
        .time {
          color: #666;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .event {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .files-content,
        .interview-content {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 4px;
          border: 1px solid #e8e8e8;
        }

        .tag-style{
          border-radius: 70px;
          margin-left: 9px;
          margin-top: -35px;
        }
        .ant-tag {
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 500;
        }
        .interview-modal .ant-modal-content {
          border-radius: 3px;
          overflow: hidden;
        }

        .interview-modal .ant-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .interview-modal .ant-modal-body {
          padding: 24px;
        }

        .interview-modal .ant-form-item-label > label {
          font-weight: 500;
        }

        .interview-modal .ant-input,
        .interview-modal .ant-select-selector,
        .interview-modal .ant-picker {
          border-radius: 3px;
          border-color: #e3e3e3;
        }

        .interview-modal .ant-input::placeholder,
        .interview-modal .ant-select-selection-placeholder,
        .interview-modal .ant-picker-input > input::placeholder {
          color: #999;
        }

        .interview-modal .ant-tag {
          margin-right: 3px;
          background: #f4f4f4;
          border: none;
          border-radius: 3px;
          padding: 4px 8px;
        }


        .ant-select-dropdown {
          z-index: 1050;
        }


        .status-scheduled .ant-select-selector,
        .status-scheduled  {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-completed .ant-select-selector,
        .status-completed{
          background-color: #f6ffed !important;
          border-color: #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-cancelled .ant-select-selector,
        .status-cancelled {
          background-color: #fff1f0 !important;
          border-color: #ffa39e !important;
          color: #f5222d !important;
        }

        .status-rescheduled .ant-select-selector,
        .status-rescheduled {
          background-color: #fff7e6 !important;
          border-color: #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-new .ant-select-selector,
        .status-new {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-new .ant-select-arrow {
          color: #1890ff !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-screening .ant-select-selector,
        .status-screening {
          background-color: #fff7e6 !important;
          border-color: #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-screening .ant-select-arrow {
          color: #fa8c16 !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-offer_sent .ant-select-selector,
        .status-offer_sent {
          background-color: #d3d3d3 !important;
          border-color: #5e716a !important;
          color: #5e716a !important;
        }

        .status-offer_sent .ant-select-arrow {
          color: #5e716a !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }
        

        .status-shortlisted .ant-select-selector,
        .status-shortlisted {
          background-color: #f6ffed !important;
          border-color: #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-shortlisted .ant-select-arrow {
          color: #52c41a !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-hired .ant-select-selector,
        .status-hired {
          background-color: #f9f0ff !important;
          border-color: #d3adf7 !important;
          color: #722ed1 !important;
        }

        .status-hired .ant-select-arrow {
          color: #722ed1 !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-rejected .ant-select-selector,
        .status-rejected {
          background-color: #fff1f0 !important;
          border-color: #ffa39e !important;
          color: #f5222d !important;
        }

        .status-rejected .ant-select-arrow {
          color: #f5222d !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }


        .task-card {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .task-card .task-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .status-pending .ant-select-selector {
          background-color: #fff7e6 !important;
          border-color: #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-submitted .ant-select-selector {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-completed .ant-select-selector {
          background-color: #f6ffed !important;
          border-color: #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-cancelled .ant-select-selector {
          background-color: #fff1f0 !important;
          border-color: #ffa39e !important;
          color: #f5222d !important;
        }

        .file-card {
          margin: 16px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .file-details {
          display: flex;
          flex-direction: column;
        }

        .file-actions {
          display: flex;
          align-items: center;
        }

        .no-files-message {
          text-align: center;
          padding: 40px 0;
        }


        /* Offer Modal Styles */
        :global(.offer-modal .ant-modal-content) {
          border-radius: 8px;
          overflow: hidden;
        }

        :global(.offer-modal .ant-modal-header) {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        :global(.offer-modal .ant-modal-body) {
          padding: 24px;
        }

        :global(.offer-modal .ant-form-item-label > label) {
          font-weight: 500;
        }

        :global(.offer-modal .ant-input),
        :global(.offer-modal .ant-select-selector),
        :global(.offer-modal .ant-picker) {
          border-radius: 8px;
          padding: 8px 12px;
          height: 40px;
          border-color: #e3e3e3;
        }


        :global(.offer-modal .ant-upload-drag) {
          border: 2px dashed #e3e3e3;
          border-radius: 4px;
          background: #fafafa;
          transition: all 0.3s;
        }


        :global(.offer-modal .ant-upload-drag-icon) {
          color: #ff9b44;
          font-size: 48px;
          margin-bottom: 16px;
        }

        :global(.offer-modal .ant-upload-text) {
          color: #666;
          font-size: 16px;
          margin-bottom: 8px;
        }

        :global(.offer-modal .ant-upload-hint) {
          color: #999;
        }

        :global(.offer-modal .ant-btn-primary) {
          background: #ff9b44;
          border-color: #ff9b44;
        }


        .active-tab-styles{
           display: flex ;
            width: 60%;
            justify-content: space-between;
        }

        .active-tab-timeline{
          padding: 0 10px 15px 0px ;
          font-size: 16px; 
          font-weight: 500;
        }
        .active-tab-files{
          padding: 0 10px 15px 0px ;
          font-size: 16px; 
          font-weight: 500;
          color: activeTab === 'files' ? #ff9244 : #a5adb6;
          cursor: pointer;
          border-bottom: activeTab === 'files' ? 2px solid #ff9244: none;
        }
        .active-tab-interview{
          padding: 0 10px 15px 0px ;
          font-size: 16px; 
          font-weight: 500;
          color: activeTab === 'interview' ?  #ff9244  : #a5adb6;
          cursor: pointer;
          border-bottom: activeTab === 'interview' ?  2px solid #ff9244 : none;
        }
        .info-items-children{
          display: flex ;
        }

        .select-btn{
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          border: 1px solid #ff9244;
          border-radius: 8px;
          background: #ff9244;
          height: 45px;
          width: 160px;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          cursor: pointer;
        }

      .customized .ant-select-selector{
        height: 45px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 450;
      }

      .custom-modal .ant-modal-close {
        background-color: #F8F9FA;
        border-radius: 50%;
        border:"1px solid #F8F9FA";
        margin:16px 16px 0 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .add-candidate-btn{
          border-radius: 40px !important;
          height: 44px !important;
          background-color: #ff9244 !important;
          color: white !important;
          font-weight: 500 !important;
          font-size: 16px !important;
          border: 2px solid #ff9244 !important;
          width: 185px !important;
      }
        
      .btn-content{
          display: flex;
          justify-content: center;
          align-items: center;
      }

      .search-btn {
          background: #1f1f1f;
          border: 1px solid #1f1f1f;
          height: 40px;
          border-radius: 8px;
          width: 80% !important;
          font-weight: 500;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          justify-self: end;
        }

        .initials-div{
          height: 130px;
          background: #ffffff;
          border: 1px solid transparent;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .custom{
          display: flex;
          float : end;
          margin-right: 12px 
        }

        .initials-details{
          height: 80px;
          width: 80px;
          border: 1px solid transparent;
          border-radius: 50%;
          background: #f5f1fd;
          color: #9368e9;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: 20px;
          font-size: 28px;
          fontweight: 500;
        }

        .AddFeedback-screen{
          background: #ffffff ;
          border: 1px solid transparent;
          border-radius: 8px;
          margin-bottom: 20px;
          padding: 25px;
        }

        .feedback-btn{
          background: transparent;
          border: none;
          font-size: 16px;
          font-weight: 450;
          color: #ff9244;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-div{
          padding-top: 8px;
          flex-shrink: 0;
        }

        .AddFeedback-innerScreen{
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 630px){
          .tag-style{
            display: none !important;
          }
        }

        @media (max-width: 500px){
          .select-btn{
            width: 130px !important;
            gap: 4px !important;
          }
        }

        @media (max-width: 500px){
          .custom{
            margin-right: 7px !important; 
          }
        }

        @media (max-width: 500px){
          .initials-details{
            margin-left: 7px !important; 
          }
        }

        @media (min-width: 420px) and (max-width: 500px){
          .select-btn{
            margin-left: 30px !important;
          }
        }

        @media (max-width: 400px){
          .imageRightArrow{
            display : none !important;
          }
        }

        @media (max-width: 400px){
          .select-btn{
            width: 95px !important;
          }
        }

        @media (min-width: 450px) and (max-width: 553px){
         .btn-div{
          display: flex;
          }
        }








      `}</style>
      </div>
    </>
  );
};

export default TaskDetails;
