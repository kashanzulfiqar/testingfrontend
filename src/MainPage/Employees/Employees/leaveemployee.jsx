
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { Avatar_02,Avatar_05,Avatar_09,Avatar_10, Avatar_03,Avatar_08,Avatar_15,Avatar_20,Avatar_25,Avatar_24, user_icon  } from "../../../Entryfile/imagepath"

import { Form, Table, Button, Spin, Input, DatePicker, Select, message, Empty, Pagination } from 'antd';
// import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import  Delete from "../../../_components/modelbox/Delete"
import Offcanvas from '../../../Entryfile/offcanvance';
import Modal from "@mui/material/Modal";
import moment from 'moment';
import { useSelector } from 'react-redux';
import { apiServices } from '../../../Services/apiServices';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { LoadingOutlined } from '@ant-design/icons';


const LeaveEmployee = () => {

  const [form] = Form.useForm();
  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const company_id = user_state?.user?.companyId
  const role = user_state?.user?.role


  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });
  const [tableLoader, setTableLoader] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [loader, setLoader] = useState(false)
  const [leavetype, setLeaveType] = useState(false)
  const [reasonLength, setReasonLength] = useState('0')
  const [paginationDetail, setPaginationDetail] = useState();
  const [fromDate, setFromDate] = useState(null);
  const [compLeaves, setCompLeaves] = useState({});
  const [singleUser, setSingleUser] = useState();

  
    const [data, setData] = useState([]);
    useEffect( ()=>{
      if($('.select').length > 0) {
        $('.select').select2({
          minimumResultsForSearch: -1,
          width: '100%'
        });
      }
    });  

    useEffect(() => {
      if(permissions?.viewSelfRequest) {
        getSelfRequests();
        getLeaves()
        getUser()
      }else{
        nav('/restricted', { state: { unAuthorize: true}})
      }
    }, []);

    const getUser = () => {

      apiServices("GET", "user/employee-overview", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setSingleUser(res?.data?.user)
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get User Info Error"
          }!`
        );
      });
        }
    const getLeaves = () => {

      apiServices("GET", "leave-policy", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setCompLeaves(res?.data?.leavePolicies)
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Company Leaves Info Error"
          }!`
        );
      });
        }
  
    const getSelfRequests = (current_page, page_size) => {
      setTableLoader(true);
      apiServices("GET", `requests/view-self-request?page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
        .then((res) => {
          console.log(res?.data);
          if (res?.data?.success === true) {
            setData(res?.data?.SelfRequests?.docs);
          setPaginationDetail(res?.data?.SelfRequests?.total)
            setTableLoader(false);
          }
        })
        .catch((err) => {
          setTableLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Get Self Requests Error"
            }!`
          );
        });
    };

    const handleClose = () => {
      setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
      form.resetFields();
      setLeaveType(false)
      setReasonLength('0')
    };
        
      const columns = [
        {
          title: 'Leave Type',
          dataIndex: 'leaveType',
          render: (text, record) => {
            return(            
                <>
                  {
                    text === 'sick' ? 'Sick Leave' : text === 'wfh' ? 'Work From Home' : text === 'casual' ? 'Casual Leave' : text === 'bereavement' ? 'Bereavement Leave' : 
                    text === 'marriage' ? 'Marriage Leave' : text === 'maternity' ? 'Maternity Leave' : text === 'paternity' ? 'Paternity Leave' : text === 'annual' ? 'Annual Leave' : 
                    text === 'half' ? 'Half Leave' : text === 'unpaid' ? 'Unpaid Leave' : ''
                  }
                </>
            )},
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
          }
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
          }
        },

        {
          title: 'No Of Days',
          dataIndex: 'totalDays', 
        },
      
        {
          title: 'Reason',
          dataIndex: 'description',
          render: (text,record) => (
            <label className='longText'>
              {text}
            </label>
          )
        },
        {
          title: 'Status',
          dataIndex: 'status',
          render: (text, record) => (
            <div className="action-label text-center">
              <a className="btn btn-white btn-sm btn-rounded" href="javascript:void(0)">
                <i className={text==="New" ? "fa fa-dot-circle-o text-purple" : text === "Pending" ?
              "fa fa-dot-circle-o text-warning" : text === "Approved" ? "fa fa-dot-circle-o text-success" 
              :"fa fa-dot-circle-o text-danger" } /> {text}
              </a>
            </div>
            ),
        },
        {
          title: 'Approved By',
          dataIndex: 'approvedBy',
          render: (text, record) => (            
              <h2 className="table-avatar">
                { (text === '' || text === null || text === undefined) ?
                  text ? text : <span style={{marginLeft: '40px'}}>-</span> :
                <><label className="avatar"><img alt="" src={text?.imageUrl || user_icon} /></label>
                <label>{text?.fullName} </label></>
                }
              </h2>
            ),
        },
        {
          title: 'Action',
          render: (text, record) => (
              <div className="dropdown dropdown-action text-end">
                <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle={role === 'admin' ? 'dropdown' : permissions?.manageSelfRequest ? 'dropdown' : ''} aria-expanded="false" disabled={role === 'admin' ? false : permissions?.manageSelfRequest ? false : true}><i className="material-icons">more_vert</i></a>
                { record?.status === 'Pending' ?
                  <div className="dropdown-menu dropdown-menu-right">
                    <a
                      className="dropdown-item" 
                      href="javascript:void(0)" 
                      onClick={() => {
                        setOpen({
                        isAddOpen: true,
                        isDelOpen: false,
                        data: record,
                      })
                      form.setFieldsValue({
                        ...record,
                        startDate: moment(record?.startDate, 'YYYY-MM-DD'),
                        endDate: moment(record?.endDate, 'YYYY-MM-DD'),
                      })
                      if(record?.requestType !== 'wfh')
                        setLeaveType(true)
                      }}
                    >
                      <i className="fa fa-pencil m-r-5" /> Edit</a>
                    <a className="dropdown-item" href="javascript:void(0)" onClick={() => {
                      setOpen({
                        isAddOpen: false,
                        isDelOpen: true,
                        data: record,
                      })
                    }}><i className="fa fa-trash-o m-r-5" /> Delete</a>
                  </div> :
                  <div className="dropdown-menu dropdown-menu-right">
                    <a
                      className="dropdown-item" 
                      href="javascript:void(0)" 
                      onClick={() => {
                        setOpen({
                        isAddOpen: true,
                        isDelOpen: false,
                        data: record,
                      })
                      form.setFieldsValue({
                        ...record,
                        startDate: moment(record?.startDate, 'YYYY-MM-DD'),
                        endDate: moment(record?.endDate, 'YYYY-MM-DD'),
                      })
                      if(record?.requestType !== 'wfh')
                        setLeaveType(true)
                      }}
                    >
                      <i className="fa fa-eye m-r-5" /> View</a>
                  </div>
                }
              </div>
            ),
      
        
        },
        
    
      ]


