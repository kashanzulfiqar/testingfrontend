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
import { useTranslation } from "react-i18next";

const Projects = () => {
  const { t, i18n } = useTranslation();
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
  const [uploadFiles2, setUploadFiles2] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFiles2, setSelectedFiles2] = useState([]);

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
  const [newFiles, setNewFiles] = useState([]);
  const [newAdminFiles, setNewAdminFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [projectType, setProjectType] = useState("");
  const [projectCost, setProjectCost] = useState(0);

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
    setProjectCost(0);
    setProjectType("");
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
    setSelectedFiles2([]);
    setUploadFiles([]);
    setUploadFiles2([]);
    setNewAdminFiles([]);
    setNewFiles([]);
    setToDelete([]);
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
    status: "",
    projectDomain: "",
    costType: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    projectName: "",
    status: "",
    projectDomain: "",
    costType: "",
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
      status: "",
      projectDomain: "",
      costType: "",
    });
    setFilters({
      projectName: "",
      status: "",
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
    getAllDomain();
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
            : t('projectScreen.errors.getDomainInfoError')
        }!`
      );
    });
  }

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
              : t('aDash.errors.getAllClientsError')
          }`
        );
      });
  };

  // const fetchFocalPersons = (clientId) => {
  //   apiServices(
  //     "GET",
  //     `focal-person/view-focal-person?deleted=false&clientId=${clientId}`,
  //     null,
  //     user_state
  //   )
  //     .then((res) => {
  //       if (res.data.success === true) {
  //         const focalperson = res?.data?.focalPersons.docs;
  //         const sortedData = focalperson.slice().sort((a, b) => a.focalPersonName.localeCompare(b.focalPersonName));
  //         setFocalPersons(sortedData);
  //       }
  //     })
  //     .catch((err) => {
  //       // message.error(
  //       //   `Get Focal Person Error`
  //       // );
  //       console.log("error");
  //     });
  // };

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
      `project-management/?status=${filters.status}&projectName=${filters.projectName}&projectDomain=${filters.projectDomain}&costType=${filters.costType}&employeeId=${(role === '' && !permissions?.projectManagement) ? employee_id : ''}&page=${params.page}&limit=${params.limit}`,
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
              : t('projectScreen.errors.getEmployeeProjectsError')
          }`
        );
        setIsLoading(false);
      }).then(()=>{
        setFlag(false);
      });
  };

//   const DeleteFiles = async (files) => {
//     // Create an array of promises for deleting each file
//     const deletionPromises = files?.map(file => {
//         let data = {
//           resource_type: file?.resource_type,
//         };

//         if (file?.public_id) {
//           data.public_id = file.public_id;
//         } 
//         else if (file?.imageUrl) {
//           data.secure_url = file.imageUrl;
//         }
//         return apiServices("DELETE", `user/deletefile`, data, user_state)
//             .then(res => {
//                 if (res.data.success) {
//                     console.log(`Deleted: ${file.public_id}`);
//                     return { success: true, public_id: file.public_id };
//                 } else {
//                     throw new Error(`Failed to delete: ${file.public_id}`);
//                 }
//             })
//             .catch(err => {
//                 console.error(`Error deleting ${file.public_id}:`, err);
//                 // Return an error object instead of throwing to handle it gracefully in Promise.all
//                 return { success: false, public_id: file.public_id, error: err };
//             });
//     });

//     // Wait for all deletion promises to resolve
//     try {
//         const results = await Promise.all(deletionPromises);
//         // Filter out successful deletions
//         const successfulDeletes = results.filter(result => result.success);
//         const failedDeletes = results.filter(result => !result.success);
        
//         console.log(`Successfully deleted ${successfulDeletes.length} files.`);
//         if (failedDeletes.length > 0) {
//             console.error(`Failed to delete ${failedDeletes.length} files.`);
//             message.error('Some files could not be deleted.');
//         }
//     } catch (error) {
//         message.error('An error occurred while deleting files.');
//     }
// };

  // const AddProject = async (values) => {
  //   setLoader(true);
  //   setIsLoading(true);

  //   const { paymentSchedule, cost } = values;

  //   // Calculate total amount from payment schedule
  //   const totalAmountInFigure = paymentSchedule?.reduce(
  //     (total, schedule) => total + parseFloat(schedule.amountInFigure || 0),
  //     0
  //   );
  
  //   if (totalAmountInFigure > cost) {
  //     const errorMessage = 'Total amount exceeds the project cost.';
  //     const errorFields = [];

  //     paymentSchedule.forEach((schedule, index) => {
  //       const scheduleAmount = parseFloat(schedule.amountInFigure || 0);
  
  //       if (scheduleAmount + totalAmountInFigure - scheduleAmount > cost) {
  //         errorFields.push({
  //           name: ['paymentSchedule', index, 'amountInFigure'],
  //           errors: [errorMessage],
  //         });
  //       }
  //     });

  //     form.setFields(errorFields);
  //     setLoader(false);
  //     return; // Prevent submission if total exceeds cost
  //   }

  //   let docs = [...uploadFiles], admin = [...uploadFiles2];

  //   let temp1, temp2 = []

  //   if (newFiles?.length > 0) {
  //     temp1 = await uploadFunction(newFiles);
  //     docs = [...docs, ...temp1]
  //   }
  //   if (newAdminFiles?.length > 0) {
  //     temp2 = await uploadFunction(newAdminFiles);
  //     admin = [...admin, ...temp2]
  //   }

  //   if (filesToDelete?.length > 0) {
  //     await DeleteFiles(filesToDelete);
  //     console.log('All files deleted successfully');
  //   }

  //   let data = {
  //     projectName: values.projectName,
  //     projectDescription: values.projectDescription,
  //     clientId: values.clientId,
  //     focalPersonId: values.focalPersonId,
  //     startDate: moment(values.startDate).format("YYYY-MM-DD"),
  //     endDate: moment(values.endDate).format("YYYY-MM-DD"),
  //     projectDomain: values.projectDomain,
  //     projectType: values.projectType,
  //     currency: values.currency,
  //     cost: values.cost,
  //     costType: values.costType,
  //     priority: values.priority,
  //     projectLead: values.projectLead,
  //     assignedDevelopers: values.assignedDevelopers,
  //     status: values.status,
  //     docs: docs,
  //     adminDocs: admin,
  //     paymentSchedule: values?.paymentSchedule,
  //   };

  //   apiServices("POST", `project-management/`, data, user_state)
  //     .then((res) => {
  //       if (res.data.success === true) {
  //         //const payrolls=res?.data?.payrolls;
  //         //console.log(payrolls)
  //         //setData((prevData) => [...prevData, ...payrolls]);
  //         //setFilters(selectedPayFilters);
  //         //GetGenPayrolls();
  //         message.success(t('projectScreen.errors.projectAdded'));
  //         setIsLoading(false);
  //         GetListProjects();
  //         closeCreateModal();
  //         setLoader(false);
  //       }
  //     })
  //     .catch((err) => {
  //       message.error(
  //         `${
  //           err?.response?.data?.msg
  //             ? err?.response?.data?.msg
  //             : err?.response?.data?.validation?.body?.message
  //             ? err?.response?.data?.validation?.body?.message
  //             : t('projectScreen.errors.addProjectError')
  //         }`
  //       );
  //       closeCreateModal();
  //       setIsLoading(false);
  //       setLoader(false);
  //     });
  // };

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
      title: t('projectScreen.Modal.leader'),
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
            src={projectLead?.imageUrl || user_icon}
            alt=""
            className="avatar"
            style={{ width: "30px", height: "30px", cursor: 'pointer' }}
          />
          <label style={{cursor: 'pointer'}}>{projectLead?.fullName}</label>
        </div>
      ),
    },
    {
      title: t('projectScreen.team'),
      dataIndex: "assignedDevelopers",
      key: "assignedDevelopers",
      render: (assignedDevelopers) => (
        <div className="project-members" style={{margin: '4px auto'}}>
        <ul className="team-members" style={{minWidth: 'max-content'}}>
          {assignedDevelopers?.slice(0, 4).map((developer, index) => (
            <li key={index}>
              <Tooltip title={developer?.fullName}>
                <Avatar style={{cursor: 'pointer'}} src={developer?.imageUrl || user_icon} />
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
                      <Tooltip title={developer?.fullName}>
                        <Avatar
                          src={developer?.imageUrl || user_icon}
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
      title: t('projectScreen.deadline'),
      dataIndex: "endDate",
      key: "endDate",
      render: (text, record) => <label style={{minWidth: 'max-content'}}>{text}</label> 
    },
    {
      title: t('projectScreen.Modal.priority'),
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
              ? ` ${t('projectScreen.Modal.high')}`
              : record === "Normal Priority"
              ? ` ${t('projectScreen.Modal.normal')}`
              : ` ${t('projectScreen.Modal.low')}`
              }
          </label>
        </div>
      ),
    },

    {
      title: t('projectScreen.status'),
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
              ? ` ${t('projectScreen.Modal.scheduled')}`
              : record === "On-Going"
              ? ` ${t('projectScreen.Modal.onGoing')}`
              : record === "Paused"
              ? ` ${t('projectScreen.Modal.paused')}`
              : record === "Archived"
              ? ` ${t('projectScreen.Modal.archived')}`
              : record === "Completed"
              ? ` ${t('projectScreen.Modal.completed')}`
              : ""}
          </label>
        </div>
      ),
    },
    {
      title: t('projectScreen.Modal.action'),
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
              <i className={`fa fa-pencil ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
              {t('edit')}
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                openDelete(record);
              }}
            >
              <i className={`fa fa-trash ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} /> {t('delete')}
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
          message.success(t('projectScreen.errors.projectDeletedSuccessfully'));
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
              : t('projectScreen.errors.errorDeletingProject')
          }`
        );
        closeDelete();
        setIsLoading(false);
        setLoader(false);
      });
  };


  // const uploadFunction = async (files) => {
  //   const uploadPromises = files?.map(file => {
  //     return apiUploadToS3(file)
  //       .then(res => ({
  //         asset_id: res?.data?.result?.asset_id,
  //         public_id: res?.data?.result?.public_id,
  //         fileName: file?.name,
  //         imageUrl: res?.data?.result?.secure_url,
  //         resource_type: res?.data?.result?.resource_type,
  //       }))
  //       .catch(err => {
  //         message.error(
  //           err?.response?.data?.msg
  //             ? err.response.data.msg
  //             : err.response.data.validation?.body?.message
  //             ? err.response.data.validation.body.message
  //             : t('projectScreen.errors.fileUploadError', { file: file?.name })
  //         );
  //         throw err; 
  //       });
  //   });
  
  //   try {
  //     return await Promise.all(uploadPromises);
  //   } catch (error) {
  //     console.error("File upload error:", error);
  //   }
  // };
  
  // const acceptableFormats = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "xls", "xlsx"];

  // const onFileUpload = async (files, type) => {
  //   if (type === 'normal') {
  //     const uploadPromises = [];
  //     const validFiles = []; // To store valid files
  //     const existingFileNames = selectedFiles?.map((file) => file?.fileName);
    
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       //console.log("File: ", file);
    
  //       // Check file format (extension)
  //       const fileExtension = file?.name?.split(".").pop().toLowerCase();
  //       if (!acceptableFormats.includes(fileExtension)) {
  //         message.error(t('projectScreen.errors.fileFormatNotSupported', { file: file?.name }));
  //         continue; // Skip this file and continue with the next one
  //       }
    
  //       // Check file size
  //       if (file?.size > 10485760) {
  //         message.error(t('projectScreen.errors.fileSizeExceedsLimit', { file: file?.name }));
  //         continue; // Skip this file and continue with the next one
  //       }
  
  //       if (existingFileNames?.includes(file?.name)) {
  //         message.error(t('projectScreen.errors.fileAlreadySelected', { file: file?.name }));
  //         continue; // Skip this file and continue with the next one
  //       }
  //       let fileData = {
  //         fileName: file?.name,
  //       }
  //       validFiles.push(fileData);
  //       setSelectedFiles((prevSelectedFiles) => {
  //         const uniqueValidFiles = validFiles.filter((newFile) => {
  //           // Check if a file with the same name already exists in the selectedFiles
  //           return !prevSelectedFiles?.some((existingFile) => 
  //             existingFile?.fileName === newFile?.fileName 
  //           );
  //         });
  //         return [...prevSelectedFiles, ...uniqueValidFiles];
  //       });
        
  //     setNewFiles((prev)=> [...prev, file]);
  //     }
  //   }
  //   else if ( type === 'admin') {
  //     const uploadPromises = [];
  //     const validFiles = []; // To store valid files
  //     const existingFileNames = selectedFiles2?.map((file) => file?.fileName);
    
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       //console.log("File: ", file);
    
  //       // Check file format (extension)
  //       const fileExtension = file?.name?.split(".").pop().toLowerCase();
  //       if (!acceptableFormats.includes(fileExtension)) {
  //         message.error(t('projectScreen.errors.fileFormatNotSupported', { file: file?.name }));
  //         continue; // Skip this file and continue with the next one
  //       }
    
  //       // Check file size
  //       if (file?.size > 10485760) {
  //         message.error(t('projectScreen.errors.fileSizeExceedsLimit', { file: file?.name }));
  //         continue; // Skip this file and continue with the next one
  //       }
  
  //       if (existingFileNames?.includes(file?.name)) {
  //         message.error(t('projectScreen.errors.fileAlreadySelected', { file: file?.name }));
  //         continue; // Skip this file and continue with the next one
  //       }
  //       let fileData = {
  //         fileName: file?.name,
  //       }
  //       validFiles.push(fileData);
  //       setSelectedFiles2((prevSelectedFiles) => {
  //         const uniqueValidFiles = validFiles.filter((newFile) => {
  //           // Check if a file with the same name already exists in the selectedFiles
  //           return !prevSelectedFiles?.some((existingFile) => 
  //             existingFile?.fileName === newFile?.fileName
  //           );
  //         });
  //         return [...prevSelectedFiles, ...uniqueValidFiles];
  //       });
  //       setNewAdminFiles((prev)=> [...prev, file]);
  //     }
  //     console.log(validFiles)
  //   }
  // };

  // const removeSelectedFile = (index, type) => {
  //   if (type === 'normal') {
  //     const updatedSelectedFiles = [...selectedFiles];
  //     const fileToRemove = updatedSelectedFiles[index];
  //     console.log(fileToRemove);
  //     updatedSelectedFiles.splice(index, 1);
  //     setSelectedFiles(updatedSelectedFiles);
  
  //     // Remove the corresponding file from the uploadFiles state array
  //     const updatedUploadFiles = [...uploadFiles];
  //     updatedUploadFiles.splice(index, 1);
  //     setUploadFiles(updatedUploadFiles);

  //     const updatedNewFiles = newFiles?.filter(file => file.name !== fileToRemove?.fileName);
  //     setNewFiles(updatedNewFiles);

  //     if (fileToRemove?.imageUrl) {
  //       setFilesToDelete(prev => [...prev, fileToRemove]);
  //     }
  //     console.log('file',filesToDelete)
  //     //DeleteFiles(fileToRemove?.public_id)
  //   }
  //   else if (type === 'admin') {
  //     const updatedSelectedFiles = [...selectedFiles2];
  //     const fileToRemove = updatedSelectedFiles[index];
  //     updatedSelectedFiles.splice(index, 1);
  //     setSelectedFiles2(updatedSelectedFiles);
  
  //     // Remove the corresponding file from the uploadFiles state array
  //     const updatedUploadFiles = [...uploadFiles2];
  //     updatedUploadFiles.splice(index, 1);
  //     setUploadFiles2(updatedUploadFiles);

  //     const updatedNewAdminFiles = newAdminFiles?.filter(file => file.name !== fileToRemove?.fileName);
  //     setNewAdminFiles(updatedNewAdminFiles);

  //     if (fileToRemove?.imageUrl) {
  //       setFilesToDelete(prev => [...prev, fileToRemove]);
  //     }
  //     console.log('file',filesToDelete)
  //   }
  // };

  // const displaySelectedFiles = (type) => {
  //   if (type === 'normal') {
  //     return selectedFiles?.map((file, index) => (
  //       <Space key={index}>
  //         <Tag
  //           closable
  //           onClose={() => removeSelectedFile(index, 'normal')}
  //           color="blue" // You can customize the color as needed
  //           className="custom-tag"
  //         >
  //           {file?.fileName || file?.name} 
  //         </Tag>
  //       </Space>
  //     ));
  //   }
  //   else if (type === 'admin') {
  //     return selectedFiles2?.map((file, index) => (
  //       <Space key={index}>
  //         <Tag
  //           closable
  //           onClose={() => removeSelectedFile(index, 'admin')}
  //           color="blue" // You can customize the color as needed
  //           className="custom-tag"
  //         >
  //           {file?.fileName || file.name}
  //         </Tag>
  //       </Space>
  //     ));
  //   }
  // };

  // const handleCostChange = (value) => {
  //   setProjectCost(value);
  //   const paymentSchedules = form.getFieldValue('paymentSchedule');

  //   const updatedPaymentSchedules = paymentSchedules?.map((schedule) => {
  //     const { amountInFigure } = schedule;
  //     const percentage = ((amountInFigure / value) * 100).toFixed(2);
  //     return {
  //       ...schedule,
  //       amountInPercent: parseFloat(percentage),
  //     };
  //   });

  //   form.setFieldsValue({
  //     paymentSchedule: updatedPaymentSchedules,
  //   });
  // }

  // const handleAmountInFigureChange = (value, index) => {
  //   const newPaymentSchedules = form.getFieldValue('paymentSchedule') 
  //   newPaymentSchedules[index].amountInFigure = value;

  //   const percentage = ((value / projectCost) * 100).toFixed(2); 
  //   newPaymentSchedules[index].amountInPercent = parseFloat(percentage);

  //   setPaymentSchedules(newPaymentSchedules); 
    
  //   form.setFieldsValue({
  //     paymentSchedule: newPaymentSchedules,
  //   });
  // };

  // const handleAmountInPercentChange = (value, index) => {
  //   const newPaymentSchedules = form.getFieldValue('paymentSchedule')
  //   newPaymentSchedules[index].amountInPercent = value; 

  //   const amount = Math.round((value * projectCost) / 100); 
  //   newPaymentSchedules[index].amountInFigure = amount;

  //   setPaymentSchedules(newPaymentSchedules); 
    
  //   form.setFieldsValue({
  //     paymentSchedule: newPaymentSchedules,
  //   });
  // };


  // const paymentColumns = [
  //   {
  //     title: t('projectScreen.Modal.paymentTitle'),
  //     dataIndex: "paymentTitle",
  //     key: "paymentTitle",
  //     render: (text, record, index) => (
  //       <Form.Item
  //         name={["paymentSchedule", index, "paymentTitle"]}
  //         className="custom-border"
  //         rules={[
  //           {
  //             required: true,
  //             message: t('projectScreen.Modal.enterPaymentTitle'),
  //           },
  //         ]}
  //       >
  //         <Input className="form-control"
  //         placeholder={t('projectScreen.Modal.enterTitle')} />
  //       </Form.Item>
  //     ),
  //   },
  //   {
  //     title: t('projectScreen.Modal.amountInFigure'),
  //     dataIndex: "amountInFigure",
  //     key: "amountInFigure",
  //     render: (text, record, index) => (
  //       <Form.Item
  //         name={["paymentSchedule", index, "amountInFigure"]}
  //         className="custom-border"
  //         rules={[
  //           {
  //             required: true,
  //             message: t('projectScreen.Modal.pleaseEnterAmountInFigure'),
  //           },
  //         ]}
  //       >
  //         {/* <Input type="number" className="form-control" /> */}
  //         <InputNumber
  //           className="form-control"
  //           placeholder={t('projectScreen.Modal.enterAmount')}
  //           formatter={(value) => {
  //             return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  //           }}
  //           parser={(value) => {
  //             return value.replace(/\$\s?|(,*)/g, '');
  //           }}
  //           onChange={(value) => handleAmountInFigureChange(value, index)}
  //         />
  //       </Form.Item>
  //     ),
  //   },
  //   {
  //     title: t('projectScreen.Modal.amountInPercent'),
  //     dataIndex: "amountInPercent",
  //     key: "amountInPercent",
  //     render: (text, record, index) => (
  //       <Form.Item
  //         name={["paymentSchedule", index, "amountInPercent"]}
  //         className="custom-border"
  //         rules={[
  //           {
  //             required: true,
  //             message: t('projectScreen.Modal.pleaseEnterAmountInPercentage'),
  //           },
  //         ]}
  //       >
  //         {/* <Input type="number" className="form-control" /> */}
  //         <InputNumber
  //           className="form-control"
  //           placeholder={t('projectScreen.Modal.enterPercentage')}
  //           max={100}
  //           min={0}
  //           maxLength={5}
  //           onChange={(value) => handleAmountInPercentChange(value, index)}
  //         />
  //       </Form.Item>
  //     ),
  //   },
  //   {
  //     title: t('projectScreen.Modal.dueDate'),
  //     dataIndex: "dueDate",
  //     key: "dueDate",
  //     render: (text, record, index) => (
  //       <div style={{ position: "relative" }} id={`dueDate-${index}`}>
  //         <Form.Item
  //           name={["paymentSchedule", index, "dueDate"]}
  //           rules={[
  //             {
  //               required: true,
  //               message: t('projectScreen.Modal.selectDueDate'),
  //             },
  //           ]}
  //           className="custom-border"
  //           style={{ width: "max-content" }}
  //         >
  //           <DatePicker
  //             suffixIcon={null}
  //             getPopupContainer={() =>
  //               document.getElementById(`dueDate-${index}`)
  //             }
  //             placeholder={t('requests.addModal.selectDate')}
  //             className="form-control"
  //             size="large"
  //           />
  //         </Form.Item>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: t('projectScreen.Modal.paid'),
  //     dataIndex: "paid",
  //     key: "paid",
  //     render: (text, record, index) => (
  //       <Form.Item
  //         name={["paymentSchedule", index, "paid"]}
  //         valuePropName="checked"
  //       >
  //         <Checkbox />
  //       </Form.Item>
  //     ),
  //   },
  //   // {
  //   //   title: "Action",
  //   //   key: "action",
  //   //   render: (text, record, index) => (
  //   //     <MinusCircleFilled
  //   //       style={{ color: "red", cursor: "pointer" }}
  //   //       //disabled={record?.paid}
  //   //       onClick={() => {
  //   //         removePaymentSchedule(index);
  //   //         console.log(record?.paid);
  //   //       }}
  //   //     />
  //   //   ),
  //   // },
  //   {
  //     title: t('projectScreen.Modal.action'),
  //     key: "action",
  //     render: (text, record, index) => (
  //       <span
  //         style={{
  //           color:
  //             paymentSchedules.length > 1
  //               ? index === paymentSchedules.length - 1
  //                 ? "red"
  //                 : "#ccc"
  //               : "#ccc",
  //           cursor: "pointer",
  //         }}
  //       >
  //         {/* <span style={{ color: index === paymentSchedules?.length - 1 ? 'red' : '#ccc', cursor: 'pointer' }}> */}
  //         <MinusCircleFilled
  //           onClick={() => {
  //             if (
  //               paymentSchedules.length > 1 &&
  //               index === paymentSchedules?.length - 1
  //             ) {
  //               removePaymentSchedule(index);
  //             }
  //           }}
  //         />
  //       </span>
  //     ),
  //   },
  // ];
 
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
                <h3 className="page-title">{t('projects')}</h3>
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
                  <li className="breadcrumb-item active">{t('projects')}</li>
                </ul>
              </div>
              <div className="col-auto float-end ms-auto">
                { (role === "admin" || permissions?.projectManagement) &&
                <button
                  className="btn add-btn"
                  onClick={() => { openCreateModal(); getAllCurrencies(); }}
                  disabled={
                    role === "admin" 
                      ? false
                      : permissions?.projectManagement
                      ? false
                      : true
                  }
                >
                  <i className="fa fa-plus" />
                  {t('projectScreen.createProject')}
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
                            placeholder={t('projectScreen.Modal.projectName')}
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
                              placeholder={t('projectScreen.Modal.selectDomain')}
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
                        <span className="d-flex justify-content-center">{t('search')}</span>
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
                        <span className="d-flex justify-content-center">{t('reset')}</span>
                      </button>
                    </div>
                  </div>
                :
                <div className="row filter-row">
                  <div className={`col-sm-6 ${(role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) ? 'col-md-2' : 'col-md-3'}`}>
                    <div className="form-group">
                      <Form.Item name="projectName" className="custom-border">
                        <Input
                          className="form-control"
                          allowClear={false}
                          placeholder={t('projectScreen.Modal.projectName')}
                          style={{height:'50px'}}
                          onChange={(e) =>
                            handleFilterChange(e.target.value, "projectName")
                          }
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className={`col-sm-6 ${(role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) ? 'col-md-2' : 'col-md-3'}`}>
                    <div className="form-group">
                      <Form.Item name="status" className="custom-border">
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
                        <Select
                            className="custom-select searchCenter"
                            getPopupContainer={() =>
                              document.getElementById("area1")
                            }
                            placeholder={t('projectScreen.Modal.projectStatus')}
                            style={{height:'50px'}}
                            onChange={(value) => {
                              handleFilterChange(value, "status");
                            }}
                          >
                            <Select.Option value="On-Going">{t('projectScreen.Modal.onGoing')}</Select.Option>
                            <Select.Option value="Completed">{t('projectScreen.Modal.completed')}</Select.Option>
                            <Select.Option value="Paused">{t('projectScreen.Modal.paused')}</Select.Option>
                            <Select.Option value="Scheduled">{t('projectScreen.Modal.scheduled')}</Select.Option>
                            <Select.Option value="Archived">{t('projectScreen.Modal.archived')}</Select.Option>
                          </Select>
                      </Form.Item>
                    </div>
                  </div>
                  {(role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) &&
                    <div className="col-sm-6 col-md-2">
                    <div className="form-group">
                      <div style={{ position: "relative" }} id="area1">
                        <Form.Item
                          name="costType"
                          className="custom-border"
                        >
                          <Select
                            className="custom-select searchCenter"
                            getPopupContainer={() =>
                              document.getElementById("area1")
                            }
                            placeholder={t('projectScreen.Modal.costType')}
                            style={{height:'50px'}}
                            onChange={(value) => {
                              handleFilterChange(value, "costType");
                            }}
                          >
                            <Select.Option value="Hourly">{t('projectScreen.Modal.hourly')}</Select.Option>
                            <Select.Option value="Fixed">{t('projectScreen.Modal.fixed')}</Select.Option>
                            <Select.Option value="Monthly">{t('projectScreen.Modal.monthly')}</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>}
                  <div className={`col-sm-6 ${(role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) ? 'col-md-2' : 'col-md-3'}`}>
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
                            placeholder={t('projectScreen.Modal.selectDomain')}
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
                  <div className={`${(role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) ? 'col-sm-12 col-md-4' : 'col-sm-6 col-md-3'}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "24px",
                  }}>
                    <button
                      type="primary"
                      htmlType="submit"
                      className="btn btn-success btn-block w-100"
                      //disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                      style={{marginBottom: '24px'}}
                    >
                      <span className="d-flex justify-content-center">{t('search')}</span>
                    </button>
                    <button
                      htmlType="button"
                      className="btn btn-success btn-block w-100"
                      onClick={handleReset}
                      //disabled={role === 'admin' ? false : permissions?.viewAllRequest ? false : permissions?.teamRequest ? false : true}
                      style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}}
                    >
                      <span className="d-flex justify-content-center">{t('reset')}</span>
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
                                <i className={`fa fa-pencil ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                                {t('edit')}
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  openDelete(project);
                                }}
                              >
                                <i className={`fa fa-trash ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} /> {t('delete')}
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
                          <div className="sub-title">{t('projectScreen.deadline')}:</div>
                          <div className="text-muted">{project?.endDate}</div>
                        </div>
                        <div className="pro-deadline m-b-15">
                          <div className="sub-title">{t('projectScreen.status')}:</div>
                          <div style={{
                            color: 
                              project?.status === 'Scheduled' ? 'red' :
                              project?.status === 'On-Going' ? 'orange' :
                              (project?.status === 'Paused' || project?.status === 'Archived') ? 'grey' :
                              project?.status === 'Completed' ? 'green' : 'inherit'
                          }}>
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
                          </div>
                        </div>
                        <div className="project-members m-b-15">
                          <div>{t('projectScreen.projectLeader')}:</div>
                          <ul className="team-members">
                            <li>
                            <Tooltip
                                title={project?.projectLead?.fullName}
                              >
                              <a>
                                <img
                                  alt=""
                                  src={
                                    project?.projectLead?.imageUrl ||
                                    user_icon
                                  }
                                />
                              </a>
                              </Tooltip>
                            </li>
                          </ul>
                        </div>
                        <div className="project-members m-b-15">
                          <div>{t('projectScreen.team')}:</div>
                          <ul className="team-members"
                          style={{ marginLeft: "10px" }}>
                            {project?.assignedDevelopers
                              ?.slice(0, 4)
                              ?.map((developer, devIndex) => (
                                <li key={devIndex}>
                                  <Tooltip
                                  className="projectTeamMember"
                                title={developer.fullName}
                              >
                              <a>
                                <img
                                  alt=""
                                  src={
                                    developer.imageUrl ||
                                    user_icon
                                  }
                                />
                              </a>
                              </Tooltip>

                                  {/* <a
                                    className="projectTeamMember"
                                    data-bs-toggle="tooltip"
                                    title={developer?.fullName}
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
                                            title={developer.fullName}
                                          >
                                            <Avatar
                                              src={
                                                developer.imageUrl ||
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
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, pageSize) => setPagination({...pagination, current: page, pageSize: pageSize,})}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
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
                      emptyText: isLoading ? null : customEmptyText
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
                {
                    tableData?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })
                        }
                        pageSizeOptions={["20", "30", "40", "50"]}
                        showSizeChanger
                        onChange={(page, pageSize) => setPagination({...pagination, current: page, pageSize: pageSize,})}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
                        disabled={isLoading}
                      />
                    </div>
                  }
              </div>
            </div>
          )}
        </div>

        {/* /Page Content */}

        {/* /Create Project Modal */}
        {/* <Modal
          open={null}
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
                <h5 className="modal-title">{t('projectScreen.addProject')}</h5>

                <button
                  type="button"
                  className="close"
                  onClick={closeCreateModal}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              {(role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) ? 
              (<div className="modal-body">
                <Form
                  form={form}
                  onFinish={AddProject}
                  onFinishFailed={({ errorFields }) => {
                    const consecutiveSpacesError = errorFields.find((field) =>
                      field.errors.toString().includes("consecutive spaces")
                    );
                    if(consecutiveSpacesError){
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                    }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    }
                  }}
                  name="control-hooks"
                >
                  <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.projectName')}</label>
                    <Form.Item
                      name="projectName"
                      className="custom-border"
                      rules={[
                        {
                          required: true,
                          message: t('projectScreen.Modal.enterProjectName'),
                        },
                      ]}
                    >
                      <Input
                        className="form-control"
                        placeholder={t('projectScreen.Modal.enterprojectName')}
                        maxLength={50}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.client')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="clientId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.chooseClient'),
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
                          placeholder={t('projectScreen.Modal.selectClient')}
                          onChange={(value) => {
                            // Set the selected client when it changes
                            setSelectedClient(value);

                            form.setFieldsValue({ focalPersonId: null });
                            // Fetch the focal persons based on the selected client
                            fetchFocalPersons(value);
                          }}
                        >
                          {clients?.map((client) => (
                            <Select.Option key={client._id} value={client._id}>
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
                    <label>{t('projectScreen.Modal.focalPerson')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="focalPersonId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.selectFocalPerson'),
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
                          placeholder={t('projectScreen.Modal.selectfocalPerson')}
                        >
                          {focalPersons?.map((focalPerson) => (
                            <Select.Option
                              key={focalPerson._id}
                              value={focalPerson._id}
                            >
                              {focalPerson?.focalPersonName}{" "}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.projectStatus')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="status"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.chooseStatus'),
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder={t('projectScreen.Modal.selectStatus')}
                        >
                          <Select.Option value="Paused">{t('projectScreen.Modal.paused')}</Select.Option>
                          <Select.Option value="Scheduled">
                          {t('projectScreen.Modal.scheduled')}
                          </Select.Option>
                          <Select.Option value="On-Going">
                          {t('projectScreen.Modal.onGoing')}
                          </Select.Option>
                          <Select.Option value="Archived">
                          {t('projectScreen.Modal.archived')}
                          </Select.Option>
                          <Select.Option value="Completed">
                          {t('projectScreen.Modal.completed')}
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
                    <label>{t('projectScreen.Modal.startDate')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="startDate"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.enterStartDate'),
                          },
                        ]}
                      >
                        <DatePicker
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          style={{ width: "100%" }}
                          className="form-control"
                          placeholder={t('requests.addModal.selectDate')}
                          size="large"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.endDate')}</label>
                    <div style={{ position: "relative" }} id="area">

                      <Form.Item
                        name="endDate"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.enterEndDate'),
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
                              return Promise.reject(t('projectScreen.errors.endDateMustNotBeBeforeStartDate'));
                            },
                          }),
                        ]}
                        className="custom-border"
                      >
                        <DatePicker
                          getPopupContainer={() => document.getElementById("area")}
                          style={{ width: "100%" }}
                          className="form-control"
                          placeholder={t('requests.addModal.selectDate')}
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
                    <label>{t('projectScreen.Modal.domain')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="projectDomain"
                        className="addTeamHeight"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.domainCannotBeEmpty'),
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
                          placeholder={t('projectScreen.Modal.selectDomain')}
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
                      <label>{t('projectScreen.Modal.projectType')}</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="projectType"
                            className="custom-border"
                            rules={[
                              {
                                required: true,
                                message: t('projectScreen.Modal.chooseProjectType'),
                              },
                            ]}
                          >
                            <Select
                              // showSearch
                              className="custom-select custom-normal"
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder={t('projectScreen.Modal.selectProjectType')}
                              onChange={(value) => setProjectType(value)}
                              options={[
                                {
                                    value: 'Billed',
                                    label: t('projectScreen.Modal.billed'),
                                },
                                {
                                    value: 'nonBilled',
                                    label: t('projectScreen.Modal.nonBilled'),
                                },
                                ]}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.currency')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="currency"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.chooseCurrency'),
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder={t('projectScreen.Modal.selectCurrency')}
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
                    <label>{t('projectScreen.Modal.cost')}</label>

                    <Form.Item
                      name="cost"
                      className="custom-border"
                      rules={[
                        {
                          required: true,
                          message: t('projectScreen.Modal.pleaseEnterCost'),
                        },
                      ]}
                    >
                      <InputNumber
                        className="form-control"
                        formatter={(value) => {
                          return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        }}
                        parser={(value) => {
                          return value.replace(/\$\s?|(,*)/g, '');
                        }}
                        onChange={(value) => handleCostChange(value)}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.costType')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="costType"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.chooseCostType'),
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder={t('projectScreen.Modal.selectCostType')}
                        >
                          <Select.Option value="Hourly">{t('projectScreen.Modal.hourly')}</Select.Option>
                          <Select.Option value="Fixed">{t('projectScreen.Modal.fixed')}</Select.Option>
                          <Select.Option value="Monthly">{t('projectScreen.Modal.monthly')}</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.priority')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="priority"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.choosePriority'),
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder={t('projectScreen.Modal.choosepriority')}
                        >
                          <Select.Option value="High Priority">
                          {t('projectScreen.Modal.highPriority')}
                          </Select.Option>
                          <Select.Option value="Normal Priority">
                          {t('projectScreen.Modal.normalPriority')}
                          </Select.Option>
                          <Select.Option value="Low Priority">
                          {t('projectScreen.Modal.lowPriority')}
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
                    <label>{t('projectScreen.Modal.leader')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="projectLead"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.selectLeader'),
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
                          placeholder={t('projectScreen.Modal.selectleader')}
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
                    <label>{t('projectScreen.Modal.teamLeader')}</label>
                    <div className="project-members">
                      {selectedLeader && (
                        <a
                          data-bs-toggle="tooltip"
                          title={getEmployeeFullName(selectedLeader)}
                          className="avatar"
                        >
                          <img
                            src={getEmployeeImage(selectedLeader) || user_icon}
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
                    <label>{t('projectScreen.Modal.addTeam')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="assignedDevelopers"
                        className="addTeamHeight"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.teamCannotBeEmpty'),
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
                          placeholder={t('projectScreen.Modal.selectTeamMembers')}
                          onChange={(values) => setSelectedTeamMembers(values)}
                        >
                          {getTeamMemberOptions()}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
  <div className="form-group">
    <label>{t('projectScreen.Modal.teamMembers')}</label>
    <div className="project-members" style={{ margin: '4px auto' }}>
      <ul className="team-members" style={{ minWidth: 'max-content' }}>
        {selectedTeamMembers?.slice(0, 4).map((teamMember, index) => (
          <li key={index}>
            <Tooltip title={getEmployeeFullName(teamMember)}>
              <Avatar style={{ cursor: 'pointer' }} src={getEmployeeImage(teamMember) || user_icon} />
            </Tooltip>
          </li>
        ))}
        {selectedTeamMembers?.length > 4 && (
          <li className="dropdown avatar-dropdown">
            <Link
              className="all-users dropdown-toggle projectTeamMember"
              style={{ display: 'inline-flex', height: '33px', width: '33px' }}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              +{selectedTeamMembers?.length - 4}
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              <div className="avatar-group">
                {selectedTeamMembers?.slice(4).map((teamMember, index) => (
                  <a
                    className="avatar avatar-xs projectTeamMember"
                    key={index}
                  >
                    <Tooltip title={getEmployeeFullName(teamMember)}>
                      <Avatar
                        src={getEmployeeImage(teamMember) || user_icon}
                        style={{ cursor: 'pointer' }}
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
                <label>{t('projectScreen.Modal.description')}</label>
                <Form.Item
                  name="projectDescription"
                  rules={[
                    {
                      required: true,
                      message: t('projectScreen.Modal.enterProjectDescription'),
                    },
                  ]}
                >
                  <Input.TextArea className="form-control" rows={5} />
                </Form.Item>
              </div>

              <div className="form-group">
                <label>{t('projectScreen.Modal.uploadFiles')}{" "}
                  <small style={{ color: 'grey', fontSize: 'small' }}>
                    ({t('projectScreen.Modal.allowedFormats')})
                  </small>
                </label>
                <input
                  className="form-control"
                  multiple
                  onChange={(e) => {
                    onFileUpload(e.target.files, 'normal');
                  }}
                  type="file"
                />
              </div>
              <div className="selected-files">{displaySelectedFiles('normal')}</div>
              <hr
                className="developer-divider"
                style={{ opacity: "0", marginTop: "0px" }}
              />
              <hr
                className="developer-divider"
                style={{ opacity: "0", marginTop: "0px" }}
              />

            {(role === 'admin' || (permissions?.projectManagement && permissions?.managePayrolls)) &&
              <>
                <div className="form-group">
                  <label>Admin Files{" "}
                    <small style={{ color: 'grey', fontSize: 'small' }}>
                      ({t('projectScreen.Modal.allowedFormats')})
                    </small>
                    <span className="badge badge-pill bg-custom float-end" style={{marginLeft:'10px'}}>ADMIN</span>
                  </label>
                  <input
                    className="form-control"
                    multiple
                    onChange={(e) => {
                      onFileUpload(e.target.files, 'admin');
                    }}
                    type="file"
                  />
                </div>
                <div className="selected-files">{displaySelectedFiles('admin')}</div>
                <hr
                  className="developer-divider"
                  style={{ opacity: "0", marginTop: "0px" }}
                />
                <hr
                  className="developer-divider"
                  style={{ opacity: "0", marginTop: "0px" }}
                />
              </>
              }
                {projectType === 'Billed' && (
              <>
              <h4
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                {t('projectScreen.Modal.paymentSchedules')}
              </h4>
              <hr
                className="developer-dividerdddd"
                style={{ opacity: "0", marginTop: "0px" }}
              />
              <div className="table-responsive">
                <Table
                  dataSource={paymentSchedules}
                  columns={paymentColumns}
                  rowKey={(record, index) => index}
                  pagination={false}
                  style={{ overflowX: "auto", height: "320px", }}
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

              <div className="submit-section">
                <Form.Item>
                  <Button type="primary" onClick={addPaymentSchedule} className="btn btn-primary submit-btn btn-add" style={{fontSize: '14px', minWidth: '30px', height: '39px', lineHeight: '0px'}}>
                    <i className="fa fa-plus m-r-5" />
                    {t('projectScreen.Modal.addMorePayments')}
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
                        t('submit')
                      )}
                        
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </div>)
              :
              (<div className="modal-body">
                <Form
                  form={form}
                  onFinish={AddProject}
                  onFinishFailed={({ errorFields }) => {
                    const consecutiveSpacesError = errorFields.find((field) =>
                      field.errors.toString().includes("consecutive spaces")
                    );
                    if(consecutiveSpacesError){
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                    }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    }
                  }}
                  name="control-hooks"
                >
                  <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.projectName')}</label>
                    <Form.Item
                      name="projectName"
                      className="custom-border"
                      rules={[
                        {
                          required: true,
                          message: t('projectScreen.Modal.enterProjectName'),
                        },
                      ]}
                    >
                      <Input
                        className="form-control"
                        placeholder={t('projectScreen.Modal.enterprojectName')}
                        maxLength={50}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.client')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="clientId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.chooseClient'),
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
                          placeholder={t('projectScreen.Modal.selectClient')}
                          onChange={(value) => {
                            // Set the selected client when it changes
                            setSelectedClient(value);

                            form.setFieldsValue({ focalPersonId: null });
                            // Fetch the focal persons based on the selected client
                            fetchFocalPersons(value);
                          }}
                        >
                          {clients?.map((client) => (
                            <Select.Option key={client._id} value={client._id}>
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
                    <label>{t('projectScreen.Modal.focalPerson')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="focalPersonId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.selectFocalPerson'),
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
                          placeholder={t('projectScreen.Modal.selectfocalPerson')}
                        >
                          {focalPersons?.map((focalPerson) => (
                            <Select.Option
                              key={focalPerson._id}
                              value={focalPerson._id}
                            >
                              {focalPerson?.focalPersonName}{" "}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.projectStatus')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="status"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.chooseStatus'),
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder={t('projectScreen.Modal.selectStatus')}
                        >
                          <Select.Option value="Paused">{t('projectScreen.Modal.paused')}</Select.Option>
                          <Select.Option value="Scheduled">
                          {t('projectScreen.Modal.scheduled')}
                          </Select.Option>
                          <Select.Option value="On-Going">
                          {t('projectScreen.Modal.onGoing')}
                          </Select.Option>
                          <Select.Option value="Archived">
                          {t('projectScreen.Modal.archived')}
                          </Select.Option>
                          <Select.Option value="Completed">
                          {t('projectScreen.Modal.completed')}
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
                    <label>{t('projectScreen.Modal.startDate')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="startDate"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.enterStartDate'),
                          },
                        ]}
                      >
                        <DatePicker
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          style={{ width: "100%" }}
                          className="form-control"
                          placeholder={t('requests.addModal.selectDate')}
                          size="large"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.endDate')}</label>
                    <div style={{ position: "relative" }} id="area">

                      <Form.Item
                        name="endDate"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.enterEndDate'),
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
                              return Promise.reject(t('projectScreen.errors.endDateMustNotBeBeforeStartDate'));
                            },
                          }),
                        ]}
                        className="custom-border"
                      >
                        <DatePicker
                          getPopupContainer={() => document.getElementById("area")}
                          style={{ width: "100%" }}
                          className="form-control"
                          placeholder={t('requests.addModal.selectDate')}
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
                    <label>{t('projectScreen.Modal.domain')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="projectDomain"
                        className="addTeamHeight"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.domainCannotBeEmpty'),
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
                          placeholder={t('projectScreen.Modal.selectDomain')}
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
                    <label>{t('projectScreen.Modal.priority')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="priority"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.choosePriority'),
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder={t('projectScreen.Modal.choosepriority')}
                        >
                          <Select.Option value="High Priority">
                          {t('projectScreen.Modal.highPriority')}
                          </Select.Option>
                          <Select.Option value="Normal Priority">
                          {t('projectScreen.Modal.normalPriority')}
                          </Select.Option>
                          <Select.Option value="Low Priority">
                          {t('projectScreen.Modal.lowPriority')}
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
                    <label>{t('projectScreen.Modal.leader')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="projectLead"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.selectLeader'),
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
                          placeholder={t('projectScreen.Modal.selectleader')}
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
                    <label>{t('projectScreen.Modal.teamLeader')}</label>
                    <div className="project-members">
                      {selectedLeader && (
                        <a
                          data-bs-toggle="tooltip"
                          title={getEmployeeFullName(selectedLeader)}
                          className="avatar"
                        >
                          <img
                            src={getEmployeeImage(selectedLeader) || user_icon}
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
                    <label>{t('projectScreen.Modal.addTeam')}</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="assignedDevelopers"
                        className="addTeamHeight"
                        rules={[
                          {
                            required: true,
                            message: t('projectScreen.Modal.teamCannotBeEmpty'),
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
                          placeholder={t('projectScreen.Modal.selectTeamMembers')}
                          onChange={(values) => setSelectedTeamMembers(values)}
                        >
                          {getTeamMemberOptions()}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
  <div className="form-group">
    <label>{t('projectScreen.Modal.teamMembers')}</label>
    <div className="project-members" style={{ margin: '4px auto' }}>
      <ul className="team-members" style={{ minWidth: 'max-content' }}>
        {selectedTeamMembers?.slice(0, 4).map((teamMember, index) => (
          <li key={index}>
            <Tooltip title={getEmployeeFullName(teamMember)}>
              <Avatar style={{ cursor: 'pointer' }} src={getEmployeeImage(teamMember) || user_icon} />
            </Tooltip>
          </li>
        ))}
        {selectedTeamMembers?.length > 4 && (
          <li className="dropdown avatar-dropdown">
            <Link
              className="all-users dropdown-toggle projectTeamMember"
              style={{ display: 'inline-flex', height: '33px', width: '33px' }}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              +{selectedTeamMembers?.length - 4}
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              <div className="avatar-group">
                {selectedTeamMembers?.slice(4).map((teamMember, index) => (
                  <a
                    className="avatar avatar-xs projectTeamMember"
                    key={index}
                  >
                    <Tooltip title={getEmployeeFullName(teamMember)}>
                      <Avatar
                        src={getEmployeeImage(teamMember) || user_icon}
                        style={{ cursor: 'pointer' }}
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
                <label>{t('projectScreen.Modal.description')}</label>
                <Form.Item
                  name="projectDescription"
                  rules={[
                    {
                      required: true,
                      message: t('projectScreen.Modal.enterProjectDescription'),
                    },
                  ]}
                >
                  <Input.TextArea className="form-control" rows={5} />
                </Form.Item>
              </div>

              <div className="form-group">
                <label>{t('projectScreen.Modal.uploadFiles')}{" "}
                  <small style={{ color: 'grey', fontSize: 'small' }}>
                    ({t('projectScreen.Modal.allowedFormats')})
                  </small>
                </label>
                <input
                  className="form-control"
                  multiple
                  onChange={(e) => {
                    onFileUpload(e.target.files, 'normal');
                  }}
                  type="file"
                />
              </div>
              <div className="selected-files">{displaySelectedFiles('normal')}</div>

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
                        t('submit')
                      )}
                        
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </div>)
              }
            </div>
          </div>
        </Modal> */}

        {/* Edit Project Modal */}

        {editModal && (
          <EditProjects
            data={selectedData}
            editModal={editModal}
            closeEditModal={closeEditModal}
            getlistprojects={GetListProjects}
            allCurrencies={allCurrencies}
            allDomain={allDomain}
          />
        )}
        
        {createModal && (
          <EditProjects
            data={null}
            editModal={createModal}
            closeEditModal={closeCreateModal}
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
                  <h3 style={{ marginBottom: "30px" }}>{t('viewProject.deleteProject')}</h3>
                  <p>{t('viewProject.confirmDeleteMessage')}</p>
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
                          t('delete')
                        )}
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        onClick={closeDelete}
                        className="btn btn-primary submit-btn"
                        style={{ width: "100%" }}
                      >
                        {t('cancel')}
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
