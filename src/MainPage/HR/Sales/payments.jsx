
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { DatePicker, Form, Input, Pagination, Select, Table, Spin, Empty, Button, message, InputNumber } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import Offcanvas from '../../../Entryfile/offcanvance';
import { useSelector } from 'react-redux';
import Modal from "@mui/material/Modal";
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { apiServices } from '../../../Services/apiServices';


const Payments = () => {

  const nav = useNavigate();

  const moment = require('moment');
  const [form] = Form.useForm();
  const [formedit] = Form.useForm();

  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role

  const [allInvoices, setAllInvoices] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [open, setOpen] = useState({
    isEditOpen: false,
    isDelOpen: false,
    data: ''
  });

  let d = [
    {_id:1,invoiceNo:"INV-0001",client:"	Global Technologies",paymenttype:"Paypal",duedate:"11 Mar 2019",amount:"2099",status:"Paid", paymentDate: '2023-02-02'},
    {_id:2,invoiceNo:"INV-0002",client:"Delta Infotech",paymenttype:"Paypal",duedate:"11 Mar 2019",amount:"2099",status:"Cancelled"},
    {_id:3,invoiceNo:"INV-0003",client:"Delta Infotech",paymenttype:"Paypal",duedate:"11 Mar 2019",amount:"2099",status:"Partially Paid"},
    {_id:4,invoiceNo:"INV-0004",client:"Delta Infotech",paymenttype:"Paypal",duedate:"11 Mar 2019",amount:"2099",status:"Pending"},
  ]

  useEffect(() => {
    if(role === 'admin' || permissions?.managePayrolls) {
      getAllInvoices();
    }else{
      nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
  }, [])

  const getAllInvoices = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `invoices?${values === '' ? '' : values?.clientName === '' ? '' : values?.clientName ? `clientName=${values?.clientName}` : filterValues?.clientName ? `clientName=${filterValues?.clientName}` : ''}${values === '' ? '' : values?.invoiceNo === '' ? '' : values?.invoiceNo ? `&invoiceNo=${encodeURIComponent(values?.invoiceNo)}` : filterValues?.invoiceNo ? `&invoiceNo=${encodeURIComponent(filterValues?.invoiceNo)}` : ''}${values === '' ? '' : values?.fromDate === '' ? '' : values?.fromDate ? `&invoiceFrom=${values?.fromDate}` : filterValues?.fromDate ? `&invoiceFrom=${filterValues?.fromDate}` : ''}${values === '' ? '' : values?.toDate === '' ? '' : values?.toDate ? `&invoiceTo=${values?.toDate}` : filterValues?.toDate ? `&invoiceTo=${filterValues?.toDate}` : ''}${values === '' ? '' : values?.status === '' ? '' : values?.status ? `&status=${values?.status}` : filterValues?.status ? `&status=${filterValues?.status}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllInvoices(res?.data?.Invoices?.docs);
          setPaginationDetail(res?.data?.Invoices)
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
              : "Get All Invoices Error"
          }!`
        );
      });

    // setAllInvoices(d)
    // setPaginationDetail(d?.length)
    // setTableLoader(false)
  }

  const onFilterFinish = (values) => {

    let from_date;
    let to_date;
    if(values?.month){
      const date = values?.month ? moment(values?.month).format('YYYY-MM') : ''
      const [year, month] = date.split('-');
      from_date = moment(new Date(year, month - 1, 1)).format('YYYY-MM-DD');
      to_date = moment(new Date(year, month, 0)).format('YYYY-MM-DD');
    }

    let formatted_data = {
      clientName: values?.clientName || '',
      invoiceNo: values?.invoiceNo || '',
      fromDate: from_date || '',
      toDate: to_date || '',
      status: values?.status || ''
    }

    if(formatted_data?.clientName || formatted_data?.invoiceNo || formatted_data?.fromDate || formatted_data?.status){
      // getAllInvoices(formatted_data, currentPage, pageSize);
      getAllInvoices(formatted_data, 1, pageSize);
      setFilterValues(formatted_data);
      setCurrentPage(1);
      // console.log(formatted_data);
    }
  }

  const onFinishUpdate = (values, open_data) => {
    let formatted_data = {
      ...values,
      _id: open_data?._id,
      paidAmount: values?.paidAmount ? `${values?.paidAmount}` : '',
      paymentDate: values?.paymentDate ? moment(values?.paymentDate).format('YYYY-MM-DD') : '',
      remainingAmount: `${(+open_data?.totalAmount - values?.paidAmount)?.toFixed(2)}`
    }
    console.log(formatted_data);

    setLoader(true)
    apiServices("PUT", "invoices", formatted_data, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setAllInvoices(
          allInvoices.map((invoice) => {
            if (invoice._id === open_data._id) {
              return {
                ...invoice,
                ...formatted_data,
              };
            } else {
              return {
                ...invoice,
              };
            }
          })
        );
        handleClose();
        message.success("Invoice Updated Successfully!");
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
            : "Update Invoice Error"
        }`
      );
    });
  }

  const handleClose = () => {
    setOpen({
      isDeditOpen: false,
      isDelOpen: false,
      data: ''
    });
    formedit.resetFields();
  };

  const onHandleDelete = (id) => {
    setDeleteLoader(true);
    apiServices("DELETE", "invoices", id, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          getAllInvoices(filterValues,currentPage, pageSize);
          handleClose();
          message.success("Invoice Deleted Successfully!");
          setDeleteLoader(false);
        }
      })
      .catch((err) => {
        setDeleteLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Delete Invoice Error"
          }`
        );
      });

    // console.log(id);
    // message.success('Invoice Deleted Successfully!');
    // handleClose()
  }
  
    const columns = [         
      {
        title: 'Invoice Number',
        dataIndex: 'invoiceNo',
        render: (text, record) => (
          // <Link to="/app/sales/invoices-view" style={{color: '#333333'}}>#{text}</Link>
          <Link to="/invoices/view-invoice" state={{invoice_data: record}} style={{color: '#333333'}}>{text}</Link>
          ),
      },     
      {
        title: 'Client',
        dataIndex: 'client',
        render: (text, record) => (
          <label>{text?.clientName}</label>
          ),
      },

      {
        title: 'Payment Type',
        dataIndex: 'paymentType',
        render: (text, record) => (
          <label style={{marginLeft: `${text ? "" : '44px'}`}}>{text || '-'}</label>
          ),
      },
      {
        title: 'Paid Date',
        dataIndex: 'paymentDate',
        render: (text, record) => {
          return(
          <label style={{marginLeft: `${text ? "" : '30px'}`}}>{text ? getFormattedDate(text) : '-'}</label>
          )},
      },    
      {
        title: 'Paid Amount',
        dataIndex: 'paidAmount',
        render: (text, record) => (
        <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.currency}</span>
          ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render: (text, record) => (
        <label className={text==="Paid" ? "badge bg-inverse-success" : text==="Partially Paid" ? "badge bg-inverse-info" : text==="Pending" ? "badge bg-inverse-warning" : text==="Cancelled" ? "badge bg-inverse-danger" : ''}>
          {text || '-'}
        </label>
          ),
      },
      {
        title: 'Actions',
        render: (text, record) => (
          <div className="dropdown dropdown-action text-end">
            <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
            <div className="dropdown-menu dropdown-menu-right">
              <a href="javascript:void(0)"
                onClick={() => {
                setOpen({ isEditOpen: true, isDelOpen: false, data: record });
                formedit.setFieldsValue({
                  ...record,
                  paymentDate: record?.paymentDate ? moment(record?.paymentDate, 'YYYY-MM-DD') : '',
                });
                }}
                className="dropdown-item"
              ><i className="fa fa-pencil m-r-5" /> Edit</a>
              {/* <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isEditOpen: false, isDelOpen: true, data: record }) }}><i className="fa fa-trash-o m-r-5" /> Delete</a> */}
            </div>
          </div>
        ),
      }
    ]

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
              {/* {
                (role === 'admin' || permissions?.viewAllUsers) ? 'No Employee Record found!' : 'You are Restricted to View Employees'
              } */}
              No Payments Record Found!
            </div>
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

  const getFormattedDate = (inputDate) => {
    const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      const formattedDate = `${day} ${month} ${year}`;
      return formattedDate;
  }

      return (
        <>
        <div className="page-wrapper">
            <Helmet>
                <title>Payments - DaftarPro</title>
                <meta name="description" content="Login page"/>					
            </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Payments</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Payments</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {/* /Search Filter */}
        <Form
          form={form}
          onFinish={onFilterFinish}
          autoComplete='off'
        >
        <div className="row filter-row">
          <div className="col-sm-6 col-md-2">  
            <div className=' form-groupfilterDateMonth' style={{ position: 'relative' }} id='area'>
                <Form.Item
                  name="clientName"
                  className="custom-border"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input className='form-control' style={{height:'50px'}} placeholder='Client Name' />
                </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-2">  
            <div className=' form-groupfilterDateMonth' style={{ position: 'relative' }} id='area'>
              <Form.Item
                  name="invoiceNo"
                  className="custom-border"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (/\s{2,}/.test(value)) {
                          return Promise.reject("please remove consecutive spaces");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input className='form-control' style={{height:'50px'}} placeholder='Invoice No' />
                </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-2">
            <Form.Item
              name="month"
              className="custom-border"
              // rules={[
              //   ({ getFieldValue }) => ({
              //     validator(rule, value) {
              //       if ( !value && getFieldValue("fromDate")) {
              //         return Promise.reject(
              //           "please select date"
              //           );
              //         }
              //       return Promise.resolve();
              //     },
              //   }),
              // ]}
            >
              <DatePicker 
                allowClear={false}
                size='large'
                placeholder='Month & Year'
                className='form-control filterDate'
                style={{minHeight: '50px', display: 'flex'}} 
                getPopupContainer={() => document.getElementById('area')}
                format="MM-YYYY"
                picker='month'
              />
            </Form.Item>
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
                  placeholder='Select Status'
                  size='large'
                  getPopupContainer={() => document.getElementById('area1')}
                  options={[
                    {
                      value: 'Paid',
                      label: "Paid",
                    },
                    {
                      value: 'Partially Paid',
                      label: "Partially Paid",
                    },
                    {
                      value: 'Pending',
                      label: "Pending",
                    },
                    {
                      value: 'Cancelled',
                      label: "Cancelled",
                    },
                  ]}
                >
                  {/* {
                    allDesignations?.map((item, index) => {
                    return (
                        <Option key={index} value={item?._id}>{item?.designationName}</Option>
                    )
                    })
                  } */}
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-2">  
            <button 
              href="javascript:void(0)"
              type="submit"
              className="btn btn-success btn-block w-50"
              // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
              style={{minWidth: '100%', marginBottom: '24px'}}
            > 
              Search 
            </button>
          </div>
          <div className="col-sm-6 col-md-2">  
            <button
              href="javascript:void(0)" type="reset"
              onClick={() => {
                form.resetFields();
                getAllInvoices('', 1, pageSize);
                setFilterValues(null);
                setCurrentPage(1)
              }}
              className="btn btn-success btn-block w-50 resetButton" style={{minWidth: '100%', marginBottom: '24px', backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}} 
              // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
            >
              Reset 
            </button>  
          </div>
        </div>
        </Form>
        {/* /Search Filter */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">	
               <Table
                  loading={tableLoader}
                  className={allInvoices?.length > 0 ? "table-striped" : ""}
                  locale={{
                    emptyText: tableLoader ? null : customEmptyText,
                  }}
                  pagination= {false}
                  style = {{overflowX : 'auto', paddingBottom: '70px'}}
                  columns={columns}                 
                  // bordered
                  dataSource={allInvoices}
                  rowKey={record => record._id}
                  // onChange={this.handleTableChange}
                />

                  {
                    allInvoices?.length > 0 &&
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
                          console.log(page, size);
                          setPageSize(size); setCurrentPage(page);
                          getAllInvoices(filterValues, page, size)
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
    </div>
    {/* Edit modall */}
      <Modal
        open={open.isEditOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
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
                Update Invoice Payment
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={formedit}
                name="control-hooks"
                onFinish={(val) => onFinishUpdate(val, open?.data)}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
                initialValues={{
                  // title: open?.data ? open?.data?.title : "",
                  // maxStartTime: open?.data
                  //   ? moment(open?.data?.maxStartTime, timeFormat)
                  //   : "",
                  // startTime: open?.data
                  //   ? moment(open?.data?.startTime, timeFormat)
                  //   : "",
                  // endTime: open?.data
                  //   ? moment(open?.data?.endTime, timeFormat)
                  //   : "",
                  // isActive: open?.data ? open?.data?.isActive : "",
                }}
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Payment Type <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="paymentType"
                        rules={[
                          {
                            required: true,
                            message: "please select type",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Select
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
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Paid Amount <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="paidAmount"
                        rules={[
                          {
                            // whitespace: true,
                            required: true,
                            message: 'please enter amount'
                          },
                          ({ getFieldValue }) => ({
                            validator: (_, value) => {
                              const t_amount = open?.data?.totalAmount;
                              if (parseFloat(value) > parseFloat(t_amount)) {
                                return Promise.reject(
                                  "amount must be less than or equal to invoice total amount"
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
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
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Paid Date <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="paymentDate"
                        rules={[
                          {
                            required: true,
                            message: "please select date",
                          },
                        ]}
                        className="custom-border"
                      >
                        <DatePicker className="form-control" />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Status <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="status"
                        rules={[
                          {
                            required: true,
                            message: "please select status",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Select
                          options={[
                            {
                              value: 'Paid',
                              label: "Paid",
                            },
                            {
                              value: 'Partially Paid',
                              label: "Partially Paid",
                            },
                            {
                              value: 'Pending',
                              label: "Pending",
                            },
                            {
                              value: 'Cancelled',
                              label: "Cancelled",
                            },
                          ]}
                        />
                      </Form.Item>
                    </div>
                  </div>
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
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    {/* Edit modall */}

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
              <h3 style={{ marginBottom: "30px" }}>Delete Invoice</h3>
              <p>
                Are you sure you want to delete <b>{open?.data?.invoiceNo}</b>?
              </p>
            </div>
            <div className="modal-btn delete-action">
              <div className="row">
                <div className="col-6">
                  <Button
                    htmlType="submit"
                    className="btn btn-primary continue-btn"
                    onClick={() => onHandleDelete(open?.data?._id)}
                    disabled={deleteLoader}
                    style={{ width: "100%" }}
                  >
                    {deleteLoader ? (
                      <Spin size="small" indicator={antIcon} />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
                <div className="col-6">
                  <Button
                    onClick={handleClose}
                    className="btn btn-primary submit-btn"
                    style={{ width: "100%" }}
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
    {/* delete modall */}
    {/* <Offcanvas/> */}
        </> 
        
      );
   
}

export default Payments;
