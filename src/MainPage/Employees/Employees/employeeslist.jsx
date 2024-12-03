
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
import { FileExcelOutlined, LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useTranslation } from 'react-i18next';
import { excelImport } from '../../../Services/uploadImage';
import { FileDownloadSharp } from '@mui/icons-material';

const Employeeslist = () => {
  const { t, i18n } = useTranslation();
  const moment = require('moment');
  const [form] = Form.useForm();
  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const company_id = user_state?.user?.companyId
  const user_email = user_state?.user?.email
  const role = user_state?.user?.role

  const [allRoles, setAllRoles] = useState([])
  const [allDesignations, setAllDesignations] = useState([])
  const [desigInfo, setDesigInfo] = useState({})
  const [upload, setUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState(false)
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
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    if(role === 'admin' || permissions?.viewAllUsers || permissions?.updateUser || permissions?.updateStatusOfEmployee || permissions?.addUser) {
      getEmployees();
      getAllDesignations();
      getAllRoles();
      getReportsTo();
    }else{
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
            : t('allEmp.errors.getDepartmentInfoError')
        }!`
      );
    });
  }

  const handleDownloadSample = async () => {
    const url = "https://res.cloudinary.com/dcxpovyr9/raw/upload/v1724867279/nayhp1o5iq3ajz0zcoor";
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "Employee Data Sample.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Clean up the object URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const getEmployees = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `user/view-user?deleted=false${values === '' ? '' : values?.employeeName === '' ? '' : values?.employeeName ? `&employeeName=${values?.employeeName}` : filterValues?.employeeName ? `&employeeName=${filterValues?.employeeName}` : ''}${values === '' ? '' : values?.employeeId === '' ? '' : values?.employeeId ? `&employeeId=${encodeURIComponent(values?.employeeId)}` : filterValues?.employeeId ? `&employeeId=${encodeURIComponent(filterValues?.employeeId)}` : ''}${values === '' ? '' : values?.designation === '' ? '' : values?.designation ? `&designation=${values?.designation}` : filterValues?.designation ? `&designation=${filterValues?.designation}` : ''}${values === '' ? '' : values?.userRole === '' ? '' : values?.userRole ? `&userRole=${values?.userRole}` : filterValues?.userRole ? `&userRole=${filterValues?.userRole}` : ''}${values === '' ? '' : values?.status === '' ? '' : values?.status ? `&userStatus=${values?.status}` : filterValues?.status ? `&userStatus=${filterValues?.status}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setUsers(res?.data?.users?.docs);
          setPaginationDetail(res?.data?.users)
          setTableLoader(false);
          setCurrency(res?.data?.currency);
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
              : t('allEmp.errors.getEmployeesError')
          }!`
        );
      });
  }

  const getAllRoles = () => {
    apiServices("GET", "role/view-role", null, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setAllRoles(res?.data?.Role);
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
            : t('allEmp.errors.getRoleInfoError')
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
            : t('allEmp.errors.getDesignationInfoError')
        }`
      );
    });
  }
  

  const handleClose = () => {
    setOpen({ isAddOpen: false, isEditOpen: false, data: '' });
  };

  const closeUpload = () => {
    setUpload(false);
    setUploadFile();
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
              userStatus: 'Active'
            },
            ...prev,
          ]))
          handleClose();
          message.success(t('allEmp.errors.addEmployeeSuccess'))
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
              : t('allEmp.errors.addUserInfoError')
          }!`
        );
      });
  }

  const onFinishEdit = (values) => {

    const replacer = (key, value) => {
        if (typeof value === 'number') {
            return String(value);
        }else if(value === undefined || value === '' || value === null || !value){
            // return ''
            return null
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
            message.success(t('allEmp.errors.updateEmployeeSuccess'))
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
                : t('allEmp.errors.updateEmployeeError')
            }!`
          );
        });
  }

  const onFileUpload = async () => {
    setLoader(true);
    console.log("function called", uploadFile);

    excelImport(uploadFile, company_id, user_email)
    .then((res) => {
      if (res?.data?.success == true){
        setLoader(false);
        message.success("Importing employee data. You'll be notified by email when done.")
        closeUpload();
      }
      })
    .catch((err) => {
      message.error(
        err?.response?.data?.msg
          ? err?.response?.data?.msg
          : err?.response?.data?.validation?.body?.message
          ? err?.response?.data?.validation?.body?.message
          : t("projectScreen.errors.fileUploadError", { file: uploadFile?.name })
      );
      setLoader(false);
    });
  };

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
              title: t('aDash.name'),
              dataIndex: 'fullName',
              render: (text, record) => (            
                  <h2 className="table-avatar">
                    <Link to="/profile/employee-profile" onClick={() => sessionStorage.setItem(`employee_tab`, 'profile')} state={{user_data: record}} className="avatar"><img alt="" src={record?.imageUrl ? record?.imageUrl : user_icon} /></Link>
                    <Link to="/profile/employee-profile" onClick={() => sessionStorage.setItem(`employee_tab`, 'profile')} state={{user_data: record}}>{text} <span> <label>{desigInfo[record?.designationId]}</label> </span></Link>
                  </h2>
                ),
            },
            {
              title: t('allEmp.employeeID'),
              dataIndex: 'employeeId',
            },
            {
              title: t('aDash.email'),
              dataIndex: 'email',
            },
            {
              title: t('allEmp.joinDate'),
              dataIndex: 'joiningDate',
            },
            {
              title: t('allEmp.role'),
              dataIndex: 'roleId',
              render: (text, record) => (            
                  <>{roleInfo[text]}</>
              ),
            },
            {
              title: t('allEmp.reportsTo'),
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
              title: t('allEmp.action'),
              render: (text, record) => (
                  <div className="dropdown dropdown-action text-end">
                    {
                      (role === 'admin' || permissions?.updateStatusOfEmployee || permissions?.updateUser) &&
                        <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                    }
                    <div className="dropdown-menu dropdown-menu-right">
                    {
                      (role === 'admin' || permissions?.updateUser) &&
                      <a className="dropdown-item" href="javascript:void(0)" onClick={() => setOpen({ isAddOpen: false, isEditOpen: true, data: record })}><i className={`fa fa-pencil ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} /> {t('edit')}</a>
                    }
                    {
                      (role === 'admin' || permissions?.updateStatusOfEmployee) &&
                      <a className="dropdown-item" href="javascript:void(0)" onClick={() => setOpen({ isAddOpen: false, isEditOpen: false, isDelOpen: true, data: record })}><i className={record?.userStatus === 'Active' ? `fa fa-user-times ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}` : `fa fa-check ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} /> {record?.userStatus === 'Active' ? t('disable') : t('enable')}</a>
                    }
                    </div>
                  </div>
                ),
            },
          ]

          const onFinishDelete = (id, type, value) => {
            if(type === 'disable'){
              let d = {
                _id: id,
                employeeExitDate: moment(value?.employeeExitDate).format("YYYY-MM-DD")
                // employeeExitDate: moment(value?.employeeExitDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
              }
              setLoader(true)
            apiServices("DELETE", "user/delete-user", d, user_state)
              .then((res) => {
                if (res?.data?.success === true) {
                  // setUsers([...users.filter((user) => user._id !== id)]);
                  getEmployees(filterValues, currentPage, pageSize);
                  handleClose();
                  message.success(t('allEmp.errors.disableEmployeeSuccess'));
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
                      : t('allEmp.errors.disableEmployeeError')
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
                  message.success(t('allEmp.errors.enableEmployeeSuccess'));
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
                      : t('allEmp.errors.enableEmployeeError')
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

          const disabledDate = (current) => {
            return current && current > new Date();
          };

      return ( 
        <>
        <div className={`main-wrapper ${menu ? 'slide-nav': ''}`}> 
           <div className="page-wrapper">
              <Helmet>
                  <title>{t('allEmp.listpageTitle')} - {t('header.daftarPro')}</title>
                  <meta name="description" content="Login page"/>
                  <link rel="icon" type="image/x-icon" href={favicon} />				
              </Helmet>
           {/* Page Content */}
           <div className="content container-fluid">
             {/* Page Header */}
             <div className="page-header">
               <div className="row align-items-center">
                 <div className="col">
                 <h3 className="page-title">{t('aAttend.employee')}</h3>
                   
                 </div>
                 <div className="col-auto float-end ms-auto">
                 {
                  (role === 'admin' || permissions?.addUser) &&
                  <a href="javascript:void(0)" className="btn add-btn" style={{marginLeft:'5px'}} onClick={() => setOpen({ isAddOpen: true, isEditOpen: false, data: '' })}><i className="fa fa-plus" /> {t('allEmp.addEmployee')}</a>
                }
                {/* {
                  (role === 'admin' || permissions?.addUser) &&
                  <a href="javascript:void(0)" className="btn add-btn" onClick={() => setUpload(true)}><i className="la la-file-excel" />Import Data</a>
                } */}
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
                <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">  
                  <div className="form-group">
                  <Form.Item
                      name="employeeId"
                      className="custom-border"
                    >
                    <Input
                      className="form-control"
                      style={{height:'50px'}}
                      placeholder={t('allEmp.employeeID')}
                    />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">  
                  <div className="form-group">
                  <Form.Item
                      name="employeeName"
                      className="custom-border"
                    >
                  <Input
                      className="form-control"
                      style={{height:'50px'}}
                      placeholder={t('employeeName')}
                    />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
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
                        placeholder={t('allEmp.designation')}
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
                <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
                  <div style={{ position: 'relative' }} id='area1'>
                    <Form.Item
                      name="userRole"
                      className="custom-border"
                    >
                      <Select
                        className="custom-select"
                        style={{
                          width: '100%',
                        }}
                        placeholder='Role'
                        size='large'
                        getPopupContainer={() => document.getElementById('area1')}
                      >
                        {allRoles?.map((item, index) => {
                        return (
                            <Option key={index} value={item?._id}>{item?.roleName}</Option>
                        )
                        })}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
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
                        placeholder={t('status')}
                        size='large'
                        getPopupContainer={() => document.getElementById('area1')}
                        options={[
                          {
                            value: 'Active',
                            label: t('active'),
                          },
                          {
                            value: 'In-Active',
                            label: t('inActive'),
                          },
                        ]}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div
                  className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: "2px",
                  }}
                >
                  <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-100" disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}> {t('search')} </button> 
                  <button href="javascript:void(0)" type="reset" onClick={() => { form.resetFields(); getEmployees('', 1, pageSize); setFilterValues(null); setCurrentPage(1)}} className="btn btn-success btn-block w-100 resetButton" style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}} disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}> {t('reset')} </button>  
                </div>
                {/* <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">  
                  <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-100" disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}> {t('search')} </button>
                </div>
                <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
                  <button href="javascript:void(0)" type="reset" onClick={() => { form.resetFields(); getEmployees('', 1, pageSize); setFilterValues(null); setCurrentPage(1)}} className="btn btn-success btn-block w-100" style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}} disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}> {t('reset')} </button>  
                </div> */}
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
                    style = {{overflowX : 'auto'}}
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
                    components={i18n.dir()==="rtl" ?
                      {
                      header: {
                        cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th>,
                      },
                    } :
                    null
                    }
                    onRow={ i18n.dir()==="rtl" ?
                      (record, rowIndex) => {
                      return {
                        style: { textAlign: 'right' }, // Align table data to the right
                      };
                    } :
                    null
                    }
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
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, size) => {
                          setPageSize(size); setCurrentPage(page);
                          getEmployees(filterValues, page, size)
                        }}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
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
                currency= {currency}
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
                currency= {currency}
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
                <div className="modal-content" style={{ height: open?.data?.userStatus === 'Active' ? '406px' : '280px' }}>
                  {
                    open?.data?.userStatus === 'Active' ?
                    <div className="modal-body">
                      <Form
                        // form={form}
                        name="control-hooks"
                        onFinish={(val) => onFinishDelete(open?.data?._id, 'disable', val)}
                        onFinishFailed={({errorFields}) => {
                          console.log(errorFields.map(field => field.errors.toString().includes('consecutive')));
                          console.log(errorFields);
                          const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                          if(consecutiveSpacesError){
                            message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                          }else{
                            message.error(t('allEmp.errors.fillRequiredFields'))
                          }
                        }}
                        // initialValues={{
                        //   designationName: open?.data
                        //     ? open?.data?.designationName
                        //     : "",
                        // }}
                      >
                        <div className="form-header" style={{ marginBottom: "50px", marginTop: '21px'}}>
                          <h3 style={{ marginBottom: "20px"}}>{t('allEmp.disableEmployee')}</h3>
                          <p style={{fontSize: '15px'}}>
                          <span dangerouslySetInnerHTML={{ __html: t('allEmp.disableConfirmation', { fullName: open?.data?.fullName }) }} />
                          {/* {t('allEmp.disableConfirmation', { fullName:open?.data?.fullName })} */}
                          </p>
                        </div>
                        <div className="form-group">
                          <label>
                          {t('allEmp.employeeExitDate')} <span className="text-danger">*</span>
                          </label>
                          <Form.Item
                            name="employeeExitDate"
                            rules={[
                              {
                                // whitespace: true,
                                required: true,
                                message: t('allEmp.errors.pleaseSelectDate'),
                              },
                            ]}
                            className="custom-border"
                          >
                            <DatePicker className='form-control' disabledDate={disabledDate} placeholder='YYYY-MM-DD' style={{minHeight: '45px'}} />
                          </Form.Item>
                        </div>
                        <div className="submit-section">
                          <Form.Item>
                            <div className="row">
                          <div className="col-6">
                            <Button
                              htmlType="submit"
                              className="btn btn-primary continue-btn"
                              // onClick={() => onFinishDelete(open?.data?._id)}
                              disabled={loader}
                              style={{width: '100%'}}
                            >
                              {
                                loader ? <Spin size="small" indicator={antIcon} />
                                  : open?.data?.userStatus === 'Active' ? t('disable') : t('enable')
                              }
                            </Button>
                          </div>
                          <div className="col-6">
                            <Button
                              onClick={handleClose}
                              className="btn btn-primary submit-btn"
                              style={{width: '100%'}}
                            >
                              {t('cancel')}
                            </Button>
                          </div>
                        </div>
                          </Form.Item>
                        </div>
                      </Form>
                    </div> :
                    <div
                      className="modal-body"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div className="form-header">
                        <h3 style={{ marginBottom: "30px" }}>{open?.data?.userStatus === 'Active' ? t('disable') : t('enable')} {t('aAttend.employee')}</h3>
                        <p>
                        <span dangerouslySetInnerHTML={{ __html: t('allEmp.enableConfirmation', { fullName: open?.data?.fullName }) }} />
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
                                  : open?.data?.userStatus === 'Active' ? t('disable') : t('enable')
                              }
                            </Button>
                          </div>
                          <div className="col-6">
                            <Button
                              onClick={handleClose}
                              className="btn btn-primary submit-btn"
                              style={{width: '100%'}}
                            >
                              {t('cancel')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </Modal>

            <Modal
              open={upload}
              onClose={closeUpload}
              aria-labelledby="modal-modal-title"
              // className="modal custom-modal fade"
              aria-describedby="modal-modal-description"
              disableRestoreFocus
              BackdropProps={{
                style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
              }}
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Import Excel File
                    </h5>
                    <button type="button" className="close" onClick={closeUpload}>
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <Form
                      // form={form}
                      name="control-hooks"
                      //onFinish={(val) => onFileUpload(val)}
                      onFinish={onFileUpload}
                    >
                      <div className="form-group">
                      <label>
                        Sample File <span className="text-danger">*</span>
                      </label>
                      <Button
                        onClick={handleDownloadSample}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          border: "1px solid #ced4da",
                          borderRadius: "8px", // Rounded corners
                          padding: "0.375rem 0.75rem",
                          backgroundColor: "#f8f9fa", // Light background for better contrast
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center" }}>
                          {/* <i
                            className="la la-file-excel" // Ensure this icon class is correct
                            style={{ marginRight: "8px", color: "#28a745", fontSize: "1.2rem" }}
                          /> */}
                          <FileExcelOutlined
                            style={{ marginRight: "8px", color: "#28a745", fontSize: "1.2rem" }}
                          />
                          Employee Data Sample.xlsx
                        </span>
                        <FileDownloadSharp
                          style={{ color: "#007bff", fontSize: "1.2rem" }} 
                        />
                      </Button>
                    </div>
                      <div className="form-group">
                        <label>
                          Excel File <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                          name="excelFile"
                          rules={[
                            {
                              required: true,
                              message: 'please choose a file to upload',
                          },
                          ]}
                          className="custom-border"
                        >
                          <input
                            className="form-control"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file && (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
                                console.log(file);
                                setUploadFile(file);
                                //onFileUpload(file, "normal");
                              } else {
                                message.error("Please select a .xls or .xlsx file.");
                              }
                            }}
                            type="file"
                            accept=".xls,.xlsx"
                          />
                        </Form.Item>
                      </div>
                      <div className="submit-section">
                        <Form.Item>
                          <Button
                            htmlType="submit"
                            className="btn btn-primary submit-btn"
                            disabled={loader}
                          >
                            {
                              loader ? <Spin size="small" indicator={antIcon} />
                                : 'Upload'
                            }
                          </Button>
                        </Form.Item>
                      </div>
                    </Form>
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
