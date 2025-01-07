import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Select, Input, Modal, Form, message, Spin, Tag, DatePicker, Upload, InputNumber, Dropdown, Menu } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, UploadOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const { TextArea } = Input;

const Candidates = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const authState = useSelector((state) => state.user.loginvalue);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Please login again to continue');
      navigate('/login');
      return;
    }
    
    fetchCandidates();
    fetchActiveJobs();
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchCandidates = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        name: filters.name,
        appliedFor: filters.appliedFor,
        status: filters.status,
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => 
        !queryParams[key] && delete queryParams[key]
      );

      const response = await apiServices(
        "GET", 
        `candidate/list?${new URLSearchParams(queryParams).toString()}`, 
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
        const candidateData = response.data.data;
        console.log('Full Candidate Response:', response.data);
        console.log('Candidate Data:', candidateData.docs);
        console.log('Active Jobs State:', activeJobs);
        
        // Map through candidates to check job IDs
        const candidatesWithJobs = candidateData.docs.map(candidate => {
          console.log('Checking candidate job:', candidate.jobId);
          const matchedJob = activeJobs.find(job => job._id === candidate.jobId);
          console.log('Matched job:', matchedJob);
          return candidate;
        });

        setCandidates(candidatesWithJobs || []);
        setPagination(prev => ({
          ...prev,
          total: candidateData.total || 0
        }));
      } else {
        // Handle specific error cases
        if (response?.data?.message === 'Invalid token') {
          message.error('Session expired. Please login again');
          navigate('/login');
        } else {
          message.error(response?.data?.message || 'Failed to fetch candidates');
        }
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        navigate('/login');
      } else {
        message.error('Error fetching candidates. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveJobs = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      return;
    }

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
        console.log('Active Jobs:', response.data.data.docs);
        setActiveJobs(response.data.data.docs || []);
      }
    } catch (error) {
      console.error('Error fetching active jobs:', error);
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
    
    // If there's sorting, update the API call
    if (sorter && sorter.field) {
      const order = sorter.order === 'descend' ? -1 : 1;
      setFilters(prev => ({
        ...prev,
        sort: `${sorter.field}:${order}`
      }));
    } else {
      // Remove sorting if no sorter
      const { sort, ...restFilters } = filters;
      setFilters(restFilters);
    }
  };

  const handleSearch = (values) => {
    setPagination({
      ...pagination,
      current: 1 // Reset to first page when searching
    });
    setFilters(values);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({});
    setPagination({
      ...pagination,
      current: 1
    });
  };

  const handleDeleteCandidate = async (candidateId) => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await apiServices(
        "DELETE", 
        `candidate/${candidateId}`,
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
        message.success('Candidate deleted successfully');
        // Refresh the list
        fetchCandidates();
      } else {
        // Handle specific error cases
        if (response?.data?.message === 'Invalid token') {
          message.error('Session expired. Please login again');
          navigate('/login');
        } else if (response?.data?.message === 'Candidate not found') {
          message.error('Candidate not found');
          // Refresh the list as the candidate might have been deleted by another user
          fetchCandidates();
        } else {
          message.error(response?.data?.message || 'Failed to delete candidate');
        }
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        navigate('/login');
      } else if (error.response?.status === 404) {
        message.error('Candidate not found');
        // Refresh the list as the candidate might have been deleted by another user
        fetchCandidates();
      } else {
        message.error('Error deleting candidate. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    modalForm.resetFields();
    setResumeFile(null);
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
      
      // Map appliedFor to jobId
      const formValues = {
        ...values,
        jobId: values.appliedFor, // Map appliedFor to jobId
      };
      delete formValues.appliedFor; // Remove the original appliedFor field

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
        console.log('Appending resume file:', file);
        formData.append('resume', file);
      }

      // Log the FormData contents for debugging
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1]);
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
        fetchCandidates();
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

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Link to={`/recruitment/candidates/${record._id}`} className="text-primary">
          {`${record.firstName} ${record.lastName}`}
        </Link>
      ),
      sorter: true,
    },
    {
      title: 'Applied For',
      dataIndex: 'appliedFor',
      key: 'appliedFor',
      render: (appliedFor) => {
        if (appliedFor?.title) {
          return `${appliedFor.title}${appliedFor.department ? ` - ${appliedFor.department}` : ''}`;
        }
        return 'N/A';
      },
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      render: (experience) => `${experience} years`,
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'NEW' ? 'blue' :
          status === 'SCREENING' ? 'orange' :
          status === 'SHORTLISTED' ? 'green' :
          status === 'REJECTED' ? 'red' :
          status === 'HIRED' ? 'purple' : 'default'
        }>
          {status?.charAt(0) + status?.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item 
                key="edit" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/recruitment/candidates/${record._id}/edit`)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete Candidate',
                    content: 'Are you sure you want to delete this candidate? This action cannot be undone.',
                    okText: 'Yes, Delete',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk: () => handleDeleteCandidate(record._id),
                    okButtonProps: {
                      loading: loading
                    }
                  });
                }}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined style={{ 
              transform: 'rotate(90deg)',
              fontSize: '16px',
              color: '#6C757D'
            }} />}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              border: 'none',
              background: 'transparent'
            }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="content container-fluid">
      {/* Page Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Candidates</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Candidates</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto">
            <Button
              className="btn add-btn"
              onClick={handleAddCandidate}
              icon={<PlusOutlined />}
            >
              Add Candidate
            </Button>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <Form 
        form={form}
        onFinish={handleSearch} 
        className="row filter-row"
        initialValues={filters}
      >
        <div className="col-sm-6 col-md-3">
          <Form.Item name="name">
            <Input placeholder="Candidate Name" allowClear />
          </Form.Item>
        </div>
        <div className="col-sm-6 col-md-3">
          <Form.Item name="appliedFor">
            <Select
              placeholder="Applied Position"
              allowClear
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
        <div className="col-sm-6 col-md-3">
          <Form.Item name="status">
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              allowClear
              options={[
                { value: 'NEW', label: 'New' },
                { value: 'SCREENING', label: 'Screening' },
                { value: 'SHORTLISTED', label: 'Shortlisted' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'HIRED', label: 'Hired' }
              ]}
            />
          </Form.Item>
        </div>
        <div className="col-sm-6 col-md-3">
          <Form.Item>
            <div className="d-flex gap-2">
              <Button type="primary" htmlType="submit" className="btn btn-success flex-grow-1">
                Search
              </Button>
              <Button onClick={handleReset} className="flex-grow-1">
                Reset
              </Button>
            </div>
          </Form.Item>
        </div>
      </Form>

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
                rules={[
                  { required: true, message: 'Please select position' }
                ]}
              >
                <Select
                  placeholder="Select Position"
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
                name="status"
                label={<>Application Status <span className="text-danger">*</span></>}
                rules={[{ required: true, message: 'Please select status' }]}
                initialValue="NEW"
              >
                <Select placeholder="Select Status">
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
                    validator: (_, value) => {
                      if (value === undefined || value === null) {
                        return Promise.reject('Please enter experience');
                      }
                      if (isNaN(value)) {
                        return Promise.reject('Please enter a valid number');
                      }
                      if (value < 0) {
                        return Promise.reject('Experience cannot be negative');
                      }
                      if (value > 50) {
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
                    validator: (_, value) => {
                      if (value === undefined || value === null) {
                        return Promise.reject('Please enter current salary');
                      }
                      if (isNaN(value)) {
                        return Promise.reject('Please enter a valid number');
                      }
                      if (value < 0) {
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
                  precision={0}
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
                    validator: (_, value) => {
                      if (value === undefined || value === null) {
                        return Promise.reject('Please enter expected salary');
                      }
                      if (isNaN(value)) {
                        return Promise.reject('Please enter a valid number');
                      }
                      if (value < 0) {
                        return Promise.reject('Salary cannot be negative');
                      }
                      const currentSalary = modalForm.getFieldValue('currentSalary');
                      if (currentSalary && value < currentSalary) {
                        return Promise.reject('Expected salary must be greater than or equal to current salary');
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
                  precision={0}
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

      {/* Add some global styles */}
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
        .custom-modal .ant-picker {
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

      {/* Candidates Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="table-responsive">
            <Spin spinning={loading}>
              <Table 
                className="table-striped"
                columns={columns}
                dataSource={candidates}
                rowKey="_id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  pageSizeOptions: ['10', '20', '50']
                }}
                onChange={handleTableChange}
              />
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Candidates; 