
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Table, Select, DatePicker, message, Button, Spin, Empty, Pagination } from 'antd';
import Modal from "@mui/material/Modal";
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import { Avatar_02,Avatar_05,Avatar_11, Avatar_12,Avatar_09,Avatar_10, Avatar_13, user_icon } from "../../../Entryfile/imagepath"
import Sidebar from '../../../initialpage/Sidebar/sidebar';
import favicon from '../../../files/Icons/DaftarProIcon.svg';
import { useSelector } from 'react-redux';
import { apiServices } from '../../../Services/apiServices';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import GenerateSalaryPDF from './GenerateSalaryPDF';
import { useTranslation } from 'react-i18next';

const SalarySlip = () => {
  const { t, i18n } = useTranslation();
  const moment = require('moment');
  const [form] = Form.useForm();
  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const company_id = user_state?.user?.companyId
  const role = user_state?.user?.role

  const [tableLoader, setTableLoader] = useState(false);
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();


  const [data, setData] = useState();

  useEffect(() => {
    if(permissions?.viewSelfPayrolls) {
      getEmployeeSalary();
    }else{
      nav('/restricted', { state: { unAuthorize: true}})
    }
  }, [])

  const getEmployeeSalary = (values, current_page, page_size) => {
    setTableLoader(true);
    // apiServices("GET", `user/view-user?deleted=false${values === '' ? '' : values?.employeeName === '' ? '' : values?.employeeName ? `&employeeName=${values?.employeeName}` : filterValues?.employeeName ? `&employeeName=${filterValues?.employeeName}` : ''}${values === '' ? '' : values?.employeeId === '' ? '' : values?.employeeId ? `&employeeId=${values?.employeeId}` : filterValues?.employeeId ? `&employeeId=${filterValues?.employeeId}` : ''}${values === '' ? '' : values?.designation === '' ? '' : values?.designation ? `&designation=${values?.designation}` : filterValues?.designation ? `&designation=${filterValues?.designation}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
    apiServices("GET", `payrolls/employee-payroll?${values === '' ? '' : values?.payMonth === '' ? '' : values?.payMonth ? `payMonth=${values?.payMonth}` : filterValues?.payMonth ? `payMonth=${filterValues?.payMonth}` : ''}${values === '' ? '' : values?.payYear === '' ? '' : values?.payYear ? `&payYear=${values?.payYear}` : filterValues?.payYear ? `&payYear=${filterValues?.payYear}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setData(res?.data?.payrolls?.docs)
          setPaginationDetail(res?.data?.payrolls)
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
              : "Get All Employees Error"
          }!`
        );
      });
  }

  const [menu, setMenu] = useState(false)

	const toggleMobileMenu = () => {
		setMenu(!menu)
	  }

        useEffect( ()=>{
          if($('.select').length > 0) {
            $('.select').select2({
              minimumResultsForSearch: -1,
              width: '100%'
            });
          }
        });
        
        const columns = [
            {
              title: "Month",
              dataIndex: "payMonth",
              width:300
              // width:210
            },
            {
              title: "Year",
              dataIndex: "payYear",
              width:300
              // width:200
            },
            {
              title: "Date Of Issue",
              dataIndex: "createdAt",
              width:300,
              render: (text,record) => {
                const date = new Date(text);
                const monthNames = [
                  "January", "February", "March",
                  "April", "May", "June",
                  "July", "August", "September",
                  "October", "November", "December"
                ];
                const year = date.getFullYear();
                const month = monthNames[date.getMonth()];
                const day = date.getDate();
                const formattedDate = `${month} ${day}, ${year}`;
                return formattedDate;
              }
            },
            {
              title: "Credit Salary",
              dataIndex: "creditSalary",
              width:300,
              render: (text,record) => {
                return (
                  <label>
                    {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </label>
                );
              }
            },
            {
              title: "Actions",
              width:76,
              render: (text, record) => (
                <div className="dropdown dropdown-action text-end">
                  <a
                    href="javascript:void(0)"
                    className="action-icon dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="material-icons">more_vert</i>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right">
                    <a
                      className="dropdown-item"
                      href="javascript:void(0)"
                      onClick={() => {
                        GenerateSalaryPDF(record, true, 'slip', false)
                      }}
                    >
                      <i className="fa fa-eye m-r-5" /> View
                    </a>
                    {/* <a
                      className="dropdown-item"
                      href="javascript:void(0)"
                      onClick={() => GeneratePDF(record, null, true)}
                    >
                      <i className="fa fa-print m-r-5" /> Print
                    </a> */}
                    <a
                      className="dropdown-item"
                      href="javascript:void(0)"
                      onClick={() => {
                        GenerateSalaryPDF(record, false, 'slip', false)
                      }}
                    >
                      <i className="fa fa-download m-r-5" /> Download
                    </a>
                  </div>
                </div>
              ),
            },
          ];


          const onFilterFinish = (values) => {
            const formatted_data = {
              payMonth: values?.month ? moment(values?.month).format('MMMM') : '',
              payYear: values?.year ? moment(values?.year).format('YYYY') : '',
            }
            if(formatted_data?.payYear || formatted_data?.payMonth){
              getEmployeeSalary(formatted_data, 1, pageSize);
              setFilterValues(formatted_data);
              setCurrentPage(1);
            }
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
                    No Record Found!
                  </div>
                </div>
              }
            />
          );


      return ( 
        <>
        <div className={`main-wrapper ${menu ? 'slide-nav': ''}`}> 
           <div className="page-wrapper">
              <Helmet>
                  <title>Payslip - DaftarPro</title>
                  <meta name="description" content="Login page"/>
                  <link rel="icon" type="image/x-icon" href={favicon} />				
              </Helmet>
           {/* Page Content */}
           <div className="content container-fluid">
             {/* Page Header */}
             <div className="page-header">
               <div className="row align-items-center">
                 <div className="col">
                   <h3 className="page-title">Payslip</h3>
                   <ul className="breadcrumb">
                     <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                     <li className="breadcrumb-item active">Payslip</li>
                   </ul>
                 </div>
               </div>
             </div>
             {/* /Page Header */}
             {/* Search Filter */}
              <Form
                form={form}
                onFinish={onFilterFinish}
              >
              <div className="row filter-row">
                {/* <div className="col-sm-6 col-md-3">  
                  <div className="form-group">
                  <Form.Item
                      name="employeeName"
                      className="custom-border"
                    >
                    <Input
                      className="form-control"
                      style={{height:'50px'}}
                      placeholder='Employee Name'
                    />
                    </Form.Item>
                  </div>
                </div> */}
                <div className="col-sm-6 col-md-4">
                <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                    <Form.Item
                      name="month"
                      className="custom-border"
                      // rules={[
                      //   {
                      //     whitespace: true,
                      //     required: true,
                      //     message: "please select month",
                      //   },
                      // ]}
                    >
                      <DatePicker format="MMMM" allowClear={false} size='large' picker="month" placeholder='Select Month' className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area')} />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-4">
                <div style={{ position: 'relative' }} id='area1'>
                    <Form.Item
                      name="year"
                      className="custom-border"
                      // rules={[
                      //   {
                      //     whitespace: true,
                      //     required: true,
                      //     message: "please select year",
                      //   },
                      // ]}
                    >
                      <DatePicker allowClear={false} size='large' picker="year" placeholder='Select Year' className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area1')} />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-4" style={{display: 'flex', alignItems: 'flex-start', gap: '13px'}}>  
                  <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-50"> Search </button>  
                  <button href="javascript:void(0)" type="reset" onClick={() => { form.resetFields(); getEmployeeSalary('', 1, pageSize); setFilterValues(null); setCurrentPage(1)}} className="btn btn-success btn-block w-50" style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}}> Reset </button>  
                </div>
              </div>
              </Form>
             {/* /Search Filter */}
             <div className="row">
               <div className="col-md-12">
                 <div className="table-responsive" style={{paddingBottom: `200px`}}>
                 <Table
                    loading={tableLoader}
                    className={data?.length > 0 ? "table-striped" : ""}
                    locale={{
                      emptyText: tableLoader ? null : customEmptyText,
                    }}
                    style = {{paddingBottom: '70px'}}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
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
                    data?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={paginationDetail?.total}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, size) => {
                          console.log(page, size);
                          setPageSize(size); setCurrentPage(page);
                          getEmployeeSalary(filterValues, page, size)
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
        </div>
        {/* <Offcanvas/> */}
        </>

    
        );
}

export default SalarySlip;