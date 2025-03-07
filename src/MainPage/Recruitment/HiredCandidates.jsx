import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Space, Tag, Empty, message, Select, Button, Modal, Form, Tooltip, Row ,Col, DatePicker } from 'antd';
import { SearchOutlined, UserOutlined, DownloadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';
import calander from '../../assets/iconsRecruitment/calander.svg';
import circle from '../../assets/iconsRecruitment/circle.svg';

const { Option } = Select;
const { TextArea } = Input;

const HiredCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [form]  = Form.useForm();
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
      title: 'Candidate Name',
      key: 'CandidateName',
      width: 150,
      render: (_, record) =>{
        const initials = `${record.firstName.charAt(0).toUpperCase()}${record.lastName.charAt(0).toUpperCase()}`;
        const candidateName = `${record.firstName} ${record.lastName}`
        return(
          <div style={{display:"flex", alignItems:'center'}}>
            <div style={{height:'40px' ,width:"40px", border:"1px solid transparent" , borderRadius:"50%", background:'#f5f1fd', color:'#9368e9', display:"flex", justifyContent:"center", alignItems:'center', marginRight:"10px"}}>{initials}</div>
            <Link to={`/recruitment/candidates/${record._id}`} style={{color:"#212529" ,fontSize:"14px" ,fontWight:"500"}}>
              {candidateName}
            </Link>
          </div>
        )
      }
    },
    {
      title: 'Position',
      key: 'position',
      width: 150,
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
        <Select
          value={record.status}
          className='customized'
          style={{color:"HIRED" ? 'green' : "JOINED" ? "blue" : "DID_NOT_JOIN" ? "red" : "BLACKLISTED" ? "black" : 'default'}}
          onChange={(value) => handleStatusChange(record._id, value)}
          loading={updatingStatus && selectedCandidate === record._id}
        >
          <Option value="HIRED" style={{color:"green"}}>HIRED</Option>
          <Option value="JOINED" style={{color:"blue"}}>JOINED</Option>
          <Option value="DID_NOT_JOIN" style={{color:"red"}}>DID NOT JOIN</Option>
          <Option value="BLACKLISTED" style={{color:"black"}}>BLACKLISTED</Option>
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
      {/* <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Hired Candidates</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Recruitment</li>
              <li className="breadcrumb-item active">Hired Candidates</li>
            </ul>
          </div>
        </div>
      </div> */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Hired</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Hired</li>
            </ul>
          </div>
        </div>
      </div>


      {/* <Card>
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
      </Card> */}
    <Form 
      form={form}
      onFinish={handleSearch} 
      className="search-form"
      initialValues={pagination}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="candidateName" className="mb-0">
            <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Name" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="appliedPosition" className="mb-0">
            <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Position" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="status" className="mb-0">
            <DatePicker
            placeholder="Blacklist Date"
            className="custom"
            allowClear
            suffixIcon= {<img src={calander}></img>}
          />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="blacklistReason" className="mb-0">
            <Select placeholder="Blacklist Reason" allowClear
            className='custom'
              options={[
                // { value: 'FULL_TIME', label: 'Full Time' },
                // { value: 'PART_TIME', label: 'Part Time' },
                // { value: 'CONTRACT', label: 'Contract' },
                // { value: 'INTERNSHIP', label: 'Internship' },
                // { value: 'FREELANCE', label: 'Freelance' }
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" className="search-btn" block>
              Search
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>

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

      <Modal
        title={`Update Candidate Status ${selectedStatus?.replace(/_/g, ' ')}`}
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

      
      <style jsx global>{`
        .add-candidate-btn{
          border-radius: 40px !important;
          height: 44px !important;
          background-color: #ff9244 !important;
          color: white !important;
          font-weight: 500 !important;
          font-size: 16px !important;
          border: 2px solid #ff9244 !important;
          width: 185px !important;
        }

        .btn-content{
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .search-btn {
          background: #1f1f1f;
          border: 1px solid #1f1f1f;
          height: 40px;
          border-radius: 8px;
          width: 80% !important;
          font-weight: 500;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          justify-self: end;
        }
        .search-btn:hover {
          background: #333 !important;
          border: none
        }

        .custom  .ant-select-selector {
        height: 40px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        padding-left: 10px;
        }

        .customized .ant-select-selector{
          height: 30px !important;
          border-radius: 8px !important;
          display: flex;
          align-items: center;
          padding-left: 10px;
        }

        .custom .ant-select-placeholder {
        color: white !important;
        }

        .ant-modal-content{
          border: 1px solid transparent;
          border-radius: 10px;
        }
        .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0px 24px;
          border-radius: 10px;
        }
        .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }

        .ant-modal-close {
          background-color: #F8F9FA;
          border-radius: 50%;
          border:"1px solid #F8F9FA";
          margin:16px 16px 0 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-input .ant-form-item-label > label{
          color: #212529 !important;
          font-size: 12px;
          font-weight: 500;
        }

        .custom-input .ant-input{
          height: 55px !important;
          border-radius: 4px !important;
          border: 1px solid #cfd4d8;
          font-size: 16px !important;
          font-weight: 450;
          color: #212529 !important;
          padding: 15px !important; 
        }

        .input-details .ant-form-item-label > label{
          color: #212529 !important;
          font-size: 12px;
          font-weight: 500;
          margin-left: 13px;
        }
        .input-details .ant-input{
          border-radius: 4px !important;
          border: 1px solid #cfd4d8;
          font-size: 16px !important;
          font-weight: 450;
          color: #212529 !important;
          padding: 15px !important; 
        }

        .ant-picker {
          height: 40px !important;
          border-radius: 8px !important;
          display: flex;
          align-items: center;
          padding-left: 10px;
        }

      .custom-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        }

      .custom-table th {
        width: 300px !important;
        background-color: #ffffff;
        color: #212529; 
        font-size: 14px;
        font-weight: 450;

      }

      .custom-table td {
        width: 300px !;
        background-color: #f7f7f8;
        color: #181d27;
        font-size: 14px;
        font-weight: 450;
      }

      .custom-table tr:nth-child(even){
        background-color: #eef0f1;
      }

      .custom-table tr:hover {
        background-color: #f1f1f1;
      }

        
      `}</style>
    </div>
  );
};

export default HiredCandidates; 