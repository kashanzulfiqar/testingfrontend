import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Space, Tag, Empty, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const HiredCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();
  const loginState = useSelector((state) => state.user.loginvalue);

  const fetchHiredCandidates = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = loginState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error("Authentication required");
        navigate('/login');
        return;
      }

      const response = await apiServices(
        'GET',
        `candidate/list?status=HIRED&page=${page}&limit=${limit}`,
        null,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.status) {
        setCandidates(response.data.data.docs || []);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.data.totalDocs || 0
        });
      }
    } catch (error) {
      console.error('Error fetching hired candidates:', error);
      message.error('Failed to fetch hired candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = loginState?.access_token?.accessToken || localStorage.getItem("token");
    
    if (!token) {
      message.error("Please login again to continue");
      navigate('/login');
      return;
    }
    
    fetchHiredCandidates();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchHiredCandidates(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = (value) => {
    // Implement search functionality here
    console.log('Search value:', value);
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Link to={`/recruitment/candidates/${record._id}`}>
          {record.firstName} {record.lastName}
        </Link>
      ),
    },
    {
      title: 'Position',
      key: 'position',
      render: (_, record) => record.appliedFor?.title || 'N/A',
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: 'Department',
      key: 'department',
      render: (_, record) => record.appliedFor?.department || 'N/A',
    },
    {
      title: 'Contract',
      key: 'contract',
      render: (_, record) => {
        if (record.offer?.contract) {
          return (
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.offer.contract, '_blank')}
            >
              Download
            </Button>
          );
        }
        return <span style={{ color: '#999' }}>No contract</span>;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color="green">HIRED</Tag>
      ),
    }
  ];

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Hired Candidates</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Recruitment</li>
              <li className="breadcrumb-item active">Hired Candidates</li>
            </ul>
          </div>
        </div>
      </div>

      <Card>
        <div className="row filter-row">
          <div className="col-sm-6 col-md-3">
            <Input
              placeholder="Search Candidates"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <Table
          className="mt-4"
          columns={columns}
          dataSource={candidates}
          rowKey={(record) => record._id}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} candidates`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: <Empty description="No hired candidates found" />
          }}
        />
      </Card>
    </div>
  );
};

export default HiredCandidates; 