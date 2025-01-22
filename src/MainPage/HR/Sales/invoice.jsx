import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';

import { DatePicker, Empty, Select, Table, Form, Pagination, Button, message, Spin, Input, Tag } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { apiServices } from '../../../Services/apiServices';
import Modal from "@mui/material/Modal";
import invoicePDF from './invoicePDF';
import { useTranslation } from 'react-i18next';

const Invoices = () => {
  const { t, i18n } = useTranslation();
  const moment = require('moment');

  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const nav = useNavigate();

  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);
  const role = user_state?.user?.role

  const [allInvoices, setAllInvoices] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [fromInvoiceDate, setFromInvoiceDate] = useState('');
  const [allProjects, setAllProjects] = useState([]);
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: ''
  });

  useEffect(() => {
    if(role === 'admin' || permissions?.managePayrolls) {
      getAllInvoices();
    }else{
      nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
  }, [])

  const getAllInvoices = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `invoices?${values === '' ? '' : values?.clientName === '' ? '' : values?.clientName ? `clientName=${values?.clientName}` : filterValues?.clientName ? `clientName=${filterValues?.clientName}` : ''}${values === '' ? '' : values?.fromDate === '' ? '' : values?.fromDate ? `&invoiceFrom=${values?.fromDate}` : filterValues?.fromDate ? `&invoiceFrom=${filterValues?.fromDate}` : ''}${values === '' ? '' : values?.toDate === '' ? '' : values?.toDate ? `&invoiceTo=${values?.toDate}` : filterValues?.toDate ? `&invoiceTo=${filterValues?.toDate}` : ''}${values === '' ? '' : values?.invoiceMonth === '' ? '' : values?.invoiceMonth ? `&invoiceMonth=${values?.invoiceMonth}` : filterValues?.invoiceMonth ? `&invoiceMonth=${filterValues?.invoiceMonth}` : ''}${values === '' ? '' : values?.status === '' ? '' : values?.status ? `&status=${values?.status}` : filterValues?.status ? `&status=${filterValues?.status}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
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
              : t('aDash.errors.getAllInvoicesError')
          }!`
        );
      });
  }

  const getAllProjects = () => {
    apiServices("GET", `project-management?status=On-Going&costTypeInvoice=Both&page=${1}&limit=${99999}` , null, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
                const sortedData = res?.data?.projects?.docs?.slice().sort((a, b) => a.projectName.localeCompare(b.projectName));
              setAllProjects(sortedData);
            }
          })
          .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('projectScreen.errors.getEmployeeProjectsError')
          }!`
        );
      });
  }
  
  const onFilterFinish = (values) => {
    console.log(values)
    let formatted_data = {
      clientName: values?.clientName ? values?.clientName : '',
      fromDate: values?.fromDate ? moment(values?.fromDate).format('YYYY-MM-DD') : '',
      toDate: values?.toDate ? moment(values?.toDate).format('YYYY-MM-DD') : '',
      invoiceMonth: values?.invoiceMonth ? moment(values?.invoiceMonth).format('YYYY-MM') : '',
      status: values?.status ? values?.status : ''
    }
    if(formatted_data?.clientName || formatted_data?.fromDate || formatted_data?.invoiceMonth ||formatted_data?.status){
      // getAllInvoices(formatted_data, currentPage, pageSize);
      getAllInvoices(formatted_data, 1, pageSize);
      setFilterValues(formatted_data);
      setCurrentPage(1);
      // console.log(formatted_data);
    }
  }

  const onHandleDelete = (data) => {
    setDeleteLoader(true);
    apiServices("DELETE", "invoices", data , user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          getAllInvoices(filterValues,currentPage, pageSize);
          handleClose();
          message.success(t('finance.Invoices.invoiceDeletedSuccess'));
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
              : t('finance.Invoices.deleteInvoiceError')
          }`
        );
      });
  };

  const formatDate = (inputDate) => {
    if(inputDate){
      const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
  
      // let daySuffix = "th";
      // if (day === 1 || day === 21 || day === 31) {
      //     daySuffix = "st";
      // } else if (day === 2 || day === 22) {
      //     daySuffix = "nd";
      // } else if (day === 3 || day === 23) {
      //     daySuffix = "rd";
      // }
  
      // const formattedDate = `${day}${daySuffix} ${month}, ${year}`;
      const formattedDate = `${day} ${month} ${year}`;
      return formattedDate;
    }
}

const searchHandler = (val, type) => {
  let dropdownValues = []
  if (type === 'project'){
    allProjects.forEach((proj)=>{
      dropdownValues.push(proj.projectName.toLowerCase())
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

const handleClose = () => {
  setOpen({
    isAddOpen: false,
    isDelOpen: false,
    data: ''
  });
  form2.resetFields();
};

const onFinish = (values) => {
  const project = allProjects?.find(proj => proj._id === values?.projectId);
    //setSelectedProject(project);
    console.log('Selected Project:', project);
    nav('/invoices/create-invoice', { state: { project_data: project } });
};
  
    const columns = [
      
      {
        title: '#',
        dataIndex: '',
        render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      },      
      {
        title: t('finance.Invoices.invoicenumber'),
        dataIndex: 'invoiceNo',
        fixed: 'left',
        render: (text, record) => (
          <Link to="/invoices/view-invoice" state={{invoice_data: record}} style={{color: '#333333'}}>{text}</Link>
          ),
      },     
      {
        title: t('aDash.client'),
        dataIndex: 'clientId',
        render: (text, record) => (
          // <label>{record?.clientId?.clientName}</label>
          <label>{record?.client?.clientName}</label>
          ),
      },

      {
        title: t('finance.Invoices.invoicedate'),
        dataIndex: 'invoiceDate',
        render: (text, record) => (
          <label>{formatDate(text || '')}</label>
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
      // {
      //   title: "Invoice Start Date",
      //   dataIndex: 'invoiceStartDate',
      //   render: (text, record) => (
      //     <label>{formatDate(text || '')}</label>
      //     ),
      // },
      // {
      //   title: 'Invoice End Date',
      //   dataIndex: 'invoiceEndDate',
      //   render: (text, record) => (
      //     <label>{formatDate(text || '')}</label>
      //     ),
      // },
      {
        title: t('finance.Invoices.duedate'),
        dataIndex: 'dueDate',
        render: (text, record) => (
          <label>{formatDate(text || '')}</label>
          ),
      },    
      {
        title: t('finance.Invoices.amount'),
        dataIndex: 'totalAmount',
        render: (text, record) => (
          <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.currency}</span>
          ),
      },
      {
        title: t('finance.Invoices.convertedamount'),
        dataIndex: 'convertedAmount',
        render: (text, record) => (
          <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.company?.preferredCurrency}</span>
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
        title: t('allEmp.action'),
        render: (text, record) => (
            <div className="dropdown dropdown-action text-end">
                <a href="javascript:void(0)" style={{minWidth: '60px'}} className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                        <div className="dropdown-menu dropdown-menu-right">
                          <Link className="dropdown-item" to="/invoices/edit-invoice" state={{edit_invoice_data: record}}><i className="fa fa-pencil m-r-5" /> {t('edit')}</Link>
                          <Link className="dropdown-item" to="/invoices/view-invoice" state={{invoice_data: record}}><i className="fa fa-eye m-r-5" /> {t('view')}</Link>
                          <a className="dropdown-item" href="javascript:void(0)" onClick={() => { invoicePDF(record); }}><i className="fa fa-file-pdf-o m-r-5" /> {t('finance.Invoices.download')}</a>
                          <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isDelOpen: true, data: record }) }}><i className="fa fa-trash-o m-r-5" /> {t('delete')}</a>
                        </div>
            </div>
          ),
      },
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
              {t('finance.Invoices.noInvoicesFound')}
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

  const handleFromDateChange = (date) => {
    setFromInvoiceDate(date);
  };
  const disabledDate = (current) => {
    // return fromInvoiceDate && current < moment(fromInvoiceDate).endOf('day');
    return fromInvoiceDate && current < moment(fromInvoiceDate).startOf('day');
  };


      return (
        <>
        <div className="page-wrapper"> 
        <Helmet>
            <title>{t('finance.Invoices.invoices')} - {t('header.daftarPro')}</title>
            <meta name="description" content="Login page"/>					
        </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">{t('finance.Invoices.invoices')}</h3>
              
            </div>
            <div className="col-auto float-end ms-auto">
              <Link to="/invoices/create-invoice" className="btn add-btn"><i className="fa fa-plus" /> {t('finance.Invoices.createinvoice')}</Link>
              <a className="btn add-btn" style={{marginRight:'5px'}} onClick={()=>{ getAllProjects(); setOpen({ isAddOpen: true, data: '' }) }}><i className="fa fa-file-text" /> Generate Invoice</a>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {/* Search Filter */}
        {/* <div className="row filter-row">
          <div className="col-sm-6 col-md-3">  
            <div className="form-group form-focus select-focus">
              <div>
                <input className="form-control floating datetimepicker" type="date" />
              </div>
              <label className="focus-label">From</label>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">  
            <div className="form-group form-focus select-focus">
              <div>
                <input className="form-control floating datetimepicker" type="date" />
              </div>
              <label className="focus-label">To</label>
            </div>
          </div>
          <div className="col-sm-6 col-md-3"> 
            <div className="form-group form-focus select-focus">
              <select className="select floating"> 
                <option>Select Status</option>
                <option>Pending</option>
                <option>Paid</option>
                <option>Partially Paid</option>
              </select>
              <label className="focus-label">Status</label>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">  
            <a href="#" className="btn btn-success btn-block w-100"> Search </a>  
          </div>     
        </div> */}
        <Form
          form={form}
          onFinish={onFilterFinish}
          autoComplete='off'
        >
        <div className="row filter-row">
          <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">    
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
                  <Input className='form-control' style={{height:'50px'}} placeholder={t('finance.Invoices.clientName')} />
                </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">    
            <div className=' form-groupfilterDateMonth' style={{ position: 'relative' }} id='area'>
                <Form.Item
                  name="fromDate"
                  className="custom-border"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if ( !value && getFieldValue("toDate")) {
                          return Promise.reject(
                            "please select date"
                            );
                          }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker 
                    allowClear={false}
                    size='large'
                    placeholder={t('finance.Invoices.from')}
                    className='form-control filterDate'
                    style={{minHeight: '50px', display: 'flex'}} 
                    getPopupContainer={() => document.getElementById('area')}
                    onChange={e => {
                      handleFromDateChange(e);
                      if(e === null || e){
                        form.setFieldsValue({ toDate: '' });
                      }}}
                  />
                </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">  
            <Form.Item
              name="toDate"
              className="custom-border"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if ( !value && getFieldValue("fromDate")) {
                      return Promise.reject(
                        "please select date"
                        );
                      }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker 
                allowClear={false}
                size='large'
                placeholder={t('finance.Invoices.to')}
                className='form-control filterDate'
                style={{minHeight: '50px', display: 'flex'}} 
                getPopupContainer={() => document.getElementById('area')}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">    
            <Form.Item 
              name="invoiceMonth"
              className="custom-border"
            >
              <DatePicker.MonthPicker
                style={{minHeight: '50px', display: 'flex'}} 
                className="form-control filterDate"
                placeholder={t('aAttend.selectMonth')}
                size="large"
                allowClear={false}
                format="YYYY-MM"
                getPopupContainer={() => document.getElementById('area')}
              />
            </Form.Item>
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
          <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "2px",
            }}
          > 
            <button 
                href="javascript:void(0)"
                type="submit"
                className="btn btn-success btn-block w-100"
                // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
                style={{marginBottom: '24px'}}
              > 
              {t('search')} 
            </button>   
            <button
              href="javascript:void(0)" type="reset"
              onClick={() => {
                form.resetFields();
                getAllInvoices('', 1, pageSize);
                setFilterValues(null);
                setCurrentPage(1)
                setFromInvoiceDate('')
              }}
              className="btn btn-success btn-block w-50 resetButton" style={{marginBottom: '24px', backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}} 
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
            <div className="table-responsive invoiceTable">
               <Table
                  loading={tableLoader}
                  className={allInvoices?.length > 0 ? "table-striped" : ""}
                  locale={{
                    emptyText: tableLoader ? null : customEmptyText,
                  }}
                  // pagination= { {total : allInvoices.length,
                  //   showTotal : (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  //   showSizeChanger : true,onShowSizeChange: onShowSizeChange ,itemRender : itemRender } }
                  pagination={false}
                  style = {{overflowX : 'auto'}}
                  columns={columns}                 
                  // bordered
                  dataSource={allInvoices}
                  rowKey={record => record.id}
                  // onChange={this.handleTableChange}
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

    <Modal
        open={open.isAddOpen}
        onClose={handleClose}
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
                Select Project
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form2}
                name="control-hooks"
                onFinish={(val) => onFinish(val)}
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
              >
                <div className="form-group">
                  <label>
                  Project <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="projectId"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        message: t('Tasks.pleaseselectproject'),
                    },
                    ]}
                    className="custom-border"
                  >
                    <Select
                    labelInValue
                    optionLabelProp="label"
                    showSearch
                    onSearch={(val) => {
                      searchHandler(val, 'project')
                    }}
                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    optionFilterProp="children"
                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                      </>
                    )}
                    className="custom-select searchCenter"
                    style={{
                      width: '100%',
                    }}
                    placeholder={t('Tasks.selectproject')}
                    size='large'
                    getPopupContainer={() => document.getElementById('area')}
                    onChange={(value, option) => {
                      //console.log(value.value)
                      form2.setFieldsValue({
                        projectId: value.value,
                      });
                    }}
                  >
                    {
                      allProjects?.map((proj, index) => {
                      return (
                          <Option key={index} value={proj._id} label={proj?.projectName}>
                            {proj?.projectName}
                            {
                            <Tag color={proj?.costType === "Monthly" ? "blue" : "purple"} style={{ float: "right" }}>
                              {proj?.costType}
                            </Tag>
                            }
                            </Option>
                      )
                      })
                    }
                  </Select>
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
                          : 'Proceed'
                      }
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>

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
                <h3 style={{ marginBottom: "30px" }}>{t('finance.Invoices.deleteInvoice')}</h3>
                <p>
                <span dangerouslySetInnerHTML={{ __html: t('projectScreen.confirmDeleteProject', { project: open?.data?.invoiceNo }) }} />
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleDelete(open?.data)}
                      disabled={deleteLoader}
                      style={{ width: "100%" }}
                    >
                      {deleteLoader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        t('delete')
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

        </>
      
      );
   }


export default Invoices;
