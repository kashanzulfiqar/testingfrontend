import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spin, message, Tag, Typography, Tabs, Select, Space } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

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

  const handleStatusChange = (value) => {
    // Implement status change logic here
    message.success(`Status changed to ${value}`);
  };

  const handleSendOffer = () => {
    // Implement send offer logic here
    message.info('Send offer functionality to be implemented');
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
                value={candidate.status}
                onChange={handleStatusChange}
                style={{ width: 140 }}
              >
                <Select.Option value="NEW">New</Select.Option>
                <Select.Option value="SCREENING">Screening</Select.Option>
                <Select.Option value="SHORTLISTED">Shortlisted</Select.Option>
                <Select.Option value="REJECTED">Rejected</Select.Option>
                <Select.Option value="HIRED">Hired</Select.Option>
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
                <Title level={4} style={{ margin: '12px 0 4px' }}>
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
              <Title level={5}>Basic Information</Title>
              <div className="info-item">
                <MailOutlined className="info-icon" />
                <div className="info-content">
                  <Text type="secondary">Email</Text>
                  <Text strong className="info-value">{candidate.email}</Text>
                </div>
              </div>
              <div className="info-item">
                <PhoneOutlined className="info-icon" />
                <div className="info-content">
                  <Text type="secondary">Phone</Text>
                  <Text strong className="info-value">{candidate.phoneNumber}</Text>
                </div>
              </div>
              <div className="info-item">
                <EnvironmentOutlined className="info-icon" />
                <div className="info-content">
                  <Text type="secondary">Location</Text>
                  <Text strong className="info-value">Not specified</Text>
                </div>
              </div>
            </div>

            <div className="info-section">
              <Title level={5}>Other Information</Title>
              <div className="info-list">
                <div className="info-row">
                  <Text type="secondary">Applied for</Text>
                  <Text strong>{candidate.appliedFor?.title}</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Applied on</Text>
                  <Text strong>{moment(candidate.appliedDate).format('DD MMM YYYY')}</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Department</Text>
                  <Text strong>{candidate.appliedFor?.department || 'Not specified'}</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Experience</Text>
                  <Text strong>{candidate.experience} Years</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Notice Period</Text>
                  <Text strong>{candidate.noticePeriod?.replace('_', ' ')}</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Current Salary</Text>
                  <Text strong>PKR {candidate.currentSalary?.toLocaleString()}</Text>
                </div>
                <div className="info-row">
                  <Text type="secondary">Expected Salary</Text>
                  <Text strong>PKR {candidate.expectedSalary?.toLocaleString()}</Text>
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
                  <div className="timeline-item">
                    <div className="time">
                      {moment(candidate.appliedDate).format('DD MMM YYYY')}
                    </div>
                    <div className="event">
                      <Tag color="blue">Application Received</Tag>
                      <Text>Candidate applied for {candidate.appliedFor?.title}</Text>
                    </div>
                  </div>
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
                <div className="interview-content">
                  <Text type="secondary">No interviews scheduled</Text>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .info-card {
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 500;
          color: #666;
        }
        .info-section {
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
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
          margin-bottom: 16px;
        }
        .info-icon {
          font-size: 18px;
          margin-right: 12px;
          color: #666;
        }
        .info-content {
          flex: 1;
        }
        .info-value {
          display: block;
          margin-top: 2px;
        }
        .info-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }
        .nav-tabs-custom .ant-tabs-nav {
          margin-bottom: 20px;
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
          background: #1890ff;
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
        }
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default CandidateDetails; 