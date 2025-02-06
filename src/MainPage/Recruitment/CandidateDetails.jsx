import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Spin,
  message,
  Tag,
  Typography,
  Tabs,
  Select,
  Space,
  Avatar,
  Tooltip,
  Rate,
  Collapse,
  Empty,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  EyeOutlined,
  DownloadOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import moment from "moment";
import CreateInterviewModal from "./CreateInterviewModal";
import CreateTaskModal from "./CreateTaskModal";
import SendOfferModal from './SendOfferModal';
import { apiUploadToS3 } from "../../Services/uploadImage";
import backBtn from '../../assets/iconsRecruitment/arrow-left.svg';
import more from '../../assets/iconsRecruitment/vertical.svg';
import mail from '../../assets/iconsRecruitment/mail.svg';
import phone from '../../assets/iconsRecruitment/phone.svg';
import location from '../../assets/iconsRecruitment/location.svg';
import timeline from '../../assets/iconsRecruitment/Timeline.svg';
import files from '../../assets/iconsRecruitment/description.svg';
import interviewIcon from '../../assets/iconsRecruitment/interview.svg';
import star from '../../assets/iconsRecruitment/star.svg';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const authState = useSelector((state) => state.user.loginvalue);
  const [isInterviewModalVisible, setIsInterviewModalVisible] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offer, setOffer] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [filter ,setfilter] =useState('history');

  useEffect(() => {
    console.log('isOfferModalVisible changed:', isOfferModalVisible);
  }, [isOfferModalVisible]);

  useEffect(() => {
    fetchCandidateDetails();
    // Initialize Bootstrap dropdowns
    if (typeof window !== "undefined") {
      require("bootstrap/js/dist/dropdown");
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "interview") {
      fetchCandidateInterviews();
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (id && activeTab === "tasks") {
      fetchCandidateTasks();
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (id) {
      fetchOfferDetails();
    }
  }, [id]);

  const fetchCandidateDetails = async () => {
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

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FilePdfOutlined />;
    const extension = fileUrl.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return (
          <FilePdfOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
        );
      case "doc":
      case "docx":
        return (
          <FileWordOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
        );
      default:
        return (
          <FilePdfOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
        );
    }
  };

  const getFileName = (fileUrl) => {
    if (!fileUrl) return "Resume";
    const parts = fileUrl.split("/");
    return parts[parts.length - 1];
  };

  const handlePreviewResume = () => {
    if (!candidate?.resume) {
      message.error("No resume available for preview");
      return;
    }

    // Open resume in new tab
    window.open(candidate.resume, "_blank");
  };

  const handleDownloadResume = async () => {
    if (!candidate?.resume) {
      message.error("No resume available for download");
      return;
    }

    try {
      const response = await fetch(candidate.resume);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName(candidate.resume);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      message.error("Failed to download resume");
    }
  };

  // Helper function to check if resume URL is valid
  const isValidResumeUrl = (resume) => {
    console.log("Checking resume URL:", resume);
    // Check if resume exists and is not empty
    return Boolean(resume && resume.length > 0);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'BLACKLISTED') {
      // Show modal to get blacklist reason
      setSelectedStatus(newStatus);
      setIsReasonModalVisible(true);
      return;
    }

    try {
      setUpdatingStatus(true);
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        'PATCH',
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
        message.success('Status updated successfully');
        await fetchCandidateDetails();
      } else {
        throw new Error(response?.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReasonSubmit = async (values) => {
    try {
      setUpdatingStatus(true);
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error("Authentication required");
        return;
      }

      const payload = {
        status: selectedStatus,
        reason: values.reason || values.blacklistReason, // Use reason or blacklistReason as the general reason
      };

      // Add specific reason field based on status
      if (selectedStatus === 'BLACKLISTED') {
        payload.blacklistReason = values.blacklistReason;
      }

      const response = await apiServices(
        'PATCH',
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
        message.success('Status updated successfully');
        setIsReasonModalVisible(false);
        await fetchCandidateDetails();
      } else {
        throw new Error(response?.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchOfferDetails = async () => {
    try {
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) return;

      const response = await apiServices(
        'GET',
        `candidate/${id}/offer`,
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

      if (response?.data?.status) {
        setOffer(response.data.data);
      }
    } catch (error) {
      // Silently handle 404 - it's an expected case when no offer exists
      if (error.response?.status === 404) {
        setOffer(null);
        return;
      }
      console.error('Error fetching offer details:', error);
    }
  };

  const handleSendOffer = async (formData) => {
    try {
      setSubmittingOffer(true);
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error("Authentication required");
        return;
      }

      // First upload the contract file
      const contractFile = formData.get('contract');
      if (contractFile) {
        try {
          const uploadResponse = await apiUploadToS3(contractFile);
          if (uploadResponse?.data?.result?.secure_url) {
            // Replace the file with the secure URL in the formData
            formData.delete('contract');
            formData.append('contract', uploadResponse.data.result.secure_url);
          }
        } catch (error) {
          console.error('Error uploading contract:', error);
          message.error('Failed to upload contract file');
          return;
        }
      }

      // Add flag to indicate this is an offer update if an offer exists
      if (offer) {
        formData.append('isUpdate', 'true');
      }

      const response = await apiServices(
        'POST',
        'candidate/send-offer',
        formData,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response?.data?.status) {
        message.success(offer ? 'Offer updated successfully' : 'Offer sent successfully');
        setIsOfferModalVisible(false);
        
        // Always update candidate status to "OFFERED" and clear any previous status/reasons
        await handleStatusChange('OFFERED');
        
        // Fetch updated offer details
        await fetchOfferDetails();
        
        // Fetch updated candidate details to refresh the page
        await fetchCandidateDetails();
        
        // Redirect to offered candidates list
        navigate('/recruitment/candidates/offered');
      } else {
        throw new Error(response?.data?.message || 'Failed to send offer');
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      message.error(error.message || 'Error sending offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleUpdateOfferStatus = async (offerId, status) => {
    try {
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        'PATCH',
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
        message.success('Offer status updated successfully');
        await fetchOfferDetails();
      } else {
        throw new Error(response?.data?.message || 'Failed to update offer status');
      }
    } catch (error) {
      console.error('Error updating offer status:', error);
      message.error(error.message || 'Error updating offer status');
    }
  };

  const handleSendOfferClick = () => {
    console.log('Send Offer button clicked');
    setIsOfferModalVisible(true);
  };

  const handleContractUpload = ({ file }) => {
    if (file.status === 'done') {
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

  const handleInterviewModalCancel = () => {
    setIsInterviewModalVisible(false);
  };

  const handleInterviewSubmit = async (values) => {
    try {
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;

      if (!token) {
        message.error("Authentication required");
        return;
      }

      // Validate meeting link for online interviews
      if (values.interviewType === "ONLINE" && !values.meetingLink) {
        message.error("Meeting link is required for online interviews");
        return;
      }

      const formattedDate = moment(values.interviewDate).format("YYYY-MM-DD");
      const formattedTime = moment(values.interviewTime).format("HH:mm");

      const payload = {
        candidateId: id,
        interviewerId: values.assignedTo, // ID of the employee selected in interviewer dropdown
        interviewTitle: values.interviewTitle, // Value from interview title dropdown (Initial Interview, etc)
        interviewType: values.interviewType, // "ONLINE" or "IN_PERSON"
        assignTo: values.assignTo, // Array of additional interviewer IDs
        interviewDate: formattedDate, // YYYY-MM-DD
        interviewTime: formattedTime, // HH:mm
        meetingLink: values.meetingLink || "", // Required for ONLINE interviews
      };

      console.log("Interview payload:", payload); // For debugging

      const response = await apiServices("POST", "interview/create", payload, {
        access_token: {
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        message.success("Interview scheduled successfully");
        fetchCandidateInterviews();
        handleInterviewModalCancel(); // Close the modal on success
      } else {
        throw new Error(
          response?.data?.message || "Failed to schedule interview"
        );
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      // Handle validation errors specifically
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join("\n");
        message.error(errorMessages);
      } else {
        message.error(
          error?.response?.data?.message ||
            error?.message ||
            "Error scheduling interview"
        );
      }
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
        fetchCandidateInterviews(); // Refresh the interviews list
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

  const fetchCandidateInterviews = async () => {
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
      // Create FormData for file upload
      const formData = new FormData();

      // Add task file if exists
      if (values.taskFile?.length > 0) {
        formData.append("file", values.taskFile[0].originFileObj);
      }

      // Add all non-file fields
      formData.append("candidateId", id);
      formData.append("taskName", values.taskName);
      formData.append("taskReviewers", JSON.stringify(values.taskReviewer));
      formData.append(
        "lastDateOfSubmission",
        moment(values.lastDateOfSubmission).format("YYYY-MM-DD")
      );
      formData.append("taskDuration", values.taskDuration);
      formData.append("description", values.description);

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
          fetchCandidateTasks();
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
        message.error(error.response?.data?.message || "Invalid input data");
      } else {
        message.error("Error creating task. Please try again");
      }
    }
  };

  const fetchCandidateTasks = async () => {
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

  const renderInterviewContent = () => {
    if (loadingInterviews) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      );
    }

    return (
      <div className="interview-content">
        <div style={{ position: "absolute", top: "16px", right: "24px" }}>
          <Button
            type="text"
            style={{ color: "#ff9b44" }}
            icon={<CalendarOutlined />}
            onClick={handleCreateInterview}
          >
            Create Interview
          </Button>
        </div>

        <div style={{ marginTop: "60px" }}>
          {interviews.length > 0 ? (
            <div>
              {interviews.map((interview) => (
                <Card
                  key={interview._id}
                  style={{ marginBottom: "16px" }}
                  className="interview-card"
                >
                  <Row gutter={16}>
                    <Col span={16}>
                      <h4 className="interview-title">
                        {interview.interviewTitle || "Untitled Interview"}
                      </h4>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div>
                          <Text type="secondary">Interview With:</Text>{" "}
                          <Text strong>
                            {interview.interviewerId?.fullName}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary">Date & Time:</Text>{" "}
                          <Text>
                            {moment(interview.interviewDate).format(
                              "DD MMM YYYY"
                            )}{" "}
                            at {interview.interviewTime}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary">Type:</Text>{" "}
                          <Text>
                            {interview.interviewType === "ONLINE"
                              ? "Online"
                              : "In Person"}
                          </Text>
                        </div>
                        {interview.interviewType === "ONLINE" &&
                          interview.interviewLink && (
                            <div>
                              <Text type="secondary">Meeting Link:</Text>{" "}
                              <Button
                                type="link"
                                href={interview.interviewLink}
                                target="_blank"
                                style={{ padding: 0 }}
                              >
                                Join Meeting
                              </Button>
                            </div>
                          )}
                      </Space>
                    </Col>
                    <Col span={8} style={{ textAlign: "right" }}>
                      <Select
                        value={interview.status}
                        style={{ width: 120 }}
                        onChange={(value) =>
                          updateInterviewStatus(interview._id, value)
                        }
                        className={`status-${interview.status?.toLowerCase()}`}
                      >
                        <Select.Option value="scheduled">
                          Scheduled
                        </Select.Option>
                        <Select.Option value="completed">
                          Completed
                        </Select.Option>
                        <Select.Option value="cancelled">
                          Cancelled
                        </Select.Option>
                        <Select.Option value="rescheduled">
                          Rescheduled
                        </Select.Option>
                      </Select>
                    </Col>
                  </Row>

                  {/* Additional Interviewers */}
                  {interview.assignedTo?.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <Text type="secondary">Additional Interviewers:</Text>
                      <div style={{ marginTop: "8px" }}>
                        <Avatar.Group maxCount={3}>
                          {interview.assignedTo?.map((interviewer) => (
                            <Tooltip
                              key={interviewer._id}
                              title={interviewer.fullName}
                            >
                              <Avatar src={interviewer.imageUrl}>
                                {interviewer.fullName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                      </div>
                    </div>
                  )}

                  {/* Latest Feedback Section */}
                  {interview.latestFeedback && (
                    <div
                      style={{
                        marginTop: "16px",
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: "16px",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <Text strong>Latest Feedback</Text>
                        <Tag
                          color={
                            interview.latestFeedback.recommendation ===
                            "Strong Yes"
                              ? "green"
                              : interview.latestFeedback.recommendation ===
                                "Yes"
                              ? "cyan"
                              : interview.latestFeedback.recommendation === "No"
                              ? "orange"
                              : "red"
                          }
                        >
                          {interview.latestFeedback.recommendation}
                        </Tag>
                      </div>
                      <Card size="small">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <Avatar
                            src={interview.latestFeedback.submittedBy?.imageUrl}
                            style={{ marginRight: "8px" }}
                          >
                            {interview.latestFeedback.submittedBy?.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </Avatar>
                          <div>
                            <Text strong>
                              {interview.latestFeedback.submittedBy?.fullName}
                            </Text>
                            <br />
                            <Text type="secondary">
                              {moment(
                                interview.latestFeedback.createdAt
                              ).format("DD MMM YYYY")}
                            </Text>
                          </div>
                        </div>
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Text type="secondary">
                              Technical Skills (Programming):
                            </Text>
                            <div>
                              <Rate
                                disabled
                                defaultValue={
                                  interview.latestFeedback.ratings
                                    .technicalSkills1
                                }
                              />
                            </div>
                          </Col>
                          <Col span={8}>
                            <Text type="secondary">
                              Technical Skills (System Design):
                            </Text>
                            <div>
                              <Rate
                                disabled
                                defaultValue={
                                  interview.latestFeedback.ratings
                                    .technicalSkills2
                                }
                              />
                            </div>
                          </Col>
                          <Col span={8}>
                            <Text type="secondary">
                              Technical Skills (Problem Solving):
                            </Text>
                            <div>
                              <Rate
                                disabled
                                defaultValue={
                                  interview.latestFeedback.ratings
                                    .technicalSkills3
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row gutter={[16, 16]} style={{ marginTop: "8px" }}>
                          <Col span={8}>
                            <Text type="secondary">Behavior:</Text>
                            <div>
                              <Rate
                                disabled
                                defaultValue={
                                  interview.latestFeedback.ratings.behavior
                                }
                              />
                            </div>
                          </Col>
                          <Col span={8}>
                            <Text type="secondary">Soft Skills:</Text>
                            <div>
                              <Rate
                                disabled
                                defaultValue={
                                  interview.latestFeedback.ratings.softSkills
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </div>
                  )}

                  {/* All Feedback Section */}
                  {interview.feedback && interview.feedback.length > 1 && (
                    <div style={{ marginTop: "16px" }}>
                      <Collapse ghost>
                        <Collapse.Panel
                          header={`View All Feedback (${interview.feedback.length})`}
                          key="1"
                        >
                          {interview.feedback
                            .slice(1)
                            .map((feedback, index) => (
                              <Card
                                key={index}
                                size="small"
                                style={{ marginTop: "8px" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <Avatar
                                    src={feedback.submittedBy?.imageUrl}
                                    style={{ marginRight: "8px" }}
                                  >
                                    {feedback.submittedBy?.fullName
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </Avatar>
                                  <div>
                                    <Text strong>
                                      {feedback.submittedBy?.fullName}
                                    </Text>
                                    <br />
                                    <Text type="secondary">
                                      {moment(feedback.createdAt).format(
                                        "DD MMM YYYY"
                                      )}
                                    </Text>
                                  </div>
                                  <Tag
                                    color={
                                      feedback.recommendation === "Strong Yes"
                                        ? "green"
                                        : feedback.recommendation === "Yes"
                                        ? "cyan"
                                        : feedback.recommendation === "No"
                                        ? "orange"
                                        : "red"
                                    }
                                    style={{ marginLeft: "auto" }}
                                  >
                                    {feedback.recommendation}
                                  </Tag>
                                </div>
                                <Row gutter={[16, 16]}>
                                  <Col span={8}>
                                    <Text type="secondary">
                                      Technical Skills (Programming):
                                    </Text>
                                    <div>
                                      <Rate
                                        disabled
                                        defaultValue={
                                          feedback.ratings.technicalSkills1
                                        }
                                      />
                                    </div>
                                  </Col>
                                  <Col span={8}>
                                    <Text type="secondary">
                                      Technical Skills (System Design):
                                    </Text>
                                    <div>
                                      <Rate
                                        disabled
                                        defaultValue={
                                          feedback.ratings.technicalSkills2
                                        }
                                      />
                                    </div>
                                  </Col>
                                  <Col span={8}>
                                    <Text type="secondary">
                                      Technical Skills (Problem Solving):
                                    </Text>
                                    <div>
                                      <Rate
                                        disabled
                                        defaultValue={
                                          feedback.ratings.technicalSkills3
                                        }
                                      />
                                    </div>
                                  </Col>
                                </Row>
                                <Row
                                  gutter={[16, 16]}
                                  style={{ marginTop: "8px" }}
                                >
                                  <Col span={8}>
                                    <Text type="secondary">Behavior:</Text>
                                    <div>
                                      <Rate
                                        disabled
                                        defaultValue={feedback.ratings.behavior}
                                      />
                                    </div>
                                  </Col>
                                  <Col span={8}>
                                    <Text type="secondary">Soft Skills:</Text>
                                    <div>
                                      <Rate
                                        disabled
                                        defaultValue={
                                          feedback.ratings.softSkills
                                        }
                                      />
                                    </div>
                                  </Col>
                                </Row>
                              </Card>
                            ))}
                        </Collapse.Panel>
                      </Collapse>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Text type="secondary">No interviews scheduled</Text>
            </div>
          )}
        </div>
      </div>
    );
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
        fetchCandidateTasks(); // Refresh the tasks list
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

  const today = moment().format('DD MM');
  const filteredInterviews = interviews.filter((interview)=>{
    const interviewDate = moment(interview.interviewDate).format('DD MMM');
    return filter=== 'present' ? interviewDate === today : interviewDate < today;
  })
  const handleFilterChange =(changer)=>{
    setfilter(changer);
    console.log(filteredInterviews);
  }

  const handleActiveTab =(key)=>{
    setActiveTab(key);
  }

  const renderTaskContent = () => {
    if (loadingTasks) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      );
    }

    return (
      <div className="task-content">
        <div style={{ position: "absolute", top: "16px", right: "24px" }}>
          <Button
            type="text"
            style={{ color: "#ff9b44" }}
            icon={<PlusOutlined />}
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        </div>

        <div style={{ marginTop: "60px" }}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Card
                key={task._id}
                style={{ marginBottom: "16px" }}
                className="task-card"
                onClick={() => navigate(`/recruitment/tasks/${task._id}`)}
              >
                <Row gutter={16}>
                  <Col span={16}>
                    <h4 className="task-title">{task.taskName}</h4>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      <div>
                        <Text type="secondary">Task Reviewers:</Text>{" "}
                        <Avatar.Group maxCount={3}>
                          {task.taskReviewers?.map((reviewer) => (
                            <Tooltip key={reviewer._id} title={reviewer.fullName}>
                              <Avatar src={reviewer.imageUrl}>
                                {reviewer.fullName?.split(" ").map((n) => n[0]).join("")}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                      </div>
                      <div>
                        <Text type="secondary">Due Date:</Text>{" "}
                        <Text>{moment(task.lastDateOfSubmission).format("DD MMM YYYY")}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Duration:</Text>{" "}
                        <Text>{task.taskDuration} days</Text>
                      </div>
                      {task.feedback && task.feedback.length > 0 && (
                        <div>
                          <Text type="secondary">Latest Feedback:</Text>{" "}
                          <Rate disabled defaultValue={task.feedback[0].rating} style={{ fontSize: 12 }} />
                          <Tag color={task.feedback[0].decision === "PASS" ? "success" : "error"} style={{ marginLeft: 8 }}>
                            {task.feedback[0].decision}
                          </Tag>
                        </div>
                      )}
                    </Space>
                  </Col>
                  <Col span={8} style={{ textAlign: "right" }}>
                    <Select
                      value={task.status}
                      style={{ width: 120 }}
                      onChange={(value) => {
                        event.stopPropagation();
                        updateTaskStatus(task._id, value);
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className={`status-${task.status?.toLowerCase()}`}
                    >
                      <Select.Option value="PENDING">Pending</Select.Option>
                      <Select.Option value="SUBMITTED">Submitted</Select.Option>
                      <Select.Option value="COMPLETED">Completed</Select.Option>
                      <Select.Option value="CANCELLED">Cancelled</Select.Option>
                    </Select>
                  </Col>
                </Row>
                {task.feedback && task.feedback.length > 0 && (
                  <div style={{ marginTop: "16px", borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                    <Card size="small">
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                        <Avatar src={task.feedback[0].reviewerId?.imageUrl} style={{ marginRight: "8px" }}>
                          {task.feedback[0].reviewerId?.fullName?.split(" ").map((n) => n[0]).join("")}
                        </Avatar>
                        <div>
                          <Text strong>{task.feedback[0].reviewerId?.fullName}</Text>
                          <br />
                          <Text type="secondary">{moment(task.feedback[0].evaluationDate).format("DD MMM YYYY")}</Text>
                        </div>
                      </div>
                      <div style={{ marginTop: "8px" }}>
                        <Text>{task.feedback[0].comment}</Text>
                      </div>
                    </Card>
                  </div>
                )}
                {task.feedback && task.feedback.length > 1 && (
                  <div style={{ marginTop: "8px" }}>
                    <Collapse ghost>
                      <Collapse.Panel header={`View All Feedback (${task.feedback.length})`} key="1">
                        {task.feedback.slice(1).map((feedback, index) => (
                          <Card key={index} size="small" style={{ marginTop: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                              <Avatar src={feedback.reviewerId?.imageUrl} style={{ marginRight: "8px" }}>
                                {feedback.reviewerId?.fullName?.split(" ").map((n) => n[0]).join("")}
                              </Avatar>
                              <div>
                                <Text strong>{feedback.reviewerId?.fullName}</Text>
                                <br />
                                <Text type="secondary">{moment(feedback.evaluationDate).format("DD MMM YYYY")}</Text>
                              </div>
                              <Tag color={feedback.decision === "PASS" ? "success" : "error"} style={{ marginLeft: "auto" }}>
                                {feedback.decision}
                              </Tag>
                            </div>
                            <div>
                              <Rate disabled defaultValue={feedback.rating} style={{ fontSize: 12 }} />
                              <Text style={{ marginLeft: 8 }}>({feedback.rating}/5)</Text>
                            </div>
                            <div style={{ marginTop: "8px" }}>
                              <Text>{feedback.comment}</Text>
                            </div>
                          </Card>
                        ))}
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Empty
              description="No tasks found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    );
  };

  const renderFilesContent = () => {
    if (!candidate?.resume) {
      return (
        <div
          className="no-files-message"
          style={{ textAlign: "center", padding: "40px 0" }}
        >
          <FilePdfOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginTop: "16px" }}
          >
            No resume uploaded
          </Typography.Text>
        </div>
      );
    }

    return (
      <div className="files-content">
        <Card className="file-card">
          <div className="file-item">
            <div className="file-info">
              {getFileIcon(candidate.resume)}
              <div className="file-details">
                <Typography.Text strong style={{ fontSize: "16px" }}>
                  {getFileName(candidate.resume)}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                  Uploaded on:{" "}
                  {moment(candidate.updatedAt).format("DD MMM YYYY")}
                </Typography.Text>
              </div>
            </div>
            <div className="file-actions">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={handlePreviewResume}
                style={{ marginRight: "8px" }}
              >
                Preview
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadResume}
              >
                Download
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Candidate Details</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/recruitment/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/recruitment/candidates">Candidates</Link>
                </li>
                <li className="breadcrumb-item active">
                  {candidate?.firstName} {candidate?.lastName}
                </li>
              </ul>
            </div>
          </div>
        </div>
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

  // Calculate average rating from interviews feedback
  // const feedbackScores = interviews
  //   .map(interview => interview.feedback)
  //   .filter(feedback => feedback && feedback.ratings)
  //   .map(feedback => {
  //     const { technicalSkills1, behavior, softSkills, technicalSkills2, technicalSkills3 } = feedback.ratings;
  //     return (technicalSkills1 + behavior + softSkills + technicalSkills2 + technicalSkills3) / 5;
  //   });

  // const averageRating = feedbackScores.length > 0 ? feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length : 0;
  const calculateAverageRating = (feedbackArray) => {
    if (!feedbackArray || feedbackArray.length === 0) {
      return 0;
    }

    const totalRatings = feedbackArray.reduce((sum, feedback) => {
      const ratings = feedback.ratings;
      const ratingSum = (
        ratings.technicalSkills1 +
        ratings.behavior +
        ratings.softSkills +
        ratings.technicalSkills2 +
        ratings.technicalSkills3
      );
      return sum + (ratingSum / 5); // Average of all skills for this feedback
    }, 0);

    return (totalRatings / feedbackArray.length).toFixed(1);
  };

  return (
    <div className="content container-fluid">
      {/* Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              {/* <Button
                icon={<ArrowLeftOutlined />}
                type="link"
                onClick={() => navigate("/recruitment/candidates")}
                style={{ marginRight: "16px", padding: 0 }}
              /> */}
              <div>
                <h3 className="page-title mb-0">
                  {/* {candidate?.firstName} {candidate?.lastName} */}
                  Candidates
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/recruitment/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/recruitment/candidates">Candidates</Link>
                  </li>
                  {/* <li className="breadcrumb-item active">
                    {candidate?.firstName} {candidate?.lastName}
                  </li> */}
                </ul>
              </div>
            </div>
          </div>

          {/* i will need this part */}

          {/* <div className="col-auto float-end ms-auto">
            <Space>
              <Select
                value={candidate?.status}
                onChange={handleStatusChange}
                loading={updatingStatus}
                style={{
                  width: "150px",
                  fontSize: "13px",
                  background:
                    candidate?.status?.toLowerCase() === "screening"
                      ? "#FFF7E6"
                      : "transparent",
                  zIndex: 1000,
                  position: 'relative',
                }}
                className={`status-${candidate?.status?.toLowerCase()}`}
                dropdownStyle={{
                  minWidth: "150px",
                  borderRadius: "4px",
                }}
                dropdownMatchSelectWidth={false}
                popupClassName="status-dropdown"
              >
                <Select.Option value="NEW">New</Select.Option>
                <Select.Option value="SCREENING">Screening</Select.Option>
                <Select.Option value="SHORTLISTED">Shortlisted</Select.Option>
                <Select.Option value="OFFER_SENT">Offer Sent</Select.Option>
                <Select.Option value="HIRED">Hired</Select.Option>
                <Select.Option value="REJECTED">Rejected</Select.Option>
                <Select.Option value="BLACKLISTED">Blacklisted</Select.Option>
              </Select>
              <Button
                type="primary"
                onClick={handleSendOfferClick}
                style={{
                  background: "#FF9B44",
                  borderColor: "#FF9B44",
                  zIndex: 1000,
                  position: 'relative',
                }}
              >
                {offer ? 'Edit Offer' : 'Send Offer'}
              </Button>
            </Space>
          </div> */}

        </div>
      </div>
      <div style={{width:'100%',borderTop:'1px solid #CFD4D8', display:'flex', justifySelf:'center', height:'50px', alignItems:'flex-end', marginBottom:'15px'}}>
        <div style={{display:'flex', marginBottom:'6px'}}>
          <div>
            <button onClick={()=>navigate("/recruitment/candidates")} style={{marginRight: '16px' ,padding:'0', border:'none', background:'transparent'}}>
              <img src={backBtn}></img>
            </button>
          </div>
          <div>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/candidates">Candidate</Link></li>
              <li className="breadcrumb-item active">{candidate?.firstName} {candidate?.lastName}</li>
            </ul>
          </div>
        </div>
      <div>
        </div>
      </div>

      <div style={{height:'130px', background:'#ffffff' ,border:'1px solid transparent' , borderRadius:'8px', marginBottom:"20px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{display:"flex", alignItems:'center'}}>
          <div style={{height:'80px' ,width:"80px", border:"1px solid transparent" , borderRadius:"50%", background:'#f5f1fd', color:'#9368e9', display:"flex", justifyContent:"center", alignItems:'center', marginLeft:"20px", fontSize:"28px", fontweight:"500"}}>{candidate.firstName?.[0]}{candidate.lastName?.[0]}</div>
          <div>
            <h3 className="ms-3 mt-2 mb-0" style={{fontSize:'20px', fontweight:'500', color:"#000000"}}>{candidate.firstName} {candidate.lastName}</h3>
            <h5 className='ms-3' style={{fontSize:'14px', fontweight:'450', color:"#444444"}} >{candidate?.appliedFor.title}</h5> 
            <div style={{paddingLeft:"10px"}}>
              <img src={star}></img>
              <span style={{ marginLeft:'10px'}}>{calculateAverageRating()}</span>
            </div>   
          </div>
          <div><Tag
                  color={
                    candidate.status === "NEW"? "blue": candidate.status === "SCREENING"
                    ? "orange": candidate.status === "SHORTLISTED"? "green": candidate.status === "REJECTED"? "red": "purple"}
                  style={{marginLeft:"10px", borderRadius:"70px", marginBottom:"12px"}}
                  >{candidate.status?.charAt(0) + candidate.status?.slice(1).toLowerCase()}</Tag>
          </div>
        </div>
          <div className="col-auto float-end me-4">
            <Space>
              <Select
                value={candidate?.status}
                onChange={handleStatusChange}
                loading={updatingStatus}
                style={{
                  background:
                    candidate?.status?.toLowerCase() === "screening"
                      ? "#FFF7E6"
                      : "transparent",
                  zIndex: 1000,
                  position: 'relative',
                  marginRight:'10px',
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
                <Select.Option value="OFFER_SENT">Offer Sent</Select.Option>
                <Select.Option value="HIRED">Hired</Select.Option>
                <Select.Option value="REJECTED">Rejected</Select.Option>
                <Select.Option value="BLACKLISTED">Blacklisted</Select.Option>
              </Select>
              <button
                onClick={handleSendOfferClick}
                className= 'select-btn'
              >{offer ? 'Edit Offer' : 'Send Offer'}</button>
              <div style={{marginLeft:"13px"}}><img src={more}></img></div>
            </Space>
          </div>
      </div>

      <div className="row">
        {/* Left Panel - Basic Information */}
        <div className="col-md-3 custom-col">
          {activeTab === 'timeline' &&(
            <div className="p-3" style={{display:"flex" ,height:"90px", marginBottom:"30px", borderRadius:"8px",boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}>
              <button className='btn-style' onClick={()=>{handleFilterChange('present')}} style={{color: filter === 'present' ? '#ff9244' : '#a5adb6', boxShadow: filter === 'present' ?"0px 4px 10px rgba(0, 0, 0, 0.2)" : 'none'}}>Present</button>
              <button  className='btn-style' onClick={()=>{handleFilterChange('history')}} style={{color: filter === 'history' ? '#ff9244' : '#a5adb6', boxShadow: filter === 'history' ?"0px 4px 10px rgba(0, 0, 0, 0.2)" : 'none'}}>Old History</button>
            </div>
          )}
          <Card style={{borderRadius:"8px"}}>
            {/* <div className="candidate-profile mb-4">
              <div className="profile-img">
                <div className="profile-avatar">
                  {candidate.firstName?.[0]}
                  {candidate.lastName?.[0]}
                </div>
              </div>
              <div className="profile-info text-center">
                <Title
                  level={4}
                  style={{
                    margin: "12px 0 4px",
                    fontSize: "20px",
                    color: "#333",
                  }}
                >
                  {candidate.firstName} {candidate.lastName}
                </Title>
                <Tag
                  color={
                    candidate.status === "NEW"
                      ? "blue"
                      : candidate.status === "SCREENING"
                      ? "orange"
                      : candidate.status === "SHORTLISTED"
                      ? "green"
                      : candidate.status === "REJECTED"
                      ? "red"
                      : "purple"
                  }
                >
                  {candidate.status?.charAt(0) +
                    candidate.status?.slice(1).toLowerCase()}
                </Tag>
              </div>
            </div> */}

            <div className="info-section">
              <Title level={5} className="section-title">
                Basic Information
              </Title>
              <div className="info-item">
                <div className='info-items-children'>
                  <div style={{display:'flex', justifyContent:'center', alignItems:"center", border:"1px solid transparent", borderRadius:"50%", background:"#f7f7f8", height:"32px" ,width:"32px"}}><img src={mail}></img></div>
                  <Text strong style={{color:"#56616b", marginLeft:"7px", display:'flex', alignSelf:"center"}}>{candidate.email}</Text>
                </div>
              </div>
              <div className="info-item">
                <div style={{display:"flex"}}>
                <div style={{display:'flex', justifyContent:'center', alignItems:"center", border:"1px solid transparent", borderRadius:"50%", background:"#f7f7f8", height:"32px" ,width:"32px"}}><img src={phone}></img></div>
                  <Text strong style={{color:"#56616b", marginLeft:"7px", display:'flex', alignSelf:"center"}}>{candidate.phoneNumber}</Text>
                </div>
              </div>
              <div className="info-item">
                <div style={{display:"flex"}}>
                <div style={{display:'flex', justifyContent:'center', alignItems:"center", border:"1px solid transparent", borderRadius:"50%", background:"#f7f7f8", height:"32px" ,width:"32px"}}><img src={location}></img></div>
                  <Text strong style={{color:"#56616b", marginLeft:"7px", display:'flex', alignSelf:"center"}}> Not Specified</Text>
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
                    <Text type="secondary" style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#212529", width:"45%"}}>
                      Applied Position
                    </Text>
                    <Text style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#56616b", width:"45%", marginLeft:"15px"}}>
                      {candidate.appliedFor?.title}
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#212529", width:"45%"}}>
                      Applied On
                    </Text>
                    <Text style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#56616b", width:"45%", marginLeft:"15px"}}>
                    {moment(candidate.appliedDate).format("DD MMM YYYY")}
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary"  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#212529", width:"45%"}}>
                      Department
                    </Text>
                    <Text strong  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#56616b", width:"45%", marginLeft:"15px"}}>
                      {candidate.appliedFor?.department || "Not specified"}
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary"  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#212529", width:"45%"}}>
                      Job Type
                    </Text>
                    <Text strong  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#56616b", width:"45%",  marginLeft:"15px"}}>
                      {candidate.appliedFor?.jobType.replace('_' , ' ') || "Not specified"}
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#212529", width:"45%"}}>
                      Experience
                    </Text>
                    <Text strong  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#56616b", width:"45%",  marginLeft:"15px"}}>
                      {candidate.experience} Years
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary"  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#212529", width:"45%"}}>
                      Notice Period
                    </Text>
                    <Text strong  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#56616b", width:"45%", marginLeft:"15px"}}>
                      {candidate.noticePeriod?.replace("_", " ").toLowerCase()}
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary"  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#212529", width:"45%"}}>
                      Current Salary
                    </Text>
                    <Text strong  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#56616b", width:"45%",  marginLeft:"15px"}}>
                      PKR {candidate.currentSalary?.toLocaleString()}
                    </Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary"  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#212529", width:"45%"}}>
                      Expected Salary
                    </Text>
                    <Text strong  style={{marginBottom:"6px" ,fontSize:"14px", fontWeight:"450", color:"#56616b", width:"45%", marginLeft:"15px"}}>
                      PKR {candidate.expectedSalary?.toLocaleString()}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>


        <div className='col-md-9 custom-col-two'>
          <div className="card p-4" style={{border:"1px solid transparent" ,borderRadius:"8px", display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
            <div className='active-tab-styles'>
              <div className='active-tab-timeline' style={{color:activeTab === 'timeline' ? '#ff9244' : '#a5adb6', cursor: 'pointer',borderBottom: activeTab === 'timeline' ? '2px solid #ff9244' : 'none'}} key='timeline' onClick={()=>{handleActiveTab('timeline')}}><span className='span-timeline'><img src={timeline} style={{marginRight:'8px'}}></img>Timeline</span></div>
              <div  className='active-tab-files'  style={{color:activeTab === 'files' ? '#ff9244' : '#a5adb6', cursor: 'pointer',borderBottom: activeTab === 'files' ? '2px solid #ff9244' : 'none'}}  key='files' onClick={()=>{handleActiveTab('files')}}><span  className='span-files'><img src={files} style={{marginRight:'8px'}}></img>Files</span></div>
              <div  className='active-tab-interview'  style={{color:activeTab === 'interview' ? '#ff9244' : '#a5adb6', cursor: 'pointer',borderBottom: activeTab === 'interview' ? '2px solid #ff9244' : 'none'}}  key='interview'  onClick={()=>{handleActiveTab('interview')}}><span  className='span-interview'><img src={interviewIcon} style={{marginRight:'8px'}}></img>Interview</span></div>
            </div>
          </div>
          <div className="card p-4" style={{border:"1px solid transparent" ,borderRadius:"8px"}} >
            <h3>{activeTab === 'files' ? `Files  (${files.length})` : activeTab === 'timeline' ? "Timeline" : ''}</h3>
              {activeTab === 'timeline' && (
                <div className='mt-2'>
                  <div className="p-3"  style={{background:'#f7f7f8', display:"flex", justifyContent:"space-between"}}>
                    <div style={{fontSize:'14px', fontWeight:"500", color:"#000000"}}>{`${candidate.firstName} is ${candidate.status}`}</div>
                    <div style={{fontSize:'12px', fontWeight:"450", color:"#495057"}}>{moment(candidate.appliedDate).format("DD MMM") + ' at ' + moment(candidate.appliedTime).format("HH:mm A")}</div>
                  </div>
                  {filteredInterviews.length>0 ?(
                    filteredInterviews.map((interview)=>(
                      <div  className="p-3 mt-3"  style={{background:'#f7f7f8', display:"flex", justifyContent:"space-between"}}>
                        <div style={{fontSize:'14px', fontWeight:"500", color:"#000000"}}>{`${interview.interviewTitle} is scheduled with ${interview.createdBy.fullName}`}</div>
                        <div style={{fontSize:'12px', fontWeight:"450", color:"#495057"}}>{moment(interview.interviewDate).format("DD MMM") + ' at ' + moment(interview.interviewTime, "HH:mm").format("hh:mm A")}</div> 
                      </div>
                    )) 
                  ) : ''}
                </div>
              )}
              {activeTab === 'files' &&(
                <div>
                  {candidate.resume ? (
                    <div
                    className="no-files-message"
                    style={{ textAlign: "center", padding: "40px 0" }}
                    >
                      <FilePdfOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
                      <Typography.Text
                      type="secondary"
                      style={{ display: "block", marginTop: "16px" }}
                      >
                        No resume uploaded
                      </Typography.Text>
                    </div>
                  ):(
                    <div className="files-content">
                      <Card className="file-card">
                        <div className="file-item">
                          <div className="file-info">
                            {getFileIcon(candidate.resume)}
                            <div className="file-details">
                              <Typography.Text strong style={{ fontSize: "16px" }}>
                                {getFileName(candidate.resume)}
                              </Typography.Text>
                              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                                Uploaded on:{" "}
                                {moment(candidate.updatedAt).format("DD MMM YYYY")}
                              </Typography.Text>
                            </div>
                          </div>
                          <div className="file-actions">
                            <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={handlePreviewResume}
                            style={{ marginRight: "8px" }}
                            >
                              Preview
                            </Button>
                            <Button
                              type="primary"
                              icon={<DownloadOutlined />}
                              onClick={handleDownloadResume}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'interview' && (
              <div style={{display:' flex'}}>
                {/* <h3>{activeTab === 'interview' ? `(${activeTab.charAt(0) + })` : ''}</h3> */}
                <button>Create Interview</button>
                <button>Create Task</button>
              </div> )}
          </div>
        </div>


        <div className="col-md-9 custom-col-two">
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
        </div>
      </div>

      {/* Replace the old Modal with the new CreateInterviewModal component */}
      <CreateInterviewModal
        isVisible={isInterviewModalVisible}
        onCancel={handleInterviewModalCancel}
        onSubmit={handleInterviewSubmit}
        candidate={candidate}
        authState={authState}
      />

      {/* Add CreateTaskModal */}
      <CreateTaskModal
        visible={isTaskModalVisible}
        onCancel={handleTaskModalCancel}
        onSubmit={handleTaskSubmit}
        candidate={candidate}
        authState={authState}
      />

      {/* Send Offer Modal */}
      <SendOfferModal
        visible={isOfferModalVisible}
        onCancel={() => {
          console.log('Modal cancel triggered');
          setIsOfferModalVisible(false);
        }}
        onSubmit={handleSendOffer}
        loading={submittingOffer}
        candidate={candidate}
        existingOffer={offer}
      />

      {/* Status Change Reason Modal */}
      <Modal
        title="Provide Reason"
        visible={isReasonModalVisible}
        onCancel={() => {
          setIsReasonModalVisible(false);
          setSelectedStatus(null);
        }}
        footer={null}
      >
        <Form
          onFinish={handleReasonSubmit}
          layout="vertical"
        >
          <Form.Item
            name="blacklistReason"
            label="Reason for Blacklisting"
            rules={[
              {
                required: true,
                message: 'Please provide a reason for blacklisting the candidate',
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter the reason for blacklisting the candidate"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setIsReasonModalVisible(false);
                setSelectedStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={updatingStatus}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {offer && (
        <div className="info-section">
          <Title level={5} className="section-title">
            Offer Details
          </Title>
          <div className="info-list">
            <div className="info-item">
              <div className="info-content">
                <Text type="secondary" className="info-label">
                  Offered Salary
                </Text>
                <Text strong className="info-value">
                  {offer.currency} {offer.salary?.toLocaleString()}
                </Text>
              </div>
            </div>
            <div className="info-item">
              <div className="info-content">
                <Text type="secondary" className="info-label">
                  Joining Date
                </Text>
                <Text strong className="info-value">
                  {moment(offer.joiningDate).format('DD MMM YYYY')}
                </Text>
              </div>
            </div>
            <div className="info-item">
              <div className="info-content">
                <Text type="secondary" className="info-label">
                  Offer Status
                </Text>
                <Tag color={
                  offer.status === 'SENT' ? 'blue' :
                  offer.status === 'ACCEPTED' ? 'green' :
                  'red'
                }>
                  {offer.status}
                </Tag>
              </div>
            </div>
            {offer.contractUrl && (
              <div className="info-item">
                <div className="info-content">
                  <Text type="secondary" className="info-label">
                    Contract Document
                  </Text>
                  <Button 
                    type="link" 
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(offer.contractUrl, '_blank')}
                  >
                    Download Contract
                  </Button>
                </div>
              </div>
            )}
            {!offer.contractUrl && (
              <div className="info-item">
                <div className="info-content">
                  <Text type="secondary" className="info-label">
                    Contract Document
                  </Text>
                  <Text type="secondary" italic>
                    No contract uploaded
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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


        // .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
        //   border-color: #ff9b44;
        // }

        // .ant-select-focused:not(.ant-select-disabled).ant-select:not(
        //     .ant-select-customize-input
        //   )
        //   .ant-select-selector {
        //   border-color: #ff9b44;
        //   box-shadow: 0 0 0 2px rgba(255, 155, 68, 0.2);
        //   padding-top: 7px !important;
        //   padding-left: 10px !important;
        //   padding-right: 10px !important;
        //   font-size: 16px !important;
        //   font-weight: 450 !important;
        //   border-radius: 8px !important;

        // }

        .status-scheduled .ant-select-selector {
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

        .status-rescheduled .ant-select-selector {
          background-color: #fff7e6 !important;
          border-color: #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-new .ant-select-selector {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-new .ant-select-arrow {
          color: #1890ff !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-screening .ant-select-selector {
          background-color: #fff7e6 !important;
          border-color: #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-screening .ant-select-arrow {
          color: #fa8c16 !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-offer_sent .ant-select-selector {
          background-color: #d3d3d3 !important;
          border-color: #5e716a !important;
          color: #5e716a !important;
        }

        .status-offer_sent .ant-select-arrow {
          color: #5e716a !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }
        

        .status-shortlisted .ant-select-selector {
          background-color: #f6ffed !important;
          border-color: #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-shortlisted .ant-select-arrow {
          color: #52c41a !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-hired .ant-select-selector {
          background-color: #f9f0ff !important;
          border-color: #d3adf7 !important;
          color: #722ed1 !important;
        }

        .status-hired .ant-select-arrow {
          color: #722ed1 !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-rejected .ant-select-selector {
          background-color: #fff1f0 !important;
          border-color: #ffa39e !important;
          color: #f5222d !important;
        }

        .status-rejected .ant-select-arrow {
          color: #f5222d !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        // .ant-select-focused:not(.ant-select-disabled).ant-select:not(
        //     .ant-select-customize-input
        //   )
        //   .ant-select-selector {
        //   border-color: #ff9b44 !important;
        //   box-shadow: 0 0 0 2px rgba(255, 155, 68, 0.2) !important;
        // }

        // .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
        //   border-color: #ff9b44 !important;
        // }

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

        // :global(.offer-modal .ant-input:hover),
        // :global(.offer-modal .ant-select-selector:hover),
        // :global(.offer-modal .ant-picker:hover) {
        //   border-color: #ff9b44;
        // }

        // :global(.offer-modal .ant-input:focus),
        // :global(.offer-modal .ant-select-selector:focus),
        // :global(.offer-modal .ant-picker-focused) {
        //   border-color: #ff9b44;
        //   box-shadow: 0 0 0 2px rgba(255, 155, 68, 0.2);
        // }

        :global(.offer-modal .ant-upload-drag) {
          border: 2px dashed #e3e3e3;
          border-radius: 4px;
          background: #fafafa;
          transition: all 0.3s;
        }

        // :global(.offer-modal .ant-upload-drag:hover) {
        //   border-color: #ff9b44;
        // }

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

        // :global(.offer-modal .ant-btn-primary:hover) {
        //   background: #ff8629;
        //   border-color: #ff8629;
        // }

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



        @media(min-width: 993px) and (max-width: 1280px){
          .active-tab-styles{
            width: 90%;
          }
        }
        @media(min-width: 768px) and (max-width: 890px){
          .active-tab-styles{
            width: 90%;
          }
        }
        @media(min-width: 430px) and (max-width: 767px){
          .active-tab-styles{
            width: 100%;
          }
        }
        @media(min-width: 330px) and (max-width: 430px){
          .active-tab-styles{
            width: 100%;
            gap: 20px;
          }
        }
        @media(min-width: 330px) and (max-width: 430px){
          .span-timeline img, .span-files img, .span-interview img{
            display: none;
            width: max-width;
          }
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
          max-width: 57%;
        }
      }

      .customized .ant-select-selector{
        height: 45px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 450;
      }
        
        



      `}</style>
    </div>
  );
};

export default CandidateDetails;
