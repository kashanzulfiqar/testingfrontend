import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Tag, Empty, message, Button, Select, Modal, Form, Tooltip, Row, Col, Statistic } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { SearchOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';

const { Option } = Select;

const OfferedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRejectionModalVisible, setIsRejectionModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [rejectionForm] = Form.useForm();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    rejectedOffers: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();
  const loginState = useSelector((state) => state.user.loginvalue);

  const handleStatusChange = async (candidateId, newStatus) => {
    if (newStatus === 'OFFER_REJECTED') {
      setSelectedCandidate(candidateId);
      setIsRejectionModalVisible(true);
      return;
    }

    await updateCandidateStatus(candidateId, newStatus);
  };

  const updateCandidateStatus = async (candidateId, newStatus, rejectionReason = null) => {
    try {
      setUpdatingStatus(true);
      const token = loginState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error("Authentication required");
        return;
      }

      const payload = {
        status: newStatus,
        ...(rejectionReason && { reason: rejectionReason })
      };

      const response = await apiServices(
        'PATCH',
        `candidate/${candidateId}/status`,
        payload,
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
        message.success('Status updated successfully');
        fetchOfferedCandidates(pagination.current, pagination.pageSize);
      } else {
        throw new Error(response?.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
      setIsRejectionModalVisible(false);
      rejectionForm.resetFields();
    }
  };

  const handleRejectionSubmit = async (values) => {
    await updateCandidateStatus(selectedCandidate, 'OFFER_REJECTED', values.rejectionReason);
  };

  const fetchOfferedCandidates = async (page = 1, limit = 10) => {
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
        `candidate/list?status=OFFERED&page=${page}&limit=${limit}`,
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
        const candidatesList = response.data.data.docs || [];
        setCandidates(candidatesList);
        
        // Update statistics
        const activeOffers = candidatesList.filter(c => c.status === 'OFFERED').length;
        const rejectedOffers = candidatesList.filter(c => c.status === 'OFFER_REJECTED').length;
        
        setStats({
          totalOffers: candidatesList.length,
          activeOffers,
          rejectedOffers
        });

        setPagination({
          ...pagination,
          current: page,
          total: response.data.data.totalDocs || 0
        });
      }
    } catch (error) {
      console.error('Error fetching offered candidates:', error);
      message.error('Failed to fetch offered candidates');
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
    
    fetchOfferedCandidates();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchOfferedCandidates(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = (value) => {
    // Implement search functionality here
    console.log('Search value:', value);
  };

  const getStatusTag = (status) => {
    if (status === 'OFFERED') {
      return <Tag color="blue">OFFERED</Tag>;
    } else if (status === 'OFFER_REJECTED') {
      return <Tag color="red">OFFER_REJECTED</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <Link to={`/recruitment/candidates/${record._id}`}>
          {record.firstName} {record.lastName}
        </Link>
      ),
    },
    {
      title: 'Position',
      key: 'position',
      width: 200,
      render: (_, record) => record.appliedFor?.title || 'N/A',
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      width: 150,
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: 'Department',
      key: 'department',
      width: 150,
      render: (_, record) => record.appliedFor?.department || 'N/A',
    },
    {
      title: 'Contract',
      key: 'contract',
      width: 150,
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
      width: 200,
      render: (_, record) => (
        <div>
          {getStatusTag(record.status)}
          {record.status === 'OFFERED' && (
            <Select
              value={record.status}
              onChange={(value) => handleStatusChange(record._id, value)}
              style={{ width: 130, marginTop: 8 }}
              disabled={updatingStatus}
            >
              <Option value="OFFERED">OFFERED</Option>
              <Option value="HIRED">HIRED</Option>
              <Option value="OFFER_REJECTED">OFFER_REJECTED</Option>
            </Select>
          )}
        </div>
      ),
    },
    {
      title: 'Rejection Reason',
      key: 'rejectionReason',
      width: 300,
      render: (_, record) => {
        if (record.status === 'OFFER_REJECTED' && record.rejectionReason) {
          return <div style={{ whiteSpace: 'pre-line' }}>{record.rejectionReason}</div>;
        }
        return '-';
      },
    },
  ];

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Offered Candidates</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Recruitment</li>
              <li className="breadcrumb-item active">Offered Candidates</li>
            </ul>
          </div>
        </div>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Offers"
              value={stats.totalOffers}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Offers"
              value={stats.activeOffers}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Rejected Offers"
              value={stats.rejectedOffers}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

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
          scroll={{ x: 1350 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} candidates`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: <Empty description="No offered candidates found" />
          }}
        />
      </Card>

      <Modal
        title="Rejection Reason"
        visible={isRejectionModalVisible}
        onCancel={() => {
          setIsRejectionModalVisible(false);
          rejectionForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={rejectionForm}
          onFinish={handleRejectionSubmit}
          layout="vertical"
        >
          <Form.Item
            name="rejectionReason"
            label="Reason for Rejection"
            rules={[
              {
                required: true,
                message: 'Please provide a reason for rejecting the offer',
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter the reason for rejecting the offer"
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Button
              type="default"
              style={{ marginRight: 8 }}
              onClick={() => {
                setIsRejectionModalVisible(false);
                rejectionForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={updatingStatus}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OfferedCandidates; 