import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Select, Input, Modal, Form, message, Spin, Tag, InputNumber, Checkbox, Dropdown, Menu } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import { isSessionExpired } from '../../utils/errorHandler';

const { TextArea } = Input;

const Jobs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.user.loginvalue);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message.error('Session expired. Please login again.');
          navigate('/login');
          break;
        case 403:
          message.error('You do not have permission to access this resource.');
          break;
        case 500:
          message.error('Server error occurred. Please try again later.');
          break;
        default:
          message.error(error.response.data?.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      message.error('Network error. Please check your connection.');
    } else {
      message.error('An unexpected error occurred.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found');
      message.error('Please login again to continue');
      navigate('/login');
      return;
    }
    
    fetchJobs();
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('Attempted to fetch jobs without auth token');
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        title: filters.jobTitle,
        jobType: filters.jobType,
        workSetup: filters.workSetup,
      };

      // Remove undefined or empty values
      Object.keys(queryParams).forEach(key => 
        !queryParams[key] && delete queryParams[key]
      );

      console.log('Fetching jobs with params:', queryParams);

      const response = await apiServices(
        "GET", 
        `job/list?${new URLSearchParams(queryParams).toString()}`, 
        null, 
        {
          access_token: {
            accessToken: token
          }
        }
      );
      
      if (response?.data?.status) {
        console.log('Jobs fetched successfully:', {
          totalJobs: response.data.data.total,
          jobsReceived: response.data.data.docs.length
        });
        setJobs(response.data.data.docs || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total || 0
        }));
      } else {
        console.error('Failed to fetch jobs:', response?.data);
        message.error(response?.data?.message || 'Unable to load jobs at this time. Please try again later.');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 500) {
        message.error('The system is currently unavailable. Our team has been notified and is working on it.');
      } else {
        handleApiError(error);
      }
      
      setJobs([]);
      setPagination(prev => ({
        ...prev,
        total: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  const handleSearch = (values) => {
    setPagination({
      ...pagination,
      current: 1
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

  const handleDeleteJob = async (jobId) => {
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
        fetchJobs();
      } else {
        message.error(response?.data?.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Delete job error:', error.response?.data || error.message);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    modalForm.resetFields();
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
      
      const jobData = {
        title: values.title,
        department: values.department,
        jobType: values.jobType,
        workSetup: values.workSetup,
        salaryRange: values.salaryRange,
        positions: values.positions,
        description: values.description,
        status: 'ACTIVE',
        postingPlatforms: values.postingPlatforms || ['WEBSITE'],
        company: authState?.user?.companyId
      };

      console.log('Creating job with data:', jobData);

      const response = await apiServices(
        "POST",
        'job/create',
        jobData,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.status) {
        message.success('Job created successfully');
        modalForm.resetFields();
        setIsModalVisible(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        message.error(response?.data?.message || 'Failed to create job');
      }
    } catch (error) {
      console.error('Job creation error:', error.response?.data || error.message);
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/recruitment/jobs/${record._id}`}>{text}</Link>
      ),
      sorter: true,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: true,
    },
    {
      title: 'Job Type',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (jobType) => (
        <Tag color={
          jobType === 'FULL_TIME' ? 'blue' :
          jobType === 'PART_TIME' ? 'green' :
          jobType === 'CONTRACT' ? 'orange' :
          jobType === 'INTERNSHIP' ? 'purple' :
          jobType === 'FREELANCE' ? 'cyan' : 'default'
        }>
          {jobType?.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
        </Tag>
      ),
      filters: [
        { text: 'Full Time', value: 'FULL_TIME' },
        { text: 'Part Time', value: 'PART_TIME' },
        { text: 'Contract', value: 'CONTRACT' },
        { text: 'Internship', value: 'INTERNSHIP' },
        { text: 'Freelance', value: 'FREELANCE' },
      ],
    },
    {
      title: 'Work Setup',
      dataIndex: 'workSetup',
      key: 'workSetup',
      render: (workSetup) => (
        <Tag color={
          workSetup === 'ONSITE' ? 'red' :
          workSetup === 'REMOTE' ? 'green' :
          workSetup === 'HYBRID' ? 'blue' : 'default'
        }>
          {workSetup?.charAt(0) + workSetup?.slice(1).toLowerCase()}
        </Tag>
      ),
      filters: [
        { text: 'On-Site', value: 'ONSITE' },
        { text: 'Remote', value: 'REMOTE' },
        { text: 'Hybrid', value: 'HYBRID' },
      ],
    },
    {
      title: 'Salary Range',
      dataIndex: 'salaryRange',
      key: 'salaryRange',
      render: (salaryRange) => (
        <span>{salaryRange}</span>
      ),
      sorter: true,
    },
    {
      title: 'Positions',
      dataIndex: 'positions',
      key: 'positions',
      sorter: true,
    },
    {
      title: 'Posted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Applications',
      dataIndex: 'applicationCount',
      key: 'applicationCount',
      render: (count, record) => (
        <Link to={`/recruitment/jobs/${record._id}/applications`}>
          <Tag color="blue" style={{ cursor: 'pointer' }}>
            {count || 0} applications
          </Tag>
        </Link>
      ),
      sorter: true,
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
                onClick={() => navigate(`/recruitment/jobs/${record._id}/edit`)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete Job',
                    content: 'Are you sure you want to delete this job? This action cannot be undone.',
                    okText: 'Yes, Delete',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk: () => handleDeleteJob(record._id)
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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
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
          </div>
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
            <h3 className="page-title">Jobs</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Jobs</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto">
            <Button
              className="btn add-btn"
              onClick={handleAddJob}
              icon={<PlusOutlined />}
            >
              Add Job
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
          <Form.Item name="jobTitle">
            <Input placeholder="Job Title" allowClear />
          </Form.Item>
        </div>
        <div className="col-sm-6 col-md-3">
          <Form.Item name="jobType">
            <Select
              style={{ width: '100%' }}
              placeholder="Job Type"
              allowClear
              options={[
                { value: 'FULL_TIME', label: 'Full Time' },
                { value: 'PART_TIME', label: 'Part Time' },
                { value: 'CONTRACT', label: 'Contract' },
                { value: 'INTERNSHIP', label: 'Internship' },
                { value: 'FREELANCE', label: 'Freelance' }
              ]}
            />
          </Form.Item>
        </div>
        <div className="col-sm-6 col-md-3">
          <Form.Item name="workSetup">
            <Select
              style={{ width: '100%' }}
              placeholder="Work Setup"
              allowClear
              options={[
                { value: 'ONSITE', label: 'On-Site' },
                { value: 'REMOTE', label: 'Remote' },
                { value: 'HYBRID', label: 'Hybrid' }
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

      {/* Add Job Modal */}
      <Modal
        title="Add New Job"
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
            positions: 1,
            postingPlatforms: ['WEBSITE'],
            status: 'ACTIVE'
          }}
        >
          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="department"
                label={<>Department <span className="text-danger">*</span></>}
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Enter Department">
                  <Select.Option value="Engineering">Engineering</Select.Option>
                  <Select.Option value="Marketing">Marketing</Select.Option>
                  <Select.Option value="Sales">Sales</Select.Option>
                  <Select.Option value="HR">HR</Select.Option>
                  <Select.Option value="Finance">Finance</Select.Option>
                  <Select.Option value="Operations">Operations</Select.Option>
                  <Select.Option value="Design">Design</Select.Option>
                  <Select.Option value="Product">Product</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="title"
                label={<>Job Title <span className="text-danger">*</span></>}
                rules={[{ required: true, message: 'Please enter job title' }]}
              >
                <Input placeholder="Enter Job" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="jobType"
                label={<>Job Type <span className="text-danger">*</span></>}
                rules={[{ required: true, message: 'Please select job type' }]}
              >
                <Select placeholder="Full Time">
                  <Select.Option value="FULL_TIME">Full Time</Select.Option>
                  <Select.Option value="PART_TIME">Part Time</Select.Option>
                  <Select.Option value="CONTRACT">Contract</Select.Option>
                  <Select.Option value="INTERNSHIP">Internship</Select.Option>
                  <Select.Option value="FREELANCE">Freelance</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="workSetup"
                label={<>Work Setup <span className="text-danger">*</span></>}
                rules={[{ required: true, message: 'Please select work setup' }]}
              >
                <Select placeholder="On-site">
                  <Select.Option value="ONSITE">On-site</Select.Option>
                  <Select.Option value="REMOTE">Remote</Select.Option>
                  <Select.Option value="HYBRID">Hybrid</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="salaryRange"
                label={<>Salary Range <span className="text-danger">*</span></>}
                rules={[{ required: true, message: 'Please enter salary range' }]}
              >
                <Input placeholder="e.g. 10,000 - 20,000 USD" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="positions"
                label={<>No of . Positions <span className="text-danger">*</span></>}
                rules={[
                  { required: true, message: 'Please enter number of positions' },
                  { type: 'number', min: 1, message: 'Must be at least 1 position' }
                ]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="description"
            label={<>Job Description <span className="text-danger">*</span></>}
            rules={[{ required: true, message: 'Please enter job description' }]}
          >
            <TextArea rows={6} placeholder="Add Description" />
          </Form.Item>

          <Form.Item
            name="postingPlatforms"
            label="Post this Job on"
            initialValue={['WEBSITE']}
          >
            <Checkbox.Group>
              <div style={{ display: 'flex', gap: '24px' }}>
                <Checkbox value="FACEBOOK">Facebook</Checkbox>
                <Checkbox value="LINKEDIN">LinkedIn</Checkbox>
                <Checkbox value="WEBSITE">Website</Checkbox>
              </div>
            </Checkbox.Group>
          </Form.Item>

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
              Create Job
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
        .custom-modal .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 40px;
        }
        .custom-modal .ant-input-number-input {
          height: 24px;
        }
        .custom-modal .ant-select-selection-placeholder,
        .custom-modal .ant-input::placeholder {
          color: #6C757D;
        }
        .custom-modal textarea.ant-input {
          height: auto;
          min-height: 120px;
        }
      `}</style>

      {/* Jobs Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="table-responsive">
            <Spin spinning={loading}>
              <Table 
                className="table-striped"
                columns={columns}
                dataSource={jobs}
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

export default Jobs; 