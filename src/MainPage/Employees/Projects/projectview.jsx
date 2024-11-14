import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Avatar_16,
  Avatar_02,
  Avatar_05,
  Avatar_09,
  Avatar_10,
  Avatar_11,
  Avatar_01,
  PlaceHolder,
  user_icon,
} from "../../../Entryfile/imagepath";
import Editproject from "../../../_components/modelbox/Editproject";
import { useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  Pagination,
  Select,
  Spin,
  Table,
  Tooltip,
  message,
} from "antd";
import { Modal } from "@mui/material";
import moment from "moment";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined, MinusCircleFilled } from "@ant-design/icons";
import EditProjects from "./EditProjects";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { DeleteFiles, uploadFunction } from "./UploadAndDeleteFunc";
import { getAllISOCodes } from "iso-country-currency";
import { useTranslation } from "react-i18next";

const ProjectView = () => {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const employee_id = user_state?.user?._id;
  const role = user_state?.user?.role;
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  //console.log(permissions,user_state)
  const nav = useNavigate();
  const location = useLocation();

  const [paymentSchedules, setPaymentSchedules] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [allDomain, setAllDomain] = useState([]);
  const [TableLoad, setTableLoad] = useState(false);
  const [LoadLeader, setLoadLeader] = useState(false);
  const [LoadTeam, setLoadTeam] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openLeader, setOpenLeader] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [focalPersons, setFocalPersons] = useState([]);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [loader, setLoader] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [teamCost, setTeamCost] = useState([]);

  const getEmployeeImage = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee?.imageUrl || ""; // You may provide a default image URL
  };

  const handleRemoveDeveloper = (developerId) => {
    const updatedSelectedDevelopers = selectedDevelopers.filter(
      (obj) => obj?._id !== developerId
    );
    setSelectedDevelopers(updatedSelectedDevelopers);
  };

  const handleSelectDeveloper = (value) => {
    const selectedEmployee = employees.find(employee => employee._id === value);
    setSelectedDevelopers([...selectedDevelopers, selectedEmployee]);
    form.resetFields(); // Clear the selection in the form
  };

  const getEmployeeFullName = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee ? employee.fullName : "None";
  };

  const getTeamMemberOptions = () => {
    // Create an array of selected employee IDs (selected developers and leader)
    // const selectedEmployeeIds = [project?.projectLead, ...selectedDevelopers];
    const selectedEmployeeIds = [...selectedDevelopers];

    return employees
      .filter((employee) => !selectedEmployeeIds.some((selected) => selected._id === employee._id))
      .map((employee) => (
        <Select.Option key={employee._id} value={employee._id}>
          {employee.fullName}
        </Select.Option>
      ));
  };

  const { _id } = useParams();
  //console.log(_id);
  //const originalProjectName = projectName.replace(/[-_]/g, ' ');
  const stateProj = location?.state?.project;

  const [project, setProject] = useState(stateProj ? stateProj : {});
  const [totalCost, setTotalCost] = useState(project?.teamCost?.reduce((sum, item) => sum + parseFloat(item?.cost), 0));
  const [files, setFiles] = useState(project?.docs || []);
  const [confidentialFiles, setConfidentialFiles] = useState(project?.adminDocs || [])
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedConfidentialFiles, setSelectedConfidentialFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadType, setUploadType] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileIdToDelete, setFileIdToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  //const project = stateProj ? stateProj : data;
  //console.log("this is project :", project);
  //const totalCost = project?.teamCost?.reduce((sum, item) => sum + parseFloat(item.cost), 0);

  const openUserModal = () => {
    setOpenUser(true);
    setTeamCost(project?.teamCost);
  };

  const closeUser = () => {
    setOpenUser(false);
    form.resetFields();
    setSelectedDevelopers([]);
    setLoader(false);
    //setFocalPersons([]);
    //setSelectedLeader(null);
    //setSelectedTeamMembers([]);
  };

  const openLeaderModal = () => {
    setOpenLeader(true);
  };

  const closeLeader = () => {
    setOpenLeader(false);
    form.resetFields();
    setSelectedLeader(null);
    setLoader(false);
    //setFocalPersons([]);
    //setSelectedLeader(null);
    //setSelectedTeamMembers([]);
  };

  const openEditModal = (data) => {
    setSelectedData(data);
    //fetchFocalPersons(data?.clientId);
    //getAllDomain();
    setEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedData(null);
    setEditModal(false);
    form.resetFields();
    setLoader(false);
  };

  useEffect(() => {
    // if(role === 'admin' || role === 'client' || role === 'focalperson' || permissions?.projectManagement || permissions?.clientManagement ) {
    if ((role != "client" && role != "focalperson") && !stateProj) {
      setIsLoading(true);
      GetProjects();
      //fetchEmployees();
      //getAllDomain();
    }
    // ViewClients();
    // }else{
    //   nav('/restricted', { state: { unAuthorize: true}})
    // }
  }, []);

  const getAllDomain = () => {
    apiServices("GET", "team/view-team", null, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          const all_domains = res?.data?.Team;
          const sortedData = all_domains
            .slice()
            .sort((a, b) => a.teamName.localeCompare(b.teamName));
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
              : t('projectScreen.errors.getDomainInfoError')
          }!`
        );
      });
  };

  const GetProjects = () => {
    apiServices(
      "GET",
      `project-management/?employeeId=${
        role === "" && !permissions?.projectManagement ? employee_id : ""
      }${_id ? `&projectId=${_id}` : null}&page=1&limit=99999`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const temp = res?.data?.projects?.docs[0]
          setProject(temp);
          setTotalCost(temp?.teamCost?.reduce((sum, item) => sum + parseFloat(item.cost), 0))
          setFiles(temp?.docs)
          setConfidentialFiles(temp?.adminDocs)
          if (stateProj) {
            nav(location.pathname, {
              state: { ...location.state, project: temp },
              replace: true, // This ensures the URL is not pushed again but updated
            });
          }
          //setData(newProjects);
          setIsLoading(false);
          setLoadLeader(false);
          setLoadTeam(false);
          setTableLoad(false);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('projectScreen.errors.getEmployeeProjectsError')
          }`
        );
        setIsLoading(false);
        setLoadLeader(false);
        setLoadTeam(false);
        setTableLoad(false);
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
              : t('aAttend.errors.getEmployeesError')
          }`
        );
      });
  };

  const ViewClients = () => {
    apiServices("GET", `client/all-client`, null, user_state)
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
              : t('aDash.errors.getAllClientsError')
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

  const UpdateTeam = () => {
    setLoader(true);
    //setIsLoading(true);

    const updatedTeamCost = (() => {
        const filteredArray = teamCost?.filter((item) => selectedDevelopers?.some((selected) => selected._id === item.userId));

        const newDevelopers = selectedDevelopers?.filter(
            (userId) => !teamCost?.some((item) => item?.userId === userId?._id)
        )?.map((userId) => ({
            userId: userId?._id,
            fullName: userId?.fullName,
            imageUrl: userId?.imageUrl,
            cost: '0'
        }));

        return [...filteredArray, ...newDevelopers];
    })();

    let data = {
      _id: project?._id,
      startDate: moment(project?.startDate).format("YYYY-MM-DD"),
      endDate: moment(project?.endDate).format("YYYY-MM-DD"),
      deleted: false,
      companyId: project?.companyId,
    };

    if (openUser) {
      data.teamCost = updatedTeamCost
    }

    if (selectedLeader !== null) {
      data.projectLead = selectedLeader?._id;
      setLoadLeader(true);
    }

    if (selectedDevelopers.length > 0) {
      data.assignedDevelopers = selectedDevelopers?.map((dev) => dev?._id);
      setLoadTeam(true);
    }

    apiServices("PUT", `project-management/`, data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(t('viewProject.projectTeamUpdated'));
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
              : t('viewProject.errorUpdatingTeam')
          }`
        );
        setLoader(false);
      })
      .finally(() => {
        GetProjects();
        closeLeader();
        closeUser();
      });
  };

  const UpdateStatus = (payment) => {
    //setLoader(true);
    //setIsLoading(true);
    let data = {
      _id: project?._id,
      startDate: moment(project?.startDate).format("YYYY-MM-DD"),
      endDate: moment(project?.endDate).format("YYYY-MM-DD"),
      deleted: false,
      companyId: project?.companyId,
      paymentSchedule: payment,
    };

    apiServices("PUT", `project-management/`, data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(t('viewProject.statusSetToPaid'));
          setTableLoad(true);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('viewProject.errorUpdatingPayment')
          }`
        );
      })
      .finally(() => {
        GetProjects();
      });
  };

  const handleUpdateStatus = async (values) => {
        const updatedData = {
            _id: project?._id,
            startDate: moment(project?.startDate).format("YYYY-MM-DD"),
            endDate: moment(project?.endDate).format("YYYY-MM-DD"),
            status: values // Only updating the status
        };

        try {
            const res = await apiServices("PUT", `project-management/`, updatedData, user_state);

            if (res.data.success) {
                message.success(t("ProjectStatusUpdatedSuccessfully"));
                GetProjects();
                }
        } catch (err) {
            message.error(
                err?.response?.data?.msg
                    ? err?.response?.data?.msg
                    : err?.response?.data?.validation?.body?.message
                    ? err?.response?.data?.validation?.body?.message
                    : t("projectScreen.errors.errorUpdatingProjectStatus")
            );
        }
};

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

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

  const handlePaidChange = (record) => {
    // Update the "paid" field of the specific record to true
    const updatedPaymentSchedules = project?.paymentSchedule?.map(
      (schedule) => {
        if (schedule._id === record._id) {
          return { ...schedule, paid: true };
        }
        return schedule;
      }
    );

    // Update the state with the new payment schedules
    //setPaymentSchedules(updatedPaymentSchedules);
    UpdateStatus(updatedPaymentSchedules);
  };

  const paymentColumns = [
    {
      title: t('viewProject.paymentTitle'),
      dataIndex: "paymentTitle",
      key: "paymentTitle",
    },
    {
      title: t('viewProject.amountInFigure'),
      dataIndex: "amountInFigure",
      key: "amountInFigure",
      render: (amount) => {
        return (
          <>
            {amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
            {project?.currency}
          </>
        );
      },
    },
    {
      title: t('viewProject.amountInPercent'),
      dataIndex: "amountInPercent",
      key: "amountInPercent",
    },
    {
      title: t('viewProject.dueDate'),
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate) => moment(dueDate).format("YYYY-MM-DD"),
    },
    {
      title: t('viewProject.paid'),
      dataIndex: "paid",
      key: "paid",
      render: (paid, record) => (
        <Checkbox
          checked={paid}
          disabled={paid || role === "client" || role === "focalperson"} // Disable the checkbox if already paid
          onChange={() => handlePaidChange(record)} // Handle checkbox change
          //style={{ pointerEvents: paid ? 'none' : 'auto' }}
        />
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
  ];

  const teamCostColumn = [
    {
      title: '#',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Employee Name',
      dataIndex: 'userId',
      key: 'userId',
      render: (text, record) => (
      <h2 className="table-avatar">
        <label className="avatar"><img alt="" src={record?.imageUrl || user_icon} /></label>
        <label>{record?.fullName}</label>
      </h2>
    ),
    },
    {
      title: `${project?.costType === 'Hourly' ? 'Hourly Rate' : project?.costType === 'Monthly' ? 'Monthly Rate' : 'Salary'} ${project?.currency ? `(${project?.currency})` : ''}`,
      dataIndex: 'cost',
      key: 'cost',
      render: (text, record) => (
        <span>
          {`${text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
        </span>
      ),
    },
  ];

  const emptyfunction = () => {
    return null;
  };

  const getAllCurrencies = () => {
    const isoCodes = getAllISOCodes();
    const uniqueCurrencies = new Set();
    isoCodes.forEach((isoCode) => {
      // const currency = isoCode.currency;
      const currency = {
        currency: isoCode?.currency,
        symbol: isoCode?.symbol,
      };
      // uniqueCurrencies.add(currency);
      uniqueCurrencies.add(JSON.stringify(currency));
    });
    const currency_d = [...uniqueCurrencies].map((currency) =>
      JSON.parse(currency)
    );
    const sorted_data = currency_d.sort((a, b) =>
      a.currency.localeCompare(b.currency)
    );
    // setAllCurrencies([...uniqueCurrencies])
    setAllCurrencies(sorted_data);
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
          // setNoData(true);
        }
      });
    } else {
      // setNoData(false)
    }
  };

  // const acceptableFormats = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"];

  // const onFileUpload = (uploadedFiles, type) => {
  //   const validFiles = [];
  //   const existingFileNames = (type === "admin" ? confidentialFiles : files).map(f => f.fileName);

  //   Array.from(uploadedFiles).forEach(file => {
  //     const fileExtension = file.name.split(".").pop().toLowerCase();

  //     // File format validation
  //     if (!acceptableFormats.includes(fileExtension)) {
  //       message.error(t("projectScreen.errors.fileFormatNotSupported", { file: file.name }));
  //       return;
  //     }

  //     // File size validation
  //     if (file.size > 10485760) { // 10 MB limit
  //       message.error(t("projectScreen.errors.fileSizeExceedsLimit", { file: file.name }));
  //       return;
  //     }

  //     // Duplicate file validation
  //     if (existingFileNames.includes(file.name)) {
  //       message.error(t("projectScreen.errors.fileAlreadySelected", { file: file.name }));
  //       return;
  //     }

  //     const fileData = { fileName: file.name };
  //     validFiles.push(fileData);
  //   });

  //   // If we have valid files, update state and call the API to save
  //   if (validFiles.length > 0) {
  //     if (type === "admin") {
  //       setConfidentialFiles(prev => [...prev, ...validFiles]);
  //       updateProjectWithFiles(files, [...confidentialFiles, ...validFiles], type);
  //     } else {
  //       setFiles(prev => [...prev, ...validFiles]);
  //       updateProjectWithFiles([...files, ...validFiles], confidentialFiles, type);
  //     }
  //   }
  // };

  // // Function to update project with selected files
  // const updateProjectWithFiles = (updatedDocs, updatedAdminDocs, type) => {
  //   const updatedData = {
  //     _id: project._id,
  //     startDate: moment(project.startDate).format("YYYY-MM-DD"),
  //     endDate: moment(project.endDate).format("YYYY-MM-DD"),
  //     docs: type === "normal" ? updatedDocs : files,
  //     adminDocs: type === "admin" ? updatedAdminDocs : confidentialFiles,
  //   };

  //   apiServices("PUT", `project-management/`, updatedData, user_state)
  //     .then((res) => {
  //       if (res.data.success) {
  //       message.success(t("Project Updated Successfully"));
  //       setFiles(updatedDocs); // Update files in local state
  //       setConfidentialFiles(updatedAdminDocs); // Update files in local state
  //       GetProjects(); // Refresh project data if needed
  //     }
  //   })
  //   .catch((err) => {
  //     message.error(
  //       err?.response?.data?.msg ||
  //       err?.response?.data?.validation?.body?.message ||
  //       t("projectScreen.errors.errorUpdatingProjectStatus")
  //     );
  //   })
  // };

  // // Trigger file input on "Add" button click
  // const handleAddClick = (type) => {
  //   setUploadType(type);
  //   fileInputRef.current.click();
  // };

  // // Handle file input change
  // const handleFileInputChange = (event) => {
  //   onFileUpload(event.target.files, uploadType);
  // };

  // // Show modal and set the fileId to delete
  // const showDeleteModal = (fileId, type) => {
  //   setFileIdToDelete(fileId);
  //   setDeleteType(type);
  //   setIsModalVisible(true);
  // };

  // // Confirm delete action
  // const confirmDelete = () => {
  //   handleDelete(fileIdToDelete, deleteType);
  //   setIsModalVisible(false); // Hide modal after deletion
  // };

  // // Cancel delete action
  // const cancelDelete = () => {
  //   setIsModalVisible(false);
  //   setFileIdToDelete(null); // Clear the fileId
  // };

  // const handleDelete = (fileId, type) => {
  //   let updatedDocs;
  //   if (type === "normal") {
  //     console.log("delete files",files, fileId)
  //     updatedDocs = files.filter(doc => doc._id !== fileId);
  //     console.log("updated files",updatedDocs)
  //   } else if (type === "admin") {
  //     console.log("delete confidential files",confidentialFiles, fileId)
  //     updatedDocs = confidentialFiles.filter(doc => doc._id !== fileId);
  //     console.log("updated confidential files",updatedDocs)
  //   }
  
  //   const updatedData = {
  //     _id: project._id,
  //     startDate: moment(project.startDate).format("YYYY-MM-DD"),
  //     endDate: moment(project.endDate).format("YYYY-MM-DD"),
  //     docs: type === "normal" ? updatedDocs : files, // Update docs only if "normal"
  //     adminDocs: type === "admin" ? updatedDocs : confidentialFiles, // Update adminDocs only if "admin"
  //   };
  
  //   apiServices("PUT", `project-management/`, updatedData, user_state)
  //     .then((res) => {
  //       if (res.data.success) {
  //         message.success(t("FileDeletedSuccessfully"));
  //         type === "normal" ? setFiles(updatedDocs) : setConfidentialFiles(updatedDocs);
  //         GetProjects();
  //       }
  //     })
  //     .catch((err) => {
  //       message.error(
  //         err?.response?.data?.msg ||
  //         err?.response?.data?.validation?.body?.message ||
  //         t("projectScreen.errors.errorDeletingFile")
  //       );
  //     });
  // };


