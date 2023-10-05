
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';

import { DatePicker, Empty, Select, Table, Form, Pagination, Button, message, Spin } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { apiServices } from '../../../Services/apiServices';
import Modal from "@mui/material/Modal";

const Invoices = () => {
  
  const moment = require('moment');

  const [form] = Form.useForm();
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
  const [open, setOpen] = useState({
    isDelOpen: false,
    data: ''
  });

  useEffect(() => {
    getAllInvoices();
  }, [])

  const getAllInvoices = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `invoices?${values === '' ? '' : values?.fromDate === '' ? '' : values?.fromDate ? `invoiceFrom=${values?.fromDate}` : filterValues?.fromDate ? `invoiceFrom=${filterValues?.fromDate}` : ''}${values === '' ? '' : values?.toDate === '' ? '' : values?.toDate ? `&invoiceTo=${values?.toDate}` : filterValues?.toDate ? `&invoiceTo=${filterValues?.toDate}` : ''}${values === '' ? '' : values?.status === '' ? '' : values?.status ? `&status=${values?.status}` : filterValues?.status ? `&status=${filterValues?.status}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
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
  }
  
  const onFilterFinish = (values) => {
    let formatted_data = {
      fromDate: values?.fromDate ? moment(values?.fromDate).format('YYYY-MM-DD') : '',
      toDate: values?.toDate ? moment(values?.toDate).format('YYYY-MM-DD') : '',
      status: values?.status ? values?.status : ''
    }
    if(formatted_data?.fromDate || formatted_data?.status){
      getAllInvoices(formatted_data, currentPage, pageSize);
      setFilterValues(formatted_data)
      // console.log(formatted_data);
    }
  }

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

const handleClose = () => {
  setOpen({
    isDelOpen: false,
    data: ''
  });
};
  
    const columns = [
      
      {
        title: '#',
        dataIndex: '',
        render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      },      
      {
        title: 'Invoice Number',
        dataIndex: 'invoiceNo',
        render: (text, record) => (
          <Link to="/invoices/view-invoice" state={{invoice_data: record}} style={{color: '#333333'}}>#{text}</Link>
          ),
      },     
      {
        title: 'Client',
        dataIndex: 'clientId',
        render: (text, record) => (
          <label>{record?.clientId?.clientName}</label>
          ),
      },

      {
        title: 'Created Date',
        dataIndex: 'invoiceDate',
        render: (text, record) => (
          <label>{formatDate(text || '')}</label>
          ),
      },
      {
        title: 'Due Date',
        dataIndex: 'dueDate',
        render: (text, record) => (
          <label>{formatDate(text || '')}</label>
          ),
      },    
      {
        title: 'Amount',
        dataIndex: 'totalAmount',
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
        title: 'Action',
        render: (text, record) => (
            <div className="dropdown dropdown-action text-end">
                <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                        <div className="dropdown-menu dropdown-menu-right">
                          <Link className="dropdown-item" to="/invoices/edit-invoice" state={{edit_invoice_data: record}}><i className="fa fa-pencil m-r-5" /> Edit</Link>
                          <Link className="dropdown-item" to="/invoices/view-invoice" state={{invoice_data: record}}><i className="fa fa-eye m-r-5" /> View</Link>
                          <a className="dropdown-item" href="#"><i className="fa fa-file-pdf-o m-r-5" /> Download</a>
                          <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isDelOpen: true, data: record }) }}><i className="fa fa-trash-o m-r-5" /> Delete</a>
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
              No Invoices Record Found!
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
    return fromInvoiceDate && current < moment(fromInvoiceDate).endOf('day');
    // return fromDate && current < moment(fromDate).startOf('day');
  };


      return (
        <>
        <div className="page-wrapper"> 
        <Helmet>
            <title>Invoices - DaftarPro</title>
            <meta name="description" content="Login page"/>					
        </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Invoices</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Invoices</li>
              </ul>
            </div>
            <div className="col-auto float-end ms-auto">
              <Link to="/invoices/create-invoice" className="btn add-btn"><i className="fa fa-plus" /> Create Invoice</Link>
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
          <div className="col-sm-6 col-md-3">  
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
                    placeholder='From'
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
          <div className="col-sm-6 col-md-3">
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
                placeholder='To'
                className='form-control filterDate'
                style={{minHeight: '50px', display: 'flex'}} 
                getPopupContainer={() => document.getElementById('area')}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </div>
          <div className="col-sm-6 col-md-3">  
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
          <div className="col-sm-6 col-md-3" style={{display: 'flex', alignItems: 'flex-start', gap: '13px'}}>  
            <button 
              href="javascript:void(0)"
              type="submit"
              className="btn btn-success btn-block w-50"
              // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
            > 
              Search 
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
              className="btn btn-success btn-block w-50 resetButton" style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}} 
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
                  // pagination= { {total : allInvoices.length,
                  //   showTotal : (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  //   showSizeChanger : true,onShowSizeChange: onShowSizeChange ,itemRender : itemRender } }
                  pagination={false}
                  style = {{overflowX : 'auto', paddingBottom: '130px'}}
                  columns={columns}                 
                  // bordered
                  dataSource={allInvoices}
                  rowKey={record => record.id}
                  // onChange={this.handleTableChange}
                />

{
                    allInvoices?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={paginationDetail?.total}
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

        </>
      
      );
   }


export default Invoices;
