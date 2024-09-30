import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar_01,
  Avatar_04,
  Avatar_05,
  Avatar_09,
  Avatar_10,
  Avatar_11,
  Avatar_12,
  Avatar_13,
  Avatar_16,
  user_icon,
} from "../../Entryfile/imagepath";
import Tableavatar from "../../_components/tableavatar/tableavatar";
import Sidebar from "../../initialpage/Sidebar/sidebar";
import Header from "../../initialpage/Sidebar/header";
import Offcanvas from "../../Entryfile/offcanvance";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import {
  Table,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Spin,
  message,
  Empty,
  TimePicker,
  Pagination,
} from "antd";
import moment from "moment";
import EmptyTable from "../../files/Icons/EmptyTable.svg";
import Modal from "@mui/material/Modal";
import { EditOutlined } from "@mui/icons-material";
import { LoadingOutlined } from "@ant-design/icons";
import { itemRender } from "../paginationfunction";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const DisabledCompanies = () => {
  const { t, i18n } = useTranslation();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const user_name = useSelector(
    (state) => state?.user?.loginvalue?.user?.fullName
  );
  console.log("permissions", permissions);
  const navigate = useNavigate();
  const csvLinkEl = useRef();
  const superAdmin = useSelector((state) => state.superAdmin);

  const [form] = Form.useForm();
  const [menu, setMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatLoading, setIsStatLoading] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [statdata, setStatdata] = useState(null);
  const [specific, setSpecific] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

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

  const [attendancerecords, setAttendanceRecords] = useState([]);
  const [companies, setCompanies] = useState([]);

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [loader, setLoader] = useState(false);
  const [csvData, setCSVData] = useState([]);
  const [csvLoader, setCsvLoader] = useState(false);
  const [pdfLoader, setPdfLoader] = useState(false);
  const [printLoader, setPrintLoader] = useState(false);

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setSelectedStatus("");
    form.resetFields();
  };

  const [employeeAttendanceData, setEmployeeAttendanceData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [filters, setFilters] = useState({
    companyName: "",
    dateFrom: "",
    dateTo: "",
    dataType: "",
    sortType: "",
  });
  const [selectedFilters, setSelectedFilters] = useState({
    companyName: "",
    dateFrom: "",
    dateTo: "",
    dataType: "",
    sortType: "",
  });

  useEffect(() => {
    setIsStatLoading(true);
  }, []);

  useEffect(() => {
    if (superAdmin) {
      setIsLoading(true);
      getCompanies();
    } else {
      navigate("/restricted", { state: { unAuthorize: true } });
    }
  }, [filters, pagination.current, pagination.pageSize]);

  const getCompanies = async () => {
    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    };
    apiServices(
      "GET",
      `newApi/overview?companyName=${params.companyName}&status=inActive&filter=${params.dataType}&sortType=${params.sortType}&page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const statData = res?.data.stats;
          setCompanies(res?.data?.Companies);
          setPagination({
            ...pagination,
            total: res?.data?.totalDocs,
          });
          setStatdata(statData);
          setPage(parseInt(res?.data?.currentPage, 10));
          setSize(parseInt(res?.data?.limit, 10));
        }
      })
      .catch((err) => {
        console.log("error", err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting data"
          }`
        );
      })
      .finally(() => {
        setIsLoading(false);
        setIsStatLoading(false);
      });
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  const handleSearch = () => {
    const { companyName, dateFrom, dateTo } = selectedFilters;

    if ((!dateFrom && dateTo) || (dateFrom && !dateTo)) {
      message.error(t("aRequests.errors.bothStartEndDateRequired"));
    } else if (!companyName && !dateFrom && !dateTo) {
      message.error(t("Timesheetadmin.noFiltersSelected"));
    } else {
      setFilters(selectedFilters);
      setPagination({
        ...pagination,
        current: 1,
      });
    }
  };

  const handleReset = () => {
    setSelectedFilters({
      companyName: "",
      dateFrom: "",
      dateTo: "",
      dataType: "",
      sortType: "",
    });

    //setSelectedMonthYear("");

    setFilters({
      companyName: "",
      dateFrom: "",
      dateTo: "",
      dataType: "",
      sortType: "",
    });

    form.resetFields();
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
    });
  };

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
            No Data
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

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => (page - 1) * size + index + 1,
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
      render: (text, record) => (
        <div
          className="table-avatar"
          style={{
            display: "flex",
            alignItems: "center",
            width: "max-content",
          }}
        >
          <label className="avatar">
            <img alt="" src={record?.imageUrl || user_icon} />
          </label>
          <label>{text}</label>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "companyEmail",
      key: "companyEmail",
    },
    {
      title: "Latest Activity",
      dataIndex: "latestActivity",
      key: "latestActivity",
      render: (text) => moment(text).format("D MMM YYYY"),
      sorter: true,
      //sorter: (a, b) => moment(a.latestActivity).unix() - moment(b.latestActivity).unix(),
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    {
      title: "Phone Number",
      dataIndex: "companyPhoneNo",
      key: "companyPhoneNo",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Address",
      dataIndex: "companyAddress",
      key: "companyAddress",
    },
    {
      title: "Employee Count",
      dataIndex: "employeeCount",
      key: "employeeCount",
      sorter: true,
      //sorter: (a, b) => parseFloat(a.employeeCount) - parseFloat(b.employeeCount),
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("D MMM YYYY"),
      sorter: true,
      //sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: "Status",
      dataIndex: "disabled",
      key: "disabled",
      render: (record) => (
        <div className="action-label">
          <label
            className="btn btn-white btn-sm btn-rounded"
            style={{ pointerEvents: "none" }}
          >
            {record == true && <i className="fa fa-dot-circle-o text-danger" />}
            {record == false && (
              <i className="fa fa-dot-circle-o text-success" />
            )}
            {record == true ? ` Disabled` : record == false ? ` Active` : ""}
          </label>
        </div>
      ),
    },
    {
      title: t("holiday.actions"),
      render: (record, row) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="javascript:void(0)"
            // className="action-icon dropdown-toggle"
            // data-bs-toggle="dropdown"
            // aria-expanded="false"
            className="action-icon dropdown-toggle"
            style={{ cursor: "pointer" }}
            data-bs-toggle="dropdown"
            aria-expanded="true"
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => {
                setOpen({
                  isAddOpen: false,
                  isDelOpen: true,
                  data: row,
                });
              }}
            >
              <i
                className={
                  record?.disabled == false
                    ? `fa fa-user-times m-r-5`
                    : `fa fa-check m-r-5`
                }
              />{" "}
              {record?.disabled == false ? t("disable") : t("enable")}
            </a>
          </div>
        </div>
      ),
    },
  ];

  const handleSortChange = (filter, sortType) => {
    setFilters({
      ...filters,
      dataType: filter,
      sortType: sortType,
    });
    console.log("Sorting by:", filter, "in", sortType, "order");
    // Implement your logic here to fetch/sort data based on filter and sortType
  };

  const onHandleDelete = (data) => {
    let id = data?._id;
    let payload = {
      id: id,
    };
    const url = data?.disabled == false ? "newApi/disable" : "newApi/enable";
    const method = data?.disabled == false ? "DELETE" : "PUT";
    setLoader(true);
    apiServices(method, url, data?.disabled == false ? id : payload, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
        //   setCompanies((prevCompanies) =>
        //     prevCompanies?.map((company) =>
        //       company._id === id
        //         ? { ...company, disabled: !company.disabled }
        //         : company
        //     )
        //   );
        //   setCompanies((prevCompanies) => 
        //     prevCompanies.filter((company) => company._id !== id)
        //   );
          getCompanies();
          handleClose();
          message.success(
            data?.disabled == false
              ? "Company disabled successfully"
              : "Company enabled successfully"
          );
          //viewCategory();
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : data?.disabled == false
              ? "Error disabling the company"
              : "Error enabling the company"
          }!`
        );
      });
  };

  const antIconDownload = (
    <LoadingOutlined
      style={{
        fontSize: 17,
        color: "#1f1f20",
        marginTop: "3px",
      }}
      spin
    />
  );

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        {/* <Sidebar /> */}
        <div className="page-wrapper">
          <Helmet>
            <title>Admin Panel - {t("header.daftarPro")}</title>
            <meta name="description" content="Login page" />
          </Helmet>
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">Disabled Companies</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link
                        to="/super-admin/dashboard"
                      >
                        {t("dashboard")}
                      </Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Disabled Companies
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Search Filter */}

            <Form form={form} onFinish={handleSearch}>
              <div className="row filter-row">
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <Form.Item name="name" className="custom-border">
                      <Input
                        className="form-control"
                        allowClear={false}
                        placeholder="Company Name"
                        onChange={(e) =>
                          handleFilterChange(e.target.value, "companyName")
                        }
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <Form.Item name="dateFrom" className="custom-border">
                      <DatePicker
                        className="form-control"
                        style={{
                          width: "100%",
                        }}
                        placeholder={t('reports.Attendance.selectStartDate')}
                        size="large"
                        //allowClear={false}
                        onChange={(date, dateString) => {
                          handleFilterChange(dateString, "dateFrom");
                          //setSelectedMonthYear(dateString);
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="">
                    <Form.Item name="dateTo" className="custom-border">
                      <DatePicker
                        className="form-control"
                        style={{
                          width: "100%",
                        }}
                        placeholder={t('reports.Attendance.selectAnEndDate')}
                        size="large"
                        //allowClear={false}
                        onChange={(date, dateString) => {
                          handleFilterChange(dateString, "dateTo");
                          //setSelectedMonthYear(dateString);
                        }}
                      />
                    </Form.Item>
                  </div>
                </div> */}
                <div
                  className="col-sm-6 col-md-3"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "13px",
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="btn-success btn-block w-50"
                    style={{
                      borderRadius: "4px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {t("search")}
                  </Button>

                  <Button
                    htmlType="button"
                    className="btn-secondary btn-block w-50"
                    onClick={handleReset}
                    style={{
                      backgroundColor: "#616161",
                      borderColor: "#616161",
                      borderRadius: "4px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {t("reset")}
                  </Button>
                </div>
              </div>
            </Form>

            {/* /Search Filter */}
            <div className="row">
              <div className="col-lg-12">
                <div className="table-responsive AdminTable">
                  <Table
                    className="fixedTableHeader"
                    // locale={{ emptyText: customEmptyText }}
                    locale={{
                      emptyText: isLoading ? null : customEmptyText,
                    }}
                    style={{ height: "430px", background: "white" }}
                    loading={isLoading}
                    columns={columns}
                    dataSource={companies}
                    bordered
                    pagination={false}
                    components={
                      i18n.dir() === "rtl"
                        ? {
                            header: {
                              cell: ({ children }) => (
                                <th style={{ textAlign: "right" }}>
                                  {children}
                                </th>
                              ),
                            },
                          }
                        : null
                    }
                    onChange={(pagination, filters, sorter) => {
                      const filter = sorter.field; // Get the column being sorted
                      let sortType = null;

                      // Determine the sort type
                      if (sorter.order === "ascend") {
                        sortType = "ascending";
                      } else if (sorter.order === "descend") {
                        sortType = "descending";
                      } else {
                        sortType = "cancel"; // If no sorting is applied
                      }

                      // Call the custom sorting function
                      handleSortChange(filter, sortType);
                    }}
                    onRow={
                      i18n.dir() === "rtl"
                        ? (record, rowIndex) => {
                            return {
                              style: { textAlign: "right" }, // Align table data to the right
                            };
                          }
                        : null
                    }
                  />
                </div>

                {companies?.length > 0 && (
                  <div>
                    <Pagination
                      style={{ display: "flex", float: "right" }}
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      showTotal={(total, range) =>
                        t("paginationShow", {
                          range1: range[0],
                          range2: range[1],
                          total: total,
                        })
                      }
                      pageSizeOptions={["20", "30", "40", "50"]}
                      showSizeChanger={true}
                      onChange={(page, pageSize) =>
                        setPagination({
                          ...pagination,
                          current: page,
                          pageSize: pageSize,
                        })
                      }
                      itemRender={(current, type, originalElement) =>
                        itemRender(current, type, originalElement, t)
                      }
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Offcanvas />

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
                <h3 style={{ marginBottom: "30px" }}>
                  {open?.data?.disabled == false ? t("disable") : t("enable")}{" "}
                  Company
                </h3>
                <p>
                  {`Are you sure you want to ${
                    open?.data?.disabled == false ? "disable" : "enable"
                  }${" "}`}
                  <strong>{open?.data?.companyName}</strong>
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleDelete(open?.data)}
                      disabled={loader}
                      style={{ width: "100%" }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        `${
                          open?.data?.disabled == false ? "Disable" : "Enable"
                        }`
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
                    >
                      {t("cancel")}
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
};

export default DisabledCompanies;
