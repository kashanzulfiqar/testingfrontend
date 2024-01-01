import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { DefaultEditor } from "react-simple-wysiwyg";
import { Link, useNavigate } from "react-router-dom";
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
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
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
import { LoadingOutlined, MinusCircleFilled } from "@ant-design/icons";
import { getAllISOCodes } from 'iso-country-currency';

const Projects = () => {
  const [form] = Form.useForm();
  const [html, setHtml] = React.useState("my <b>HTML</b>");

  const user_state = useSelector((state) => state.user.loginvalue);
  const employee_id = user_state?.user?._id;
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role
  //console.log(permissions,user_state)
  const nav = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [allDomain, setAllDomain] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [allCurrencies, setAllCurrencies] = useState([]);

  const [uploadFiles, setUploadFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [deleteProj, setDeleteProj] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [view, setView] = useState("grid");
  const [selectedData, setSelectedData] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [clients, setClients] = useState([]);
  const [focalPersons, setFocalPersons] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [flag, setFlag] = useState(false);
  const [categoryObj, setCategoryObj] = useState();
  const [loader, setLoader] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [projectType, setProjectType] = useState("");

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

  const removePaymentSchedule = (indexToRemove) => {
    const updatedSchedules = paymentSchedules.filter(
      (_, index) => index !== indexToRemove
    );
    setPaymentSchedules(updatedSchedules);
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
    return employees.map((employee) => (
      <Select.Option key={employee._id} value={employee._id}>
        {employee.fullName}
      </Select.Option>
    ));
    // if (!selectedLeader) {
    //   return employees.map((employee) => (
    //     <Select.Option key={employee._id} value={employee._id}>
    //       {employee.fullName}
    //     </Select.Option>
    //   ));
    // } else {
    //   return employees
    //     .filter((employee) => employee._id !== selectedLeader)
    //     .map((employee) => (
    //       <Select.Option key={employee._id} value={employee._id}>
    //         {employee.fullName}
    //       </Select.Option>
    //     ));
    // }
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
    setSelectedFiles([]);
    setUploadFiles([]);
    setLoader(false);
    //GetCardProjects();
    //GetListProjects();
  };

  const openEditModal = (data) => {
    setSelectedData(data);
    //console.log(data);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedData(null);
    setEditModal(false);
    form.resetFields();
    setLoader(false);
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
    setLoader(false);
  };

  const [filters, setFilters] = useState({
    projectName: "",
    clientName: "",
    projectDomain: "",
    projectType: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    projectName: "",
    clientName: "",
    projectDomain: "",
    projectType: "",
  });

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
      projectType: "",
    });
    setFilters({
      projectName: "",
      clientName: "",
      projectDomain: "",
      projectType: "",
    });

    form.resetFields();
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
    });

  };

  useEffect(() => {
    getAllDomain();
    fetchEmployees();
  }, []);

  useEffect(() => {
    //if(role === 'admin' || permissions?.projectManagement ) { 
      if(!flag){
        setIsLoading(true);
        GetListProjects();
      }
      
    //   getAllDomain();
    // }else{
    //    nav('/restricted', { state: { unAuthorize: true}})
    // }
  }, [filters, pagination.current, pagination.pageSize]); 


  const getAllDomain = () => {
    apiServices("GET", "team/view-team", null, user_state)
    .then((res) => {
      // console.log(res?.data);
      if (res?.data?.success === true) {
        const all_domains = res?.data?.Team;
        const sortedData = all_domains.slice().sort((a, b) => a.teamName.localeCompare(b.teamName));
        setAllDomain(sortedData);
      }
    })
    .catch((err) => {
      // console.log(err);
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Get Domain Info Error"
        }!`
      );
    });
  }

  const fetchEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          const sortedData = emps.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
          setEmployees(sortedData);
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
      `client/all-client`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const clients = res?.data?.clients;
          const sortedData = clients.slice().sort((a, b) => a.clientName.localeCompare(b.clientName));
          setClients(sortedData);
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
          const sortedData = focalperson.slice().sort((a, b) => a.focalPersonName.localeCompare(b.focalPersonName));
          setFocalPersons(sortedData);
        }
      })
      .catch((err) => {
        // message.error(
        //   `Get Focal Person Error`
        // );
        console.log("error");
      });
  };

  const GetListProjects = (page, pageSize) => {
    //setLoader(true);

    const params = {
      ...filters,
      page: page || pagination.current,
      limit: pageSize ? pageSize : pagination.pageSize,
    };

    apiServices(
      "GET",
      // `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&page=${params.page}&limit=${params.limit}`,
      `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&projectDomain=${filters.projectDomain}&projectType=${filters.projectType}&employeeId=${(role === '' && !permissions?.projectManagement) ? employee_id : ''}&page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          setCategoryObj(res?.data?.projects);
          setTableData(res?.data?.projects?.docs);
 
          setIsLoading(false);
          // setPagination({
          //   ...pagination,
          //   total: res.data.projects.totalDocs,
          // });
          setFlag(true);
          setPagination({
            ...pagination,
            current : res.data.projects.page,
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
      }).then(()=>{
        setFlag(false);
      });
  };

  const GetCardProjects = () => {
    apiServices(
      "GET",
      // `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&page=1&limit=99999`,
      `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&projectDomain=${filters.projectDomain}&projectType=${filters.projectType}&page=1&limit=99999`,
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
    setLoader(true);
    setIsLoading(true);

    const { paymentSchedule, cost } = values;

    // Calculate total amount from payment schedule
    const totalAmountInFigure = paymentSchedule?.reduce(
      (total, schedule) => total + parseFloat(schedule.amountInFigure || 0),
      0
    );
  
    if (totalAmountInFigure > cost) {
      const errorMessage = 'Total amount exceeds the project cost.';
      const errorFields = [];

      paymentSchedule.forEach((schedule, index) => {
        const scheduleAmount = parseFloat(schedule.amountInFigure || 0);
  
        if (scheduleAmount + totalAmountInFigure - scheduleAmount > cost) {
          errorFields.push({
            name: ['paymentSchedule', index, 'amountInFigure'],
            errors: [errorMessage],
          });
        }
      });

      form.setFields(errorFields);
      setLoader(false);
      return; // Prevent submission if total exceeds cost
    }

    let data = {
      projectName: values.projectName,
      projectDescription: values.projectDescription,
      clientId: values.clientId,
      focalPersonId: values.focalPersonId,
      startDate: moment(values.startDate).format("YYYY-MM-DD"),
      endDate: moment(values.endDate).format("YYYY-MM-DD"),
      projectDomain: values.projectDomain,
      projectType: values.projectType,
      currency: values.currency,
      cost: values.cost,
      costType: values.costType,
      priority: values.priority,
      projectLead: values.projectLead,
      assignedDevelopers: values.assignedDevelopers,
      status: values.status,
      docs: uploadFiles,
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
          GetListProjects();
          closeCreateModal();
          setLoader(false);
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
        setLoader(false);
      });
  };

  const handleViewToggle = (newView) => {
    setView(newView);
  };

  const emptyfunction = () =>{
    return null
  }

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

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  const columns = [
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <Link to={`/projects/projects-view/${record?._id}`} style={{color: '#333333'}}>
          <label style={{cursor: 'pointer'}} className="longText">{text}</label>
        </Link>
      ),
    },
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
      render: (text, record) => (
        <div style={{minWidth: 'max-content'}}>
          <img
            src={record?.client?.logo || user_icon}
            alt=""
            className="avatar"
            style={{ width: "30px", height: "30px" }}
          />
          <label>{record?.client?.clientName}</label>
        </div>
      ),
    },
    {
      title: "Leader",
      dataIndex: "projectLead",
      key: "projectLead",
      render: (projectLead) => (
        // <ul className="team-members">
        //   <li>
        //     <Tooltip title={getEmployeeFullName(projectLead)}>
        //       <Avatar src={getEmployeeImage(projectLead) || user_icon} />
        //     </Tooltip>
        //   </li>
        // </ul>
        <div style={{minWidth: 'max-content'}}>
          <img
            src={getEmployeeImage(projectLead) || user_icon}
            alt=""
            className="avatar"
            style={{ width: "30px", height: "30px", cursor: 'pointer' }}
          />
          <label style={{cursor: 'pointer'}}>{getEmployeeFullName(projectLead)}</label>
        </div>
      ),
    },
    {
      title: "Team",
      dataIndex: "assignedDevelopers",
      key: "assignedDevelopers",
      render: (assignedDevelopers) => (
        <div className="project-members" style={{margin: '4px auto'}}>
        <ul className="team-members" style={{minWidth: 'max-content'}}>
          {assignedDevelopers?.slice(0, 4).map((developer, index) => (
            <li key={index}>
              <Tooltip title={getEmployeeFullName(developer)}>
                <Avatar style={{cursor: 'pointer'}} src={getEmployeeImage(developer) || user_icon} />
              </Tooltip>
            </li>
          ))}
          {assignedDevelopers?.length > 4 && (
            <li className="dropdown avatar-dropdown">
              <Link
                className="all-users dropdown-toggle projectTeamMember"
                style={{display:'inline-flex', height: '33px', width: '33px'}}
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
                          style={{cursor: 'pointer'}}
                        />
                      </Tooltip>
                    </a>
                  ))}
                </div>
                {/* Pagination for additional team members */}
                {/* <div className="avatar-pagination">
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
                </div> */}
              </div>
            </li>
          )}
        </ul>
        </div>
      ),
    },
    {
      title: "Deadline",
      dataIndex: "endDate",
      key: "endDate",
      render: (text, record) => <label style={{minWidth: 'max-content'}}>{text}</label> 
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (record) => (
        <div className="action-label">
          <label
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
          </label>
        </div>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (record) => (
        <div className="action-label">
          <label
            className="btn btn-white btn-sm btn-rounded"
            style={{ pointerEvents: "none" }}
          >
            {record === "Scheduled" && (
              <i className="fa fa-dot-circle-o text-danger" />
            )}
            {record === "On-Going" && (
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
              : record === "On-Going"
              ? " On-Going"
              : record === "Paused"
              ? " Paused"
              : record === "Archived"
              ? " Archived"
              : record === "Completed"
              ? " Completed"
              : ""}
          </label>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <div className="dropdown dropdown-action profile-action">
          <a
            className="action-icon dropdown-toggle"
            data-bs-toggle={(role === 'admin' || permissions?.projectManagement) ? 'dropdown' : ''}
            aria-expanded="false"
            style={{cursor: `${(role === 'admin' || permissions?.projectManagement) ? '' : 'not-allowed'}`}}
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <button
              className="dropdown-item"
              onClick={() => {
                // ViewClients();
                // fetchEmployees();
                getAllCurrencies();
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
    setLoader(true);
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
          if(categoryObj?.docs?.length === 1){
            //console.log(categoryObj.totalPages)
            GetListProjects((categoryObj.totalPages-1),null);
          }
          else{
            GetListProjects()
          }
          message.success(`Project Deleted`);
          setIsLoading(false);
          setLoader(false);
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
        setLoader(false);
      });
  };

  const acceptableFormats = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "xls", "xlsx"];

  
  const onFileUpload = async (files) => {
    setLoader(true);
    const uploadPromises = [];
    const validFiles = []; // To store valid files
    const existingFileNames = selectedFiles.map((file) => file?.name);
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      //console.log("File: ", file);
  
      // Check file format (extension)
      const fileExtension = file?.name?.split(".").pop().toLowerCase();
      if (!acceptableFormats.includes(fileExtension)) {
        message.error(`File format not supported: ${file?.name}`);
        setLoader(false);
        continue; // Skip this file and continue with the next one
      }
  
      // Check file size
      if (file?.size > 10485760) {
        message.error(`File size exceeds 10MB: ${file?.name}`);
        setLoader(false);
        continue; // Skip this file and continue with the next one
      }

      if (existingFileNames.includes(file?.name)) {
        message.error(`File already selected: ${file?.name}`);
        setLoader(false);
        continue; // Skip this file and continue with the next one
      }
   // Add valid files to the array
  
      const uploadPromise = apiUploadToS3(file)
        .then((res) => {
          //console.log(res?.data?.result);
          setLoader(false);
          message.success(`File: ${file?.name} ready to upload`)
          validFiles.push(file);
          setSelectedFiles((prevSelectedFiles) => {
            const uniqueValidFiles = validFiles.filter((newFile) => {
              // Check if a file with the same name already exists in the selectedFiles
              return !prevSelectedFiles.some((existingFile) => existingFile?.name === newFile?.name);
            });
            return [...prevSelectedFiles, ...uniqueValidFiles];
          });
          //console.log(res?.data?.result)
          return res?.data?.result;
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : `File upload error: ${file.name}`
            }`
          );
          setLoader(false);
        });
      uploadPromises.push(uploadPromise);
    }
    //setLoader(false);
  
    // Add valid files to selectedFiles
  
    try {
      // Wait for all upload promises to resolve
      const urls = await Promise.all(uploadPromises);
      //console.log("these are ",urls)
      // Add the uploaded URLs to the uploadFiles state array
      setUploadFiles((prevUploadFiles) => [...prevUploadFiles, ...urls]);
      //e.target.files = null;
      setLoader(false);
    } catch (error) {
      // Handle any errors that occurred during file uploads
      console.error("File upload error:", error);
      setLoader(false);
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
          {file?.name || generateCustomFileName(file, index)}
        </Tag>
      </Space>
    ));
  };

  const paymentColumns = [
    {
      title: "Payment Title",
      dataIndex: "paymentTitle",
      key: "paymentTitle",
      render: (text, record, index) => (
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
          <Input className="form-control"
          placeholder="Enter title" />
        </Form.Item>
      ),
    },
    {
      title: "Amount in Figure",
      dataIndex: "amountInFigure",
      key: "amountInFigure",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "amountInFigure"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: "Please enter the amount in figure.",
            },
          ]}
        >
          {/* <Input type="number" className="form-control" /> */}
          <InputNumber
            className="form-control"
            placeholder="Enter an amount"
            formatter={(value) => {
              return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }}
            parser={(value) => {
              return value.replace(/\$\s?|(,*)/g, '');
            }}
          />
        </Form.Item>
      ),
    },
    {
      title: "Amount in Percent",
      dataIndex: "amountInPercent",
      key: "amountInPercent",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "amountInPercent"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: "Please enter the amount in percentage.",
            },
          ]}
        >
          {/* <Input type="number" className="form-control" /> */}
          <InputNumber
            className="form-control"
            placeholder="Enter percentage"
            max={100}
            min={0}
          />
        </Form.Item>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (text, record, index) => (
        <div style={{ position: "relative" }} id={`dueDate-${index}`}>
          <Form.Item
            name={["paymentSchedule", index, "dueDate"]}
            rules={[
              {
                required: true,
                message: "Select a due date",
              },
            ]}
            className="custom-border"
            style={{ width: "max-content" }}
          >
            <DatePicker
              suffixIcon={null}
              getPopupContainer={() =>
                document.getElementById(`dueDate-${index}`)
              }
              className="form-control"
              size="large"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "paid"]}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
      ),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (text, record, index) => (
    //     <MinusCircleFilled
    //       style={{ color: "red", cursor: "pointer" }}
    //       //disabled={record?.paid}
    //       onClick={() => {
    //         removePaymentSchedule(index);
    //         console.log(record?.paid);
    //       }}
    //     />
    //   ),
    // },
    {
      title: "Action",
      key: "action",
      render: (text, record, index) => (
        <span
          style={{
            color:
              paymentSchedules.length > 1
                ? index === paymentSchedules.length - 1
                  ? "red"
                  : "#ccc"
                : "#ccc",
            cursor: "pointer",
          }}
        >
          {/* <span style={{ color: index === paymentSchedules?.length - 1 ? 'red' : '#ccc', cursor: 'pointer' }}> */}
          <MinusCircleFilled
            onClick={() => {
              if (
                paymentSchedules.length > 1 &&
                index === paymentSchedules?.length - 1
              ) {
                removePaymentSchedule(index);
              }
            }}
          />
        </span>
      ),
    },
  ];
 
  const showTeamSearch = (val, type) => {
    let dropdownValues = []
    if(type === 'Team'){
      employees.forEach((team)=>{
          dropdownValues.push(team.fullName.toLowerCase())
       })
    }else if (type === 'client'){
      clients.forEach((client)=>{
        dropdownValues.push(client.clientName.toLowerCase())
     })
    }else if (type === 'focal'){
      focalPersons.forEach((focal)=>{
        dropdownValues.push(focal.focalPersonName.toLowerCase())
     })
    }else if (type === 'domain'){
      allDomain.forEach((dom)=>{
        dropdownValues.push(dom.teamName.toLowerCase())
     })
    }

    if(val !== ''){
      dropdownValues.some((team) => {
        if(team.includes(val.toLowerCase())){
          // setNoData(false);
          return true
        }else{
          // setNoData(true);
        }
      })
    }else{
      // setNoData(false)
    }
  }

  const getAllCurrencies = () => {
    const isoCodes = getAllISOCodes();
    const uniqueCurrencies = new Set();
    isoCodes.forEach(isoCode => {
        // const currency = isoCode.currency;
        const currency = {
          currency: isoCode?.currency,
          symbol: isoCode?.symbol
        };
        // uniqueCurrencies.add(currency);
        uniqueCurrencies.add(JSON.stringify(currency));
    });
    const currency_d = [...uniqueCurrencies].map(currency => JSON.parse(currency));
    const sorted_data = currency_d.sort((a, b) => a.currency.localeCompare(b.currency));
    // setAllCurrencies([...uniqueCurrencies])
    setAllCurrencies(sorted_data)
  };


const filteredColumns = columns.filter(column => {
  if (column.dataIndex === 'clientName' && (role === '' && !permissions?.projectManagement)) {
    return false;
  }
  return true;
});


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
                { (role === "admin" || permissions?.projectManagement) &&
                <button
                  className="btn add-btn"
                  onClick={() => { openCreateModal(); getAllCurrencies(); ViewClients(); fetchEmployees(); }}
                  disabled={
                    role === "admin" 
                      ? false
                      : permissions?.projectManagement
                      ? false
                      : true
                  }
                >
                  <i className="fa fa-plus" />
                  Create Project
                </button>
                }
              
                <div className="view-icons">
                  <button
                    onClick={() => {
                      handleViewToggle("grid")
                      handleReset();
                    }}
                    className={`grid-view btn btn-link ${
                      view === "grid" ? "active" : ""
                    }`}
                  >
                    <i className="fa fa-th" />
                  </button>
                  <button
                    onClick={() => {
                      handleViewToggle("list");
                      handleReset();
                      //GetListProjects();
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
              {
                (role === '' && !permissions?.projectManagement) ? 
                  <div className="row filter-row">
                    <div className="col-sm-6 col-md-3">
                      <div className="form-group">
                        <Form.Item name="projectName" className="custom-border">
                          <Input
                            className="form-control"
                            allowClear={false}
                            placeholder="Project Name"
                            style={{height:'50px'}}
                            onChange={(e) =>
                              handleFilterChange(e.target.value, "projectName")
                            }
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <div className="form-group">
                        <div style={{ position: "relative" }} id="area1">
                          <Form.Item
                            name="projectDomain"
                            className="custom-border"
                          >
                            <Select
                              showSearch
                              onSearch={(val) => {
                                showTeamSearch(val, 'domain')
                              }}
                              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                              optionFilterProp="children"
                              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                </>
                              )}

                              getPopupContainer={() =>
                                document.getElementById("area1")
                              }
                              className="custom-select searchCenter"
                              placeholder="Select Domain"
                              style={{height:'50px'}}
                              onChange={(value) => {
                                handleFilterChange(value, "projectDomain");
                              }}
                            >
                              {allDomain?.map((domain) => (
                                <Select.Option
                                  key={domain._id}
                                  value={domain._id}
                                >
                                  {domain.teamName}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <button
                        type="primary"
                        htmlType="submit"
                        className="btn btn-success btn-block w-100"
                        //disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                        style={{marginBottom: '24px'}}
                      >
                        <span className="d-flex justify-content-center">Search</span>
                      </button>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <button
                        htmlType="button"
                        className="btn btn-success btn-block w-100"
                        onClick={handleReset}
                        //disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                        style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}}
                      >
                        <span className="d-flex justify-content-center">Reset</span>
                      </button>
                    </div>
                  </div>
                :
                <div className="row filter-row">
                  <div className="col-sm-6 col-md-2">
                    <div className="form-group">
                      <Form.Item name="projectName" className="custom-border">
                        <Input
                          className="form-control"
                          allowClear={false}
                          placeholder="Project Name"
                          style={{height:'50px'}}
                          onChange={(e) =>
                            handleFilterChange(e.target.value, "projectName")
                          }
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-2">
                    <div className="form-group">
                      <Form.Item name="clientName" className="custom-border">
                        {/* <Select
                          showSearch
                          onSearch={(val) => {
                            showTeamSearch(val, 'client')
                          }}
                          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                            </>
                          )}
                          
                          className="custom-select searchCenter"
                          placeholder="Select Client"
                          onChange={(value) => {
                            handleFilterChange(value, "clientName");
                          }}
                          style={{height:'50px'}}
                        >
                          {clients.map((client) => (
                            <Select.Option
                              key={client._id}
                              value={client.clientName}
                            >
                              {client.clientName}
                            </Select.Option>
                          ))}
                        </Select> */}
                        <Input
                          className="form-control"
                          allowClear={false}
                          placeholder="Client Name"
                          style={{height:'50px'}}
                          onChange={(e) =>
                            handleFilterChange(e.target.value, "clientName")
                          }
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-2">
                    <div className="form-group">
                      <div style={{ position: "relative" }} id="area1">
                        <Form.Item
                          name="projectType"
                          className="custom-border"
                        >
                          <Select
                            className="custom-select searchCenter"
                            getPopupContainer={() =>
                              document.getElementById("area1")
                            }
                            placeholder="Cost Type"
                            style={{height:'50px'}}
                            onChange={(value) => {
                              handleFilterChange(value, "projectType");
                            }}
                          >
                            <Select.Option value="Hourly">Hourly</Select.Option>
                            <Select.Option value="Fixed">Fixed</Select.Option>
                            <Select.Option value="Monthly">Monthly</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-2">
                    <div className="form-group">
                      <div style={{ position: "relative" }} id="area1">
                        <Form.Item
                          name="projectDomain"
                          className="custom-border"
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, 'domain')
                            }}
                            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            optionFilterProp="children"
                            notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                            dropdownRender={(menu) => (
                              <>
                                {menu}
                              </>
                            )}

                            getPopupContainer={() =>
                              document.getElementById("area1")
                            }
                            className="custom-select searchCenter"
                            placeholder="Select Domain"
                            style={{height:'50px'}}
                            onChange={(value) => {
                              handleFilterChange(value, "projectDomain");
                            }}
                          >
                            {allDomain?.map((domain) => (
                              <Select.Option
                                key={domain._id}
                                value={domain._id}
                              >
                                {domain.teamName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-2">
                    <button
                      type="primary"
                      htmlType="submit"
                      className="btn btn-success btn-block w-100"
                      //disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                      style={{marginBottom: '24px'}}
                    >
                      <span className="d-flex justify-content-center">Search</span>
                    </button>
                  </div>
                  <div className="col-sm-6 col-md-2">
                    <button
                      htmlType="button"
                      className="btn btn-success btn-block w-100"
                      onClick={handleReset}
                      //disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                      style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}}
                    >
                      <span className="d-flex justify-content-center">Reset</span>
                    </button>
                  </div>
                </div>
              
            }
          </Form>

          {view === "grid" ? (
            <div className="row">
              {/* Render the grid view */}
              {isLoading ? (
                <div className="col-md-12 text-center">
                  <Spin size="large" tip="Loading..." />
                </div>
              ) : tableData?.length > 0 ? (
                // Render grid items when data is available
                tableData?.map((project, index) => (
                  <div
                    className="col-lg-4 col-sm-6 col-md-4 col-xl-3"
                    key={index}
                  >
                    <div className="card">
                      <div className="card-body">
                        {
                          (role === 'admin' || permissions?.projectManagement) &&
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
                                  // ViewClients();
                                  // fetchEmployees();
                                  getAllCurrencies();
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
                        }
                        <h4 className="project-title longText">
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
                        <div className="pro-deadline m-b-15">
                          <div className="sub-title">Status:</div>
                          <div style={{
                            color: 
                              project?.status === 'Scheduled' ? 'red' :
                              project?.status === 'On-Going' ? 'orange' :
                              (project?.status === 'Paused' || project?.status === 'Archived') ? 'grey' :
                              project?.status === 'Completed' ? 'green' : 'inherit'
                          }}>
                            {project?.status}
                          </div>
                        </div>
                        <div className="project-members m-b-15">
                          <div>Project Leader :</div>
                          <ul className="team-members">
                            <li>
                            <Tooltip
                                title={getEmployeeFullName(
                                  project?.projectLead
                                )}
                              >
                              <a>
                                <img
                                  alt=""
                                  src={
                                    getEmployeeImage(project?.projectLead) ||
                                    user_icon
                                  }
                                />
                              </a>
                              </Tooltip>
                            </li>
                          </ul>
                        </div>
                        <div className="project-members m-b-15">
                          <div>Team :</div>
                          <ul className="team-members"
                          style={{ marginLeft: "10px" }}>
                            {project?.assignedDevelopers
                              ?.slice(0, 4)
                              ?.map((developer, devIndex) => (
                                <li key={devIndex}>
                                  <Tooltip
                                  className="projectTeamMember"
                                title={getEmployeeFullName(
                                  developer
                                )}
                              >
                              <a>
                                <img
                                  alt=""
                                  src={
                                    getEmployeeImage(developer) ||
                                    user_icon
                                  }
                                />
                              </a>
                              </Tooltip>

                                  {/* <a
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
                                  </a> */}
                                </li>
                              ))}
                            {project?.assignedDevelopers?.length > 4 && (
                              <li className="dropdown avatar-dropdown">
                                <a
                                  className="all-users dropdown-toggle projectTeamMember"
                                  style={{ display: "inline-flex" }}
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
                                  {/* <div className="avatar-pagination">
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
                                  </div> */}
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

                  {
                    tableData?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        defaultCurrent={1}
                        current={pagination.current}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                        onChange={(page, pageSize) => {
                          GetListProjects(page, pageSize)
                          setPagination({
                            ...pagination,
                            current: page,
                            pageSize: pageSize,
                          });
                          //console.log(page, size);
                          //setPageSize(size); setCurrentPage(page);
                          //getEmployeeSalary(filterValues, page, size)
                        }}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={itemRender}
                        disabled={isLoading}
                      />
                    </div>
                  }
            </div>
          ) : (
            <div className="row">
              <div className="col-md-12">
              {/* projectsListTable */}
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
                    style = {{overflowX : 'auto', paddingBottom: '70px'}}
                    loading={isLoading}
                    //style={{ height: "400px", background: "white" }}
                    columns={filteredColumns}
                    // bordered
                    dataSource={tableData}
                    //rowKey={(record) => record?._id}
                    pagination={false}
                    // pagination={{
                    //   current: pagination.current,
                    //   pageSize: pagination.pageSize,
                    //   total: pagination.total,
                    //   showTotal: (total, range) =>
                    //     `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    //   pageSizeOptions: ["20", "30", "40", "50"], // Options to change page size
                    //   showSizeChanger: true, // Show the page size changer
                    //   onChange: (page, pageSize) => {
                    //     setPagination({
                    //       ...pagination,
                    //       current: page,
                    //       pageSize: pageSize,
                    //     });
                    //   },
                    //   itemRender: itemRender,
                    // }}
                  />
                </div>
                {
                    tableData?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`
                        }
                        pageSizeOptions={["20", "30", "40", "50"]}
                        showSizeChanger
                        onChange={(page, pageSize) => setPagination({...pagination, current: page, pageSize: pageSize,})}
                        itemRender={itemRender}
                        disabled={isLoading}
                      />
                    </div>
                  }
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
                              showSearch
                              onSearch={(val) => {
                                showTeamSearch(val, 'client')
                                // onTeamChange(val)
                              }}
                              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                              optionFilterProp="children"
                              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                </>
                              )}

                              className="custom-select custom-normal"
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
                              showSearch
                              onSearch={(val) => {
                                showTeamSearch(val, 'focal')
                                // onTeamChange(val)
                              }}
                              filterOption={(input, option) => option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0}
                              optionFilterProp="children"
                              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                </>
                              )}

                              className="custom-select custom-normal"
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
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select a Status"
                            >
                              <Select.Option value="Paused">
                                Paused
                              </Select.Option>
                              <Select.Option value="Scheduled">
                                Scheduled
                              </Select.Option>
                              <Select.Option value="On-Going">
                                On-Going
                              </Select.Option>
                              <Select.Option value="Archived">
                                Archived
                              </Select.Option>
                              <Select.Option value="Completed">
                                Completed
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
                          {/* <Form.Item
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
                          </Form.Item> */}

                          <Form.Item
                            name="endDate"
                            rules={[
                              {
                                required: true,
                                message: "Enter an end date",
                              },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  // Ensure that the end date is not before the start date
                                  const startDate = getFieldValue('startDate');
                                  if (!startDate || !value) {
                                    // If either date is not selected, do not perform validation
                                    return Promise.resolve();
                                  }
                                  if (!value.isSame(startDate, 'day') && value.isSameOrAfter(startDate)) {
                                    // End date is valid
                                    return Promise.resolve();
                                  }
                                  return Promise.reject('End date must not be before or same as start date');
                                },
                              }),
                            ]}
                            className="custom-border"
                          >
                            <DatePicker
                              getPopupContainer={() => document.getElementById("area")}
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
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Domain</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="projectDomain"
                            className="addTeamHeight"
                            rules={[
                              {
                                required: true,
                                message: "Domain cannot be empty",
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              onSearch={(val) => {
                                showTeamSearch(val, 'domain')
                              }}
                              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                              optionFilterProp="children"
                              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                </>
                              )}

                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              className="customselect-height custom-select"
                              mode="multiple"
                              placeholder="Select Domain"
                            >
                              {allDomain?.map((domain) => (
                                <Select.Option
                                  key={domain._id}
                                  value={domain._id}
                                >
                                  {domain.teamName}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Project Type</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="projectType"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Choose a project type",
                              },
                            ]}
                          >
                            <Select
                              // showSearch
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select Project Type"
                              onChange={(value) => setProjectType(value)}
                              options={[
                                {
                                    value: 'Billed',
                                    label: "Billed ",
                                },
                                {
                                    value: 'nonBilled',
                                    label: "Non-Billed",
                                },
                                ]}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Currency</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="currency"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Choose a currency",
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select Currency"
                            >
                              {
                                allCurrencies.map((currency, index) => (
                                  <Select.Option key={index} value={currency?.currency}>
                                    {currency?.currency}
                                  </Select.Option>
                                ))
                              }
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6">
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
                          {/* <Input type="number" className="form-control" /> */}
                          <InputNumber
                            className="form-control"
                            formatter={(value) => {
                              return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                            }}
                            parser={(value) => {
                              return value.replace(/\$\s?|(,*)/g, '');
                            }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <div className="col-sm-6">
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
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Select Type"
                            >
                              <Select.Option value="Hourly">
                                Hourly
                              </Select.Option>
                              <Select.Option value="Fixed">Fixed</Select.Option>
                              <Select.Option value="Monthly">
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
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder="Choose Priority"
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
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: "Select a Leader",
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              onSearch={(val) => {
                                showTeamSearch(val, 'Team')
                                // onTeamChange(val)
                              }}
                              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                              optionFilterProp="children"
                              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                </>
                              )}

                              className="custom-select custom-normal"
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
                            className="addTeamHeight"
                            rules={[
                              {
                                required: true,
                                message: "Team cannot be empty",
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              onSearch={(val) => {
                                showTeamSearch(val, 'Team')
                                // onTeamChange(val)
                              }}
                              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                              optionFilterProp="children"
                              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                </>
                              )}

                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              className="customselect-height custom-select"
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
                    <div
                      className="project-members"
                      style={{ margin: "4px auto" }}
                    >
                      <ul
                        className="team-members"
                        style={{ minWidth: "max-content" }}
                      >
                        {selectedTeamMembers
                          ?.slice(0, 4)
                          .map((teamMember, index) => (
                            <li key={index}>
                              <Tooltip title={getEmployeeFullName(teamMember)}>
                                <Avatar
                                  style={{ cursor: "pointer" }}
                                  src={
                                    getEmployeeImage(teamMember) || user_icon
                                  }
                                />
                              </Tooltip>
                            </li>
                          ))}
                        {selectedTeamMembers?.length > 4 && (
                          <li className="dropdown avatar-dropdown">
                            <Link
                              className="all-users dropdown-toggle projectTeamMember"
                              style={{
                                display: "inline-flex",
                                height: "33px",
                                width: "33px",
                              }}
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              +{selectedTeamMembers?.length - 4}
                            </Link>
                            {/* Dropdown menu for additional team members */}
                            <div className="dropdown-menu dropdown-menu-right">
                              <div className="avatar-group">
                                {selectedTeamMembers
                                  ?.slice(4)
                                  .map((teamMember, index) => (
                                    <a
                                      className="avatar avatar-xs projectTeamMember"
                                      key={index}
                                    >
                                      <Tooltip
                                        title={getEmployeeFullName(teamMember)}
                                      >
                                        <Avatar
                                          src={
                                            getEmployeeImage(teamMember) ||
                                            user_icon
                                          }
                                          style={{ cursor: "pointer" }}
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
                    <label>Upload Files{" "} 
                      <small style={{ color: 'grey', fontSize: 'small' }}>
                        (Allowed formats: pdf, doc, docx, jpg, jpeg, png, gif, xls, xlsx)
                      </small>
                    </label>
                    <input
                      className="form-control"
                      multiple
                      onChange={(e) => {
                        onFileUpload(e.target.files);
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
                {projectType === 'Billed' && (
                  <>
                  <h4
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                    }}
                  >
                    Payment Schedules
                  </h4>
                  <hr
                    className="developer-divider"
                    style={{ opacity: "0", marginTop: "0px" }}
                  />
                  <div className="table-responsive">
                    <Table
                      dataSource={paymentSchedules}
                      columns={paymentColumns}
                      rowKey={(record, index) => index}
                      pagination={false}
                      style={{ overflowX: "auto", height: "320px", }}
                    />
                  </div>

                  <div className="submit-section">
                    <Form.Item>
                      <Button type="primary" onClick={addPaymentSchedule} className="btn btn-primary submit-btn btn-add" style={{fontSize: '14px', minWidth: '30px', height: '39px', lineHeight: '0px'}}>
                        <i className="fa fa-plus m-r-5" />
                        Add More Payments
                      </Button>
                    </Form.Item>
                    <hr />
                  </div>
                  </>
                )}

                  <div className="submit-section">
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loader}
                      >
                        {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        "Submit"
                      )}
                        
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
            getprojects={emptyfunction}
            getlistprojects={GetListProjects}
            allCurrencies={allCurrencies}
            allDomain={allDomain}
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
                        disabled={loader}
                        >
                          {loader ? (
                          <Spin size="small" indicator={antIcon} />
                        ) : (
                          "Delete"
                        )}
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
