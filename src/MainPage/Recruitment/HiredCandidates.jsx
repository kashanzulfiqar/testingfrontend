import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Space, Tag, Empty, message, Select, Button, Modal, Form, Tooltip } from 'antd';
import { SearchOutlined, UserOutlined, DownloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const HiredCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [reasonForm] = Form.useForm();
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

  const handleStatusChange = async (candidateId, newStatus) => {
    if (newStatus === 'DID_NOT_JOIN' || newStatus === 'BLACKLISTED') {
      setSelectedCandidate(candidateId);
      setSelectedStatus(newStatus);
      setIsReasonModalVisible(true);
      return;
    }

    await updateCandidateStatus(candidateId, newStatus);
  };

  const updateCandidateStatus = async (candidateId, newStatus, formData = {}) => {
    try {
      setUpdatingStatus(true);
      const token = loginState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        'PATCH',
        `candidate/${candidateId}/status`,
        formData,
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
        fetchHiredCandidates(pagination.current, pagination.pageSize);
      } else {
        throw new Error(response?.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
      setIsReasonModalVisible(false);
      reasonForm.resetFields();
    }
  };

  const handleReasonSubmit = async (values) => {
    // Construct the payload based on the selected status
    const formData = {
      status: selectedStatus,
      ...(selectedStatus === 'OFFER_REJECTED' && { offerRejectionReason: values.specificReason }),
      ...(selectedStatus === 'DID_NOT_JOIN' && { didNotJoinReason: values.specificReason }),
      ...(selectedStatus === 'BLACKLISTED' && { blacklistReason: values.specificReason }),
      ...(values.reason && { reason: values.reason }) // Include general reason if provided
    };

    await updateCandidateStatus(selectedCandidate, selectedStatus, formData);
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
      width: 200,
      fixed: 'left',
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
      width: 180,
      render: (_, record) => (
        <Select
          value={record.status}
          style={{ width: 150 }}
          onChange={(value) => handleStatusChange(record._id, value)}
          loading={updatingStatus && selectedCandidate === record._id}
        >
          <Option value="HIRED">
            <Tag color="green">HIRED</Tag>
          </Option>
          <Option value="JOINED">
            <Tag color="blue">JOINED</Tag>
          </Option>
          <Option value="DID_NOT_JOIN">
            <Tag color="red">DID NOT JOIN</Tag>
          </Option>
          <Option value="BLACKLISTED">
            <Tag color="black">BLACKLISTED</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Reason',
      key: 'reason',
      width: 300,
      render: (_, record) => {
        let reasonText = '';
        let tooltipTitle = '';

        if (record.status === 'OFFER_REJECTED') {
          reasonText = record.offerRejectionReason || record.reason; // Fallback for backward compatibility
          tooltipTitle = 'Offer Rejection Reason';
        } else if (record.status === 'DID_NOT_JOIN') {
          reasonText = record.didNotJoinReason || record.reason;
          tooltipTitle = 'Did Not Join Reason';
        } else if (record.status === 'BLACKLISTED') {
          reasonText = record.blacklistReason || record.reason;
          tooltipTitle = 'Blacklist Reason';
        }

        if (reasonText) {
          return (
            <Tooltip title={`${tooltipTitle}: ${reasonText}`}>
              <div style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 280,
                cursor: 'pointer'
              }}>
                {reasonText}
              </div>
            </Tooltip>
          );
        }
        return '-';
      },
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
          scroll={{ x: 1330 }}
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

      <Modal
        title={`Update Candidate Status - ${selectedStatus?.replace(/_/g, ' ')}`}
        visible={isReasonModalVisible}
        onCancel={() => {
          setIsReasonModalVisible(false);
          reasonForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={reasonForm}
          onFinish={handleReasonSubmit}
          layout="vertical"
        >
          <Form.Item
            name="reason"
            label="General Note"
            rules={[{ required: false }]}
          >
            <TextArea
              rows={2}
              placeholder="Add a note about this status change (optional)"
            />
          </Form.Item>

          <Form.Item
            name="specificReason"
            label={
              selectedStatus === 'OFFER_REJECTED' ? 'Offer Rejection Reason' :
              selectedStatus === 'DID_NOT_JOIN' ? 'Did Not Join Reason' :
              selectedStatus === 'BLACKLISTED' ? 'Blacklist Reason' :
              'Reason'
            }
            rules={[
              { 
                required: true,
                message: `Please provide ${
                  selectedStatus === 'OFFER_REJECTED' ? 'the reason for offer rejection' :
                  selectedStatus === 'DID_NOT_JOIN' ? 'the reason for not joining' :
                  selectedStatus === 'BLACKLISTED' ? 'the reason for blacklisting' :
                  'a reason'
                }`
              }
            ]}
          >
            <TextArea
              rows={3}
              placeholder={
                selectedStatus === 'OFFER_REJECTED' ? 'Please provide the reason for offer rejection' :
                selectedStatus === 'DID_NOT_JOIN' ? 'Please provide the reason for not joining' :
                selectedStatus === 'BLACKLISTED' ? 'Please provide the reason for blacklisting' :
                'Please provide a reason'
              }
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setIsReasonModalVisible(false);
                reasonForm.resetFields();
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

export default HiredCandidates; 