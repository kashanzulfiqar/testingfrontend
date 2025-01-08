import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Tabs, Spin, message, Tag, Button, Modal, Form, Input, DatePicker, InputNumber, Select, Upload } from 'antd';
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
  UserOutlined,
  UploadOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const authState = useSelector((state) => state.user.loginvalue);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [fileList, setFileList] = useState([]);

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
      console.log('Making API request to fetch job candidates...');
      const response = await apiServices(
        "GET",
        `candidate/list?appliedFor=${jobId}`,
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      console.log('Job candidates API response:', response);

      if (response?.data?.status) {
        console.log('Job candidates fetched successfully:', response.data.data.docs);
        setCandidates(response.data.data.docs || []);
      }
    } catch (error) {
      console.error('Error fetching job candidates:', error);
    }
  };

  const handleAddCandidate = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    modalForm.resetFields();
    setResumeFile(null);
    setFileList([]);
    setIsModalVisible(false);
  };

  const handleModalSubmit = async (values) => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      
      // Validate salary
      if (Number(values.expectedSalary) < Number(values.currentSalary)) {
        message.error('Expected salary cannot be less than current salary');
        return;
      }

      // Validate applied date
      const appliedDate = values.appliedDate.toDate();
      const today = new Date();
      if (appliedDate > today) {
        message.error('Applied date cannot be in the future');
        return;
      }

      const formData = new FormData();
      
      // Set the jobId to the current job
      const formValues = {
        ...values,
        jobId: jobId, // Use the current job's ID
      };

      // Add all non-file fields
      Object.keys(formValues).forEach(key => {
        if (key !== 'resume') {
          if (key === 'appliedDate') {
            formData.append(key, formValues[key].format('YYYY-MM-DD'));
          } else {
            formData.append(key, formValues[key]);
          }
        }
      });

      // Add resume file if it exists
      if (values.resume?.length > 0) {
        const file = values.resume[0].originFileObj;
        formData.append('resume', file);
      }

      const response = await apiServices(
        "POST",
        'candidate/create',
        formData,
        {
          access_token: {
            accessToken: token
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response?.data?.status) {
        message.success('Candidate added successfully');
        modalForm.resetFields();
        setResumeFile(null);
        setFileList([]);
        setIsModalVisible(false);
        fetchJobCandidates(); // Refresh the candidates list
      } else {
        if (response?.data?.message === 'Email already exists') {
          message.error('A candidate with this email already exists');
        } else if (response?.data?.errors) {
          const errors = response.data.errors;
          const errorMessages = Object.values(errors).join(', ');
          message.error(`Validation failed: ${errorMessages}`);
        } else {
          message.error(response?.data?.message || 'Failed to add candidate');
        }
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        navigate('/login');
      } else if (error.response?.status === 409) {
        message.error('A candidate with this email already exists');
      } else if (error.response?.status === 400) {
        message.error(error.response?.data?.message || 'Invalid input data');
      } else {
        message.error('Error adding candidate. Please try again');
      }
    } finally {
      setSubmitting(false);
    }
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
    },
    {
      key: 'interview',
      label: (
        <div style={{ padding: '8px 0' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Interview</span>
        </div>
      ),
      children: <div>Interview schedule and details will be shown here</div>,
    },
    {
      key: 'timeline',
      label: (
        <div style={{ padding: '8px 0' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>Timeline</span>
        </div>
      ),
      children: <div>Job timeline and updates will be shown here</div>,
    },
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
      <Modal
        title="Add New Candidate"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
        className="custom-modal"
      >
        <Form
          form={modalForm}
          layout="vertical"
          onFinish={handleModalSubmit}
          initialValues={{
            appliedDate: moment(),
          }}
        >
          <div className="upload-resume mb-4">
            <p>If you have a resume, upload the resume first. We will automatically pickup all the details.</p>
            <Form.Item
              name="resume"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e?.fileList || [];
              }}
            >
              <Upload
                name="resume"
                maxCount={1}
                beforeUpload={(file) => {
                  // Validate file size (5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    message.error('Resume file size should not exceed 5MB');
                    return false;
                  }
                  
                  // Validate file type
                  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                  if (!allowedTypes.includes(file.type)) {
                    message.error('Only PDF, DOC, and DOCX files are allowed');
                    return false;
                  }
                  
                  setResumeFile(file);
                  return false;
                }}
                onRemove={() => {
                  setResumeFile(null);
                  return true;
                }}
                fileList={fileList}
                onChange={({ fileList: newFileList }) => {
                  setFileList(newFileList);
                }}
              >
                <Button icon={<UploadOutlined />} disabled={fileList.length > 0}>
                  Upload Resume
                </Button>
              </Upload>
            </Form.Item>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="firstName"
                label={<>First Name <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please enter first name' },
                  { min: 2, message: 'First name must be at least 2 characters' },
                  { max: 50, message: 'First name cannot exceed 50 characters' },
                  { pattern: /^[a-zA-Z\s-]+$/, message: 'First name can only contain letters, spaces and hyphens' }
                ]}
              >
                <Input placeholder="Enter Name" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="lastName"
                label={<>Last Name <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please enter last name' },
                  { min: 2, message: 'Last name must be at least 2 characters' },
                  { max: 50, message: 'Last name cannot exceed 50 characters' },
                  { pattern: /^[a-zA-Z\s-]+$/, message: 'Last name can only contain letters, spaces and hyphens' }
                ]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="email"
                label={<>Email <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter Email" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="phoneNumber"
                label={<>Phone Number <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { min: 10, message: 'Phone number must be at least 10 digits' },
                  { max: 15, message: 'Phone number cannot exceed 15 digits' },
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' }
                ]}
              >
                <Input placeholder="Enter Number" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="appliedDate"
                label={<>Applied Date <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please select date' },
                  { 
                    validator: (_, value) => {
                      if (value && value.isAfter(moment())) {
                        return Promise.reject('Applied date cannot be in the future');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="Select Date" disabledDate={date => date.isAfter(moment())} />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="experience"
                label={<>Experience (Years) <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please enter experience' },
                  { type: 'number', min: 0, message: 'Experience cannot be negative' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Enter Experience" min={0} precision={1} />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="currentSalary"
                label={<>Current Salary <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please enter current salary' },
                  { type: 'number', min: 0, message: 'Salary cannot be negative' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Enter Current Salary" min={0} />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="expectedSalary"
                label={<>Expected Salary <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please enter expected salary' },
                  { type: 'number', min: 0, message: 'Salary cannot be negative' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Enter Expected Salary" min={0} />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="noticePeriod"
                label={<>Notice Period <span className="text-danger">*</span></>}
                rules={[{ required: true, message: 'Please select notice period' }]}
              >
                <Select placeholder="Select Notice Period">
                  <Select.Option value="IMMEDIATE">Immediate</Select.Option>
                  <Select.Option value="15_DAYS">15 Days</Select.Option>
                  <Select.Option value="30_DAYS">30 Days</Select.Option>
                  <Select.Option value="60_DAYS">60 Days</Select.Option>
                  <Select.Option value="90_DAYS">90 Days</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="source"
                label={<>Source <span className="text-danger">*</span></>}
                rules={[{ required: true, message: 'Please select source' }]}
              >
                <Select placeholder="Select source">
                  <Select.Option value="LINKEDIN">LinkedIn</Select.Option>
                  <Select.Option value="WEBSITE">Website</Select.Option>
                  <Select.Option value="REFERRAL">Referral</Select.Option>
                  <Select.Option value="OTHER">Other</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <Form.Item className="text-end mt-3">
            <Button 
              onClick={handleModalCancel} 
              style={{ 
                marginRight: 12,
                padding: '6px 24px',
                height: '40px',
                borderRadius: '20px',
                background: '#F8F9FA',
                border: 'none'
              }}
            >
              Reset
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              style={{ 
                padding: '6px 24px',
                height: '40px',
                borderRadius: '20px',
                background: '#F4A261',
                border: 'none'
              }}
            >
              Add Candidate
            </Button>
          </Form.Item>
        </Form>
      </Modal>

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