const acceptableFormats = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"];

const onFileUpload = async (uploadedFiles, type) => {
  const validFiles = [];
  const existingFileNames = (type === "admin" ? confidentialFiles : files).map(f => f.fileName);

  Array.from(uploadedFiles).forEach(file => {
    const fileExtension = file.name.split(".").pop().toLowerCase();

    // File format validation
    if (!acceptableFormats.includes(fileExtension)) {
      message.error(t("projectScreen.errors.fileFormatNotSupported", { file: file.name }));
      return;
    }

    // File size validation
    if (file.size > 10485760) { // 10 MB limit
      message.error(t("projectScreen.errors.fileSizeExceedsLimit", { file: file.name }));
      return;
    }

    // Duplicate file validation
    if (existingFileNames.includes(file.name)) {
      message.error(t("projectScreen.errors.fileAlreadySelected", { file: file.name }));
      return;
    }

    // const fileData = { fileName: file.name };
    validFiles.push(file);
  });

  if (validFiles.length > 0) {
    try {
      const uploadedFilesData = await uploadFunction(validFiles);
      const updatedFiles = type === "admin" ? [...confidentialFiles, ...uploadedFilesData] : [...files, ...uploadedFilesData];
      if (type === "admin") {
        setConfidentialFiles(updatedFiles);
        updateProjectWithFiles(files, updatedFiles, type);
      } else {
        setFiles(updatedFiles);
        updateProjectWithFiles(updatedFiles, confidentialFiles, type);
      }
    } catch (error) {
      message.error(t("projectScreen.errors.fileUploadError"));
    }
  }
};

