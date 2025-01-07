import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spin, message, Tag, Typography, Divider } from 'antd';
import { LeftOutlined, DownloadOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, DollarOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const { Title, Text } = Typography;

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'blue';
      case 'SCREENING':
        return 'orange';
      case 'SHORTLISTED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'HIRED':
        return 'purple';
      default:
        return 'default';
    }
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
                <li className="breadcrumb-item active">Details</li>
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

  if (!candidate) {
    return null;
  }

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Candidate Details</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/recruitment/candidates">Candidates</Link></li>
              <li className="breadcrumb-item active">Details</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto">
            <Button
              onClick={() => navigate('/recruitment/candidates')}
              icon={<LeftOutlined />}
            >
              Back to List
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card className="job-detail">
            <div className="job-detail-header">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {candidate.firstName} {candidate.lastName}
                  </Title>
                  <Text type="secondary" className="d-block mt-1">
                    Applied for: {candidate.appliedFor?.title} {candidate.appliedFor?.department ? `- ${candidate.appliedFor.department}` : ''}
                  </Text>
                </div>
                <Tag color={getStatusColor(candidate.status)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {candidate.status?.charAt(0) + candidate.status?.slice(1).toLowerCase()}
                </Tag>
              </div>
              <Divider />
            </div>

            <div className="job-detail-content">
              <div className="info-list">
                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <div className="info-item">
                      <MailOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Email</Text>
                        <Text strong className="d-block">
                          <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="info-item">
                      <PhoneOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Phone</Text>
                        <Text strong className="d-block">
                          <a href={`tel:${candidate.phoneNumber}`}>{candidate.phoneNumber}</a>
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="info-item">
                      <CalendarOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Experience</Text>
                        <Text strong className="d-block">{candidate.experience} years</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="info-item">
                      <CalendarOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Applied Date</Text>
                        <Text strong className="d-block">
                          {moment(candidate.appliedDate).format('MMMM D, YYYY')}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="info-item">
                      <DollarOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Current Salary</Text>
                        <Text strong className="d-block">
                          {candidate.currentSalary?.toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="info-item">
                      <DollarOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Expected Salary</Text>
                        <Text strong className="d-block">
                          {candidate.expectedSalary?.toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="info-item">
                      <ClockCircleOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Notice Period</Text>
                        <Text strong className="d-block">
                          {candidate.noticePeriod?.replace('_', ' ')}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="info-item">
                      <GlobalOutlined className="info-icon" />
                      <div>
                        <Text type="secondary">Source</Text>
                        <Text strong className="d-block">
                          {candidate.source}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-md-4">
          <Card>
            <div className="job-detail-sidebar">
              <div className="job-action-btn mb-3">
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={handleDownloadResume}
                  disabled={!isValidResumeUrl(candidate?.resume)}
                  block
                  size="large"
                >
                  {candidate?.resume ? 'Download Resume' : 'No Resume Available'}
                </Button>
              </div>
              <Divider />
              <div className="job-overview">
                <Title level={5}>Application Overview</Title>
                <div className="job-overview-list">
                  <div className="overview-item">
                    <Text type="secondary">Status</Text>
                    <Tag color={getStatusColor(candidate.status)}>
                      {candidate.status?.charAt(0) + candidate.status?.slice(1).toLowerCase()}
                    </Tag>
                  </div>
                  <div className="overview-item">
                    <Text type="secondary">Applied Date</Text>
                    <Text>{moment(candidate.appliedDate).format('MMMM D, YYYY')}</Text>
                  </div>
                  <div className="overview-item">
                    <Text type="secondary">Position</Text>
                    <Text>{candidate.appliedFor?.title}</Text>
                  </div>
                  <div className="overview-item">
                    <Text type="secondary">Department</Text>
                    <Text>{candidate.appliedFor?.department || 'N/A'}</Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .job-detail {
          margin-bottom: 24px;
        }
        .info-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .info-icon {
          font-size: 20px;
          margin-right: 12px;
          margin-top: 4px;
          color: #1890ff;
        }
        .job-overview-list {
          margin-top: 16px;
        }
        .overview-item {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ant-card {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default CandidateDetails; 