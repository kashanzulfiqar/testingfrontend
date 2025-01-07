import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Descriptions, Button, Modal, message, Spin, Tag, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, ShareAltOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { jobsService } from '../../Services/jobsService';
import { useSelector } from 'react-redux';
import { handleApiError, isSessionExpired } from '../../utils/errorHandler';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobsService.getJobDetails(jobId, authState.token, navigate);
      setJob(response.data);
    } catch (error) {
      if (!isSessionExpired(error)) {
        message.error('Failed to fetch job details');
      }
      navigate('/recruitment/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Job',
      content: 'Are you sure you want to delete this job? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          await jobsService.deleteJob(jobId, authState.token, navigate);
          message.success('Job deleted successfully');
          navigate('/recruitment/jobs');
        } catch (error) {
          if (!isSessionExpired(error)) {
            message.error('Failed to delete job');
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      await jobsService.postToSocialMedia(jobId, ['linkedin', 'twitter'], authState.token, navigate);
      message.success('Job shared to social media successfully');
      fetchJobDetails(); // Refresh to get updated sharing status
    } catch (error) {
      if (!isSessionExpired(error)) {
        message.error('Failed to share job');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Job Details</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/recruitment/jobs">Jobs</Link></li>
                <li className="breadcrumb-item active">Job Details</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 text-center">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Job Details</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/jobs">Jobs</Link></li>
              <li className="breadcrumb-item active">Job Details</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto">
            <Button.Group>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/recruitment/jobs')}
              >
                Back
              </Button>
              <Button 
                icon={<EditOutlined />}
                type="primary"
                onClick={() => navigate(`/recruitment/jobs/${jobId}/edit`)}
              >
                Edit
              </Button>
              <Button 
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                disabled={job.socialMediaStatus?.isShared}
              >
                Share
              </Button>
              <Button 
                icon={<DeleteOutlined />}
                danger
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Button.Group>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <Card>
            <Descriptions title="Job Information" bordered>
              <Descriptions.Item label="Title" span={3}>{job.title}</Descriptions.Item>
              <Descriptions.Item label="Department">{job.department}</Descriptions.Item>
              <Descriptions.Item label="Job Type">{job.jobType}</Descriptions.Item>
              <Descriptions.Item label="Work Setup">{job.workSetup}</Descriptions.Item>
              <Descriptions.Item label="Salary Range">{job.salaryRange}</Descriptions.Item>
              <Descriptions.Item label="Positions">{job.positions}</Descriptions.Item>
              <Descriptions.Item label="Applications">
                <Tag color="blue">{job.applications || 0} applications</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>{job.description}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Company Information" bordered>
              <Descriptions.Item label="Company Name">{job.company?.name}</Descriptions.Item>
              <Descriptions.Item label="Location">{job.company?.location}</Descriptions.Item>
              <Descriptions.Item label="Website">{job.company?.website}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Social Media Status" bordered>
              <Descriptions.Item label="Shared Status">
                <Tag color={job.socialMediaStatus?.isShared ? 'green' : 'orange'}>
                  {job.socialMediaStatus?.isShared ? 'Shared' : 'Not Shared'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Platforms" span={2}>
                {job.socialMediaStatus?.platforms?.map(platform => (
                  <Tag key={platform} color="blue">{platform}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="Last Shared">
                {job.socialMediaStatus?.lastSharedDate || 'Never'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Additional Information" bordered>
              <Descriptions.Item label="Created By">{job.createdBy?.name}</Descriptions.Item>
              <Descriptions.Item label="Created Date">{job.createdDate}</Descriptions.Item>
              <Descriptions.Item label="Last Updated">{job.updatedDate}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={job.status === 'active' ? 'green' : 'red'}>
                  {job.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetails; 