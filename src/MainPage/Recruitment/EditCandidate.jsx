import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Spin, message, Select, DatePicker, Upload, InputNumber } from 'antd';
import { LeftOutlined, UploadOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';
import backBtn from '../../assets/iconsRecruitment/arrow-left.svg';

const EditCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const authState = useSelector((state) => state.user.loginvalue);
  const [fileList , setFileList] = useState([]);

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
        const candidate = response.data.data;
        const formattedCandidate = {
          ...candidate,
          appliedFor: candidate.appliedFor?.title || candidate.appliedFor,
          appliedDate: moment(candidate.appliedDate)
        };
        setInitialValues(formattedCandidate);
        form.setFieldsValue(formattedCandidate);
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

  const handleSubmit = async (values) => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      
      // Convert salary values to numbers for comparison
      const currentSalary = Number(values.currentSalary);
      const expectedSalary = Number(values.expectedSalary);
      
      // Validate salary
      if (expectedSalary < currentSalary) {
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
      
      // Only append changed fields
      Object.keys(values).forEach(key => {
        if (key === 'appliedDate') {
          const newDate = values[key].format('YYYY-MM-DD');
          const oldDate = moment(initialValues[key]).format('YYYY-MM-DD');
          if (newDate !== oldDate) {
            formData.append(key, newDate);
          }
        } else if (values[key] !== initialValues[key]) {
          if (typeof values[key] === 'string') {
            formData.append(key, values[key].trim());
          } else if (typeof values[key] === 'number') {
            formData.append(key, values[key].toString());
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Append new resume if selected
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      // Don't send request if nothing changed
      if (formData.entries().next().done && !resumeFile) {
        message.info('No changes to update');
        return;
      }

      const response = await apiServices(
        "PUT",
        `candidate/${id}`,
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
        message.success('Candidate updated successfully');
        navigate(`/recruitment/candidates/${id}`);
        setFileList([]);
      } else {
        // Handle specific error cases
        if (response?.data?.message === 'Email already exists') {
          message.error('A candidate with this email already exists');
        } else if (response?.data?.errors) {
          // Display validation errors
          const errors = response.data.errors;
          const errorMessages = Object.values(errors).join(', ');
          message.error(`Validation failed: ${errorMessages}`);
        } else {
          message.error(response?.data?.message || 'Failed to update candidate');
        }
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        navigate('/login');
      } else if (error.response?.status === 409) {
        message.error('A candidate with this email already exists');
      } else if (error.response?.status === 400) {
        message.error(error.response?.data?.message || 'Invalid input data');
      } else {
        message.error('Error updating candidate. Please try again');
      }
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Edit Candidate</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/recruitment/candidates">Candidates</Link></li>
                <li className="breadcrumb-item active">Edit Candidate</li>
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

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Edit Candidate</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/recruitment/candidates">Candidates</Link></li>
              <li className="breadcrumb-item active">Edit</li>
            </ul>
            {/* <div style={{height:'20px' , width:"20px"}} onClick={()=>{navigate(`/recruitment/candidates/${id}`)}}>
              <img src={backBtn} style={{height:"100%" ,width:"100%"}}></img>
            </div> */}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={initialValues}
            >
            <div className="upload-resume mb-4">
              <p>
                If you have a resume, upload the resume first. We will automatically
                pickup all the details.
              </p>
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
                setFileList([]);
                return true;
                }}
              >
                <Button className='resume-upload-btn' disabled={fileList.length > 0}>
                  Upload Resume
                </Button>
              </Upload>
            </div>
              {/* <div className="upload-resume mb-4">
                <p>Current Resume: {initialValues?.resume ? <a href={initialValues.resume} target="_blank" rel="noopener noreferrer">View Resume</a> : 'No resume uploaded'}</p>
                <Upload
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
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload New Resume</Button>
                </Upload>
              </div> */}

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
                    name="appliedFor"
                    label={<>Applied For <span className="text-danger">*</span></>}
                    rules={[
                      { required: true, message: 'Please enter position' },
                      { min: 2, message: 'Position must be at least 2 characters' },
                      { max: 100, message: 'Position cannot exceed 100 characters' }
                    ]}
                  >
                    <Input placeholder="Enter Position" />
                  </Form.Item>
                </div>
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
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="status"
                    label={<>Application Status <span className="text-danger">*</span></>}
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select className="customized" placeholder="Select Status">
                      <Select.Option value="NEW">New</Select.Option>
                      <Select.Option value="SCREENING">Screening</Select.Option>
                      <Select.Option value="SHORTLISTED">Shortlisted</Select.Option>
                      <Select.Option value="REJECTED">Rejected</Select.Option>
                      <Select.Option value="HIRED">Hired</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="experience"
                    label={<>Experience <span className="text-danger">*</span></>}
                    rules={[
                      { required: true, message: 'Please enter experience' },
                      { 
                        type: 'number',
                        transform: (value) => Number(value),
                        message: 'Please enter a valid number' 
                      },
                      { 
                        validator: (_, value) => {
                          const numValue = Number(value);
                          if (isNaN(numValue) || numValue < 0) {
                            return Promise.reject('Experience cannot be negative');
                          }
                          if (numValue > 50) {
                            return Promise.reject('Experience cannot exceed 50 years');
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="Enter years of experience" 
                      step={0.5}
                      min={0}
                      max={50}
                      precision={1}
                    />
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
                      { 
                        type: 'number',
                        transform: (value) => {
                          if (value === '' || value === null || value === undefined) return null;
                          const num = Number(value);
                          return isNaN(num) ? null : num;
                        },
                        message: 'Please enter a valid number' 
                      },
                      { 
                        validator: (_, value) => {
                          if (value === null || value === undefined) return Promise.resolve();
                          const num = Number(value);
                          if (num < 0) {
                            return Promise.reject('Salary cannot be negative');
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="e.g. 20000" 
                      min={0}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="expectedSalary"
                    label={<>Expected Salary <span className="text-danger">*</span></>}
                    rules={[
                      { required: true, message: 'Please enter expected salary' },
                      { 
                        type: 'number',
                        transform: (value) => {
                          if (value === '' || value === null || value === undefined) return null;
                          const num = Number(value);
                          return isNaN(num) ? null : num;
                        },
                        message: 'Please enter a valid number' 
                      },
                      { 
                        validator: (_, value) => {
                          if (value === null || value === undefined) return Promise.resolve();
                          const num = Number(value);
                          if (num < 0) {
                            return Promise.reject('Salary cannot be negative');
                          }
                          const currentSalary = form.getFieldValue('currentSalary');
                          if (currentSalary !== null && currentSalary !== undefined) {
                            const currentNum = Number(currentSalary);
                            if (num < currentNum) {
                              return Promise.reject('Expected salary must be greater than or equal to current salary');
                            }
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="e.g. 30000" 
                      min={0}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
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
                    <Select className='customized' placeholder="Select Notice Period">
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
                    <Select className='customized' placeholder="Select source">
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
                  onClick={() => navigate(`/recruitment/candidates/${id}`)}
                  style={{ 
                    marginRight: 12,
                    padding: '6px 24px',
                    height: '40px',
                    borderRadius: '20px',
                    background: '#F8F9FA',
                    border: 'none'
                  }}
                >
                  Cancel
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
                  Update Candidate
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .ant-form-item-label > label {
          font-weight: 500;
        }
        .ant-input,
        .ant-picker,
        .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }

        .ant-select-selection-placeholder,
        .ant-input::placeholder {
          color: #6C757D;
        }

        .upload-resume {
          padding: 16px;
          padding-left: 3px;
          border-top: 1px solid #eef0f1;
          border-bottom: 1px solid #eef0f1;
        }
        .upload-resume p {
          margin-bottom: 12px;
        }

        .resume-upload-btn{
          border: 1px solid #ff9244;
          border-radius: 40px;
          color: #ff9244;
        }

        .ant-card {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .customized .ant-select-selector{
        height: 56px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        padding-left: 10px;
        }
      `}</style>
    </div>
  );
};

export default EditCandidate; 