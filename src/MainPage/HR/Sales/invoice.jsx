
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';

import { DatePicker, Empty, Select, Table, Form, Pagination } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";

const Invoices = () => {
  
  const moment = require('moment');

  const [form] = Form.useForm();
  const nav = useNavigate();

  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);
  const role = user_state?.user?.role

  const [allInvoices, setAllInvoices] = useState([]);
  const [tableLoader, setTableLoader] = useState(true)
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();


  let d = [
    {id:1,invoicenumber:"INV-0001",client:"	Global Technologies",createddate:"11 Mar 2019",duedate:"11 Mar 2019",amount:"2099",status:"Paid"},
    {id:2,invoicenumber:"INV-0002",client:"Delta Infotech",createddate:"11 Mar 2019",duedate:"11 Mar 2019",amount:"2099",status:"Sent"},
  ]

  useEffect(() => {
    getAllInvoices();
  }, [])

  const getAllInvoices = () => {
    setAllInvoices(d)
    setPaginationDetail({total: d.length})
    setTableLoader(false)
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
      console.log(formatted_data);
    }
  }  
  
    const columns = [
      
      {
        title: '#',
        dataIndex: 'id',
      },      
      {
        title: 'Invoice Number',
        dataIndex: 'invoicenumber',
        render: (text, record) => (
          <Link to="/app/sales/invoices-view">#{text}</Link>
          ),
      },     
      {
        title: 'Client',
        dataIndex: 'client',
      },

      {
        title: 'Created Date',
        dataIndex: 'createddate',
      },
      {
        title: 'Due Date',
        dataIndex: 'duedate',
      },    
      {
        title: 'Amount',
        dataIndex: 'amount',
        render: (text, record) => (
        <span>$ {text}</span>
          ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render: (text, record) => (
        <span className={text==="Paid" ? "badge bg-inverse-success" : "badge bg-inverse-info"}>{text}</span>
          ),
      },
      {
        title: 'Action',
        render: (text, record) => (
            <div className="dropdown dropdown-action text-end">
                <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                        <div className="dropdown-menu dropdown-menu-right">
                          <Link className="dropdown-item" to="/app/sales/invoices-edit"><i className="fa fa-pencil m-r-5" /> Edit</Link>
                          <Link className="dropdown-item" to="/app/sales/invoices-view"><i className="fa fa-eye m-r-5" /> View</Link>
                          <a className="dropdown-item" href="#"><i className="fa fa-file-pdf-o m-r-5" /> Download</a>
                          <a className="dropdown-item" href="#"><i className="fa fa-trash-o m-r-5" /> Delete</a>
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
              <Link to="/app/sales/invoices-create" className="btn add-btn"><i className="fa fa-plus" /> Create Invoice</Link>
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
                        value: 'paid',
                        label: "Paid",
                    },
                    {
                        value: 'unpaid',
                        label: "Unpaid",
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
                // getAllInvoices('', 1, pageSize);
                // setFilterValues(null);
                // setCurrentPage(1)
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
                  style = {{overflowX : 'auto'}}
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
                          // getAllClients(filterValues, page, size)
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
        </>
      
      );
   }


export default Invoices;
