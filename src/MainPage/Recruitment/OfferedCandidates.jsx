import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Tag, Empty, message, Button, Select, Modal, Form, Tooltip, Row, Col, Statistic} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { SearchOutlined, DownloadOutlined, InfoCircleOutlined, StarFilled } from '@ant-design/icons';
import moment from 'moment';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import list from '../../assets/iconsRecruitment/list.svg';
import grid from '../../assets/iconsRecruitment/grid.svg';
import calander from '../../assets/iconsRecruitment/calander.svg';
import phone from '../../assets/iconsRecruitment/phone.svg';
import email from '../../assets/iconsRecruitment/mail.svg';
import starIcon from '../../assets/iconsRecruitment/starIcon.svg';

const { Option } = Select;

const OfferedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [viewType, setViewType] =useState('list')
  const [loading, setLoading] = useState(false);
  const [isRejectionModalVisible, setIsRejectionModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [rejectionForm] = Form.useForm();
  const [form] = Form.useForm();
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
        `candidate/list?status=SHORTLISTED&page=${page}&limit=${limit}`,
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
        <div style={{display:"flex", alignItems:'center'}}>
          <div style={{height:'40px' ,width:"40px", border:"1px solid transparent" , borderRadius:"50%", background:'#f5f1fd', color:'#9368e9', display:"flex", justifyContent:"center", alignItems:'center', marginLeft:"10px", marginRight:"10px"}}>{`${record.firstName.charAt(0).toUpperCase()}${record.lastName.charAt(0).toUpperCase()}`}</div>
          <Link to={`/recruitment/candidates/${record._id}`}>
            {record.firstName} {record.lastName}
          </Link>
        </div>
      ),
    },
    {
      title: 'Applied Position',
      key: 'position',
      width: 200,
      render: (_, record) => record.appliedFor?.title || 'N/A',
    },
    {
      title: 'Email',
      key: 'email',
      width: 200,
      render: (_, record) => record.email || 'N/A',
    },
    
    // {
    //   title: 'Applied Date',
    //   dataIndex: 'appliedDate',
    //   key: 'appliedDate',
    //   width: 150,
    //   render: (date) => moment(date).format('DD MMM YYYY'),
    // },
    // {
    //   title: 'Department',
    //   key: 'department',
    //   width: 150,
    //   render: (_, record) => record.appliedFor?.department || 'N/A',
    // },
    // {
    //   title: 'Contract',
    //   key: 'contract',
    //   width: 150,
    //   render: (_, record) => {
    //     if (record.offer?.contract) {
    //       return (
    //         <Button
    //           type="link"
    //           icon={<DownloadOutlined />}
    //           onClick={() => window.open(record.offer.contract, '_blank')}
    //         >
    //           Download
    //         </Button>
    //       );
    //     }
    //     return <span style={{ color: '#999' }}>No contract</span>;
    //   },
    // },
    {
      title: 'Rating',
      key: 'rating',
      width: 200,
      render: (_, record) => {
        const rating = (record?.rating)/5 || 'N/A'; 
        return(
          <div className="d-flex align-items-center">
            <StarFilled style={{ color: '#FFD700', marginRight: 4 }}/>
            <span>{rating}</span>
          </div>
        )
      }
    },

    {
      title: 'Status',
      key: 'status',
      width: 200,
      render: (_,record) => (
        // <div>
        //   {getStatusTag(record.status)}
        //   {record.status === 'OFFERED' && (
        //     <Select
        //       value={record.status}
        //       onChange={(value) => handleStatusChange(record._id, value)}
        //       style={{ width: 130, marginTop: 8 }}
        //       disabled={updatingStatus}
        //     >
        //       <Option value="OFFERED">OFFERED</Option>
        //       <Option value="HIRED">HIRED</Option>
        //       <Option value="OFFER_REJECTED">OFFER_REJECTED</Option>
        //     </Select>
        //   )}
        // </div>
        <Tag color={
          record?.status.toLowerCase() === 'offered' ? 'blue' :
          record?.status.toLowerCase() === 'hired' ? 'green' :
          record?.status.toLowerCase() === 'offer_rejected' ? 'red' :
          'default'
        }>
          {record?.status.charAt(0).toUpperCase() + record?.status.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (_, record) => record.phoneNumber || 'N/A',
    },
    // {
    //   title: 'Rejection Reason',
    //   key: 'rejectionReason',
    //   width: 300,
    //   render: (_, record) => {
    //     if (record.status === 'OFFER_REJECTED' && record.rejectionReason) {
    //       return <div style={{ whiteSpace: 'pre-line' }}>{record.rejectionReason}</div>;
    //     }
    //     return '-';
    //   },
    // },
  ];

  const renderGridView = () => {
    return (
      <Row gutter={[24, 24]}>
        {candidates.map(selected => {
          const initials = selected?.firstName[0] + selected?.lastName[0];
          return(
          <Col xs={24} sm={12} md={8}>
            <Card className="job-card">
              <div>
                <div style={{display:'flex', justifyContent:'space-between', width:"98%"}} >
                  <div style={{display:"flex"}}>
                    <div style={{height:'50px' ,width:'50px', border:'1px solid transparent', borderRadius:'50%', background:"#f3eaff", color:'#8326ff', display:"flex", justifyContent:"center", alignItems:'center'}}>{initials}</div>
                    <div style={{marginLeft:"12px"}}>
                      <div className='job-title' style={{fontSize:"18px" ,fontWeight:"500", color:'#212529', paddingTop:"3px"}}>
                      <Link to={`/recruitment/candidates/${selected._id}`}>
                        {`${selected?.firstName.charAt(0).toUpperCase() + selected?.firstName.slice(1).toLowerCase()} ${selected?.lastName.charAt(0).toUpperCase() + selected?.lastName.slice(1).toLowerCase()}`}
                      </Link>
                      </div>
                      <div  style={{color:'#56616b', fontSize:'12px', fontWeight:"450"}}>{selected?.appliedFor?.title}</div>
                    </div>
                  </div>
                  {/* <Dropdown 
                    overlay={<Menu>
                      <Menu.Item key="edit" icon={<EditOutlined />}onClick={() => navigate(`/recruitment/interviews/${candidate._id}/edit`)}>Edit</Menu.Item>
                      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
                        Modal.confirm({
                          title: 'Delete Job',
                          content: 'Are you sure you want to delete this candidate?',
                          okText: 'Yes, Delete',
                          okType: 'danger',
                          cancelText: 'No',
                          onOk: () => handleDeleteInterview(candidate._id)
                        });
                      }}>Delete</Menu.Item>
                    </Menu>}
                    trigger={['click']}
                    placement="bottomRight">
                    <div style={{ cursor: 'pointer',height:'25px', marginTop:"5px" }}>
                      <img src={more} alt="More Options" />
                    </div>
                  </Dropdown> */}
                </div>
                <div style={{marginTop:"12px"}}>
                  <div style={{display:"flex", marginTop:'7px'}}>
                    <div style={{display:"flex" ,justifyContent:"center" ,alignItems:"center", height:"20px" ,width:"20px"}}><img src={email}></img></div>
                    <div style={{paddingTop:"3px", marginLeft:"12px" ,color:"#56616b"}}>
                    {/* <Link to={`/recruitment/interviews/${interviewer._id}`}>  */}
                      {selected?.email}
                    {/* </Link> */}
                    </div>
                  </div>
                  <div style={{display:"flex", marginTop:'7px'}}>
                    <div  style={{display:"flex" ,justifyContent:"center" ,alignItems:"center", height:"20px" ,width:"20px"}}><img src={phone}></img></div>
                    <div  style={{paddingTop:"3px", marginLeft:"12px", color:"#56616b"}}>{selected?.phoneNumber}</div>
                  </div>
                  <div  style={{display:"flex" , marginTop:"7px"}}>
                    <div  style={{display:"flex" ,justifyContent:"center" ,alignItems:"center", height:"20px" ,width:"20px"}}><img src={calander}></img></div>
                    <div  style={{paddingTop:"3px", marginLeft:"12px",color:"#56616b"}}>{moment(selected?.createdAt).format('DD MMM YYYY')}</div>
                  </div>
                  <div  style={{display:"flex" , marginTop:"7px"}}>
                    <div  style={{display:"flex" ,justifyContent:"center" ,alignItems:"center", height:"20px" ,width:"20px"}}><img src={starIcon}></img></div>
                    <div  style={{paddingTop:"3px", marginLeft:"12px",color:"#56616b"}}>{selected?.rating || 'N/A'}</div>
                  </div>
                  <Tag color={
                        selected?.status.toLowerCase() === 'offered' || 'shortlisted' ?  'blue' :
                        selected?.status.toLowerCase() === 'hired' ? 'green' :
                        selected?.status.toLowerCase() === 'offer_rejected' ? 'red' : ' '
                      } style={{borderRadius:'70px', marginTop:"13px"}}
                    >
                      {selected?.status.charAt(0).toUpperCase() + selected?.status.slice(1).toLowerCase()}
                    </Tag>
                </div>
              </div>
            </Card>
          </Col>
          )
        })}
      </Row>
    );
  };

  return (
    // <div className="content container-fluid">
    //   <div className="page-header">
    //     <div className="row align-items-center">
    //       <div className="col">
    //         <h3 className="page-title">Offered Candidates</h3>
    //         <ul className="breadcrumb">
    //           <li className="breadcrumb-item">Recruitment</li>
    //           <li className="breadcrumb-item active">Offered Candidates</li>
    //         </ul>
    //       </div>
    //     </div>
    //   </div>

    <div className="content container-fluid">
    {/* Page Header */}
    <div className="page-header">
      <div className="row align-items-center">
        <div className="col">
          <h3 className="page-title">Offered</h3>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/recruitment/candidates">Candidates</Link></li>
            <li className="breadcrumb-item active">Offered</li>
          </ul>
        </div>
        <div className="col-auto float-end ms-auto d-flex align-items-center">
          <div className="view-icons me-3">
            <button type={viewType === 'list' ? 'primary' : 'default'}   onClick={() => setViewType('list')} style={{height:"40px", width:'40px', border:'1.5px solid #EEf0f1', borderRadius:'4px', background:'white'}} >
              <img src={list}></img>
            </button>
            <button  type={viewType === 'grid' ? 'primary' : 'default'} onClick={() => setViewType('grid')} style={{height:"40px", width:'40px', border:'1.5px solid #EEf0f1', borderRadius:'4px', background:'white'}}>
              <img src={grid}></img>
            </button>
          </div>
        </div>
      </div>
    </div>


    <Form 
      form={form}
      onFinish={handleSearch} 
      className="search-form"
      // initialValues={filters}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="candidateName" className="mb-0">
            <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Candidate Name" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="email" className="mb-0">
            <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Email" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="position" className="mb-0">
            <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Applied Position" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="status" className="mb-0">
            <Select
              placeholder="Interview Status"
              allowClear
              className='custom'
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Sales', label: 'Sales' },
                { value: 'HR', label: 'HR' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Operations', label: 'Operations' },
                { value: 'Design', label: 'Design' },
                { value: 'Product', label: 'Product' }
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

      {/* <Row gutter={16} className="mb-4">
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
      </Row> */}
      {viewType === 'list' ? (
      <Table
        className="mt-4"
        columns={columns}
        dataSource={candidates}
        rowKey={(record) => record._id}
        loading={loading}
        // scroll={{ x: 1350 }}
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
      ) : renderGridView()}
          {/* <div className="row filter-row">
          <div className="col-sm-6 col-md-3">
            <Input
              placeholder="Search Candidates"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div> */}

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

      <style>{`
      .view-icons {
        display: flex;
        align-items: center;
        gap: 8px;
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

      .job-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border: 1px solid #e0e3e6;
        height: auto;
        margin-top: 20px;
      }
      .job-card .ant-card-body {
        padding: 16px;
      }
      .job-card-content {
        padding: 0;
      }
      .job-title {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 4px;
      }
      .job-title a {
        color: #212529;
      }
      `}</style>
    </div>
  );
};

export default OfferedCandidates; 