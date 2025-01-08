import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Select, Input, Modal, Form, message, Spin, Tag, Row, Col } from 'antd';
import { UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const Interviews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [interviews, setInterviews] = useState([]);
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
    
    fetchInterviews();
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchInterviews = async () => {
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
        ...(filters.candidateName && { candidateName: filters.candidateName }),
        ...(filters.status && { status: filters.status }),
      };

      const response = await apiServices(
        "GET", 
        `interview/list?${new URLSearchParams(queryParams).toString()}`, 
        null, 
        {
          access_token: {
            accessToken: token
          }
        }
      );
      
      if (response?.data?.status) {
        setInterviews(response.data.data.docs || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total || 0
        }));
      } else {
        message.error(response?.data?.message || 'Failed to fetch interviews');
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      message.error('Error fetching interviews. Please try again');
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
        <Link to={`/recruitment/candidates/${record.candidateId}`}>
          {record.candidateName}
        </Link>
      ),
      sorter: true,
    },
    {
      title: 'Interview Name',
      dataIndex: 'interviewName',
      key: 'interviewName',
      sorter: true,
    },
    {
      title: 'Interview Type',
      dataIndex: 'interviewType',
      key: 'interviewType',
      render: (type) => (
        <Tag color={type === 'ONLINE' ? 'blue' : 'green'}>
          {type === 'ONLINE' ? 'Online' : 'In Person'}
        </Tag>
      ),
    },
    {
      title: 'Interviewer',
      dataIndex: 'interviewer',
      key: 'interviewer',
      render: (interviewer) => interviewer?.name || 'N/A',
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      render: (_, record) => (
        <span>
          {moment(record.interviewDate).format('DD MMM YYYY')}
          <br />
          {record.interviewTime}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'SCHEDULED' ? 'blue' :
          status === 'COMPLETED' ? 'green' :
          status === 'CANCELLED' ? 'red' :
          'default'
        }>
          {status?.charAt(0) + status?.slice(1).toLowerCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className="content container-fluid">
      {/* Page Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Interviews</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Interviews</li>
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
                { value: 'SCHEDULED', label: 'Scheduled' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' }
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

      {/* Interviews List */}
      <div className="row">
        <div className="col-md-12">
          <Spin spinning={loading}>
            <div className="table-responsive">
              <Table 
                className="table-striped"
                columns={columns}
                dataSource={interviews}
                rowKey="_id"
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  pageSizeOptions: ['10', '20', '50']
                }}
                onChange={handleTableChange}
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
      `}</style>
    </div>
  );
};

export default Interviews; 