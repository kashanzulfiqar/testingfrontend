/**
 * TermsCondition Page
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar_02, Avatar_05, Avatar_09, Avatar_10, Avatar_16, eye, user_icon } from '../../../Entryfile/imagepath'
import { keyboard, mouse, laptop } from '../../../Entryfile/imagepath';
import Offcanvas from '../../../Entryfile/offcanvance';
import { DatePicker, Empty, Form, Input, Select, Spin, Table, message, InputNumber, Upload, Skeleton } from 'antd';
import Modal from "@mui/material/Modal";
import { itemRender } from '../../paginationfunction';
import PhoneNoInput from '../../../Components/PhoneNoInput';
import moment from 'moment';
import ProfileInfoModal from './modals/ProfileInfoModal';
import { apiServices } from '../../../Services/apiServices';
import { LoadingOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { apiUploadToS3 } from '../../../Services/uploadImage';
import EmployeeProjectsScreen from './clientProfileScreens/EmployeeProjectsScreen';



const EmployeeProfile = () => {
  const moment = require('moment');
  const location = useLocation();
  const nav = useNavigate();
  const user_data = location?.state?.user_data;
  const allDataLocal = JSON.parse(localStorage.getItem("allDataLocal"));

  let active = sessionStorage.getItem("emp_active_tab");
  let employee_tab = sessionStorage.getItem("employee_tab");
  
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const { loginvalue } = useSelector((state) => state.user);
  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role
  const company_id = user_state?.user?.companyId
  const [form] = Form.useForm();

  const UserName = loginvalue?.email?.split('@')[0];
  const ProfileName = UserName?.charAt(0).toUpperCase() + UserName?.slice(1)
  console.log(loginvalue, "loginvalue");

  const [activeTab, setActiveTab] = useState(employee_tab ? employee_tab : active ? active : 'profile')
  if(employee_tab){
    setTimeout( function() { 
    sessionStorage.removeItem('employee_tab');
    }, 1000);
  }
  const [loader, setLoader] = useState(false)
const [imageLoader, setImageLoader] = useState(false)
const [dataLoading, setDataLoading] = useState(false)
const [image, setImage] = useState('')
  const [emergValue, setEmergValue] = useState(null)
  const [allData, setAllData] = useState()
  const [phoneLengthError, setPhoneLengthError] = useState(false);
  const [deptInfo, setDeptInfo] = useState([])
  const [desigInfo, setDesigInfo] = useState([])
  const [repInfo, setRepInfo] = useState([])
  const [eduInfo, setEduInfo] = useState([])
  const [expInfo, setExpInfo] = useState([])
  const [emergInfo, setEmergInfo] = useState([])
  const [bankInfo, setBankInfo] = useState({})
  const [open, setOpen] = useState({
  isFamilyInfoOpen: false,
  isEduInfoOpen: false,
  isExpInfoOpen: false,
  isBankInfoOpen: false,
  isEmergInfoOpen: false, 
  isprofileInfoOpen: false,
  data: '' 
  });

  useEffect(() => {
    if ($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%'
      });
    }
  });
const [imageChange, setImageChange] = useState(1)
  useEffect(() => {
    if(location.pathname === "/profile/employee-profile"){
      setAllData(allDataLocal ? allDataLocal : user_data)
    }else if(location.pathname === "/profile"){
      setActiveTab(employee_tab ? employee_tab : active ? active : 'profile')
      if(imageChange === 1){
        setDataLoading(true)
      apiServices("GET", "user/employee-overview", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllData(allDataLocal ? allDataLocal : res?.data?.user)
          setDataLoading(false)
          setImageChange(prev => prev+1)
        }
      })
      .catch((err) => {
        setDataLoading(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Employee Info Error"
          }!`
        );
      });
      }
    }
  }, [location])
  
  
  useEffect(() => {
    if(activeTab === 'profile'){
      getReportsTo()
      getDepartment();
      getDesignation();
    }
    // if(role === 'admin' || permissions?.viewAllUsers) {
    //   getReportsTo()
    //   getDepartment();
    //   getDesignation();
    // }else{
    //   nav('/restricted', { state: { unAuthorize: true}})
    // }
  }, [])

  useEffect(() => {
    // window.scrollTo(0, 0);
    // sessionStorage.clear();
    sessionStorage.setItem(`emp_active_tab`, `${activeTab}`)
  }, [activeTab])

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

  const getDepartment = () => {
  apiServices("GET", "team/view-team", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          console.log(res?.data?.Team);
          res?.data?.Team?.map((dept)=> {
            setDeptInfo((prevDept) => ({
              ...prevDept,
              [dept?._id]: dept?.teamName,
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
  const getDesignation = () => {
  apiServices("GET", "designation", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
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
          }!`
        );
      });
    }
  

const handleClose = () => {
  setOpen({ 
    isFamilyInfoOpen: false,
    isEduInfoOpen: false,
    isExpInfoOpen: false,
    isBankInfoOpen: false,
    isEmergInfoOpen: false, 
    isprofileInfoOpen: false,
    data: '',
  });
  setPhoneLengthError(false)
  setEmergValue(null)
  form.resetFields()
};

  const onHandleEmergChange = (type, value) => {
    if (!value) {
      setPhoneLengthError({emp: true});
    }
    else if (value && value.length < 4) {
      setPhoneLengthError({len: true});
    } else {
      setPhoneLengthError(false);
    }

      let newvalue = value ? "+" + value : "";

      const updatedValues = {
        [type]: `${newvalue}`,
      };
      form.setFieldsValue(updatedValues)
      setEmergValue({
        [type]: `${newvalue}`,
      });
  };

  const onFinish = (values) => {

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
        if(allData?._id === user_state?.user?._id){
          localStorage.setItem('updated_user', JSON.stringify({imageUrl: d?.imageUrl, fullName: d?.fullName}))
          nav('/profile/employee-profile', {state: {updated_user: {imageUrl: d?.imageUrl, fullName: d?.fullName}, user_data: user_data}})
        }
        const newData = { ...allData };
        delete newData.password;
        let new_values = {
          ...newData,
          ...d,
          }
          setLoader(true)
          apiServices("PUT", "user/update-user", new_values, user_state)
          .then((res) => {
            if (res?.data?.success === true) {
              setAllData((prev) => ({
                ...prev,
                ...d,
              }))
              localStorage.setItem('allDataLocal', JSON.stringify({...new_values, password: user_data?.password}));
              message.success('Profile Details Updated Successfully!')
              handleClose()
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
                  : "Update Profile Details Error"
              }!`
            );
          });
  }

  const onBankFinish = (values) => {
    let d1 = {
      ...allData,
      ...values
    }
    Object.keys(d1).forEach((key) => {
      if (key === 'password') {
        delete d1[key];
      }
    });
    setLoader(true)
    apiServices("PUT", "user/update-user", d1, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setAllData((prev) => ({
          ...prev,
          ...values
        }))
        localStorage.setItem('allDataLocal', JSON.stringify({...d1, password: user_data?.password}));
        message.success('Bank Details Updated Successfully!')
        handleClose()
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
            : "Update Bank Details Error"
        }!`
      );
    });
  }
  const onEmergencyFinish = (values) => {
    let d1 = {
      ...allData,
      emergencyContacts: [values]
    }
    Object.keys(d1).forEach((key) => {
      if (key === 'password') {
        delete d1[key];
      }
    });
    setLoader(true)
    apiServices("PUT", "user/update-user", d1, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setAllData((prev) => ({
          ...prev,
          emergencyContacts: [values]
        }))
        localStorage.setItem('allDataLocal', JSON.stringify({...d1, password: user_data?.password}));
        message.success('Emergency Contact Updated Successfully!')
        handleClose()
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
            : "Update Emergency Contact Error"
        }!`
      );
    });
  }
  const onEducationFinish = (values) => {
    let d1 = {
      ...allData,
      education: values?.education
    }
    Object.keys(d1).forEach((key) => {
      if (key === 'password') {
        delete d1[key];
      }
    });
    setLoader(true)
    apiServices("PUT", "user/update-user", d1, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setAllData((prev) => ({
          ...prev,
          education: values?.education
        }))
        localStorage.setItem('allDataLocal', JSON.stringify({...d1, password: user_data?.password}));
        message.success('Education Details Updated Successfully!')
        handleClose()
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
            : "Update Education Details Error"
        }!`
      );
    });
  }
  const onExperienceFinish = (values) => {
    let d1 = {
      ...allData,
      experience: values?.experience
    }
    Object.keys(d1).forEach((key) => {
      if (key === 'password') {
        delete d1[key];
      }
    });
    setLoader(true)
    apiServices("PUT", "user/update-user", d1, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setAllData((prev) => ({
          ...prev,
          experience: values?.experience
        }))
        localStorage.setItem('allDataLocal', JSON.stringify({...d1, password: user_data?.password}));
        message.success('Experience Details Updated Successfully!')
        handleClose()
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
            : "Update Experience Details Error"
        }!`
      );
    });
  }

  const formatDate = (inputDate) => {
    if(inputDate){
      const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
  
      let daySuffix = "th";
      if (day === 1 || day === 21 || day === 31) {
          daySuffix = "st";
      } else if (day === 2 || day === 22) {
          daySuffix = "nd";
      } else if (day === 3 || day === 23) {
          daySuffix = "rd";
      }
  
      const formattedDate = `${day}${daySuffix} ${month}, ${year}`;
      return formattedDate;
    }
}

const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const beforeUpload = (file) => {
    const isFileTypeAllowed = allowedFileTypes.includes(file.type);

    if (!isFileTypeAllowed) {
      message.error('You can only upload PNG, JPG, or JPEG files!');
      return false;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const isSizeAllowed = file.size <= maxSizeInBytes;

    if (!isSizeAllowed) {
      message.error('File size is too large. Maximum allowed size is 5MB.');
      return false;
    }

    return true;

    // const isFileTypeAllowed = allowedFileTypes.includes(file.type);
    // if (!isFileTypeAllowed) {
    //   message.error('You can only upload PNG, JPG, or JPEG files!');
    // }
    // return isFileTypeAllowed;
  };

  const onImageUpload = (imagedata) => {
    setImageLoader(true)
    apiUploadToS3(imagedata).then((res) => {
        // console.log(res?.data?.result);
        setImage(res?.data?.result)
        localStorage.setItem('updated_user', JSON.stringify({imageUrl: res?.data?.result}))
        nav('/profile', {state: {updated_user: {imageUrl: res?.data?.result}}})

        let d1 = {
          ...allData,
          imageUrl: res?.data?.result
        }
        Object.keys(d1).forEach((key) => {
          if (key === 'password') {
            delete d1[key];
          }
        });
        apiServices("PUT", "user/update-user", d1, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setAllData((prev) => ({
              ...prev,
              imageUrl: res?.data?.result
            }))
            localStorage.setItem('allDataLocal', JSON.stringify({...d1, password: user_data?.password}));
            // setImage(res?.data?.result)
            setImageLoader(false)
            message.success('Profile picture updated successfully!')
          }
        })
        .catch((err) => {
          setLoader(false)
          setImage('')
          localStorage.setItem('updated_user', JSON.stringify({imageUrl: ''}))
          nav('/profile', {state: {updated_user: {imageUrl: ''}}})
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Update Profile picture Error"
            }!`
          );
        });
      }
      ).catch((err)=>{
        setImageLoader(false)
        message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "upload image Error"
            }!`
          );
      })
  }

  const onRemoveProfileImage = () => {
    setImageLoader(true)

    let d1 = {
      ...allData,
      imageUrl: null
    }
    Object.keys(d1).forEach((key) => {
      if (key === 'password') {
        delete d1[key];
      }
    });
    apiServices("PUT", "user/update-user", d1, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setImage(null)
        localStorage.setItem('updated_user', JSON.stringify({imageUrl: null}))
        nav('/profile', {state: {updated_user: {imageUrl: null}}})

        setAllData((prev) => ({
          ...prev,
          imageUrl: null
        }))
        localStorage.setItem('allDataLocal', JSON.stringify({...d1, password: user_data?.password}));
        // setImage(res?.data?.result)
        setImageLoader(false)
        message.success('Profile picture removed successfully!')
      }
    })
    .catch((err) => {
      setImageLoader(false)
      setImage(null)
      localStorage.setItem('updated_user', JSON.stringify({imageUrl: null}))
      nav('/profile', {state: {updated_user: {imageUrl: null}}})
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Remove profile picture Error"
        }!`
      );
    });
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


  return (
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>Employee Profile - DaftarPro</title>
          <meta name="description" content="Reactify Blank Page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">Profile</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                  <li className="breadcrumb-item active">Profile</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="card mb-0">
            {
              dataLoading ? <Spin size='middle' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '262px'}} /> :
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="profile-view">
                      <div className="profile-img-wrap">
                        <div className="profile-img">
                          {
                            location?.pathname === '/profile' ?
                            <div>
                              <div className="profile-img-wrap edit-img">
                                  {
                                      imageLoader ? <div className="uploadImgSpinContainer"> <Spin /> </div> :
                                      <>
                                          <img className="inline-block" src={image ? image : allData?.imageUrl || user_icon} alt="user" />
                                          <div className="fileupload btn">
                                          <ImgCrop
                                              cropShape='round'
                                              quality={1}
                                              modalTitle='Crop Image'
                                              modalOk='Apply'
                                              modalClassName='CropImageModalStyle'
                                              beforeCrop={beforeUpload}
                                          >
                                              <Upload
                                                  // action={(image) => onImageUpload(image)}
                                                  customRequest={({ file, onSuccess, onError }) => {
                                                    onImageUpload(file)
                                                  }}
                                                  fileList={null}
                                                  maxCount={1}
                                              >
                                                  <div className="btn-text" style={{width: '80px', padding: '4px'}}>edit</div>
                                              </Upload>
                                          </ImgCrop>
                                          </div>
                                      </>
                                  }
                              </div>
                              {
                              ((image || allData?.imageUrl) && !imageLoader) &&
                              <a href="javascript:void(0)"
                                onClick={() => onRemoveProfileImage()}
                                className="fa fa-closee file-remove" style={{color: '#fb1612', position: 'absolute', top: '-1px' ,right: '-4px', fontSize: '19px', fontFamily: 'cursive', padding: '5px 7px 6px', background: 'white', borderRadius: '50%'}} > <i className='fa fa-times' /> </a>
                              }
                            </div>
                            :
                            <a href="javascript:void(0)" style={{cursor: 'default'}}><img alt="" src={allData?.imageUrl || user_icon} /></a>
                          }
                        </div>
                      </div>
                      <div className="profile-basic">
                        <div className="row">
                          <div className="col-md-5">
                            <div className="profile-info-left">
                              <h3 className="user-name m-t-0 mb-0">{allData?.fullName}</h3>
                              <div className="small doj text-muted" style={{fontSize: '12px', fontWeight: '500'}}>{deptInfo[allData?.teamId]}</div>
                              <small className="text-muted">{desigInfo[allData?.designationId]}</small>
                              <div className="staff-id">Employee ID: {allData?.employeeId}</div>
                              <div className="small doj text-muted">Date of Join: {formatDate(allData?.joiningDate || '')}</div>
                              <div style={{color: 'transparent', height: '98px'}}>.</div>
                              {/* <div className="staff-msg"><Link onClick={() => localStorage.setItem("minheight", "true")} className="btn btn-custom" to="/conversation/chat">Send Message</Link></div> */}
                            </div>
                          </div>
                          <div className="col-md-7">
                            <ul className="personal-info">
                              <li>
                                <div className="title">Phone:</div>
                                <div className="text"><a href="javascript:void(0)" style={{cursor: 'default'}}>{allData?.phoneNo}</a></div>
                              </li>
                              <li>
                                <div className="title">Email:</div>
                                <div className="text"><a href="javascript:void(0)" style={{cursor: 'default'}}>{allData?.email}</a></div>
                              </li>
                              <li>
                                <div className="title">Birthday:</div>
                                <div className="text">{formatDate(allData?.dateOfBirth || '')}</div>
                              </li>
                              <li>
                                <div className="title">Address:</div>
                                <div className="text">{allData?.address}</div>
                              </li>
                              <li>
                                <div className="title">Gender:</div>
                                <div className="text">{allData?.gender}</div>
                              </li>
                              <li>
                                <div className="title">Salary:</div>
                                <div className="text">{allData?.salary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                              </li>
                              <li>
                                <div className="title">Reports to:</div>
                                <div className="text">
                                {repInfo[allData?.reportsTo] || 'None'}
                                  {/* <div className="avatar-box">
                                    <div className="avatar avatar-xs">
                                      <img src={Avatar_16} alt="" />
                                    </div>
                                  </div>
                                  <Link to="/app/profile/employee-profile">
                                    {user_data?.reportsTo || ''}
                                  </Link> */}
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      {
                        (location?.pathname !== '/profile') && (role === 'admin' || permissions?.updateUser) &&
                        <div className="pro-edit"><a href="javascript:void(0)" className="edit-icon" onClick={() => setOpen({ isFamilyInfoOpen: false, isEduInfoOpen: false, isExpInfoOpen: false, isBankInfoOpen: false , isEmergInfoOpen: false, isprofileInfoOpen: true, data: '' })}><i className="fa fa-pencil" /></a></div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          <div className="card tab-box">
            <div className="row user-tabs">
              <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                <ul className="nav nav-tabs nav-tabs-bottom">
                  <li className="nav-item"><a href="javascript:void(0)"  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile') }}>Profile</a></li>
                  {/* <li className="nav-item"><a href="#emp_projects" data-bs-toggle="tab" className="nav-link">Projects</a></li> */}
                  <li className="nav-item"><a href="javascript:void(0)"  className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => { setActiveTab('projects') }}>Projects</a></li>
                  <li className="nav-item"><a href="javascript:void(0)"  className={`nav-link ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => { setActiveTab('bank') }}>Bank &amp; Statutory <small className="text-danger">(Admin Only)</small></a></li>
                  <li className="nav-item"><a href="javascript:void(0)"  className={`nav-link ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => { setActiveTab('assets') }}>Assets</a></li>
                </ul>
              </div>
            </div>
          </div>
              <div className="tab-content">
                {/* Profile Info Tab */}
                {
                    (activeTab === 'profile' && allData?._id) &&
                    <>
                    {
                      dataLoading ? <Spin size='middle' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '262px'}} /> :
                        <div id="emp_profile" className="pro-overview tab-pane fade show active">
                          <div className="row">
                            <div className="col-md-6 d-flex">
                              <div className="card profile-box flex-fill">
                                <div className="card-body">
                                  <h3 className="card-title">Bank Information
                                  {
                                    (role === 'admin' || permissions?.updateUser) &&
                                    <a href="javascript:void(0)" className="edit-icon" onClick={() => setOpen({ isFamilyInfoOpen: false, isEduInfoOpen: false, isExpInfoOpen: false, isBankInfoOpen: true , isEmergInfoOpen: false, isprofileInfoOpen: false, data: '' })}><i className="fa fa-pencil" /></a>
                                  }
                                  </h3>
                                  { allData?.bankName ?
                                  <ul className="personal-info">
                                        <li>
                                          <div className="title">Bank Name</div>
                                          <div className="text">{allData?.bankName}</div>
                                        </li>
                                        <li>
                                          <div className="title">Bank Account No.</div>
                                          <div className="text">{allData?.bankAccountNumber}</div>
                                        </li>
                                        {/* <li>
                                          <div className="title">Salary</div>
                                          <div className="text">{allData?.salary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                                        </li> */}
                                  </ul> :
                                    <Empty style={{marginTop: '12%'}} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 d-flex">
                              <div className="card profile-box flex-fill">
                                <div className="card-body">
                                  <h3 className="card-title">Emergency Contact
                                  {
                                    (role === 'admin' || permissions?.updateUser) &&
                                    <a href="javascript:void(0)" className="edit-icon" onClick={() => setOpen({ isFamilyInfoOpen: false, isEduInfoOpen: false, isExpInfoOpen: false, isBankInfoOpen: false , isEmergInfoOpen: true, isprofileInfoOpen: false, data: allData?.emergencyContacts?.length > 0 ? allData.emergencyContacts[0] : {} })}><i className="fa fa-pencil" /></a>
                                  }
                                  </h3>
                                  {/* <h5 className="section-title">Primary</h5> */}
                                  { allData?.emergencyContacts?.length > 0 ?
                                    <ul className="personal-info">
                                      {
                                        allData?.emergencyContacts?.map((emerg) => (
                                          <>
                                            <li>
                                              <div className="title">Name</div>
                                              <div className="text">{emerg?.name}</div>
                                            </li>
                                            <li>
                                              <div className="title">Relationship</div>
                                              <div className="text">{emerg?.relationship}</div>
                                            </li>
                                            <li>
                                              <div className="title">Phone No. </div>
                                              <div className="text">{emerg?.phoneNo}</div>
                                            </li>
                                          </>
                                        ))
                                      }
                                    </ul> :
                                    <Empty style={{marginTop: '12%'}} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                  }
                                  {/* <hr />
                                  <h5 className="section-title">Secondary</h5>
                                  <ul className="personal-info">
                                    <li>
                                      <div className="title">Name</div>
                                      <div className="text">Karen Wills</div>
                                    </li>
                                    <li>
                                      <div className="title">Relationship</div>
                                      <div className="text">Brother</div>
                                    </li>
                                    <li>
                                      <div className="title">Phone </div>
                                      <div className="text">9876543210, 9876543210</div>
                                    </li>
                                  </ul> */}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                          </div>
                          <div className="row">
                            <div className="col-md-6 d-flex">
                              <div className="card profile-box flex-fill">
                                <div className="card-body">
                                  <h3 className="card-title">Education Informations
                                  {
                                    (role === 'admin' || permissions?.updateUser) &&
                                    <a href="javascript:void(0)" className="edit-icon" onClick={() => setOpen({ isFamilyInfoOpen: false, isEduInfoOpen: true, isExpInfoOpen: false, isBankInfoOpen: false , isEmergInfoOpen: false, isprofileInfoOpen: false, data: '' })}><i className="fa fa-pencil" /></a>
                                  }
                                  </h3>
                                  <div className="experience-box">
                                    { allData?.education?.length > 0 ?
                                    <ul className="experience-list">
                                      {
                                        allData?.education?.map((edu) => (
                                          <li>
                                            <div className="experience-user">
                                              <div className="before-circle" />
                                            </div>
                                            <div className="experience-content">
                                              <div className="timeline-content">
                                                <a href="javascript:void(0)" className="name" style={{cursor: 'text'}}>{edu?.institute}</a>
                                                <div>{edu?.degree}</div>
                                                <span className="time">{edu?.year}</span>
                                              </div>
                                            </div>
                                          </li>
                                        ))
                                      }
                                    </ul> :
                                    <Empty style={{marginTop: '12%'}} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 d-flex">
                              <div className="card profile-box flex-fill">
                                <div className="card-body">
                                  <h3 className="card-title">Experience
                                  {
                                    (role === 'admin' || permissions?.updateUser) &&
                                    <a href="javascript:void(0)" className="edit-icon" onClick={() => setOpen({ isFamilyInfoOpen: false, isEduInfoOpen: false, isExpInfoOpen: true, isBankInfoOpen: false , isEmergInfoOpen: false, isprofileInfoOpen: false, data: '' })}><i className="fa fa-pencil" /></a>
                                  }
                                  </h3>
                                  <div className="experience-box">
                                    {
                                      allData?.experience?.length > 0 ?
                                    <ul className="experience-list">
                                      {
                                        allData?.experience?.map((exp) => (
                                          <li>
                                            <div className="experience-user">
                                              <div className="before-circle" />
                                            </div>
                                            <div className="experience-content">
                                              <div className="timeline-content">
                                                <a href="javascript:void(0)" style={{cursor: 'text'}} className="name">{exp?.designation} at {exp?.company}</a>
                                                <span className="time">{exp?.duration}</span>
                                              </div>
                                            </div>
                                          </li>
                                        ))
                                      }
                                    </ul>
                                    : <Empty style={{marginTop: '12%'}} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    }
                    </>
                }

                {/* /Profile Info Tab */}

                {/* Projects Tab */}
                {/* <div className="tab-pane fade" id="emp_projects">
                  <div className="row">
                    <div className="col-lg-4 col-sm-6 col-md-4 col-xl-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="dropdown profile-action">
                            <a aria-expanded="false" data-bs-toggle="dropdown" className="action-icon dropdown-toggle" href="#"><i className="material-icons">more_vert</i></a>
                            <div className="dropdown-menu dropdown-menu-right">
                              <a data-bs-target="#edit_project" data-bs-toggle="modal" href="#" className="dropdown-item"><i className="fa fa-pencil m-r-5" /> Edit</a>
                              <a data-bs-target="#delete_project" data-bs-toggle="modal" href="#" className="dropdown-item"><i className="fa fa-trash-o m-r-5" /> Delete</a>
                            </div>
                          </div>
                          <h4 className="project-title"><Link to="/app/projects/projects-view">Office Management</Link></h4>
                          <small className="block text-ellipsis m-b-15">
                            <span className="text-xs">1</span> <span className="text-muted">open tasks, </span>
                            <span className="text-xs">9</span> <span className="text-muted">tasks completed</span>
                          </small>
                          <p className="text-muted">Lorem Ipsum is simply dummy text of the printing and
                            typesetting industry. When an unknown printer took a galley of type and
                            scrambled it...
                          </p>
                          <div className="pro-deadline m-b-15">
                            <div className="sub-title">
                              Deadline:
                            </div>
                            <div className="text-muted">
                              17 Apr 2019
                            </div>
                          </div>
                          <div className="project-members m-b-15">
                            <div>Project Leader :</div>
                            <ul className="team-members">
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Jeffery Lalor"><img alt="" src={Avatar_16} /></a>
                              </li>
                            </ul>
                          </div>
                          <div className="project-members m-b-15">
                            <div>Team :</div>
                            <ul className="team-members">
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="John Doe"><img alt="" src={Avatar_02} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Richard Miles"><img alt="" src={Avatar_09} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="John Smith"><img alt="" src={Avatar_10} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Mike Litorus"><img alt="" src={Avatar_05} /></a>
                              </li>
                              <li>
                                <a href="#" className="all-users">+15</a>
                              </li>
                            </ul>
                          </div>
                          <p className="m-b-5">Progress <span className="text-success float-end">40%</span></p>
                          <div className="progress progress-xs mb-0">
                            <div style={{ width: '40%' }} data-bs-toggle="tooltip" role="progressbar" className="progress-bar bg-success" data-original-title="40%" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-md-4 col-xl-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="dropdown profile-action">
                            <a aria-expanded="false" data-bs-toggle="dropdown" className="action-icon dropdown-toggle" href="#"><i className="material-icons">more_vert</i></a>
                            <div className="dropdown-menu dropdown-menu-right">
                              <a data-bs-target="#edit_project" data-bs-toggle="modal" href="#" className="dropdown-item"><i className="fa fa-pencil m-r-5" /> Edit</a>
                              <a data-bs-target="#delete_project" data-bs-toggle="modal" href="#" className="dropdown-item"><i className="fa fa-trash-o m-r-5" /> Delete</a>
                            </div>
                          </div>
                          <h4 className="project-title"><Link to="/app/projects/projects-view">Project Management</Link></h4>
                          <small className="block text-ellipsis m-b-15">
                            <span className="text-xs">2</span> <span className="text-muted">open tasks, </span>
                            <span className="text-xs">5</span> <span className="text-muted">tasks completed</span>
                          </small>
                          <p className="text-muted">Lorem Ipsum is simply dummy text of the printing and
                            typesetting industry. When an unknown printer took a galley of type and
                            scrambled it...
                          </p>
                          <div className="pro-deadline m-b-15">
                            <div className="sub-title">
                              Deadline:
                            </div>
                            <div className="text-muted">
                              17 Apr 2019
                            </div>
                          </div>
                          <div className="project-members m-b-15">
                            <div>Project Leader :</div>
                            <ul className="team-members">
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Jeffery Lalor"><img alt="" src={Avatar_16} /></a>
                              </li>
                            </ul>
                          </div>
                          <div className="project-members m-b-15">
                            <div>Team :</div>
                            <ul className="team-members">
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="John Doe"><img alt="" src={Avatar_02} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Richard Miles"><img alt="" src={Avatar_09} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="John Smith"><img alt="" src={Avatar_10} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Mike Litorus"><img alt="" src={Avatar_05} /></a>
                              </li>
                              <li>
                                <a href="#" className="all-users">+15</a>
                              </li>
                            </ul>
                          </div>
                          <p className="m-b-5">Progress <span className="text-success float-end">40%</span></p>
                          <div className="progress progress-xs mb-0">
                            <div style={{ width: '40%' }} data-bs-toggle="tooltip" role="progressbar" className="progress-bar bg-success" data-original-title="40%" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-md-4 col-xl-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="dropdown profile-action">
                            <a aria-expanded="false" data-bs-toggle="dropdown" className="action-icon dropdown-toggle" href="#"><i className="material-icons">more_vert</i></a>
                            <div className="dropdown-menu dropdown-menu-right">
                              <a data-bs-target="#edit_project" data-bs-toggle="modal" href="#" className="dropdown-item"><i className="fa fa-pencil m-r-5" /> Edit</a>
                              <a data-bs-target="#delete_project" data-bs-toggle="modal" href="#" className="dropdown-item"><i className="fa fa-trash-o m-r-5" /> Delete</a>
                            </div>
                          </div>
                          <h4 className="project-title"><Link to="/app/projects/projects-view">Video Calling App</Link></h4>
                          <small className="block text-ellipsis m-b-15">
                            <span className="text-xs">3</span> <span className="text-muted">open tasks, </span>
                            <span className="text-xs">3</span> <span className="text-muted">tasks completed</span>
                          </small>
                          <p className="text-muted">Lorem Ipsum is simply dummy text of the printing and
                            typesetting industry. When an unknown printer took a galley of type and
                            scrambled it...
                          </p>
                          <div className="pro-deadline m-b-15">
                            <div className="sub-title">
                              Deadline:
                            </div>
                            <div className="text-muted">
                              17 Apr 2019
                            </div>
                          </div>
                          <div className="project-members m-b-15">
                            <div>Project Leader :</div>
                            <ul className="team-members">
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Jeffery Lalor"><img alt="" src={Avatar_16} /></a>
                              </li>
                            </ul>
                          </div>
                          <div className="project-members m-b-15">
                            <div>Team :</div>
                            <ul className="team-members">
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="John Doe"><img alt="" src={Avatar_02} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Richard Miles"><img alt="" src={Avatar_09} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="John Smith"><img alt="" src={Avatar_10} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Mike Litorus"><img alt="" src={Avatar_05} /></a>
                              </li>
                              <li>
                                <a href="#" className="all-users">+15</a>
                              </li>
                            </ul>
                          </div>
                          <p className="m-b-5">Progress <span className="text-success float-end">40%</span></p>
                          <div className="progress progress-xs mb-0">
                            <div style={{ width: '40%' }} data-bs-toggle="tooltip" role="progressbar" className="progress-bar bg-success" data-original-title="40%" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-md-4 col-xl-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="dropdown profile-action">
                            <a aria-expanded="false" data-bs-toggle="dropdown" className="action-icon dropdown-toggle" href="#"><i className="material-icons">more_vert</i></a>
                            <div className="dropdown-menu dropdown-menu-right">
                              <a data-bs-target="#edit_project" data-bs-toggle="modal" href="#" className="dropdown-item"><i className="fa fa-pencil m-r-5" /> Edit</a>
                              <a data-bs-target="#delete_project" data-bs-toggle="modal" href="#" className="dropdown-item"><i className="fa fa-trash-o m-r-5" /> Delete</a>
                            </div>
                          </div>
                          <h4 className="project-title"><Link to="/app/projects/projects-view">Hospital Administration</Link></h4>
                          <small className="block text-ellipsis m-b-15">
                            <span className="text-xs">12</span> <span className="text-muted">open tasks, </span>
                            <span className="text-xs">4</span> <span className="text-muted">tasks completed</span>
                          </small>
                          <p className="text-muted">Lorem Ipsum is simply dummy text of the printing and
                            typesetting industry. When an unknown printer took a galley of type and
                            scrambled it...
                          </p>
                          <div className="pro-deadline m-b-15">
                            <div className="sub-title">
                              Deadline:
                            </div>
                            <div className="text-muted">
                              17 Apr 2019
                            </div>
                          </div>
                          <div className="project-members m-b-15">
                            <div>Project Leader :</div>
                            <ul className="team-members">
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Jeffery Lalor"><img alt="" src={Avatar_16} /></a>
                              </li>
                            </ul>
                          </div>
                          <div className="project-members m-b-15">
                            <div>Team :</div>
                            <ul className="team-members">
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="John Doe"><img alt="" src={Avatar_02} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Richard Miles"><img alt="" src={Avatar_09} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="John Smith"><img alt="" src={Avatar_10} /></a>
                              </li>
                              <li>
                                <a href="#" data-bs-toggle="tooltip" title="Mike Litorus"><img alt="" src={Avatar_05} /></a>
                              </li>
                              <li>
                                <a href="#" className="all-users">+15</a>
                              </li>
                            </ul>
                          </div>
                          <p className="m-b-5">Progress <span className="text-success float-end">40%</span></p>
                          <div className="progress progress-xs mb-0">
                            <div style={{ width: '40%' }} data-bs-toggle="tooltip" role="progressbar" className="progress-bar bg-success" data-original-title="40%" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}

                  {
                    (activeTab === 'projects' && allData?._id) &&
                      <div id="emp_projects" className="tab-pane fade show active">
                      <EmployeeProjectsScreen
                        employeeId={allData?._id}
                      />
                      </div>
                  }

                {/* /Projects Tab */}

                {/* Bank Statutory Tab */}
                {
                  (activeTab === 'bank' && allData?._id) &&
                    <div className="tab-pane fade show active" id="bank_statutory">
                      <div className="card">
                        <div className="card-body">
                          <h3 className="card-title"> Basic Salary Information</h3>
                          <form>
                            <div className="row">
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Salary basis <span className="text-danger">*</span></label>
                                  <select className="select">
                                    <option>Select salary basis type</option>
                                    <option>Hourly</option>
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Salary amount <small className="text-muted">per month</small></label>
                                  <div className="input-group">
                                    <div className="input-group-prepend">
                                      <span className="input-group-text">$</span>
                                    </div>
                                    <input type="text" className="form-control" placeholder="Type your salary amount" defaultValue={0.00} />
                                  </div>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Payment type</label>
                                  <select className="select">
                                    <option>Select payment type</option>
                                    <option>Bank transfer</option>
                                    <option>Check</option>
                                    <option>Cash</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <hr />
                            <h3 className="card-title"> PF Information</h3>
                            <div className="row">
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">PF contribution</label>
                                  <select className="select">
                                    <option>Select PF contribution</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">PF No. <span className="text-danger">*</span></label>
                                  <select className="select">
                                    <option>Select PF contribution</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Employee PF rate</label>
                                  <select className="select">
                                    <option>Select PF contribution</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Additional rate <span className="text-danger">*</span></label>
                                  <select className="select">
                                    <option>Select additional rate</option>
                                    <option>0%</option>
                                    <option>1%</option>
                                    <option>2%</option>
                                    <option>3%</option>
                                    <option>4%</option>
                                    <option>5%</option>
                                    <option>6%</option>
                                    <option>7%</option>
                                    <option>8%</option>
                                    <option>9%</option>
                                    <option>10%</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Total rate</label>
                                  <input type="text" className="form-control" placeholder="N/A" defaultValue="11%" />
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Employee PF rate</label>
                                  <select className="select">
                                    <option>Select PF contribution</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Additional rate <span className="text-danger">*</span></label>
                                  <select className="select">
                                    <option>Select additional rate</option>
                                    <option>0%</option>
                                    <option>1%</option>
                                    <option>2%</option>
                                    <option>3%</option>
                                    <option>4%</option>
                                    <option>5%</option>
                                    <option>6%</option>
                                    <option>7%</option>
                                    <option>8%</option>
                                    <option>9%</option>
                                    <option>10%</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Total rate</label>
                                  <input type="text" className="form-control" placeholder="N/A" defaultValue="11%" />
                                </div>
                              </div>
                            </div>
                            <hr />
                            <h3 className="card-title"> ESI Information</h3>
                            <div className="row">
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">ESI contribution</label>
                                  <select className="select">
                                    <option>Select ESI contribution</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">ESI No. <span className="text-danger">*</span></label>
                                  <select className="select">
                                    <option>Select ESI contribution</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Employee ESI rate</label>
                                  <select className="select">
                                    <option>Select ESI contribution</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Additional rate <span className="text-danger">*</span></label>
                                  <select className="select">
                                    <option>Select additional rate</option>
                                    <option>0%</option>
                                    <option>1%</option>
                                    <option>2%</option>
                                    <option>3%</option>
                                    <option>4%</option>
                                    <option>5%</option>
                                    <option>6%</option>
                                    <option>7%</option>
                                    <option>8%</option>
                                    <option>9%</option>
                                    <option>10%</option>
                                  </select>
                                </div>
                              </div>
                              <div className="col-sm-4">
                                <div className="form-group">
                                  <label className="col-form-label">Total rate</label>
                                  <input type="text" className="form-control" placeholder="N/A" defaultValue="11%" />
                                </div>
                              </div>
                            </div>
                            <div className="submit-section">
                              <button className="btn btn-primary submit-btn" type="submit">Save</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                }
                {
                  (activeTab === 'assets' && allData?._id) &&
                    <div className="tab-pane fade show active" id="emp_assets">
                      <div className="table-responsive table-newdatatable">
                        <table className="table table-new custom-table mb-0 datatable">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Asset ID</th>
                              <th>Assigned Date</th>
                              <th>Assignee</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>
                                <a href="assets-details.html" className="table-imgname">
                                  <img src={laptop} className="me-2" alt="img" />
                                  <span>Laptop</span>
                                </a>
                              </td>
                              <td>AST - 001</td>
                              <td>22 Nov, 2022    10:32AM</td>
                              <td className="table-namesplit">
                                <a href="javascript:void(0);" className="table-profileimage">
                                  <img src={Avatar_02} className="me-2" alt="img" />
                                </a>
                                <a href="javascript:void(0);" className="table-name">
                                  <span>John Paul Raj</span>
                                  <p>john@dreamguystech.com</p>
                                </a>
                              </td>
                              <td>
                                <div className="table-actions d-flex">
                                  <Link className="delete-table me-2" to="/app/profile/userassets">
                                    <img src={eye} alt="svg" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>
                                <a href="assets-details.html" className="table-imgname">
                                  <img src={laptop} className="me-2" alt="img" />
                                  <span>Laptop</span>
                                </a>
                              </td>
                              <td>AST - 002</td>
                              <td>22 Nov, 2022    10:32AM</td>
                              <td className="table-namesplit">
                                <a href="javascript:void(0);" className="table-profileimage" data-bs-toggle="modal" data-bs-target="#edit-asset">
                                  <img src={Avatar_05} className="me-2" alt="img" />
                                </a>
                                <a href="javascript:void(0);" className="table-name">
                                  <span>Vinod Selvaraj</span>
                                  <p>vinod.s@dreamguystech.com</p>
                                </a>
                              </td>
                              <td>
                                <div className="table-actions d-flex">
                                  <a className="delete-table me-2" href="user-asset-details.html">
                                    <img src={eye} alt="svg" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>
                                <a href="assets-details.html" className="table-imgname">
                                  <img src={keyboard} className="me-2" alt="img" />
                                  <span>Dell Keyboard</span>
                                </a>
                              </td>
                              <td>AST - 003</td>
                              <td>22 Nov, 2022    10:32AM</td>
                              <td className="table-namesplit">
                                <a href="javascript:void(0);" className="table-profileimage" data-bs-toggle="modal" data-bs-target="#edit-asset">
                                  <img src={Avatar_09} className="me-2" alt="img" />
                                </a>
                                <a href="javascript:void(0);" className="table-name">
                                  <span>Harika </span>
                                  <p>harika.v@dreamguystech.com</p>
                                </a>
                              </td>
                              <td>
                                <div className="table-actions d-flex">
                                  <a className="delete-table me-2" href="user-asset-details.html">
                                    <img src={eye} alt="svg" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>4</td>
                              <td>
                                <a href="#" className="table-imgname">
                                  <img src={mouse} className="me-2" alt="img" />
                                  <span>Logitech Mouse</span>
                                </a>
                              </td>
                              <td>AST - 0024</td>
                              <td>22 Nov, 2022    10:32AM</td>
                              <td className="table-namesplit">
                                <a href="assets-details.html" className="table-profileimage">
                                  <img src={Avatar_10} className="me-2" alt="img" />
                                </a>
                                <a href="assets-details.html" className="table-name">
                                  <span>Mythili</span>
                                  <p>mythili@dreamguystech.com</p>
                                </a>
                              </td>
                              <td>
                                <div className="table-actions d-flex">
                                  <a className="delete-table me-2" href="user-asset-details.html">
                                    <img src={eye} alt="svg" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>5</td>
                              <td>
                                <a href="#" className="table-imgname">
                                  <img src={laptop} className="me-2" alt="img" />
                                  <span>Laptop</span>
                                </a>
                              </td>
                              <td>AST - 005</td>
                              <td>22 Nov, 2022    10:32AM</td>
                              <td className="table-namesplit">
                                <a href="assets-details.html" className="table-profileimage">
                                  <img src={Avatar_16} className="me-2" alt="img" />
                                </a>
                                <a href="assets-details.html" className="table-name">
                                  <span>John Paul Raj</span>
                                  <p>john@dreamguystech.com</p>
                                </a>
                              </td>
                              <td>
                                <div className="table-actions d-flex">
                                  <a className="delete-table me-2" href="user-asset-details.html">
                                    <img src={eye} alt="svg" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>6</td>
                              <td>
                                <a href="#" className="table-imgname">
                                  <img src={laptop} className="me-2" alt="img" />
                                  <span>Laptop</span>
                                </a>
                              </td>
                              <td>AST - 006</td>
                              <td>22 Nov, 2022    10:32AM</td>
                              <td className="table-namesplit">
                                <a href="javascript:void(0);" className="table-profileimage">
                                  <img src={Avatar_02} className="me-2" alt="img" />
                                </a>
                                <a href="javascript:void(0);" className="table-name">
                                  <span>Vinod Selvaraj</span>
                                  <p>vinod.s@dreamguystech.com</p>
                                </a>
                              </td>
                              <td>
                                <div className="table-actions d-flex">
                                  <a className="delete-table me-2" href="user-asset-details.html">
                                    <img src={eye} alt="svg" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                }

                {/* /Bank Statutory Tab */}
              </div>
        </div>
        {/* /Page Content */}
        {/* Profile Modal */}
        {
          open?.isprofileInfoOpen &&
        
          <ProfileInfoModal
            open={open}
            handleClose={handleClose}
            user_data={allData}
            onFinish={onFinish}
            loader={loader}
          />
          // <ProfileInfoModal
          //   open={open}
          //   handleClose={handleClose}
          //   setPhoneLengthError={setPhoneLengthError}
          //   onHandleEmergChange={onHandleEmergChange}
          //   emergValue={emergValue}
          //   phoneLengthError={phoneLengthError}
          //   form={form}
          // />
        }
        {/* /Profile Modal */}

      {/* /Bank Info Modal */}
      <Modal
        open={open?.isBankInfoOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        // className="modal custom-modal fade"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
        sx={{
          overflowY: "scroll",
        }}
      >
        {/* <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> */}
        <div className="modal-dialog modal-dialog-centered modal-dialog-md" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"> Bank Information</h5>
                <button type="button" className="close" onClick={handleClose}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
              <Form
                onFinish={onBankFinish}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
                initialValues={{
                  bankName: allData?.bankName ? allData?.bankName : '',
                  bankAccountNumber: allData?.bankAccountNumber ? allData?.bankAccountNumber : '',
                  salary: allData?.salary ? allData?.salary : '',
                }}
              >
                    <>
                          <div className="card">
                            <div className="card-body">
                              <h3 className="card-title">
                              </h3>
                              <div className="row">
                                <div className="col-12">
                                  <div className="form-group">
                                    <label>
                                      Bank Name <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      name='bankName'
                                      className='custom-border'
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter bank name');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('name must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50} />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="form-group">
                                    <label>
                                    Bank Account Number <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      name='bankAccountNumber'
                                      className='custom-border'
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter bank account number');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('length must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50}
                                        // onKeyPress={(e) => {
                                        //   if ((e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 33 &&  e.which <= 47) || (e.which >= 58 && e.which <= 64) || (e.which >= 91 && e.which <= 96) || (e.which >= 123 && e.which <= 126) ) {
                                        //     e.preventDefault();
                                        //   }
                                        // }}
                                      />
                                    </Form.Item>
                                  </div>
                                </div>
                                {/* <div className="col-12">
                                  <div className="form-group">
                                    <label>
                                     Salary <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      name='salary'
                                      className='custom-border'
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter salary');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('length must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50}
                                        onKeyPress={(e) => {
                                          if ((e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 33 &&  e.which <= 47) || (e.which >= 58 && e.which <= 64) || (e.which >= 91 && e.which <= 96) || (e.which >= 123 && e.which <= 126) ) {
                                            e.preventDefault();
                                          }
                                        }}
                                      />
                                    </Form.Item>
                                  </div>
                                </div> */}
                              </div>
                            </div>
                          </div>
                      <div className="submit-section">
                        <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
                        {
                          loader ? <Spin size="small" indicator={antIcon} />
                            : 'Submit'
                        }
                        </button>
                      </div>
                    </>
              </Form>
              </div>
            </div>
          </div>
      </Modal>
      {/* /Bank Info Modal */}

      {/* Emergency Contact Modal */}
      <Modal
        open={open?.isEmergInfoOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        // className="modal custom-modal fade"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
        sx={{
          overflowY: "scroll",
        }}
      >
        {/* <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> */}
        <div className="modal-dialog modal-dialog-centered modal-dialog-md" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"> Emergency Contact</h5>
                <button type="button" className="close" onClick={handleClose}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
              <Form
              form={form}
                onFinish={onEmergencyFinish}
                onFinishFailed={({errorFields}) => {
                  const phoneErrorExists = errorFields.find(field => field.errors.toString().includes('please enter phone number'));
                  if(phoneErrorExists){
                    setPhoneLengthError({emp: true})
                  }
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
                initialValues={{
                  name: open?.data?.name ? open?.data?.name : '',
                  relationship: open?.data?.relationship ? open?.data?.relationship : '',
                  phoneNo: open?.data?.phoneNo ? open?.data?.phoneNo : '',
                }}
              >
                    <>
                          <div className="card">
                            <div className="card-body">
                              <h3 className="card-title">
                              </h3>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label>
                                      Name <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      name='name'
                                      className='custom-border'
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter name');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('name must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50} />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                <div className="form-group">
                                    <label>
                                      Relationship <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      name='relationship'
                                      className='custom-border'
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter relationship');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('relationship length must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50} />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div className="col-12">
                                <div className="form-group">
                                    <label>
                                      Phone No <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      name='phoneNo'
                                      className='custom-border'
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          message: "please enter phone number",
                                        },
                                        {
                                          min: 5,
                                          message: "phone length must be at least 5 digits long",
                                        },
                                      ]}
                                      validateStatus={phoneLengthError ? 'error' : ''}
                                      help={phoneLengthError?.emp ? 'please enter phone number' : phoneLengthError?.len ? "phone length must be at least 5 digits long" : ''}
                                      // validateStatus="error"
                                      // help={open?.data[0]?.phoneNo?.length !== emergValue?.phoneNo?.length ? '' : !emergValue?.phoneNo ? 'please enter phone number' : emergValue?.phoneNo?.length < 6 ? "phone length must be at least 5 digits long" : ''}
                                    >
                                      <Input style={{ display: "none" }} value={emergValue?.phoneNo} />
                                      <PhoneNoInput
                                        onChangePhone={(value) => {
                                          onHandleEmergChange("phoneNo", value);
                                        }}
                                        phone={open?.data?.phoneNo ? open?.data?.phoneNo : ""}
                                      />
                                    </Form.Item>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      <div className="submit-section">
                        <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
                        {
                          loader ? <Spin size="small" indicator={antIcon} />
                            : 'Submit'
                        }
                        </button>
                      </div>
                    </>
              </Form>
              </div>
            </div>
          </div>
      </Modal>
      {/* /Emergency Contact Modal */}

      {/* Education Modal */}
      <Modal
        open={open?.isEduInfoOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        className="modalScroll"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
        sx={{
          overflowY: "scroll",
        }}
      >
        {/* <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> */}
        <div className="modal-dialog modal-dialog-centered modal-dialog-md" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"> Education Informations</h5>
                <button type="button" className="close" onClick={handleClose}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
              <Form
                onFinish={onEducationFinish}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
                initialValues={{
                  education: allData?.education?.length > 0 ? allData?.education : [{}],
                }}
              >
                <Form.List name="education">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <div key={field.key}>
                          <div className="card">
                            <div className="card-body">
                              <h3 className="card-title">
                                {fields?.length > 1 ? `${index+1}.` : ''} Education Information{' '}
                                {index > 0 && (
                                  <a href="javascript:void(0)" onClick={() => remove(field.name)} className="delete-icon">
                                    <i className="fa fa-trash-o" />
                                  </a>
                                )}
                              </h3>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label>
                                      Institution <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'institute']}
                                      className='custom-border'
                                      fieldKey={[field.fieldKey, 'institute']}
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter institute name');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('institute name must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50} />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                <div className="form-group">
                                    <label>
                                      Degree <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'degree']}
                                      className='custom-border'
                                      fieldKey={[field.fieldKey, 'degree']}
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter degree name');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('degree name must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50} />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div className="col-12">
                                <div className="form-group">
                                    <label>
                                      Year <span className="time" style={{fontSize: '12px', color: '#9e9e9e'}}>(Start - End) </span><span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'year']}
                                      className='custom-border'
                                      fieldKey={[field.fieldKey, 'year']}
                                      rules={[{ required: true, message: 'please enter year' }]}
                                    >
                                      <Input className='form-control' maxLength={50} placeholder='2023 - 2027'
                                        onKeyPress={(e) => {
                                          if (
                                            e.key === '-' &&
                                            e.target.value.includes('-')
                                          ) {
                                            e.preventDefault();
                                          } else if (
                                            (e.which >= 48 && e.which <= 57) ||
                                            e.which === 45
                                          ) {
                                            return
                                          }
                                          e.preventDefault();
                                        }}
                                      />
                                    </Form.Item>
                                  </div>
                                </div>
                              </div>
                              {index === fields.length - 1 && (
                                <div className="add-more">
                                  <a href="javascript:void(0)" onClick={() => add()}><i className="fa fa-plus-circle" /> Add More</a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="submit-section">
                        <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
                        {
                          loader ? <Spin size="small" indicator={antIcon} />
                            : 'Submit'
                        }
                        </button>
                      </div>
                    </>
                  )}
                </Form.List>
              </Form>
              </div>
            </div>
          </div>
      </Modal>
        {/* /Education Modal */}

      {/* Experience Modal */}
      <Modal
        open={open?.isExpInfoOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        className="modalScroll"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)",}, // Set the backdrop color here

        }}
        sx={{
          overflowY: "scroll",
        }}
      >
        {/* <div className="modal-dialog modal-dialog-centered modal-lg" role="document"> */}
        <div className="modal-dialog modal-dialog-centered modal-dialog-md" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"> Experience Informations</h5>
                <button type="button" className="close" onClick={handleClose}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
              <Form
                onFinish={onExperienceFinish}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
                initialValues={{
                  experience: allData?.experience?.length > 0 ? allData?.experience : [{}],
                }}
              >
                <Form.List name="experience">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <div key={field.key}>
                          <div className="card">
                            <div className="card-body">
                              <h3 className="card-title">
                                {fields?.length > 1 ? `${index+1}.` : ''} Experience Information{' '}
                                {index > 0 && (
                                  <a href="javascript:void(0)" onClick={() => remove(field.name)} className="delete-icon">
                                    <i className="fa fa-trash-o" />
                                  </a>
                                )}
                              </h3>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label>
                                      Company <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'company']}
                                      className='custom-border'
                                      fieldKey={[field.fieldKey, 'company']}
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter company name');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('company name must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50} />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                <div className="form-group">
                                    <label>
                                      Designation <span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'designation']}
                                      className='custom-border'
                                      fieldKey={[field.fieldKey, 'designation']}
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter designation');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('designation must be at least 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50} />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div className="col-12">
                                <div className="form-group">
                                    <label>
                                      Duration <span className="time" style={{fontSize: '12px', color: '#9e9e9e'}}>(Start - End) </span><span className="text-danger">*</span>
                                    </label>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'duration']}
                                      className='custom-border'
                                      fieldKey={[field.fieldKey, 'duration']}
                                      rules={[{ required: true, message: 'please enter duration' }]}
                                    >
                                      <Input className='form-control' maxLength={50} placeholder='2023 - 2027'
                                        onKeyPress={(e) => {
                                          if (
                                            e.key === '-' &&
                                            e.target.value.includes('-')
                                          ) {
                                            e.preventDefault();
                                          } else if (
                                            (e.which >= 48 && e.which <= 57) ||
                                            e.which === 45
                                          ) {
                                            return
                                          }
                                          e.preventDefault();
                                        }}
                                      />
                                    </Form.Item>
                                  </div>
                                </div>
                              </div>
                              {index === fields.length - 1 && (
                                <div className="add-more">
                                  <a href="javascript:void(0)" onClick={() => add()}><i className="fa fa-plus-circle" /> Add More</a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="submit-section">
                        <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
                        {
                          loader ? <Spin size="small" indicator={antIcon} />
                            : 'Submit'
                        }
                        </button>
                      </div>
                    </>
                  )}
                </Form.List>
              </Form>
              </div>
            </div>
          </div>
      </Modal>
        {/* /Experience Modal */}
      </div>
      {/* <Offcanvas /> */}
    </>


  );
}
export default EmployeeProfile;
