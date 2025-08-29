import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Menu,
  Dropdown,
  Button,
  Spin,
  message,
  Tag,
  Typography,
  Tabs,
  Select,
  Tooltip,
  Space,
  Collapse,
  Modal,
  Form,
  Input,
  Upload,
} from "antd";
import {
  FilePdfOutlined,
  FileWordOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import moment, { min } from "moment";
import CreateInterviewModal from "./CreateInterviewModal";
import CreateTaskModal from "./CreateTaskModal";
import SendOfferModal from "./SendOfferModal";
import { apiUploadToS3 } from "../../Services/uploadImage";
import backBtn from "../../assets/iconsRecruitment/arrow-left.svg";
import more from "../../assets/iconsRecruitment/vertical.svg";
import mail from "../../assets/iconsRecruitment/mail.svg";
import phone from "../../assets/iconsRecruitment/phone.svg";
import location from "../../assets/iconsRecruitment/location.svg";
import timeline from "../../assets/iconsRecruitment/Timeline.svg";
import files from "../../assets/iconsRecruitment/description.svg";
import interviewIcon from "../../assets/iconsRecruitment/interview.svg";
import star from "../../assets/iconsRecruitment/star.svg";
import colored from "../../assets/iconsRecruitment/Colored.svg";
import cloudUpload from "../../assets/iconsRecruitment/cloud.svg";
import EditIcon from "../../assets/iconsRecruitment/editIcon.svg";
import DeleteIcon from "../../assets/iconsRecruitment/deleteIcon.svg";
import NoInterview from "../../assets/iconsRecruitment/NoInterviewIcon.svg";
import InterviewFeedbackDisplay from "./InterviewFeedbackDisplay";
import newEditIcon from "../../assets/iconsRecruitment/newEditIcon.svg";
import newCalanderIcon from "../../assets/iconsRecruitment/newCalanderIcon.svg";
import blacklistIcon from "../../assets/iconsRecruitment/BlacklistIcon.svg";
import taskIcon from "../../assets/iconsRecruitment/taskIcon.svg";
import fileCheck from "../../assets/iconsRecruitment/RightArrow.svg";
import {
  DeleteFiles,
  uploadFunction,
} from "../Employees/Projects/UploadAndDeleteFunc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons"; // or free-regular-svg-icons if you want the regular style
import { user_icon } from "../../Entryfile/imagepath";
import { Helmet } from "react-helmet";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
];
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

