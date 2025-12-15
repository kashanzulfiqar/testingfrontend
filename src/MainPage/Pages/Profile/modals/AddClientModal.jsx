import React, { useEffect, useState } from 'react'
import ImgCrop from 'antd-img-crop';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from "@mui/material/Modal";
import { DatePicker, Divider, Form, Input, InputNumber, Select, Spin, Upload, message, Button } from 'antd';
import PhoneNoInput from '../../../../Components/PhoneNoInput';
import { user_icon } from '../../../../Entryfile/imagepath';
import { apiUploadToS3 } from '../../../../Services/uploadImage';
import { apiServices } from '../../../../Services/apiServices';
import { useTranslation } from 'react-i18next';

const AddClientModal = ({ open, setOpen, user_state, allClients, setAllClients, setPaginationDetail, paginationDetail, allCountries }) => {
    const [form] = Form.useForm();
    const { t, i18n } = useTranslation()
    const company_id = user_state?.user?.companyId


    const [phoneLengthError, setPhoneLengthError] = useState(false);
    const [emergValue, setEmergValue] = useState(null)
    const [imageLoader, setImageLoader] = useState(false)
    const [image, setImage] = useState('')
    const [loader, setLoader] = useState(false)
    const [numFlag, setNumFlag] = useState(false)

useEffect(() => {
    if(open?.data){
        form.setFieldsValue(open?.data)
    }
  }, [open?.data, form])

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
            message.success(t('client.clientAddedSuccess'))
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
                : t('client.addClientInfoError')
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
              message.success(t('client.clientUpdatedSuccess'))
              setLoader(false)
              setNumFlag(false)
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
                  : t('client.updateClientInfoError')
              }!`
            );
            if (err?.response?.data?.msg === "Input Valid Number" && err?.response?.data?.success === false) {
              setNumFlag(true);
            } else {
              setNumFlag(false); // Reset numFlag to false if the condition is not met
            }
          });
}

const onImageUpload = (imagedata) => {
    setImageLoader(true)
    apiUploadToS3(imagedata).then((res) => {
        console.log(res?.data?.result?.secure_url);
        form.setFieldsValue({logo: res?.data?.result?.secure_url})
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

  const handleClose = () => { 
    setOpen({ isAddOpen: false, data: '' });
    setPhoneLengthError(false);
    setEmergValue(null);
    form.resetFields();
    setNumFlag(false)
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
                <h5 className="modal-title">{open?.data ? t('edit') : t('requests.addModal.add')} {t('finance.Invoices.client')}</h5>
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
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                   }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
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
                                <label style={{display: 'flex', justifyContent: 'center', margin: '-20px 0px 10px 0px'}}>{t('client.companyLogo')}</label>
                            </>
                        </Form.Item>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                    <div className="form-group">
                    <label>
                    {t('client.fullName')} <span className="text-danger">*</span>
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
                                return Promise.reject(t('client.pleaseEnterFullName'));
                            } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                            } else if (value.length < 3) {
                                return Promise.reject(t('client.fullNameLength'));
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
                        {t('client.email')} <span className="text-danger">*</span>
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
                                return Promise.reject(t('client.pleaseEnterEmail'));
                                } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                } else if (!isValidEmail(value)) {
                                return Promise.reject(t('client.pleaseEnterValidEmail'));
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
                        {t('client.password')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='password'
                        className='custom-border'
                        rules={[
                            {
                            whitespace: true,
                            required: true,
                            message: t('client.pleaseEnterPassword'),
                            },
                            {
                            min: 8,
                            message: t('client.passwordLength'),
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
                        {t('client.phoneNo')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        name='clientPhoneNo'
                        className='custom-border'
                        rules={[
                            {
                            whitespace: true,
                            required: true,
                            message: t('client.pleaseEnterPhoneNumber'),
                            },
                            {
                            min: 5,
                            message: t('client.phoneLength'),
                            },
                        ]}
                        validateStatus={phoneLengthError ? 'error' : ''}
                        help={phoneLengthError?.emp ? 'please enter phone number' : phoneLengthError?.len ? "phone length must be at least 5 digits long" : numFlag ? <label style={{ color: 'red' }}>{t('allEmp.errors.validPhoneNumber')}</label> : ''}
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
                    {t('client.country')} <span className="text-danger">*</span>
                    </label>
                    <div style={{ position: "relative" }} id="area" className='countryDropDown'>
                      <Form.Item
                          name='country'
                          className='custom-border'
                          rules={[
                          {
                            whitespace: true,
                            required: true,
                            message: t('client.pleaseSelectCountry'),
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
                              placeholder={t('client.selectCountry')}
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
                        {t('client.invoiceEmail')} <span className="text-danger">*</span>
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
                                return Promise.reject(t('client.pleaseEnterInvoiceEmail'));
                                } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                } else if (!isValidEmail(value)) {
                                return Promise.reject(t('client.pleaseEnterValidEmail'));
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
                    {t('client.headOfficeAddress')} <span className="text-danger">*</span>
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
                                return Promise.reject(t('client.pleaseEnterAddress'));
                            } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                            } else if (value.length < 3) {
                                return Promise.reject(t('client.addressLength'));
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
                        : t('submit')
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
