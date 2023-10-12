
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Table, Select, DatePicker, message, Button, Spin, Empty, Pagination } from 'antd';
import Modal from "@mui/material/Modal";
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import { Avatar_02,Avatar_05,Avatar_11, Avatar_12,Avatar_09,Avatar_10, Avatar_13, user_icon } from "../../../Entryfile/imagepath"
import Sidebar from '../../../initialpage/Sidebar/sidebar';
import Offcanvas from '../../../Entryfile/offcanvance';
import favicon from '../../../files/Icons/DaftarProIcon.svg';
import { useSelector } from 'react-redux';
import { apiServices } from '../../../Services/apiServices';
import ProfileInfoModal from '../../Pages/Profile/modals/ProfileInfoModal';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";

const Employeeslist = () => {

  const moment = require('moment');
  const [form] = Form.useForm();
  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const company_id = user_state?.user?.companyId
  const role = user_state?.user?.role

  const [allDesignations, setAllDesignations] = useState([])
  const [desigInfo, setDesigInfo] = useState({})
  const [roleInfo, setRoleInfo] = useState({})
  const [loader, setLoader] = useState(false)
  const [tableLoader, setTableLoader] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [repInfo, setRepInfo] = useState([])

  const [open, setOpen] = useState({ isAddOpen: false, isEditOpen: false, data: '' })
  const [users, setUsers] = useState([])

  useEffect(() => {
    if(role === 'admin' || permissions?.viewAllUsers) {
      getEmployees();
      getAllDesignations();
      getAllRoles();
      getReportsTo();
    }else if(role === 'admin' && permissions?.viewAllUsers && permissions?.updateUser && permissions?.updateStatusOfEmployee && permissions?.addUser){
      navigate('/restricted', { state: { unAuthorize: true}})
    }
  }, [])

  const getReportsTo = () => {
    apiServices("GET", "user/view-team-lead", null, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        res?.data?.User?.map((rep)=> {
          setRepInfo((prevRep) => ({
            ...prevRep,
            [rep?._id]: rep?.fullName,
          }));
        })
      }
    })
    .catch((err) => {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Get Department Info Error"
        }!`
      );
    });
  }

  const getEmployees = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `user/view-user?deleted=false${values === '' ? '' : values?.employeeName === '' ? '' : values?.employeeName ? `&employeeName=${values?.employeeName}` : filterValues?.employeeName ? `&employeeName=${filterValues?.employeeName}` : ''}${values === '' ? '' : values?.employeeId === '' ? '' : values?.employeeId ? `&employeeId=${encodeURIComponent(values?.employeeId)}` : filterValues?.employeeId ? `&employeeId=${encodeURIComponent(filterValues?.employeeId)}` : ''}${values === '' ? '' : values?.designation === '' ? '' : values?.designation ? `&designation=${values?.designation}` : filterValues?.designation ? `&designation=${filterValues?.designation}` : ''}${values === '' ? '' : values?.status === '' ? '' : values?.status ? `&userStatus=${values?.status}` : filterValues?.status ? `&userStatus=${filterValues?.status}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setUsers(res?.data?.users?.docs);
          setPaginationDetail(res?.data?.users)
          setTableLoader(false);
        }
      })
      .catch((err) => {
        setTableLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get All Employees Error"
          }!`
        );
      });
  }

  const getAllRoles = () => {
    apiServices("GET", "role/view-role", null, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        res?.data?.Role?.map((role)=> {
          setRoleInfo((prevRole) => ({
            ...prevRole,
            [role?._id]: role?.roleName,
          }));
        })
      }
    })
    .catch((err) => {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Get Role Info Error"
        }`
      );
    });
  }
  const getAllDesignations = () => {
    apiServices("GET", "designation", null, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setAllDesignations(res?.data?.Designation);
        res?.data?.Designation?.map((desig)=> {
          setDesigInfo((prevDesig) => ({
            ...prevDesig,
            [desig?._id]: desig?.designationName,
          }));
        })
      }
    })
    .catch((err) => {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Get Designation Info Error"
        }`
      );
    });
  }
  

  const handleClose = () => {
    setOpen({ isAddOpen: false, isEditOpen: false, data: '' });
  };

  const onFinishAdd = (values) => {

    const replacer = (key, value) => {
        if (typeof value === 'number') {
            return String(value);
        }else if(value === undefined || value === '' || value === null || !value){
            return ''
        }else if(key === 'dateOfBirth' || key === 'joiningDate'){
            return moment(value).format('YYYY-MM-DD');
        }
        return value;
        };
        const d = JSON.parse(JSON.stringify(values, replacer));
        // Remove keys with empty values
        Object.keys(d).forEach((key) => {
          if (d[key] === '') {
            delete d[key];
          }
        });

        let new_values = {
          ...d,
          companyId: company_id,
        }
        setLoader(true)
        apiServices("POST", "user/add-user", new_values, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setUsers((prev) => ([
            {
              ...d,
              _id: res?.data?.User?._id,
              companyId: company_id,
            },
            ...prev,
          ]))
          handleClose();
          message.success('Employee Added Successfully!')
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Add User Info Error"
          }!`
        );
      });
  }

  const onFinishEdit = (values) => {

    const replacer = (key, value) => {
        if (typeof value === 'number') {
            return String(value);
        }else if(value === undefined || value === '' || value === null || !value){
            return ''
        }else if(key === 'dateOfBirth' || key === 'joiningDate'){
            return moment(value).format('YYYY-MM-DD');
        }
        return value;
        };
        const d = JSON.parse(JSON.stringify(values, replacer));
        // Remove keys with empty values
        Object.keys(d).forEach((key) => {
          if (key === 'password' || d[key] === '') {
            delete d[key];
          }
        });
        if(open?.data?._id === user_state?.user?._id){
          localStorage.setItem('updated_user', JSON.stringify({imageUrl: d?.imageUrl, fullName: d?.fullName}))
          nav('/employee/employees-list', {state: {updated_user: {imageUrl: d?.imageUrl, fullName: d?.fullName}}})
        }
        
        let new_values = {
          ...d,
          _id: open?.data?._id,
          companyId: open?.data?.companyId
        }
        setLoader(true)
        apiServices("PUT", "user/update-user", new_values, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setUsers(
              users.map((user) => {
                  if (user._id === open?.data?._id) {
                return {
                  ...user,
                  ...d,
                };
              } else {
                return {
                    ...user,
                  };
                }
              })
            );
            handleClose()
            message.success('Employee Updated Successfully!')
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
                : "Update Employee Info Error"
            }!`
          );
        });
  }

  const [menu, setMenu] = useState(false)

	const toggleMobileMenu = () => {
		setMenu(!menu)
	  }
        const [data, setData] = useState([
          {id:1,image:Avatar_02,name:"John Doe",role:"Web Designer",employee_id:"FT-0001",email:"johndoe@example.com",mobile:'9876543210',joindate:"1 Jan 2013"},
          {id:2,image:Avatar_05,name:"Richard Miles",role:"Web Developer",employee_id:"FT-0002",email:"richardmiles@example.com",mobile:'9876543210',joindate:"18 Mar 2014"},
          {id:3,image:Avatar_11,name:"John Smith",role:"Android Developer",employee_id:"FT-0003",email:"johnsmith@example.com	",mobile:'9876543210',joindate:"1 Apr 2014"},
          {id:4,image:Avatar_12,name:"Mike Litorus",role:"IOS Developer",employee_id:"FT-0004",email:"mikelitorus@example.com",mobile:'9876543210',joindate:"1 Apr 2014"},
          {id:5,image:Avatar_09,name:"Wilmer Deluna",role:"Team Leader",employee_id:"FT-0005",email:"wilmerdeluna@example.com",mobile:'9876543210',joindate:"22 May 2014"},
          {id:6,image:Avatar_10,name:"Jeffrey Warden",role:"Web Developer",employee_id:"FT-0006",email:"jeffreywarden@example.com",mobile:'9876543210',joindate:"16 Jun 2013"},
          {id:7,image:Avatar_13,name:"Bernardo Galaviz",role:"Web Developer",employee_id:"FT-0007",email:"bernardogalaviz@example.com",mobile:'9876543210',joindate:"1 Jan 2013"},
        ]);

        useEffect( ()=>{
          if($('.select').length > 0) {
            $('.select').select2({
              minimumResultsForSearch: -1,
              width: '100%'
            });
          }
        });  
        
          const columns = [
            
            {
              title: 'Name',
              dataIndex: 'fullName',
              render: (text, record) => (            
                  <h2 className="table-avatar">
                    <Link to="/profile/employee-profile" onClick={() => sessionStorage.setItem(`employee_tab`, 'profile')} state={{user_data: record}} className="avatar"><img alt="" src={record?.imageUrl ? record?.imageUrl : user_icon} /></Link>
                    <Link to="/profile/employee-profile" onClick={() => sessionStorage.setItem(`employee_tab`, 'profile')} state={{user_data: record}}>{text} <span> <label>{desigInfo[record?.designationId]}</label> </span></Link>
                  </h2>
                ),
            },
            {
              title: 'Employee ID',
              dataIndex: 'employeeId',
            },
            {
              title: 'Email',
              dataIndex: 'email',
            },
            {
              title: 'Join Date',
              dataIndex: 'joiningDate',
            },
            {
              title: 'Role',
              dataIndex: 'roleId',
              render: (text, record) => (            
                  <>{roleInfo[text]}</>
              ),
            },
            {
              title: 'Reports To',
              dataIndex: 'reportsTo',
              render: (text, record) => (            
                <>{repInfo[text] || 'None'}</>
            ),
            },
            // {
            //   title: 'Role',
            //   render: (text, record) => (
            //     <div className="dropdown">
            //     <a href="" className="btn btn-white btn-sm btn-rounded dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Web Developer </a>
            //     <div className="dropdown-menu">
            //       <a className="dropdown-item" href="#">Software Engineer</a>
            //       <a className="dropdown-item" href="#">Software Tester</a>
            //       <a className="dropdown-item" href="#">Frontend Developer</a>
            //       <a className="dropdown-item" href="#">UI/UX Developer</a>
            //     </div>
            //   </div>
            //     ),
            // },
            {
              title: 'Action',
              render: (text, record) => (
                  <div className="dropdown dropdown-action text-end">
                    {
                      (role === 'admin' || permissions?.updateStatusOfEmployee || permissions?.updateUser) &&
                        <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                    }
                    <div className="dropdown-menu dropdown-menu-right">
                    {
                      (role === 'admin' || permissions?.updateUser) &&
                      <a className="dropdown-item" href="javascript:void(0)" onClick={() => setOpen({ isAddOpen: false, isEditOpen: true, data: record })}><i className="fa fa-pencil m-r-5" /> Edit</a>
                    }
                    {
                      (role === 'admin' || permissions?.updateStatusOfEmployee) &&
                      <a className="dropdown-item" href="javascript:void(0)" onClick={() => setOpen({ isAddOpen: false, isEditOpen: false, isDelOpen: true, data: record })}><i className={record?.userStatus === 'Active' ? 'fa fa-user-times m-r-5' : 'fa fa-check m-r-5'} /> {record?.userStatus === 'Active' ? 'Disable' : 'Enable'}</a>
                    }
                    </div>
                  </div>
                ),
            },
          ]

          const onFinishDelete = (id, type) => {
            if(type === 'disable'){
              setLoader(true)
            apiServices("DELETE", "user/delete-user", id, user_state)
              .then((res) => {
                if (res?.data?.success === true) {
                  // setUsers([...users.filter((user) => user._id !== id)]);
                  getEmployees(filterValues, currentPage, pageSize);
                  handleClose();
                  message.success("Employee Disabled Successfully!");
                  setLoader(false)
                }
              })
              .catch((err) => {
                setLoader(false)
                message.error(
                  `${
                    err?.response?.data?.msg
                      ? err?.response?.data?.msg
                      : err?.response?.data?.validation?.body?.message
                      ? err?.response?.data?.validation?.body?.message
                      : "Disable Employee Error"
                  }!`
                );
              });
            }else{
              setLoader(true)
              const data = {
                _id: id
              }
            apiServices("PUT", "user/enable-user", data, user_state)
              .then((res) => {
                if (res?.data?.success === true) {
                  // setUsers([...users.filter((user) => user._id !== id)]);
                  getEmployees(filterValues, currentPage, pageSize);
                  handleClose();
                  message.success("Employee Enabled Successfully!");
                  setLoader(false)
                }
              })
              .catch((err) => {
                setLoader(false)
                message.error(
                  `${
                    err?.response?.data?.msg
                      ? err?.response?.data?.msg
                      : err?.response?.data?.validation?.body?.message
                      ? err?.response?.data?.validation?.body?.message
                      : "Enable Employee Error"
                  }!`
                );
              });
            }
          } 

          const onFilterFinish = (values) => {
            for (const key in values) {
              if (values[key]) {
                // getEmployees(values, currentPage, pageSize);
                getEmployees(values, 1, pageSize);
                console.log(values);
                setFilterValues(values)
                setCurrentPage(1);
              }
            }
          }

          const antIcon = (
            <LoadingOutlined
              style={{
                fontSize: 24,
                color: '#fff'
              }}
              spin
            />
          );

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
                    {
                      (role === 'admin' || permissions?.viewAllUsers) ? 'No Employee Record found!' : 'You are Restricted to View Employees'
                    }
                   
                  </div>
                  {/* <div
                    style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
                  >
                    Click 'Add Employees' Button To Create <br /> A New Employee{" "}
                  </div> */}
                </div>
              }
            />
          );

      return ( 
        <>
        <div className={`main-wrapper ${menu ? 'slide-nav': ''}`}> 
           <div className="page-wrapper">
              <Helmet>
                  <title>Employees List - DaftarPro</title>
                  <meta name="description" content="Login page"/>
                  <link rel="icon" type="image/x-icon" href={favicon} />				
              </Helmet>
           {/* Page Content */}
           <div className="content container-fluid">
             {/* Page Header */}
             <div className="page-header">
               <div className="row align-items-center">
                 <div className="col">
                   <h3 className="page-title">Employee</h3>
                   <ul className="breadcrumb">
                     <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                     <li className="breadcrumb-item active">Employee</li>
                   </ul>
                 </div>
                 <div className="col-auto float-end ms-auto">
                 {
                  (role === 'admin' || permissions?.addUser) &&
                    <a href="javascript:void(0)" className="btn add-btn" onClick={() => setOpen({ isAddOpen: true, isEditOpen: false, data: '' })}><i className="fa fa-plus" /> Add Employee</a>
                 }
                   <div className="view-icons">
                     <Link to="/employee/allemployees" className="grid-view btn btn-link"><i className="fa fa-th" /></Link>
                     <Link to="/employee/employees-list" className="list-view btn btn-link active"><i className="fa fa-bars" /></Link>
                   </div>
                 </div>
               </div>
             </div>
             {/* /Page Header */}
             {/* Search Filter */}
              <Form
                form={form}
                onFinish={onFilterFinish}
              >
              <div className="row filter-row">
                <div className="col-sm-6 col-md-2">  
                  <div className="form-group">
                  <Form.Item
                      name="employeeId"
                      className="custom-border"
                    >
                    <Input
                      className="form-control"
                      style={{height:'50px'}}
                      placeholder='Employee ID'
                    />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-2">  
                  <div className="form-group">
                  <Form.Item
                      name="employeeName"
                      className="custom-border"
                    >
                  <Input
                      className="form-control"
                      style={{height:'50px'}}
                      placeholder='Employee Name'
                    />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-2">
                  <div style={{ position: 'relative' }} id='area1'>
                    <Form.Item
                      name="designation"
                      className="custom-border"
                    >
                      <Select
                        className="custom-select"
                        style={{
                          width: '100%',
                        }}
                        placeholder='Designation'
                        size='large'
                        getPopupContainer={() => document.getElementById('area1')}
                      >
                        {allDesignations?.map((item, index) => {
                        return (
                            <Option key={index} value={item?._id}>{item?.designationName}</Option>
                        )
                        })}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-2">
                  <div style={{ position: 'relative' }} id='area1'>
                    <Form.Item
                      name="status"
                      className="custom-border"
                    >
                      <Select
                        className="custom-select"
                        style={{
                          width: '100%',
                        }}
                        placeholder='Status'
                        size='large'
                        getPopupContainer={() => document.getElementById('area1')}
                        options={[
                          {
                            value: 'Active',
                            label: "Active",
                          },
                          {
                            value: 'In-Active',
                            label: "In-Active",
                          },
                        ]}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-2">  
                  <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-100" disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}> Search </button>
                </div>
                <div className="col-sm-6 col-md-2">
                  <button href="javascript:void(0)" type="reset" onClick={() => { form.resetFields(); getEmployees('', 1, pageSize); setFilterValues(null); setCurrentPage(1)}} className="btn btn-success btn-block w-100" style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}} disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}> Reset </button>  
                </div>
              </div>
              </Form>
             {/* /Search Filter */}
             <div className="row">
               <div className="col-md-12">
                 <div className="table-responsive">
                 <Table
                    loading={tableLoader}
                    className={users?.length > 0 ? "table-striped" : ""}
                    locale={{
                      emptyText: tableLoader ? null : customEmptyText,
                    }}
                    // pagination= { {total : users?.length,
                    //   showTotal : (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    //   showSizeChanger : true,onShowSizeChange: onShowSizeChange ,itemRender : itemRender } }
                    style = {{overflowX : 'auto', paddingBottom: '65px'}}
                    columns={columns}                 
                    // bordered
                    dataSource={users}
                    // rowKey={record => record.id}
                    // onChange={console.log("change")}
                    pagination={false}
                    // pagination={{
                    //   total: paginationDetail?.total,
                    //     pageSize: pageSize,
                    //     defaultCurrent:1,
                    //     current: currentPage,
                    //     showTotal: (total, range) =>
                    //       `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    //     onChange: (page, size) => {
                    //       console.log(page, size);
                    //       setPageSize(size); setCurrentPage(page);
                    //       getEmployees(filterValues, page, size)
                    //     },
                    //     showSizeChanger: true,
                    //     pageSizeOptions: ['20', '30', '40', '50'],
                    //     itemRender: itemRender,
                    // }}
                  />
                  {
                    users?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={paginationDetail?.totalDocs}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                        onChange={(page, size) => {
                          setPageSize(size); setCurrentPage(page);
                          getEmployees(filterValues, page, size)
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
           </div>
           {/* /Page Content */}
           {/* Add Employee Modal */}
           {
              open?.isAddOpen &&
              <ProfileInfoModal
                open={open}
                handleClose={handleClose}
                onFinishAdd={onFinishAdd}
                loader={loader}
              />
            }
           {/* /Add Employee Modal */}
           {/* Edit Employee Modal */}
           {
              open?.isEditOpen &&
              <ProfileInfoModal
                open={open}
                handleClose={handleClose}
                user_data={open?.data}
                onFinishEdit={onFinishEdit}
                loader={loader}
              />
            }
           {/* /Edit Employee Modal */}
           {/* Delete Employee Modal */}
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
                      <h3 style={{ marginBottom: "30px" }}>{open?.data?.userStatus === 'Active' ? 'Disable' : 'Enable'} Employee</h3>
                      <p>
                        Are you sure you want to {open?.data?.userStatus === 'Active' ? 'Disable' : 'Enable'}{" "}
                        <b>{open?.data?.fullName}</b>?
                      </p>
                    </div>
                    <div className="modal-btn delete-action">
                      <div className="row">
                        <div className="col-6">
                          <Button
                            htmlType="submit"
                            className="btn btn-primary continue-btn"
                            onClick={() => {
                              // onFinishDelete(open?.data?._id);
                              if(open?.data?.userStatus === 'Active'){
                                onFinishDelete(open?.data?._id, 'disable')
                              }else{
                                onFinishDelete(open?.data?._id, 'enable')
                              }
                            }}
                            disabled={loader}
                            style={{width: '100%'}}
                          >
                            {
                              loader ? <Spin size="small" indicator={antIcon} />
                                : open?.data?.userStatus === 'Active' ? 'Disable' : 'Enable'
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
           {/* /Delete Employee Modal */}
         </div>
        </div>
        {/* <Offcanvas/> */}
        </>

    
        );
}

export default Employeeslist;
