import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Table,
  Select,
  DatePicker,
  message,
  Button,
  Spin,
  Empty,
  Pagination,
} from "antd";
import Modal from "@mui/material/Modal";
import "antd/dist/antd.css";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "../../antdstyle.css";
import Sidebar from "../../../initialpage/Sidebar/sidebar";
import Offcanvas from "../../../Entryfile/offcanvance";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined } from "@ant-design/icons";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useTranslation } from "react-i18next";
import { user_icon } from "../../../Entryfile/imagepath";

const ResourceAllocation = () => {
  const { t, i18n } = useTranslation();
  const [menu, setMenu] = useState(false);

  const navigate = useNavigate();
  const moment = require("moment");
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  //console.log(permissions)
  const role = user_state?.user?.role;

  const [allocations, setAllocatons] = useState([]);
  //const [flag, setFlag] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 10,
  });

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  useEffect(() => {
    if(role === 'admin' || permissions?.viewAllUsers || permissions?.updateUser || permissions?.updateStatusOfEmployee || permissions?.addUser) {
      setIsLoading(true);
      getAllocations();
    }else{
      navigate('/restricted', { state: { unAuthorize: true}})
    }
  }, []);

  const getAllocations = (page, pageSize) => {
    const params = {
      page: page || pagination.current,
      limit: pageSize || pagination.pageSize,
    };

    apiServices("GET", `user/resource-allocation?page=${params.page}&limit=${params.limit}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllocatons(res?.data?.User);
          //setFlag(true);
          setPage(parseInt(res?.data?.page, 10));
          setSize(parseInt(res?.data?.limit, 10));
          setPagination({
            ...pagination,
            current : parseInt(res?.data?.page, 10),
            pageSize : parseInt(res?.data?.limit, 10),
            total: res?.data?.totalDocs,
          });
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Error retrieving resource allocations'
          }!`
        );
      }).then(()=>{
        setIsLoading(false);
        //setFlag(false);
      });
  };

  const getNextSixMonths = () => {
    const months = [];
    const currentMonth = moment().month();
    const currentYear = moment().year();
    for (let i = 0; i < 6; i++) {
      const date = moment().month(currentMonth + i).year(currentYear).startOf('month');
      months.push({
          name: date.format('MMMM'),
          year: date.year(),
          index: date.month()
      });
    }
    return months;
};

