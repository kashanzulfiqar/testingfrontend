
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';

import { Empty, Table, Pagination } from 'antd';
import 'antd/dist/antd.css';
import "../../../antdstyle.css"
import { onShowSizeChange, itemRender } from '../../../paginationfunction';
import EmptyTable from "../../../../files/Icons/EmptyTable.svg";
import { useSelector } from 'react-redux';
import { apiServices } from '../../../../Services/apiServices';
import invoicePDF from '../../../HR/Sales/invoicePDF';
import { useTranslation } from 'react-i18next';

const InvoicesScreen = ({ clientId }) => {
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state?.user?.loginvalue);

  const [allInvoices, setAllInvoices] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();

  const d = [
    {id:1,invoicenumber:"INV-0001",client:"	Global Technologies",createddate:"11 Mar 2019",duedate:"11 Mar 2019",amount:"2099",status:"Paid"},
    // {id:2,invoicenumber:"INV-0002",client:"Delta Infotech",createddate:"11 Mar 2019",duedate:"11 Mar 2019",amount:"2099",status:"Sent"},
  ]

  useEffect(() => {
    getAllInvoices()
  }, [])  

  const getAllInvoices = (current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `invoices/client-invoices?id=${clientId}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllInvoices(res?.data?.invoices?.docs);
          setPaginationDetail(res?.data?.invoices)
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
              : t('Clientinvoices.getClientInvoicesError')
          }!`
        );
      });
  }
  
    const columns = [
      
      {
        title: '#',
        dataIndex: '',
        render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      },      
      {
        title: t('Clientinvoices.invoicenumber'),
        dataIndex: 'invoiceNo',
        render: (text, record) => (
          <Link
            to="/invoices/view-invoice"
            style={{color: '#333333'}}
            state={{
              invoice_data: {
                ...record,
                bankDetail: record?.bankDetailId,
                bankDetailId: record?.bankDetailId?._id,
                client: record?.clientId,
                clientId: record?.clientId?._id,
                company: record?.companyId,
                companyId: record?.companyId?._id
              }
            }}
          >{text}</Link>
          ),
      },     
      // {
      //   title: 'Client',
      //   dataIndex: 'client',
      // },
      {
        title: t('Clientinvoices.invoicedate'),
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
      {
        title: t('Clientinvoices.duedate'),
        dataIndex: 'dueDate',
        render: (text, record) => (
          <label>{formatDate(text || '')}</label>
          ),
      },    
      {
        title: t('Clientinvoices.amount'),
        dataIndex: 'totalAmount',
        render: (text, record) => (
          <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.currency}</span>
          ),
      },
      {
        title: t('Clientinvoices.status'),
        dataIndex: 'status',
        render: (text, record) => (
        <label className={text==="Paid" ? "badge bg-inverse-success" : text==="Partially Paid" ? "badge bg-inverse-info" : text==="Pending" ? "badge bg-inverse-warning" : text==="Cancelled" ? "badge bg-inverse-danger" : ''}>
          {text || '-'}
        </label>
          ),
      },
      {
        title: t('Clientinvoices.action'),
        render: (text, record) => (
            <div className="dropdown dropdown-action text-end">
                <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                        <div className="dropdown-menu dropdown-menu-right">
                        <Link
                          className="dropdown-item"
                          to="/invoices/view-invoice"
                          state={{
                            invoice_data: {
                              ...record,
                              bankDetail: record?.bankDetailId,
                              bankDetailId: record?.bankDetailId?._id,
                              client: record?.clientId,
                              clientId: record?.clientId?._id,
                              company: record?.companyId,
                              companyId: record?.companyId?._id
                            }
                          }}
                        >
                          <i className="fa fa-eye m-r-5" /> {t('Clientinvoices.view')}
                        </Link>
                          <a
                            className="dropdown-item"
                            href="javascript:void(0)"
                            onClick={() => { 
                              invoicePDF({
                                ...record,
                                bankDetail: record?.bankDetailId,
                                bankDetailId: record?.bankDetailId?._id,
                                client: record?.clientId,
                                clientId: record?.clientId?._id,
                                company: record?.companyId,
                                companyId: record?.companyId?._id
                              }); 
                            }}
                          >
                            <i className="fa fa-file-pdf-o m-r-5" /> {t('Clientinvoices.download')}
                          </a>
                          {/* <Link className="dropdown-item" to="/app/sales/invoices-edit"><i className="fa fa-pencil m-r-5" /> Edit</Link>
                          <Link className="dropdown-item" to="/app/sales/invoices-view"><i className="fa fa-eye m-r-5" /> View</Link>
                          <a className="dropdown-item" href="#"><i className="fa fa-file-pdf-o m-r-5" /> Download</a>
                          <a className="dropdown-item" href="#"><i className="fa fa-trash-o m-r-5" /> Delete</a> */}
                        </div>
            </div>
          ),
      },
    ]

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
              {t('Clientinvoices.noInvoicesFound')}
            </div>
          </div>
        }
      />
    );

      return (
        // <div></div>
        <>
        <div className="page-wrapper" style={{margin: '0px', padding: '0px'}}> 
          {/* Page Content */}
          <div className="content container-fluid" style={{padding: '0px'}}>
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">{t('Clientinvoices.invoices')}</h3>
                  {/* <ul className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/app/main/dashboard">Dashboard</Link></li>
                    <li className="breadcrumb-item active">Invoices</li>
                  </ul> */}
                </div>
                {/* <div className="col-auto float-end ms-auto">
                  <Link to="/app/sales/invoices-create" className="btn add-btn"><i className="fa fa-plus" /> Create Invoice</Link>
                </div> */}
              </div>
            </div>
            {/* /Page Header */}
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
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, size) => {
                          console.log(page, size);
                          setPageSize(size); setCurrentPage(page);
                          getAllInvoices(page, size)
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
        </>
      
      );
   }

export default InvoicesScreen