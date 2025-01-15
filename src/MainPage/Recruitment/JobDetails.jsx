import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Tabs, Spin, message, Tag, Button, Modal } from 'antd';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import { 
  ArrowLeftOutlined, 
  FacebookOutlined, 
  LinkedinOutlined, 
  InstagramOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import CreateCandidateModal from './CreateCandidateModal';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const authState = useSelector((state) => state.user.loginvalue);
  const [isModalVisible, setIsModalVisible] = useState(false);

  console.log('JobDetails component mounted with jobId:', jobId);

  useEffect(() => {
    console.log('Fetching job details for jobId:', jobId);
    fetchJobDetails();
    fetchJobCandidates();
  }, [jobId]);

  const fetchJobDetails = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found');
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      console.log('Making API request to fetch job details...');
      const response = await apiServices(
        "GET",
        `job/${jobId}`,
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      console.log('Job details API response:', response);

      if (response?.data?.status) {
        console.log('Job details fetched successfully:', response.data.data);
        setJobDetails(response.data.data);
      } else {
        console.error('Failed to fetch job details:', response?.data);
        message.error(response?.data?.message || 'Failed to fetch job details');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      message.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCandidates = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found for candidates fetch');
      return;
    }

    try {
      console.log('Making API request to fetch job candidates for jobId:', jobId);
      const response = await apiServices(
        "GET",
        `candidate/list?appliedFor=${jobId}&page=1&limit=50`,
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      console.log('Job candidates API response:', response);

      if (response?.data?.status) {
        const candidatesList = response.data.data.docs || [];
        console.log('Job candidates fetched successfully:', candidatesList);
        setCandidates(candidatesList);
      } else {
        console.error('Failed to fetch candidates:', response?.data);
        message.error('Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching job candidates:', error);
      message.error('Failed to load candidates');
    }
  };

  const handleAddCandidate = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchJobCandidates();
  };

  const items = [
    {
      key: 'description',
      label: (
        <div style={{ padding: '8px 0' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Description</span>
        </div>
      ),
      children: (
        <div className="job-description">
          {jobDetails?.description && (
            <div dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
          )}
        </div>
      ),
    },
    {
      key: 'candidates',
      label: (
        <div style={{ padding: '8px 0' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Candidates ({candidates.length})</span>
        </div>
      ),
      children: (
        <div className="candidates-list">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <div key={candidate._id} className="candidate-card">
                <div className="candidate-info">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h4>
                        <Link to={`/recruitment/candidates/${candidate._id}`} className="text-primary">
                          {candidate.firstName} {candidate.lastName}
                        </Link>
                      </h4>
                      <p className="text-muted mb-1">{candidate.email}</p>
                      <p className="text-muted mb-1">Experience: {candidate.experience} years</p>
                      <p className="text-muted mb-2">Expected Salary: {candidate.expectedSalary}</p>
                      <Tag color={
                        candidate.status === 'PENDING' ? 'orange' :
                        candidate.status === 'SHORTLISTED' ? 'green' :
                        candidate.status === 'REJECTED' ? 'red' :
                        'default'
                      }>
                        {candidate.status?.charAt(0) + candidate.status?.slice(1).toLowerCase()}
                      </Tag>
                    </div>
                    <Button type="primary" onClick={() => navigate(`/recruitment/candidates/${candidate._id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <h4 className="text-muted">No candidates have applied for this position yet</h4>
              <p className="mb-0">Share this job posting to attract potential candidates</p>
            </div>
          )}
        </div>
      ),
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="content container-fluid">
      {/* Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              <Button 
                icon={<ArrowLeftOutlined />} 
                type="link" 
                onClick={() => navigate('/recruitment/jobs')}
                style={{ marginRight: '16px', padding: 0 }}
              />
              <div>
                <h3 className="page-title mb-0">{jobDetails?.title}</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/recruitment/jobs">Jobs</Link></li>
                  <li className="breadcrumb-item active">{jobDetails?.title || 'Job Details'}</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <Button 
              type="primary"
              style={{ background: '#F4A261', borderColor: '#F4A261' }}
              onClick={handleAddCandidate}
            >
              Add Candidate
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Panel */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <h3 className="mb-0">{jobDetails?.title}</h3>
                <Tag color="success" className="ms-2">Open</Tag>
              </div>

              <div className="info-section mb-4">
                <h5 className="text-muted mb-3">Basic Information</h5>
                <div className="info-item">
                  <TeamOutlined className="me-2" />
                  <span>{jobDetails?.positions} Positions</span>
                </div>
                <div className="info-item">
                  <GlobalOutlined className="me-2" />
                  <span>{jobDetails?.department}</span>
                </div>
                <div className="info-item">
                  <CalendarOutlined className="me-2" />
                  <span>{new Date(jobDetails?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <UserOutlined className="me-2" />
                  <span>{candidates.length} Applications</span>
                </div>
              </div>

              <div className="info-section mb-4">
                <h5 className="text-muted mb-3">Other Information</h5>
                <div className="info-item">
                  <GlobalOutlined className="me-2" />
                  <span>{jobDetails?.jobType?.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}</span>
                </div>
                <div className="info-item">
                  <EnvironmentOutlined className="me-2" />
                  <span>{jobDetails?.workSetup?.charAt(0) + jobDetails?.workSetup?.slice(1).toLowerCase()}</span>
                </div>
                <div className="info-item">
                  <DollarOutlined className="me-2" />
                  <span>{jobDetails?.salaryRange}</span>
                </div>
              </div>

              <div className="info-section">
                <h5 className="text-muted mb-3">Posted on</h5>
                <div className="d-flex gap-3">
                  <FacebookOutlined style={{ fontSize: '24px', color: '#1877F2' }} />
                  <LinkedinOutlined style={{ fontSize: '24px', color: '#0A66C2' }} />
                  <InstagramOutlined style={{ fontSize: '24px', color: '#E4405F' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <Tabs 
                defaultActiveKey="description" 
                items={items}
                className="job-details-tabs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      <CreateCandidateModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        initialValues={{
          appliedFor: jobId,
          appliedDate: moment()
        }}
      />

      <style jsx global>{`
        .job-details-tabs .ant-tabs-nav {
          margin-bottom: 24px;
        }
        .job-details-tabs .ant-tabs-tab {
          padding: 12px 0;
          margin: 0 32px 0 0;
        }
        .job-details-tabs .ant-tabs-tab-active {
          font-weight: 600;
        }
        .job-description {
          font-size: 16px;
          line-height: 1.6;
          color: #333;
        }
        .info-section {
          padding-bottom: 20px;
          border-bottom: 1px solid #e8e8e8;
        }
        .info-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          color: #666;
        }
        .info-item:last-child {
          margin-bottom: 0;
        }
        .candidates-list {
          display: grid;
          gap: 16px;
        }
        .candidate-card {
          padding: 16px;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .candidate-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .candidate-info h4 {
          margin: 0 0 8px;
        }
        .candidate-info p {
          margin: 0 0 8px;
          color: #666;
        }
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0;
        }
        .custom-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }
        .custom-modal .ant-form-item-label > label {
          font-weight: 500;
        }
        .custom-modal .ant-input,
        .custom-modal .ant-select-selector,
        .custom-modal .ant-picker,
        .custom-modal .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 40px;
        }
        .custom-modal .ant-select-selection-placeholder,
        .custom-modal .ant-input::placeholder {
          color: #6C757D;
        }
        .upload-resume {
          background: #F8F9FA;
          padding: 16px;
          border-radius: 8px;
        }
        .upload-resume p {
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
};

export default JobDetails; 