function splitFileName(fileName) {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return { base: fileName, ext: "" };
  return {
    base: fileName.substring(0, lastDot),
    ext: fileName.substring(lastDot),
  };
}

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const authState = useSelector((state) => state.user.loginvalue);
  const [isInterviewModalVisible, setIsInterviewModalVisible] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offer, setOffer] = useState(null);
  const [offerStatus, setOfferStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [filter, setfilter] = useState("present");
  const [historyId, setHistoryId] = useState(null);
  const [resume, setResume] = useState([]);
  const [openModalIndex, setOpenModalIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempName, setTempName] = useState("");
  const fileInputRef = useRef(null);
  const [viewMore, setViewMore] = useState(false);
  const [viewMobile, setViewMobile] = useState(window.innerWidth < 768);
  const [previewFile, setPreviewFile] = useState(null);
  const dropdownRef = useRef(null); // Add this line for dropdown ref
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (filter === "history" && historyId) {
      fetchCandidateDetails(historyId);
      fetchCandidateInterviews(historyId);
      fetchCandidateTasks(historyId);
      fetchOfferDetails(historyId);
    } else if (filter === "present") {
      fetchCandidateDetails(id);
      fetchCandidateInterviews(id);
      fetchCandidateTasks(id);
      fetchOfferDetails(id);
    }
  }, [id, filter]);

  useEffect(() => {
    const handleResize = () => {
      setViewMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenModalIndex(null);
      }
    }

    if (openModalIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModalIndex]);

  const fetchCandidateDetails = async (id) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await apiServices("GET", `candidate/${id}`, null, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.status) {
        console.log("Candidate Details Response:", response.data.data);
        console.log("Resume URL:", response.data.data.resume);
        setCandidate(response.data.data);
        setHistoryId(response.data.data.history);
        setResume(response?.data?.data?.resume);
        setOfferStatus(response.data.data.status);
      } else {
        if (response?.data?.message === "Invalid token") {
          message.error("Session expired. Please login again");
          navigate("/login");
        } else if (response?.data?.message === "Candidate not found") {
          message.error("Candidate not found");
          navigate("/recruitment/candidates");
        } else {
          message.error(
            response?.data?.message || "Failed to fetch candidate details"
          );
        }
      }
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please login again");
        navigate("/login");
      } else if (error.response?.status === 404) {
        message.error("Candidate not found");
        navigate("/recruitment/candidates");
      } else {
        message.error("Error fetching candidate details");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file) => {
    console.log("validateFile called with:", file);
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      message.error("File size should not exceed 10MB");
      return false;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      message.error("Only PDF, DOC, DOCX, and ZIP files are allowed");
      return false;
    }

    return true;
  };

  const handleUpload = async (resumeData) => {
    const token = localStorage.getItem("token");

    if (!token) {
      message.error("Authentication required");
      return;
    }

    try {
      const response = await apiServices(
        "PUT",
        `candidate/${id}`,
        { resume: resumeData },
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.status) {
        message.success("Resume uploaded successfully");
      } else {
        console.error("Upload failed:", response?.data);
        message.error(response?.data?.message || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      message.error("Error uploading resume");
    }
  };

  const handlePreviewResume = () => {
    if (!candidate?.resume) {
      message.error("No resume available for preview");
      return;
    }

    window.open(candidate.resume, "_blank");
  };

  // const handleDownloadResume = async () => {
  //   if (!candidate?.resume) {
  //     message.error("No resume available for download");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(candidate.resume);
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = candidate.resume.split("/").pop();
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     message.error("Failed to download resume");
  //   }
  // };

  const startEditing = (index, fileName) => {
    const { base } = splitFileName(fileName);
    setEditingIndex(index);
    setTempName(base);
  };

  const saveRename = async (index) => {
    const { ext } = splitFileName(resume[index].fileName);
    const newFileName = tempName + ext;
    const updatedResume = resume.map((file, i) =>
      i === index ? { ...file, fileName: newFileName } : file
    );
    setResume(updatedResume);
    setEditingIndex(null);

    // Call backend to update resume array
    try {
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;
      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        "PUT",
        `candidate/${id}`,
        { resume: updatedResume },
        {
          access_token: { accessToken: token },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.status) {
        message.success("File name updated successfully");
      } else {
        message.error(response?.data?.message || "Failed to update file name");
      }
    } catch (error) {
      message.error("Error updating file name");
    }
  };

  const handleViewMore = (id) => {
    setViewMore(viewMore === id ? null : id);
  };

  const handleStatusChange = async (newStatus) => {
    console.log("is this function called? handleStatusChange");
    if (newStatus === "BLACKLISTED") {
      // Show modal to get blacklist reason
      setSelectedStatus(newStatus);
      setIsReasonModalVisible(true);
      return;
    }

    if (newStatus === "OFFERED") {
      setIsOfferModalVisible(true);
      return;
    }

    try {
      setUpdatingStatus(true);
      setLoading(true);
      const token =
        authState?.access_token?.accessToken || localStorage.getItem("token");

      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        "PATCH",
        `candidate/${id}/status`,
        { status: newStatus },
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.status) {
        message.success("Status updated successfully");
        setCandidate(response.data.data);
        setOfferStatus(response.data.data.status);
      } else {
        throw new Error(response?.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.message || "Error updating status");
    } finally {
      setUpdatingStatus(false);
      setLoading(false);
    }
  };

  const handleReasonSubmit = async (values) => {
    try {
      setUpdatingStatus(true);
      setLoading(true);
      const token =
        authState?.access_token?.accessToken || localStorage.getItem("token");

      if (!token) {
        message.error("Authentication required");
        return;
      }

      const payload = {
        status: selectedStatus,
        reason: values.reason || values.blacklistReason, // Use reason or blacklistReason as the general reason
      };

      // Add specific reason field based on status
      if (selectedStatus === "BLACKLISTED") {
        payload.blacklistReason = values.blacklistReason;
      }

      const response = await apiServices(
        "PATCH",
        `candidate/${id}/status`,
        payload,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.status) {
        message.success("Status updated successfully");
        setIsReasonModalVisible(false);
        setCandidate(response.data.data);
        setOfferStatus(response.data.data.status);
      } else {
        throw new Error(response?.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.message || "Error updating status");
    } finally {
      setUpdatingStatus(false);
      setLoading(false);
    }
  };

  const fetchOfferDetails = async (id) => {
    try {
      const token =
        authState?.access_token?.accessToken || localStorage.getItem("token");

      if (!token) return;

      const response = await apiServices("GET", `candidate/${id}/offer`, null, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        setOffer(response.data.data);
      }
    } catch (error) {
      // Silently handle 404 - it's an expected case when no offer exists
      if (error.response?.status === 404) {
        setOffer(null);
        return;
      }
      console.error("Error fetching offer details:", error);
    }
  };

  const handleSendOffer = async (formData) => {
    try {
      setSubmittingOffer(true);
      const token =
        authState?.access_token?.accessToken || localStorage.getItem("token");

      if (!token) {
        message.error("Authentication required");
        return;
      }

      // First upload the contract file
      const contractFile = formData.get("contract");
      if (contractFile) {
        try {
          const uploadResponse = await apiUploadToS3(contractFile);
          if (uploadResponse?.data?.result?.secure_url) {
            // Replace the file with the secure URL in the formData
            formData.delete("contract");
            formData.append("contract", uploadResponse.data.result.secure_url);
          }
        } catch (error) {
          console.error("Error uploading contract:", error);
          message.error("Failed to upload contract file");
          return;
        }
      }

      // Add flag to indicate this is an offer update if an offer exists
      // if (offer) {
      //   formData.append('isUpdate', 'true');
      // }

      const response = await apiServices(
        "POST",
        "candidate/send-offer",
        formData,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.success) {
        console.log("response of offer sent", response?.data?.success);
        message.success(
          offer ? "Offer updated successfully" : "Offer sent successfully"
        );
        setIsOfferModalVisible(false);

        // Always update candidate status to "OFFERED" and clear any previous status/reasons
        await handleStatusChange("OFFERED");

        // Fetch updated offer details
        await fetchOfferDetails(id);

        // Fetch updated candidate details to refresh the page
        await fetchCandidateDetails(id);

        // Redirect to offered candidates list
        // navigate("/recruitment/candidates/offered");
      } else {
        throw new Error(response?.data?.message || "Failed to send offer");
      }
    } catch (error) {
      // console.error('Error sending offer:', error);
      // message.error(error.message || 'Error sending offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleUpdateOfferStatus = async (offerId, status) => {
    try {
      const token =
        authState?.access_token?.accessToken || localStorage.getItem("token");

      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        "PATCH",
        `candidate/offer/${offerId}/status`,
        { status },
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        message.success("Offer status updated successfully");
        await fetchOfferDetails(id);
      } else {
        throw new Error(
          response?.data?.message || "Failed to update offer status"
        );
      }
    } catch (error) {
      console.error("Error updating offer status:", error);
      message.error(error.message || "Error updating offer status");
    }
  };

  const handleSendOfferClick = () => {
    console.log("Send Offer button clicked");
    console.log("Current offer:", offer); // Debug log
    setIsOfferModalVisible(true);
  };

  const handleContractUpload = ({ file }) => {
    if (file.status === "done") {
      setUploadedContract(file.originFileObj);
    }
  };

  const fetchEmployees = async () => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      return;
    }

    const roles = ["employee", "interviewer", "admin"]; // Roles that can conduct interviews

    try {
      const response = await apiServices(
        "GET",
        `user/all-employees?roles=${JSON.stringify(roles)}`,
        null,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success === true) {
        // Use the new response format and sort by fullName
        const emps = response?.data?.data || [];
        const sortedData = emps
          .slice()
          .sort((a, b) => a.fullName.localeCompare(b.fullName));
        setEmployees(sortedData);
      } else {
        throw new Error(response?.data?.message || "Failed to fetch employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error getting employees"
      );
      throw error; // Re-throw to be caught by handleCreateInterview
    }
  };

  const showTeamSearch = (val) => {
    let dropdownValues = [];
    employees.forEach((team) => {
      dropdownValues.push(team.fullName.toLowerCase());
    });
  };

  const handleCreateInterview = () => {
    setIsInterviewModalVisible(true);
  };

  const getScheduledOrRescheduledInterview = () => {
    return interviews.find(
      (interview) =>
        interview.status === "scheduled" || interview.status === "rescheduled"
    );
  };

  const handleInterviewAction = () => {
    const existingInterview = getScheduledOrRescheduledInterview();
    if (existingInterview) {
      // Reschedule existing interview
      setEditingInterview(existingInterview);
      setIsInterviewModalVisible(true);
    } else {
      // Create new interview
      setEditingInterview(null);
      setIsInterviewModalVisible(true);
    }
  };

  const handleInterviewModalCancel = () => {
    setIsInterviewModalVisible(false);
    setEditingInterview(null); // Reset editing state when modal is closed
  };

  const handleInterviewSubmit = async (values) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      throw new Error("Authentication required");
    }

    // Validate meeting link for online interviews
    if (values.interviewType === "ONLINE" && !values.meetingLink) {
      message.error("Meeting link is required for online interviews");
      throw new Error("Meeting link is required for online interviews");
    }

    const formattedDate = moment(values.interviewDate).format("YYYY-MM-DD");
    const formattedTime = moment(values.interviewTime).format("HH:mm");

    const payload = {
      candidateId: candidate._id,
      candidateName: values?.candidateName,
      // interviewerId: values?.assignedTo,
      interviewTitle: values?.interviewTitle,
      interviewType: values?.interviewType,
      assignTo: values.assignTo,
      interviewDate: formattedDate,
      interviewTime: formattedTime,
      meetingLink: values.meetingLink || "",
      shouldSendEmail: true, // Flag for backend to handle email sending
    };

    console.log("Interview payload:", payload); // For debugging

    let response;
    if (editingInterview) {
      // Update existing interview
      response = await apiServices(
        "PUT",
        `interview/${editingInterview._id}`,
        payload,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else {
      // Create new interview
      response = await apiServices("POST", "interview/create", payload, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (response?.data?.success) {
      message.success(
        editingInterview
          ? "Interview rescheduled successfully"
          : "Interview scheduled successfully"
      );
      fetchCandidateInterviews(id);
      setEditingInterview(null); // Reset editing state
      // Don't close modal here - let the modal handle it
    } else {
      throw new Error(
        response?.data?.message ||
          (editingInterview
            ? "Failed to reschedule interview"
            : "Failed to schedule interview")
      );
    }
  };

  const updateInterviewStatus = async (interviewId, newStatus) => {
    try {
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;

      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        "PATCH",
        `interview/${interviewId}/status`,
        { status: newStatus },
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        message.success("Interview status updated successfully");
        fetchCandidateInterviews(id); // Refresh the interviews list
      } else {
        message.error(
          response?.data?.message || "Failed to update interview status"
        );
      }
    } catch (error) {
      console.error("Error updating interview status:", error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Error updating interview status");
      }
    }
  };

  const fetchCandidateInterviews = async (id) => {
    setLoadingInterviews(true);
    try {
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;

      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        "GET",
        `interview/candidate/${id}`,
        null,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        console.log("Interview data:", response.data.data); // Debug log
        setInterviews(response.data.data);
      } else {
        if (response?.data?.message === "Invalid interview ID format") {
          console.error("Invalid candidate ID format:", id);
          message.error("Invalid candidate ID format");
        } else {
          message.error(
            response?.data?.message || "Failed to fetch interviews"
          );
        }
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Error fetching interviews");
      }
    } finally {
      setLoadingInterviews(false);
    }
  };

  const handleCreateTask = () => {
    setIsTaskModalVisible(true);
  };

  const handleTaskModalCancel = () => {
    setIsTaskModalVisible(false);
  };

  const handleTaskSubmit = async (values) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      return;
    }

    try {
      // Create FormData for task creation
      const formData = new FormData();

      // Task file is already uploaded in the modal. If a URL string is provided, use it directly.
      // If a raw File is accidentally provided, fall back to uploading it.
      let fileUrl = null;
      if (values.taskFile) {
        if (typeof values.taskFile === "string") {
          fileUrl = values.taskFile;
        } else {
        try {
          const uploadResponse = await apiUploadToS3(values.taskFile);
          if (uploadResponse?.data?.result?.secure_url) {
            fileUrl = uploadResponse.data.result.secure_url;
          }
        } catch (error) {
          message.error("Failed to upload task file");
          return;
          }
        }
      }

      // Add file URL if uploaded
      if (fileUrl) {
        formData.append("file", fileUrl);
      }
      // Forward original upload metadata if provided
      if (values.asset_id) {
        formData.append("asset_id", values.asset_id);
      }
      if (values.public_id) {
        formData.append("public_id", values.public_id);
      }
      if (values.fileName) {
        formData.append("fileName", values.fileName);
      }
      // Add all non-file fields
      formData.append("candidateId", id);
      formData.append("taskName", values.taskName);
      formData.append("taskReviewers", JSON.stringify(values.taskReviewers));
      formData.append(
        "lastDateOfSubmission",
        moment(values.lastDateOfSubmission).format("YYYY-MM-DD")
      );
      formData.append("taskDuration", values.taskDuration);
      // formData.append("description", values.description);
      console.log("form", values, formData);

      const response = await apiServices("POST", "task/create", formData, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response?.data?.success) {
        message.success("Task created successfully");
        setIsTaskModalVisible(false);
        // Optionally fetch updated task list
        if (activeTab === "tasks") {
          fetchCandidateTasks(id);
        }
      } else {
        throw new Error(response?.data?.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please login again");
        navigate("/login");
      } else if (error.response?.status === 413) {
        message.error("File size too large. Maximum size is 5MB");
      } else if (error.response?.status === 400) {
        message.error(error.response?.data?.errors[0]?.message || "Invalid input data");
      } else {
        message.error("Error creating task. Please try again");
      }
    }
  };

  const fetchCandidateTasks = async (id) => {
    setLoadingTasks(true);
    try {
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;

      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices("GET", `task/candidate/${id}`, null, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        console.log("Tasks data:", response.data.data);
        setTasks(response.data.data);
      } else {
        message.error(response?.data?.message || "Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error("Error fetching tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;

      if (!token) {
        message.error("Authentication required");
        return;
      }

      console.log("Updating task status:", { taskId, newStatus, token });

      const response = await apiServices(
        "PATCH",
        `task/${taskId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update task status response:", response);

      if (response?.data?.success) {
        message.success("Task status updated successfully");
        fetchCandidateTasks(id); // Refresh the tasks list
      } else {
        console.error("Failed to update task status:", response?.data);
        message.error(
          response?.data?.message || "Failed to update task status"
        );
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 401) {
        message.error("Unauthorized access. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        message.error("You are not authorized to update this task status");
      } else if (error.response?.status === 404) {
        message.error("Task not found");
      } else {
        message.error(
          error.response?.data?.message || "Error updating task status"
        );
      }
    }
  };

  const handleFilterChange = (changer) => {
    setfilter(changer);
  };

  const handleActiveTab = (key) => {
    setActiveTab(key);
  };

  const handleDeleteCandidate = async (candidateId) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    try {
      setLoading(true);
      const response = await apiServices(
        "DELETE",
        `candidate/${candidateId}`,
        null,
        {
          access_token: {
            accessToken: token,
          },
        }
      );
      if (response?.data?.status) {
        message.success("Candidate deleted successfully");
        navigate("/recruitment/candidates/processing");
        return Promise.resolve();
      } else {
        message.error(response?.data?.message || "Failed to delete job");
        return Promise.reject();
      }
    } catch (error) {
      console.error("Delete job error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content container-fluid">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!candidate) return null;
  const calculateAverageRating = (feedbackArray) => {
    if (!feedbackArray || feedbackArray.length === 0) {
      return 0;
    }

    const totalRatings = feedbackArray.reduce((sum, feedback) => {
      const ratings = feedback.ratings;
      const ratingSum =
        ratings.technicalSkills1 +
        ratings.behavior +
        ratings.softSkills +
        ratings.technicalSkills2 +
        ratings.technicalSkills3;
      return sum + ratingSum / 5; // Average of all skills for this feedback
    }, 0);

    return (totalRatings / feedbackArray.length).toFixed(1);
  };

  const deleteResume = async (index) => {
    const fileToDelete = resume[index];
    // Call DeleteFiles with the file to delete
    await DeleteFiles([fileToDelete], authState); // Pass user state if required

    // Remove from local state
    const updatedResume = resume.filter((_, i) => i !== index);
    setResume(updatedResume);
    if (editingIndex === index) {
      setEditingIndex(null);
      setTempName("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    console.log("U P D A T E D D E L E T E D # ", updatedResume);

    // Update backend
    try {
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;
      if (!token) {
        message.error("Authentication required");
        return;
      }
      const response = await apiServices(
        "PUT",
        `candidate/${id}`,
        { resume: updatedResume },
        {
          access_token: { accessToken: token },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.status) {
        message.success("File deleted successfully");
      } else {
        message.error(response?.data?.message || "Failed to update resume");
      }
    } catch (error) {
      message.error("Error updating resume");
    }
  };

  const toggleModal = (index) => {
    setOpenModalIndex(openModalIndex === index ? null : index);
  };

  const getPreviewIframe = (file) => {
    if (!file) return null;
    if (file.url.endsWith(".pdf")) {
      return (
        <iframe
          src={file.url}
          title={file.fileName}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      );
    } else if (
      file.fileName.endsWith(".doc") ||
      file.fileName.endsWith(".docx")
    ) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(
            file.url
          )}&embedded=true`}
          title={file.fileName}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      );
    } else {
      return (
        <div>
          <p>Preview not available for this file type.</p>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            Open in new tab
          </a>
        </div>
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Candidate Details</title>
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="content container-fluid">
        {/* Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <div className="d-flex align-items-center">
                <div>
                  <h3 className="page-title mb-0">Candidates</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/recruitment/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/recruitment/candidates/processing">
                        Candidates
                      </Link>
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
                onClick={() =>
                  navigate(
                    candidate?.status === "BLACKLISTED"
                      ? "/recruitment/candidates/blacklist"
                      : ["OFFERED", "HIRED"].includes(candidate?.status)
                      ? `/recruitment/candidates/${candidate.status.toLowerCase()}`
                      : "/recruitment/candidates/processing"
                  )
                }
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
                  <Link
                    to={
                      candidate?.status === "BLACKLISTED"
                        ? "/recruitment/candidates/blacklist"
                        : ["OFFERED", "HIRED"].includes(candidate?.status)
                        ? `/recruitment/candidates/${candidate.status.toLowerCase()}`
                        : "/recruitment/candidates/processing"
                    }
                  >
                    {["OFFERED", "HIRED", "BLACKLISTED"].includes(
                      candidate?.status
                    )
                      ? candidate.status.charAt(0) +
                        candidate.status.slice(1).toLowerCase()
                      : "Candidates"}
                  </Link>
                </li>
                <li className="breadcrumb-item active">
                  {candidate?.firstName} {candidate?.lastName}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="initial-section">
          <div className="initial-section-first-child">
            <div className="candidate-initials">
              {candidate.firstName?.[0].toUpperCase()}
              {candidate.lastName?.[0].toUpperCase()}
            </div>
            <div>
              <h3 className="ms-3 mt-2 mb-0 candidate-title">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <h5 className="ms-3 candidate-job">
                {candidate?.appliedFor.title}
              </h5>
              <div style={{ paddingLeft: "10px" }}>
                <img src={star}></img>
                <span style={{ marginLeft: "10px" }}>
                  {calculateAverageRating()}
                </span>
              </div>
            </div>
            <div>
              <Tag className="tag-styles">
                {candidate.status?.charAt(0) +
                  candidate.status?.slice(1).toLowerCase()}
              </Tag>
            </div>
          </div>
          {filter === "present" && (
            <div className=" initial-section-sec-child">
              {/* <Space> */}
              <Select
                value={candidate?.status}
                onChange={handleStatusChange}
                loading={updatingStatus}
                style={{
                  background:
                    candidate?.status?.toLowerCase() === "SHORTLISTED"
                      ? "#FFF7E6"
                      : "transparent",
                  zIndex: 1000,
                  position: "relative",
                  marginRight: viewMobile ? "3px" : "10px",
                }}
                className={`status-${candidate?.status?.toLowerCase()} customized`}
                dropdownStyle={{
                  minWidth: "120px",
                  borderRadius: "8px",
                }}
                dropdownMatchSelectWidth={false}
                popupClassName="status-dropdown"
              >
                <Select.Option value="NEW">New</Select.Option>
                <Select.Option value="SCREENING">Screening</Select.Option>
                <Select.Option value="SHORTLISTED">Shortlisted</Select.Option>
                <Select.Option value="OFFERED">Offer Sent</Select.Option>
                <Select.Option value="HIRED">Hired</Select.Option>
                <Select.Option value="REJECTED">Rejected</Select.Option>
                <Select.Option value="BLACKLISTED">Blacklisted</Select.Option>
              </Select>
              {!viewMobile &&
                (candidate?.status === "OFFERED" ||
                  candidate?.status === "REJECTED" ||
                  candidate?.status === "HIRED" ||
                  candidate?.status === "BLACKLISTED" ||
                  candidate?.status === "SHORTLISTED") && (
                  <button
                    // onClick={handleSendOfferClick}
                    onClick={() => {
                      if (candidate?.status === "SHORTLISTED") {
                        handleSendOfferClick();
                      }
                      if (candidate?.status === "OFFERED") {
                        handleSendOfferClick();
                      }
                      if (candidate?.status === "HIRED") {
                        navigate(`/recruitment/candidates/hired`);
                      }
                      if (candidate?.status === "BLACKLISTED") {
                        navigate(`/recruitment/candidates/blacklist`);
                      }
                    }}
                    style={{
                      background: "#ff9244",
                      border: "1px solid #ff9244",
                      borderRadius: "8px",
                      height: "45px",
                      width: "120px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#ffffff",
                      cursor:
                        candidate?.status === "REJECTED"
                          ? "not-allowed"
                          : "pointer",
                    }}
                    className="select-btn"
                    disabled={candidate?.status === "REJECTED"}
                  >
                    {candidate?.status === "OFFERED"
                      ? "Update Offer"
                      : candidate?.status === "REJECTED"
                      ? "Rejected"
                      : candidate?.status === "HIRED"
                      ? "View Hired"
                      : candidate?.status === "BLACKLISTED"
                      ? "Blacklisted"
                      : candidate?.status === "SHORTLISTED"
                      ? "Send Offer"
                      : null}
                  </button>
                )}
              <div className="dropdown-style">
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="edit"
                        icon={
                          <img
                            src={newEditIcon}
                            style={{ height: "20px", width: "20px" }}
                          ></img>
                        }
                        onClick={() =>
                          navigate(
                            `/recruitment/candidates/${candidate._id}/edit`
                          )
                        }
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        key="delete"
                        icon={
                          <img
                            src={DeleteIcon}
                            style={{ height: "15px", width: "20px" }}
                          ></img>
                        }
                        onClick={() => {
                          Modal.confirm({
                            title: "Delete Candidate",
                            content:
                              "Are you sure you want to delete this candidate?",
                            okText: "Yes, Delete",
                            okType: "danger",
                            cancelText: "No",
                            onOk: () => handleDeleteCandidate(candidate._id),
                          });
                        }}
                      >
                        Delete
                      </Menu.Item>
                      <Menu.Item
                        key="scheduled"
                        icon={
                          <img
                            src={newCalanderIcon}
                            style={{ height: "20px", width: "20px" }}
                          ></img>
                        }
                        onClick={handleInterviewAction}
                      >
                        {getScheduledOrRescheduledInterview()
                          ? "Reschedule Interview"
                          : "Schedule Interview"}
                      </Menu.Item>
                      <Menu.Item
                        key="blacklisted"
                        icon={
                          <img
                            src={blacklistIcon}
                            style={{ height: "20px", width: "20px" }}
                          ></img>
                        }
                        onClick={() => {
                          setSelectedStatus("BLACKLISTED");
                          setIsReasonModalVisible(true);
                        }}
                      >
                        Add to Blacklist
                      </Menu.Item>
                      {viewMobile && (
                        <Menu.Item
                          key="send"
                          icon={
                            <img
                              src={fileCheck}
                              style={{ height: "20px", width: "20px" }}
                            ></img>
                          }
                          onClick={handleSendOfferClick}
                        >
                          Send Offer
                        </Menu.Item>
                      )}
                    </Menu>
                  }
                  overlayStyle={{ paddingTop: "15px" }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div
                    style={{ cursor: "pointer", height: "25px", width: "25px" }}
                  >
                    <img src={more} alt="More Options" />
                  </div>
                </Dropdown>
              </div>
              {/* </Space> */}
            </div>
          )}
        </div>

        <div className="row">
          {/* Left Panel - Basic Information */}
          <div className="col-md-3 custom-col">
            {activeTab === "timeline" && historyId !== null && (
              <div
                className="p-3"
                style={{
                  display: "flex",
                  height: "90px",
                  marginBottom: "30px",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                <button
                  className="btn-style"
                  onClick={() => {
                    handleFilterChange("present");
                  }}
                  style={{
                    color: filter === "present" ? "#ff9244" : "#a5adb6",
                    boxShadow:
                      filter === "present"
                        ? "0px 4px 10px rgba(0, 0, 0, 0.2)"
                        : "none",
                  }}
                >
                  Present
                </button>
                <button
                  className="btn-style"
                  onClick={() => {
                    handleFilterChange("history");
                  }}
                  style={{
                    color: filter === "history" ? "#ff9244" : "#a5adb6",
                    boxShadow:
                      filter === "history"
                        ? "0px 4px 10px rgba(0, 0, 0, 0.2)"
                        : "none",
                  }}
                >
                  Old History
                </button>
              </div>
            )}
            <Card style={{ borderRadius: "8px" }}>
              <div className="info-section">
                <Title level={5} className="section-title">
                  Basic Information
                </Title>
                <div className="info-item">
                  <div className="info-items-children">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid transparent",
                        borderRadius: "50%",
                        background: "#f7f7f8",
                        height: "32px",
                        width: "32px",
                      }}
                    >
                      <img src={mail}></img>
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#56616b",
                        marginLeft: "7px",
                        display: "flex",
                        alignSelf: "center",
                      }}
                    >
                      {candidate.email}
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div style={{ display: "flex" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid transparent",
                        borderRadius: "50%",
                        background: "#f7f7f8",
                        height: "32px",
                        width: "32px",
                      }}
                    >
                      <img src={phone}></img>
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#56616b",
                        marginLeft: "7px",
                        display: "flex",
                        alignSelf: "center",
                      }}
                    >
                      {candidate.phoneNumber}
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div style={{ display: "flex" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid transparent",
                        borderRadius: "50%",
                        background: "#f7f7f8",
                        height: "32px",
                        width: "32px",
                      }}
                    >
                      <img src={location}></img>
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#56616b",
                        marginLeft: "7px",
                        display: "flex",
                        alignSelf: "center",
                      }}
                    >
                      {" "}
                      Not Specified
                    </Text>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <Title level={5} className="section-title">
                  Other Information
                </Title>
                <div className="info-list">
                  <div className="info-item">
                    <div className="info-content">
                      <Text
                        type="secondary"
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#212529",
                          width: "45%",
                        }}
                      >
                        Applied Position
                      </Text>
                      <Text
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#56616b",
                          width: "45%",
                          marginLeft: "15px",
                        }}
                      >
                        {candidate.appliedFor?.title}
                      </Text>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <Text
                        type="secondary"
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#212529",
                          width: "45%",
                        }}
                      >
                        Applied On
                      </Text>
                      <Text
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#56616b",
                          width: "45%",
                          marginLeft: "15px",
                        }}
                      >
                        {moment(candidate.appliedDate).format("DD MMM YYYY")}
                      </Text>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <Text
                        type="secondary"
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#212529",
                          width: "45%",
                        }}
                      >
                        Department
                      </Text>
                      <Text
                        strong
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#56616b",
                          width: "45%",
                          marginLeft: "15px",
                        }}
                      >
                        {candidate.appliedFor?.department || "Not specified"}
                      </Text>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <Text
                        type="secondary"
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#212529",
                          width: "45%",
                        }}
                      >
                        Job Type
                      </Text>
                      <Text
                        strong
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#56616b",
                          width: "45%",
                          marginLeft: "15px",
                        }}
                      >
                        {candidate.appliedFor?.jobType.replace("_", " ") ||
                          "Not specified"}
                      </Text>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <Text
                        type="secondary"
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#212529",
                          width: "45%",
                        }}
                      >
                        Experience
                      </Text>
                      <Text
                        strong
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#56616b",
                          width: "45%",
                          marginLeft: "15px",
                        }}
                      >
                        {candidate.experience} Years
                      </Text>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <Text
                        type="secondary"
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#212529",
                          width: "45%",
                        }}
                      >
                        Notice Period
                      </Text>
                      <Text
                        strong
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#56616b",
                          width: "45%",
                          marginLeft: "15px",
                        }}
                      >
                        {candidate.noticePeriod
                          ?.replace("_", " ")
                          .toLowerCase()}
                      </Text>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <Text
                        type="secondary"
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#212529",
                          width: "45%",
                        }}
                      >
                        Current Salary
                      </Text>
                      <Text
                        strong
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#56616b",
                          width: "45%",
                          marginLeft: "15px",
                        }}
                      >
                        {candidate.currentSalary?.toLocaleString()}
                      </Text>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <Text
                        type="secondary"
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#212529",
                          width: "45%",
                        }}
                      >
                        Expected Salary
                      </Text>
                      <Text
                        strong
                        style={{
                          marginBottom: "6px",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#56616b",
                          width: "45%",
                          marginLeft: "15px",
                        }}
                      >
                        {candidate.expectedSalary?.toLocaleString()}
                      </Text>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid #e8e8e8" }}>
                    <h3
                      style={{
                        fontSize: "16px",
                        color: "#000",
                        marginTop: "15px",
                      }}
                    >
                      SkillSet:
                    </h3>
                    <div style={{ margin: "10px 0px 10px 0px" }}>
                      {candidate?.skillSet.map((skill) => (
                        <Tag
                          style={{
                            borderRadius: "8px",
                            fontSize: "14px",
                            padding: "5px",
                          }}
                        >
                          {skill}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-md-9 custom-col-two">
            <div
              className="card p-4"
              style={{
                border: "1px solid transparent",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <div className="tab-container">
                <div
                  className="active-tab-timeline"
                  style={{
                    color: activeTab === "timeline" ? "#ff9244" : "#a5adb6",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "timeline" ? "2px solid #ff9244" : "none",
                  }}
                  key="timeline"
                  onClick={() => {
                    handleActiveTab("timeline");
                  }}
                >
                  <span className="span-timeline">
                    <img src={timeline} style={{ marginRight: "8px" }}></img>
                    Timeline
                  </span>
                </div>
                <div
                  className="active-tab-files"
                  style={{
                    color: activeTab === "files" ? "#ff9244" : "#a5adb6",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "files" ? "2px solid #ff9244" : "none",
                  }}
                  key="files"
                  onClick={() => {
                    handleActiveTab("files");
                  }}
                >
                  <span className="span-files">
                    <img src={files} style={{ marginRight: "8px" }}></img>Files
                  </span>
                </div>
                <div
                  className="active-tab-interview"
                  style={{
                    color: activeTab === "interview" ? "#ff9244" : "#a5adb6",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "interview" ? "2px solid #ff9244" : "none",
                  }}
                  key="interview"
                  onClick={() => {
                    handleActiveTab("interview");
                  }}
                >
                  <span className="span-interview">
                    <img
                      src={interviewIcon}
                      style={{ marginRight: "8px" }}
                    ></img>
                    Interview
                  </span>
                </div>
                <div
                  className="active-tab-tasks"
                  style={{
                    color: activeTab === "tasks" ? "#ff9244" : "#a5adb6",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "tasks" ? "2px solid #ff9244" : "none",
                  }}
                  key="tasks"
                  onClick={() => {
                    handleActiveTab("tasks");
                  }}
                >
                  <span className="span-tasks">
                    <img src={taskIcon} style={{ marginRight: "8px" }}></img>
                    Tasks
                  </span>
                </div>
              </div>
            </div>
            {/* Files Tab Upload File Section */}
            {activeTab === "files" && filter === "present" && (
              <div className="col-md-12 custom-col-two mb-4">
                <div
                  style={{
                    border: "1px dashed #a5adb6",
                    borderRadius: "8px",
                    width: "100%",
                    minHeight: "60px",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <Upload
                    className="full-width-upload"
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={() => {
                      return false; // Prevent AntD's default upload, handle in onChange
                    }}
                    disabled={uploadingResume}
                    onChange={async (info) => {
                      setUploadingResume(true);
                      const file = info.file;
                      let resumeData = null;
                      const isValid = validateFile(file);
                      if (!isValid) {
                        return;
                      }
                      try {
                        const uploadResult = await uploadFunction([file]);
                        console.log("Upload result:", uploadResult);

                        if (
                          Array.isArray(uploadResult) &&
                          uploadResult.length > 0 &&
                          uploadResult[0].imageUrl
                        ) {
                          resumeData = [
                            {
                              url: uploadResult[0].imageUrl,
                              fileName: uploadResult[0].fileName,
                              asset_id: uploadResult[0].asset_id,
                              public_id: uploadResult[0].public_id,
                              resource_type: uploadResult[0].resource_type,
                              uploadedAt: new Date().toISOString(),
                            },
                          ];
                          console.log(
                            "Resume uploaded successfully:",
                            resumeData
                          );
                          const newResumeList = [
                            ...(Array.isArray(resume) ? resume : []),
                            {
                              url: uploadResult[0].imageUrl,
                              fileName: uploadResult[0].fileName,
                              asset_id: uploadResult[0].asset_id,
                              public_id: uploadResult[0].public_id,
                              resource_type: uploadResult[0].resource_type,
                              uploadedAt: new Date().toISOString(),
                            },
                          ];
                          setResume(newResumeList);
                          await handleUpload(newResumeList);
                          setUploadingResume(false);
                        } else {
                          console.error("Invalid upload result:", uploadResult);
                          message.error("Failed to upload resume");
                          setUploadingResume(false);
                          return;
                        }
                      } catch (error) {
                        console.log("E R R O R : ", error);
                        message.error("Error uploading file");
                        setUploadingResume(false);
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        minHeight: "60px",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      {uploadingResume ? (
                        <span
                          style={{
                            color: "#aaa",
                            display: "flex",
                            alignItems: "center",
                            pointerEvents: "none",
                          }}
                        >
                          <Spin size="small" />
                          <span style={{ marginLeft: 8 }}>Uploading...</span>
                        </span>
                      ) : (
                      <span
                        style={{
                          color: "#aaa",
                          display: "flex",
                          alignItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <img
                          src={cloudUpload}
                          alt=""
                          style={{ height: 16, marginRight: 8 }}
                        />
                        {"Drop file here or click to upload file"}
                      </span>
                      )}
                    </div>
                  </Upload>
                </div>
              </div>
            )}
            <div
              className="card p-4"
              style={{
                border: "1px solid transparent",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Interview Tab Content */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>
                  {activeTab === "timeline"
                    ? "Timeline"
                    : activeTab === "files"
                    ? `Files (${Array.isArray(resume) ? resume.length : 0})`
                    : activeTab === "interview"
                    ? "Interview"
                    : activeTab === "tasks"
                    ? "Tasks"
                    : "null"}
                </h3>
                {activeTab === "interview" &&
                  filter === "present" &&
                  !interviews.some(
                    (interview) =>
                      interview.status === "scheduled" ||
                      interview.status === "rescheduled"
                  ) && (
                    <div>
                      <div>
                        <button
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: "450",
                            color: "#ff9244",
                          }}
                          onClick={handleCreateInterview}
                        >
                          <img
                            src={colored}
                            style={{
                              height: "16px",
                              width: "16px",
                              marginRight: "4px",
                              marginBottom: "3px",
                            }}
                          ></img>
                          Create Interview
                        </button>
                      </div>
                    </div>
                  )}
                {activeTab === "tasks" && filter === "present" && (
                  <div>
                    <div>
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: "450",
                          color: "#ff9244",
                        }}
                        onClick={handleCreateTask}
                      >
                        <img
                          src={colored}
                          style={{
                            height: "16px",
                            width: "16px",
                            marginRight: "4px",
                            marginBottom: "3px",
                          }}
                        ></img>
                        Create Task
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {activeTab === "interview" && (
                <div
                  style={{ borderTop: "2px solid #e0e3e6", marginTop: "20px" }}
                >
                  {interviews.length > 0 ? (
                    <div>
                      {interviews.map((interview) => (
                        <div
                          key={interview._id}
                          style={{
                            border: "2px solid #cfd4d8",
                            borderRadius: "8px",
                            marginTop: "20px",
                            padding: "15px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                style={{
                                  height: "40px",
                                  width: "40px",
                                  background: "#f7f7f8",
                                  borderRadius: "50%",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <img src={interviewIcon}></img>
                              </div>
                              <div style={{ marginLeft: "15px" }}>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {interview.interviewTitle ||
                                    "Untitled Interview"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "450",
                                  }}
                                >
                                  {moment(interview.interviewDate).format(
                                    "DD MMM YYYY"
                                  ) +
                                    " at " +
                                    moment(
                                      interview.interviewTime,
                                      "HH:mm"
                                    ).format("hh:mm A")}
                                </div>
                              </div>
                              <div
                                className={`status-${interview.status?.toLowerCase()}`}
                                style={{
                                  borderRadius: "70px",
                                  height: "26px",
                                  width: "90px",
                                  marginLeft: "15px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {interview.status}
                              </div>
                            </div>
                            <div
                              onClick={() => {
                                handleViewMore(interview._id);
                              }}
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <button
                                style={{
                                  border: "none",
                                  background: "transparent",
                                }}
                              >
                                {viewMore === interview._id
                                  ? "View Less"
                                  : "View Details"}
                              </button>
                            </div>
                          </div>
                          {viewMore === interview._id && (
                            <div>
                              {interview.status === "completed" ? (
                                <div>
                                  {interview?.feedback?.map(
                                    (feedback, index) => (
                                      <InterviewFeedbackDisplay
                                        key={index}
                                        feedback={feedback}
                                      />
                                    )
                                  )}
                                </div>
                              ) : (
                                <div
                                  style={{
                                    borderTop: "1px solid #eef0f1",
                                    padding: "10px",
                                    marginTop: "10px",
                                  }}
                                >
                                  <div>
                                    <h2
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      Assigners
                                    </h2>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "20px",
                                        flexWrap: "wrap",
                                        overflowX: "auto",
                                        maxWidth: "100%",
                                        paddingBottom: "10px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          minWidth: "fit-content",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <div
                                          style={{
                                            height: "32px",
                                            width: "32px",
                                          }}
                                        >
                                          <img
                                            src={
                                              interview?.interviewerId
                                                ?.imageUrl || user_icon
                                            }
                                            style={{
                                              height: "100%",
                                              width: "100%",
                                              borderRadius: "50%",
                                            }}
                                          ></img>
                                        </div>
                                        <div style={{ marginLeft: "10px" }}>
                                          <h3
                                            style={{
                                              fontSize: "14px",
                                              fontWeight: "500",
                                              marginBottom: "0",
                                            }}
                                          >
                                            {interview.interviewerId?.fullName}
                                          </h3>
                                          <p
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "450",
                                              color: "#56616b",
                                            }}
                                          >
                                            {
                                              interview.interviewerId
                                                ?.designationName
                                            }
                                          </p>
                                        </div>
                                      </div>
                                      {interview.assignedTo?.map(
                                        (interviewer) => (
                                          <div
                                            style={{
                                              display: "flex",
                                              minWidth: "fit-content",
                                              flexShrink: 0,
                                            }}
                                          >
                                            <div
                                              style={{
                                                height: "32px",
                                                width: "32px",
                                              }}
                                            >
                                              <img
                                                src={
                                                  interviewer.imageUrl ||
                                                  user_icon
                                                }
                                                style={{
                                                  height: "100%",
                                                  width: "100%",
                                                  borderRadius: "50%",
                                                }}
                                              ></img>
                                            </div>
                                            <div style={{ marginLeft: "10px" }}>
                                              <h3
                                                style={{
                                                  fontSize: "14px",
                                                  fontWeight: "500",
                                                  marginBottom: "0",
                                                }}
                                              >
                                                {interviewer.fullName}
                                              </h3>
                                              <p
                                                style={{
                                                  fontSize: "12px",
                                                  fontWeight: "450",
                                                  color: "#56616b",
                                                }}
                                              >
                                                {interviewer.designationName}
                                              </p>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h2
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      Created By
                                    </h2>
                                    <div style={{ display: "flex" }}>
                                      <div
                                        style={{
                                          height: "32px",
                                          width: "32px",
                                        }}
                                      >
                                        <img
                                          src={
                                            interview?.createdBy?.imageUrl ||
                                            user_icon
                                          }
                                          style={{
                                            height: "100%",
                                            width: "100%",
                                            borderRadius: "50%",
                                          }}
                                        ></img>
                                      </div>
                                      <div style={{ marginLeft: "10px" }}>
                                        <h3
                                          style={{
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            marginBottom: "0",
                                          }}
                                        >
                                          {interview?.createdBy?.fullName}
                                        </h3>
                                        <p
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "450",
                                            color: "#56616b",
                                          }}
                                        >
                                          {
                                            interview?.createdBy
                                              ?.designationName
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "400px",
                        width: "100%",
                        border: "2px solid #cfd4d8",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "20px",
                      }}
                    >
                      <div>
                        <img
                          src={NoInterview}
                          style={{ display: "flex", justifySelf: "center" }}
                        ></img>
                        <p>No Interview Created</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* tasks module  */}
              {activeTab === "tasks" && (
                <div>
                  {tasks.length > 0 ? (
                    <div>
                      {tasks.map((task) => (
                        <div
                          key={task._id}
                          style={{
                            border: "2px solid #cfd4d8",
                            borderRadius: "8px",
                            marginTop: "20px",
                            padding: "15px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                style={{
                                  height: "40px",
                                  width: "40px",
                                  background: "#f7f7f8",
                                  borderRadius: "50%",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <img src={files}></img>
                              </div>
                              <div style={{ marginLeft: "15px" }}>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {task.taskName || "Untitled Task"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "450",
                                  }}
                                >
                                  {moment(task.createdAt).format(
                                    "DD MMM YYYY [at] hh:mm A"
                                    )}
                                </div>
                              </div>
                              <div
                                className={`status-${task.status?.toLowerCase()}`}
                                style={{
                                  borderRadius: "70px",
                                  height: "26px",
                                  width: "90px",
                                  marginLeft: "15px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {task.status.toLowerCase()}
                              </div>
                            </div>
                            <div
                              onClick={() => {
                                handleViewMore(task._id);
                              }}
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <button
                                style={{
                                  border: "none",
                                  background: "transparent",
                                }}
                              >
                                {viewMore === task._id
                                  ? "View Less"
                                  : "View Details"}
                              </button>
                            </div>
                          </div>
                          {viewMore === task._id && (
                            <div>
                              {(task.status === "REVIEWED" || task.status === "COMPLETED" || task.status === "REJECTED") ? (
                                <div>
                                  {task.feedback?.map(
                                    (feedback, index) => (
                                      <InterviewFeedbackDisplay
                                        key={index}
                                        feedback={feedback}
                                      />
                                    )
                                  )}
                                </div>
                              ) : (
                                <div
                                  style={{
                                    borderTop: "1px solid #eef0f1",
                                    padding: "10px",
                                    marginTop: "10px",
                                  }}
                                >
                                  <div>
                                    <h2
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      Reviewers
                                    </h2>
                                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                                      {task.taskReviewers?.map((taskReviewer) => (
                                        <div style={{ display: "flex", minWidth: "fit-content", flexShrink: 0 }} key={taskReviewer._id}>
                                        <div
                                          style={{
                                            height: "32px",
                                            width: "32px",
                                          }}
                                        >
                                          <img
                                              src={taskReviewer.imageUrl || user_icon}
                                              style={{
                                                height: "100%",
                                                width: "100%",
                                                borderRadius: "50%",
                                              }}
                                            ></img>
                                          </div>
                                          <div style={{ marginLeft: "10px" }}>
                                            <h3
                                              style={{
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                marginBottom: "0",
                                              }}
                                            >
                                              {taskReviewer.fullName}
                                            </h3>
                                            <p
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: "450",
                                                color: "#56616b",
                                              }}
                                            >
                                              {taskReviewer.designationId?.designationName}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h2
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        marginTop: "10px",
                                      }}
                                    >
                                      Created By
                                    </h2>
                                    <div style={{ display: "flex" }}>
                                      <div
                                        style={{
                                          height: "32px",
                                          width: "32px",
                                        }}
                                      >
                                        <img
                                          src={task?.createdBy?.imageUrl || user_icon}
                                          style={{
                                            height: "100%",
                                            width: "100%",
                                            borderRadius: "50%",
                                          }}
                                        ></img>
                                      </div>
                                      <div style={{ marginLeft: "10px" }}>
                                        <h3
                                          style={{
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            marginBottom: "0",
                                          }}
                                        >
                                          {task?.createdBy?.fullName}
                                        </h3>
                                        <p
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "450",
                                            color: "#56616b",
                                          }}
                                        >
                                          {task?.createdBy?.designationId?.designationName}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "400px",
                        width: "100%",
                        border: "2px solid #cfd4d8",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "20px",
                      }}
                    >
                      <div>
                        <img
                          src={NoInterview}
                          style={{ display: "flex", justifySelf: "center" }}
                        ></img>
                        <p>No Task Created</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Timeline Tab Content */}
              {activeTab === "timeline" && (
                <div className="mt-2">
                  {/* Map over candidate.timeline here */}
                  {candidate?.timeline && candidate.timeline.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {candidate.timeline.map((event, idx) => {
                        // Status event
                        if (event.status && event.updatedAt) {
                          return (
                            <div
                              key={event._id || idx}
                              style={{
                                background: "#f5f5f5",
                                borderRadius: "10px",
                                padding: "16px 20px",
                                marginBottom: "16px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: 500,
                                    color: "#222",
                                  }}
                                >
                                  {`${candidate.firstName} is ${
                                    event.status.charAt(0) +
                                    event.status.slice(1).toLowerCase()
                                  }`}
                                </div>
                                <div
                                  style={{ fontSize: "14px", color: "#666" }}
                                >
                                  {moment(event.updatedAt).format(
                                    "Do MMM [at] h:mm a"
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        // Interview event
                        if (event.InterviewCreator && event.createdAt) {
                          return (
                            <div
                              key={event._id || idx}
                              style={{
                                background: "#f5f5f5",
                                borderRadius: "10px",
                                padding: "16px 20px",
                                marginBottom: "16px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{ fontSize: "15px", fontWeight: 500 }}
                                >
                                  <span
                                    style={{
                                      color: "#1890ff",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Interview
                                  </span>
                                  <span
                                    style={{ color: "#222", fontWeight: 400 }}
                                  >
                                    {" "}
                                    scheduled by {event.InterviewCreator}
                                  </span>
                                </div>
                                <div
                                  style={{ fontSize: "14px", color: "#666" }}
                                >
                                  {moment(event.createdAt).format(
                                    "Do MMM [at] h:mm a"
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        // Unknown event type (optional: skip or show fallback)
                        return null;
                      })}
                    </div>
                  ) : null}
                  {/* {filteredInterviews.length > 0
                  ? filteredInterviews.map((interview) => (
                      <div
                        className="p-3 mt-3"
                        style={{
                          background: "#f7f7f8",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#000000",
                          }}
                        >
                          {`${interview.interviewTitle} is scheduled with ${interview.createdBy.fullName}`}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "450",
                            color: "#495057",
                          }}
                        >
                          {moment(interview.interviewDate).format("DD MMM") +
                            " at " +
                            moment(interview.interviewTime, "HH:mm").format(
                              "hh:mm A"
                            )}
                        </div>
                      </div>
                    ))
                  : ""} */}
                </div>
              )}
              {activeTab === "files" && (
                <div className="mt-2">
                  {!previewFile ? (
                    Array.isArray(resume) &&
                    resume.map((file, index) => (
                      <div
                        className="p-3"
                        style={{
                          background: "#f7f7f8",
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "8px",
                        }}
                        key={index}
                      >
                        {editingIndex === index ? (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <input
                              style={{
                                border: "1px solid #a5adb6",
                                borderRadius: "8px",
                                height: "28px",
                                paddingLeft: "8px",
                                width: "auto",
                              }}
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onBlur={() => saveRename(index)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && saveRename(index)
                              }
                            />
                            <span style={{ marginLeft: 4, color: "#888" }}>
                              {splitFileName(file.fileName).ext}
                            </span>
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#000000",
                              cursor: "pointer",
                            }}
                            onClick={() => setPreviewFile(file)}
                          >
                            {file.fileName}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "15px" }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "450",
                              color: "#495057",
                              paddingTop: "5px",
                            }}
                          >
                            {moment(file?.uploadedAt).format("DD MMM YYYY") +
                              " at " +
                              moment(file?.uploadedAt).format("HH:mm A")}
                          </div>
                          <div
                            style={{
                              marginRight: "10px",
                              cursor: "pointer",
                              position: "relative",
                            }}
                            onClick={() => {
                              toggleModal(index);
                            }}
                          >
                            <img src={more}></img>
                            {openModalIndex === index && (
                              <div
                                ref={dropdownRef}
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  right: "10%",
                                  background: "white",
                                  border: "1px solid #ddd",
                                  borderRadius: "5px",
                                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                  padding: "5px",
                                  display: "flex",
                                  flexDirection: "column",
                                  marginTop: "10px",
                                  width: "120px",
                                  zIndex: 1,
                                }}
                              >
                                <div
                                  style={{
                                    background: "none",
                                    border: "none",
                                    marginTop: "7px",
                                    marginBottom: "7px",
                                    cursor: "pointer",
                                    width: "100%",
                                    display: "flex",
                                  }}
                                  onClick={() => {
                                    startEditing(index, file.fileName);
                                  }}
                                >
                                  <div
                                    style={{ width: "30%", paddingLeft: "7px" }}
                                  >
                                    <img src={EditIcon}></img>
                                  </div>
                                  <div
                                    style={{ width: "70%", paddingTop: "3px" }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#56616b",
                                      }}
                                    >
                                      Rename
                                    </span>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    background: "none",
                                    border: "none",
                                    marginTop: "10px",
                                    cursor: "pointer",
                                    width: "100%",
                                    display: "flex",
                                  }}
                                  onClick={() => {
                                    Modal.confirm({
                                      title: "Delete File",
                                      content:
                                        "Are you sure you want to delete this file?",
                                      okText: "Yes, Delete",
                                      okType: "danger",
                                      cancelText: "No",
                                      onOk: () => deleteResume(index),
                                    });
                                  }}
                                >
                                  <div
                                    style={{ width: "30%", paddingLeft: "7px" }}
                                  >
                                    <img src={DeleteIcon}></img>
                                  </div>
                                  <div
                                    style={{ width: "70%", paddingTop: "3px" }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#56616b",
                                      }}
                                    >
                                      Delete
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          position: "relative",
                          width: "100%",
                          minHeight: 40,
                        }}
                      >
                        <Button
                          icon={<FontAwesomeIcon icon={faArrowLeft} />}
                          onClick={() => setPreviewFile(null)}
                          type="text"
                          style={{
                            boxShadow: "none",
                            background: "none",
                            border: "none",
                            marginRight: 16,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 500,
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap",
                            pointerEvents: "none", // so clicks go through to buttons if overlapped
                          }}
                        >
                          {previewFile.fileName}
                        </span>
                        <Button
                          icon={<FontAwesomeIcon icon={faDownload} />}
                          type="text"
                          style={{
                            boxShadow: "none",
                            background: "none",
                            border: "none",
                            marginLeft: "auto",
                          }}
                          onClick={async () => {
                            try {
                              const response = await fetch(previewFile.url, {
                                mode: "cors",
                              });
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = previewFile.fileName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (e) {
                              window.open(previewFile.url, "_blank");
                            }
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "70vh",
                          background: "#fff",
                        }}
                      >
                        {getPreviewIframe(previewFile)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* <div className="col-md-9 custom-col-two">
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="nav-tabs-custom"
            >
              <TabPane tab="Timeline" key="timeline">
                <div className="timeline-content">

                  <div className="timeline-item">
                    <div className="time">
                      {moment(candidate.appliedDate).format("DD MMM YYYY")}
                    </div>
                    <div className="event">
                      <Tag color="blue">Application Received</Tag>
                      <Text>
                        Candidate applied for {candidate.appliedFor?.title}
                      </Text>
                    </div>
                  </div>


                  {interviews.map((interview) => (
                    <div key={interview._id} className="timeline-item">
                      <div className="time">
                        {moment(interview.createdAt).format("DD MMM")}
                      </div>
                      <div className="event">
                        <Tag color="green">Interview Scheduled</Tag>
                        <Text>
                          Interview scheduled with {interview.interviewName} for{" "}
                          {moment(interview.interviewDate).format(
                            "DD MMM YYYY"
                          )}{" "}
                          at {interview.interviewTime}
                          {interview.interviewType === "ONLINE"
                            ? " (Online)"
                            : " (In Person)"}
                        </Text>
                      </div>
                      {interview.status !== "scheduled" && (
                        <div className="event" style={{ marginTop: "8px" }}>
                          <Tag
                            color={
                              interview.status === "completed"
                                ? "green"
                                : interview.status === "cancelled"
                                ? "red"
                                : interview.status === "rescheduled"
                                ? "orange"
                                : "blue"
                            }
                          >
                            {interview.status.charAt(0).toUpperCase() +
                              interview.status.slice(1)}
                          </Tag>
                          <Text>Interview {interview.status}</Text>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabPane>
              <TabPane tab="Files" key="files">
                {renderFilesContent()}
              </TabPane>
              <TabPane tab="Interview" key="interview">
                {renderInterviewContent()}
              </TabPane>
              <TabPane tab="Tasks" key="tasks">
                {renderTaskContent()}
              </TabPane>
            </Tabs>
          </Card>
        </div> */}
        </div>

        {/* Replace the old Modal with the new CreateInterviewModal component */}
        <CreateInterviewModal
          isVisible={isInterviewModalVisible}
          onCancel={handleInterviewModalCancel}
          onSubmit={handleInterviewSubmit}
          candidate={candidate}
          authState={authState}
          editingInterview={editingInterview}
        />

        {/* Add CreateTaskModal */}
        <CreateTaskModal
          isVisible={isTaskModalVisible}
          onCancel={handleTaskModalCancel}
          onSubmit={handleTaskSubmit}
          candidate={candidate}
          authState={authState}
        />

        {/* Send Offer Modal */}
        <SendOfferModal
          visible={isOfferModalVisible}
          onCancel={() => setIsOfferModalVisible(false)}
          onSubmit={handleSendOffer}
          loading={submittingOffer}
          candidate={candidate}
          offerStatus={offerStatus}
          existingOffer={offer} // Pass the offer data here
        />

        {/* Status Change Reason Modal */}
        <Modal
          title="Blacklist Reason"
          visible={isReasonModalVisible}
          onCancel={() => {
            setIsReasonModalVisible(false);
            setSelectedStatus(null);
          }}
          footer={null}
          className="custom-modal"
        >
          <Form onFinish={handleReasonSubmit} layout="vertical">
            <Form.Item
              name="blacklistReason"
              label="Reason for Blacklisting"
              rules={[
                {
                  required: true,
                  message:
                    "Please provide a reason for blacklisting the candidate",
                },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Enter the reason for blacklisting the candidate"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item className="text-end pb-3 mt-2">
              <Button
                style={{
                  marginRight: 12,
                  padding: "6px 24px",
                  height: "40px",
                  borderRadius: "20px",
                  background: "#F8F9FA",
                  border: "none",
                }}
                onClick={() => {
                  setIsReasonModalVisible(false);
                  setSelectedStatus(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updatingStatus}
                style={{
                  padding: "6px 24px",
                  height: "40px",
                  borderRadius: "20px",
                  background: "#F4A261",
                  border: "none",
                }}
              >
                Submit
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

        /* Ensure non-Select badges also get styled */
        .status-pending {
          background-color: #fff7e6 !important;
          border: 1px solid #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-submitted .ant-select-selector {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-submitted {
          background-color: #e6f7ff !important;
          border: 1px solid #91d5ff !important;
          color: #1890ff !important;
        }

        .status-completed .ant-select-selector {
          background-color: #f6ffed !important;
          border-color: #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-completed {
          background-color: #f6ffed !important;
          border: 1px solid #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-cancelled .ant-select-selector {
          background-color: #fff1f0 !important;
          border-color: #ffa39e !important;
          color: #f5222d !important;
        }

        .status-cancelled {
          background-color: #fff1f0 !important;
          border: 1px solid #ffa39e !important;
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



        .tab-container{
          display: flex;
          gap: 30px;
          justify-content: flex-start;
          flex-wrap: wrap;
          width: 100%;
        }

        .active-tab-timeline{
          padding: 0 10px 10px 0px ;
          font-size: 16px; 
          font-weight: 500;
        }
        .active-tab-files{
          padding: 0 10px 10px 0px ;
          font-size: 16px; 
          font-weight: 500;
          color: activeTab === 'files' ? #ff9244 : #a5adb6;
          cursor: pointer;
          border-bottom: activeTab === 'files' ? 2px solid #ff9244: none;
        }
        .active-tab-interview{
          padding: 0 10px 10px 0px ;
          font-size: 16px; 
          font-weight: 500;
          color: activeTab === 'interview' ?  #ff9244  : #a5adb6;
          cursor: pointer;
          border-bottom: activeTab === 'interview' ?  2px solid #ff9244 : none;
        }

        .active-tab-tasks{
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
          border: 1px solid #ff9244;
          border-radius: 8px;
          background: #ff9244;
          z-index: 1000;
          position: relative;
          height: 45px;
          width: 120px;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
        }



        .custom-modal .ant-modal-content{
          border: 1px solid transparent;
          border-radius: 10px;
        }
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0px 24px;
          border-radius: 10px;
        }
        .custom-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
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
        .custom-modal .ant-form-item-label > label {
          font-weight: 500;
        }
        .custom-modal .ant-input{
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 16px;
          font-weight: 450;
        }

        .tag-styles{
          margin-left: 10px;
          border-radius: 70px;
          margin-bottom: 12px;
        }

        .initial-section-sec-child{
          display: flex;
          float : end;
          margin-right: 12px 
        }

        .candidate-initials{
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
          font-weight:500;
        }

        .candidate-title{
          font-size: 20px;
          font-weight:500;
          color: #000000; 
        }

        .candidate-job{
          font-size:'14px';
          font-weight:450; 
          color:#444444;
        }


      .customized .ant-select-selector{
        height: 45px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 450;
      }

      .full-width-upload {
        display: block !important;
        width: 100% !important;
      }

      .ant-upload.ant-upload-select.ant-upload-select-text {
        display: block !important;
        width: 100% !important;
      }

      .initial-section{
       height: 130px;
        background: #ffffff;
        border: 1px solid transparent; 
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .initial-section-first-child{
        display: flex;
        align-items: center ;
      }

      .dropdown-style{
        margin-left: 13px; 
        display: flex;
        align-items: center;
      }

      @media (min-width: 768px) and (max-width: 1445px) {
        .custom-col {
          flex: 0 0 43%;  
          max-width: 43%;
        }
      }

      @media (min-width: 768px) and (max-width: 1445px) {
        .custom-col-two {
          flex: 0 0 57%;  
          max-width: 100%;
        }
      }

      @media (min-width: 768px) and (max-width: 1305px) {
          .tab-container{
            gap: 25%;
          };
        }

        @media (min-width: 440px) and (max-width: 736px) {
          .tab-container{
            gap: 30%;
          };
        }

        @media (min-width: 330px) and (max-width: 384px) {
          .tab-container{
            gap: 45%;
          };
        }

        @media (max-width: 768px) {
          select-btn{
            display: none !important;
          }
        }

      @media (max-width: 667px) {
        .tag-styles{
          display: none !important
        }
      }

      @media (max-width: 667px) {
        .dropdown-style{
          margin-left: 3px !important
        }
      }
      @media (max-width: 667px) {
        .customized .ant-select-selector{
          font-size: 12px;
          width: 95px !important;
          padding-left: 6px !important;
          padding-right: 5px !important;
;        }
      }

      @media (max-width: 450px) {
        .candidate-initials{
          margin-left: 5px !important;
        }
      }

      @media (max-width: 450px) {
        .initial-section-sec-child{
          margin-right: 5px !important; 
        }
      }
      `}</style>
      </div>
    </>
  );
};

export default CandidateDetails;
