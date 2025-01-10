import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, InputNumber, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CreateCandidateModal = ({ visible, onCancel, onSuccess, initialValues }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const authState = useSelector((state) => state.user.loginvalue);

  useEffect(() => {
    if (visible) {
      fetchActiveJobs();
      // Set initial values when modal becomes visible
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  const fetchActiveJobs = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) return;

    try {
      const response = await apiServices(
        "GET",
        'job/list?status=ACTIVE',
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
        const jobs = response.data.data.docs || [];
        setActiveJobs(jobs);
      } else {
        message.error('Failed to fetch available jobs');
      }
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      message.error('Failed to fetch available jobs');
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
      
      // Add basic fields
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('email', values.email);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('appliedDate', values.appliedDate.format('YYYY-MM-DD'));
      formData.append('noticePeriod', values.noticePeriod);
      formData.append('source', values.source);

      // Add numeric fields as numbers
      formData.append('experience', Number(values.experience));
      formData.append('currentSalary', Number(values.currentSalary));
      formData.append('expectedSalary', Number(values.expectedSalary));

      // Add job related fields
      if (values.appliedFor) {
        const selectedJob = activeJobs.find(job => job._id === values.appliedFor);
        if (selectedJob) {
          formData.append('appliedFor', selectedJob._id);
          formData.append('jobTitle', selectedJob.title);
          formData.append('department', selectedJob.department || '');
        }
      }

      // Add resume file if it exists
      if (values.resume?.[0]?.originFileObj) {
        formData.append('resume', values.resume[0].originFileObj);
      }

      // Log formData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
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
        form.resetFields();
        setResumeFile(null);
        setFileList([]);
        onSuccess();
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

  const handleCancel = () => {
    form.resetFields();
    setResumeFile(null);
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title="Add New Candidate"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
              name="appliedFor"
              label={<>Applied For <span className="text-danger">*</span></>}
              rules={[{ required: true, message: 'Please select job position' }]}
            >
              <Select
                placeholder="Select Job Position"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {activeJobs.map(job => (
                  <Select.Option key={job._id} value={job._id}>
                    {job.title} {job.department ? `- ${job.department}` : ''}
                  </Select.Option>
                ))}
              </Select>
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
        </div>

        <div className="row">
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
        </div>

        <div className="row">
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
            onClick={handleCancel} 
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

      <style jsx global>{`
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
    </Modal>
  );
};

export default CreateCandidateModal; 