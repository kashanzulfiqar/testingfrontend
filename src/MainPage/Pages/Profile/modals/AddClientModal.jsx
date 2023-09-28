import React, { useEffect, useState } from 'react'
import ImgCrop from 'antd-img-crop';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from "@mui/material/Modal";
import { DatePicker, Divider, Form, Input, InputNumber, Select, Spin, Upload, message, Button } from 'antd';
import PhoneNoInput from '../../../../Components/PhoneNoInput';
import { user_icon } from '../../../../Entryfile/imagepath';
import { apiUploadToS3 } from '../../../../Services/uploadImage';
import { apiServices } from '../../../../Services/apiServices';

const AddClientModal = ({ open, setOpen, user_state, allClients, setAllClients, setPaginationDetail, paginationDetail, allCountries }) => {
    const [form] = Form.useForm();
    
    const company_id = user_state?.user?.companyId


    const [phoneLengthError, setPhoneLengthError] = useState(false);
    const [emergValue, setEmergValue] = useState(null)
    const [imageLoader, setImageLoader] = useState(false)
    const [image, setImage] = useState('')
    const [loader, setLoader] = useState(false)

useEffect(() => {
    if(open?.data){
        form.setFieldsValue(open?.data)
    }
  }, [])

const onFinishAdd = (values) => {
    const replacer = (key, value) => {
        if(value === undefined || value === '' || value === null || !value){
            return ''
        }
        return value;
        };
        const new_values = JSON.parse(JSON.stringify(values, replacer));

        setLoader(true)
          apiServices("POST", "client/add-client", new_values, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setAllClients((prev) => ([
              {
                ...new_values,
                _id: res?.data?.Client?._id,
                companyId: company_id,
              },
              ...prev,
            ]))
            setPaginationDetail({
              ...paginationDetail,
              total: paginationDetail?.total + 1
            })
            message.success('Client Added Successfully!')
            handleClose();
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
                : "Add Client Info Error"
            }!`
          );
        });
}
const onFinishEdit = (values) => {
    const replacer = (key, value) => {
        if(value === undefined || value === '' || value === null || !value){
            return ''
        }
        return value;
        };
        const d = JSON.parse(JSON.stringify(values, replacer));
        Object.keys(d).forEach((key) => {
            if (key === 'password' || d[key] === '') {
              delete d[key];
            }
          });

        const new_values = {
            ...d,
            companyId: open?.data?.companyId,
            _id: open?.data?._id,
        }
        setLoader(true)
          apiServices("PUT", "client/update-client", new_values, user_state)
          .then((res) => {
            if (res?.data?.success === true) {
              setAllClients(
                allClients.map((client) => {
                    if (client._id === open?.data?._id) {
                  return {
                    ...client,
                    ...d,
                  };
                } else {
                  return {
                      ...client,
                    };
                  }
                })
              );
              handleClose()
              message.success('Client Updated Successfully!')
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
                  : "Update Client Info Error"
              }!`
            );
          });
}

