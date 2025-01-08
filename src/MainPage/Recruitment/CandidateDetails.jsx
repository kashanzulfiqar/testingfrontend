import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spin, message, Tag, Typography, Tabs, Select, Space, Modal, Form, Input, DatePicker, TimePicker, Empty, Avatar, Tooltip } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, CloseOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const authState = useSelector((state) => state.user.loginvalue);
  const [isInterviewModalVisible, setIsInterviewModalVisible] = useState(false);
  const [interviewForm] = Form.useForm();
  const [employees, setEmployees] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  useEffect(() => {
    fetchCandidateDetails();
    // Initialize Bootstrap dropdowns
    if (typeof window !== 'undefined') {
      require('bootstrap/js/dist/dropdown');
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === 'interview') {
      fetchCandidateInterviews();
    }
  }, [id, activeTab]);

  const fetchCandidateDetails = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await apiServices(
        "GET",
        `candidate/${id}`,
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

      if (response?.data?.status) {
        console.log('Candidate Details Response:', response.data.data);
        console.log('Resume field value:', response.data.data.resume);
        setCandidate(response.data.data);
      } else {
        if (response?.data?.message === 'Invalid token') {
          message.error('Session expired. Please login again');
          navigate('/login');
        } else if (response?.data?.message === 'Candidate not found') {
          message.error('Candidate not found');
          navigate('/recruitment/candidates');
        } else {
          message.error(response?.data?.message || 'Failed to fetch candidate details');
        }
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        navigate('/login');
      } else if (error.response?.status === 404) {
        message.error('Candidate not found');
        navigate('/recruitment/candidates');
      } else {
        message.error('Error fetching candidate details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async () => {
    console.log('Current candidate resume:', candidate?.resume);
    
    if (!candidate?.resume) {
      message.error('No resume available for this candidate');
      return;
    }

    try {
      // Show loading message
      message.loading('Downloading resume...', 0.5);
      
      // Attempt to open the resume URL
      window.open(candidate.resume, '_blank');
      message.success('Resume opened successfully');
    } catch (error) {
      console.error('Error downloading resume:', error);
      message.error('Failed to download resume. Please try again later.');
    }
  };

  // Helper function to check if resume URL is valid
  const isValidResumeUrl = (resume) => {
    console.log('Checking resume URL:', resume);
    // Check if resume exists and is not empty
    return Boolean(resume && resume.length > 0);
  };

  const handleStatusChange = async (value) => {
    try {
      const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
      
      if (!token) {
        message.error('Authentication required');
        return;
      }

      const response = await apiServices(
        "PATCH",
        `candidate/${id}/status`,
        { status: value },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response?.data?.status) {
        message.success('Status updated successfully');
        fetchCandidateDetails(); // Refresh the candidate data
      } else {
        message.error(response?.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error?.response?.data?.message || 'Error updating status');
    }
  };

  const handleSendOffer = () => {
    // Implement send offer logic here
    message.info('Send offer functionality to be implemented');
  };

  const fetchEmployees = () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      return;
    }

    const roles = ["employee", "interviewer", "admin"]; // Roles that can conduct interviews

    apiServices(
      "GET", 
      `user/all-employees?roles=${JSON.stringify(roles)}`, 
      null, 
      {
        access_token: {
          accessToken: token
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
      .then((res) => {
        if (res.data.success === true) {
          // Use the new response format and sort by fullName
          const emps = res?.data?.data || [];
          const sortedData = emps
            .slice()
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          setEmployees(sortedData);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting employees"
          }`
        );
      });
  };

  const showTeamSearch = (val) => {
    let dropdownValues = [];
    employees.forEach((team) => {
      dropdownValues.push(team.fullName.toLowerCase());
    });
  };

  const handleCreateInterview = () => {
    fetchEmployees(); // This will now fetch only eligible interviewers
    interviewForm.setFieldsValue({
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      candidateEmail: candidate.email
    });
    setIsInterviewModalVisible(true);
  };

  const handleInterviewModalCancel = () => {
    setIsInterviewModalVisible(false);
    interviewForm.resetFields();
  };

  const handleInterviewSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
      
      if (!token) {
        message.error('Authentication required');
        return;
      }

      // Find the selected employee for interview name
      const selectedEmployee = employees.find(emp => emp.fullName === values.interviewName);
      if (!selectedEmployee) {
        message.error('Selected interviewer not found');
        return;
      }

      // Validate that interviewer is not in assignedTo
      if (values.assignedTo.includes(selectedEmployee._id)) {
        message.error('Main interviewer cannot be assigned as an additional interviewer');
        return;
      }

      // Clean up the interview link if provided
      const interviewLink = values.interviewLink ? 
        values.interviewLink.startsWith('http') ? 
          values.interviewLink : 
          `https://${values.interviewLink}` 
        : '';

      // Validate interview link for online interviews
      if (values.interviewType === 'ONLINE' && !interviewLink) {
        message.error('Interview link is required for online interviews');
        return;
      }

      const interviewData = {
        candidateId: id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: candidate.email,
        interviewName: values.interviewName,
        interviewerId: selectedEmployee._id,
        interviewType: values.interviewType,
        assignedTo: values.assignedTo,
        interviewDate: values.interviewDate.format('YYYY-MM-DD'),
        interviewTime: values.interviewTime.format('HH:mm'),
        interviewLink: interviewLink
      };

      const response = await apiServices(
        "POST",
        'interview/create',
        interviewData,
        {
          access_token: {
            accessToken: token
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response?.data?.success) {
        message.success('Interview created successfully');
        setIsInterviewModalVisible(false);
        interviewForm.resetFields();
        fetchCandidateInterviews(); // Refresh the interviews list
      } else {
        if (response?.data?.errors) {
          const errorMessages = response.data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
          message.error(errorMessages);
        } else {
          message.error(response?.data?.message || 'Failed to create interview');
        }
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
        message.error(errorMessages);
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error creating interview');
      }
    }
  };

  const updateInterviewStatus = async (interviewId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
      
      if (!token) {
        message.error('Authentication required');
        return;
      }

      const response = await apiServices(
        "PATCH",
        `interview/${interviewId}/status`,
        { status: newStatus },
        {
          access_token: {
            accessToken: token
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response?.data?.success) {
        message.success('Interview status updated successfully');
        fetchCandidateInterviews(); // Refresh the interviews list
      } else {
        message.error(response?.data?.message || 'Failed to update interview status');
      }
    } catch (error) {
      console.error('Error updating interview status:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error updating interview status');
      }
    }
  };

  const fetchCandidateInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
      
      if (!token) {
        message.error('Authentication required');
        return;
      }

      const response = await apiServices(
        "GET",
        `interview/candidate/${id}`,
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

      if (response?.data?.success) {
        setInterviews(response.data.data);
      } else {
        if (response?.data?.message === 'Invalid interview ID format') {
          console.error('Invalid candidate ID format:', id);
          message.error('Invalid candidate ID format');
        } else {
          message.error(response?.data?.message || 'Failed to fetch interviews');
        }
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error fetching interviews');
      }
    } finally {
      setLoadingInterviews(false);
    }
  };

  const renderInterviewContent = () => {
    if (loadingInterviews) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      );
    }

    return (
      <div className="interview-content">
        <div style={{ position: 'absolute', top: '16px', right: '24px' }}>
          <Space size="middle">
            <Button 
              type="text" 
              style={{ color: '#ff9b44' }}
              icon={<CalendarOutlined />}
              onClick={handleCreateInterview}
            >
              Create Interview
            </Button>
            <Button 
              type="text"
              style={{ color: '#ff9b44' }}
              icon={<CalendarOutlined />}
            >
              Create Task
            </Button>
          </Space>
        </div>
        
        {interviews.length > 0 ? (
          <div style={{ marginTop: '60px' }}>
            {interviews.map((interview) => (
              <Card 
                key={interview._id} 
                style={{ marginBottom: '16px' }}
                className="interview-card"
              >
                <Row gutter={16}>
                  <Col span={16}>
                    <h4>Interview with {interview.interviewName}</h4>
                    <p>
                      <CalendarOutlined /> {moment(interview.interviewDate).format('DD MMM YYYY')} at {interview.interviewTime}
                    </p>
                    <p>Type: {interview.interviewType === 'ONLINE' ? 'Online' : 'In Person'}</p>
                    {interview.interviewLink && (
                      <p>Link: <a href={interview.interviewLink} target="_blank" rel="noopener noreferrer">{interview.interviewLink}</a></p>
                    )}
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <Space direction="vertical">
                      <Select
                        value={interview.status}
                        style={{ width: 120 }}
                        onChange={(value) => updateInterviewStatus(interview._id, value)}
                      >
                        <Select.Option value="scheduled">Scheduled</Select.Option>
                        <Select.Option value="completed">Completed</Select.Option>
                        <Select.Option value="cancelled">Cancelled</Select.Option>
                        <Select.Option value="rescheduled">Rescheduled</Select.Option>
                      </Select>
                    </Space>
                  </Col>
                </Row>
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">Additional Interviewers:</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Avatar.Group maxCount={3}>
                      {interview.assignedTo.map((interviewer) => (
                        <Tooltip key={interviewer._id} title={interviewer.fullName}>
                          <Avatar src={interviewer.imageUrl || user_icon} />
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: '60px', textAlign: 'center' }}>
            <Text type="secondary">No interviews scheduled</Text>
          </div>
        )}
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
                <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/recruitment/candidates">Candidates</Link></li>
                <li className="breadcrumb-item active">{candidate?.firstName} {candidate?.lastName}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="content container-fluid">
      {/* Header Section */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Candidate</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/recruitment/candidates">Candidates</Link></li>
              <li className="breadcrumb-item active">{candidate.firstName} {candidate.lastName}</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto">
            <Space>
              <Select
                defaultValue={candidate?.status}
                value={candidate?.status}
                onChange={handleStatusChange}
                style={{ 
                  width: 'auto', 
                  minWidth: '120px',
                  fontSize: '13px'
                }}
              >
                <Select.Option value="NEW">New</Select.Option>
                <Select.Option value="SCREENING">Screening</Select.Option>
                <Select.Option value="SHORTLISTED">Shortlisted</Select.Option>
                <Select.Option value="HIRED">Hired</Select.Option>
                <Select.Option value="REJECTED">Rejected</Select.Option>
              </Select>
              <Button 
                type="primary" 
                onClick={handleSendOffer}
                style={{ background: '#FFA500', borderColor: '#FFA500' }}
              >
                Send Offer
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Panel - Basic Information */}
        <div className="col-md-3">
          <Card className="info-card">
            <div className="candidate-profile mb-4">
              <div className="profile-img">
                <div className="profile-avatar">
                  {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                </div>
              </div>
              <div className="profile-info text-center">
                <Title level={4} style={{ margin: '12px 0 4px', fontSize: '20px', color: '#333' }}>
                  {candidate.firstName} {candidate.lastName}
                </Title>
                <Tag color={candidate.status === 'NEW' ? 'blue' : 
                         candidate.status === 'SCREENING' ? 'orange' :
                         candidate.status === 'SHORTLISTED' ? 'green' :
                         candidate.status === 'REJECTED' ? 'red' : 'purple'}>
                  {candidate.status?.charAt(0) + candidate.status?.slice(1).toLowerCase()}
                </Tag>
              </div>
            </div>

            <div className="info-section">
              <Title level={5} className="section-title">Basic Information</Title>
              <div className="info-item">
                <MailOutlined className="info-icon" />
                <div className="info-content">
                  <Text type="secondary" className="info-label">Email</Text>
                  <Text strong className="info-value">{candidate.email}</Text>
                </div>
              </div>
              <div className="info-item">
                <PhoneOutlined className="info-icon" />
                <div className="info-content">
                  <Text type="secondary" className="info-label">Phone</Text>
                  <Text strong className="info-value">{candidate.phoneNumber}</Text>
                </div>
              </div>
              <div className="info-item">
                <EnvironmentOutlined className="info-icon" />
                <div className="info-content">
                  <Text type="secondary" className="info-label">Location</Text>
                  <Text strong className="info-value">Not specified</Text>
                </div>
              </div>
            </div>

            <div className="info-section">
              <Title level={5} className="section-title">Other Information</Title>
              <div className="info-list">
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" className="info-label">Applied for</Text>
                    <Text strong className="info-value">{candidate.appliedFor?.title}</Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" className="info-label">Applied on</Text>
                    <Text strong className="info-value">{moment(candidate.appliedDate).format('DD MMM YYYY')}</Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" className="info-label">Department</Text>
                    <Text strong className="info-value">{candidate.appliedFor?.department || 'Not specified'}</Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" className="info-label">Experience</Text>
                    <Text strong className="info-value">{candidate.experience} Years</Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" className="info-label">Notice Period</Text>
                    <Text strong className="info-value">{candidate.noticePeriod?.replace('_', ' ').toLowerCase()}</Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" className="info-label">Current Salary</Text>
                    <Text strong className="info-value">PKR {candidate.currentSalary?.toLocaleString()}</Text>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <Text type="secondary" className="info-label">Expected Salary</Text>
                    <Text strong className="info-value">PKR {candidate.expectedSalary?.toLocaleString()}</Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="col-md-9">
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              className="nav-tabs-custom"
            >
              <TabPane tab="Timeline" key="timeline">
                <div className="timeline-content">
                  {/* Application Event */}
                  <div className="timeline-item">
                    <div className="time">
                      {moment(candidate.appliedDate).format('DD MMM YYYY')}
                    </div>
                    <div className="event">
                      <Tag color="blue">Application Received</Tag>
                      <Text>Candidate applied for {candidate.appliedFor?.title}</Text>
                    </div>
                  </div>

                  {/* Interview Events */}
                  {interviews.map((interview) => (
                    <div key={interview._id} className="timeline-item">
                      <div className="time">
                        {moment(interview.createdAt).format('DD MMM YYYY')}
                      </div>
                      <div className="event">
                        <Tag color="green">Interview Scheduled</Tag>
                        <Text>
                          Interview scheduled with {interview.interviewName} for{' '}
                          {moment(interview.interviewDate).format('DD MMM YYYY')} at {interview.interviewTime}
                          {interview.interviewType === 'ONLINE' ? ' (Online)' : ' (In Person)'}
                        </Text>
                      </div>
                      {interview.status !== 'scheduled' && (
                        <div className="event" style={{ marginTop: '8px' }}>
                          <Tag 
                            color={
                              interview.status === 'completed' ? 'green' :
                              interview.status === 'cancelled' ? 'red' :
                              interview.status === 'rescheduled' ? 'orange' : 'blue'
                            }
                          >
                            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                          </Tag>
                          <Text>
                            Interview {interview.status}
                          </Text>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabPane>
              <TabPane tab="Files" key="files">
                <div className="files-content">
                  {candidate.resume ? (
                    <div className="file-item">
                      <Text strong>Resume</Text>
                      <Button type="link" onClick={handleDownloadResume}>
                        Download
                      </Button>
                    </div>
                  ) : (
                    <Text type="secondary">No files available</Text>
                  )}
                </div>
              </TabPane>
              <TabPane tab="Interview" key="interview">
                {renderInterviewContent()}
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Interview Modal */}
      <Modal
        title={
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '500',
            marginBottom: '20px'
          }}>
            Add New Candidate
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={handleInterviewModalCancel}
              style={{ 
                position: 'absolute',
                right: 20,
                top: 20,
                color: '#333'
              }}
            />
          </div>
        }
        open={isInterviewModalVisible}
        onCancel={handleInterviewModalCancel}
        footer={null}
        width={600}
        className="interview-modal"
      >
        <Form
          form={interviewForm}
          layout="vertical"
          onFinish={handleInterviewSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#333' }}>Candidate Name <span style={{ color: 'red' }}>*</span></span>}
                name="candidateName"
                rules={[{ required: true, message: 'Please enter candidate name' }]}
                initialValue={`${candidate?.firstName} ${candidate?.lastName}`}
              >
                <Input 
                  placeholder="Enter Name" 
                  disabled 
                  style={{ backgroundColor: '#f9f9f9' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#333' }}>Candidate Email <span style={{ color: 'red' }}>*</span></span>}
                name="candidateEmail"
                rules={[{ required: true, message: 'Please enter candidate email' }]}
                initialValue={candidate?.email}
              >
                <Input 
                  placeholder="Enter Email" 
                  disabled
                  style={{ backgroundColor: '#f9f9f9' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#333' }}>Interview Name <span style={{ color: 'red' }}>*</span></span>}
                name="interviewName"
                rules={[{ required: true, message: 'Please select interviewer' }]}
              >
                <Select
                  showSearch
                  onSearch={(val) => {
                    showTeamSearch(val);
                  }}
                  filterOption={(input, option) =>
                    option.children
                      ?.toLowerCase()
                      ?.indexOf(input?.toLowerCase()) >= 0
                  }
                  optionFilterProp="children"
                  notFoundContent={
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }
                  dropdownRender={(menu) => <>{menu}</>}
                  className="custom-select custom-normal"
                  placeholder="Select interviewer"
                >
                  {employees?.map((employee) => (
                    <Select.Option
                      key={employee._id}
                      value={employee.fullName}
                    >
                      {employee.fullName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#333' }}>Interview Type <span style={{ color: 'red' }}>*</span></span>}
                name="interviewType"
                rules={[{ required: true, message: 'Please select interview type' }]}
              >
                <Select placeholder="Select interview type">
                  <Select.Option value="ONLINE">Online</Select.Option>
                  <Select.Option value="IN_PERSON">In Person</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#333' }}>Assign to <span style={{ color: 'red' }}>*</span></span>}
                name="assignedTo"
                rules={[{ required: true, message: 'Please assign interviewer' }]}
              >
                <Select
                  showSearch
                  onSearch={(val) => {
                    showTeamSearch(val);
                  }}
                  filterOption={(input, option) => 
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  optionFilterProp="children"
                  notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                  dropdownRender={(menu) => (
                    <>{menu}</>
                  )}
                  mode="multiple"
                  placeholder="Select interviewers"
                  className="customselect-height custom-select"
                >
                  {employees?.map((employee) => (
                    <Select.Option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.fullName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#333' }}>Interview Date <span style={{ color: 'red' }}>*</span></span>}
                name="interviewDate"
                rules={[
                  { required: true, message: 'Please select date' },
                  {
                    validator: (_, value) => {
                      if (value && value.isBefore(moment().startOf('day'))) {
                        return Promise.reject('Interview date cannot be in the past');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Select Date"
                  disabledDate={(current) => {
                    return current && current < moment().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#333' }}>Interview Time <span style={{ color: 'red' }}>*</span></span>}
                name="interviewTime"
                rules={[{ required: true, message: 'Please select time' }]}
              >
                <TimePicker 
                  style={{ width: '100%' }} 
                  placeholder="Select Status"
                  format="HH:mm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#333' }}>Interview Link</span>}
                name="interviewLink"
              >
                <Input placeholder="www.zoom.com" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px'
          }}>
            <Button onClick={handleInterviewModalCancel}>
              Reset
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              style={{ 
                background: '#ff9b44',
                borderColor: '#ff9b44'
              }}
            >
              Create Interview
            </Button>
          </div>
        </Form>
      </Modal>

      <style jsx>{`
        .info-card {
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
          margin: 0 32px 0 0;
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
          content: '';
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
        .files-content, .interview-content {
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
        .custom-select .ant-select-selector {
          font-size: 13px !important;
          height: 32px !important;
          padding: 0 11px !important;
        }

        .custom-select .ant-select-selection-item {
          line-height: 30px !important;
        }

        .custom-select.ant-select-dropdown {
          font-size: 13px !important;
        }

        .custom-select .ant-select-item {
          padding: 5px 12px !important;
          min-height: 32px !important;
          line-height: 22px !important;
        }

        .ant-select-dropdown {
          z-index: 1050;
        }
        
        .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #ff9b44;
        }
        
        .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
          border-color: #ff9b44;
          box-shadow: 0 0 0 2px rgba(255, 155, 68, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CandidateDetails; 