import React, { useEffect, useState } from 'react'
import ImgCrop from 'antd-img-crop';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from "@mui/material/Modal";
import { DatePicker, Divider, Form, Input, InputNumber, Select, Spin, Upload, message, Button, Empty } from 'antd';
import PhoneNoInput from '../../../Components/PhoneNoInput';
import { user_icon } from '../../../Entryfile/imagepath';
import { apiUploadToS3 } from '../../../Services/uploadImage';
import { apiServices } from '../../../Services/apiServices';
import { getAllISOCodes } from 'iso-country-currency';

const ExpenseModal = ({ form, open, handleClose, user_state, allExpenses, setAllExpenses, setPaginationDetail, paginationDetail, allEmployees }) => {
    
const moment = require('moment');

const company_id = user_state?.user?.companyId

const [imageLoader, setImageLoader] = useState(false)
const [image, setImage] = useState('')
const [loader, setLoader] = useState(false)
const [allCurrencies, setAllCurrencies] = useState([]);
const [expenseCategory, setExpenseCategory] = useState([]);
const [uploadFiles, setUploadFiles] = useState([]);
const [selectedFiles, setSelectedFiles] = useState([]);


useEffect(() => {
    getAllExpenseCategory();
    getAllCurrencies();
    if(open?.data){
        let val = {
            ...open?.data,
            category: open?.data?.category?._id,
            purchasedBy: open?.data?.purchasedBy?._id,
            purchaseDate: moment(open?.data?.purchaseDate, 'YYYY-MM-DD'),
        }
        form.setFieldsValue(val)
        setUploadFiles(open?.data?.image)
    }
  }, [])

const getAllExpenseCategory = () => {
apiServices("GET", `expenses-category?page=1&limit=99999`, null, user_state)
    .then((res) => {
    if (res?.data?.success === true) {
        const sortedData = res?.data?.Categories?.docs.slice().sort((a, b) => a.expenseCategoryName.localeCompare(b.expenseCategoryName));
        setExpenseCategory(sortedData);
        }
    })
    .catch((err) => {
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
const onFinishAdd = (values) => {
    const formatted_data = {
        ...values,
        purchaseDate: values?.purchaseDate ? moment(values?.purchaseDate).format('YYYY-MM-DD') : '',
        // image: values?.image || []
        image: uploadFiles
    }
    setLoader(true)
        apiServices("POST", "expenses", formatted_data, user_state)
    .then((res) => {
        if (res?.data?.success === true) {
        // setAllExpenses((prev) => ([
        //     {
        //     ...formatted_data,
        //     _id: res?.data?.Expense?._id,
        //     companyId: company_id,
        //     },
        //     ...prev,
        // ]))
        // setPaginationDetail({
        //     ...paginationDetail,
        //     totalDocs: paginationDetail?.totalDocs + 1
        // })
        message.success('Expense Added Successfully!')
        handleClose('update');
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
            : "Add Expense Info Error"
        }!`
        );
    });
}
const onFinishEdit = (values) => {
    const formatted_data = {
        ...values,
        purchaseDate: values?.purchaseDate ? moment(values?.purchaseDate).format('YYYY-MM-DD') : '',
        _id: open?.data?._id,
        // image: values?.image || []
        image: uploadFiles
    }
    setLoader(true)
    apiServices("PUT", "expenses", formatted_data, user_state)
    .then((res) => {
        if (res?.data?.success === true) {
        message.success('Expense Updated Successfully!')
        handleClose('update');
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
            : "Update Expense Info Error"
        }!`
        );
    });
}

// const acceptableFormats = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "xls", "xlsx"];
const acceptableFormats = ["pdf", "jpg", "jpeg", "png", "gif"];
const onFileUpload = async (files) => {
    const uploadPromises = [];
    const validFiles = [];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!acceptableFormats.includes(fileExtension)) {
        message.error(`File format not supported: ${file.name}`);
        continue;
      }
  
      if (file.size > 10485760) {
        message.error(`File size exceeds 10MB: ${file.name}`);
        continue;
      }
  
      validFiles.push(file);
  
      const uploadPromise = apiUploadToS3(file)
        .then((res) => {
        //   console.log(res?.data?.result);
          return res?.data?.result;
        })
        .catch((err) => {
          message.error(`File upload error: ${file.name}`);
        });
      uploadPromises.push(uploadPromise);
    }
  
    setSelectedFiles((prevSelectedFiles) => [...prevSelectedFiles, ...validFiles]);
  
    try {
      const urls = await Promise.all(uploadPromises);
      setUploadFiles((prevUploadFiles) => [...prevUploadFiles, ...urls]);
      setImageLoader(false)
    } catch (error) {
      console.error("File upload error:", error);
    }
  };

  const onRemoveFile = (remove_image_data) => {
    const filteredUrls = uploadFiles.filter(img => img !== remove_image_data);
    setUploadFiles(filteredUrls);
  }

const searchHandler = (val, type) => {
    let dropdownValues = []
    if (type === 'employee'){
      allEmployees.forEach((emp)=>{
        dropdownValues.push(emp.fullName.toLowerCase())
     })
    }else if (type === 'category'){
        expenseCategory.forEach((exp)=>{
        dropdownValues.push(exp.expenseCategoryName.toLowerCase())
     })
    }
  
    if(val !== ''){
      dropdownValues.some((team) => {
        if(team.includes(val.toLowerCase())){
          // setNoData(false);
          return true
        }else{
          // setNoData(true);
        }
      })
    }else{
      // setNoData(false)
    }
  }

  const getAllCurrencies = () => {
    const isoCodes = getAllISOCodes();
    const uniqueCurrencies = new Set();
    isoCodes.forEach(isoCode => {
        // const currency = isoCode.currency;
        const currency = {
          currency: isoCode?.currency,
          symbol: isoCode?.symbol
        };
        // uniqueCurrencies.add(currency);
        uniqueCurrencies.add(JSON.stringify(currency));
    });
    const currency_d = [...uniqueCurrencies].map(currency => JSON.parse(currency));
    const sorted_data = currency_d.sort((a, b) => a.currency.localeCompare(b.currency));
    // setAllCurrencies([...uniqueCurrencies])
    setAllCurrencies(sorted_data)
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
                <h5 className="modal-title">{open?.data ? 'Edit' : 'Add'} Expense</h5>
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
                {/* <div className="row">
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
                </div> */}
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                        <label>
                            Category <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='category'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: 'please select category',
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'category')
                                    }}
                                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    optionFilterProp="children"
                                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                      </>
                                    )}
                                    className="custom-select custom-normal"
                                    getPopupContainer={() =>
                                        document.getElementById("area")
                                    }
                                    placeholder="Select Category"
                                    >
                                    {
                                        expenseCategory.map((cat, index) => (
                                        <Select.Option key={index} value={cat._id}>
                                            {cat.expenseCategoryName}
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
                            Item Name <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name='itemName'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if (!value || value.trim() === '') {
                                    return Promise.reject('please enter item name');
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
                            Purchase From <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name='purchaseFrom'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if (!value || value.trim() === '') {
                                    return Promise.reject('please enter purchase from');
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
                            <Input className='form-control' maxLength={50} />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label> Purchase Date <span className="text-danger">*</span></label>
                            <div style={{ position: 'relative' }} id='area'>
                                <Form.Item
                                name='purchaseDate'
                                className='custom-border'
                                rules={[
                                    {
                                    required: true,
                                    message: "please enter purchase date",
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
                            Purchased By <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='purchasedBy'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: 'please select purchased by',
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'employee')
                                    }}
                                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    optionFilterProp="children"
                                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                      </>
                                    )}
                                    className="custom-select custom-normal"
                                    getPopupContainer={() =>
                                        document.getElementById("area")
                                    }
                                    placeholder="Select Purchase By"
                                    >
                                    {
                                        allEmployees.map((emp, index) => (
                                        <Select.Option key={index} value={emp._id}>
                                            {emp.fullName}
                                        </Select.Option>
                                        ))
                                    }
                                </Select>
                        </Form.Item>
                        </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label>
                                Currency <span className="text-danger">*</span>
                            </label>
                            <div style={{ position: "relative" }} id="area">
                            <Form.Item
                                name="currency"
                                className="custom-border"
                                rules={[
                                {
                                    required: true,
                                    message: "please select currency",
                                },
                                ]}
                            >
                                <Select
                                showSearch
                                className="custom-select custom-normal"
                                getPopupContainer={() =>
                                    document.getElementById("area")
                                }
                                placeholder="Select Currency"
                                >
                                {
                                    allCurrencies.map((currency, index) => (
                                    <Select.Option key={index} value={currency?.currency}>
                                        {currency?.currency}
                                    </Select.Option>
                                    ))
                                }
                                </Select>
                            </Form.Item>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                        <label> Amount <span className="text-danger">*</span> </label>
                        <Form.Item
                            name="amount"
                            rules={[
                            {
                                required: true,
                                message: "please enter amount",
                            },
                            ]}
                            className="custom-border"
                        >
                            <InputNumber
                                className='form-control hideHandlerIcon'
                                onKeyPress={(e) => {
                                if (
                                e.key === '.' &&
                                e.target.value.includes('.')
                                ) {
                                e.preventDefault();
                                } else if (
                                e.which !== 46 &&
                                (e.which < 48 || e.which > 57)
                                ) {
                                e.preventDefault();
                                }else if (
                                    e.key >= '0' &&
                                    e.key <= '9' &&
                                    e.target.value.includes('.') &&
                                    e.target.value.split('.')[1].length >= 2
                                  ) {
                                    // only two digits allowed after point
                                    e.preventDefault();
                                  }
                                }}
                                formatter={(value) => {
                                return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }}
                                parser={(value) => {
                                return value.replace(/\$\s?|(,*)/g, '');
                                }}
                            />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                        <label>
                            Paid By <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='paidBy'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: 'please select paid by',
                            },
                            ]}
                        >
                            <Select
                                className="custom-select custom-normal"
                                getPopupContainer={() =>
                                    document.getElementById("area")
                                }
                                placeholder="Select Purchase By"
                                options={[
                                    {
                                      value: 'Cash',
                                      label: "Cash",
                                    },
                                    {
                                      value: 'Cheque',
                                      label: "Cheque",
                                    },
                                    {
                                      value: 'Bank Transfer',
                                      label: "Bank Transfer",
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
                            Status <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='status'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: 'please select status',
                            },
                            ]}
                        >
                            <Select
                                className="custom-select custom-normal"
                                getPopupContainer={() =>
                                    document.getElementById("area")
                                }
                                placeholder="Select Status"
                                options={[
                                    {
                                      value: 'Pending',
                                      label: "Pending",
                                    },
                                    {
                                      value: 'Approved',
                                      label: "Approved",
                                    },
                                  ]}
                            />
                        </Form.Item>
                        </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Upload Files</label>
                            {/* <Form.Item
                                name='image'
                                className='custom-border'
                            > */}
                                <input
                                id="fileInputValue"
                                className="form-control uploadInput"
                                style={{minHeight: '44px'}}
                                multiple
                                onChange={(e) => {
                                    onFileUpload(e.target.files);
                                    setImageLoader(true)
                                }}
                                type="file"
                                />
                            {/* </Form.Item> */}
                        </div>
                    </div>
                    <div className='col-12' style={{display: 'flex', gap: '15px', rowGap: '25px', flexWrap: 'wrap'}}>
                    {
                        uploadFiles?.map((img, index) => {
                            const parts = img.split(".");
                            const format = parts[parts.length - 1];

                            const thumbnailUrl = `${img.replace(
                                "/upload/",
                                "/upload/c_thumb,w_100,h_100/"
                              )}`;
                            const downloadLink = `${img.replace(
                                "/upload/",
                                "/upload/fl_attachment/"
                              )}`;
                            return(
                                format.match(/^(jpg|jpeg|png|gif)$/i) ? 
                                <div
                                key={index}
                                // className="col-3 col-md-3 col-sm-3 col-lg-2 col-xl-2 mb-3"
                                >
                                    <div className="uploaded-box">
                                        <a
                                        href={img}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >
                                        <div className="uploaded-img">
                                            <img
                                            src={thumbnailUrl}
                                            className="img-fluid"
                                            alt={`Image ${index + 1}`}
                                            style={{ borderRadius: "10px", border: '1px solid #d1d1d1', boxShadow: '2px 2px 12px -5px #6d6d6d' }}
                                            />
                                            {/* <div className="download-icon hidden" style={{background: 'none', borderRadius: '0px', padding: '0px'}}>
                                                <a href={downloadLink} style={{padding: '7px 6px 5px 7px', background: 'white', borderRadius: '50px'}} download>
                                                    <i className="fa fa-download" />
                                                </a>
                                            </div> */}
                                            <a href="javascript:void(0)" onClick={() => onRemoveFile(img)} className="fa fa-closee file-remove" style={{color: '#fb1612', position: 'absolute', top: '-13px' ,right: '-5px', fontSize: '23px', fontFamily: 'cursive'}} >x</a>
                                        </div>
                                        </a>
                                    </div>
                                </div> :
                                <div
                                key={index}
                                // className="col-3 col-md-3 col-sm-3 col-lg-2 col-xl-2 mb-3"
                                >
                                    <div className="uploaded-box">
                                        <a
                                        href={img}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >
                                        <div className="uploaded-img" style={{ borderRadius: "10px", border: '1px solid #d1d1d1', boxShadow: '2px 2px 12px -5px #6d6d6d', background: '#ddd' }}>
                                            <span className="files-icon" style={{height: '102px', width: '102px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingTop: '15px', gap: '6px'}}>
                                                <i
                                                    className={`fa fa-file-${format.toLowerCase() === 'pdf' ? 'pdf' : 'text'}-o`}
                                                    style={{fontSize: '30px', color: '#777'}}
                                                /> {format.toUpperCase()}
                                            </span>
                                            {/* <div className="download-icon hidden" style={{background: 'none', borderRadius: '0px', padding: '0px'}}>
                                                <a href={downloadLink} style={{padding: '7px 6px 5px 7px', background: 'white', borderRadius: '50px'}} download>
                                                    <i className="fa fa-download" />
                                                </a>
                                            </div> */}
                                            <a href="javascript:void(0)" onClick={() => onRemoveFile(img)} className="fa fa-closee file-remove" style={{color: '#fb1612', position: 'absolute', top: '-14px' ,right: '-6px', fontSize: '23px', fontFamily: 'cursive'}} >x</a>
                                        </div>
                                        </a>
                                    </div>
                                </div>
                            )
                        })
                    }
                    {
                        imageLoader && 
                        <div className="uploaded-img" style={{ borderRadius: "10px", background: '#f3f3f3' }}>
                            <Spin style={{height: '102px', width: '102px', display: 'flex', justifyContent: 'center', alignItems: 'center'}} />
                        </div>
                    }
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

export default ExpenseModal