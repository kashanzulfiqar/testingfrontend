import React, { useEffect, useState } from 'react'
import { DatePicker, Divider, Form, Input, InputNumber, Select, Spin, Upload, message, Button } from 'antd';
import Modal from "@mui/material/Modal";
import moment from 'moment';
import PhoneNoInput from '../../../../Components/PhoneNoInput';
import { Avatar_02, Avatar_05, Avatar_09, Avatar_10, Avatar_16, eye, user_icon } from '../../../../Entryfile/imagepath'
import { useSelector } from 'react-redux';
import { apiServices } from '../../../../Services/apiServices';
import { apiUploadToS3 } from "../../../../Services/uploadImage";
import AccordianCheckBox from '../../../../Components/Accordian';
import PermissionsTable from '../../../../Components/PermissionsTable';
import ImgCrop from 'antd-img-crop';
import { LoadingOutlined } from '@ant-design/icons';
import PlusOutlined from '@mui/icons-material/Add';
import AddDepartment from './addFunctions/AddDepartment';
import AddDesignation from './addFunctions/AddDesignation';
import AddShift from './addFunctions/AddShift';
import AddTaxSlab from './addFunctions/AddTaxSlab';
import AddRole from './addFunctions/AddRole';
import { useTranslation } from 'react-i18next';



const ProfileInfoModal = ({ open, handleClose, user_data, onFinishAdd, onFinishEdit, onFinish, loader, numFlag, currency }) => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  
  const moment = require('moment');
  const user_state = useSelector((state) => state.user.loginvalue);
  let company_id = user_state?.user?.companyId

  const [allTeams, setAllTeams] = useState([])
  const [allDesignations, setAllDesignations] = useState([])
  const [allShifts, setAllShifts] = useState([])
  const [allTaxSlabs, setAllTaxSlabs] = useState([])
  const [reportsTo, setReportsTo] = useState([])
  const [allRoles, setAllRoles] = useState([])
  const [allLeaves, setAllLeaves] = useState({})
  const [permissions, setPermissions] = useState()
  const [rolePermLoader, setRolePermLoader] = useState(false)