const updateProjectWithFiles = (updatedDocs, updatedAdminDocs, type) => {
  const updatedData = {
    _id: project._id,
    startDate: moment(project.startDate).format("YYYY-MM-DD"),
    endDate: moment(project.endDate).format("YYYY-MM-DD"),
    docs: type === "normal" ? updatedDocs : files,
    adminDocs: type === "admin" ? updatedAdminDocs : confidentialFiles,
  };

  apiServices("PUT", `project-management/`, updatedData, user_state)
    .then((res) => {
      if (res.data.success) {
        message.success(t("Project Updated Successfully"));
        setFiles(updatedDocs);
        setConfidentialFiles(updatedAdminDocs);
        GetProjects();
      }
    })
    .catch((err) => {
      message.error(
        err?.response?.data?.msg ||
        err?.response?.data?.validation?.body?.message ||
        t("projectScreen.errors.errorUpdatingProjectStatus")
      );
    });
};

// Trigger file input on "Add" button click
const handleAddClick = (type) => {
  setUploadType(type);
  fileInputRef.current.click();
};

// Handle file input change
const handleFileInputChange = (event) => {
  onFileUpload(event.target.files, uploadType);
};

// Show modal and set the fileId to delete
const showDeleteModal = (fileId, type) => {
  setFileIdToDelete(fileId);
  setDeleteType(type);
  setIsModalVisible(true);
};

// Confirm delete action
const confirmDelete = () => {
  handleDelete(fileIdToDelete, deleteType);
  setIsModalVisible(false);
};

// Cancel delete action
const cancelDelete = () => {
  setIsModalVisible(false);
  setFileIdToDelete(null);
};

