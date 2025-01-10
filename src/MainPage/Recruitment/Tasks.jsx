import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Select, Input, Modal, Form, message, Spin, Tag, Row, Col } from 'antd';
import { UnorderedListOutlined, AppstoreOutlined, CheckCircleFilled } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const Tasks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.user.loginvalue);
  const [viewType, setViewType] = useState('list');

  useEffect(() => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Please login again to continue');
      navigate('/login');
      return;
    }
    
    fetchTasks();
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching tasks with filters:', filters);
      
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.candidateName && { candidateName: filters.candidateName }),
        ...(filters.status && { status: filters.status }),
      };

      console.log('API request params:', queryParams);

      const response = await apiServices(
        "GET", 
        `task/list?${new URLSearchParams(queryParams).toString()}`, 
        null, 
        {
          access_token: {
            accessToken: token
          }
        }
      );
      
      console.log('API response:', response);
      
      if (response?.data?.status) {
        const tasksData = response.data.data;
        console.log('Tasks data:', tasksData);
        setTasks(tasksData.docs || []);
        setPagination(prev => ({
          ...prev,
          total: tasksData.totalDocs || 0
        }));
      } else {
        console.error('Failed to fetch tasks:', response?.data);
        message.error(response?.data?.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Error fetching tasks. Please try again');
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

  const columns = [
    {
      title: 'Candidate Name',
      key: 'candidateName',
      render: (_, record) => (
        <Link to={`/recruitment/candidates/${record.candidateId._id}`}>
          {record.candidateId.firstName} {record.candidateId.lastName}
        </Link>
      ),
      sorter: true,
    },
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
      render: (_, record) => (
        <Link to={`/recruitment/tasks/${record._id}`}>
          {record.taskName}
        </Link>
      ),
      sorter: true,
    },
    {
      title: 'Reviewer',
      key: 'reviewer',
      render: (_, record) => {
        const reviewers = record.taskReviewer || [];
        return reviewers.map(reviewer => reviewer.fullName).join(', ') || 'N/A';
      },
    },
    {
      title: 'Due Date',
      key: 'dueDate',
      render: (_, record) => (
        <span>
          {moment(record.lastDateOfSubmission).format('DD MMM YYYY')}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => `${record.taskDuration} days`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'PENDING' ? 'orange' :
          status === 'SUBMITTED' ? 'blue' :
          status === 'COMPLETED' ? 'green' :
          status === 'OVERDUE' ? 'red' :
          'default'
        }>
          {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: 'Score',
      key: 'score',
      render: (_, record) => {
        if (!record.feedback) {
          return '-';
        }
        return (
          <div className="d-flex align-items-center">
            <CheckCircleFilled style={{ color: '#52c41a', marginRight: 4 }} />
            <span>{record.feedback.score || '-'}/10</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="content container-fluid">
      {/* Page Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Tasks</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Tasks</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto d-flex align-items-center">
            <div className="view-icons me-2">
              <Button
                type={viewType === 'list' ? 'primary' : 'default'}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewType('list')}
                className="me-1"
              />
              <Button
                type={viewType === 'grid' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewType('grid')}
              />
            </div>
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
          <Form.Item name="candidateName">
            <Input placeholder="Candidate Name" allowClear />
          </Form.Item>
        </div>
        <div className="col-sm-6 col-md-3">
          <Form.Item name="status">
            <Select
              placeholder="Status"
              allowClear
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'OVERDUE', label: 'Overdue' }
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

      {/* Tasks List */}
      <div className="row">
        <div className="col-md-12">
          <Spin spinning={loading}>
            <div className="table-responsive">
              <Table 
                className="table-striped"
                columns={columns}
                dataSource={tasks}
                rowKey="_id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  pageSizeOptions: ['10', '20', '50']
                }}
                onChange={handleTableChange}
                onRow={(record) => ({
                  onClick: () => navigate(`/recruitment/tasks/${record._id}`),
                  style: { cursor: 'pointer' }
                })}
              />
            </div>
          </Spin>
        </div>
      </div>

      <style jsx global>{`
        .view-icons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .view-icons .ant-btn {
          padding: 4px 8px;
          height: 32px;
          background: #F4A261;
          border: none;
          color: white;
        }
        .view-icons .ant-btn:hover {
          background: #E76F51;
          color: white;
        }
        .view-icons .ant-btn.ant-btn-default {
          background: #F8F9FA;
          color: #4A5568;
        }
        .view-icons .ant-btn.ant-btn-default:hover {
          background: #E2E8F0;
          color: #2D3748;
        }
        .ant-table-tbody > tr:hover {
          background-color: #f5f5f5;
        }
        .ant-table-tbody > tr > td {
          transition: background 0.3s;
        }
        .ant-table-row {
          cursor: pointer;
        }
        .ant-table-cell a {
          color: inherit;
          text-decoration: none;
        }
        .ant-table-cell a:hover {
          color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default Tasks; 