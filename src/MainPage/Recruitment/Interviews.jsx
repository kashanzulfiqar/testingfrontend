import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Select, Input, Modal, Form, message, Spin, Tag, Row, Col } from 'antd';
import { UnorderedListOutlined, AppstoreOutlined, StarFilled } from '@ant-design/icons';
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
      
      if (response?.data?.success) {
        const interviewsData = response.data.data;
        console.log('Interviews Data with feedback:', interviewsData.docs.map(interview => ({
          id: interview._id,
          feedback: interview.feedback
        })));
        
        setInterviews(interviewsData.docs || []);
        setPagination(prev => ({
          ...prev,
          total: interviewsData.totalDocs || 0
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

  const calculateAverageRating = (feedbackArray) => {
    if (!feedbackArray || feedbackArray.length === 0) {
      return 0;
    }

    const totalRatings = feedbackArray.reduce((sum, feedback) => {
      const ratings = feedback.ratings;
      const ratingSum = (
        ratings.technicalSkills1 +
        ratings.behavior +
        ratings.softSkills +
        ratings.technicalSkills2 +
        ratings.technicalSkills3
      );
      return sum + (ratingSum / 5); // Average of all skills for this feedback
    }, 0);

    return (totalRatings / feedbackArray.length).toFixed(1);
  };

  const getLatestDecision = (feedbackArray) => {
    if (!feedbackArray || feedbackArray.length === 0) return '-';
    return feedbackArray[feedbackArray.length - 1].recommendation || '-';
  };

  const columns = [
    {
      title: 'Candidate Name',
      key: 'candidateName',
      dataIndex: 'candidateName',
      render: (_, record) => (
        <Link to={`/recruitment/candidates/${record.candidateId._id}`}>
          {record.candidateName}
        </Link>
      ),
      sorter: true,
    },
    {
      title: 'Interview Name',
      dataIndex: 'interviewName',
      key: 'interviewName',
      render: (_, record) => (
        <Link to={`/recruitment/interviews/${record._id}`}>
          {record.interviewName}
        </Link>
      ),
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
      key: 'interviewer',
      render: (_, record) => record.interviewerId?.fullName || 'N/A',
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
      title: 'Decision',
      key: 'decision',
      render: (_, record) => {
        return record.latestFeedback?.recommendation || '-';
      }
    },
    {
      title: 'Rating',
      key: 'rating',
      render: (_, record) => {
        if (!record.feedback || record.feedback.length === 0) {
          return (
            <div className="d-flex align-items-center">
              <StarFilled style={{ color: '#FFD700', marginRight: 4 }} />
              <span>0</span>
            </div>
          );
        }

        const totalRatings = record.feedback.reduce((sum, feedback) => {
          const ratings = feedback.ratings;
          const ratingSum = (
            ratings.technicalSkills1 +
            ratings.behavior +
            ratings.softSkills +
            ratings.technicalSkills2 +
            ratings.technicalSkills3
          );
          return sum + (ratingSum / 5);
        }, 0);

        const averageRating = (totalRatings / record.feedback.length).toFixed(1);

        return (
          <div className="d-flex align-items-center">
            <StarFilled style={{ color: '#FFD700', marginRight: 4 }} />
            <span>{averageRating}</span>
          </div>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status?.toLowerCase() === 'scheduled' ? 'blue' :
          status?.toLowerCase() === 'completed' ? 'green' :
          status?.toLowerCase() === 'cancelled' ? 'red' :
          'default'
        }>
          {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
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
            {console.log('Rendering interviews:', interviews)}
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
                onRow={(record) => ({
                  onClick: () => navigate(`/recruitment/interviews/${record._id}`),
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

export default Interviews; 