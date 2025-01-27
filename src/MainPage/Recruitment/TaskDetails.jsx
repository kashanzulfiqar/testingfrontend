import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Card, Spin, message, Tag, Button, Descriptions, Timeline, Row, Col,
  Modal, Form, Input, Rate, DatePicker, Radio, Upload, Select
} from 'antd';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import { 
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  UploadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [taskDetails, setTaskDetails] = useState(null);
  const authState = useSelector((state) => state.user.loginvalue);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      console.log('Fetching task details for ID:', id);
      const response = await apiServices(
        "GET",
        `task/${id}`,
        null,
        {
          access_token: {
            accessToken: token
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Task details API response:', response);
      
      if (response?.data?.success) {
        console.log('Task details data:', response.data.data);
        console.log('Current user:', authState?.user);
        console.log('Task reviewers:', response.data.data.taskReviewers);
        setTaskDetails(response.data.data);
      } else {
        console.error('Failed to fetch task details:', response?.data);
        message.error(response?.data?.message || 'Failed to fetch task details');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 401) {
        message.error('Unauthorized access. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        message.error('Task not found');
        navigate('/recruitment/tasks');
      } else if (error.response?.status === 400) {
        message.error('Invalid task ID');
        navigate('/recruitment/tasks');
      } else {
        message.error('Error fetching task details. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'SUBMITTED':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'OVERDUE':
        return 'red';
      default:
        return 'default';
    }
  };

  const handleAddFeedback = () => {
    setFeedbackModalVisible(true);
    feedbackForm.setFieldsValue({
      evaluationDate: moment(),
      evaluatorName: authState?.user?.fullName || '',
      candidateName: `${taskDetails.candidateId.firstName} ${taskDetails.candidateId.lastName}`,
      jobTitle: taskDetails.candidateId.appliedFor?.title || ''
    });
  };

  const handleFeedbackSubmit = async (values) => {
    setSubmitting(true);
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;

    // Check if user is a task reviewer
    if (!isUserTaskReviewer()) {
      message.error('Only assigned reviewers can submit feedback');
      setSubmitting(false);
      return;
    }

    try {
      const response = await apiServices(
        "POST",
        `task/${id}/feedback`,
        {
          rating: Number(values.rating),
          comment: values.comments,
          decision: values.decision,
          evaluationDate: values.evaluationDate.format('YYYY-MM-DD')
        },
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.success) {
        message.success('Feedback submitted successfully');
        setFeedbackModalVisible(false);
        feedbackForm.resetFields();
        fetchTaskDetails(); // Refresh task details to show new feedback
      } else {
        throw new Error(response?.data?.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error.response?.status === 401) {
        message.error('Unauthorized access. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        message.error('You are not authorized to provide feedback for this task');
      } else if (error.response?.status === 404) {
        message.error('Task not found');
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessage = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');
        message.error(errorMessage);
      } else {
        message.error(error.response?.data?.message || 'Error submitting feedback. Please try again');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isUserTaskReviewer = () => {
    if (!taskDetails?.taskReviewers || !authState?.user?._id) return false;
    return taskDetails.taskReviewers.some(reviewer => reviewer._id === authState.user._id);
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdateLoading(true);
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;

    try {
      const response = await apiServices(
        "PATCH",
        `task/${id}/status`,
        {
          status: newStatus
        },
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.success) {
        message.success('Task status updated successfully');
        fetchTaskDetails(); // Refresh task details
      } else {
        throw new Error(response?.data?.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      message.error(error.response?.data?.message || 'Error updating task status');
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

  return (
    <div className="content container-fluid">
      {/* Page Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Task Details</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/recruitment/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/recruitment/tasks">Tasks</Link>
              </li>
              <li className="breadcrumb-item active">Task Details</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto">
            {isUserTaskReviewer() && (
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddFeedback}
              >
                Add Feedback
              </Button>
            )}
          </div>
        </div>
      </div>

      {taskDetails && (
        <div className="row">
          <div className="col-md-8">
            <Card title="Task Information" className="mb-4">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Task Name">
                  {taskDetails.taskName}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {taskDetails.description}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Tag color={getStatusColor(taskDetails.status)}>
                      {taskDetails.status?.charAt(0).toUpperCase() + taskDetails.status?.slice(1).toLowerCase()}
                    </Tag>
                    <Select
                      style={{ width: 150 }}
                      placeholder="Change Status"
                      onChange={handleStatusUpdate}
                      loading={statusUpdateLoading}
                      value={taskDetails.status}
                    >
                      <Select.Option value="PENDING">Pending</Select.Option>
                      <Select.Option value="SUBMITTED">Submitted</Select.Option>
                      <Select.Option value="COMPLETED">Completed</Select.Option>
                      <Select.Option value="OVERDUE">Overdue</Select.Option>
                    </Select>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {taskDetails.taskDuration} days
                </Descriptions.Item>
                <Descriptions.Item label="Due Date">
                  {moment(taskDetails.lastDateOfSubmission).format('DD MMM YYYY')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {taskDetails.taskFile && (
              <Card title="Task File" className="mb-4">
                <div className="d-flex align-items-center">
                  <FileTextOutlined style={{ fontSize: '24px', marginRight: '12px' }} />
                  <div>
                    <div>{taskDetails.taskFile.fileName}</div>
                    <div className="text-muted">{Math.round(taskDetails.taskFile.bytes / 1024)} KB</div>
                  </div>
                  <Button 
                    type="link" 
                    href={taskDetails.taskFile.imageUrl}
                    target="_blank"
                    className="ms-auto"
                  >
                    Download
                  </Button>
                </div>
              </Card>
            )}

            {taskDetails.submittedFile && (
              <Card title="Submitted File" className="mb-4">
                <div className="d-flex align-items-center">
                  <FileTextOutlined style={{ fontSize: '24px', marginRight: '12px' }} />
                  <div>
                    <div>{taskDetails.submittedFile.fileName}</div>
                    <div className="text-muted">{Math.round(taskDetails.submittedFile.bytes / 1024)} KB</div>
                  </div>
                  <Button 
                    type="link" 
                    href={taskDetails.submittedFile.imageUrl}
                    target="_blank"
                    className="ms-auto"
                  >
                    Download
                  </Button>
                </div>
              </Card>
            )}

            <div className="mb-4">
              <h4 className="mb-0">Feedback</h4>
            </div>

            {taskDetails.feedback && taskDetails.feedback.length > 0 && (
              <Card title="Feedback" className="mb-4">
                {taskDetails.feedback.map((feedback, index) => (
                  <div key={index} className="mb-4">
                    <Descriptions column={1} bordered>
                      <Descriptions.Item label="Reviewer">
                        <div className="d-flex align-items-center">
                          {feedback.reviewerId.imageUrl ? (
                            <img 
                              src={feedback.reviewerId.imageUrl} 
                              alt={feedback.reviewerId.fullName}
                              style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }}
                            />
                          ) : (
                            <UserOutlined style={{ marginRight: 8 }} />
                          )}
                          {feedback.reviewerId.fullName}
                        </div>
                      </Descriptions.Item>
                      {feedback.rating && (
                        <Descriptions.Item label="Rating">
                          {feedback.rating}/5
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Comment">
                        {feedback.comment}
                      </Descriptions.Item>
                      <Descriptions.Item label="Decision">
                        <Tag color={feedback.decision === 'PASS' ? 'success' : 'error'}>
                          {feedback.decision}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Date">
                        {moment(feedback.evaluationDate).format('DD MMM YYYY')}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ))}
              </Card>
            )}
          </div>

          <div className="col-md-4">
            <Card title="Candidate Information" className="mb-4">
              <Descriptions column={1}>
                <Descriptions.Item label="Name">
                  <Link to={`/recruitment/candidates/${taskDetails.candidateId._id}`}>
                    {taskDetails.candidateId.firstName} {taskDetails.candidateId.lastName}
                  </Link>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {taskDetails.candidateId.email}
                </Descriptions.Item>
                {taskDetails.candidateId.appliedFor && (
                  <>
                    <Descriptions.Item label="Applied For">
                      <Link to={`/recruitment/jobs/${taskDetails.candidateId.appliedFor._id}`}>
                        {taskDetails.candidateId.appliedFor.title}
                      </Link>
                    </Descriptions.Item>
                    <Descriptions.Item label="Department">
                      {taskDetails.candidateId.appliedFor.department}
                    </Descriptions.Item>
                    <Descriptions.Item label="Job Type">
                      <Tag color="blue">
                        {taskDetails.candidateId.appliedFor.jobType?.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Work Setup">
                      <Tag color="green">
                        {taskDetails.candidateId.appliedFor.workSetup?.charAt(0).toUpperCase() + 
                         taskDetails.candidateId.appliedFor.workSetup?.slice(1).toLowerCase()}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Job Status">
                      <Tag color={taskDetails.candidateId.appliedFor.status === 'ACTIVE' ? 'green' : 'red'}>
                        {taskDetails.candidateId.appliedFor.status?.charAt(0).toUpperCase() + 
                         taskDetails.candidateId.appliedFor.status?.slice(1).toLowerCase()}
                      </Tag>
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            <Card title="Reviewers" className="mb-4">
              {taskDetails.taskReviewers?.map((reviewer, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  {reviewer.imageUrl ? (
                    <img 
                      src={reviewer.imageUrl} 
                      alt={reviewer.fullName}
                      style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }}
                    />
                  ) : (
                    <UserOutlined style={{ marginRight: 8 }} />
                  )}
                  <span>{reviewer.fullName}</span>
                </div>
              ))}
            </Card>

            <Card title="Timeline">
              <Timeline>
                <Timeline.Item dot={<CalendarOutlined />}>
                  Created on {moment(taskDetails.createdAt).format('DD MMM YYYY')}
                </Timeline.Item>
                {taskDetails.submittedAt && (
                  <Timeline.Item dot={<FileTextOutlined />}>
                    Submitted on {moment(taskDetails.submittedAt).format('DD MMM YYYY')}
                  </Timeline.Item>
                )}
                {taskDetails.status === 'COMPLETED' && (
                  <Timeline.Item dot={<CheckCircleOutlined />}>
                    Completed on {moment(taskDetails.updatedAt).format('DD MMM YYYY')}
                  </Timeline.Item>
                )}
                <Timeline.Item dot={<ClockCircleOutlined />}>
                  Due on {moment(taskDetails.lastDateOfSubmission).format('DD MMM YYYY')}
                </Timeline.Item>
              </Timeline>
            </Card>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <Modal
        title="Task Feedback Form"
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={handleFeedbackSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="candidateName"
                label="Candidate Name"
                rules={[{ required: true }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="jobTitle"
                label="Job Title"
                rules={[{ required: true }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="evaluatorName"
                label="Evaluator Name"
                rules={[{ required: true }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="evaluationDate"
                label="Evaluation Date"
                rules={[{ required: true }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabled 
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate count={5} />
          </Form.Item>

          <Form.Item
            name="comments"
            label="Feedback Comments"
            rules={[{ required: true, message: 'Please provide feedback comments' }]}
          >
            <TextArea rows={4} placeholder="Enter your detailed feedback here..." />
          </Form.Item>

          <Form.Item
            name="decision"
            label="Decision"
            rules={[{ required: true, message: 'Please select a decision' }]}
          >
            <Radio.Group>
              <Radio value="PASS">Pass</Radio>
              <Radio value="FAIL">Fail</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button 
              onClick={() => setFeedbackModalVisible(false)} 
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={submitting}
            >
              Submit Feedback
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .ant-descriptions-bordered .ant-descriptions-item-label {
          width: 200px;
          background-color: #fafafa;
        }
        .ant-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .ant-timeline {
          padding: 16px;
        }
        .ant-timeline-item-content {
          margin-left: 32px;
        }
      `}</style>
    </div>
  );
};

export default TaskDetails; 