const handleDelete = async (fileId, type) => {
  let updatedDocs;
  if (type === "normal") {
    updatedDocs = files.filter(doc => doc._id !== fileId);
  } else if (type === "admin") {
    updatedDocs = confidentialFiles.filter(doc => doc._id !== fileId);
  }

  try {
    const deleteResults = await DeleteFiles([{ public_id: fileId }], user_state);
    console.log("Delete Results:", deleteResults);
    message.success(t("File Deleted Successfully"));
    type === "normal" ? setFiles(updatedDocs) : setConfidentialFiles(updatedDocs);
    updateProjectWithFiles(updatedDocs, confidentialFiles, type);
  } catch (error) {
    console.error("Error in handleDelete:", error);
    message.error(t("projectScreen.errors.errorDeletingFile"));
  }
};

  

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>{t('viewProject.Title')}</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">{t('Timesheetemployee.project')}</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link
                    to={
                      "/projects/project_dashboard"
                    }
                  >
                    <span className="arrow_routes"></span>
                    {t('projects')}
                  </Link>
                </li>
                <li className="breadcrumb-item active">{t('viewProject.projectView')}</li>
              </ul>
            </div>

            <div className="col-auto float-end ms-auto" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              {!isLoading && (role === 'admin' || permissions?.projectManagement) &&
              <>
              <div className="project-status-container">
                <a
                  className={`btn btn-white btn-sm btn-rounded dropdown-toggle`} // Always has the dropdown-toggle class
                  style={{padding: "8px 12px"}}
                  href="javascript:void(0)"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={(e) => e.preventDefault()}
                >
                  <i
                    className={`fa ${
                      project?.status === "Scheduled"
                        ? "fa-dot-circle-o text-danger"
                        : project?.status === "Ongoing"
                        ? "fa-dot-circle-o text-warning"
                        : project?.status === "Paused"
                        ? "fa-dot-circle-o text-muted"
                        : project?.status === "Completed"
                        ? "fa-dot-circle-o text-success"
                        : project?.status === "Archived"
                        ? "fa-dot-circle-o text-muted"
                        : "fa-dot-circle-o"
                    }`}
                  />{" "}
                  {project?.status === 'Scheduled' 
                    ? t('projectScreen.Modal.scheduled')
                    : project?.status === 'On-Going' 
                    ? t('projectScreen.Modal.onGoing')
                    : project?.status === 'Paused' 
                    ? t('projectScreen.Modal.paused')
                    : project?.status === 'Completed' 
                    ? t('projectScreen.Modal.completed')
                    : project?.status === 'Archived' 
                    ? t('projectScreen.Modal.archived') 
                    : project?.status}
                </a>
                <div className="dropdown-menu dropdown-menu-right">
                  <a
                    className="dropdown-item"
                    href="javascript:void(0)"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateStatus("Scheduled");
                    }}
                  >
                    <i className="fa fa-dot-circle-o text-danger" /> {t("projectScreen.Modal.scheduled")}
                  </a>
                  <a
                    className="dropdown-item"
                    href="javascript:void(0)"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateStatus("Ongoing");
                    }}
                  >
                    <i className="fa fa-dot-circle-o text-warning" /> {t("projectScreen.Modal.onGoing")}
                  </a>
                  <a
                    className="dropdown-item"
                    href="javascript:void(0)"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateStatus("Paused");
                    }}
                  >
                    <i className="fa fa-dot-circle-o text-muted" /> {t("projectScreen.Modal.paused")}
                  </a>
                  <a
                    className="dropdown-item"
                    href="javascript:void(0)"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateStatus("Completed");
                    }}
                  >
                    <i className="fa fa-dot-circle-o text-success" /> {t("projectScreen.Modal.completed")}
                  </a>
                  <a
                    className="dropdown-item"
                    href="javascript:void(0)"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateStatus("Archived");
                    }}
                  >
                    <i className="fa fa-dot-circle-o text-muted" /> {t("projectScreen.Modal.archived")}
                  </a>
                </div>
              </div>
            
              <button
                className="btn add-btn"
                onClick={() => {
                  getAllCurrencies();
                  openEditModal(project);
                  form.setFieldsValue({
                    ...project,
                    startDate: moment(project?.startDate, "YYYY-MM-DD"),
                    endDate: moment(project?.endDate, "YYYY-MM-DD"),
                  });
                }}
                disabled={
                  role === "client" ||
                  role === "focalperson" ||
                  (role === "" && !permissions?.projectManagement)
                }
              >
                <i className="fa fa-plus" />
                {t('viewProject.editProject')}
              </button>
            </>
              }

              {
                project?.taskBoard && role !== 'client' && role !== 'focalPerson' &&
                <a
                className="btn btn-white float-start m-r-10"
                data-bs-toggle="tooltip"
                title="Task Board"
                onClick={() => nav(`/task-board/${_id}`, { state: project})} 
              >
                <i className="fa fa-bars" />
              </a>
              }
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {isLoading ? (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8 col-xl-9">
              <div className="card">
                <div className="card-body">
                  <div className="project-title">
                    <h5 className="card-title">{project?.projectName}</h5>
                    {/* <small className="block text-ellipsis m-b-15">
                      <span className="text-xs">2</span>{" "}
                      <span className="text-muted">open tasks, </span>
                      <span className="text-xs">5</span>{" "}
                      <span className="text-muted">tasks completed</span>
                    </small> */}
                  </div>
                  <label style={{ display: "block" }}>
                    {project?.projectDescription}
                  </label>
                </div>
              </div>

                <>
                <div className="card">
                <div className="card-body">
                  <h5 className="card-title m-b-20">Project Files
                  { (role === 'admin' || permissions?.projectManagement) &&
                    <>
                      <button
                        type="button"
                        className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'} btn btn-primary btn-sm`}
                        onClick={() => handleAddClick("normal") }
                        disabled={
                          role === "client" ||
                          role === "focalperson" ||
                          (role === "" && !permissions?.projectManagement)
                        }>
                          <i className="fa fa-plus" /> {t('viewProject.uploadedFiles')}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          style={{ display: "none" }}
                          onChange={handleFileInputChange}
                        />
                    </>
                  }</h5>
                  {project?.docs?.length > 0 ? 
                    <>
                      <div className="row">
                        {
                          project?.docs?.some((doc) => {
                            if (!doc) {
                              console.log("NULL file detected");
                              return null;
                            } else {
                              const parts = doc?.fileName?.split(".");
                              const format = parts[parts.length - 1];
                              return (
                                doc?.imageUrl?.includes("res.cloudinary.com") &&
                                format.match(/^(jpg|jpeg|png|gif)$/i)
                              );
                            }
                          }) ? (
                            project?.docs?.map((doc, index) => {
                              if (!doc) {
                                console.log("NULL file detected");
                                return null;
                              }
                              // Split the link to check for the file format
                              const parts = doc?.fileName?.split(".");
                              const format = parts[parts.length - 1];

                              // Check if it's a cloudinary link and the format is an image
                              if (
                                doc?.imageUrl?.includes("res.cloudinary.com") &&
                                format.match(/^(jpg|jpeg|png|gif)$/i)
                              ) {
                                // Extract the image ID from the Cloudinary URL
                                const imageId = doc?.imageUrl?.match(/v\d+\/(.+?)\./)[1];
                                // Construct the thumbnail URL
                                const thumbnailUrl = `https://res.cloudinary.com/dcxpovyr9/image/upload/c_thumb,w_200,h_200/${imageId}.png`;

                                const fullImageUrl = `https://res.cloudinary.com/dcxpovyr9/image/upload/${imageId}.${format}`;

                                const downloadLink = `${doc?.imageUrl?.replace(
                                  "/upload/",
                                  "/upload/fl_attachment/"
                                )}`;

                                return (
                                  <div
                                    key={index}
                                    className="col-md-3 col-sm-4 col-lg-4 col-xl-3"
                                  >
                                    <div className="uploaded-box">
                                      <a>
                                        <div
                                          className="uploaded-img"
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            maxHeight: "200px",
                                            maxWidth: "200px",
                                          }}
                                        >
                                          <img
                                            src={thumbnailUrl}
                                            className="img-fluid"
                                            alt={`Image ${index + 1}`}
                                            style={{ borderRadius: "10px" }}
                                            onClick={() =>
                                              window.open(fullImageUrl, "_blank")
                                            }
                                          />
                                          
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
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  showDeleteModal(doc._id, "normal");
                                                }}
                                              >
                                                <i className={`fa fa-trash ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                                {t('delete')}
                                              </button>
                                              <button
                                                className="dropdown-item"
                                                onClick={() => {
                                                  window.open(downloadLink, '_blank');
                                                }}
                                              >
                                                <i className={`fa fa-download ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                                {t('download')}
                                              </button>
                                            </div>
                                          </div>

                                        </div>
                                      </a>
                                      <div className="uploaded-img-name">{doc?.fileName}</div>
                                    </div>
                                  </div>
                                );
                              } else if (format.match(/^(jpg|jpeg|png|gif)$/i)) {
                                // Check if it's an image based on the file format
                                return (
                                  <div
                                    key={index}
                                    className="col-md-3 col-sm-4 col-lg-4 col-xl-3"
                                  >
                                    <div className="uploaded-box">
                                      <div className="uploaded-img">
                                        <img
                                          src={doc?.imageUrl}
                                          className="img-fluid"
                                          alt={`Image ${index + 1}`}
                                        />
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
                                              onClick={(e) => {
                                                e.preventDefault();
                                                showDeleteModal(doc._id, "normal");
                                              }}
                                            >
                                              <i className={`fa fa-trash ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                              {t('delete')}
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => {
                                                window.open(fullImageUrl, '_blank');
                                              }}
                                            >
                                              <i className={`fa fa-download ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                              {t('download')}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="uploaded-img-name">{`File ${
                                        index + 1
                                      }`}</div>
                                    </div>
                                  </div>
                                );
                              }
                              // If it's not an image, return null to ignore it
                              return null;
                            })
                          ) : null
                        }
                      </div>
                      <ul className="files-list">
                        {
                          project?.docs?.every((doc) => {
                            if (!doc) {
                              console.log("NULL file detected");
                              return null;
                            } else {
                              // Split the link to get the file format
                              const parts = doc?.fileName?.split(".");
                              const format = parts[parts.length - 1];

                              // Check if it's an image format (jpg, jpeg, png, gif)
                              return format.match(/^(jpg|jpeg|png|gif)$/i);
                            }
                          }) ? (
                            // Render "No files uploaded" message if all files are images
                            null
                          ) : (
                            // Render files
                            project?.docs?.map((doc, index) => {
                              if (!doc) {
                                console.log("NULL file detected");
                                return null;
                              }
                              // Split the link to get the file format
                              const parts = doc?.fileName?.split(".");
                              const format = parts[parts.length - 1];

                              // Check if it's an image format (jpg, jpeg, png, gif)
                              if (format.match(/^(jpg|jpeg|png|gif)$/i)) {
                                // Ignore image files
                                return null;
                              }

                              // Construct the thumbnail URL based on file format
                              let thumbnailUrl = "";
                              if (format.toLowerCase() === "pdf") {
                                thumbnailUrl = "/path-to-pdf-icon.png"; // Replace with the path to your PDF icon
                              } else {
                                thumbnailUrl = "/path-to-generic-file-icon.png"; // Replace with the path to your generic file icon
                              }

                              const downloadLink = `${doc?.imageUrl?.replace(
                                "/upload/",
                                "/upload/fl_attachment/"
                              )}`;

                              return (
                                <li key={index}>
                                  <div
                                    className="files-cont"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      paddingTop: "inherit",
                                    }}
                                  >
                                    <div className="file-type">
                                      <span className="files-icon">
                                        <i
                                          className={`fa fa-file-${format.toLowerCase() === 'xls' ? 'excel' : format.toLowerCase() === 'xlsx' ? 'excel' : format.toLowerCase() === 'doc' ? 'word' : format.toLowerCase() === 'docx' ? 'word' : format.toLowerCase()}-o`}
                                        />
                                      </span>
                                    </div>
                                    <div className="files-info">
                                      <span className="file-name text-ellipsis">
                                        <a
                                          href={doc?.imageUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {doc?.fileName}
                                        </a>
                                      </span>
                                    </div>
                                    <ul className="files-action">
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            showDeleteModal(doc._id, "normal");
                                          }}
                                          className="btn btn-link"
                                        >
                                          <i className="fa fa-trash" />
                                        </a>
                                      </li>
                                      <li>
                                        <a
                                          href={downloadLink}
                                          className="btn btn-link"
                                          download
                                        >
                                          <i className="fa fa-download" />{" "}
                                          {/* Download icon */}
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </li>
                              );
                            })
                          )
                          }
                      </ul>
                    </>
                    :
                  <label>{t('viewProject.noFilesUploaded')}</label>
                  }
                </div>
              </div>
              <Modal
              open={isModalVisible}
              onClose={cancelDelete}
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
                      <h3 style={{ marginBottom: "30px" }}>Remove File</h3>
                      <p>Are you sure you want to delete this file?</p>
                    </div>
                    <div className="modal-btn delete-action">
                      <div className="row">
                        <div className="col-6">
                          <Button
                            htmlType="submit"
                            className="btn btn-primary continue-btn"
                            onClick={confirmDelete}
                            disabled={isLoading}
                            style={{ width: "100%" }}
                          >
                            {isLoading ? <Spin size="small" /> : "Delete"}
                          </Button>
                        </div>
                        <div className="col-6">
                          <Button
                            onClick={cancelDelete}
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
              </>
            {(role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) &&
            <>
              <div className="card">
                <div className="card-body">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                ><div style={{display:'flex', flexDirection: 'row', alignItems: 'center'}}><h5 className="card-title m-b-20">Confidential Files</h5> <span className="badge badge-pill bg-custom float-end" style={{marginLeft:'10px', marginBottom: 'auto'}}>ADMIN</span></div>
                    <>
                    <button
                      type="button"
                      className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'} btn btn-primary btn-sm`}
                      onClick={() => handleAddClick("admin") }
                      disabled={
                        role === "client" ||
                        role === "focalperson" ||
                        (role === "" && !permissions?.projectManagement)
                      }
                    >
                      <i className="fa fa-plus" /> {t('viewProject.uploadedFiles')}
                    </button>
                    <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          style={{ display: "none" }}
                          onChange={handleFileInputChange}
                        />
                    </>
                    </div>
                  {
                    project?.adminDocs?.length > 0 ? 
                    <>
                      <div className="row">
                        {
                          project?.adminDocs?.some((doc) => {
                            if (!doc) {
                              console.log("NULL file detected");
                              return null;
                            } else {
                              const parts = doc?.fileName?.split(".");
                              const format = parts[parts.length - 1];
                              return (
                                doc?.imageUrl?.includes("res.cloudinary.com") &&
                                format.match(/^(jpg|jpeg|png|gif)$/i)
                              );
                            }
                          }) ? (
                            project?.adminDocs?.map((doc, index) => {
                              if (!doc) {
                                console.log("NULL file detected");
                                return null;
                              }
                              // Split the link to check for the file format
                              const parts = doc?.fileName?.split(".");
                              const format = parts[parts.length - 1];

                              // Check if it's a cloudinary link and the format is an image
                              if (
                                doc?.imageUrl?.includes("res.cloudinary.com") &&
                                format.match(/^(jpg|jpeg|png|gif)$/i)
                              ) {
                                // Extract the image ID from the Cloudinary URL
                                const imageId = doc?.imageUrl?.match(/v\d+\/(.+?)\./)[1];
                                // Construct the thumbnail URL
                                const thumbnailUrl = `https://res.cloudinary.com/dcxpovyr9/image/upload/c_thumb,w_200,h_200/${imageId}.png`;

                                const fullImageUrl = `https://res.cloudinary.com/dcxpovyr9/image/upload/${imageId}.${format}`;

                                const downloadLink = `${doc?.imageUrl?.replace(
                                  "/upload/",
                                  "/upload/fl_attachment/"
                                )}`;

                                return (
                                  <div
                                    key={index}
                                    className="col-md-3 col-sm-4 col-lg-4 col-xl-3"
                                  >
                                    <div className="uploaded-box">
                                      <a>
                                        <div
                                          className="uploaded-img"
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            maxHeight: "200px",
                                            maxWidth: "200px",
                                          }}
                                        >
                                          <img
                                            src={thumbnailUrl}
                                            className="img-fluid"
                                            alt={`Image ${index + 1}`}
                                            style={{ borderRadius: "10px" }}
                                            onClick={() =>
                                              window.open(fullImageUrl, "_blank")
                                            }
                                          />
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
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  showDeleteModal(doc._id, "normal");
                                                }}
                                              >
                                                <i className={`fa fa-trash ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                                {t('delete')}
                                              </button>
                                              <button
                                                className="dropdown-item"
                                                onClick={() => {
                                                  window.open(downloadLink, '_blank');
                                                }}
                                              >
                                                <i className={`fa fa-download ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                                {t('download')}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </a>
                                      <div className="uploaded-img-name">{doc?.fileName}</div>
                                    </div>
                                  </div>
                                );
                              } else if (format.match(/^(jpg|jpeg|png|gif)$/i)) {
                                // Check if it's an image based on the file format
                                return (
                                  <div
                                    key={index}
                                    className="col-md-3 col-sm-4 col-lg-4 col-xl-3"
                                  >
                                    <div className="uploaded-box">
                                      <div className="uploaded-img">
                                        <img
                                          src={doc?.imageUrl}
                                          className="img-fluid"
                                          alt={`Image ${index + 1}`}
                                        />
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
                                              onClick={(e) => {
                                                e.preventDefault();
                                                showDeleteModal(doc._id, "normal");
                                              }}
                                            >
                                              <i className={`fa fa-trash ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                              {t('delete')}
                                            </button>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => {
                                                window.open(fullImageUrl, '_blank');
                                              }}
                                            >
                                              <i className={`fa fa-download ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                              {t('download')}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="uploaded-img-name">{`File ${
                                        index + 1
                                      }`}</div>
                                    </div>
                                  </div>
                                );
                              }
                              // If it's not an image, return null to ignore it
                              return null;
                            })
                          ) : (
                            null
                          )
                        }
                      </div>
                      <ul className="files-list">
                        {
                          project?.adminDocs?.every((doc) => {
                            if (!doc) {
                              console.log("NULL file detected");
                              return null;
                            } else {
                              // Split the link to get the file format
                              const parts = doc?.fileName?.split(".");
                              const format = parts[parts.length - 1];

                              // Check if it's an image format (jpg, jpeg, png, gif)
                              return format.match(/^(jpg|jpeg|png|gif)$/i);
                            }
                          }) ? (
                            // Render "No files uploaded" message if all files are images
                            null
                          ) : (
                            // Render files
                            project?.adminDocs?.map((doc, index) => {
                              if (!doc) {
                                console.log("NULL file detected");
                                return null;
                              }
                              // Split the link to get the file format
                              const parts = doc?.fileName?.split(".");
                              const format = parts[parts.length - 1];

                              // Check if it's an image format (jpg, jpeg, png, gif)
                              if (format.match(/^(jpg|jpeg|png|gif)$/i)) {
                                // Ignore image files
                                return null;
                              }

                              // Construct the thumbnail URL based on file format
                              let thumbnailUrl = "";
                              if (format.toLowerCase() === "pdf") {
                                thumbnailUrl = "/path-to-pdf-icon.png"; // Replace with the path to your PDF icon
                              } else {
                                thumbnailUrl = "/path-to-generic-file-icon.png"; // Replace with the path to your generic file icon
                              }

                              const downloadLink = `${doc?.imageUrl?.replace(
                                "/upload/",
                                "/upload/fl_attachment/"
                              )}`;
                              return (
                                <li key={index}>
                                  <div
                                    className="files-cont"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      paddingTop: "inherit",
                                    }}
                                  >
                                    <div className="file-type">
                                      <span className="files-icon">
                                        <i
                                          className={`fa fa-file-${format.toLowerCase() === 'xls' ? 'excel' : format.toLowerCase() === 'xlsx' ? 'excel' : format.toLowerCase() === 'doc' ? 'word' : format.toLowerCase() === 'docx' ? 'word' : format.toLowerCase()}-o`}
                                        />
                                      </span>
                                    </div>
                                    <div className="files-info">
                                      <span className="file-name text-ellipsis">
                                        <a
                                          href={doc?.imageUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {doc?.fileName}
                                        </a>
                                      </span>
                                    </div>
                                    <ul className="files-action">
                                      <li>
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            showDeleteModal(doc._id, "admin");
                                          }}
                                          className="btn btn-link"
                                        >
                                          <i className="fa fa-trash" />
                                        </a>
                                      </li>
                                      <li>
                                        <a
                                          href={downloadLink}
                                          className="btn btn-link"
                                          download
                                        >
                                          <i className="fa fa-download" />{" "}
                                          {/* Download icon */}
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </li>
                              );
                            })
                          )
                        }
                      </ul>
                    </>
                    :
                  <label>{t('viewProject.noFilesUploaded')}</label>
                  }
                </div>
              </div>
              <Modal
              visible={isModalVisible}
              onCancel={cancelDelete}
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
                      <h3 style={{ marginBottom: "30px" }}>Remove File</h3>
                      <p>Are you sure you want to delete this file?</p>
                    </div>
                    <div className="modal-btn delete-action">
                      <div className="row">
                        <div className="col-6">
                          <Button
                            htmlType="submit"
                            className="btn btn-primary continue-btn"
                            onClick={confirmDelete}
                            disabled={isLoading}
                            style={{ width: "100%" }}
                          >
                            {isLoading ? <Spin size="small" /> : "Delete"}
                          </Button>
                        </div>
                        <div className="col-6">
                          <Button
                            onClick={cancelDelete}
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
            </>
            }

              {((role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) && project?.projectType === "Billed") ? 
              (
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title m-b-20">{project?.costType === "Fixed" ? t('viewProject.payments') : 'Cost Details'}</h5>
                    <div className="table-responsive">
                      <Table
                        locale={{
                          emptyText: TableLoad ? (
                            <Spin size="large" tip="Loading..." />
                          ) : (
                            customEmptyText
                          ),
                        }}
                        loading={TableLoad}
                        dataSource={project?.costType === "Fixed" ? project?.paymentSchedule : project?.teamCost}
                        columns={project?.costType === "Fixed" ? paymentColumns : teamCostColumn}
                        rowKey={(record, index) => index}
                        pagination={false}
                        style={{ overflowX: "auto" }}
                      />
                    </div>
                  </div>
                </div>
              )
              : 
              null
              }

              {/* <div className="project-task">
              <ul className="nav nav-tabs nav-tabs-top nav-justified mb-0">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    href="#all_tasks"
                    data-bs-toggle="tab"
                    aria-expanded="true"
                  >
                    All Tasks
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#pending_tasks"
                    data-bs-toggle="tab"
                    aria-expanded="false"
                  >
                    Pending Tasks
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#completed_tasks"
                    data-bs-toggle="tab"
                    aria-expanded="false"
                  >
                    Completed Tasks
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane show active" id="all_tasks">
                  <div className="task-wrapper">
                    <div className="task-list-container">
                      <div className="task-list-body">
                        <ul id="task-list">
                          <li className="task">
                            <div className="task-container">
                              <span className="task-action-btn task-check">
                                <span
                                  className="action-circle large complete-btn"
                                  title="Mark Complete"
                                >
                                  <i className="material-icons">check</i>
                                </span>
                              </span>
                              <span
                                className="task-label"
                                contentEditable="true"
                                suppressContentEditableWarning={true}
                              >
                                Patient appointment booking
                              </span>
                              <span className="task-action-btn task-btn-right">
                                <span
                                  className="action-circle large"
                                  title="Assign"
                                >
                                  <i className="material-icons">person_add</i>
                                </span>
                                <span
                                  className="action-circle large delete-btn"
                                  title="Delete Task"
                                >
                                  <i className="material-icons">delete</i>
                                </span>
                              </span>
                            </div>
                          </li>
                          <li className="task">
                            <div className="task-container">
                              <span className="task-action-btn task-check">
                                <span
                                  className="action-circle large complete-btn"
                                  title="Mark Complete"
                                >
                                  <i className="material-icons">check</i>
                                </span>
                              </span>
                              <span
                                className="task-label"
                                contentEditable="true"
                                suppressContentEditableWarning={true}
                              >
                                Appointment booking with payment gateway
                              </span>
                              <span className="task-action-btn task-btn-right">
                                <span
                                  className="action-circle large"
                                  title="Assign"
                                >
                                  <i className="material-icons">person_add</i>
                                </span>
                                <span
                                  className="action-circle large delete-btn"
                                  title="Delete Task"
                                >
                                  <i className="material-icons">delete</i>
                                </span>
                              </span>
                            </div>
                          </li>
                          <li className="completed task">
                            <div className="task-container">
                              <span className="task-action-btn task-check">
                                <span
                                  className="action-circle large complete-btn"
                                  title="Mark Complete"
                                >
                                  <i className="material-icons">check</i>
                                </span>
                              </span>
                              <span className="task-label">
                                Doctor available module
                              </span>
                              <span className="task-action-btn task-btn-right">
                                <span
                                  className="action-circle large"
                                  title="Assign"
                                >
                                  <i className="material-icons">person_add</i>
                                </span>
                                <span
                                  className="action-circle large delete-btn"
                                  title="Delete Task"
                                >
                                  <i className="material-icons">delete</i>
                                </span>
                              </span>
                            </div>
                          </li>
                          <li className="task">
                            <div className="task-container">
                              <span className="task-action-btn task-check">
                                <span
                                  className="action-circle large complete-btn"
                                  title="Mark Complete"
                                >
                                  <i className="material-icons">check</i>
                                </span>
                              </span>
                              <span
                                className="task-label"
                                contentEditable="true"
                                suppressContentEditableWarning={true}
                              >
                                Patient and Doctor video conferencing
                              </span>
                              <span className="task-action-btn task-btn-right">
                                <span
                                  className="action-circle large"
                                  title="Assign"
                                >
                                  <i className="material-icons">person_add</i>
                                </span>
                                <span
                                  className="action-circle large delete-btn"
                                  title="Delete Task"
                                >
                                  <i className="material-icons">delete</i>
                                </span>
                              </span>
                            </div>
                          </li>
                          <li className="task">
                            <div className="task-container">
                              <span className="task-action-btn task-check">
                                <span
                                  className="action-circle large complete-btn"
                                  title="Mark Complete"
                                >
                                  <i className="material-icons">check</i>
                                </span>
                              </span>
                              <span
                                className="task-label"
                                contentEditable="true"
                                suppressContentEditableWarning={true}
                              >
                                Private chat module
                              </span>
                              <span className="task-action-btn task-btn-right">
                                <span
                                  className="action-circle large"
                                  title="Assign"
                                >
                                  <i className="material-icons">person_add</i>
                                </span>
                                <span
                                  className="action-circle large delete-btn"
                                  title="Delete Task"
                                >
                                  <i className="material-icons">delete</i>
                                </span>
                              </span>
                            </div>
                          </li>
                          <li className="task">
                            <div className="task-container">
                              <span className="task-action-btn task-check">
                                <span
                                  className="action-circle large complete-btn"
                                  title="Mark Complete"
                                >
                                  <i className="material-icons">check</i>
                                </span>
                              </span>
                              <span
                                className="task-label"
                                contentEditable="true"
                                suppressContentEditableWarning={true}
                              >
                                Patient Profile add
                              </span>
                              <span className="task-action-btn task-btn-right">
                                <span
                                  className="action-circle large"
                                  title="Assign"
                                >
                                  <i className="material-icons">person_add</i>
                                </span>
                                <span
                                  className="action-circle large delete-btn"
                                  title="Delete Task"
                                >
                                  <i className="material-icons">delete</i>
                                </span>
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="task-list-footer">
                        <div className="new-task-wrapper">
                          <textarea
                            id="new-task"
                            placeholder="Enter new task here. . ."
                            defaultValue={""}
                          />
                          <span className="error-message hidden">
                            You need to enter a task first
                          </span>
                          <span className="add-new-task-btn btn" id="add-task">
                            Add Task
                          </span>
                          <span className="btn" id="close-task-panel">
                            Close
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tab-pane" id="pending_tasks" />
                <div className="tab-pane" id="completed_tasks" />
              </div>
            </div> */}
            </div>

            <div className="col-lg-4 col-xl-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title m-b-15">{t('viewProject.projectDetails')}</h6>
                  <div className="table-responsive">
                    <table className="table table-striped table-border">
                      <tbody>
                        {((role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) && project?.projectType === 'Billed') ? 
                        (
                        <>
                          <tr>
                            <td>{t('viewProject.cost')}:</td>
                            <td className="text-end">
                            {
                              (project?.costType === 'Monthly' || project?.costType === 'Hourly' )
                              ? 
                              `${totalCost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${project?.currency}` 
                              : 
                              `${project?.cost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}  ${project?.currency}`
                            }
                              {/* {project?.cost
                                ?.toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                              {project?.currency} */}
                            </td>
                          </tr>
                          <tr>
                            <td>Cost Type:</td>
                            <td className="text-end">
                            {project?.costType}
                            </td>
                          </tr>
                        </>
                        )
                        : 
                        null
                        }
                        <tr>
                          <td>{t('viewProject.startDate')}:</td>
                          <td className="text-end">
                            {moment(project?.startDate).format("YYYY-MM-DD")}
                          </td>
                        </tr>
                        <tr>
                          <td>{t('viewProject.deadline')}:</td>
                          <td className="text-end">
                            {moment(project?.endDate).format("YYYY-MM-DD")}
                          </td>
                        </tr>
                        <tr>
                          <td>{t('viewProject.priority')}:</td>
                          <td className="text-end">
                            <span
                              className={`badge ${
                                project?.priority === "High Priority"
                                  ? "bg-danger"
                                  : project?.priority === "Normal Priority"
                                  ? "bg-warning"
                                  : project?.priority === "Low Priority"
                                  ? "bg-success"
                                  : ""
                              }`}
                              style={{ pointerEvents: "none" }}
                            >
                              {project?.priority === "High Priority"
                                ? t('projectScreen.Modal.high')
                                : project?.priority === "Normal Priority"
                                ? t('projectScreen.Modal.normal')
                                : t('projectScreen.Modal.low')}
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>{t('viewProject.status')}:</td>
                          <td className="text-end">
                          {project?.status === 'Scheduled' 
                            ? t('projectScreen.Modal.scheduled')
                            : project?.status === 'On-Going' 
                            ? t('projectScreen.Modal.onGoing')
                            : project?.status === 'Paused' 
                            ? t('projectScreen.Modal.paused')
                            : project?.status === 'Completed' 
                            ? t('projectScreen.Modal.completed')
                            : project?.status === 'Archived' 
                            ? t('projectScreen.Modal.archived') 
                            : project?.status
                            }
                            </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* <p className="m-b-5">
                    Progress <span className="text-success float-end">40%</span>
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

              <div className="card project-user">
                <div className="card-body">
                  <h6 className="card-title m-b-20">
                    <label style={{ width: "69%" }}>{t('viewProject.assignedLeader')}</label>
                    {(role === 'admin' || permissions?.projectManagement) &&
                      <button
                      type="button"
                      className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'} btn btn-primary btn-sm`}
                      // data-bs-toggle="modal"
                      // data-bs-target="#assign_leader"
                      onClick={() => {
                        fetchEmployees();
                        openLeaderModal();
                        setSelectedLeader(project?.projectLead);
                      }}
                      disabled={
                        role === "client" ||
                        role === "focalperson" ||
                        (role === "" && !permissions?.projectManagement)
                      }
                    >
                      <i className="fa fa-plus" /> {t('edit')}
                    </button>
                    }
                  </h6>
                  {LoadLeader ? (
                    <Spin size="medium" />
                  ) : (
                    <ul className="list-box">
                      {project?.projectLead && (
                        <div className="list-item">
                          <div
                            className="employee-selection d-flex gap-1"
                            style={{ alignItems: "center" }}
                          >
                            <img
                              alt=""
                              className="avatar"
                              src={
                                project?.projectLead?.imageUrl ||
                                user_icon
                              }
                            />
                            <label className="employee-name">
                              {project?.projectLead?.fullName}
                            </label>
                          </div>
                          <hr
                            className="developer-divider"
                            style={{ opacity: "0", marginTop: "0px" }}
                          />
                        </div>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="card project-user">
                <div className="card-body">
                  <h6 className="card-title m-b-20">
                    <label style={{ width: "69%" }}>{t('viewProject.assignedDevelopers')}</label>
                    { (role === 'admin' || permissions?.projectManagement) &&
                      <button
                      type="button"
                      className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'} btn btn-primary btn-sm`}
                      onClick={() => {
                        fetchEmployees();
                        openUserModal();
                        setSelectedDevelopers(project?.assignedDevelopers);
                      }}
                      disabled={
                        role === "client" ||
                        role === "focalperson" ||
                        (role === "" && !permissions?.projectManagement)
                      }
                    >
                      <i className="fa fa-plus" /> {t('holiday.add')}
                    </button>
                    }
                  </h6>
                  {LoadTeam ? (
                    <Spin size="medium" />
                  ) : (
                    <ul className="list-box">
                      {project?.assignedDevelopers?.map((developerId) => (
                        <div className="list-item">
                          <div
                            className="employee-selection d-flex gap-1"
                            style={{ alignItems: "center" }}
                          >
                            <img
                              alt=""
                              className="avatar"
                              src={developerId?.imageUrl || user_icon}
                            />
                            <label className="employee-name">
                              {developerId?.fullName}
                            </label>
                          </div>
                          <hr
                            className="developer-divider"
                            style={{ opacity: "0", marginTop: "0px" }}
                          />
                        </div>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={openLeader}
        onClose={closeLeader}
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
              <h5 className="modal-title">Add Leader</h5>

              <button type="button" className="close" onClick={closeLeader}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body">
              <Form form={form} onFinish={UpdateTeam} name="control-hooks">
                <div className="row">
                  <div className="form-group">
                    <label>Leader</label>
                    <Form.Item name="projectLead" className="custom-border">
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
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                        dropdownRender={(menu) => <>{menu}</>}
                        placeholder="Select Leader"  
                        onChange={(value) => {
                          const selectedEmployee = employees?.find(employee => employee?._id === value);
                          setSelectedLeader(selectedEmployee);
                        }}
                        className="custom-select custom-normal"
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

                {selectedLeader && (
                  <div className="selected-leader-info ">
                    <div
                      className="employee-selection d-flex gap-2"
                      style={{ alignItems: "center" }}
                    >
                      <img
                        alt=""
                        className="avatar"
                        src={selectedLeader?.imageUrl || user_icon}
                      />
                      <span className="employee-name">
                        {selectedLeader?.fullName}
                      </span>
                    </div>
                  </div>
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

      <Modal
        open={openUser}
        onClose={closeUser}
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
              <h5 className="modal-title">Add Developers</h5>

              <button type="button" className="close" onClick={closeUser}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body">
              <Form form={form} onFinish={UpdateTeam} name="control-hooks">
                <div className="row">
                  <div className="form-group">
                    <label>Add Team</label>
                    <Form.Item
                      name="assignedDevelopers"
                      className="custom-border"
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
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                        dropdownRender={(menu) => <>{menu}</>}
                        // mode="multiple"
                        placeholder="Select Team Members"
                        onSelect={handleSelectDeveloper}
                        className="custom-select custom-normal"
                      >
                        {getTeamMemberOptions()}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <ul className="chat-user-list">
                  {selectedDevelopers?.map((developerId) => (
                    <li>
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
                            src={developerId?.imageUrl || user_icon}
                          />
                          <span className="employee-name">
                            {developerId?.fullName}
                          </span>
                        </div>

                        <MinusCircleFilled
                          style={{ color: "red", cursor: "pointer" }}
                          onClick={() => handleRemoveDeveloper(developerId?._id)}
                        />
                      </div>
                      <hr
                        className="developer-divider"
                        style={{ opacity: "0.1" }}
                      />
                    </li>
                  ))}
                </ul>

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
          data={project}
          editModal={editModal}
          closeEditModal={closeEditModal}
          getlistprojects={GetProjects}
          allCurrencies={allCurrencies}
        />
      )}

      {/* /Edit Project Modal */}
    </div>
  );
};

export default ProjectView;
