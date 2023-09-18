
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';

import { Table } from 'antd';
import 'antd/dist/antd.css';
import "../../../antdstyle.css"
import { onShowSizeChange, itemRender } from '../../../paginationfunction';

const InvoicesScreen = () => {
  const [data, setData] = useState([
    {id:1,invoicenumber:"INV-0001",client:"	Global Technologies",createddate:"11 Mar 2019",duedate:"11 Mar 2019",amount:"2099",status:"Paid"},
         {id:2,invoicenumber:"INV-0002",client:"Delta Infotech",createddate:"11 Mar 2019",duedate:"11 Mar 2019",amount:"2099",status:"Sent"},
  ]);

  useEffect(() => {
    console.log('invoice');
  }, [])

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
        title: '#',
        dataIndex: 'id',
      },      
      {
        title: 'Invoice Number',
        dataIndex: 'invoicenumber',
        render: (text, record) => (
          <Link to="/app/sales/invoices-view" style={{color: '#333333'}}>#{text}</Link>
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
      return (
        <div></div>
        // <>
        // <div className="page-wrapper" style={{margin: '0px', padding: '0px'}}> 
        //   {/* Page Content */}
        //   <div className="content container-fluid" style={{padding: '0px'}}>
        //     {/* Page Header */}
        //     <div className="page-header">
        //       <div className="row align-items-center">
        //         <div className="col">
        //           <h3 className="page-title">Invoices</h3>
        //           {/* <ul className="breadcrumb">
        //             <li className="breadcrumb-item"><Link to="/app/main/dashboard">Dashboard</Link></li>
        //             <li className="breadcrumb-item active">Invoices</li>
        //           </ul> */}
        //         </div>
        //         <div className="col-auto float-end ms-auto">
        //           <Link to="/app/sales/invoices-create" className="btn add-btn"><i className="fa fa-plus" /> Create Invoice</Link>
        //         </div>
        //       </div>
        //     </div>
        //     {/* /Page Header */}
        //     <div className="row">
        //       <div className="col-md-12">
        //         <div className="table-responsive">
        //           <Table className="table-striped"
        //               pagination= { {total : data.length,
        //                 showTotal : (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
        //                 showSizeChanger : true,onShowSizeChange: onShowSizeChange ,itemRender : itemRender } }
        //               style = {{overflowX : 'auto', paddingBottom: '60px'}}
        //               columns={columns}                 
        //               // bordered
        //               dataSource={data}
        //               rowKey={record => record.id}
        //               // onChange={this.handleTableChange}
        //             />
        //         </div>
        //       </div>
        //     </div>
        //   </div>
        //   {/* /Page Content */}
        // </div>
        // </>
      
      );
   }

export default InvoicesScreen