
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
import DetailsModal from './DetailsModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import GenerateSalaryPDF from './GenerateSalaryPDF';
import { useTranslation } from 'react-i18next';

const PayrollHistory = () => {
  const { t, i18n } = useTranslation();
  const moment = require('moment');
  const [form] = Form.useForm();
  const [Dform] = Form.useForm();
  const [Detailform] = Form.useForm();
  const nav = useNavigate();
  const user_state = useSelector((state) => state?.user?.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const company_id = user_state?.user?.companyId
  const role = user_state?.user?.role

  const [tableLoader, setTableLoader] = useState(false);
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [openDownload, setOpenDownload] = useState(false);
  const [openDetail, setOpenDetail] = useState({
    open: false,
    data: ''
  });

  const [data, setData] = useState();

  useEffect(() => {
    if(role === 'admin' || permissions?.managePayrolls) {
      getEmployeeSalary()
    }else{
      nav('/restricted', { state: { unAuthorize: true}})
    }
  }, [])

  const getEmployeeSalary = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `payrolls/view-payrolls?${values === '' ? '' : values?.payMonth === '' ? '' : values?.payMonth ? `payMonth=${values?.payMonth}` : filterValues?.payMonth ? `payMonth=${filterValues?.payMonth}` : ''}${values === '' ? '' : values?.payYear === '' ? '' : values?.payYear ? `&payYear=${values?.payYear}` : filterValues?.payYear ? `&payMonth=${filterValues?.payYear}` : ''}${values === '' ? '' : values?.employeeName === '' ? '' : values?.employeeName ? `&employeeName=${values?.employeeName}` : filterValues?.employeeName ? `&employeeName=${filterValues?.employeeName}` : ''}${values === '' ? '' : values?.employeeId === '' ? '' : values?.employeeId ? `&employeeId=${values?.employeeId}` : filterValues?.employeeId ? `&employeeId=${filterValues?.employeeId}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}&processed=${true}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          // console.log(res?.data?.payrolls);
          setData(res?.data?.payrolls)
          setPaginationDetail(res?.data)
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
              : t('payroll.currentPayroll.getPayrollsHistoryError')
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
              title: t('payroll.currentPayroll.employeeName'),
              dataIndex: 'name',
              fixed: 'left',
              render: (text, record) => (            
                  <h2 className="table-avatar">
                    <label className="avatar"><img alt="" src={record?.user?.imageUrl || user_icon} /></label>
                    <label>{record?.user?.fullName}</label>
                    {/* <label>{text} <span>{record?.user?.role}</span></label> */}
                  </h2>
                ),
            },
            {
              title: t('payroll.currentPayroll.employeeID'),
              dataIndex: 'employeeId',
              render: (text,record) => (
                <>
                  {record?.user?.employeeId}
                </>
              )
            },
            {
              title: t('finance.Profit&loss.month'),
              dataIndex: 'payMonth',
            },
            {
              title: t('finance.Profit&loss.year'),
              dataIndex: 'payYear',
            },
            {
                title: t('payroll.currentPayroll.salary'),
                dataIndex: 'salary',
                render: (text, record) => (
                <span>{record?.basicSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                    ),
            },
            {
                title: t('payroll.currentPayroll.tax'),
                dataIndex: 'tax',
                render: (text,record) => (
                  <>
                    {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.deduction'),
                dataIndex: 'deduction',
                render: (text,record) => (
                  <>
                    {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.totalDeduction'),
                dataIndex: 'totalDeduction',
                render: (text,record) => (
                  <>
                    {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.deductionReason'),
                dataIndex: 'deductionReason',
                render: (text,record) => (
                    <label className='longText'>
                      {text || '-'}
                    </label>
                  )
            },
            {
                title: t('payroll.currentPayroll.bonus'),
                dataIndex: 'bonus',
                render: (text,record) => (
                  <>
                    {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.bonusReason'),
                dataIndex: 'bonusReason',
                render: (text,record) => (
                    <label className='longText'>
                      {text || '-'}
                    </label>
                  )
            },
            {
                title: t('payroll.currentPayroll.totalAddition'),
                dataIndex: 'totalAddition',
                render: (text,record) => (
                  <>
                    {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.extraPayment'),
                dataIndex: 'extraPayment',
                render: (text,record) => (
                  <>
                    {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.extraPaymentReason'),
                dataIndex: 'extraPaymentReason',
                render: (text,record) => (
                    <label className='longText'>
                      {text || '-'}
                    </label>
                  )
            },
            {
                title: t('payroll.currentPayroll.absentFine'),
                dataIndex: 'absentFine',
                render: (text,record) => (
                  <>
                    {text ? parseFloat(text)?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.creditSalary'),
                dataIndex: 'creditSalary',
                render: (text,record) => (
                <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                )
            },
            {
                title: t('payroll.currentPayroll.modeOfPayment'),
                dataIndex: 'modeOfPayment',
                render: (text,record) => (
                  <>
                    {record?.modeOfPayment==="Cash" ? t('cash') : record?.modeOfPayment==="Cheque" ? t('cheque') : record?.modeOfPayment==="Bank Transfer" ? t('bankTransfer') : '-'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.transactionID'),
                dataIndex: 'transactionId',
                render: (text,record) => (
                  <>
                    {text || '-'}
                  </>
                )
            },
            {
                title: t('payroll.currentPayroll.payrollProcessingDate'),
                dataIndex: 'createdAt',
                render: (text,record) => {
                  const date = new Date(text);
                  const day = date.getDate();
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const month = monthNames[date.getMonth()];
                  const year = date.getFullYear();
                  const formattedDate = `${day} ${month}, ${year}`;
                  return (
                    <>
                      {formattedDate}
                    </>
                  )
                }
            },
            {
                title: t('status'),
                dataIndex: 'status',
                render: (text) => (
                  <label>{text==="Paid" ? t('payroll.currentPayroll.paid') : "-"}</label>
                ),
            },
            {
              title: t('allEmp.action'),
              render: (text, record) => (
                  <div className="dropdown dropdown-action text-end">
                    <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                      <div className="dropdown-menu dropdown-menu-right">
                        <a className="dropdown-item" href="javascript:void(0)"
                          onClick={() => {
                            setOpenDetail({ open: true, data: record });
                            let d = {
                              ...record,
                              absentFine: record?.absentFine ? parseFloat(record?.absentFine)?.toFixed(2) : '0', 
                              salary: record?.basicSalary ? record?.basicSalary : record?.user?.salary,
                              employeeId: record?.user?.employeeId,
                              payMonth: moment(record?.payMonth, 'MMMM'),
                              payYear: moment(record?.payYear, 'YYYY'),
                              payrollCreationDate: moment(record?.createdAt, 'YYYY-MM-DD'),
                            }
                            Detailform.setFieldsValue(d);
                          }}><i className="fa fa-eye m-r-5" /> {t('view')}</a>
                        {/* <a className="dropdown-item" href="javascript:void(0)" onClick={()=> downloadPDF(record)}><i className="fa fa-download m-r-5" /> Export to PDF</a> */}
                        <a className="dropdown-item" href="javascript:void(0)" onClick={()=> GenerateSalaryPDF(record, false, 'history', false)}><i className="fa fa-download m-r-5" /> {t('payroll.currentPayroll.exportPayslip')}</a>
                      </div>
                  </div>
                ),
            },        
          ]


          const onFilterFinish = (values) => {
            if(values?.employeeId || values?.employeeName || values?.payMonth){
              getEmployeeSalary(values, 1, pageSize);
              console.log(values);
              setFilterValues(values)
              setCurrentPage(1);
            }
          }
          const onFinishDownload = (values) => {
          setLoader(true);
          apiServices("GET", `payrolls/view-payrolls?payMonth=${values?.month}&payYear=${values?.year}&processed=${true}&page=${1}&limit=${99999}`, null, user_state)
            .then((res) => {
              if (res?.data?.success === true) {
                // console.log(res?.data?.payrolls);
                if(res?.data?.payrolls.length > 0){
                  downloadPDF(res?.data?.payrolls, values?.month, values?.year)
                  setOpenDownload(false)
                  setAllValuesDownload({})
                  Dform.resetFields()
                  setLoader(false)
                  message.success(t('payroll.currentPayroll.payrollDataExported'))
                }else{
                  setOpenDownload(false)
                  setAllValuesDownload({})
                  Dform.resetFields()
                  setLoader(false)
                  message.error(t('payroll.currentPayroll.noPayrollDataFound'))
                }
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
                    : t('payroll.currentPayroll.getPayrollsHistoryError')
                }!`
              );
            });
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
                    No Record found!
                  </div>
                </div>
              }
            />
          );

    const [allValues, setAllValues] = useState({});
    const onHandleChange = (type, value) => {
        const updatedValues = {
          [type]: `${value}`,
        };

        form.setFieldsValue(updatedValues);
        setAllValues({
          ...allValues,
          [type]: `${value}`,
        });
    };

    const [allValuesDownload, setAllValuesDownload] = useState({});
    const onHandleChangeDownload = (type, value) => {
        const updatedValues = {
          [type]: `${value}`,
        };

        Dform.setFieldsValue(updatedValues);
        setAllValuesDownload({
          ...allValuesDownload,
          [type]: `${value}`,
        });
    };

    const downloadPDF = (row_data, month, year) => {
      const d1 = Array.isArray(row_data) ? row_data : [row_data]

      const columnsForPDF = [
        { title: "Sr.", dataIndex: "number", },
        // { title: "Employee ID", dataIndex: "employeeId", },
        { title: "Name", dataIndex: "name", },
        { title: "CNIC", dataIndex: "cnic", },
        { title: "A/C No", dataIndex: "bankAccountNumber", },
        { title: "Rs", dataIndex: "creditSalary", }
      ];
  
  
      const doc = new jsPDF();

      const headerStyles = {
        // fillColor: '#F6F6F6',
        fillColor: 'white',
        textColor: 'black',
        fontStyle: 'bold',
        fontSize: 10,
        fontFamily: 'Calibri',
      };
  
      const dataForPDF = d1.map((record, index) => [
        `${index+1}.`,
        // record?.user?.employeeId,
        record?.user?.fullName,
        record?.user?.nationalIdentityNumber,
        record?.user?.bankAccountNumber,
        record?.creditSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      ]);


      doc.setFontSize(17);
      doc.setTextColor(0, 0, 0);
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = doc.getStringUnitWidth(`Payroll History of ${month}, ${year}`) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const startX = (pageWidth - textWidth) / 2;
      doc.text(`Payroll History of ${month}, ${year}`, startX, 25);
  
      doc.autoTable({
        startY: 40,
        // margin: { top: 20 },
        headStyles: headerStyles,
        head: [columnsForPDF.map(rec => rec?.title)],
        body: dataForPDF,
        styles: {
          lineColor: [0, 0, 0], // color
          lineWidth: 0.01,      // width
          fontFamily: 'Calibri',
          textColor: [0, 0, 0],
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
      });
      doc.save('payroll_export.pdf');


      // for open pdf
      // const pdfBlob = doc.output('blob');
      // const blobUrl = URL.createObjectURL(pdfBlob);
  
      // const newWindow = window.open();
      // newWindow.location.href = blobUrl;

    };

      return ( 
        <>
        <div className={`main-wrapper ${menu ? 'slide-nav': ''}`}> 
           <div className="page-wrapper">
              <Helmet>
                  <title>{t('payroll.currentPayroll.payrollHistory')} - {t('header.daftarPro')}</title>
                  <meta name="description" content="Login page"/>
                  <link rel="icon" type="image/x-icon" href={favicon} />				
              </Helmet>
           {/* Page Content */}
           <div className="content container-fluid">
             {/* Page Header */}
             <div className="page-header">
               <div className="row align-items-center">
                 <div className="col">
                   <h3 className="page-title">{t('payroll.currentPayroll.payrollHistory')}</h3>
                   
                 </div>
                 <div className="col-auto float-end ms-auto">
                  {
                    data?.length > 0 ?
                    <a href="javascript:void(0)" className="btn add-btn" onClick={()=> setOpenDownload(true)}><i className="fa fa-download" />{t('payroll.currentPayroll.downLoad')}</a>
                    :
                    <button href="javascript:void(0)" className="btn add-btn" disabled={true} style={{background: '#ff9b44', pointerEvents: 'auto', color: 'white', cursor: 'not-allowed'}}><i className="fa fa-download" />{t('payroll.currentPayroll.downLoad')}</button>
                  }
                </div>
               </div>
             </div>
             {/* /Page Header */}
             {/* Search Filter */}
              <Form
                form={form}
                onFinish={onFilterFinish}
                onFinishFailed={() => {
                  message.error(t('allEmp.errors.fillRequiredFields'))
                }}
              >
              <div className="row filter-row">
                <div className="col-sm-6 col-md-2">  
                  <div className="form-group">
                  <Form.Item
                      name="employeeId"
                      className="custom-border"
                    >
                    <Input
                      className="form-control"
                      style={{height:'50px'}}
                      placeholder={t('payroll.currentPayroll.employeeID')}
                    />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-2">  
                  <div className="form-group">
                  <Form.Item
                      name="employeeName"
                      className="custom-border"
                    >
                    <Input
                      className="form-control"
                      style={{height:'50px'}}
                      placeholder={t('payroll.currentPayroll.employeeName')}
                    />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-2">
                <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                    <Form.Item
                      name="payMonth"
                      className="custom-border"
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(rule, value) {
                            if ( !value && getFieldValue("payYear")) {
                              return Promise.reject(
                                t('finance.Profit&loss.pleaseSelectMonth'),
                                );
                              }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input
                        style={{ display: "none" }}
                        value={allValues?.payMonth}
                      />
                      <DatePicker onChange={(date, datestring) => { onHandleChange("payMonth", datestring); }} format="MMMM" allowClear={false} size='large' picker="month" placeholder={t('payroll.currentPayroll.selectMonth')} className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area')} />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-2">
                <div style={{ position: 'relative' }} id='area'>
                    <Form.Item
                      name="payYear"
                      className="custom-border"
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(rule, value) {
                            if ( !value && getFieldValue("payMonth")) {
                              return Promise.reject(
                                t('finance.Profit&loss.pleaseSelectYear'),
                                );
                              }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input
                        style={{ display: "none" }}
                        value={allValues?.payYear}
                      />
                      <DatePicker onChange={(date, datestring) => { onHandleChange("payYear", datestring); }} allowClear={false} size='large' picker="year" placeholder={t('aAttend.selectYear')} className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area')} />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-4" style={{display: 'flex', alignItems: 'flex-start', gap: '13px'}}>  
                  <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-50"> {t('search')} </button>  
                  <button href="javascript:void(0)" type="reset" onClick={() => { form.resetFields(); setAllValues({}); getEmployeeSalary('', 1, pageSize); setFilterValues(null); setCurrentPage(1)}} className="btn btn-success btn-block w-50" style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}}> {t('reset')} </button>  
                </div>
              </div>
              </Form>
             {/* /Search Filter */}
             <div className="row">
               <div className="col-md-12">
                 <div className="table-responsive payrollHistoryTable">
                <Table
                   loading={tableLoader}
                   className={data?.length > 0 ? "table-striped" : ""}
                   locale={{
                     emptyText: tableLoader ? null : customEmptyText,
                   }}
                   style = {{overflowX : 'auto'}}
                   columns={columns}
                   dataSource={data}
                   pagination={{
                     total: paginationDetail?.totalCount,
                     pageSize: pageSize,
                     current: currentPage,
                     showTotal: (total, range) =>
                       t('paginationShow', { range1: range[0], range2: range[1], total: total }),
                     onChange: (page, size) => {
                       console.log(page, size);
                       setPageSize(size); setCurrentPage(page);
                       getEmployeeSalary(filterValues, page, size)
                     },
                     showSizeChanger: true,
                     pageSizeOptions: ['20', '30', '40', '50'],
                     position: ['bottomCenter'],
                     itemRender: (current, type, originalElement) =>
                       itemRender(current, type, originalElement, t),
                   }}
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
                       style: { textAlign: 'right' },
                     };
                   } :
                   null
                   }
                 />
                 </div>
               </div>
             </div>
           </div>
           {/* /Page Content */}
         </div>
        </div>

        <Modal
        open={openDownload}
        onClose={() => {
            setOpenDownload(false)
            setAllValuesDownload({})
            Dform.resetFields()
        }}
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
              {t('payroll.currentPayroll.downLoad')}
              </h5>
              <button type="button" className="close"
                onClick={() => {
                    setOpenDownload(false)
                    setAllValuesDownload({})
                    Dform.resetFields()
                }}
                >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={Dform}
                name="control-hooks"
                onFinish={(val) => onFinishDownload(val)}
                onFinishFailed={({errorFields}) => {
                    message.error(t('allEmp.errors.fillRequiredFields'))
                }}
                autoComplete="off"
              >
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>
                            {t('payroll.currentPayroll.payrollMonth')} <span className="text-danger">*</span>
                            </label>
                            <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                                <Form.Item
                                name="month"
                                className="custom-border"
                                rules={[
                                    {
                                    whitespace: true,
                                    required: true,
                                    message: t('finance.Profit&loss.pleaseSelectMonth'),
                                    },
                                ]}
                                >
                                <Input
                                    style={{ display: "none" }}
                                    value={allValuesDownload?.month}
                                />
                                <DatePicker onChange={(date, datestring) => { onHandleChangeDownload("month", datestring); }} format="MMMM" allowClear={false} size='large' picker="month" placeholder={t('payroll.currentPayroll.selectMonth')} className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area')} />
                                </Form.Item>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>
                            {t('payroll.currentPayroll.payrollYear')} <span className="text-danger">*</span>
                            </label>
                            <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                                <Form.Item
                                name="year"
                                className="custom-border"
                                rules={[
                                    {
                                    whitespace: true,
                                    required: true,
                                    message: t('finance.Profit&loss.pleaseSelectYear'),
                                    },
                                ]}
                                >
                                <Input
                                    style={{ display: "none" }}
                                    value={allValuesDownload?.month}
                                />
                                <DatePicker onChange={(date, datestring) => { onHandleChangeDownload("year", datestring); }} allowClear={false} size='large' picker="year" placeholder={t('aAttend.selectYear')} className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area')} />
                                </Form.Item>
                            </div>
                        </div>
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
                        t('payroll.currentPayroll.export')
                      )}
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>

      {/* details modal */}
      <DetailsModal
        Detailform={Detailform}
        openDetail={openDetail}
        setOpenDetail={setOpenDetail}
      />


        {/* <Offcanvas/> */}
        </>

    
        );
}

export default PayrollHistory;
