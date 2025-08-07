import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Avatar,
  Tag,
  Button,
  Input,
  Form,
  message,
  Spin,
  Row,
  Col,
  Tooltip,
  Dropdown,
  Select,
  Menu,
} from "antd";
import {
  ArrowLeftOutlined,
  VideoCameraOutlined,
  StarFilled,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  PaperClipOutlined,
  SmileOutlined,
  PlusOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { apiServices } from "../../Services/apiServices";
import moment from "moment";
import InterviewFeedback from "./InterviewFeedback";
import InterviewFeedbackDisplay from "./InterviewFeedbackDisplay";
import backBtn from "../../assets/iconsRecruitment/arrow-left.svg";
import starIcon from "../../assets/iconsRecruitment/star.svg";
import camera from "../../assets/iconsRecruitment/camera.svg";
import interviewIcon from "../../assets/iconsRecruitment/interview.svg";
import colored from "../../assets/iconsRecruitment/Colored.svg";
import description from "../../assets/iconsRecruitment/description.svg";
import list from "../../assets/iconsRecruitment/vertical.svg";
import previewIcon from "../../assets/iconsRecruitment/previewIcon.svg";
import downloadIcon from "../../assets/iconsRecruitment/downloadIcon.svg";
import { user_icon } from "../../Entryfile/imagepath";

const { TextArea } = Input;

const InterviewDetails = ({ visible, onCancel, onSubmit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [comment, setComment] = useState("");
  const authState = useSelector((state) => state.user.loginvalue);
  const loggedInUser = useSelector((state) => state.user.loginvalue?.user);
  const [feedbackForm] = Form.useForm();
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const fetchInterviewDetails = async () => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Please login again to continue");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await apiServices("GET", `interview/${id}`, null, {
        access_token: {
          accessToken: token,
        },
      });

      if (response?.data?.success) {
        console.log("Interview details:", response.data.data);
        setInterview(response.data.data);
      } else {
        message.error(
          response?.data?.message || "Failed to fetch interview details"
        );
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
      message.error("Error fetching interview details");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (values) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    try {
      // First submit the feedback
      console.log("values in interview details", values);
      const response = await apiServices(
        "POST",
        `interview/${id}/feedback`,
        {
          description: values.description,
          ratings: {
            technicalRating: values.ratings.technicalRating,
            behaviorRating: values.ratings.behaviorRating,
            softSkillRating: values.ratings.softSkillRating,
            leadershipRating: values.ratings.leadershipRating,
            teamworkRating: values.ratings.teamworkRating,
          },
          recommendation: values.recommendation,
        },
        {
          access_token: {
            accessToken: token,
          },
        }
      );

      if (response?.data?.success) {
        // If feedback submission is successful, update the status to completed
        try {
          const statusResponse = await apiServices(
            "PATCH",
            `interview/${id}/status`,
            { status: "completed" },
            {
              access_token: {
                accessToken: token,
              },
            }
          );

          if (statusResponse?.data?.success) {
            message.success(
              "Feedback submitted and interview marked as completed"
            );
          } else {
            console.error("Status update failed:", statusResponse?.data);
            message.success("Feedback submitted successfully");
          }
        } catch (statusError) {
          console.error("Error updating status:", statusError);
          message.success("Feedback submitted successfully");
        }

        fetchInterviewDetails(); // Refresh interview details to show new feedback and updated status
      } else {
        throw new Error(response?.data?.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      if (error.response?.data?.errors) {
        message.error(
          error.response.data.errors[0].message || "Error submitting feedback"
        );
      } else {
        message.error(error.message || "Error submitting feedback");
      }
    }
  };

  const calculateAverageRating = () => {
    if (!interview?.feedback || interview.feedback.length === 0) {
      return 0;
    }

    const totalRatings = interview.feedback.reduce((sum, feedback) => {
      const ratings = feedback.ratings;
      const ratingSum =
        ratings.technicalSkills1 +
        ratings.behavior +
        ratings.softSkills +
        ratings.technicalSkills2 +
        ratings.technicalSkills3;
      return sum + ratingSum / 5;
    }, 0);

    return (totalRatings / interview.feedback.length).toFixed(1);
  };

  // Add new function to check if user has already submitted feedback
  const hasUserSubmittedFeedback = () => {
    if (!interview?.feedback || !loggedInUser?._id) return false;
    return interview.feedback.some(
      (feedback) => feedback.submittedBy?._id === loggedInUser._id
    );
  };

  // Add this function before the component or inside it
  const extractMeetingDomain = (url) => {
    if (!url) return "";

    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      const domainMatch = url.match(/https?:\/\/([^\/]+)/);
      return domainMatch ? domainMatch[1] : url;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "blue";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      case "ongoing":
        return "orange";
      default:
        return "default";
    }
  };

  const handleStatusChange = async (newStatus) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    try {
      const response = await apiServices(
        "PATCH",
        `interview/${id}/status`,
        { status: newStatus },
        {
          access_token: {
            accessToken: token,
          },
        }
      );

      if (response?.data?.success) {
        message.success("Interview status updated successfully");
        fetchInterviewDetails(); // Refresh the interview details
      } else {
        message.error(
          response?.data?.message || "Failed to update interview status"
        );
      }
    } catch (error) {
      console.error("Error updating interview status:", error);
      message.error("Failed to update interview status");
    }
  };

  const handlePreviewResume = () => {
    if (
      !interview?.candidateId?.resume ||
      !Array.isArray(interview?.candidateId?.resume) ||
      interview?.candidateId?.resume.length === 0
    ) {
      message.error("No resume available for preview");
      return;
    }

    const firstResume = interview.candidateId.resume[0];
    window.open(firstResume.url, "_blank");
  };

  const handleDownloadResume = async () => {
    if (
      !interview?.candidateId?.resume ||
      !Array.isArray(interview?.candidateId?.resume) ||
      interview?.candidateId?.resume.length === 0
    ) {
      message.error("No resume available for download");
      return;
    }

    try {
      const firstResume = interview.candidateId.resume[0];
      const response = await fetch(firstResume.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = firstResume.fileName || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Failed to download resume");
    }
  };

  const MainInterviewer = interview.interviewerId;
  const OptionalInterviewer = interview?.assignedTo || [];
  const allInterviewers = [MainInterviewer, ...OptionalInterviewer].filter(
    Boolean
  );
  console.log("record of interviewers", allInterviewers);
  return (
    <div className="content container-fluid">
      {/* Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              <div>
                <h3 className="page-title mb-0">Interviews</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/recruitment/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/recruitment/interviews">Interviews</Link>
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
              onClick={() => navigate("/recruitment/interviews")}
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
                <Link to="/recruitment/interviews">Interviews</Link>
              </li>
              <li className="breadcrumb-item active">
                {interview?.candidateName
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </li>
            </ul>
          </div>
        </div>
        <div></div>
      </div>

      <div className="initials-div">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="initials-details">
            {interview?.candidateId?.firstName?.[0].toUpperCase()}
            {interview?.candidateId?.lastName?.[0].toUpperCase()}
          </div>
          <div>
            <h3
              className="ms-3 mt-2 mb-0"
              style={{ fontSize: "20px", fontweight: "500", color: "#000000" }}
            >
              {interview?.candidateName
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
            </h3>
            <h5
              className="ms-3"
              style={{ fontSize: "14px", fontweight: "450", color: "#444444" }}
            >
              {interview?.candidateId?.appliedFor}
            </h5>
            <div style={{ paddingLeft: "10px" }}>
              <img src={starIcon}></img>
              <span style={{ marginLeft: "10px" }}>
                {calculateAverageRating()}
              </span>
            </div>
          </div>
          <Tag color={getStatusColor(interview?.status)} className="tag-style">
            {interview?.status}
          </Tag>
        </div>
        <div className="custom">
          <div
            onClick={() => window.open(interview?.interviewLink, "_blank")}
            className="select-btn"
          >
            <div className="joinImg">
              <img src={camera} style={{ height: "20px", width: "20px" }}></img>
            </div>
            <h3
              style={{ fontSize: "16px", fontWeight: "500", marginTop: "8px" }}
            >
              Join Interview
            </h3>
          </div>
        </div>
      </div>

      <div className="AddFeedback-screen">
        <div className="AddFeedback-innerScreen">
          <div style={{ display: "flex", gap: "10px" }}>
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
                style={{ maxWidth: "80%", maxHeight: "80%" }}
                src={interviewIcon}
              ></img>
            </div>
            <div
              style={{
                marginTop: "7px",
                fontSize: "18px",
                fontWeight: "500",
                color: "#000000",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {interview?.interviewTitle}
            </div>
            <div style={{ marginTop: "7px" }}>
              <Tag
                color={getStatusColor(interview?.status)}
                style={{ borderRadius: "60px" }}
              >
                {interview?.status}
              </Tag>
            </div>
          </div>
          {interview?.status !== "In-Review" && (
            <div style={{ paddingTop: "12px" }}>
              <button
                className="feedback-btn"
                onClick={() => {
                  setIsFeedbackModalVisible(true);
                }}
                // disabled={hasUserSubmittedFeedback()}
                // title={hasUserSubmittedFeedback() ? "You have already submitted feedback for this interview" : ""}
              >
                <img
                  src={colored}
                  style={{ height: "16px", width: "16px" }}
                ></img>
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
              style={{ fontSize: "14px", fontWeight: "450", color: "#212529" }}
            >
              Interview Type
            </p>
            <p
              style={{ fontSize: "16px", fontWeight: "500", color: "#3b4249" }}
            >
              {interview?.interviewType[0] +
                interview?.interviewType.slice(1).toLowerCase()}
            </p>
          </Col>
          <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p
              className="text-muted mb-1"
              style={{ fontSize: "14px", fontWeight: "450", color: "#212529" }}
            >
              Interview Date
            </p>
            <p
              style={{ fontSize: "16px", fontWeight: "500", color: "#3b4249" }}
            >
              {moment(interview?.interviewDate).format("DD-MMM-YYYY")}
            </p>
          </Col>
          <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p
              className="text-muted mb-1"
              style={{ fontSize: "14px", fontWeight: "450", color: "#212529" }}
            >
              Interview Time
            </p>
            <p
              style={{ fontSize: "16px", fontWeight: "500", color: "#3b4249" }}
            >
              {interview?.interviewTime}
            </p>
          </Col>
          <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p
              className="text-muted mb-1"
              style={{ fontSize: "14px", fontWeight: "450", color: "#212529" }}
            >
              Assign To
            </p>
            <div className="project-members" style={{ margin: "4px auto" }}>
              <ul className="team-members" style={{ minWidth: "max-content" }}>
                {allInterviewers?.slice(0, 3).map((interviewer, index) => (
                  <li key={index}>
                    <Tooltip title={interviewer?.fullName}>
                      <Avatar
                        style={{ cursor: "pointer" }}
                        src={interviewer?.imageUrl || user_icon}
                      />
                    </Tooltip>
                  </li>
                ))}
                {allInterviewers?.length > 3 && (
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
                      +{allInterviewers?.length - 3}
                    </Link>
                    {/* Dropdown menu for additional interviewers */}
                    <div className="dropdown-menu dropdown-menu-right">
                      <div className="avatar-group">
                        {allInterviewers?.slice(3).map((interviewer, index) => (
                          <li key={index}>
                            <Tooltip title={interviewer?.fullName}>
                              <Avatar
                                style={{ cursor: "pointer" }}
                                src={interviewer?.imageUrl || user_icon}
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
          <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p
              className="text-muted mb-1"
              style={{ fontSize: "14px", fontWeight: "450", color: "#212529" }}
            >
              Created By
            </p>
            <p
              style={{ fontSize: "16px", fontWeight: "500", color: "#3b4249" }}
            >
              {interview?.createdBy?.fullName}
            </p>
          </Col>
          {interview?.status !== "in-review" &&
            interview?.interviewType === "ONLINE" && (
              <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
                <p
                  className="text-muted mb-1"
                  style={{
                    fontSize: "14px",
                    fontWeight: "450",
                    color: "#212529",
                  }}
                >
                  Medium
                </p>
                <p
                  onClick={() =>
                    window.open(interview?.interviewLink, "_blank")
                  }
                  style={{
                    cursor: "pointer",
                    textDecoration: "underLine",
                    color: "#009efb",
                  }}
                >
                  {extractMeetingDomain(interview?.interviewLink)}
                </p>
              </Col>
            )}
        </Row>
        {/* {interview?.candidateId?.resume && ( */}
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
            width: "230px",
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
            <div style={{ padding: "10px 0px 10px 10px" }}>
              <p
                style={{
                  marginBottom: "0px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {interview?.candidateId?.resume &&
                Array.isArray(interview?.candidateId?.resume) &&
                interview?.candidateId?.resume.length > 0
                  ? interview.candidateId.resume[0].fileName
                  : "No resume available"}
              </p>
              <p
                style={{
                  marginBottom: "0px",
                  fontSize: "12px",
                  fontWeight: "450",
                }}
              >
                {interview?.candidateId?.resume &&
                Array.isArray(interview?.candidateId?.resume) &&
                interview?.candidateId?.resume.length > 0
                  ? moment(interview.candidateId.resume[0].uploadedAt).format(
                      "DD MMM YYYY"
                    )
                  : ""}
              </p>
            </div>
          </div>
          <div>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="edit"
                    onClick={() => {
                      handlePreviewResume();
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px" }}>
                      <img src={previewIcon}></img>
                      <p style={{ marginBottom: "0px" }}>Preview</p>
                    </div>
                  </Menu.Item>
                  <Menu.Item
                    key="downlaod"
                    onClick={() => {
                      handleDownloadResume();
                    }}
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
              <div style={{ cursor: "pointer", height: "25px" }}>
                <img src={list} alt="More Options" />
              </div>
            </Dropdown>
          </div>
        </div>
        {/* )} */}

        {interview?.status === "completed" && (
          <div>
            {interview?.feedback?.map((feedback, index) => (
              <InterviewFeedbackDisplay key={index} feedback={feedback} />
            ))}
          </div>
        )}
      </div>

      <InterviewFeedback
        visible={isFeedbackModalVisible}
        onCancel={() => setIsFeedbackModalVisible(false)}
        onSubmit={handleFeedbackSubmit}
      />

      <style jsx>{`
        .btn-style {
          width: 50%;
          font-size: 14px;
          font-weight: 500;
          color: #a5adb6;
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
        .social-icons {
          display: flex;
          position: relative;
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

        .feedback-btn {
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
        .status-scheduled {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-completed .ant-select-selector,
        .status-completed {
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

        .select-btn {
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

        .tag-style {
          border-radius: 70px;
          margin-left: 9px;
          margin-top: -35px;
        }

        .initials-div {
          height: 130px;
          background: #ffffff;
          border: 1px solid transparent;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .initials-details {
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

        .custom {
          display: flex;
          float: end;
          margin-right: 12px;
        }

        .AddFeedback-screen {
          background: #ffffff;
          border: 1px solid transparent;
          border-radius: 8px;
          margin-bottom: 20px;
          padding: 25px;
        }

        .AddFeedback-innerScreen {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 630px) {
          .tag-style {
            display: none !important;
          }
        }

        @media (max-width: 500px) {
          .select-btn {
            width: 130px !important;
            gap: 4px !important;
          }
        }

        @media (max-width: 500px) {
          .joinImg {
            display: none !important;
          }
        }

        @media (min-width: 415px) and (max-width: 450px) {
          .select-btn {
            margin-left: 30px !important;
          }
        }

        @media (max-width: 410px) {
          .select-btn {
            width: 110px !important;
          }
        }

        @media (max-width: 410px) {
          .select-btn {
            text-align: center;
            padding: 10px;
          }
        }

        @media (max-width: 500px) {
          .initials-details {
            margin-left: 7px !important;
          }
        }
      `}</style>
    </div>
  );

  // return (
  //   <div className="content container-fluid">
  //     {/* Breadcrumb Navigation */}
  //     <div className="mb-4 d-flex align-items-center">
  //       <Button
  //         icon={<ArrowLeftOutlined />}
  //         type="link"
  //         onClick={() => navigate('/recruitment/interviews')}
  //         style={{ marginRight: '16px', padding: 0 }}
  //       />
  //       <div>
  //         <ul className="breadcrumb mb-0">
  //           <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
  //           <li className="breadcrumb-item"><Link to="/recruitment/interviews">Interview</Link></li>
  //           <li className="breadcrumb-item active">{interview?.candidateId?.firstName} {interview?.candidateId?.lastName}</li>
  //         </ul>
  //       </div>
  //     </div>

  //     <Row gutter={24}>
  //       <Col span={16}>
  //         {/* Candidate Information Card */}
  //         <Card className="mb-4">
  //           <div className="d-flex justify-content-between align-items-start">
  //             <div className="d-flex gap-3">
  //               <Avatar
  //                 size={64}
  //                 style={{ backgroundColor: '#f56a00' }}
  //               >
  //                 {`${interview?.candidateId?.firstName?.charAt(0)}${interview?.candidateId?.lastName?.charAt(0)}`}
  //               </Avatar>
  //               <div>
  //                 <h2 className="mb-1">{interview?.candidateId?.firstName} {interview?.candidateId?.lastName}</h2>
  //                 <p className="text-muted mb-2">{interview?.candidateId?.jobTitle || 'Product Designer'}</p>
  //                 <div className="d-flex align-items-center gap-2">
  //                   <span className="d-flex align-items-center">
  //                     <StarFilled style={{ color: '#FFD700', marginRight: 4 }} /> {calculateAverageRating()}
  //                   </span>
  //                   <Tag color={getStatusColor(interview?.status)}>{interview?.status}</Tag>
  //                 </div>
  //               </div>
  //             </div>
  //             {interview?.interviewType === 'ONLINE' && interview?.interviewLink && (
  //               <Dropdown menu={joinInterviewMenu} trigger={['contextMenu']}>
  //                 <Button
  //                   type="primary"
  //                   icon={<VideoCameraOutlined />}
  //                   onClick={() => window.open(interview.interviewLink, '_blank')}
  //                 >
  //                   Join Interview
  //                 </Button>
  //               </Dropdown>
  //             )}
  //           </div>
  //         </Card>

  //         {/* Interview Details Section */}
  //         <Card className="mb-4">
  //           <div className="d-flex justify-content-between align-items-start mb-4">
  //             <div>
  //               <h3 className="mb-2">{interview?.interviewName}</h3>
  //               <div className="d-flex align-items-center gap-2">
  //                 <Tag color={getStatusColor(interview?.status)}>{interview?.status}</Tag>
  //                 <Select
  //                   value={interview?.status?.toLowerCase()}
  //                   style={{ width: 150 }}
  //                   onChange={handleStatusChange}
  //                   placeholder="Change Status"
  //                 >
  //                   <Select.Option value="scheduled">Scheduled</Select.Option>
  //                   <Select.Option value="completed">Completed</Select.Option>
  //                   <Select.Option value="cancelled">Cancelled</Select.Option>
  //                   <Select.Option value="rescheduled">Rescheduled</Select.Option>
  //                 </Select>
  //               </div>
  //             </div>
  //             <div className="d-flex gap-3">
  //               {interview?.candidateId?.resume && (
  //                 <Dropdown menu={resumeMenu}>
  //                   <Button type="primary" style={{ background: '#4CAF50', borderColor: '#4CAF50' }}>
  //                     <FileTextOutlined /> Resume.pdf
  //                   </Button>
  //                 </Dropdown>
  //               )}
  //               <Button
  //                 type="primary"
  //                 icon={<PlusOutlined />}
  //                 style={{ background: '#FF9B44', borderColor: '#FF9B44' }}
  //                 onClick={() => setIsFeedbackModalVisible(true)}
  //                 disabled={hasUserSubmittedFeedback()}
  //                 title={hasUserSubmittedFeedback() ? "You have already submitted feedback for this interview" : ""}
  //               >
  //                 Add Feedback
  //               </Button>
  //             </div>
  //           </div>

  //           <Row gutter={[24, 16]}>
  //             <Col span={8}>
  //               <p className="text-muted mb-1">Interview Type</p>
  //               <p>{getInterviewTypeDisplay(interview?.interviewType)}</p>
  //             </Col>
  //             <Col span={8}>
  //               <p className="text-muted mb-1">Interview Date</p>
  //               <p>{moment(interview?.interviewDate).format('DD-MMM-YYYY')}</p>
  //             </Col>
  //             <Col span={8}>
  //               <p className="text-muted mb-1">Interview Time</p>
  //               <p>{interview?.interviewTime}</p>
  //             </Col>
  //           </Row>

  //           <div className="mt-3">
  //             <p className="text-muted mb-2">Main Interviewer</p>
  //             <div className="d-flex align-items-center gap-2">
  //               <Avatar src={interview?.interviewerId?.imageUrl}>
  //                 {`${interview?.interviewerId?.firstName?.charAt(0)}${interview?.interviewerId?.lastName?.charAt(0)}`}
  //               </Avatar>
  //               <span>{interview?.interviewerId?.firstName} {interview?.interviewerId?.lastName}</span>
  //             </div>
  //           </div>

  //           <div className="mt-3">
  //             <p className="text-muted mb-2">Additional Interviewers</p>
  //             <Avatar.Group maxCount={5}>
  //               {interview?.assignedTo?.map((interviewer) => (
  //                 <Tooltip key={interviewer._id} title={`${interviewer.firstName} ${interviewer.lastName}`}>
  //                   <Avatar src={interviewer.imageUrl}>
  //                     {`${interviewer.firstName?.charAt(0)}${interviewer.lastName?.charAt(0)}`}
  //                   </Avatar>
  //                 </Tooltip>
  //               ))}
  //             </Avatar.Group>
  //           </div>

  //           <div className="mt-3">
  //             <p className="text-muted">Created By {interview?.createdBy?.firstName} {interview?.createdBy?.lastName}</p>
  //           </div>
  //         </Card>

  // {/* Feedback Display Section */}
  // {interview?.feedback?.map((feedback, index) => (
  //   <InterviewFeedbackDisplay key={index} feedback={feedback} />
  // ))}

  //         {/* Comments Section */}
  //         <Card>
  //           <h3 className="mb-4">Comments</h3>
  //           <div className="comment-box mb-4">
  //             <TextArea
  //               value={comment}
  //               onChange={(e) => setComment(e.target.value)}
  //               placeholder="Enter Comment and hit enter"
  //               autoSize={{ minRows: 3 }}
  //               className="mb-3"
  //             />
  //             <div className="d-flex justify-content-between align-items-center">
  //               <div className="d-flex gap-3">
  //                 <Button type="text" icon={<BoldOutlined />} />
  //                 <Button type="text" icon={<ItalicOutlined />} />
  //                 <Button type="text" icon={<UnderlineOutlined />} />
  //                 <Button type="text" icon={<PaperClipOutlined />} />
  //                 <Button type="text" icon={<SmileOutlined />} />
  //               </div>
  //               <Button type="primary" onClick={handleCommentSubmit}>
  //                 Add Comment
  //               </Button>
  //             </div>
  //           </div>

  //           {/* Display Comments */}
  //           <div className="comments-list">
  //             {interview?.comments?.map((comment, index) => (
  //               <div key={index} className="comment-item mb-3 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
  //                 <div className="d-flex gap-3">
  //                   <Avatar
  //                     src={comment.user?.imageUrl}
  //                     style={{ backgroundColor: comment.user?.imageUrl ? 'transparent' : '#f56a00' }}
  //                   >
  //                     {!comment.user?.imageUrl && `${comment.user?.firstName?.charAt(0)}${comment.user?.lastName?.charAt(0)}`}
  //                   </Avatar>
  //                   <div>
  //                     <div className="d-flex align-items-center gap-2 mb-1">
  //                       <strong>{comment.user?.firstName} {comment.user?.lastName}</strong>
  //                       <span className="text-muted">•</span>
  //                       <span className="text-muted">{moment(comment.createdAt).fromNow()}</span>
  //                     </div>
  //                     <p className="mb-0">{comment.text}</p>
  //                   </div>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </Card>
  //       </Col>

  //       <Col span={8}>
  //         {/* Additional information or widgets can be added here */}
  //       </Col>
  //     </Row>

  //     {/* Replace the Modal with InterviewFeedback component */}
  //     <InterviewFeedback
  //       visible={isFeedbackModalVisible}
  //       onCancel={() => setIsFeedbackModalVisible(false)}
  //       onSubmit={handleFeedbackSubmit}
  //     />

  //     <style jsx>{`
  //       .comment-box {
  //         border: 1px solid #f0f0f0;
  //         border-radius: 4px;
  //         padding: 16px;
  //       }
  //     `}</style>
  //   </div>
  // );
};

export default InterviewDetails;