const monthData = getNextSixMonths();


  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) =>
        (page - 1) * size + index + 1,
    },
    {
      title: 'Employee Name',
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left",
      render: (text, record) => (
        <h2 className="table-avatar">
          <label className="avatar"><img alt="" src={record?.imageUrl || user_icon} /></label>
          <label>{record?.fullName}</label>
          {/* <label>{text} <span>{record?.user?.role}</span></label> */}
        </h2>
      )
    },
    {
      title: 'Department',
      dataIndex: "teamName",
      key: "teamName",
      render: (text, record) => record?.teamId?.teamName || 'N/A',
    },
    {
      title: "Employee Type",
      dataIndex: "employeeType",
      key: "employeeType",
    },
    {
      title: 'Account Managers',
      key: 'accountManagers',
      render: (text, record) => {
        return record?.accountManagers?.length > 0 ? (
          record?.accountManagers?.map(manager => (
            <div key={manager._id} className="table-avatar" style={{ marginBottom: '10px' }}>
            <label className="avatar" style={{ cursor: 'pointer' }}><img alt="" src={manager?.imageUrl || user_icon} /></label>
            <label style={{ cursor: 'pointer' }}>{manager?.fullName}</label>
            {/* <label>{text} <span>{record?.user?.role}</span></label> */}
          </div>
          )) 
        ) : (
          "-"
        );
      }
    },
    {
      title: 'Billing Status',
      key: 'billed',
      render: (text, record) => (
        <span style={{ color: record.billed ? 'green' : 'red' }}>
          {record.billed ? 'Billed' : 'Non-Billed'}
        </span>
      ),
    },
    // {
    //   title: 'Projects',
    //   key: 'projectsIn6Months',
    //   render: (text, record) => {
    //     return record?.projectsIn6Months?.map(project => (
    //       <div key={project._id} style={{ marginBottom: '10px' }}>
    //       <label>{project?.projectName}</label>
    //       {/* <label>{text} <span>{record?.user?.role}</span></label> */}
    //     </div>
    //     )) || 'N/A';
    //   }
    // },
    ...monthData.map(({ name: month, year: colYear, index }) => ({
      title: month,
      key: month,
      render: (text, record) => {
          const matchingProjects = record?.projectsIn6Months?.filter(project => {
              const projectStart = moment(`${project.startYear}-${project.startMonthName}`, 'YYYY-MMMM');
              const projectEnd = moment(`${project.year}-${project.monthName}`, 'YYYY-MMMM');
              const columnDate = moment().year(colYear).month(index);

              return projectStart.isSameOrBefore(columnDate, 'month') && projectEnd.isSameOrAfter(columnDate, 'month');
          }).sort((a, b) => a.projectName.localeCompare(b.projectName));

          if (matchingProjects && matchingProjects.length > 0) {
              return (
                  <div>
                      {matchingProjects.map(project => (
                          <Link
                              to={`/projects/projects-view/${project?._id}`}
                              key={project?._id}
                              className="project-link"
                              style={{ color: '#333333', marginBottom: '10px', display: 'block' }}
                              onClick={(e) => e.stopPropagation()}
                          >
                              <label className="longText" style={{ cursor: 'pointer' }}>
                                  {project.projectName}
                              </label>
                          </Link>
                      ))}
                  </div>
              );
          } else {
              return '-';
          }
      }
  })),
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
          >No data found
          </div>
          {/* <div
                    style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
                  >
                    Click 'Add Employees' Button To Create <br /> A New Employee{" "}
                  </div> */}
        </div>
      }
    />
  );

  const handlePageChange = (page, pageSize) => {
    // Update the pagination state
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
    setIsLoading(true);
    getAllocations(page, pageSize);
  };

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        {/* <Sidebar /> */}
        <div className="page-wrapper">
          <Helmet>
            <title>Resource Allocation - DaftarPro</title>
            <meta name="description" content="Login page" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">Resource Allocation</h3>
                  <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link
                      to={
                        role === "admin"
                          ? "/main/dashboard"
                          : "/employee/dashboard"
                      }
                    >
                      {t('holiday.dashboard')}
                    </Link>
                  </li>
                    <li className="breadcrumb-item active">Resource Allocation</li>
                  </ul>
                </div>
                {/* {(role === "admin" || permissions?.companyManagement) && (<div className="col-auto float-end ms-auto">
                  <a
                    href="javascript:void(0)"
                    className="btn add-btn"
                    onClick={() => {
                      setOpen({
                        isAddOpen: true,
                        isDelOpen: false,
                        data: "",
                      });
                    }}
                  >
                    <i className="fa fa-plus" /> {t('holiday.addholiday')}
                  </a>
                </div>)} */}
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
          <div className="col-md-12">
            <div className="table-responsive allocationTable"  style={{background: 'white'}}>
              <Table
                loading={isLoading}
                className={"fixedTableHeader2"}
                locale={{
                    emptyText: isLoading ? null : customEmptyText,
                  }}
                pagination={false}
                // pagination={{
                //   current: pagination.current,
                //   pageSize: pagination.pageSize,
                //   total: pagination.total,
                //   showTotal: (total, range) =>
                //     `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                //   pageSizeOptions: ["10", "20", "40", "50"], // Options to change page size
                //   showSizeChanger: true, // Show the page size changer
                //   onChange: (page, pageSize) => {
                //     setPagination({
                //       ...pagination,
                //       current: page,
                //       pageSize: pageSize,
                //     });
                //     setIsLoading(true);
                //     getAllocations(page, pageSize)
                //   },
                //   itemRender: itemRender,
                // }}
                style = {{height: "400px", background: "white"}}
                columns={columns}

                dataSource={allocations}
                rowKey={(record) => record.id}
                components={i18n.dir()==="rtl" ?
                  {
                  header: {
                    cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th>,
                  },
                } :
                null
                }
                onRow={(record, rowIndex) => ({
                  onClick: () => navigate('/resource-allocation/details', { state: record}),
                  style: { cursor: 'pointer' },
                  ...(i18n.dir() === "rtl" && {
                    style: { textAlign: 'right' }, // Align table data to the right
                  }),
                })}
                
                // onChange={this.handleTableChange}
              />
            </div>
            {
                    allocations?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        pageSizeOptions={["20", "30", "40", "50"]}
                        showSizeChanger
                        onChange={handlePageChange}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
                        disabled={isLoading}
                      />
                    </div>
                  }
          </div>
        </div>
          </div>

        </div>
      </div>
      <Offcanvas />
    </>
  );
};

export default ResourceAllocation;
