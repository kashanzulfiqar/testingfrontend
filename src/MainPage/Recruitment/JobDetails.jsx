import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Tag, message, Spin, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const authState = useSelector((state) => state.user.loginvalue);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
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
        `job/${jobId}`,
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.status) {
        setJob(response.data.data);
      } else {
        message.error('Failed to fetch job details');
        navigate('/recruitment/jobs');
      }
    } catch (error) {
      message.error('Error fetching job details');
      navigate('/recruitment/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    try {
      setLoading(true);
      const response = await apiServices(
        "DELETE", 
        `job/${jobId}`,
        null, 
        {
          access_token: {
            accessToken: token
          }
        }
      );
      if (response?.data?.status) {
        message.success('Job deleted successfully');
        navigate('/recruitment/jobs');
      } else {
        message.error(response?.data?.message || 'Failed to delete job');
      }
    } catch (error) {
      message.error('Error deleting job');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return moment(date).format('DD MMM YYYY, hh:mm a');
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
            <h3 className="page-title">Job Details</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/recruitment/jobs">Jobs</Link></li>
              <li className="breadcrumb-item active">Job Details</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto">
            <div className="btn-group">
              <Button
                className="btn add-btn me-1"
                onClick={() => navigate(`/recruitment/jobs/${jobId}/edit`)}
                icon={<EditOutlined />}
              >
                Edit Job
              </Button>
              <Button
                className="btn add-btn"
                type="primary"
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete Job',
                    content: 'Are you sure you want to delete this job? This action cannot be undone.',
                    okText: 'Yes, Delete',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk: handleDeleteJob
                  });
                }}
                icon={<DeleteOutlined />}
              >
                Delete Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card title="Job Information" className="mb-4">
            <div className="job-info">
              <h2>{job?.title}</h2>
              <div className="job-meta mb-4">
                <Tag color="blue">{job?.department}</Tag>
                <Tag color={
                  job?.jobType === 'FULL_TIME' ? 'blue' :
                  job?.jobType === 'PART_TIME' ? 'green' :
                  job?.jobType === 'CONTRACT' ? 'orange' :
                  job?.jobType === 'INTERNSHIP' ? 'purple' :
                  job?.jobType === 'FREELANCE' ? 'cyan' : 'default'
                }>
                  {job?.jobType?.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                </Tag>
                <Tag color={
                  job?.workSetup === 'ONSITE' ? 'red' :
                  job?.workSetup === 'REMOTE' ? 'green' :
                  job?.workSetup === 'HYBRID' ? 'blue' : 'default'
                }>
                  {job?.workSetup?.charAt(0) + job?.workSetup?.slice(1).toLowerCase()}
                </Tag>
              </div>
              
              <div className="job-description mb-4">
                <h4>Job Description</h4>
                <p>{job?.description}</p>
              </div>

              <div className="job-details">
                <div className="row">
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Salary Range</label>
                      <p>{job?.salaryRange}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item">
                      <label>Number of Positions</label>
                      <p>{job?.positions}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Applications" className="mb-4">
            <div className="applications-info">
              <div className="d-flex justify-content-between align-items-center">
                <h4>Total Applications</h4>
                <Tag color="blue" style={{ fontSize: '16px' }}>
                  {job?.applicationCount || 0} applications
                </Tag>
              </div>
              <Link 
                to={`/recruitment/jobs/${jobId}/applications`}
                className="btn btn-primary mt-3"
              >
                View All Applications
              </Link>
            </div>
          </Card>
        </div>

        <div className="col-md-4">
          <Card title="Job Status" className="mb-4">
            <div className="status-info">
              <Tag color={
                job?.status === 'ACTIVE' ? 'green' : 'red'
              } style={{ fontSize: '14px', padding: '4px 12px' }}>
                {job?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Tag>
            </div>
          </Card>

          <Card title="Posting Information" className="mb-4">
            <div className="posting-info">
              <div className="info-item">
                <label>Posted Date</label>
                <p>{formatDate(job?.createdAt)}</p>
              </div>
              <div className="info-item">
                <label>Last Modified</label>
                <p>{formatDate(job?.updatedAt)}</p>
              </div>
              <div className="info-item">
                <label>Posted On</label>
                <div className="platform-tags">
                  {job?.postingPlatforms?.map(platform => (
                    <Tag key={platform} color="blue">
                      {platform?.charAt(0) + platform?.slice(1).toLowerCase()}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .job-info h2 {
          font-size: 24px;
          margin-bottom: 16px;
        }
        .job-meta {
          margin-bottom: 24px;
        }
        .job-meta .ant-tag {
          margin-right: 8px;
          font-size: 14px;
          padding: 4px 12px;
        }
        .info-item {
          margin-bottom: 16px;
        }
        .info-item label {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
          color: #6c757d;
        }
        .info-item p {
          margin: 0;
          font-size: 14px;
        }
        .platform-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .applications-info {
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default JobDetails; 