
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
import { useTranslation } from 'react-i18next';


const Payments = () => {
  const { t, i18n } = useTranslation();
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
    apiServices("GET", `invoices?${values === '' ? '' : values?.clientName === '' ? '' : values?.clientName ? `clientName=${values?.clientName}` : filterValues?.clientName ? `clientName=${filterValues?.clientName}` : ''}${values === '' ? '' : values?.invoiceNo === '' ? '' : values?.invoiceNo ? `&invoiceNo=${encodeURIComponent(values?.invoiceNo)}` : filterValues?.invoiceNo ? `&invoiceNo=${encodeURIComponent(filterValues?.invoiceNo)}` : ''}${values === '' ? '' : values?.invoiceMonth === '' ? '' : values?.invoiceMonth ? `&invoiceMonth=${values?.invoiceMonth}` : filterValues?.invoiceMonth ? `&invoiceMonth=${filterValues?.invoiceMonth}` : ''}${values === '' ? '' : values?.status === '' ? '' : values?.status ? `&status=${values?.status}` : filterValues?.status ? `&status=${filterValues?.status}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
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

    // let from_date;
    // let to_date;
    // if(values?.month){
    //   const date = values?.month ? moment(values?.month).format('YYYY-MM') : ''
    //   const [year, month] = date.split('-');
    //   from_date = moment(new Date(year, month - 1, 1)).format('YYYY-MM-DD');
    //   to_date = moment(new Date(year, month, 0)).format('YYYY-MM-DD');
    // }

    let formatted_data = {
      clientName: values?.clientName || '',
      invoiceNo: values?.invoiceNo || '',
      invoiceMonth: values?.invoiceMonth ? moment(values?.invoiceMonth).format('YYYY-MM') : '',
      status: values?.status || ''
    }

    if(formatted_data?.clientName || formatted_data?.invoiceNo || formatted_data?.invoiceMonth || formatted_data?.status){
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
      paidAmountInPreferredCurrency: values?.paidAmountInPreferredCurrency ? `${values?.paidAmountInPreferredCurrency}` : '',
      // paidAmount: values?.paidAmount ? `${values?.paidAmount}` : '',
      paymentDate: values?.paymentDate ? moment(values?.paymentDate).format('YYYY-MM-DD') : '',
      // remainingAmount: `${(+open_data?.totalAmount - values?.paidAmount)?.toFixed(2)}`
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
      isEditOpen: false,
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
        title: t('finance.payments.invoiceNumber'),
        dataIndex: 'invoiceNo',
        render: (text, record) => (
          // <Link to="/app/sales/invoices-view" style={{color: '#333333'}}>#{text}</Link>
          <Link to="/invoices/view-invoice" state={{invoice_data: record}} style={{color: '#333333'}}>{text}</Link>
          ),
      },     
      {
        title: t('finance.Invoices.client'),
        dataIndex: 'client',
        render: (text, record) => (
          <label>{text?.clientName}</label>
          ),
      },
      {
        title: 'Invoice Month',
        dataIndex: 'invoiceMonth',
        render: (text, record) => {
          if (record?.invoiceMonth) {
          // Split the 'YYYY-MM' string into year and month
          const [year, month] = text.split('-');

          // Create a new Date object for the first day of the given month
          const date = new Date(`${year}-${month}-01`);

          // Format the date to 'Month Year' (e.g., 'July 2024')
          const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

          return formattedDate;
          }
          else{
            return 'N/A'
          }
        },
      },
      {
        title: t('finance.payments.paymentType'),
        dataIndex: 'paymentType',
        render: (text, record) => (
          <label style={{marginLeft: `${text ? "" : '44px'}`}}>{text || '-'}</label>
          ),
      },
      {
        title: t('finance.payments.paidDate'),
        dataIndex: 'paymentDate',
        render: (text, record) => {
          return(
          <label style={{marginLeft: `${text ? "" : '30px'}`}}>{text ? getFormattedDate(text) : '-'}</label>
          )},
      },    
      {
        title: t('finance.payments.recievedAmount'),
        dataIndex: 'paidAmountInPreferredCurrency',
        // title: 'Paid Amount',
        // dataIndex: 'paidAmount',
        render: (text, record) => (
        <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || 0} {record?.company?.preferredCurrency}</span>
        // <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.currency}</span>
          ),
      },
      {
        title: t('finance.Invoices.status'),
        dataIndex: 'status',
        render: (text, record) => (
        <label className={text==="Paid" ? "badge bg-inverse-success" : text==="Partially Paid" ? "badge bg-inverse-info" : text==="Pending" ? "badge bg-inverse-warning" : text==="Cancelled" ? "badge bg-inverse-danger" : ''}>
          {text==="Paid" ? t('aDash.paid') : text==="Partially Paid" ? t('aDash.partiallyPaid') : text==="Pending" ? t('aDash.pending') : text==="Cancelled" ? t('aDash.cancelled') : '-'}
        </label>
          ),
      },
      {
        title: t('holiday.actions'),
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
              ><i className="fa fa-pencil m-r-5" /> {t('edit')}</a>
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
              {t('finance.payments.noPaymentsRecordFound')}
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
                <title>{t('finance.payments.payments')} - {t('header.daftarPro')}</title>
                <meta name="description" content="Login page"/>					
            </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">{t('finance.payments.payments')}</h3>
              
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
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input className='form-control' style={{height:'50px'}} placeholder={t('finance.payments.clientName')} />
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
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input className='form-control' style={{height:'50px'}} placeholder={t('finance.payments.invoiceNumber')} />
                </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-2">
            <Form.Item
              name="invoiceMonth"
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
              <DatePicker.MonthPicker
                allowClear={false}
                size='large'
                placeholder={t('finance.payments.month&year')}
                className='form-control filterDate'
                style={{minHeight: '50px', display: 'flex'}} 
                getPopupContainer={() => document.getElementById('area')}
                format="YYYY-MM"
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
                  placeholder={t('finance.payments.selectStatus')}
                  size='large'
                  getPopupContainer={() => document.getElementById('area1')}
                  options={[
                    {
                      value: 'Paid',
                      label: t('aDash.paid'),
                    },
                    {
                      value: 'Partially Paid',
                      label: t('aDash.partiallyPaid'),
                    },
                    {
                      value: 'Pending',
                      label: t('aDash.pending'),
                    },
                    {
                      value: 'Cancelled',
                      label: t('aDash.cancelled'),
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
              {t('search')} 
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
              {t('reset')} 
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
                  style = {{overflowX : 'auto'}}
                  columns={columns}                 
                  // bordered
                  dataSource={allInvoices}
                  rowKey={record => record._id}
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
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, size) => {
                          console.log(page, size);
                          setPageSize(size); setCurrentPage(page);
                          getAllInvoices(filterValues, page, size)
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
              {t('finance.payments.updateInvoicePayment')}
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
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                 }else{
                    message.error(t('allEmp.errors.fillRequiredFields'))
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
                      {t('finance.payments.paymentType')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="paymentType"
                        rules={[
                          {
                            required: true,
                            message: t('finance.payments.pleaseSelectType'),
                          },
                        ]}
                        className="custom-border"
                      >
                        <Select
                          options={[
                            {
                              value: 'Cash',
                              label: t('cash'),
                            },
                            {
                              value: 'Cheque',
                              label: t('cheque'),
                            },
                            {
                              value: 'Bank Transfer',
                              label: t('bankTransfer'),
                            },
                          ]}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                      {t('finance.payments.paidAmount')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="paidAmountInPreferredCurrency"
                        // name="paidAmount"
                        rules={[
                          {
                            // whitespace: true,
                            required: true,
                            message: t('finance.payments.pleaseEnterAmount')
                          },
                          // ({ getFieldValue }) => ({
                          //   validator: (_, value) => {
                          //     const t_amount = open?.data?.totalAmount;
                          //     if (parseFloat(value) > parseFloat(t_amount)) {
                          //       return Promise.reject(
                          //         "amount must be less than or equal to invoice total amount"
                          //       );
                          //     }
                          //     return Promise.resolve();
                          //   },
                          // }),
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
                      {t('finance.payments.paidDate')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="paymentDate"
                        rules={[
                          {
                            required: true,
                            message: t('finance.payments.pleaseSelectDate'),
                          },
                        ]}
                        className="custom-border"
                      >
                        <DatePicker className="form-control" placeholder={t('requests.addModal.selectDate')} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                      {t('finance.Invoices.status')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="status"
                        rules={[
                          {
                            required: true,
                            message: t('finance.payments.pleaseSelectStatus'),
                          },
                        ]}
                        className="custom-border"
                      >
                        <Select
                          options={[
                            {
                              value: 'Paid',
                              label: t('aDash.paid'),
                            },
                            {
                              value: 'Partially Paid',
                              label: t('aDash.partiallyPaid'),
                            },
                            {
                              value: 'Pending',
                              label: t('aDash.pending'),
                            },
                            {
                              value: 'Cancelled',
                              label: t('aDash.cancelled'),
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
                          t('submit')
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
