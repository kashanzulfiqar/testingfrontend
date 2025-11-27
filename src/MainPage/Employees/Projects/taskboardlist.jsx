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
  Tooltip,
  Avatar,
  Checkbox,
  Segmented,
  Switch,
} from "antd";
import Modal from "@mui/material/Modal";
import "antd/dist/antd.css";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "../../antdstyle.css";
import Sidebar from "../../../initialpage/Sidebar/sidebar";
import Offcanvas from "../../../Entryfile/offcanvance";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined, MinusCircleFilled } from "@ant-design/icons";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useTranslation } from "react-i18next";
import { user_icon } from "../../../Entryfile/imagepath";

const TaskBoardList = () => {
  const { t, i18n } = useTranslation();
  const [menu, setMenu] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const moment = require("moment");
  const [form] = Form.useForm();
  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const company_id = user_state?.user?.companyId;
  const role = user_state?.user?.role;
  const [allProjects, setAllProjects] = useState([]);
  const employee_id = user_state?.user?._id;
  const [categoryObj, setCategoryObj] = useState();
  const [loader, setLoader] = useState(false);
  const [holidayObj, setHolidayObj] = useState();
  const [tableData, setTableData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [selectValue, setSelectValue] = useState(undefined);
  const [isProjectAssociated, setIsProjectAssociated] = useState(false);

  const [open, setOpen] = useState({
    isAddOpen: false,
    isEditOpen: false,
    data: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 10,
  });

  const [isArchived, setIsArchived] = useState(false);

  const [filters, setFilters] = useState({
    projectName: "",
    clientName: "",
    projectDomain: "",
    costType: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    projectName: "",
    clientName: "",
    projectDomain: "",
    costType: "",
  });

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openTeamDropdownId, setOpenTeamDropdownId] = useState(null);

  const handleDropdownClick = (e, id) => {
    e.stopPropagation();
    setOpenTeamDropdownId(null);
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleTeamDropdownClick = (e, id) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setOpenTeamDropdownId(openTeamDropdownId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setOpenTeamDropdownId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  const handleSearch = () => {
    setFilters(selectedFilters);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleReset = () => {
    setSelectedFilters({
      projectName: "",
      clientName: "",
      projectDomain: "",
      costType: "",
    });
    setFilters({
      projectName: "",
      clientName: "",
      projectDomain: "",
      costType: "",
    });

    form.resetFields();
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
    });
  };

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  // Initial load effect
  useEffect(() => {
    setIsLoading(true);
    if(role !== 'client' && role !== 'focalperson') {
      fetchEmployees();
    }
    GetListTaskBoards();
  }, []); // Only run on mount

  const handlePaginationChange = (page, pageSize) => {
    setPage(page);
    setSize(pageSize);
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
    GetListTaskBoards(page, pageSize);
  };

  const searchHandler = (val, type) => {
    let dropdownValues = [];
    if (type === "project") {
      allProjects.forEach((proj) => {
        dropdownValues.push(proj.projectName.toLowerCase());
      });
    }

    if (val !== "") {
      dropdownValues.some((team) => {
        if (team.includes(val.toLowerCase())) {
          // setNoData(false);
          return true;
        } else {
          // setNoData(true);
        }
      });
    } else {
      // setNoData(false)
    }
  };

  const fetchEmployees = () => {
    setLoadingEmployee(true);
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          const sortedData = emps
            .slice()
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          setEmployees(sortedData);
          setLoadingEmployee(false);
        }
      })
      .catch((err) => {
        setLoadingEmployee(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aAttend.errors.getEmployeesError")
          }`
        );
      });
  };

  const showTeamSearch = (val, type) => {
    let dropdownValues = [];
    if (type === "Team") {
      employees.forEach((team) => {
        dropdownValues.push(team.fullName.toLowerCase());
      });
    }

    if (val !== "") {
      dropdownValues.some((team) => {
        if (team.includes(val.toLowerCase())) {
          // setNoData(false);
          return true;
        } else {

        }
      });
    } else {
  
    }
  };
  
  const getTeamMemberOptions = () => {
    return employees?.filter((emp) => !selectedTeamMembers.some((selected) => selected._id === emp._id))
    ?.map((employee) => (
      <Select.Option key={employee._id} value={employee._id}>
        {employee.fullName}
      </Select.Option>
    ));
  };
  const handleSelectDeveloper = (value) => {
    const developer = employees?.find((emp) => emp._id === value);
    setSelectedTeamMembers([...selectedTeamMembers, developer]);
    form.resetFields(["assignedDevelopers"])
  };

  const handleRemoveDeveloper = (developerId) => {
    setSelectedTeamMembers(selectedTeamMembers.filter((dev) => dev._id !== developerId));
    setSelectValue(undefined);
  };
  const handleChange = (values) => {
    const selectedEmployees = values?.map((value) =>
      employees?.find((employee) => employee._id === value)
    );
    setSelectedTeamMembers(selectedEmployees);
  };
  const getProjects = (page, pageSize) => {
    //setLoader(true);

    const endpoint = role === 'client'
      ? `project-management/project-by-id?role=client&id=${user_state?.user?._id}&page=1&limit=999999`
      : `project-management/?taskBoard=false&employeeId=${
        role === "" && !permissions?.projectManagement ? employee_id : ""
      }&page=1&limit=999999`;

    apiServices(
      "GET",
      endpoint,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const docs = res?.data?.projects?.docs || res?.data?.projects || [];
          const sortedData = docs
            ?.slice()
            .sort((a, b) => a.projectName.localeCompare(b.projectName));
          setAllProjects(sortedData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("projectScreen.errors.getEmployeeProjectsError")
          }`
        );
        setIsLoading(false);
      });
  };

  const GetListTaskBoards = (page, pageSize, archivedStatus = isArchived) => {
    setIsLoading(true);
    const params = {
      ...filters,
      page: page || pagination.current,
      limit: pageSize || pagination.pageSize,
    };

    // If client, fetch only taskboards of client's projects
    if (role === 'client' || role === 'focalperson') {
      apiServices(
        "GET",
        `taskBoard/taskboard-by-id?role=${role}&id=${user_state?.user?._id}&page=${params.page}&limit=${params.limit}&isArchived=${archivedStatus}`,
        null,
        user_state
      )
        .then((res) => {
          if (res.data.success === true) {
            const boards = res?.data?.taskBoards?.docs || res?.data?.taskBoards || [];
            setCategoryObj(boards);
            setTableData(boards);
            setPagination({
              ...pagination,
              current: parseInt(params.page, 10),
              pageSize: parseInt(params.limit, 10),
              total: res?.data?.taskBoards?.totalDocs || res?.data?.totalItems,
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t("projectScreen.errors.getEmployeeProjectsError")
            }`
          );
          setIsLoading(false);
        });
      return;
    }

    apiServices(
      "GET",
      `taskBoard/view-taskBoard/?page=${params.page}&limit=${params.limit}&isArchived=${archivedStatus}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const boards = res?.data?.taskBoards || [];
          setCategoryObj(boards);
          setTableData(boards);
          setPagination({
            ...pagination,
            current: parseInt(params.page, 10),
            pageSize: parseInt(params.limit, 10),
            total: res?.data?.totalItems,
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("projectScreen.errors.getEmployeeProjectsError")
          }`
        );
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    setSelectedTeamMembers([]);
    form.resetFields();
    setSelectValue(undefined);
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setIsProjectAssociated(false);
    setLoader(false);
  };

  const onFinish = (values, info) => {
    let updated_data = {
      ...values,
      companyId: info?.companyId,
      assignedDevelopers: selectedTeamMembers.map((member) => member._id),
    };
    setLoader(true);
    apiServices("POST", "taskBoard/add-taskBoard", updated_data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          handleClose();
          GetListTaskBoards();
          message.success("Task board added successfully");
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
              : "Error adding taskboard"
          }!`
        );
      });
  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => (page - 1) * size + index + 1,
    },
    {
      title: t("TaskBoard Name"),
      dataIndex: "boardTitle",
      key: "boardTitle",
      render: (text, record) => (
        <div>
          <label>{text}</label>
          {/* <a
            onClick={() => nav(`/task-board/${record?._id}`, { state: record})}>
            
          </a> */}
          {/* Show project name as a tag if project exists */}
          {!record?.project?.projectName && (
            <span
              style={{
                marginLeft: "8px",
                backgroundColor: "#7460EE",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            >
              {t("Taskboard")}
            </span>
          )}
        </div>
      ),
    },
    {
      title: t("Tasks.project"),
      dataIndex: "project",
      key: "project",
      render: (text, record) => (
        <div>
          {record?.project?.projectName ? (
            <span
              style={{
                backgroundColor: "#f0f0f0",
                color: "#595959",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            >
              {record.project.projectName}
            </span>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      title: t("projectScreen.team"),
      dataIndex: "assignedDevelopers",
      key: "assignedDevelopers",
      render: (assignedDevelopers, record) => (
        <div className="project-members" style={{ margin: "4px auto" }}>
          <ul className="team-members" style={{ minWidth: "max-content" }}>
            {assignedDevelopers?.slice(0, 4).map((developer, index) => (
              <li key={index}>
                <Tooltip title={developer?.fullName}>
                  <Avatar
                    style={{ cursor: "pointer" }}
                    src={developer?.imageUrl || user_icon}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Tooltip>
              </li>
            ))}
            {assignedDevelopers?.length > 4 && (
              <li className="dropdown avatar-dropdown">
                <Link
                  className="all-users dropdown-toggle projectTeamMember"
                  style={{
                    display: "inline-flex",
                    height: "33px",
                    width: "33px",
                  }}
                  data-bs-toggle="dropdown"
                  aria-expanded={openTeamDropdownId === record._id}
                  onClick={(e) => handleTeamDropdownClick(e, record._id)}
                >
                  +{assignedDevelopers?.length - 4}
                </Link>
                {/* Dropdown menu for additional team members */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`dropdown-menu dropdown-menu-right ${
                    openTeamDropdownId === record._id ? "show" : ""
                  }`}
                >
                  <div className="avatar-group">
                    {assignedDevelopers?.slice(4).map((developer, index) => (
                      <a
                        className="avatar avatar-xs projectTeamMember"
                        key={index}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title={developer?.fullName}>
                          <Avatar
                            src={developer?.imageUrl || user_icon}
                            style={{ cursor: "pointer" }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Tooltip>
                      </a>
                    ))}
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      ),
    },
    {
      title: t("Actions"),
      render: (text, record) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="#"
            className="action-icon dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded={openDropdownId === record._id}
            onClick={(e) => handleDropdownClick(e, record._id)}
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div
            className={`dropdown-menu dropdown-menu-right ${
              openDropdownId === record._id ? "show" : ""
            }`}
          >
            <a
              className="dropdown-item"
              href="#"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(null);
                setOpen({
                  isAddOpen: false,
                  isDelOpen: true,
                  data: record,
                });
              }}
            >
              <i
                className={`fa ${
                  record.isArchived ? "fa-undo" : "fa-archive"
                } m-r-5`}
              />
              {record.isArchived ? t("Activate") : t("Archive")}
            </a>
            <a
              className="dropdown-item"
              href="#"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(null);
                setOpen({
                  isAddOpen: false,
                  isDelOpen: true,
                  data: { ...record, isDelete: true }, // Add isDelete flag to differentiate from archive action
                });
              }}
            >
              <i className="fa fa-trash-o m-r-5" /> {t("Delete")}
            </a>
          </div>
        </div>
      ),
    },
  ];

  const filteredColumns = (role === 'client' || role === 'focalperson')
    ? columns.filter(col => col.title !== t("Actions"))
    : columns;

  const onHandleDelete = (id, isDelete = false) => {
    setLoader(true);
    const endpoint = isDelete
      ? "taskBoard/delete-taskBoard"
      : "taskBoard/add-taskBoard";
    const method = isDelete ? "DELETE" : "PUT";
    const data = isDelete
      ? { _id: id }
      : { _id: id, isArchived: !open?.data?.isArchived };

    apiServices(method, endpoint, data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          handleClose();
          message.success(
            isDelete
              ? "Task board deleted successfully"
              : `Task board ${
                  open?.data?.isArchived ? "activated" : "archived"
                } successfully`
          );
          if (categoryObj?.docs?.length === 1) {
            GetListTaskBoards(categoryObj.totalPages - 1, null);
          } else {
            GetListTaskBoards();
          }
          setLoader(false);
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
              : isDelete
              ? "Error deleting taskboard"
              : "Error updating taskboard"
          }!`
        );
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
            No TaskBoards found
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

  // const handlePageChange = (page, pageSize) => {
  //   // Update the pagination state
  //   setPagination({
  //     ...pagination,
  //     current: page,
  //     pageSize: pageSize,
  //   });
  //   setIsLoading(true);
  //   GetListProjects(page, pageSize);
  // };

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
            <title>{t("Task Boards - DaftarPro")}</title>
            <meta name="description" content="Login page" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">{t("Task Boards")}</h3>
                </div>

                <div className="col-auto float-end ms-auto">
                  <div className="d-flex flex-wrap gap-2 justify-content-end">
                    <div style={{ minWidth: "180px" }}>
                      <Segmented
                        onChange={(val) => {
                          const isArchivedValue = val === "Archived";
                          setIsArchived(isArchivedValue);
                          setIsLoading(true);
                          GetListTaskBoards(
                            1,
                            pagination.pageSize,
                            isArchivedValue
                          );
                        }}
                        value={isArchived ? "Archived" : "Active"}
                        className="segmentStyle"
                        block
                        size="large"
                        options={[
                          {
                            label: t("Active"),
                            value: "Active",
                          },
                          {
                            label: t("Archived"),
                            value: "Archived",
                          },
                        ]}
                        style={{ width: "100%" }}
                      />
                    </div>
                    {(role === "admin" || permissions?.projectManagement) && (
                      <div>
                        <a
                          href="javascript:void(0)"
                          className="btn add-btn"
                          onClick={() => {
                            getProjects();
                            setOpen({
                              isAddOpen: true,
                              isDelOpen: false,
                              data: "",
                            });
                          }}
                        >
                          <i className="fa fa-plus" /> {t("Add TaskBoard")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive">
                  <Table
                    loading={isLoading}
                    className={tableData?.length > 0 ? "table-striped" : ""}
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
                    //     getHolidays(page, pageSize)
                    //   },
                    //   itemRender: itemRender,
                    // }}
                    style={{ overflowX: "auto" }}
                    columns={filteredColumns}
                    bordered
                    dataSource={tableData}
                    rowKey={(record) => record.id}
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
                    // onRow={ i18n.dir()==="rtl" ?
                    //   (record, rowIndex) => {
                    //   return {
                    //     style: { textAlign: 'right' }, // Align table data to the right
                    //   };
                    // } :
                    // null
                    // }
                    onRow={(record, rowIndex) => {
                      // Add conditional styles based on i18n direction
                      const rowStyle =
                        i18n.dir() === "rtl" ? { textAlign: "right" } : {};

                      // Return combined properties for the row
                      return {
                        style: { ...rowStyle, cursor: "pointer" },
                        onClick: () => {
                          nav(`/task-board/${record._id}`, {
                            state: { board: record },
                          });
                        }, // Add click handler
                      };
                    }}
                    // onChange={this.handleTableChange}
                  />
                </div>
                {tableData?.length > 0 && (
                  <div>
                    <Pagination
                      style={{ display: "flex", float: "right" }}
                      current={page}
                      pageSize={size}
                      total={pagination.total}
                      showTotal={(total, range) =>
                        t("paginationShow", {
                          range1: range[0],
                          range2: range[1],
                          total: total,
                        })
                      }
                      pageSizeOptions={["20", "30", "40", "50"]}
                      showSizeChanger
                      onChange={handlePaginationChange}
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

          <Modal
            open={open.isAddOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            className="modalScroll"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
              style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
            }}
            sx={{ overflowY: "auto" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Task Board</h5>
                  <button type="button" className="close" onClick={handleClose}>
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <Form
                    form={form}
                    name="control-hooks"
                    onFinish={(val) => onFinish(val, open?.data)}
                    onFinishFailed={({ errorFields }) => {
                      const consecutiveSpacesError = errorFields.find((field) =>
                        field.errors.toString().includes("consecutive spaces")
                      );
                      if (consecutiveSpacesError) {
                        message.error(
                          t("allEmp.errors.removeConsecutiveSpaces")
                        );
                      } else {
                        message.error(t("allEmp.errors.fillRequiredFields"));
                      }
                    }}
                    initialValues={{
                      holidayTitle: open?.data ? open?.data?.holidayTitle : "",
                      holidayDate: open?.data
                        ? moment(open?.data.holidayDate, "YYYY-MM-DD")
                        : "",
                    }}
                    autoComplete="off"
                  >
                    <div className="form-group">
                      <label>
                        {t("Title")} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="boardTitle"
                        rules={[
                          {
                            required: true,
                            message: t("Please enter a Title"),
                          },
                        ]}
                      >
                        <Input
                          maxLength={50}
                          className="form-control"
                          placeholder="Enter Title for your Taskboard"
                        />
                      </Form.Item>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{t("Associated with project")}</span>
                          <Switch
                            checked={isProjectAssociated}
                            onChange={(checked) =>
                              setIsProjectAssociated(checked)
                            }
                            // style={{ marginLeft: "10px" }}
                          />
                        </label>
                      </div>
                    </div>
                    {isProjectAssociated ? (
                      <div className="form-group">
                        <label>
                          {t("Tasks.project")}{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="projectId"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: t("Tasks.pleaseselectproject"),
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              onSearch={(val) => {
                                searchHandler(val, "project");
                              }}
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                              optionFilterProp="children"
                              notFoundContent={
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                              }
                              dropdownRender={(menu) => <>{menu}</>}
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder={t("Tasks.selectproject")}
                            >
                              {allProjects.map((project, index) => (
                                <Select.Option key={index} value={project._id}>
                                  {project.projectName}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    ) : (
                      <div className="row">
                        <div className="form-group">
                          <label>
                            {t("projectScreen.Modal.addTeam")}{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <div style={{ position: "relative" }} id="area">
                            <Form.Item
                              name="assignedDevelopers"
                              className="custom-border"
                              // rules={[
                              //   {
                              //     required: true,
                              //     message: t(
                              //       "projectScreen.Modal.teamCannotBeEmpty"
                              //     ),
                              //   },
                              // ]}
                            >
                              <Select
                                showSearch
                                onSearch={(val) => {
                                  showTeamSearch(val, "Team");
                                  // onTeamChange(val)
                                }}
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                optionFilterProp="children"
                                notFoundContent={
                                  loadingEmployee ? (
                                    <Spin
                                      style={{
                                        height: "38px",
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    />
                                  ) : (
                                    <Empty
                                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                  )
                                }
                                dropdownRender={(menu) => <>{menu}</>}
                                getPopupContainer={() =>
                                  document.getElementById("area")
                                }
                                className="custom-select custom-normal"
                                placeholder={t(
                                  "projectScreen.Modal.selectTeamMembers"
                                )}
                                onSelect={handleSelectDeveloper}
                              >
                                {getTeamMemberOptions()}
                              </Select>
                            </Form.Item>
                          </div>
                          <ul className="chat-user-list">
                            {selectedTeamMembers?.map((developer) => (
                              <li key={developer._id}>
                                <div
                                  className="employee-selection"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div>
                                    <img
                                      alt=""
                                      className="avatar"
                                      src={developer?.imageUrl || user_icon}
                                    />
                                    <span className="employee-name">
                                      {developer?.fullName}
                                    </span>
                                  </div>

                                  <MinusCircleFilled
                                    style={{ color: "red", cursor: "pointer" }}
                                    onClick={() =>
                                      handleRemoveDeveloper(developer?._id)
                                    }
                                  />
                                </div>
                                <hr
                                  className="developer-divider"
                                  style={{ opacity: "0.1" }}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
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
                            t("submit")
                          )}
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Modal>

          {/* Update the delete modal content to handle both archive and delete cases */}
          <Modal
            open={open.isDelOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
              style: { backgroundColor: "rgb(0 0 0 / 87%)" },
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
                      {open?.data?.isDelete
                        ? "Delete TaskBoard"
                        : open?.data?.isArchived
                        ? "Activate TaskBoard"
                        : "Archive TaskBoard"}
                    </h3>
                    <p>
                      {open?.data?.isDelete ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: t(
                              "Are you sure you want to <b>delete</b> this taskboard?<br/> deleting this taskboard will delete all the tasks associated with it."
                            ),
                          }}
                        />
                      ) : (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: t(
                              `Are you sure you want to <b>${
                                open?.data?.isArchived ? "activate" : "archive"
                              }</b>`
                            ),
                          }}
                        />
                      )}
                    </p>
                  </div>
                  <div className="modal-btn delete-action">
                    <div className="row">
                      <div className="col-6">
                        <Button
                          htmlType="submit"
                          className="btn btn-primary continue-btn"
                          onClick={() =>
                            open?.data?.isDelete
                              ? onHandleDelete(open?.data?._id, true)
                              : onHandleDelete(open?.data?._id)
                          }
                          disabled={loader}
                          style={{ width: "100%" }}
                        >
                          {loader ? (
                            <Spin size="small" indicator={antIcon} />
                          ) : open?.data?.isDelete ? (
                            t("Delete")
                          ) : open?.data?.isArchived ? (
                            t("Activate")
                          ) : (
                            t("Archive")
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
        </div>
      </div>
      <Offcanvas />
    </>
  );
};

export default TaskBoardList;
