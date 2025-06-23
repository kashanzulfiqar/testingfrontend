import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Form, message, Spin } from 'antd';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import { handleApiError } from '../../utils/errorHandler';
import JobForm from './JobForm';

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const authState = useSelector((state) => state.user.loginvalue);
  const [originalJobData, setOriginalJobData] = useState(null);

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
        const jobData = response.data.data;
        setOriginalJobData(jobData);
        form.setFieldsValue({
          title: jobData.title,
          department: jobData.department,
          jobType: jobData.jobType,
          workSetup: jobData.workSetup,
          salaryRange: jobData.salaryRange,
          positions: jobData.positions,
          description: jobData.description,
          postingPlatforms: jobData.postingPlatforms || ['WEBSITE']
        });
      } else {
        message.error('Failed to fetch job details');
        navigate('/recruitment/jobs');
      }
    } catch (error) {
      handleApiError(error);
      navigate('/recruitment/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      
      const jobData = {
        jobId: jobId,
        ...values,
        status: 'ACTIVE'
      };

      console.log('Updating job with data:', jobData);

      const response = await apiServices(
        "PUT",
        `job/${jobData.jobId}`,
        jobData,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.status) {
        message.success('Job updated successfully');
        navigate('/recruitment/jobs');
      } else {
        message.error(response?.data?.message || 'Failed to update job');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Edit Job</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/recruitment/jobs">Jobs</Link></li>
              <li className="breadcrumb-item active">Edit Job</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <Card className='job-card'>
            <Spin spinning={loading}>
              <JobForm
                form={form}
                onFinish={handleSubmit}
                onCancel={() => navigate('/recruitment/jobs')}
                loading={submitting}
                isEdit={true}
                initialValues={originalJobData}
              />
            </Spin>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .job-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e0e3e6;
        }
      `}</style>
    </div>
  );
};

export default EditJob; 