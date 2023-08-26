
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button, Col, Form, Input,DatePicker, Row, Select, Spin, Table, message, Empty } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import  Delete from "../../../_components/modelbox/Delete"
import Header from '../../../initialpage/Sidebar/header'
import Sidebar from '../../../initialpage/Sidebar/sidebar';
import Offcanvas from '../../../Entryfile/offcanvance';
import { apiServices } from '../../../Services/apiServices';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '@mui/material';
import moment from 'moment';
import { counter } from '../../../Redux/Reducer/permissions/pendingCounterSlice';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { user_icon } from '../../../Entryfile/imagepath';

const { Option } = Select;

const LeaveAdmin = () => {

  const { id } = useParams()

  const navigate = useNavigate()

  const permissions = useSelector((state) => state?.permissionsSlice?.data)
  console.log(permissions,role)


  const [menu, setMenu] = useState(false)
  const dispatch = useDispatch()

  const [form] = Form.useForm();

	const toggleMobileMenu = () => {
		setMenu(!menu)
	  }

    const user_state = useSelector((state) => state.user.loginvalue);
  const pending_counter = useSelector((state) => state?.counter?.counter?.payload);
    const role = user_state?.user?.role

    

    const[requests,setRequests] = useState([]);
    const [tableData, setTableData] = useState([]); // Step 1
    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 10,
      total: 0,
    })
    
    const [isLoading, setIsLoading] = useState(false);
    const [selectedfromTo, setSelectedfromTo] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [statdata, setStatdata] = useState();


    
    const closeModal = () => {
      setIsModalVisible(false);
      setSelectedRecord(null)
      navigate('/employee/request-admin')
    };

    const openModal = (record) => {
        setSelectedRecord(record);
        
    };

    useEffect(() => {
      if (selectedRecord) {
        setIsModalVisible(true);
        console.log(selectedRecord)
      }
    }, [selectedRecord]);


    const [update,setUpdated] = useState({
      _id: "",
      userId: "",
      companyId: "",
      requestType: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      status: "",
      description: "",
      approvedBy: "",
    })

    const handleUpdateStatus = (record, newStatus) => {


      const { _id, userId, companyId, requestType, leaveType, startDate, endDate, description, approvedBy } = record;
  
  
      const updatedData = {
        _id,
        userId,
        companyId,
        requestType,
        leaveType,
        startDate,
        endDate,
        status: newStatus, 
        description,
        approvedBy,
      };
  
      const apiUrl = `requests/update-request`; 
      apiServices("PUT", apiUrl, updatedData, user_state)
        .then((res) => {
          if (res.data.success === true) {
            
            message.success(`Leave request updated to ${newStatus}`);
            dispatch(counter(pending_counter-1))
          }
        })
        .catch((error) => {
          console.log("error", error);
          message.error('Failed to update leave request status');
        })
        .finally(() => {
          setIsModalVisible(false);
          setSelectedRecord(null)
          setIsLoading(true);
          navigate('/employee/request-admin')

          // setSelectedFilters({
          //   name: "",
          //   type: "",
          //   status: "",
          //   from: "",
          //   to:"",
          // });
    
          // setFilters({
          //   name: "",
          //   type: "",
          //   status: "",
          //   from: "",
          //   to:"",  
          // });
          
          fetchleaves();
        });
    };



    const [filters, setFilters] = useState({
      name: "",
      type: "",
      status: "",
      from: "",
      to:"",
    });

    const [selectedFilters, setSelectedFilters] = useState({
      name: "",
      type: "",
      status: "",
      from: "",
      to:"",
    });


    const handleFilterChange = (value, filterType) => {
      setSelectedFilters({
        ...selectedFilters,
        [filterType]: value,
      }); 
    };
  
    
    const handleSearch = () => {
      const { name, type, status, from, to } = selectedFilters;

      if (name || type || status || (from && to)) {
        setFilters(selectedFilters);
      } 
      else {
        
        message.warning('Both Start and End Date required');
      }
    };
    

    const handleReset = () => {
      setSelectedFilters({
        name: "",
        type: "",
        status: "",
        from: "",
        to:"",
      });

      setFilters({
        name: "",
        type: "",
        status: "",
        from: "",
        to:"",  
      });
  
      form.resetFields();
    };
  
    useEffect( ()=>{
      if($('.select').length > 0) {
        $('.select').select2({
          minimumResultsForSearch: -1,
          width: '100%'
        });
      }
    });  

    useEffect(()=>{
      if(role === 'admin' || permissions?.viewAllRequest || permissions?.teamRequest) {

        setIsLoading(true);
        fetchleaves();

      }else{

        navigate('/restricted', { state: { unAuthorize: true}})

      }
    },[filters, pagination.current, pagination.pageSize])


    const fetchleaves = async() => {

      const params = {
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      };

      let apiUrl = `requests/view-all-request?employeeName=${filters.name}&leaveType=${filters.type}&requestTo=${filters.to}&requestFrom=${filters.from}&page=${params.page}&limit=${params.limit}&status=${params.status}`

      apiServices("GET", apiUrl, null, user_state)
        .then((res) => {
          if (res.data.success === true) {
            const requestData=res?.data?.Requests?.docs
            const statdata=res?.data
            setStatdata(statdata)
            console.log("hello",statdata)

            setRequests(requestData);
            console.log(requestData);

            console.log("these are ",requestData?.totalDays)
            setTableData(requestData); // Step 2
            setPagination({
              ...pagination,
              total: res?.data?.Requests?.totalDocs,
            });

            if (id) {
              const specificRequest = requestData.find((request) => request._id === id);
              console.log(specificRequest)
              if(specificRequest){
                openModal(specificRequest);
              }
            }
          }
        })
        .catch((error) => {
          console.log("error", error);
        }).finally(()=>{
          setIsLoading(false);
        });
        }


        const customEmptyText = (
          <Empty
            image={<img src={EmptyTable} />}
            // image={<InboxOutlined />}
            imageStyle={
              {
                // fontSize: 48,
                // color: '#1890ff',
              }
            }
            style={{
              height: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            description={
              <div style={{ display: "" }}>
                <div
                  style={{
                    color: "#34343F",
                    fontWeight: "500",
                    fontSize: "14px",
                    margin: "7px 0px 4px 0px",
                  }}
                >
                  No Record Found!
                </div>
                {/* <div
                  style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
                >
                  Click 'Add Department' Button To Create <br /> A New Department{" "}
                </div> */}
              </div>
            }
          />
        );


    // const updateleaves = async () => {

    //   let apiUrl = `requests/view-all-request`
    //   apiServices("PUT", apiUrl, null, user_state)
    //     .then((res) => {
    //       if (res.data.success === true) {
    //       }
    //     })
    //     .catch((error) => {
    //       console.log("error", error);
    //     }).finally(()=>{
    //       setIsLoading(false);
    //     });
    // }

      const columns = [
  {
    title: 'Employee',
    dataIndex: 'user.fullName', // Assuming 'fullName' is the name field in the user object
    render: (text, record) => (
      <div>
      <img
      src={record?.user.imageUrl || user_icon}
      alt={record?.user.fullName}
      className="avatar"
      style={{ width: '30px', height: '30px' }}
    />
        <span>{record?.user?.fullName}</span>
      </div>
    ),
    //sorter: (a, b) => a.user.fullName.localeCompare(b.user.fullName), // Sort by employee name
  },
  {
    title: 'Leave Type',
    dataIndex: 'leaveType',
    //sorter: (a, b) => a.leaveType.localeCompare(b.leaveType), // Sort by leave type
  },
  {
    title: 'From',
    dataIndex: 'startDate',
    render: (text,record) => {

      const date = new Date(text);

      const day = date.getDate();

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const month = monthNames[date.getMonth()];

      const year = date.getFullYear();

      const formattedDate = `${day} ${month} ${year}`;

      return (

        <>

          {formattedDate}

        </>

      )

    },
    //sorter: (a, b) => a.startDate.localeCompare(b.startDate), // Sort by start date
  },
  {
    title: 'To',
    dataIndex: 'endDate',
    render: (text,record) => {

      const date = new Date(text);

      const day = date.getDate();

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const month = monthNames[date.getMonth()];

      const year = date.getFullYear();

      const formattedDate = `${day} ${month} ${year}`;

      return (

        <>

          {formattedDate}

        </>

      )

    },
    //sorter: (a, b) => a.endDate.localeCompare(b.endDate), // Sort by end date
  },
  {
    title: 'Days Off',
    dataIndex:'totalDays',
    
  },
  {
    title: 'Reason',
    dataIndex: 'description',
    render: (text,record) => (

      <label className='longText'>

        {record?.description ? record?.description : "-"}

      </label>

    )
    //sorter: (a, b) => a.description.localeCompare(b.description), // Sort by reason
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (text, record) => (
      <div>
        <a
          className={`btn btn-white btn-sm btn-rounded dropdown-toggle ${
            text === 'Pending'
              ? 'text-info'
              : text === 'Approved'
              ? 'text-success'
              : 'text-danger'
          }`}
          href={text !== 'Approved' && text !== 'Declined' ? "javascript:void(0)" : undefined}
          data-bs-toggle={text !== 'Approved' && text !== 'Declined' && (permissions?.requestApproval || role==='admin') ? "dropdown" : ""}
          aria-expanded="false"
          onClick={(e) => e.preventDefault()}
        >
          <i
            className={`fa ${
              text === 'New'
                ? 'fa-dot-circle-o text-purple'
                : text === 'Pending'
                ? 'fa-dot-circle-o text-info'
                : text === 'Approved'
                ? 'fa-dot-circle-o text-success'
                : 'fa-dot-circle-o text-danger'
            }`}
          />{' '}
          {text}
        </a>
        <div className={`dropdown-menu dropdown-menu-right ${text === 'Approved' || text === 'Declined' ? 'disabled' : ''}`}>
          
          <a className={`dropdown-item ${text === 'Approved' && 'disabled'}`} href="javascript:void(0)" onClick={(e) => {
            e.preventDefault();
            handleUpdateStatus(record, 'Approved')}}>

            <i className="fa fa-dot-circle-o text-success" /> Approved
          </a>
          <a className={`dropdown-item ${text === 'Declined' && 'disabled'}`} href="javascript:void(0)" onClick={(e) => {
            e.preventDefault();
            handleUpdateStatus(record, 'Declined')}}>

            <i className="fa fa-dot-circle-o text-danger" /> Declined
          </a>
        </div>
      </div>
    ),
    //sorter: (a, b) => a.status.localeCompare(b.status), // Sort by status
  },
  
  
  {
    title: 'Action',
    render: (text, record) => (
      <div className="dropdown dropdown-action">
        <a href="javascript:void(0)" className="action-icon" onClick={() => openModal(record)}>
          <i className="material-icons">add_circle</i>
        </a>
      </div>
    ),
  }
  
];


      return (     
        <>
           <div className={`main-wrapper ${menu ? 'slide-nav': ''}`}> 
          
          {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
          <Sidebar />        
        <div className="page-wrapper">
        <Helmet>
            <title>Requests - DaftarPro Admin</title>
            <meta name="description" content="Login page"/>					
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Requests</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/app/main/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Requests</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
          <div className="col-md-3">
            <div className="stats-info">
              <label>Today Present</label>
              <h4>
              {isLoading ? (
                <Spin size="large" />
              ) : (
                <>{statdata?.attendanceRecord} / {statdata?.totalEmployee}</>
              )}
              </h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-info">
            <label>Planned Leaves</label>
              <h4>8</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-info">
            <label>Unplanned Leaves</label>
              <h4>0</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-info">
            <label>Pending Requests</label>
            
              <h4>
              {isLoading ? (
                <Spin size="large" />
              ) : (
                <>{statdata?.pendingRequests}</>
              )}
                </h4>
              
              </div>
          </div>
        </div>
          {/* /Leave Statistics */}
          {/* Search Filter */}
          <Form form={form} onFinish={handleSearch}>
          <div className="row filter-row">
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">  
              <div className="form-group">
              <Form.Item
                name="name"
                className="custom-border"
              >
                <Input
                  className="form-control"
                  allowClear={false}
                  placeholder="Employee Name"
                  onChange={(e)=>handleFilterChange(e.target.value, "name")}
                />
              </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">  
              <div className="form-group form-focus">
              <Form.Item
                name="type"
                className="custom-border"
              >
                <Select
                  placeholder="Leave type"
                  style={{ width: "100%" }}
                  onChange={(value)=>handleFilterChange(value, "type")}
                >
                  <Select.Option value="casual">Casual</Select.Option>
                  <Select.Option value="sick">Sick Leave</Select.Option>
                  <Select.Option value="bereavement">Bereavement</Select.Option>
                  <Select.Option value="marriage">Marriage</Select.Option>
                  <Select.Option value="maternity">Maternity</Select.Option>
                  <Select.Option value="paternity">Paternity</Select.Option>
                  <Select.Option value="annual">Annual</Select.Option>
                  <Select.Option value="halfDay">Half Day</Select.Option>
                  <Select.Option value="unpaid">Unpaid</Select.Option>
                </Select>
              </Form.Item>

              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12"> 
              <div className="form-group form-focus">
              <Form.Item
                name="status"
                className="custom-border"
              >
                <Select
                  placeholder="Leave Status"
                  style={{ width: "100%" }}
                  onChange={(value)=>handleFilterChange(value, "status")}
                >
                  <Select.Option value="Pending">Pending</Select.Option>
                  <Select.Option value="Approved">Approved</Select.Option>
                  <Select.Option value="Declined">Declined</Select.Option>
                </Select>
              </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
              <div className="form-group">
              <Form.Item 
                name="from"
                >
                  <DatePicker
                    placeholder='From'
                    className="form-control"
                    onChange={(from, dateString) => {handleFilterChange(dateString, "from")
                    setSelectedfromTo(dateString)  
                  }}
                    allowClear={false}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">  
              <div className="form-group">
              <Form.Item 
                name="to"
                >
                  <DatePicker
                    placeholder='To'
                    className="form-control"
                    onChange={(to, dateString) => {handleFilterChange(dateString, "to")
                    setSelectedfromTo(dateString)  
                  }}
                    allowClear={false}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12"
            style={{ display: 'flex', alignItems: 'flex-start',justifyContent: 'center', gap: '2px' }}>  
            <Button 
              type="primary" 
              htmlType="submit"
              className="btn-success btn-block w-50"
              disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
              >
                <span className="d-flex justify-content-center">Search</span> 
              </Button>

              <Button 
                htmlType="button"
                className="btn-secondary btn-block w-50" 
                onClick={handleReset}
                disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                style={{ backgroundColor: "#616161", borderColor: "#616161" }}
                >
                  <span className="d-flex justify-content-center">Reset</span> 
              </Button>

            </div>     
          </div>
          </Form>

          {/* /Search Filter */}
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive">
                
              <Table
              className="table-striped"
              locale={{
                emptyText: isLoading ? (
                  <Spin size="large" tip="Loading..." />
                ) : (
                  customEmptyText
                ),
              }}
              loading={isLoading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  pageSizeOptions: ["10", "20", "30", "40"], // Options to change page size
                  showSizeChanger: true, // Show the page size changer
                  onChange: (page, pageSize) => {
                    setPagination({
                      ...pagination,
                      current: page,
                      pageSize: pageSize,
                    });
                  },
                  itemRender:itemRender
                }}
              style={{ overflowX: 'auto' }}
              columns={columns}
              dataSource={tableData} // Step 4
              rowKey={(record) => record?._id} // Assuming _id is the unique key
              onChange={(pagination, filters, sorter) => {
                // Handle table onChange event here if needed
              }}
            />
              </div>
            </div>
          </div>
        </div>
        {/* /Page Content */}
        {/* Add Leave Modal */}
        <div id="add_leave" className="modal custom-modal fade" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Leave</h5>
                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label>Leave Type <span className="text-danger">*</span></label>
                    <select className="select">
                      <option>Select Leave Type</option>
                      <option>Casual Leave 12 Days</option>
                      <option>Medical Leave</option>
                      <option>Loss of Pay</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>From <span className="text-danger">*</span></label>
                    <div>
                      <input className="form-control datetimepicker" type="date" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>To <span className="text-danger">*</span></label>
                    <div>
                      <input className="form-control datetimepicker" type="date" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Number of days <span className="text-danger">*</span></label>
                    <input className="form-control" readOnly type="text" />
                  </div>
                  <div className="form-group">
                    <label>Remaining Leaves <span className="text-danger">*</span></label>
                    <input className="form-control" readOnly defaultValue={12} type="text" />
                  </div>
                  <div className="form-group">
                    <label>Leave Reason <span className="text-danger">*</span></label>
                    <textarea rows={4} className="form-control" defaultValue={""} />
                  </div>
                  <div className="submit-section">
                    <button className="btn btn-primary submit-btn">Submit</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* /Add Leave Modal */}
        {/* Edit Leave Modal */}
        {/* <div id="edit_leave" className="modal custom-modal fade" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Leave</h5>
                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label>Leave Type <span className="text-danger">*</span></label>
                    <select className="select">
                      <option>Select Leave Type</option>
                      <option>Casual Leave 12 Days</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>From <span className="text-danger">*</span></label>
                    <div>
                      <input className="form-control datetimepicker" defaultValue="01-01-2019" type="date" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>To <span className="text-danger">*</span></label>
                    <div>
                      <input className="form-control datetimepicker" defaultValue="01-01-2019" type="date" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Number of days <span className="text-danger">*</span></label>
                    <input className="form-control" readOnly type="text" defaultValue={2} />
                  </div>
                  <div className="form-group">
                    <label>Remaining Leaves <span className="text-danger">*</span></label>
                    <input className="form-control" readOnly defaultValue={12} type="text" />
                  </div>
                  <div className="form-group">
                    <label>Leave Reason <span className="text-danger">*</span></label>
                    <textarea rows={4} className="form-control" defaultValue={"Going to hospital"} />
                  </div>
                  <div className="submit-section">
                    <button className="btn btn-primary submit-btn">Save</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div> */}
        {/* /Edit Leave Modal */}
        {/* Approve Leave Modal */}
        <div className="modal custom-modal fade" id="approve_leave" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body">
                <div className="form-header">
                  <h3>Leave Approve</h3>
                  <p>Are you sure want to approve for this leave?</p>
                </div>
                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <a href="" className="btn btn-primary continue-btn">Approve</a>
                    </div>
                    <div className="col-6">
                      <a href="" data-bs-dismiss="modal" className="btn btn-primary cancel-btn">Decline</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Approve Leave Modal */}

        <Modal

        open={isModalVisible}

        onClose={closeModal}

        aria-labelledby="modal-modal-title"

        className="modalScroll"

        aria-describedby="modal-modal-description"

        disableRestoreFocus
      

        BackdropProps={{

          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here

        }}

        sx={{overflowY: 'auto'}}

      >
        
          <div className="modal-dialog modal-dialog-centered" role="document">

          <div className="modal-content">

            <div className="modal-header">

              <h5 className="modal-title">

                Details

              </h5>

              <button type="button" className="close" onClick={closeModal}>

                <span aria-hidden="true">×</span>

              </button>

            </div>

            <div className="modal-body">

              <Form


                name="control-hooks"

                initialValues={{

                  fullName: selectedRecord?.user.fullName || "",

                  requestType: selectedRecord?.requestType || "",

                  leaveType: selectedRecord?.leaveType || "",

                  startDate: moment(selectedRecord?.startDate, 'YYYY-MM-DD') || "",

                  endDate: moment(selectedRecord?.endDate, 'YYYY-MM-DD') || "",

                  totalDays: selectedRecord?.totalDays || "",

                  description: selectedRecord?.description || "",

                }}

                autoComplete="off"

              >
                <div className="form-group">

                    <label>

                    Employee Name <span className="text-danger"></span>

                    </label>

                    <div style={{ position: 'relative' }} id='area'>

                        <Form.Item

                        name='fullName'

                        className='custom-border'
                    >
                            <Input
                          className='form-control'
                          readOnly/>
                        </Form.Item>

                    </div>

                    </div>

                <div className="form-group">

                    <label>

                    Request Type <span className="text-danger"></span>

                    </label>

                    <div style={{ position: 'relative' }} id='area'>

                        <Form.Item

                        name='requestType'

                        className='custom-border'
>
                            <Input
                          className='form-control'
                          readOnly/>
                        </Form.Item>

                    </div>

                </div>

                

                  <div className="form-group">

                      <label>

                      Leave Type <span className="text-danger"></span>

                      </label>

                      <div style={{ position: 'relative' }} id='area'>

                          <Form.Item

                          name='leaveType'

                          className='custom-border'
                         
                          >
                            <Input
                          className='form-control'
                          readOnly/>
                          </Form.Item>

                      </div>

                  </div>

                <div className="form-group">

                  <label>

                  From <span className="text-danger"></span>

                  </label>

                  <div style={{ position: 'relative' }} id='area'>

                      <Form.Item

                      name='startDate'

                      className='custom-border'
                      >

                        <DatePicker
                          className='form-control datepicker-color'
                          style={{backgroundColor:'#e9ecef'}}
                          allowClear={false}
                          disabled
                          />

                      </Form.Item>

                  </div>

                </div>

                <div className="form-group">

                  <label>

                  To <span className="text-danger"></span>

                  </label>

                  <div style={{ position: 'relative' }} id='area'>

                      <Form.Item

                      name='endDate'

                      className='custom-border'
                      >

                        <DatePicker
                        className='form-control datepicker-color'
                        style={{backgroundColor:'#e9ecef'}}

                        disabled
                        allowClear={false}
                          />

                      </Form.Item>

                  </div>

                </div>

                <div className="form-group">

                  <label>

                  Number of Days <span className="text-danger"></span>

                  </label>

                    <Form.Item

                    name='totalDays'

                    className='custom-border'

                    >

                        <Input
                          className='form-control'
                          readOnly/>

                    </Form.Item>

                </div>

                <div className="form-group">

                  <label style={{display: 'flex', justifyContent: 'space-between'}}>

                    <div>Reason <span className="text-danger"></span></div>

                  </label>

                  <Form.Item

                    name="description"

                    className="custom-border"

                  >
                    <Input.TextArea 
                    className='form-control'
                    readOnly/>

                  </Form.Item>

                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start',justifyContent: 'center', gap: '2px' }}> 
                {selectedRecord?.status !=="Approved" && selectedRecord?.status !=="Declined" && (permissions?.requestApproval
                || role==='admin') && (
                  <>
                  <Button 
                  type="button" 
                  htmlType="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUpdateStatus(selectedRecord, 'Approved')
                  }}
                  className="btn-success btn-block w-50"
                  >
                    <span className="d-flex justify-content-center">Approve</span> 
                  </Button>

                  <Button 
                    htmlType="button"
                    className="btn-secondary btn-block w-50" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateStatus(selectedRecord, 'Declined')
              
                    }}
                    style={{ backgroundColor: "#616161", borderColor: "#616161" }}
                    >
                      <span className="d-flex justify-content-center">Decline</span> 
                  </Button></>
                )}
                  
                </div>

            
              </Form>

            </div>

          </div>

        </div>
        
        

      </Modal>
        {/* Delete Leave Modal */}
        <Delete/>
        {/* /Delete Leave Modal */}
      </div>
      </div>
      <Offcanvas/>
        </>

        );
  }

export default LeaveAdmin;