const [phoneLengthError, setPhoneLengthError] = useState(false);
const [emergValue, setEmergValue] = useState(null)
const [imageLoader, setImageLoader] = useState(false)
const [image, setImage] = useState('')
const [salaryType, setSalaryType] = useState('')
const [addDeptOpen, setAddDeptOpen] = useState(false)
const [addDesigOpen, setAddDesigOpen] = useState(false)
const [addShiftOpen, setAddShiftOpen] = useState(false)
const [addTaxOpen, setAddTaxOpen] = useState(false)
const [addRoleOpen, setAddRoleOpen] = useState(false)
const [nextEmployeeId, setNextEmployeeId] = useState('')


  useEffect(() => {
    getReportsTo()
    getRole();
    getDepartment();
    getDesignation();
    getShift();
    getTaxSlab();
    if(!user_data){
        getAllLeaves();
        fetchNextEmployeeId(); // Fetch next employee ID for Add mode
    }
    if(user_data){
        let data = {
            ...user_data,
            dateOfBirth: user_data?.dateOfBirth === null ? "" : moment(user_data?.dateOfBirth, 'YYYY-MM-DD'),
            joiningDate: user_data?.joiningDate === null ? "" : !(user_data?.joiningDate) ? "" : moment(user_data?.joiningDate, 'YYYY-MM-DD'), 
        }
        form.setFieldsValue(data)
        setImage(user_data?.imageUrl);
        setSalaryType(user_data?.salaryType)
        getRolePermissions(user_data?.roleId)
    }
  }, [])

  useEffect(() => {
    // When the data state changes, update the form fields with the new data
    if (allLeaves) {
      form.setFieldsValue(allLeaves)
    }
  }, [allLeaves]);

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

  const getReportsTo = () => {
    apiServices("GET", 'user/view-team-lead', null, user_state)
    .then((res) => {
        if (res?.data?.success === true) {
          setReportsTo(res?.data?.User);
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
          }`
        );
      });
  }

  const getRole = () => {
    apiServices("GET", "role/view-role", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllRoles(res?.data?.Role);
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

  const getRolePermissions = (id) => {
    setRolePermLoader(true);
    apiServices("GET", `permissions/?roleId=${id}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setPermissions(res?.data?.permissions?.permissions);
          setRolePermLoader(false);
        }
      })
      .catch((err) => {
        setRolePermLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('allEmp.errors.getpermissionsInfoError')
          }`
        );
      });
  };

  const getDepartment = () => {
    apiServices("GET", "team/view-team", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
            setAllTeams(res?.data?.Team);
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

  const getDesignation = () => {
    apiServices("GET", "designation", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllDesignations(res?.data?.Designation);
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
          }!`
        );
      });
  }

  const getShift = () => {
    apiServices("GET", "shift", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllShifts(res?.data?.shift);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('allEmp.errors.getShiftInfoError')
          }!`
        );
      });
}

const getTaxSlab = () => {
    apiServices("GET", "tax-slab", null, user_state)
    .then((res) => {
        if (res?.data?.success === true) {
            setAllTaxSlabs(res?.data?.taxSlabs);
        }
    })
    .catch((err) => {
        message.error(
            `${
                err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t('allEmp.errors.getTaxSlabsInfoError')
            }!`
            );
        });
    }
    
    const getAllLeaves = () => {
        apiServices("GET", "leave-policy", null, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setAllLeaves(res?.data?.leavePolicies)
          }
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t('allEmp.errors.getLeaveInfoError')
            }!`
          );
        });
    }

    const fetchNextEmployeeId = () => {
        apiServices("GET", "company/next-employee-id", null, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setNextEmployeeId(res?.data?.nextEmployeeId);
            form.setFieldsValue({ employeeId: res?.data?.nextEmployeeId });
          }
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error fetching next employee ID"
            }!`
          );
        });
    }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const beforeUpload = (file) => {
    const isFileTypeAllowed = allowedFileTypes.includes(file.type);

    if (!isFileTypeAllowed) {
      message.error(t('allEmp.errors.fileTypeNotAllowed'));
      return false;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const isSizeAllowed = file.size <= maxSizeInBytes;

    if (!isSizeAllowed) {
      message.error(t('allEmp.errors.fileSizeTooLarge'));
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
        form.setFieldsValue({imageUrl: res?.data?.result?.secure_url})
        setImage(res?.data?.result?.secure_url)
        setImageLoader(false)
      }
      ).catch((err)=>{
        setImageLoader(false)
        message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t('allEmp.errors.uploadImageError')
            }!`
          );
      })
  }

  const onRemoveProfileImage = () => {
    form.setFieldsValue({ imageUrl: '' })
    setImage('')
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
        <Modal
            open={open?.isprofileInfoOpen || open?.isEditOpen || open?.isAddOpen}
            onClose={() => { handleClose(); setPhoneLengthError(false); setEmergValue(null); form.resetFields(); }}
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
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title"> {t('allEmp.Modal.profileInformation')}</h5>
                <button type="button" className="close" onClick={() => { handleClose(); setPhoneLengthError(false); setEmergValue(null); form.resetFields(); }}>
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                <Form
                form={form}
                onFinish={(values) => {
                    const { sickLeaves,casualLeaves,workFromHomeLeaves,bereavementLeaves,unpaidLeaves,paternityLeaves,maternityLeaves,
                            marriageLeaves,halfDayLeaves,annualLeaves, } = values;
                    const total = ( +sickLeaves + +casualLeaves + +workFromHomeLeaves + +bereavementLeaves + +unpaidLeaves +
                                    +paternityLeaves + +maternityLeaves + +marriageLeaves + Math.ceil(+halfDayLeaves / 2) + +annualLeaves );
                    if (total <= 365) {
                    //   onFinish(values)
                    open?.isAddOpen ? onFinishAdd(values) : open?.isEditOpen ? onFinishEdit(values) : open?.isprofileInfoOpen ?  onFinish(values) : null
                    } else {
                      message.error(t('allEmp.errors.totalLeavesExceeded'));
                    }
                  }}
                onFinishFailed={({errorFields}) => {
                    const phoneErrorExists = errorFields.find(field => field.errors.toString().includes('please enter phone number'));
                    if(phoneErrorExists){
                    setPhoneLengthError({emp: true})
                    }
                    const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                    if(consecutiveSpacesError){
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                    }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    }
                }}
                initialValues={{
                    // bankName: bankInfo?.bankName ? bankInfo?.bankName : '',
                    // bankAccountNumber: bankInfo?.bankAccountNumber ? bankInfo?.bankAccountNumber : '',
                    // phoneNo: '+92333333',
                    // password: open?.isAddOpen && '1',
                }}
                >
                <div className="row">
                    <div className="col-md-12">
                    <Form.Item
                        name='imageUrl'
                        className='custom-border'
                        style={{display: 'grid', placeContent: 'center'}}
                    >   
                    <div>
                        <div className="profile-img-wrap edit-img">
                            {
                                imageLoader ? <div className="uploadImgSpinContainer"> <Spin /> </div> :
                                <>
                                    {/* <img className="inline-block" src={image ? image : user_data?.imageUrl ? user_data?.imageUrl : user_icon} alt="user" /> */}
                                    <img className="inline-block" src={image ? image : user_icon} alt="user" />
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
                          image &&
                          <a href="javascript:void(0)"
                            onClick={() => onRemoveProfileImage()}
                            className="fa fa-closee file-remove" style={{color: '#fb1612', position: 'absolute', top: '-1px' ,right: '-4px', fontSize: '19px', fontFamily: 'cursive', padding: '5px 7px 6px', background: 'white', borderRadius: '50%'}} > <i className='fa fa-times' /> </a>
                        }
                    </div>
                    </Form.Item>
                    <div className="row">
                        <div className="col-md-6">
                        <div className="form-group">
                        <label>
                        {t('allEmp.Modal.fullName')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name='fullName'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if (!value || value.trim() === '') {
                                    return Promise.reject(t('allEmp.errors.enterFullName'));
                                } else if (/\s{2,}/.test(value)) {
                                    return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                } else if (value.length < 3) {
                                    return Promise.reject(t('allEmp.errors.nameMinLength'));
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
                            {t('allEmp.Modal.employeeID')} <span className="text-danger">*</span>
                            </label>
                            <Form.Item
                            name='employeeId'
                            className='custom-border'
                            rules={[
                                {
                                    whitespace: true,
                                    required: true,
                                    validator: (_, value) => {
                                    if (!value || value.trim() === '') {
                                        return Promise.reject(t('allEmp.errors.enterEmployeeId'));
                                    } else if (/\s{2,}/.test(value)) {
                                        return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                    } else if (value.length < 3) {
                                        return Promise.reject(t('allEmp.errors.idMinLength'));
                                    }
                                    return Promise.resolve();
                                    },
                                },
                                ]}
                            >
                            <Input 
                              className='form-control' 
                              maxLength={50} 
                              disabled={open?.isAddOpen}
                              style={open?.isAddOpen ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                            />
                            </Form.Item>
                        </div>
                        </div>
                        <div className="col-md-6">
                        <div className="form-group">
                            <label>
                            {t('allEmp.Modal.email')} <span className="text-danger">*</span>
                            </label>
                            <Form.Item
                            name='email'
                            className='custom-border'
                            rules={[
                                {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                    if (!value || value?.trim() === '') {
                                    return Promise.reject(t('allEmp.errors.enterEmail'));
                                    } else if (/\s{2,}/.test(value)) {
                                    return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                    } else if (!isValidEmail(value)) {
                                    return Promise.reject(t('allEmp.errors.enterValidEmail'));
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
                            {t('allEmp.Modal.password')} <span className="text-danger">*</span>
                            </label>
                            <Form.Item
                            name='password'
                            className='custom-border'
                            rules={[
                                {
                                whitespace: true,
                                required: true,
                                message: t('allEmp.errors.password'),
                                },
                                {
                                min: 8,
                                message: t('allEmp.errors.passwordLength'),
                                },
                            ]}
                            >
                                {
                                    open?.isAddOpen ?
                                    <Input.Password type='password' className='form-control'  maxLength={50}  />
                                    :
                                    <Input type='password' className='form-control'  maxLength={50} disabled />
                                }
                            </Form.Item>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.phoneNumber')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='phoneNo'
                        className='custom-border'
                        rules={[
                            {
                            whitespace: true,
                            required: true,
                            message: t('allEmp.errors.phoneNumber'),
                            },
                            {
                            min: 5,
                            message: t('allEmp.errors.phoneLength'),
                            },
                        ]}
                        validateStatus={phoneLengthError ? 'error' : ''}
                        help={phoneLengthError?.emp ? 'please enter phone number' : phoneLengthError?.len ? "phone length must be at least 5 digits long" : numFlag ? <label style={{ color: 'red' }}>{t('allEmp.errors.validPhoneNumber')}</label> : ''}
                        >
                        <Input style={{ display: "none" }} value={emergValue?.phoneNo} />
                        <PhoneNoInput
                            onChangePhone={(value) => {
                            onHandleEmergChange("phoneNo", value);
                            }}
                            phone={user_data?.phoneNo ? user_data?.phoneNo : ""}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.dateOfBirth')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='dateOfBirth'
                            className='custom-border'
                            rules={[
                                {
                                  required: true,
                                  message: t('allEmp.errors.dateOfBirth'),
                                },
                              ]}
                            >
                                <DatePicker className='form-control' style={{minHeight: '45px'}} getPopupContainer={() => document.getElementById('area')} />
                            </Form.Item>
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.nationalIdentityNumber')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='nationalIdentityNumber'
                        className='custom-border'
                        rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: t('allEmp.errors.nationalIdentityNumber'),
                            },
                            {
                                min: 3,
                                message: t('allEmp.errors.phoneDigits'),
                            }
                        ]}
                        >
                        <Input className='form-control' maxLength={50}
                            onKeyPress={(e) => {
                            if (
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
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.gender')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='gender'
                            className='custom-border'
                            rules={[
                                {
                                  whitespace: true,
                                  required: true,
                                  message: t('allEmp.errors.gender'),
                                },
                              ]}
                            >
                                <Select
                                    className="custom-select custom-normal"
                                    getPopupContainer={() => document.getElementById('area')}
                                    style={{
                                    width: '100%',
                                    }}
                                    placeholder='Select Gender'
                                    options={[
                                    {
                                        value: 'Male',
                                        label: "Male",
                                    },
                                    {
                                        value: 'Female',
                                        label: "Female",
                                    },
                                    {
                                        value: 'Other',
                                        label: "Other",
                                    },
                                    ]}
                                />
                            </Form.Item>
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                    <label>
                    {t('allEmp.Modal.address')} <span className="text-danger">*</span>
                    </label>
                    <Form.Item
                        name='address'
                        className='custom-border'
                        rules={[
                        {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                            if (!value || value.trim() === '') {
                                return Promise.reject(t('allEmp.errors.enterAddress'));
                            } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                            } else if (value.length < 3) {
                                return Promise.reject(t('allEmp.errors.addressMinLength'));
                            }
                            return Promise.resolve();
                            },
                        },
                        ]}
                    >
                        <Input className='form-control' maxLength={150} />
                    </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.joiningDate')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='joiningDate'
                            className='custom-border'
                            rules={[
                                {
                                  required: true,
                                  message: t('allEmp.errors.joiningDate'),
                                },
                              ]}
                            >
                                <DatePicker className='form-control' getPopupContainer={() => document.getElementById('area')} />
                            </Form.Item>
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.employeeType')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='employeeType'
                            className='custom-border'
                            rules={[
                                {
                                  whitespace: true,
                                  required: true,
                                  message: t('allEmp.errors.employeeType'),
                                },
                              ]}
                            >
                                <Select
                                    className="custom-select custom-normal"
                                    getPopupContainer={() => document.getElementById('area')}
                                    style={{
                                    width: '100%',
                                    }}
                                    placeholder='Select Employee Type'
                                    options={[
                                    {
                                        value: 'Full-Time',
                                        label: "Full Time",
                                    },
                                    {
                                        value: 'Part-Time',
                                        label: "Part Time",
                                    },
                                    {
                                        value: 'Contract',
                                        label: "Contract",
                                    },
                                    {
                                        value: 'Intern',
                                        label: "Intern",
                                    },
                                    ]}
                                />
                            </Form.Item>
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>
                            {t('allEmp.Modal.reportsTo')}
                            </label>
                            <div style={{ position: 'relative' }} id='area'>
                                <Form.Item
                                name='reportsTo'
                                className='custom-border'
                                >
                                    <Select
                                        className="custom-select custom-normal"
                                        getPopupContainer={() => document.getElementById('area')}
                                        style={{
                                        width: '100%',
                                        }}
                                        placeholder='Select Reprts to'
                                    >
                                        {reportsTo?.map((item, index) => {
                                        return (
                                            <Option key={index} value={item?._id}>{item?.fullName}</Option>
                                        )
                                        })}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>
                            {t('allEmp.Modal.role')} <span className="text-danger">*</span>
                            </label>
                            <div style={{ position: 'relative' }} id='area'>
                                <Form.Item
                                name='roleId'
                                className='custom-border'
                                rules={[
                                    {
                                      whitespace: true,
                                      required: true,
                                      message: t('allEmp.errors.role'),
                                    },
                                  ]}
                                >
                                    <Select
                                        className="custom-select custom-normal"
                                        getPopupContainer={() => document.getElementById('area')}
                                        dropdownRender={(menu) => (
                                          <>
                                            {menu}
                                            {
                                                <>
                                                  <Divider
                                                    style={{
                                                      margin: '5px 0',
                                                    }}
                                                  />
                                                  <Button
                                                    type="button" icon={<PlusOutlined style={{fontSize: '20px', marginRight: '5px'}} />}
                                                    className="addButtonStyles"
                                                    style={{width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                                                    onClick={() => setAddRoleOpen(true)}
                                                  >
                                                    {t('allEmp.Modal.addRole')}
                                                  </Button>
                                                </>
                                            }
                                          </>
                                        )}
                                        style={{
                                        width: '100%',
                                        }}
                                        placeholder='Select Role'
                                        onChange={(id) => getRolePermissions(id)}
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
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.level')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='level'
                        className='custom-border'
                        // rules={[
                        //     {
                        //     whitespace: true,
                        //     required: true,
                        //     validator: (_, value) => {
                        //         if (!value || value.trim() === '') {
                        //         return Promise.reject(t('allEmp.errors.enterLevel'));
                        //         } else if (/\s{2,}/.test(value)) {
                        //         return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        //         } else if (value.length < 3) {
                        //         return Promise.reject(t('allEmp.errors.levelMinLength'));
                        //         }
                        //         return Promise.resolve();
                        //     },
                        //     },
                        // ]}
                        >
                        <Input className='form-control' maxLength={50} />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        Salary Type <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='salaryType'
                            className='custom-border'
                            rules={[
                                {
                                  whitespace: true,
                                  required: true,
                                  message: "Please select salary type",
                                },
                              ]}
                            >
                                <Select
                                    className="custom-select custom-normal"
                                    getPopupContainer={() => document.getElementById('area')}
                                    style={{
                                    width: '100%',
                                    }}
                                    placeholder='Select Salary Type'
                                    onChange={(value) => setSalaryType(value)}
                                    options={[
                                    {
                                        value: 'Monthly',
                                        label: "Monthly",
                                    },
                                    {
                                        value: 'Hourly',
                                        label: "Hourly",
                                    },
                                    {
                                        value: 'Unpaid',
                                        label: "Unpaid",
                                    },
                                    ]}
                                />
                            </Form.Item>
                        </div>
                    </div>
                    </div>
                    {salaryType === 'Monthly' ? 
                    <div className="col-md-6">
                    <div className="form-group">
                      <label>
                      {t('allEmp.Modal.salary')}{` (${currency})`} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name='salary'
                        className='custom-border'
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            message: t('allEmp.errors.salary'),
                            // validator: (_, value) => {
                            //   if (!value || value.trim() === '') {
                            //     return Promise.reject('please enter salary');
                            //   } else if (/\s{2,}/.test(value)) {
                            //     return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                            //   } else if (value.length < 3) {
                            //     return Promise.reject('length must be at least 3 characters long');
                            //   }
                            //   return Promise.resolve();
                            // },
                          },
                        ]}
                      >
                        <Input className='form-control' maxLength={50}
                          // onKeyPress={(e) => {
                          //   if ((e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 33 &&  e.which <= 47) || (e.which >= 58 && e.which <= 64) || (e.which >= 91 && e.which <= 96) || (e.which >= 123 && e.which <= 126) ) {
                          //     e.preventDefault();
                          //   }
                          // }}
                          onKeyPress={(e) => {
                            if (
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
                  :
                  salaryType === 'Hourly' ? 
                    <div className="col-md-6">
                    <div className="form-group">
                      <label>
                      {`Hourly Rate (${currency})`}<span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name='salary'
                        className='custom-border'
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            message: 'Please enter hourly rate'
                            // validator: (_, value) => {
                            //   if (!value || value.trim() === '') {
                            //     return Promise.reject('please enter salary');
                            //   } else if (/\s{2,}/.test(value)) {
                            //     return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                            //   } else if (value.length < 3) {
                            //     return Promise.reject('length must be at least 3 characters long');
                            //   }
                            //   return Promise.resolve();
                            // },
                          },
                        ]}
                      >
                        <Input className='form-control' maxLength={50}
                          // onKeyPress={(e) => {
                          //   if ((e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 33 &&  e.which <= 47) || (e.which >= 58 && e.which <= 64) || (e.which >= 91 && e.which <= 96) || (e.which >= 123 && e.which <= 126) ) {
                          //     e.preventDefault();
                          //   }
                          // }}
                          onKeyPress={(e) => {
                            if (
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
                    :
                    null
                  }
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.department')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='teamId'
                            className='custom-border'
                            rules={[
                                {
                                  whitespace: true,
                                  required: true,
                                  message: t('allEmp.errors.department'),
                                },
                              ]}
                            >
                                <Select
                                    className="custom-select custom-normal"
                                    getPopupContainer={() => document.getElementById('area')}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                        {
                                            <>
                                              <Divider
                                                style={{
                                                  margin: '5px 0',
                                                }}
                                              />
                                              <Button
                                                type="button" icon={<PlusOutlined style={{fontSize: '20px', marginRight: '5px'}} />}
                                                className="addButtonStyles"
                                                style={{width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                                                onClick={() => setAddDeptOpen(true)}
                                              >
                                                {t('allEmp.Modal.addDepartment')}
                                              </Button>
                                            </>
                                        }
                                      </>
                                    )}
                                    style={{
                                    width: '100%',
                                    }}
                                    placeholder='Select Department'
                                >
                                    {allTeams?.map((item, index) => {
                                    return (
                                        <Option key={index} value={item?._id}>{item?.teamName}</Option>
                                    )
                                    })}
                                </Select>
                        </Form.Item>
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.designation')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='designationId'
                            className='custom-border'
                            rules={[
                                {
                                  whitespace: true,
                                  required: true,
                                  message: t('allEmp.errors.designation'),
                                },
                              ]}
                            >
                                <Select
                                    className="custom-select custom-normal"
                                    getPopupContainer={() => document.getElementById('area')}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                        {
                                            <>
                                              <Divider
                                                style={{
                                                  margin: '5px 0',
                                                }}
                                              />
                                              <Button
                                                type="button" icon={<PlusOutlined style={{fontSize: '20px', marginRight: '5px'}} />}
                                                className="addButtonStyles"
                                                style={{width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                                                onClick={() => setAddDesigOpen(true)}
                                              >
                                                {t('allEmp.Modal.addDesignation')}
                                              </Button>
                                            </>
                                        }
                                      </>
                                    )}
                                    style={{
                                    width: '100%',
                                    }}
                                    placeholder='Select Designatiion'
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
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.shift')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='shiftId'
                            className='custom-border'
                            rules={[
                                {
                                  whitespace: true,
                                  required: true,
                                  message: t('allEmp.errors.shift'),
                                },
                              ]}
                            >
                                <Select
                                    className="custom-select custom-normal"
                                    getPopupContainer={() => document.getElementById('area')}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                        {
                                            <>
                                              <Divider
                                                style={{
                                                  margin: '5px 0',
                                                }}
                                              />
                                              <Button
                                                type="button" icon={<PlusOutlined style={{fontSize: '20px', marginRight: '5px'}} />}
                                                className="addButtonStyles"
                                                style={{width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                                                onClick={() => setAddShiftOpen(true)}
                                              >
                                                {t('allEmp.Modal.addShift')}
                                              </Button>
                                            </>
                                        }
                                      </>
                                    )}
                                    style={{
                                    width: '100%',
                                    }}
                                    placeholder='Select Shift'
                                >
                                    {allShifts?.map((item, index) => {
                                    return (
                                        <Option key={index} value={item?._id}>{item?.title}</Option>
                                    )
                                    })}
                                </Select>
                            </Form.Item>
                        </div>
                    </div>
                    </div>
                    {salaryType === 'Monthly' ? 
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.taxSlab')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: 'relative' }} id='area'>
                            <Form.Item
                            name='taxSlabId'
                            className='custom-border'
                            rules={[
                                {
                                  whitespace: true,
                                  required: true,
                                  message: t('allEmp.errors.taxSlab'),
                                },
                              ]}
                            >
                                <Select
                                    className="custom-select custom-normal"
                                    getPopupContainer={() => document.getElementById('area')}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                        {
                                            <>
                                              <Divider
                                                style={{
                                                  margin: '5px 0',
                                                }}
                                              />
                                              <Button
                                                type="button" icon={<PlusOutlined style={{fontSize: '20px', marginRight: '5px'}} />}
                                                className="addButtonStyles"
                                                style={{width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                                                onClick={() => setAddTaxOpen(true)}
                                              >
                                                {t('allEmp.Modal.addTaxSlab')}
                                              </Button>
                                            </>
                                        }
                                      </>
                                    )}
                                    style={{
                                    width: '100%',
                                    }}
                                    placeholder='Select Tax Slab'
                                >
                                    {allTaxSlabs?.map((item, index) => {
                                    return (
                                        <Option key={index} value={item?._id}>{item?.title}</Option>
                                    )
                                    })}
                                </Select>
                            </Form.Item>
                        </div>
                    </div>
                    </div>
                    :
                    null
                    }
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.sickLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="sickLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.sickLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0}
                            onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                                event.preventDefault();
                            }
                            }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.casualLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="casualLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.casualLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0}
                        onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.workFromHomeLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="workFromHomeLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.workFromHomeLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0}
                        onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.bereavementLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="bereavementLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.bereavementLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0}
                        onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.unpaidLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="unpaidLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.unpaidLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0} 
                        onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.paternityLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="paternityLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.paternityLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0} 
                        onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.maternityLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="maternityLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.maternityLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0}
                        onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.marriageLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="marriageLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.marriageLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0}
                        onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        {t('allEmp.Modal.halfDayLeaves')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name="halfDayLeaves"
                        rules={[
                            {
                            required: true,
                            message: t('allEmp.errors.halfDayLeaves'),
                            },
                        ]}
                        className="custom-border"
                        >
                        <InputNumber className="form-control" min={0}
                        onKeyPress={(e) => {
                            if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                            event.preventDefault();
                            }
                        }}
                        />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>
                            {t('allEmp.Modal.annualLeaves')} <span className="text-danger">*</span>
                            </label>
                            <Form.Item
                            name="annualLeaves"
                            rules={[
                                {
                                required: true,
                                message: t('allEmp.errors.annualLeaves'),
                                },
                            ]}
                            className="custom-border"
                            >
                            <InputNumber className="form-control" min={0}
                            onKeyPress={(e) => {
                                if (e.which > 31 && (e.which < 48 || e.which > 57)) {
                                event.preventDefault();
                                }
                            }}
                            />
                            </Form.Item>
                        </div>
                    </div>

                    {rolePermLoader ? (
                    <Spin
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: '20%',
                        borderRadius: '10px',
                        background: '#f2f2f2'
                      }}
                    />
                  ) : permissions ? (
                    <PermissionsTable
                      permissions={permissions}
                      disabled={true}
                    />
                  ) : null}

                </div>
                <div className="submit-section">
                    <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
                    {
                        loader ? <Spin size="small" indicator={antIcon} />
                        : t('submit')
                    }
                    </button>
                </div>
                </Form>
                </div>
            </div>
            </div>
        </Modal>

        {
          addDeptOpen &&
          <AddDepartment
            addDeptOpen={addDeptOpen}
            setAddDeptOpen={setAddDeptOpen}
            allTeams={allTeams}
            setAllTeams={setAllTeams}
            user_state={user_state}
          />
        }
        {
          addDesigOpen &&
          <AddDesignation
            addDesigOpen={addDesigOpen}
            setAddDesigOpen={setAddDesigOpen}
            allDesignations={allDesignations}
            setAllDesignations={setAllDesignations}
            user_state={user_state}
          />
        }
        {
          addShiftOpen &&
          <AddShift
            addShiftOpen={addShiftOpen}
            setAddShiftOpen={setAddShiftOpen}
            allShifts={allShifts}
            setAllShifts={setAllShifts}
            user_state={user_state}
          />
        }
        {
          addTaxOpen &&
          <AddTaxSlab
            addTaxOpen={addTaxOpen}
            setAddTaxOpen={setAddTaxOpen}
            allTaxSlabs={allTaxSlabs}
            setAllTaxSlabs={setAllTaxSlabs}
            user_state={user_state}
          />
        }
        {
          addRoleOpen &&
          <AddRole
            addRoleOpen={addRoleOpen}
            setAddRoleOpen={setAddRoleOpen}
            allRoles={allRoles}
            setAllRoles={setAllRoles}
            user_state={user_state}
          />
        }

    </>
  )
}

export default ProfileInfoModal