const onImageUpload = (imagedata) => {
    setImageLoader(true)
    apiUploadToS3(imagedata).then((res) => {
        console.log(res?.data?.result);
        form.setFieldsValue({logo: res?.data?.result})
        setImage(res?.data?.result)
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
                : "upload image Error"
            }!`
          );
      })
  }

  const handleClose = () => { 
    setOpen({ isAddOpen: false, data: '' });
    setPhoneLengthError(false);
    setEmergValue(null);
    form.resetFields(); 
}
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

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
  };


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
            open={open?.isAddOpen}
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
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">{open?.data ? 'Edit' : 'Add'} Client</h5>
                <button type="button" className="close" onClick={handleClose}>
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                <Form
                form={form}
                onFinish={(values) => {
                    open?.data ? onFinishEdit(values) : onFinishAdd(values)
                    }
                }
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
                autoComplete='off'
                >
                <div className="row">
                    <div className="col-md-12">
                        <Form.Item
                            name='logo'
                            className='custom-border'
                        >   
                            <>
                                <div className="profile-img-wrap edit-img">
                                    {
                                        imageLoader ? <div className="uploadImgSpinContainer"> <Spin /> </div> :
                                        <>
                                            <img className="inline-block" src={image ? image : open?.data?.logo ? open?.data?.logo : user_icon} alt="user" />
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
                                <label style={{display: 'flex', justifyContent: 'center', margin: '-20px 0px 10px 0px'}}>Company Logo</label>
                            </>
                        </Form.Item>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                    <div className="form-group">
                    <label>
                        Full Name <span className="text-danger">*</span>
                    </label>
                    <Form.Item
                        name='clientName'
                        className='custom-border'
                        rules={[
                        {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                            if (!value || value.trim() === '') {
                                return Promise.reject('please enter full name');
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
                        Email <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='clientEmail'
                        className='custom-border'
                        rules={[
                            {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                                if (!value || value?.trim() === '') {
                                return Promise.reject('please enter email');
                                } else if (/\s{2,}/.test(value)) {
                                return Promise.reject('please remove consecutive spaces');
                                } else if (!isValidEmail(value)) {
                                return Promise.reject('please enter a valid email');
                                }
                                return Promise.resolve();
                            },
                            },
                        ]}
                        >
                        <Input className='form-control' maxLength={50} disabled={open?.data} />
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        Password <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='password'
                        className='custom-border'
                        rules={[
                            {
                            whitespace: true,
                            required: true,
                            message: "please enter password",
                            },
                            {
                            min: 8,
                            message: "password length should be more than 8",
                            },
                        ]}
                        >
                            {
                                open?.data ?
                                <Input type='password' className='form-control'  maxLength={50} disabled />
                                :
                                <Input.Password type='password' className='form-control'  maxLength={50}  />
                            }
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        Phone No <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='clientPhoneNo'
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
                        >
                            <>
                                <Input style={{ display: "none" }} value={emergValue?.clientPhoneNo} />
                                <PhoneNoInput
                                    onChangePhone={(value) => {
                                    onHandleEmergChange("clientPhoneNo", value);
                                    }}
                                    phone={open?.data?.clientPhoneNo ? open?.data?.clientPhoneNo : ""}
                                />
                            </>
                        </Form.Item>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                    <label>
                        Country <span className="text-danger">*</span>
                    </label>
                    <div style={{ position: "relative" }} id="area" className='countryDropDown'>
                      <Form.Item
                          name='country'
                          className='custom-border'
                          rules={[
                          {
                            whitespace: true,
                            required: true,
                            message: 'please select country name',
                          },
                          ]}
                      >
                          {/* <Input className='form-control' maxLength={50} /> */}
                            <Select
                              showSearch
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select Country"
                            >
                              {
                                allCountries.map((country, index) => (
                                  <Select.Option key={index} value={country.countryName}>
                                    {country.countryName}
                                  </Select.Option>
                                ))
                              }
                            </Select>
                      </Form.Item>
                    </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <label>
                        Invoice Email <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='invoiceEmail'
                        className='custom-border'
                        rules={[
                            {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                                if (!value || value?.trim() === '') {
                                return Promise.reject('please enter invoice email');
                                } else if (/\s{2,}/.test(value)) {
                                return Promise.reject('please remove consecutive spaces');
                                } else if (!isValidEmail(value)) {
                                return Promise.reject('please enter a valid email');
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
                        Head Office Address <span className="text-danger">*</span>
                    </label>
                    <Form.Item
                        name='headOfficeAddress'
                        className='custom-border'
                        rules={[
                        {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                            if (!value || value.trim() === '') {
                                return Promise.reject('please enter address');
                            } else if (/\s{2,}/.test(value)) {
                                return Promise.reject('please remove consecutive spaces');
                            } else if (value.length < 3) {
                                return Promise.reject('address must be at least 3 characters long');
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
                </div>
                <div className="submit-section">
                    <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
                    {
                        loader ? <Spin size="small" indicator={antIcon} />
                        : 'Submit'
                    }
                    </button>
                </div>
                </Form>
                </div>
            </div>
            </div>
        </Modal>
    </>
  )
}

export default AddClientModal