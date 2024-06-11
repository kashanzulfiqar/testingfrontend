import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  Input,
  DatePicker,
  Row,
  Select,
  Spin,
  Table,
  message,
  Empty,
  Pagination,
} from "antd";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Offcanvas from "../../../Entryfile/offcanvance";
import { apiServices } from "../../../Services/apiServices";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { user_icon } from "../../../Entryfile/imagepath";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const ResourceAllocationDetails = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const nav = useNavigate();

  const record = location?.state;

  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const [menu, setMenu] = useState(false);
  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [tableData, setTableData] = useState(record?.projectsIn6Months);

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });


  useEffect(() => {
    if (role === 'admin' || permissions?.viewAllUsers || permissions?.updateUser || permissions?.updateStatusOfEmployee || permissions?.addUser) {
    return
    } else {
        nav('/restricted', { state: { unAuthorize: true}})
    }
  }, []);

  const columns = [
    {
      title: t('projectScreen.Modal.projectName'),
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <Link to={`/projects/projects-view/${record?._id}`} style={{color: '#333333'}}>
          <label style={{cursor: 'pointer'}} className="longText">{text}</label>
        </Link>
      ),
    },
    {
      title: t('projectScreen.clientName'),
      dataIndex: "clientName",
      key: "clientName",
      render: (text, record) => (
        <div style={{minWidth: 'max-content'}}>
          <img
            src={record?.clientImage || user_icon}
            alt=""
            className="avatar"
            style={{ width: "30px", height: "30px" }}
          />
          <label>{record?.clientName}</label>
        </div>
      ),
    },
    {
      title: 'Account Manager',
      dataIndex: "projectLead",
      key: "projectLead",
      render: (text, record) => (
        <div style={{minWidth: 'max-content'}}>
          <img
            src={record?.projectLeadImage || user_icon}
            alt=""
            className="avatar"
            style={{ width: "30px", height: "30px" }}
          />
          <label>{record?.projectLead}</label>
        </div>
      ),
    },
    {
      title: 'Project Type',
      dataIndex: "projectType",
      key: "projectType",
      render: (text, record) => (
        <span style={{ color: record.projectType === "Billed" ? 'green' : 'red' }}>
          {record.projectType === "Billed" ? "Billed" : "Non-Billed"}

        </span>
      ),
    },
    {
      title: t('projectScreen.deadline'),
      dataIndex: "projectEnd",
      key: "projectEnd",
      render: (text, record) => <label style={{minWidth: 'max-content'}}>{text}</label> 
    },
    // {
    //   title: t('projectScreen.status'),
    //   dataIndex: "status",
    //   key: "status",
    //   render: (record) => (
    //     <div className="action-label">
    //       <label
    //         className="btn btn-white btn-sm btn-rounded"
    //         style={{ pointerEvents: "none" }}
    //       >
    //         {record === "Scheduled" && (
    //           <i className="fa fa-dot-circle-o text-danger" />
    //         )}
    //         {record === "On-Going" && (
    //           <i className="fa fa-dot-circle-o text-warning" />
    //         )}
    //         {record === "Paused" && (
    //           <i className="fa fa-dot-circle-o text-secondary" />
    //         )}
    //         {record === "Archived" && (
    //           <i className="fa fa-dot-circle-o text-secondary" />
    //         )}
    //         {record === "Completed" && (
    //           <i className="fa fa-dot-circle-o text-success" />
    //         )}
    //         {record === "Scheduled"
    //           ? ` ${t('projectScreen.Modal.scheduled')}`
    //           : record === "On-Going"
    //           ? ` ${t('projectScreen.Modal.onGoing')}`
    //           : record === "Paused"
    //           ? ` ${t('projectScreen.Modal.paused')}`
    //           : record === "Archived"
    //           ? ` ${t('projectScreen.Modal.archived')}`
    //           : record === "Completed"
    //           ? ` ${t('projectScreen.Modal.completed')}`
    //           : ""}
    //       </label>
    //     </div>
    //   ),
    // },
    // {
    //   title: t('projectScreen.Modal.action'),
    //   dataIndex: "action",
    //   key: "action",
    //   align: "right",
    //   render: (_, record) => (
    //     <div className="dropdown dropdown-action profile-action">
    //       <a
    //         className="action-icon dropdown-toggle"
    //         data-bs-toggle={(role === 'admin' || permissions?.projectManagement) ? 'dropdown' : ''}
    //         aria-expanded="false"
    //         style={{cursor: `${(role === 'admin' || permissions?.projectManagement) ? '' : 'not-allowed'}`}}
    //       >
    //         <i className="material-icons">more_vert</i>
    //       </a>
    //       <div className="dropdown-menu dropdown-menu-right">
    //         <button
    //           className="dropdown-item"
    //           onClick={() => {
    //             // ViewClients();
    //             // fetchEmployees();
    //             getAllCurrencies();
    //             openEditModal(record);
    //             form.setFieldsValue({
    //               ...record,
    //               startDate: moment(record?.startDate, "YYYY-MM-DD"),
    //               endDate: moment(record?.endDate, "YYYY-MM-DD"),
    //             });
    //           }}
    //         >
    //           <i className={`fa fa-pencil ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
    //           {t('edit')}
    //         </button>
    //         <button
    //           className="dropdown-item"
    //           onClick={() => {
    //             openDelete(record);
    //           }}
    //         >
    //           <i className={`fa fa-trash ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} /> {t('delete')}
    //         </button>
    //       </div>
    //     </div>
    //   ),
    // },
  ];

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
            {t('aRequests.errors.noRecordFound')}
          </div>
          {/* <div
                  style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
                >
                  Click 'Add Department' Button To Create <br /> A New Department{" "}
                </div> */}
        </div>
      }
    />
  );

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        {/* <Sidebar />         */}
        <div className="page-wrapper">
          <Helmet>
            <title>{t('finance.Profit&loss.profitAndloss')} - {t('header.daftarPro')}</title>
            <meta name="description" content="Login page" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">
                  <label className="avatar" style={{width: '60px', height: '60px'}}><img alt="" src={record?.imageUrl || user_icon} /></label>
                    {record ? record?.fullName : ""}</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link
                        to={
                          role === "admin"
                            ? "/main/dashboard"
                            : "/employee/dashboard"
                        }
                      >
                        {t('dashboard')}
                      </Link>
                    </li>
                    <li className="breadcrumb-item active">Resource Allocation</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* </div> */}
            {/* /Page Header */}
            <div className="row" style={{marginBottom:"20px"}}>
                <div className="col-md-3">
                    <div className="stats-info">
                    <label>Assigned Projects</label>
                    <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                        <h4 style={{ marginRight: "5px" }}>{record?.totalAssignedProjects ? record?.totalAssignedProjects : "0"}</h4>
                    </div>
                    </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>Billed Projects</label>
                    <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                        <h4 style={{ marginRight: "5px" }}>{record?.billedProjects ? record?.billedProjects : "0"}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>Non-Billed Projects</label>
                    <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                    <h4 style={{ marginRight: "5px" }}>{record?.nonBilledProjects ? record?.nonBilledProjects : "0"}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>Billed Until</label>
                    <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                        
                        <h4 style={{ marginRight: "5px" }}>{record?.billedUntil ? moment(record?.billedUntil).format('DD-MMM-YYYY') : "-"}</h4>
                    </div>
                  </div>
                </div>
              </div>

            <div className="row">
            <div className="col-md-12">
            <div className="table-responsive">
              <Table
                className="table-striped"
                locale={{
                  emptyText: customEmptyText
                }}
                //loading={tableLoader}
                pagination={false}
                bordered
                style={{ height:"400px" }}
                columns={columns}
                 // Use columns1 for the first table
                dataSource={tableData} // Define your data source for the first table
                rowKey={(record) => record?._id}
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
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
      <Offcanvas />
    </>
  );
};

export default ResourceAllocationDetails;
