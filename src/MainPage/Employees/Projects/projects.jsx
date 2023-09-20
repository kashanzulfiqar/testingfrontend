import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { DefaultEditor } from "react-simple-wysiwyg";
import { Link } from "react-router-dom";
import Editproject from "../../../_components/modelbox/Editproject";
import Offcanvas from "../../../Entryfile/offcanvance";
// import ReactSummernote from 'react-summernote';
// import 'react-summernote/dist/react-summernote.css'; // import styles
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import "../../index.css";
import {
  Avatar_16,
  Avatar_02,
  Avatar_05,
  Avatar_09,
  Avatar_10,
  Avatar_11,
  Avatar_12,
  Avatar_13,
  Avatar_01,
  user_icon,
} from "../../../Entryfile/imagepath";
import { useSelector } from "react-redux";
import {
  Avatar,
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { Modal } from "@mui/material";
import moment from "moment";
import { apiServices } from "../../../Services/apiServices";
import { itemRender } from "../../paginationfunction";
import EditProjects from "./EditProjects";
import { apiUploadToS3 } from "../../../Services/uploadImage";

const Projects = () => {
  const [form] = Form.useForm();
  const [html, setHtml] = React.useState("my <b>HTML</b>");

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [isLoading, setIsLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [uploadFiles, setUploadFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [deleteProj, setDeleteProj] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [view, setView] = useState("grid");
  const [selectedData, setSelectedData] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [clients, setClients] = useState([]);
  const [focalPersons, setFocalPersons] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const [paymentSchedules, setPaymentSchedules] = useState([
    // Initial payment schedule
    {
      paymentTitle: "",
      dueDate: null,
      amountInPercent: "",
      amountInFigure: "",
      paid: false,
    },
  ]);

  const addPaymentSchedule = () => {
    setPaymentSchedules([
      ...paymentSchedules,
      {
        paymentTitle: "",
        dueDate: null,
        amountInPercent: "",
        amountInFigure: "",
        paid: false,
      },
    ]);
  };

  const removeLastPaymentSchedule = () => {
    if (paymentSchedules.length > 1) {
      const updatedSchedules = [...paymentSchedules];
      updatedSchedules.pop(); // Remove the last payment schedule
      setPaymentSchedules(updatedSchedules);
    }
  };

  const getEmployeeImage = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee?.imageUrl || ""; // You may provide a default image URL
  };

  const getEmployeeFullName = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee ? employee.fullName : "";
  };

  const getTeamMemberOptions = () => {
    if (!selectedLeader) {
      return employees.map((employee) => (
        <Select.Option key={employee._id} value={employee._id}>
          {employee.fullName}
        </Select.Option>
      ));
    } else {
      return employees
        .filter((employee) => employee._id !== selectedLeader)
        .map((employee) => (
          <Select.Option key={employee._id} value={employee._id}>
            {employee.fullName}
          </Select.Option>
        ));
    }
  };

  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const openCreateModal = () => {
    setCreateModal(true);
  };

  const closeCreateModal = () => {
    setCreateModal(false);
    form.resetFields();
    setFocalPersons([]);
    setSelectedLeader(null);
    setSelectedTeamMembers([]);
    setPaymentSchedules([
      {
        paymentTitle: "",
        dueDate: null,
        amountInPercent: "",
        amountInFigure: "",
        paid: false,
      },
    ]);
  };

  const openEditModal = (data) => {
    setSelectedData(data);
    console.log(data);
    setEditModal(true);
  };

  const closeEditModal = () => {
    GetCardProjects();
    GetListProjects();
    setSelectedData(null);
    setEditModal(false);
    form.resetFields();
  };

  const openDelete = (proj) => {
    setToDelete(proj);
    //console.log(data);
    setDeleteProj(true);
  };

  const closeDelete = () => {
    setToDelete(null);
    setDeleteProj(false);
    form.resetFields();
  };

  const [filters, setFilters] = useState({
    projectName: "",
    clientName: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    projectName: "",
    clientName: "",
  });

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  const handleSearch = () => {
    setFilters(selectedFilters);
  };

  const handleReset = () => {
    setSelectedFilters({
      projectName: "",
      clientName: "",
    });
    setFilters({
      projectName: "",
      clientName: "",
    });

    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });

    form.resetFields();
  };

  useEffect(() => {
    ViewClients();
    fetchEmployees();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    GetCardProjects();
  }, [filters]);

  useEffect(() => {
    setIsLoading(true);
    GetListProjects();
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          setEmployees(emps);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Client Error"
          }`
        );
      });
  };

  const ViewClients = () => {
    apiServices(
      "GET",
      `client/view-client?deleted=false&page=1&limit=99999`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const clients = res?.data?.clients?.docs;
          setClients(clients);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Client Error"
          }`
        );
      });
  };

  const fetchFocalPersons = (clientId) => {
    apiServices(
      "GET",
      `focal-person/view-focal-person?deleted=false&clientId=${clientId}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const focalperson = res?.data?.focalPersons.docs;
          setFocalPersons(focalperson);
        }
      })
      .catch((err) => {
        // message.error(
        //   `Get Focal Person Error`
        // );
        console.log("error");
      });
  };

  const GetListProjects = () => {
    //setLoader(true);

    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    };

    apiServices(
      "GET",
      `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          if (params.page === 1) {
            setTableData(res?.data?.projects?.docs);
          } else {
            // If it's not the first page, append the data
            setTableData((prevData) => [
              ...prevData,
              ...res?.data?.projects?.docs,
            ]);
          }

          setIsLoading(false);
          setPagination({
            ...pagination,
            total: res.data.projects.totalDocs,
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
              : "Get Project Error"
          }`
        );
        setIsLoading(false);
      });
  };

  const GetCardProjects = () => {
    apiServices(
      "GET",
      `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&page=1&limit=99999`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          setData(res?.data?.projects?.docs);
          //setData(newProjects);
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
              : "Get Projects Error"
          }`
        );
        setIsLoading(false);
      });
  };

  const AddProject = (values) => {
    //setLoader(true);
    setIsLoading(true);

    let data = {
      projectName: values.projectName,
      projectDescription: values.projectDescription,
      clientId: values.clientId,
      focalPersonId: values.focalPersonId,
      startDate: moment(values.startDate).format("YYYY-MM-DD"),
      endDate: moment(values.endDate).format("YYYY-MM-DD"),
      cost: values.cost,
      costType: values.costType,
      priority: values.priority,
      projectLead: values.projectLead,
      assignedDevelopers: values.assignedDevelopers,
      status: values.status,
      docs: [
        "https://res.cloudinary.com/dcxpovyr9/image/upload/v1694068829/t91sxvwxqmkbnicpnfpl.png",
      ],
      paymentSchedule: values?.paymentSchedule,
    };

    apiServices("POST", `project-management/`, data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          //const payrolls=res?.data?.payrolls;
          //console.log(payrolls)
          //setData((prevData) => [...prevData, ...payrolls]);
          //setFilters(selectedPayFilters);
          //GetGenPayrolls();
          message.success(`Project Added`);
          setIsLoading(false);
          handleReset();
          closeCreateModal();
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Add Project Error"
          }`
        );
        closeCreateModal();
        setIsLoading(false);
      });
  };

  const handleViewToggle = (newView) => {
    setView(newView);
  };

  function onChange(e) {
    setHtml(e.target.value);
  }

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  const onImageUpload = (fileList) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      ReactSummernote.insertImage(reader.result);
    };
    reader.readAsDataURL(fileList[0]);
  };

  const columns = [
    {
      title: <b>Project Name</b>,
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <Link to={`/projects/projects-view/${record?._id}`}>
          <label>{text}</label>
        </Link>
      ),
    },
    {
      title: <b>Client Name</b>,
      dataIndex: "clientName",
      key: "clientName",
      render: (text, record) => (
        <div>
          <img
            src={record?.client?.logo || user_icon}
            alt=""
            className="avatar"
            style={{ width: "30px", height: "30px" }}
          />
          <span>{record?.client?.clientName}</span>
        </div>
      ),
    },
    {
      title: <b>Leader</b>,
      dataIndex: "projectLead",
      key: "projectLead",
      render: (projectLead) => (
        <ul className="team-members">
          <li>
            <Tooltip title={getEmployeeFullName(projectLead)}>
              <Avatar src={getEmployeeImage(projectLead) || user_icon} />
            </Tooltip>
          </li>
        </ul>
      ),
    },
    {
      title: <b>Team</b>,
      dataIndex: "assignedDevelopers",
      key: "assignedDevelopers",
      render: (assignedDevelopers) => (
        <ul className="team-members text-nowrap">
          {assignedDevelopers?.slice(0, 4).map((developer, index) => (
            <li key={index}>
              <Tooltip title={getEmployeeFullName(developer)}>
                <Avatar src={getEmployeeImage(developer) || user_icon} />
              </Tooltip>
            </li>
          ))}
          {assignedDevelopers?.length > 4 && (
            <li className="dropdown avatar-dropdown">
              <Link
                className="all-users dropdown-toggle projectTeamMember"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                +{assignedDevelopers?.length - 4}
              </Link>
              {/* Dropdown menu for additional team members */}
              <div className="dropdown-menu dropdown-menu-right">
                <div className="avatar-group">
                  {assignedDevelopers?.slice(4).map((developer, index) => (
                    <a
                      className="avatar avatar-xs projectTeamMember"
                      key={index}
                    >
                      <Tooltip title={getEmployeeFullName(developer)}>
                        <Avatar
                          src={getEmployeeImage(developer) || user_icon}
                        />
                      </Tooltip>
                    </a>
                  ))}
                </div>
                {/* Pagination for additional team members */}
                <div className="avatar-pagination">
                  <ul className="pagination">
                    <li className="page-item">
                      <a className="page-link" aria-label="Previous">
                        <span aria-hidden="true">«</span>
                        <span className="sr-only">Previous</span>
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link">1</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" aria-label="Next">
                        <span aria-hidden="true">»</span>
                        <span className="sr-only">Next</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          )}
        </ul>
      ),
    },
    {
      title: <b>Deadline</b>,
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: <b>Priority</b>,
      dataIndex: "priority",
      key: "priority",
      render: (record) => (
        <div className="action-label">
          <span
            className="btn btn-white btn-sm btn-rounded"
            style={{ pointerEvents: "none" }}
          >
            {record === "High Priority" && (
              <i className="fa fa-dot-circle-o text-danger" />
            )}
            {record === "Normal Priority" && (
              <i className="fa fa-dot-circle-o text-warning" />
            )}
            {record === "Low Priority" && (
              <i className="fa fa-dot-circle-o text-success" />
            )}
            {record === "High Priority"
              ? " High"
              : record === "Normal Priority"
              ? " Normal"
              : " Low"}
          </span>
        </div>
      ),
    },

    {
      title: <b>Status</b>,
      dataIndex: "status",
      key: "status",
      render: (record) => (
        <div className="action-label">
          <span
            className="btn btn-white btn-sm btn-rounded"
            style={{ pointerEvents: "none" }}
          >
            {record === "Scheduled" && (
              <i className="fa fa-dot-circle-o text-danger" />
            )}
            {record === "Ongoing" && (
              <i className="fa fa-dot-circle-o text-warning" />
            )}
            {record === "Paused" && (
              <i className="fa fa-dot-circle-o text-secondary" />
            )}
            {record === "Archived" && (
              <i className="fa fa-dot-circle-o text-secondary" />
            )}
            {record === "Completed" && (
              <i className="fa fa-dot-circle-o text-success" />
            )}
            {record === "Scheduled"
              ? " Scheduled"
              : record === "Ongoing"
              ? " Ongoing"
              : record === "Paused"
              ? " Paused"
              : record === "Archived"
              ? " Archived"
              : record === "Completed"
              ? " Completed"
              : ""}
          </span>
        </div>
      ),
    },
    {
      title: <b>Action</b>,
      dataIndex: "action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <div className="dropdown dropdown-action profile-action">
          <a
            className="action-icon dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <button
              className="dropdown-item"
              onClick={() => {
                openEditModal(record);
                form.setFieldsValue({
                  ...record,
                  startDate: moment(record?.startDate, "YYYY-MM-DD"),
                  endDate: moment(record?.endDate, "YYYY-MM-DD"),
                });
              }}
            >
              <i className="fa fa-pencil m-r-5" />
              Edit
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                openDelete(record);
              }}
            >
              <i className="fa fa-trash-o m-r-5" /> Delete
            </button>
          </div>
        </div>
      ),
    },
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

  const DeleteProject = () => {
    //setLoader(true);
    setIsLoading(true);

    let data = {
      _id: toDelete._id,
    };

    apiServices("DELETE", `project-management/`, data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          //const payrolls=res?.data?.payrolls;
          //console.log(payrolls)
          //setData((prevData) => [...prevData, ...payrolls]);
          //setFilters(selectedPayFilters);
          //GetGenPayrolls();
          message.success(`Project Deleted`);
          setIsLoading(false);
          handleReset();
          closeDelete();
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error Deleting Project"
          }`
        );
        closeDelete();
        setIsLoading(false);
      });
  };

  const UpdateProject = (values) => {
    //setLoader(true);
    setIsLoading(true);

    let data = {
      _id: selectedData._id,
      projectName: values.projectName,
      projectDescription: values.projectDescription,
      clientId: values.clientId,
      focalPersonId: values.focalPersonId,
      startDate: moment(values.startDate).format("YYYY-MM-DD"),
      endDate: moment(values.endDate).format("YYYY-MM-DD"),
      cost: values.cost,
      costType: values.costType,
      priority: values.priority,
      projectLead: values.projectLead,
      assignedDevelopers: values.assignedDevelopers,
      status: values.status,
      docs: [
        "https://res.cloudinary.com/dcxpovyr9/image/upload/v1694068829/t91sxvwxqmkbnicpnfpl.png",
      ],
      paymentSchedule: [
        {
          paymentTitle: "Payment 1",
          dueDate: "2023-09-10",
          amountInPercent: "10",
          amountInFigure: "1500",
          paid: false,
        },
        {
          paymentTitle: "Payment 1",
          dueDate: "2023-09-10",
          amountInPercent: "10",
          amountInFigure: "1500",
          paid: false,
        },
        {
          paymentTitle: "Payment 1",
          dueDate: "2023-09-10",
          amountInPercent: "10",
          amountInFigure: "1500",
          paid: false,
        },
      ],
      deleted: false,
      companyId: selectedData.companyId,
    };

    apiServices("PUT", `project-management/`, data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(`Project Details Updated Successfully`);
          setIsLoading(false);
          handleReset();
          setSelectedData(null);
          closeEditModal();
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error Updating Project Details"
          }`
        );
        closeEditModal();
        setSelectedData(null);
        setIsLoading(false);
      });
  };

  const onFileUpload = async (files) => {
    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log("File: ", file);

      const uploadPromise = apiUploadToS3(file)
        .then((res) => {
          console.log(res?.data?.result);
          return res?.data?.result;
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "uploadFile Error"
            }!`
          );
          throw err;
        });

      uploadPromises.push(uploadPromise);
    }

    try {
      // Wait for all upload promises to resolve
      const urls = await Promise.all(uploadPromises);

      // Add the uploaded URLs to the uploadFiles state array
      setUploadFiles((prevUploadFiles) => [...prevUploadFiles, ...urls]);
      e.target.files = null;
    } catch (error) {
      // Handle any errors that occurred during file uploads
      console.error("File upload error:", error);
    }
  };

  const removeSelectedFile = (index) => {
    const updatedSelectedFiles = [...selectedFiles];
    updatedSelectedFiles.splice(index, 1);
    setSelectedFiles(updatedSelectedFiles);

    // Remove the corresponding file from the uploadFiles state array
    const updatedUploadFiles = [...uploadFiles];
    updatedUploadFiles.splice(index, 1);
    setUploadFiles(updatedUploadFiles);
  };

  const openCloudinaryLink = (url) => {
    // Open the Cloudinary link in a new tab
    window.open(url, "_blank");
  };

  const generateCustomFileName = (fileUrl, index) => {
    // Extract the file extension from the URL
    const fileExtension = fileUrl?.split(".").pop();
    return `File ${index + 1}.${fileExtension}`;
  };

  const displaySelectedFiles = () => {
    return selectedFiles?.map((file, index) => (
      <Space key={index}>
        <Tag
          closable
          onClose={() => removeSelectedFile(index)}
          color="blue" // You can customize the color as needed
          className="custom-tag"
        >
          {file.name || generateCustomFileName(file, index)}
        </Tag>
      </Space>
    ));
  };

  return (
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>Projects - DaftarPro</title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Projects</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link
                      to={
                        role === "admin"
                          ? "/main/dashboard"
                          : "/employee/dashboard"
                      }
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Projects</li>
                </ul>
              </div>
              <div className="col-auto float-end ms-auto">
                <button
                  className="btn add-btn"
                  onClick={() => openCreateModal()}
                >
                  <i className="fa fa-plus" />
                  Create Project
                </button>

                <div className="view-icons">
                  <button
                    onClick={() => handleViewToggle("grid")}
                    className={`grid-view btn btn-link ${
                      view === "grid" ? "active" : ""
                    }`}
                  >
                    <i className="fa fa-th" />
                  </button>
                  <button
                    onClick={() => {
                      handleViewToggle("list");
                      GetListProjects();
                    }}
                    className={`list-view btn btn-link ${
                      view === "list" ? "active" : ""
                    }`}
                  >
                    <i className="fa fa-bars" />
                  </button>

                  {/* <Link to="/projects/project_dashboard" className="grid-view btn btn-link active"><i className="fa fa-th" /></Link>
                  <Link to="/projects/projects-list" className="list-view btn btn-link"><i className="fa fa-bars" /></Link> */}
                </div>
              </div>
            </div>
          </div>
          {/* /Page Header */}

          {/* Search Filter */}
          <Form form={form} onFinish={handleSearch}>
            <div className="row filter-row">
              <div className="col-sm-6 col-md-3">
                <div className="form-group">
                  <Form.Item name="projectName" className="custom-border">
                    <Input
                      className="form-control"
                      allowClear={false}
                      placeholder="Select Project Name"
                      onChange={(e) =>
                        handleFilterChange(e.target.value, "projectName")
                      }
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <div className="form-group">
                  <Form.Item name="clientName" className="custom-border">
                    <Select
                      placeholder="Select a Client"
                      onChange={(value) => {
                        handleFilterChange(value, "clientName");
                      }}
                    >
                      {clients.map((client) => (
                        <Select.Option
                          key={client._id}
                          value={client.clientName}
                        >
                          {client.clientName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="btn-success btn-block w-100"
                  //disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                  style={{ borderRadius: "5px" }}
                >
                  <span className="d-flex justify-content-center">Search</span>
                </Button>
              </div>
              <div className="col-sm-6 col-md-3">
                <Button
                  htmlType="button"
                  className="btn-secondary btn-block w-100"
                  onClick={handleReset}
                  //disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                  style={{
                    backgroundColor: "#616161",
                    borderColor: "#616161",
                    borderRadius: "5px",
                  }}
                >
                  <span className="d-flex justify-content-center">Reset</span>
                </Button>
              </div>
            </div>
          </Form>

          {view === "grid" ? (
            <div className="row">
              {/* Render the grid view */}
              {isLoading ? (
                <div className="col-md-12 text-center">
                  <Spin size="large" tip="Loading..." />
                </div>
              ) : data?.length > 0 ? (
                // Render grid items when data is available
                data?.map((project, index) => (
                  <div
                    className="col-lg-4 col-sm-6 col-md-4 col-xl-3"
                    key={index}
                  >
                    <div className="card">
                      <div className="card-body">
                        <div className="dropdown dropdown-action profile-action">
                          <a
                            className="action-icon dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="material-icons">more_vert</i>
                          </a>
                          <div className="dropdown-menu dropdown-menu-right">
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                openEditModal(project);
                                form.setFieldsValue({
                                  ...project,
                                  startDate: moment(
                                    project?.startDate,
                                    "YYYY-MM-DD"
                                  ),
                                  endDate: moment(
                                    project?.endDate,
                                    "YYYY-MM-DD"
                                  ),
                                });
                              }}
                            >
                              <i className="fa fa-pencil m-r-5" />
                              Edit
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                openDelete(project);
                              }}
                            >
                              <i className="fa fa-trash-o m-r-5" /> Delete
                            </button>
                          </div>
                        </div>
                        <h4 className="project-title">
                          <Link to={`/projects/projects-view/${project?._id}`}>
                            {project?.projectName}
                          </Link>
                        </h4>
                        {/* <small className="block text-ellipsis m-b-15">
                        <span className="text-xs">1</span>{" "}
                        <span className="text-muted">open tasks, </span>
                        <span className="text-xs">9</span>{" "}
                        <span className="text-muted">tasks completed</span>
                      </small> */}
                        <div style={{ height: "110px" }}>
                          <p className="text-muted longText1">
                            {project?.projectDescription}
                          </p>
                        </div>

                        <div className="pro-deadline m-b-15">
                          <div className="sub-title">Deadline:</div>
                          <div className="text-muted">{project?.endDate}</div>
                        </div>
                        <div className="project-members m-b-15">
                          <div>Project Leader :</div>
                          <ul className="team-members">
                            <li>
                              <a
                                data-bs-toggle="tooltip"
                                title={getEmployeeFullName(
                                  project?.projectLead
                                )}
                              >
                                <img
                                  alt=""
                                  src={
                                    getEmployeeImage(project?.projectLead) ||
                                    user_icon
                                  }
                                />
                              </a>
                            </li>
                          </ul>
                        </div>
                        <div className="project-members m-b-15">
                          <div>Team :</div>
                          <ul className="team-members">
                            {project?.assignedDevelopers
                              ?.slice(0, 4)
                              ?.map((developer, devIndex) => (
                                <li key={devIndex}>
                                  <a
                                    className="projectTeamMember"
                                    data-bs-toggle="tooltip"
                                    title={getEmployeeFullName(developer)}
                                  >
                                    <img
                                      alt=""
                                      src={
                                        getEmployeeImage(developer) || user_icon
                                      }
                                    />
                                  </a>
                                </li>
                              ))}
                            {project?.assignedDevelopers?.length > 4 && (
                              <li className="dropdown avatar-dropdown">
                                <a
                                  className="all-users dropdown-toggle projectTeamMember"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  +{project?.assignedDevelopers?.length - 4}
                                </a>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <div className="avatar-group">
                                    {project?.assignedDevelopers
                                      ?.slice(4)
                                      .map((developer, devIndex) => (
                                        <a
                                          className="avatar avatar-xs projectTeamMember"
                                          key={devIndex}
                                        >
                                          <Tooltip
                                            title={getEmployeeFullName(
                                              developer
                                            )}
                                          >
                                            <Avatar
                                              src={
                                                getEmployeeImage(developer) ||
                                                user_icon
                                              }
                                            />
                                          </Tooltip>
                                        </a>
                                      ))}
                                  </div>
                                  <div className="avatar-pagination">
                                    <ul className="pagination">
                                      <li className="page-item">
                                        <a
                                          className="page-link"
                                          aria-label="Previous"
                                        >
                                          <span aria-hidden="true">«</span>
                                          <span className="sr-only">
                                            Previous
                                          </span>
                                        </a>
                                      </li>
                                      <li className="page-item">
                                        <a className="page-link">1</a>
                                      </li>
                                      <li className="page-item">
                                        <a className="page-link" href="#">
                                          2
                                        </a>
                                      </li>
                                      <li className="page-item">
                                        <a
                                          className="page-link"
                                          aria-label="Next"
                                        >
                                          <span aria-hidden="true">»</span>
                                          <span className="sr-only">Next</span>
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>
                        {/* <p className="m-b-5">
                        Progress{" "}
                        <span className="text-success float-end">40%</span>
                      </p>
                      <div className="progress progress-xs mb-0">
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          data-bs-toggle="tooltip"
                          title="40%"
                          style={{ width: "40%" }}
                        />
                      </div> */}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Render custom empty text when no data is available
                <div className="col-md-12 text-center">{customEmptyText}</div>
              )}
            </div>
          ) : (
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive">
                  <Table
                    locale={{
                      emptyText: isLoading ? (
                        <Spin size="large" tip="Loading..." />
                      ) : (
                        customEmptyText
                      ),
                    }}
                    className="table-striped custom-table datatable"
                    loading={isLoading}
                    //style={{ height: "400px", background: "white" }}
                    columns={columns}
                    // bordered
                    dataSource={tableData}
                    //rowKey={(record) => record?._id}
                    pagination={{
                      current: pagination.current,
                      pageSize: pagination.pageSize,
                      total: pagination.total,
                      showTotal: (total, range) =>
                        `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                      pageSizeOptions: ["10", "20", "30", "40"], // Options to change page size
                      showSizeChanger: true, // Show the page size changer
                      onChange: (page, pageSize) => {
                        setPagination({
                          ...pagination,
                          current: page,
                          pageSize: pageSize,
                        });
                      },
                      itemRender: itemRender,
                    }}
                    // onChange={this.handleTableChange}
                  />
                </div>
                {/* {
                  data?.length > 0 &&
                  <div>
                    <Pagination
                      style={{display: 'flex', float: 'right'}}
                      total={pagination.total}
                      pageSize={pagination.pageSize}
                      defaultCurrent={1}
                      current={pagination.current}
                      showTotal={(total, range) =>
                        `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                      onChange={(page, size) => {
                        
                        console.log(page, size);
                        //setPageSize(size); setCurrentPage(page);
                        //getEmployeeSalary(filterValues, page, size)
                        GetListProjects(page, size);
                      }}
                      showSizeChanger={true}
                      pageSizeOptions={['10', '20', '30', '0']}
                      itemRender={itemRender}
                    />
                  </div>
                    } */}
              </div>
            </div>
          )}
        </div>

        {/* /Page Content */}
        {/* Create Project Modal */}
        <div
          id="create_project"
          className="modal custom-modal fade"
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Project</h5>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Project Name</label>
                        <input className="form-control" type="text" />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Client</label>
                        <select className="select">
                          <option>Global Technologies</option>
                          <option>Delta Infotech</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Start Date</label>
                        <div>
                          <input
                            className="form-control datetimepicker"
                            type="date"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>End Date</label>
                        <div>
                          <input
                            className="form-control datetimepicker"
                            type="date"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Rate</label>
                        <input
                          placeholder="$50"
                          className="form-control"
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>&nbsp;</label>
                        <select className="select">
                          <option>Hourly</option>
                          <option>Fixed</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Priority</label>
                        <select className="select">
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Add Project Leader</label>
                        <input className="form-control" type="text" />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Team Leader</label>
                        <div className="project-members">
                          <a
                            href="#"
                            data-bs-toggle="tooltip"
                            title="Jeffery Lalor"
                            className="avatar"
                          >
                            <img src={Avatar_16} alt="" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Add Team</label>
                        <input className="form-control" type="text" />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Team Members</label>
                        <div className="project-members">
                          <a
                            href="#"
                            data-bs-toggle="tooltip"
                            title="John Doe"
                            className="avatar"
                          >
                            <img src={Avatar_16} alt="" />
                          </a>
                          <a
                            href="#"
                            data-bs-toggle="tooltip"
                            title="Richard Miles"
                            className="avatar"
                          >
                            <img src={Avatar_09} alt="" />
                          </a>
                          <a
                            href="#"
                            data-bs-toggle="tooltip"
                            title="John Smith"
                            className="avatar"
                          >
                            <img src={Avatar_10} alt="" />
                          </a>
                          <a
                            href="#"
                            data-bs-toggle="tooltip"
                            title="Mike Litorus"
                            className="avatar"
                          >
                            <img src={Avatar_05} alt="" />
                          </a>
                          <span className="all-team">+2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    {/* <ReactSummernote
                      value="Default value"
                      options={{
                        lang: 'ru-RU',
                        height: 350,
                        dialogsInBody: true,
                        toolbar: [
                          ['style', ['style']],
                          ['font', ['bold', 'underline', 'clear']],
                          ['fontname', ['fontname']],
                          ['para', ['ul', 'ol', 'paragraph']],
                          ['table', ['table']],
                          ['insert', ['link', 'picture', 'video']],
                          ['view', ['fullscreen', 'codeview']]
                        ]
                      }}
                      // onChange={this.onChange}
                      onImageUpload={onImageUpload}
                    /> */}
                    <DefaultEditor value={html} onChange={onChange} />
                    {/* <textarea rows={4} className="form-control summernote" placeholder="Enter your message here" defaultValue={""} /> */}
                  </div>
                  <div className="form-group">
                    <label>Upload Files</label>
                    <input className="form-control" type="file" />
                  </div>
                  <div className="submit-section">
                    <button className="btn btn-primary submit-btn">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* /Create Project Modal */}
        <Modal
          open={createModal}
          onClose={closeCreateModal}
          aria-labelledby="modal-modal-title"
          className="modalScroll"
          aria-describedby="modal-modal-description"
          disableRestoreFocus
          BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
          }}
          sx={{ overflowY: "auto" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Project</h5>

                <button
                  type="button"
                  className="close"
                  onClick={closeCreateModal}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="modal-body">
                <Form
                  form={form}
                  onFinish={AddProject}
                  onFinishFailed={({ errorFields }) => {
                    const consecutiveSpacesError = errorFields.find((field) =>
                      field.errors.toString().includes("consecutive spaces")
                    );
                    if (consecutiveSpacesError) {
                      message.error("Please Remove Consecutive Spaces!");
                    } else {
                      message.error("Please Fill Required Fields!");
                    }
                  }}
                  name="control-hooks"
                >
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Project Name</label>
                        <Form.Item
                          name="projectName"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Enter the Project Name.",
                            },
                          ]}
                        >
                          <Input
                            className="form-control"
                            placeholder="Enter Project Name"
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Client</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="clientId"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Choose a Client.",
                              },
                            ]}
                          >
                            <Select
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select a Client"
                              onChange={(value) => {
                                // Set the selected client when it changes
                                setSelectedClient(value);

                                form.setFieldsValue({ focalPersonId: null });
                                // Fetch the focal persons based on the selected client
                                fetchFocalPersons(value);
                              }}
                            >
                              {clients?.map((client) => (
                                <Select.Option
                                  key={client._id}
                                  value={client._id}
                                >
                                  {client.clientName}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Focal Person</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="focalPersonId"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Select a Focal Person",
                              },
                            ]}
                          >
                            <Select
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select a Focal Person"
                            >
                              {focalPersons?.map((focalPerson) => (
                                <Select.Option
                                  key={focalPerson._id}
                                  value={focalPerson._id}
                                >
                                  {focalPerson?.focalPersonName}{" "}
                                  {/* Adjust the field name as needed */}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Project Status</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="status"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Choose a status",
                              },
                            ]}
                          >
                            <Select
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select a Cost Type"
                            >
                              <Select.Option value="Paused">
                                Paused
                              </Select.Option>
                              <Select.Option value="Scheduled">
                                Scheduled
                              </Select.Option>
                              <Select.Option value="Ongoing">
                                Ongoing
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Start Date</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="startDate"
                            rules={[
                              {
                                required: true,
                                message: "Enter a start date",
                              },
                            ]}
                            className="custom-border"
                          >
                            <DatePicker
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              style={{ width: "100%" }}
                              className="form-control"
                              size="large"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>End Date</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="endDate"
                            rules={[
                              {
                                required: true,
                                message: "Enter an end date",
                              },
                            ]}
                            className="custom-border"
                          >
                            <DatePicker
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              style={{ width: "100%" }}
                              className="form-control"
                              size="large"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Cost</label>

                        <Form.Item
                          name="cost"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Please enter the cost.",
                            },
                          ]}
                        >
                          <Input type="number" className="form-control" />
                        </Form.Item>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Cost Type</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="costType"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Choose a cost type",
                              },
                            ]}
                          >
                            <Select
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select a Cost Type"
                            >
                              <Select.Option value="hourly">
                                Hourly
                              </Select.Option>
                              <Select.Option value="fixed">Fixed</Select.Option>
                              <Select.Option value="monthly">
                                Monthly
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Priority</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="priority"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Choose a priority",
                              },
                            ]}
                          >
                            <Select
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Choose a Priority"
                            >
                              <Select.Option value="High Priority">
                                High Priority
                              </Select.Option>
                              <Select.Option value="Normal Priority">
                                Normal Priority
                              </Select.Option>
                              <Select.Option value="Low Priority">
                                Low Priority
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Leader</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="projectLead"
                            rules={[
                              {
                                required: true,
                                message: "Select a Leader",
                              },
                            ]}
                          >
                            <Select
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select a Leader"
                              onChange={(value) => setSelectedLeader(value)}
                            >
                              {employees?.map((employee) => (
                                <Select.Option
                                  key={employee._id}
                                  value={employee._id}
                                >
                                  {employee.fullName}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Team Leader</label>
                        <div className="project-members">
                          {selectedLeader && (
                            <a
                              data-bs-toggle="tooltip"
                              title={getEmployeeFullName(selectedLeader)}
                              className="avatar"
                            >
                              <img
                                src={
                                  getEmployeeImage(selectedLeader) || user_icon
                                }
                                alt=""
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Add Team</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="assignedDevelopers"
                            rules={[
                              {
                                required: true,
                                message: "Team cannot be empty",
                              },
                            ]}
                          >
                            <Select
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              className="customselect-height"
                              mode="multiple"
                              placeholder="Select Team Members"
                              onChange={(values) =>
                                setSelectedTeamMembers(values)
                              }
                            >
                              {getTeamMemberOptions()}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Team Members</label>
                        <div className="project-members">
                          {selectedTeamMembers
                            ?.slice(0, 4)
                            .map((teamMember) => (
                              <a
                                key={teamMember}
                                data-bs-toggle="tooltip"
                                title={getEmployeeFullName(teamMember)}
                                className="avatar"
                              >
                                <img
                                  src={
                                    getEmployeeImage(teamMember) || user_icon
                                  }
                                  alt=""
                                />
                              </a>
                            ))}
                          {selectedTeamMembers?.length > 4 && (
                            <span className="all-team">
                              +{selectedTeamMembers?.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <Form.Item
                      name="projectDescription"
                      rules={[
                        {
                          required: true,
                          message: "Enter a Project Description",
                        },
                      ]}
                      className="custom-border"
                    >
                      <Input.TextArea className="form-control" rows={5} />
                    </Form.Item>
                    {/* <textarea rows={4} className="form-control summernote" placeholder="Enter your message here" defaultValue={""} /> */}
                  </div>

                  <div className="form-group">
                    <label>Upload Files</label>
                    <input
                      className="form-control"
                      multiple
                      onChange={(e) => {
                        onFileUpload(e.target.files);
                        setSelectedFiles([...selectedFiles, ...e.target.files]);
                      }}
                      type="file"
                    />
                  </div>
                  <div className="selected-files">{displaySelectedFiles()}</div>
                  <hr
                    className="developer-divider"
                    style={{ opacity: "0", marginTop: "0px" }}
                  />
                  <hr
                    className="developer-divider"
                    style={{ opacity: "0", marginTop: "0px" }}
                  />

                  {paymentSchedules.map((schedule, index) => (
                    <div key={index}>
                      {index > 0 && <hr />}

                      <h5
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                          alignItems: "center",
                        }}
                      >
                        Payment {index + 1}
                        {index === paymentSchedules.length - 1 &&
                          paymentSchedules.length > 1 && (
                            <Button
                              type="link"
                              onClick={removeLastPaymentSchedule}
                            >
                              Remove
                            </Button>
                          )}
                      </h5>

                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>Payment Title</label>
                            <Form.Item
                              name={["paymentSchedule", index, "paymentTitle"]}
                              className="custom-border"
                              rules={[
                                {
                                  required: true,
                                  message: "Enter a Payment Title",
                                },
                              ]}
                            >
                              <Input className="form-control" />
                            </Form.Item>
                          </div>
                        </div>

                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>Amount in Figure</label>
                            <Form.Item
                              name={[
                                "paymentSchedule",
                                index,
                                "amountInFigure",
                              ]}
                              className="custom-border"
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter the amount in figure.",
                                },
                              ]}
                            >
                              <Input className="form-control" />
                            </Form.Item>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>Amount in Percent</label>
                            <Form.Item
                              name={[
                                "paymentSchedule",
                                index,
                                "amountInPercent",
                              ]}
                              className="custom-border"
                              rules={[
                                {
                                  required: true,
                                  message:
                                    "Please enter the amount in percentage.",
                                },
                              ]}
                            >
                              <Input className="form-control" />
                            </Form.Item>
                          </div>
                        </div>

                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>Due Date</label>
                            <Form.Item
                              name={["paymentSchedule", index, "dueDate"]}
                              className="custom-border"
                              rules={[
                                {
                                  required: true,
                                  message: "Select a due date",
                                },
                              ]}
                            >
                              <DatePicker
                                style={{ width: "100%" }}
                                className="form-control"
                                size="large"
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="submit-section">
                    <Form.Item>
                      <Button type="primary" onClick={addPaymentSchedule}>
                        Add More Payments
                      </Button>
                    </Form.Item>
                    <hr />
                  </div>

                  <div className="submit-section">
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                      >
                        Submit
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </Modal>

        {/* Edit Project Modal */}

        {editModal && (
          <EditProjects
            data={selectedData}
            editModal={editModal}
            closeEditModal={closeEditModal}
          />
        )}

        {/* Delete Project Modal */}
        <Modal
          open={deleteProj}
          onClose={closeDelete}
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
                  <h3 style={{ marginBottom: "30px" }}>Delete Project</h3>
                  <p>Are you sure you want to Delete ?</p>
                </div>
                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <Button
                        htmlType="submit"
                        className="btn btn-primary continue-btn"
                        onClick={() => DeleteProject(toDelete)}
                        style={{ width: "100%" }}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        onClick={closeDelete}
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
      </div>
      <Offcanvas />
    </>
  );
};

export default Projects;
