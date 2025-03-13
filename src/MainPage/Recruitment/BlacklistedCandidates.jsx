import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, message, Col, Select, DatePicker, Row, Empty, Dropdown, Menu } from 'antd';
import { Link } from 'react-router-dom';
import {  UserOutlined , CheckCircleOutlined ,EyeOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';
import calander from '../../assets/iconsRecruitment/calander.svg';
import circle from '../../assets/iconsRecruitment/circle.svg';
import more from '../../assets/iconsRecruitment/vertical.svg';

const BlacklistedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.user.loginvalue);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  // const [filters, setFilters] = useState({});


  useEffect(() => {
    fetchBlacklistedCandidates();
  }, []);

  const fetchBlacklistedCandidates = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        console.log('No token found');
        setCandidates([]);
        return;
      }

      const url = `candidate/list?status=BLACKLISTED&page=${page}&limit=${limit}`;
      console.log('Making API call to:', url);
      console.log('Request headers:', {
        Authorization: `Bearer ${token}`,
      });

      const response = await apiServices(
        'GET', 
        url, 
        null, 
        {
          access_token: {
            accessToken: token
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('API Response:', {
        status: response?.data?.status,
        message: response?.data?.message,
        data: response?.data?.data,
        pagination: response?.data?.pagination
      });
      
      if (response?.data?.status) {
        const blacklistedCandidates = response.data.data.docs || [];
        console.log('Setting candidates:', blacklistedCandidates);
        setCandidates(blacklistedCandidates);
        setPagination({
          ...pagination,
          current: response.data.pagination?.page || 1,
          total: response.data.pagination?.total || 0,
          pageSize: limit
        });
      } else {
        console.log('No candidates found or error in response');
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error('Failed to fetch blacklisted candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchBlacklistedCandidates(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = (value) => {
    // Reset pagination when searching
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    // TODO: Implement search functionality
    console.log('Search value:', value);
  };

  const handleAddToBlacklist = async (values) => {
    try {
      const token = authState?.access_token?.accessToken || localStorage.getItem("token");
      
      if (!token) {
        message.error('Authentication required');
        return;
      }

      // Format the request body according to the API requirements
      const requestBody = {
        candidateName: values.name,
        email: values.email,
        blacklistReason: values.reason
      };

      const response = await apiServices(
        'POST', 
        'candidate/blacklist', 
        requestBody,
        {
          access_token: {
            accessToken: token
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response?.data?.status) {
        message.success('Candidate added to blacklist successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchBlacklistedCandidates();
      } else {
        throw new Error(response?.data?.message || 'Failed to add candidate to blacklist');
      }
    } catch (error) {
      console.error('Error adding candidate to blacklist:', error);
      message.error(error.message || 'Failed to add candidate to blacklist');
    }
  };

  // const showBlacklistReason = (candid) => {
  //   Modal.info({
  //     title: "Blacklist Reason",
  //     content: record.blacklistReason || "No reason provided.",
  //     okText: "Close",
  //   });
  // };

  // const removeFromBlacklist = (record) => {
  //   Modal.confirm({
  //     title: "Remove from Blacklist",
  //     content: "Are you sure you want to remove this candidate from the blacklist?",
  //     okText: "Yes, Remove",
  //     cancelText: "No",
  //     onOk: async () => {
  //       try {
  //         await axios.put(`/api/candidates/${record}/remove-blacklist`);
  //         message.success("Candidate removed from blacklist successfully.");
  //       } catch (error) {
  //         message.error("Failed to remove candidate from blacklist.");
  //       }
  //     },
  //   });
  // };



  const columns = [
    {
      title: 'Candidate Name',
      key: 'CandidateName',
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Position',
      key: 'position',
      render: (_, record) => record.appliedFor?.title || 'N/A',
    },
    {
      title: 'Blacklist Reason',
      key: 'reason',
      render: (_, record) => record.rejectionReason || 'N/A',
    },
    {
      title: 'Blacklisted Date',
      key: 'blacklistedDate',
      render: (_, record) => moment(record.updatedAt).format('DD MMM YYYY'),
    },
    {
      title: 'Blacklisted By',
      key: 'blacklistedBy',
      render: (_, record) => record.rejectedBy || 'N/A',
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 80,
    //   render: (_, record) => (
    //     <Dropdown
    //       overlay={
    //         <Menu>
    //           <Menu.Item 
    //             key="view-reason" 
    //             icon={<EyeOutlined />} 
    //             onClick={() => showBlacklistReason(record._id)}
    //           >
    //             View Reason
    //           </Menu.Item>
    
    //           <Menu.Item 
    //             key="remove-blacklist" 
    //             icon={<CheckCircleOutlined />} 
    //             onClick={() => removeFromBlacklist(record._id)}
    //           >
    //             Remove from Blacklist
    //           </Menu.Item>
    //         </Menu>
    //       }
    //       trigger={['click']}
    //       placement="bottomRight"
    //     >
    //       <div style={{ cursor: 'pointer', height: '25px' }}>
    //         <img src={more} alt="More Options" />
    //       </div>
    //     </Dropdown>
    //   ),
    // }
  ];

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Blacklist</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Blacklist</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto d-flex align-items-center">
            <Button
              className="add-candidate-btn"
              onClick={() => setIsModalVisible(true)}
            >
              <div className='btn-content'>
                <img src={circle} style={{marginRight:'8px', marginBottom:'20px'}}></img>
                <p>Add to Blacklist</p>  
              </div>
            </Button>
          </div>
        </div>
      </div>

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
      className="custom-table mt-4"
      columns={columns}
      dataSource={candidates}
      rowKey="_id"
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} candidates`,
      }}
        onChange={handleTableChange}
        locale={{
          emptyText: <Empty description="No blacklisted candidates found" />
        }}
    />

      <Modal
        title="Add to Blacklist"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddToBlacklist}
        >
          <Form.Item
            className= 'custom-input'
            name="name"
            label="Candidate Name"
            rules={[{ required: true, message: 'Please enter candidate name' }]}
          >
            <Input placeholder="Enter candidate name" />
          </Form.Item>

          <Form.Item
            className= 'custom-input'
            name="position"
            label="Position Applied"
            rules={[
              { required: true, message: 'Please Enter Applied Postion' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            className= 'custom-input'
            name="reason"
            label="Reason of Blacklist"
            rules={[
              { required: true, message: 'Please enter reason for blacklisting' }
            ]}
          >
            <Input placeholder="Enter reason of blacklisting" />
          </Form.Item>

          <Form.Item
            className = 'input-details'
            name="description"
            label="Description (Optional)"
          >
            <Input.TextArea 
              rows={6} 
              placeholder="Some more Details..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div style={{display:'flex' , justifyContent:"flex-end" ,margin: '5px 0px 13px 0px'}}>
              <Button
                style={{marginRight:'8px' , height:"40px"  ,borderRadius:"32px" ,background:"#f7f7f8" ,color:"#a5adb6" }}
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" style={{ height:"40px"  ,borderRadius:"32px" ,background:"#ff9244" ,color:"white" }}>
                Add to Blacklist
              </Button>
            </div>
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

export default BlacklistedCandidates; 