import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Select, Input, Modal, Form, message, Spin, Tag, DatePicker, Upload, InputNumber, Dropdown, Menu, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, UploadOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { getCurrentStage } from './CandidateList';

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
  const [viewType, setViewType] = useState('list');

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
        ...(filters.name && { name: filters.name }),
        ...(filters.appliedFor && { appliedFor: filters.appliedFor }),
        ...(filters.status && { status: filters.status }),
        includeInterviews: true,
        includeTasks: true
      };

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
        console.log('Candidates Response:', response.data);
        
        if (Array.isArray(candidateData.docs)) {
          setCandidates(candidateData.docs);
          setPagination(prev => ({
            ...prev,
            total: candidateData.totalDocs || 0
          }));
        } else {
          message.error('Invalid data format received from server');
          setCandidates([]);
        }
      } else {
        if (response?.data?.message === 'Invalid token') {
          message.error('Session expired. Please login again');
          navigate('/login');
        } else {
          message.error(response?.data?.message || 'Failed to fetch candidates');
          setCandidates([]);
        }
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        navigate('/login');
      } else {
        message.error('Error fetching candidates. Please try again');
        setCandidates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({
      ...prev,
      name: value
    }));
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
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
        fetchCandidates();
      } else {
        message.error(response?.data?.message || 'Failed to delete candidate');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      message.error('Error deleting candidate. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveJobs = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) return;

    try {
      const response = await apiServices(
        "GET",
        'job/active',
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
        setActiveJobs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching active jobs:', error);
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
      title: 'Current Stage',
      key: 'currentStage',
      render: (_, record) => {
        const stage = getCurrentStage(record);
        return (
          <Tag
            color={
              stage.type === 'upcoming-interview' ? 'blue' :
              stage.type === 'pending-task' ? 'orange' :
              stage.type === 'completed-interview' ? 'green' :
              stage.type === 'completed-task' ? 'cyan' :
              'default'
            }
            style={{ 
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {stage.text}
          </Tag>
        );
      },
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
      {/* Header section */}
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
            <Link to="/recruitment/candidate/add" className="btn add-btn">
              <i className="fa fa-plus" /> Add Candidate
            </Link>
          </div>
        </div>
      </div>

      {/* Search section */}
      <div className="row filter-row mb-4">
        <div className="col-sm-6 col-md-3">
          <Input.Search
            placeholder="Search candidates..."
            allowClear
            onSearch={handleSearch}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Table section */}
      <div className="row">
        <div className="col-md-12">
          <Table
            columns={columns}
            dataSource={candidates}
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} candidates`
            }}
            rowKey="_id"
          />
        </div>
      </div>
    </div>
  );
};

export default Candidates; 