import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Tag, Button, Input, Form, message, Spin, Row, Col, Tooltip, Dropdown } from 'antd';
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
  CopyOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { apiServices } from '../../Services/apiServices';
import moment from 'moment';
import InterviewFeedback from './InterviewFeedback';
import InterviewFeedbackDisplay from './InterviewFeedbackDisplay';

const { TextArea } = Input;

const InterviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [comment, setComment] = useState('');
  const authState = useSelector((state) => state.user.loginvalue);
  const loggedInUser = useSelector((state) => state.user.loginvalue?.user);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const fetchInterviewDetails = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Please login again to continue');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await apiServices(
        "GET",
        `interview/${id}`,
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.success) {
        console.log('Interview details:', response.data.data);
        setInterview(response.data.data);
      } else {
        message.error(response?.data?.message || 'Failed to fetch interview details');
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
      message.error('Error fetching interview details');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;

    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    try {
      const response = await apiServices(
        "POST",
        `interview/${id}/comment`,
        { 
          text: comment.trim(),
          user: {
            firstName: loggedInUser?.firstName,
            lastName: loggedInUser?.lastName,
            imageUrl: loggedInUser?.imageUrl,
            _id: loggedInUser?._id
          }
        },
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.success) {
        message.success('Comment added successfully');
        setComment('');
        fetchInterviewDetails(); // Refresh the comments
      } else {
        message.error(response?.data?.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('Error adding comment');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(interview.interviewLink)
      .then(() => {
        message.success('Interview link copied to clipboard');
      })
      .catch(() => {
        message.error('Failed to copy link');
      });
  };

  const joinInterviewMenu = {
    items: [
      {
        key: '1',
        icon: <CopyOutlined />,
        label: 'Copy Link',
        onClick: handleCopyLink
      }
    ]
  };

  const handleFeedbackSubmit = async (values) => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    try {
      const response = await apiServices(
        "POST",
        `interview/${id}/feedback`,
        {
          description: values.description,
          ratings: {
            technicalSkills1: values.technicalSkills1,
            behavior: values.behavior,
            softSkills: values.softSkills,
            technicalSkills2: values.technicalSkills2,
            technicalSkills3: values.technicalSkills3
          },
          recommendation: values.recommendation
        },
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.success) {
        message.success('Feedback submitted successfully');
        setIsFeedbackModalVisible(false);
        fetchInterviewDetails(); // Refresh interview details to show new feedback
      } else {
        message.error(response?.data?.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Error submitting feedback');
    }
  };

  const calculateAverageRating = () => {
    if (!interview?.feedback || interview.feedback.length === 0) {
      return 0;
    }

    const totalRatings = interview.feedback.reduce((sum, feedback) => {
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

    return (totalRatings / interview.feedback.length).toFixed(1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'ongoing':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getInterviewTypeDisplay = (type) => {
    return type === 'ONLINE' ? 'Online' : 'In Person';
  };

  const resumeMenu = {
    items: [
      {
        key: '1',
        icon: <EyeOutlined />,
        label: 'Preview',
      },
      {
        key: '2',
        icon: <DownloadOutlined />,
        label: 'Download',
      },
    ],
  };

  return (
    <div className="content container-fluid">
      {/* Breadcrumb Navigation */}
      <div className="mb-4 d-flex align-items-center">
        <Button 
          icon={<ArrowLeftOutlined />} 
          type="link" 
          onClick={() => navigate('/recruitment/interviews')}
          style={{ marginRight: '16px', padding: 0 }}
        />
        <div>
          <ul className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/recruitment/interviews">Interview</Link></li>
            <li className="breadcrumb-item active">{interview?.candidateId?.firstName} {interview?.candidateId?.lastName}</li>
          </ul>
        </div>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          {/* Candidate Information Card */}
          <Card className="mb-4">
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex gap-3">
                <Avatar 
                  size={64} 
                  style={{ backgroundColor: '#f56a00' }}
                >
                  {`${interview?.candidateId?.firstName?.charAt(0)}${interview?.candidateId?.lastName?.charAt(0)}`}
                </Avatar>
                <div>
                  <h2 className="mb-1">{interview?.candidateId?.firstName} {interview?.candidateId?.lastName}</h2>
                  <p className="text-muted mb-2">{interview?.candidateId?.jobTitle || 'Product Designer'}</p>
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-flex align-items-center">
                      <StarFilled style={{ color: '#FFD700', marginRight: 4 }} /> {calculateAverageRating()}
                    </span>
                    <Tag color={getStatusColor(interview?.status)}>{interview?.status}</Tag>
                  </div>
                </div>
              </div>
              {interview?.interviewType === 'ONLINE' && interview?.interviewLink && (
                <Dropdown menu={joinInterviewMenu} trigger={['contextMenu']}>
                  <Button 
                    type="primary" 
                    icon={<VideoCameraOutlined />}
                    onClick={() => window.open(interview.interviewLink, '_blank')}
                  >
                    Join Interview
                  </Button>
                </Dropdown>
              )}
            </div>
          </Card>

          {/* Interview Details Section */}
          <Card className="mb-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="mb-2">{interview?.interviewName}</h3>
                <Tag>{interview?.status}</Tag>
              </div>
              <div className="d-flex gap-3">
                {interview?.candidateId?.resume && (
                  <Dropdown menu={resumeMenu}>
                    <Button type="primary" style={{ background: '#4CAF50', borderColor: '#4CAF50' }}>
                      <FileTextOutlined /> Resume.pdf
                    </Button>
                  </Dropdown>
                )}
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  style={{ background: '#FF9B44', borderColor: '#FF9B44' }}
                  onClick={() => setIsFeedbackModalVisible(true)}
                >
                  Add Feedback
                </Button>
              </div>
            </div>
            
            <Row gutter={[24, 16]}>
              <Col span={8}>
                <p className="text-muted mb-1">Interview Type</p>
                <p>{getInterviewTypeDisplay(interview?.interviewType)}</p>
              </Col>
              <Col span={8}>
                <p className="text-muted mb-1">Interview Date</p>
                <p>{moment(interview?.interviewDate).format('DD-MMM-YYYY')}</p>
              </Col>
              <Col span={8}>
                <p className="text-muted mb-1">Interview Time</p>
                <p>{interview?.interviewTime}</p>
              </Col>
            </Row>

            <div className="mt-3">
              <p className="text-muted mb-2">Main Interviewer</p>
              <div className="d-flex align-items-center gap-2">
                <Avatar src={interview?.interviewerId?.imageUrl}>
                  {`${interview?.interviewerId?.firstName?.charAt(0)}${interview?.interviewerId?.lastName?.charAt(0)}`}
                </Avatar>
                <span>{interview?.interviewerId?.firstName} {interview?.interviewerId?.lastName}</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-muted mb-2">Additional Interviewers</p>
              <Avatar.Group maxCount={5}>
                {interview?.assignedTo?.map((interviewer) => (
                  <Tooltip key={interviewer._id} title={`${interviewer.firstName} ${interviewer.lastName}`}>
                    <Avatar src={interviewer.imageUrl}>
                      {`${interviewer.firstName?.charAt(0)}${interviewer.lastName?.charAt(0)}`}
                    </Avatar>
                  </Tooltip>
                ))}
              </Avatar.Group>
            </div>

            <div className="mt-3">
              <p className="text-muted">Created By {interview?.createdBy?.firstName} {interview?.createdBy?.lastName}</p>
            </div>
          </Card>

          {/* Feedback Display Section */}
          {interview?.feedback?.map((feedback, index) => (
            <InterviewFeedbackDisplay key={index} feedback={feedback} />
          ))}

          {/* Comments Section */}
          <Card>
            <h3 className="mb-4">Comments</h3>
            <div className="comment-box mb-4">
              <TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter Comment and hit enter"
                autoSize={{ minRows: 3 }}
                className="mb-3"
              />
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-3">
                  <Button type="text" icon={<BoldOutlined />} />
                  <Button type="text" icon={<ItalicOutlined />} />
                  <Button type="text" icon={<UnderlineOutlined />} />
                  <Button type="text" icon={<PaperClipOutlined />} />
                  <Button type="text" icon={<SmileOutlined />} />
                </div>
                <Button type="primary" onClick={handleCommentSubmit}>
                  Add Comment
                </Button>
              </div>
            </div>

            {/* Display Comments */}
            <div className="comments-list">
              {interview?.comments?.map((comment, index) => (
                <div key={index} className="comment-item mb-3 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <div className="d-flex gap-3">
                    <Avatar 
                      src={comment.user?.imageUrl}
                      style={{ backgroundColor: comment.user?.imageUrl ? 'transparent' : '#f56a00' }}
                    >
                      {!comment.user?.imageUrl && `${comment.user?.firstName?.charAt(0)}${comment.user?.lastName?.charAt(0)}`}
                    </Avatar>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong>{comment.user?.firstName} {comment.user?.lastName}</strong>
                        <span className="text-muted">•</span>
                        <span className="text-muted">{moment(comment.createdAt).fromNow()}</span>
                      </div>
                      <p className="mb-0">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          {/* Additional information or widgets can be added here */}
        </Col>
      </Row>

      {/* Replace the Modal with InterviewFeedback component */}
      <InterviewFeedback 
        visible={isFeedbackModalVisible}
        onCancel={() => setIsFeedbackModalVisible(false)}
        onSubmit={handleFeedbackSubmit}
      />

      <style jsx>{`
        .comment-box {
          border: 1px solid #f0f0f0;
          border-radius: 4px;
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default InterviewDetails; 