const leaves = [
  compLeaves?.casualLeaves > 0  && {value: 'casual', label: 'Casual Leave'},
  compLeaves?.sickLeaves > 0  && {value: 'sick', label: 'Sick Leave'},
  compLeaves?.bereavementLeaves > 0  && {value: 'bereavement', label: 'Bereavement Leave'},
  compLeaves?.marriageLeaves > 0  && {value: 'marriage', label: 'Marriage Leave'},
  compLeaves?.maternityLeaves > 0  && {value: 'maternity', label: 'Maternity Leave'},
  compLeaves?.paternityLeaves > 0  && {value: 'paternity', label: 'Paternity Leave'},
  compLeaves?.annualLeaves > 0  && {value: 'annual', label: 'Annual Leave'},
  compLeaves?.halfDayLeaves > 0  && {value: 'half', label: 'Half Leave'},
  compLeaves?.unpaidLeaves > 0  && {value: 'Unpaid', label: 'Unpaid Leave'},
]
      const calculateTotalDays = () => {
        const startDate = form.getFieldValue('startDate');
        const endDate = form.getFieldValue('endDate');
    
        if (startDate && endDate) {
          const duration = moment.duration(endDate.diff(startDate));
          const totalDays = duration.days();
          // form.setFieldsValue({ totalDays: totalDays });
          form.setFieldsValue({ totalDays: totalDays+1 });
        }
        else{
          form.setFieldsValue({ totalDays: '' })
        }
      };

      const onFinish = (values, info) => {
        const replacer = (key, value) => {
          if (key === 'startDate' || key === 'endDate') {
            return moment(value).format('YYYY-MM-DD');
          }
          return value;
        };
        
        const d = JSON.parse(JSON.stringify(values, replacer));

          let new_data = {
            ...d,
            leaveType: values?.requestType === 'wfh' ? 'wfh' : values?.leaveType,
            userId: user_state?.user?._id,
            companyId: company_id
          }
          // console.log(new_data);
          setLoader(true)
          if(!info){
            apiServices("POST", "requests", new_data, user_state)
        .then((res) => {
          console.log(res?.data);
          if (res?.data?.success === true) {
            setData([
              {
                ...new_data,
                _id: res?.data?.Request?._id,
                status: res?.data?.Request?.status,
              },
              ...data,
            ]);
            setPaginationDetail(prev => prev+1)
            handleClose();
            message.success("Request Added Successfully!");
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Add Request Error"
            }!`
          );
        });
          }else{
            let updated_data = {
              ...new_data,
              companyId: info?.companyId,
              _id: info?._id,
            };
            apiServices("PUT", "requests/update-request", updated_data, user_state)
              .then((res) => {
                // console.log(res?.data);
                if (res?.data?.success === true) {
                  // console.log(data);
                  setData(
                    data.map((req) => {
                      if (req._id === info._id) {
                        return {
                          ...req,
                          ...updated_data,
                        };
                      } else {
                        return {
                          ...req,
                        };
                      }
                    })
                  );
                  handleClose();
                  message.success("Request Updated Successfully!");
                  setLoader(false)
                }
              })
              .catch((err) => {
                setLoader(false)
                // console.log(err);
                message.error(
                  `${
                    err?.response?.data?.msg
                      ? err?.response?.data?.msg
                      : err?.response?.data?.validation?.body?.message
                      ? err?.response?.data?.validation?.body?.message
                      : "Update Request Error"
                  }!`
                );
              });
          }
      }

      const onHandleDelete = (id) => {
        setLoader(true)
        apiServices("DELETE", "requests", id, user_state)
          .then((res) => {
            // console.log(res?.data);
            if (res?.data?.success === true) {
              // console.log(data);
              // setData([...data.filter((req) => req._id !== id)]);
              // setPaginationDetail(prev => prev-1)
              setData(
                data.map((req) => {
                  if (req._id === id) {
                    return {
                      ...req,
                      status: 'Cancelled'
                    };
                  } else {
                    return {
                      ...req,
                    };
                  }
                })
              );
              handleClose();
              message.success("Request Deleted Successfully!");
              setLoader(false)
            }
          })
          .catch((err) => {
            setLoader(false)
            // console.log(err);
            message.error(
              `${
                err?.response?.data?.msg
                  ? err?.response?.data?.msg
                  : err?.response?.data?.validation?.body?.message
                  ? err?.response?.data?.validation?.body?.message
                  : "Delete Request Error"
              }!`
            );
          });
      };

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

      const antIcon = (
        <LoadingOutlined
          style={{
            fontSize: 24,
            color: '#fff'
          }}
          spin
        />
      );

      const handleFromDateChange = (date) => {
        setFromDate(date);
      };
    
      const disabledDate = (current) => {
        // return fromDate && current < moment(fromDate).endOf('day');
        return fromDate && current < moment(fromDate).startOf('day');
      };

      const [good, setGood] = useState('')

      return (
        <>
        <div className="page-wrapper">
        <Helmet>
            <title>Requests - DaftarPro</title>
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
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Requests</li>
              </ul>
            </div>
            <div className="col-auto float-end ms-auto">
            {
                (role === 'admin' || permissions?.manageSelfRequest) &&
                <a href="javascript:void(0)" className="btn add-btn" onClick={() => {
                    setOpen({
                      isAddOpen: true,
                      isDelOpen: false,
                      data: "",
                    });
                  }}><i className="fa fa-plus" /> Add Request</a>
            }
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {/* Leave Statistics */}
        <div className="row">
          <div className="col-md-3">
            <div className="stats-info">
              <label>Casual Leave</label>
              <h4>{singleUser?.casualLeaves} / {compLeaves?.casualLeaves}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-info">
              <label>Sick Leave</label>
              <h4>{singleUser?.sickLeaves} / {compLeaves?.sickLeaves}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-info">
              <label>Work From Home</label>
              <h4>{singleUser?.workFromHomeLeaves} / {compLeaves?.workFromHomeLeaves}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-info" style={{minHeight: '83px'}}>
              <label>Remaining Leave</label>
              <h4>{singleUser?.remainingLeaves}</h4>
            </div>
          </div>
        </div>
        {/* /Leave Statistics */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              
               <Table 
                  className="table-striped"
                loading={tableLoader}
                locale={{
                  emptyText: tableLoader ? null : customEmptyText,
                }}
                  // pagination= { {total : data.length,
                  //   showTotal : (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  //   showSizeChanger : true,onShowSizeChange: onShowSizeChange ,itemRender : itemRender } }
                  style = {{overflowX : 'auto'}}
                  columns={columns}                 
                  // bordered
                  dataSource={data}
                  rowKey={record => record.id}
                  // onChange={console.log("change")}
                  pagination={false}
                />
            </div>
            {
                    data?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={paginationDetail}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                        onChange={(page, size) => {
                          console.log(page, size);
                          setPageSize(size); setCurrentPage(page);
                          getSelfRequests(page, size)
                        }}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={itemRender}
                      />
                    </div>
                  }
          </div>
        </div>
      </div>
      {/* /Page Content */}
      {/* Add Leave Modal */}
      <Modal
        open={open.isAddOpen}
        onClose={handleClose}
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
                { open?.data === '' ? "Add" : open?.data?.status === 'Pending' ? "Update" : 'View'} Request
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form}
                name="control-hooks"
                onFinish={(val) => onFinish(val, open?.data)}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
                // initialValues={{
                //   requestType: open?.data ? open?.data?.requestType : "",
                //   leaveType: open?.data ? open?.data?.leaveType : "",
                //   startDate: open?.data ? moment(open?.data?.startDate, 'YYYY-MM-DD') : "",
                //   endDate: open?.data ? moment(open?.data?.endDate, 'YYYY-MM-DD') : "",
                //   totalDays: open?.data ? open?.data?.totalDays : "",
                //   description: open?.data ? open?.data?.description : "",
                // }}
                autoComplete="off"
              >
                <div className="form-group">
                    <label>
                    Request Type <span className="text-danger">*</span>
                    </label>
                    <div style={{ position: 'relative' }} id='area'>
                        <Form.Item
                        name='requestType'
                        className='custom-border'
                        rules={[
                            {
                              whitespace: true,
                              required: true,
                              message: "please select type",
                            },
                          ]}
                        >
                            <Select
                                disabled={open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled'}
                                className="custom-select custom-normal"
                                getPopupContainer={() => document.getElementById('area')}
                                style={{
                                width: '100%',
                                }}
                                placeholder='Select type'
                                options={[
                                {
                                    value: 'wfh',
                                    label: "Work From Home",
                                },
                                {
                                    value: 'leave',
                                    label: "Leave Request",
                                },
                                ]}
                                onChange={(value) => {
                                  if (value === 'wfh') {
                                    // form.setFieldsValue({ requestType: undefined });
                                    // console.log(value);
                                    setLeaveType(false)
                                  }else{
                                    setLeaveType(true)
                                  }
                                }}
                            />
                        </Form.Item>
                    </div>
                </div>
                { leavetype && (
                  <div className="form-group">
                      <label>
                      Leave Type <span className="text-danger">*</span>
                      </label>
                      <div style={{ position: 'relative' }} id='area'>
                          <Form.Item
                          name='leaveType'
                          className='custom-border'
                          rules={[
                              {
                                whitespace: true,
                                required: true,
                                message: "please select type",
                              },
                            ]}
                          >
                              <Select
                                  disabled={open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled'}
                                  className="custom-select custom-normal"
                                  getPopupContainer={() => document.getElementById('area')}
                                  style={{
                                  width: '100%',
                                  }}
                                  placeholder='Select type'
                              >
                                {leaves?.map((item, index) => {
                                  if(item?.value){
                                    return (
                                        <Option key={index} value={item?.value}>{item?.label}</Option>
                                    )
                                  }
                                  })}
                              </Select>
                          </Form.Item>
                      </div>
                  </div>)
                }
                <div className="form-group">
                  <label>
                  From <span className="text-danger">*</span>
                  </label>
                  <div style={{ position: 'relative' }} id='area'>
                      <Form.Item
                      name='startDate'
                      className='custom-border'
                      rules={[
                          {
                            required: true,
                            message: "please enter start date",
                          },
                        ]}
                      >
                          <DatePicker style={{backgroundColor: (open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled') ? '#e9ecef' : ''}} disabled={open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled'} className={(open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled') ? 'dateDisable form-control' : 'form-control'} onChange={e => {calculateTotalDays(e); handleFromDateChange(e); setGood(10); if(e === null || e){ form.setFieldsValue({ endDate: null }); calculateTotalDays(e); }}} getPopupContainer={() => document.getElementById('area')} />
                      </Form.Item>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                  To <span className="text-danger">*</span>
                  </label>
                  <div style={{ position: 'relative' }} id='area'>
                      <Form.Item
                      name='endDate'
                      className='custom-border'
                      rules={[
                          {
                            required: true,
                            message: "please enter end date",
                          },
                        ]}
                      >
                          <DatePicker style={{backgroundColor: (open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled') ? '#e9ecef' : ''}} disabled={open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled'} className={(open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled') ? 'dateDisable form-control' : 'form-control'} onChange={calculateTotalDays} disabledDate={disabledDate} getPopupContainer={() => document.getElementById('area')} />
                      </Form.Item>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                  Number of Days <span className="text-danger">*</span>
                  </label>
                    <Form.Item
                    name='totalDays'
                    className='custom-border'
                    >
                      <Input className='form-control' value={good} style={{color: 'black'}} disabled/>
                    </Form.Item>
                </div>
                <div className="form-group">
                  <label style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>Reason <span className="text-danger">*</span></div>
                  { !(open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled') && <small style={{marginTop: '5px', fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)'}}>{reasonLength} / 150</small>}
                  </label>
                  <Form.Item
                    name="description"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if(!value || value.trim() === ''){
                            return Promise.reject("please enter reason");
                          }
                          else if (/\s{2,}/.test(value)) {
                            return Promise.reject("please remove consecutive spaces");
                          }
                          else if (value.length < 5) {
                            return Promise.reject("reason length must be at least 5 characters long");
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="custom-border"
                  >
                    <Input.TextArea rows={3} disabled={open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled'} className={(open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled') ? 'dateDisable form-control' : 'form-control'} onChange={(e) => setReasonLength(e.target.value.length)} maxLength={150} />
                  </Form.Item>
                </div>
                {
                  !(open?.data?.status === 'Approved' || open?.data?.status === 'Declined' || open?.data?.status === 'Cancelled') && 
                  
                <div className="submit-section">
                  <Form.Item>
                    <Button
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                      disabled={loader}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </Form.Item>
                </div> 
              }
              </Form>
            </div>
          </div>
        </div>
      </Modal>
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
      <div id="edit_leave" className="modal custom-modal fade" role="dialog">
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
      </div>
      {/* /Edit Leave Modal */}
      {/* Delete Leave Modal */}
            {/* delete modall */}
            <Modal
        open={open.isDelOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ height: "280px" }}>
            <div
              className="modal-body"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="form-header">
                <h3 style={{ marginBottom: "30px" }}>Delete Request</h3>
                <p>
                  Are you sure you want to delete{" "}
                  <b>
                    {
                      open?.data?.leaveType === 'sick' ? 'Sick Leave' : open?.data?.leaveType === 'wfh' ? 'Work From Home' : open?.data?.leaveType === 'casual' ? 'Casual Leave' : open?.data?.leaveType === 'bereavement' ? 'Bereavement Leave' : 
                      open?.data?.leaveType === 'marriage' ? 'Marriage Leave' : open?.data?.leaveType === 'maternity' ? 'Maternity Leave' : open?.data?.leaveType === 'paternity' ? 'Paternity Leave' : open?.data?.leaveType === 'annual' ? 'Annual Leave' : 
                      open?.data?.leaveType === 'half' ? 'Half Leave' : open?.data?.leaveType === 'unpaid' ? 'Unpaid Leave' : ''
                    }
                  </b>?
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleDelete(open?.data?._id)}
                      disabled={loader}
                      style={{width: '100%'}}
                    >
                      {
                        loader ? <Spin size="small" indicator={antIcon} />
                          : 'Delete'
                      }
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                      style={{width: '100%'}}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      {/* <Delete/> */}
      {/* /Delete Leave Modal */}
    </div>
    {/* <Offcanvas/> */}
        </>         
      
        );
  }

export default LeaveEmployee;
