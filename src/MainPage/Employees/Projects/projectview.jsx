import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { MinusCircleFilled } from "@ant-design/icons";
import EditProjects from "./EditProjects";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
//import EditProjects from "./EditProjects";
import { getAllISOCodes } from 'iso-country-currency';


const ProjectView = () => {
  const [form] = Form.useForm();

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  console.log(permissions,user_state)
  const nav = useNavigate();

  const [paymentSchedules, setPaymentSchedules] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
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

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);

  const getEmployeeImage = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee?.imageUrl || ""; // You may provide a default image URL
  };

  const handleRemoveDeveloper = (developerId) => {
    const updatedSelectedDevelopers = selectedDevelopers.filter(
      (id) => id !== developerId
    );
    setSelectedDevelopers(updatedSelectedDevelopers);
  };

  const handleSelectDeveloper = (value) => {
    setSelectedDevelopers([...selectedDevelopers, value]);
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
      .filter((employee) => !selectedEmployeeIds.includes(employee._id))
      .map((employee) => (
        <Select.Option key={employee._id} value={employee._id}>
          {employee.fullName}
        </Select.Option>
      ));
  };

  const [data, setData] = useState([]);

  const { _id } = useParams();
  //console.log(_id);
  //const originalProjectName = projectName.replace(/[-_]/g, ' ');

  const project = data?.find((p) => p?._id === _id);
  console.log("this is project :", project);

  const openUserModal = () => {
    setOpenUser(true);
  };

  const closeUser = () => {
    setOpenUser(false);
    form.resetFields();
    setSelectedDevelopers([]);
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
    //setFocalPersons([]);
    //setSelectedLeader(null);
    //setSelectedTeamMembers([]);
  };

  const openEditModal = (data) => {
    setSelectedData(data);
    fetchFocalPersons(data?.clientId);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedData(null);
    setEditModal(false);
    form.resetFields();
  };

  useEffect(() => {
    if(role === 'admin' || role === 'client' || role === 'focalperson' || permissions?.projectManagement || permissions?.clientManagement ) {
      setIsLoading(true);
      GetProjects();
      fetchEmployees();
      ViewClients();
    }else{
      nav('/restricted', { state: { unAuthorize: true}})
    }
  }, []);

  const GetProjects = () => {
    apiServices(
      "GET",
      `project-management/?page=1&limit=99999`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          setData(res?.data?.projects?.docs);
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
              : "Get Projects Error"
          }`
        );
        setIsLoading(false);
        setLoadLeader(false);
        setLoadTeam(false);
        setTableLoad(false);
      });
  };

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
              : "Get Employee Error"
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

  const UpdateTeam = () => {
    //setLoader(true);
    //setIsLoading(true);

    let data = {
      _id: project?._id,
      startDate: moment(project?.startDate).format("YYYY-MM-DD"),
      endDate: moment(project?.endDate).format("YYYY-MM-DD"),
      deleted: false,
      companyId: project?.companyId,
    };

    if (selectedLeader !== null) {
      data.projectLead = selectedLeader;
      setLoadLeader(true);
    }

    if (selectedDevelopers.length > 0) {
      data.assignedDevelopers = selectedDevelopers;
      setLoadTeam(true);
    }

    apiServices("PUT", `project-management/`, data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(`Project Team Updated Successfully`);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error Updating Team"
          }`
        );
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
          message.success(`Status set to Paid`);
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
              : "Error Updating Payment"
          }`
        );
      })
      .finally(() => {
        GetProjects();
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
      title: "Payment Title",
      dataIndex: "paymentTitle",
      key: "paymentTitle",
    },
    {
      title: "Amount in Figure",
      dataIndex: "amountInFigure",
      key: "amountInFigure",
      render: (amount) => {

        return(
          <>
            {amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {project?.currency}
          </>
        )
      },
    },
    {
      title: "Amount in Percent",
      dataIndex: "amountInPercent",
      key: "amountInPercent",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate) => moment(dueDate).format("YYYY-MM-DD"),
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (paid, record) => (
        <Checkbox
          checked={paid}
          disabled={paid || role === 'client' || role === 'focalperson' } // Disable the checkbox if already paid
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

  const emptyfunction = () =>{
    return null
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

  const showTeamSearch = (val, type) => {
    let dropdownValues = []
    if(type === 'Team'){
      employees.forEach((team)=>{
          dropdownValues.push(team.fullName.toLowerCase())
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

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Project View - DaftarPro</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Project</h3>
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
                <li className="breadcrumb-item active">Project View</li>
              </ul>
            </div>

            <div className="col-auto float-end ms-auto">
              {!isLoading && (
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
                  disabled={role === 'client' || role === 'focalperson'}
                >
                  <i className="fa fa-plus" />
                  Edit Project
                </button>
              )}

              {/* <Link
                to="/app/projects/task-board"
                className="btn btn-white float-end m-r-10"
                data-bs-toggle="tooltip"
                title="Task Board"
              >
                <i className="fa fa-bars" />
              </Link> */}
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
                  <label>{project?.projectDescription}</label>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h5 className="card-title m-b-20">Uploaded Image Files</h5>
                  <div className="row">
                    {project?.docs?.length > 0 ? (
                      // project?.docs?.map((doc, index) => {
                      //   // Split the link to check for the file format
                      //   const parts = doc.split(".");
                      //   const format = parts[parts.length - 1];

                      //   // Check if it's a cloudinary link and the format is an image
                      //   if (
                      //     doc.includes("res.cloudinary.com") &&
                      //     format.match(/^(jpg|jpeg|png|gif)$/i)
                      //   ) {
                      //     // Extract the image ID from the Cloudinary URL
                      //     const imageId = doc.match(/v\d+\/(.+?)\./)[1];
                      //     // Construct the thumbnail URL
                      //     const thumbnailUrl = `https://res.cloudinary.com/dcxpovyr9/image/upload/c_thumb,w_200,h_200/${imageId}.png`;

                      //     const fullImageUrl = `https://res.cloudinary.com/dcxpovyr9/image/upload/${imageId}.${format}`;

                      //     const downloadLink = `${doc.replace(
                      //       "/upload/",
                      //       "/upload/fl_attachment/"
                      //     )}`;

                      //     return (
                      //       <div
                      //         key={index}
                      //         className="col-md-3 col-sm-4 col-lg-4 col-xl-3"
                      //       >
                      //         <div className="uploaded-box">
                      //           <a
                      //             href={fullImageUrl}
                      //             target="_blank"
                      //             rel="noopener noreferrer"
                      //           >
                      //             <div className="uploaded-img">
                      //               <img
                      //                 src={thumbnailUrl}
                      //                 className="img-fluid"
                      //                 alt={`Image ${index + 1}`}
                      //                 style={{ borderRadius: "10px" }}
                      //               />
                      //               <div className="download-icon hidden">
                      //                 <a href={downloadLink} download>
                      //                   <i className="fa fa-download" />
                      //                 </a>
                      //               </div>
                      //             </div>
                      //           </a>
                      //           <div className="uploaded-img-name">{`File ${
                      //             index + 1
                      //           }`}</div>
                      //         </div>
                      //       </div>
                      //     );
                      //   } else if (format.match(/^(jpg|jpeg|png|gif)$/i)) {
                      //     // Check if it's an image based on the file format
                      //     return (
                      //       <div
                      //         key={index}
                      //         className="col-md-3 col-sm-4 col-lg-4 col-xl-3"
                      //       >
                      //         <div className="uploaded-box">
                      //           <div className="uploaded-img">
                      //             <img
                      //               src={doc}
                      //               className="img-fluid"
                      //               alt={`Image ${index + 1}`}
                      //             />
                      //             <div className="download-icon">
                      //               <a href={fullImageUrl} download>
                      //                 <i className="fa fa-download" />
                      //               </a>
                      //             </div>
                      //           </div>
                      //           <div className="uploaded-img-name">{`File ${
                      //             index + 1
                      //           }`}</div>
                      //         </div>
                      //       </div>
                      //     );
                      //   }
                      //   // If it's not an image, return null to ignore it
                      //   return null;
                      // })
                      project?.docs?.some((doc) => {
                        const parts = doc.split(".");
                        const format = parts[parts.length - 1];
                        return (
                          doc.includes("res.cloudinary.com") &&
                          format.match(/^(jpg|jpeg|png|gif)$/i)
                        );
                      }) ? (
                        project?.docs?.map((doc, index) => {
                          // Split the link to check for the file format
                          const parts = doc.split(".");
                          const format = parts[parts.length - 1];
  
                          // Check if it's a cloudinary link and the format is an image
                          if (
                            doc.includes("res.cloudinary.com") &&
                            format.match(/^(jpg|jpeg|png|gif)$/i)
                          ) {
                            // Extract the image ID from the Cloudinary URL
                            const imageId = doc.match(/v\d+\/(.+?)\./)[1];
                            // Construct the thumbnail URL
                            const thumbnailUrl = `https://res.cloudinary.com/dcxpovyr9/image/upload/c_thumb,w_200,h_200/${imageId}.png`;
  
                            const fullImageUrl = `https://res.cloudinary.com/dcxpovyr9/image/upload/${imageId}.${format}`;
  
                            const downloadLink = `${doc.replace(
                              "/upload/",
                              "/upload/fl_attachment/"
                            )}`;
  
                            return (
                              <div
                                key={index}
                                className="col-md-3 col-sm-4 col-lg-4 col-xl-3"
                              >
                                <div className="uploaded-box">
                                  <a
                                    href={fullImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <div className="uploaded-img">
                                      <img
                                        src={thumbnailUrl}
                                        className="img-fluid"
                                        alt={`Image ${index + 1}`}
                                        style={{ borderRadius: "10px" }}
                                      />
                                      <div className="download-icon hidden">
                                        <a href={downloadLink} download>
                                          <i className="fa fa-download" />
                                        </a>
                                      </div>
                                    </div>
                                  </a>
                                  <div className="uploaded-img-name">{`File ${
                                    index + 1
                                  }`}</div>
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
                                      src={doc}
                                      className="img-fluid"
                                      alt={`Image ${index + 1}`}
                                    />
                                    <div className="download-icon">
                                      <a href={fullImageUrl} download>
                                        <i className="fa fa-download" />
                                      </a>
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
                        <label>No images uploaded</label>
                      )
                    ) : (
                      <label>No images uploaded</label>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h5 className="card-title m-b-20">Uploaded Files</h5>
                  <ul className="files-list">
                    {project?.docs.length > 0 ? (
                      // project?.docs.map((doc, index) => {
                      //   // Split the link to get the file format
                      //   const parts = doc.split(".");
                      //   const format = parts[parts.length - 1];

                      //   // Check if it's an image format (jpg, jpeg, png, gif)
                      //   if (format.match(/^(jpg|jpeg|png|gif)$/i)) {
                      //     // Ignore image files
                      //     return null;
                      //   }

                      //   // Construct the thumbnail URL based on file format
                      //   let thumbnailUrl = "";
                      //   if (format.toLowerCase() === "pdf") {
                      //     thumbnailUrl = "/path-to-pdf-icon.png"; // Replace with the path to your PDF icon
                      //   } else {
                      //     thumbnailUrl = "/path-to-generic-file-icon.png"; // Replace with the path to your generic file icon
                      //   }

                      //   const downloadLink = `${doc.replace(
                      //     "/upload/",
                      //     "/upload/fl_attachment/"
                      //   )}`;

                      //   return (
                      //     <li key={index}>
                      //       <div
                      //         className="files-cont"
                      //         style={{
                      //           display: "flex",
                      //           alignItems: "center",
                      //           paddingTop: "inherit",
                      //         }}
                      //       >
                      //         <div className="file-type">
                      //           <span className="files-icon">
                      //             <i
                      //               className={`fa fa-file-${format.toLowerCase()}-o`}
                      //             />
                      //           </span>
                      //         </div>
                      //         <div className="files-info">
                      //           <span className="file-name text-ellipsis">
                      //             <a
                      //               href={doc}
                      //               target="_blank"
                      //               rel="noopener noreferrer"
                      //             >
                      //               {`File ${index + 1}.${format}`}
                      //             </a>
                      //           </span>
                      //         </div>
                      //         <ul className="files-action">
                      //           <li className="dropdown dropdown-action">
                      //             <a
                      //               href={downloadLink}
                      //               className="dropdown-toggle btn btn-link"
                      //               download
                      //             >
                      //               <i className="fa fa-download" />{" "}
                      //               {/* Download icon */}
                      //             </a>
                      //           </li>
                      //         </ul>
                      //       </div>
                      //     </li>
                      //   );
                      // })
                      project?.docs?.every((doc) => {
                        // Split the link to get the file format
                        const parts = doc.split(".");
                        const format = parts[parts.length - 1];
                
                        // Check if it's an image format (jpg, jpeg, png, gif)
                        return format.match(/^(jpg|jpeg|png|gif)$/i);
                      }) ? (
                        // Render "No files uploaded" message if all files are images
                        <label>No files uploaded</label>
                      ) : (
                        // Render files
                        project?.docs.map((doc, index) => {
                          // Split the link to get the file format
                          const parts = doc.split(".");
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
  
                          const downloadLink = `${doc.replace(
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
                                      className={`fa fa-file-${format.toLowerCase()}-o`}
                                    />
                                  </span>
                                </div>
                                <div className="files-info">
                                  <span className="file-name text-ellipsis">
                                    <a
                                      href={doc}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {`File ${index + 1}.${format}`}
                                    </a>
                                  </span>
                                </div>
                                <ul className="files-action">
                                  <li className="dropdown dropdown-action">
                                    <a
                                      href={downloadLink}
                                      className="dropdown-toggle btn btn-link"
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
                    ) : (
                      <label>No files uploaded</label>
                    )}
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h5 className="card-title m-b-20">Payments</h5>
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
                      dataSource={project?.paymentSchedule}
                      columns={paymentColumns}
                      rowKey={(record, index) => index}
                      pagination={false}
                      style={{ overflowX: "auto" }}
                    />
                  </div>
                </div>
              </div>

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
                  <h6 className="card-title m-b-15">Project Details</h6>
                  <table className="table table-striped table-border">
                    <tbody>
                      <tr>
                        <td>Cost:</td>
                        <td className="text-end">{project?.cost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {project?.currency}</td>
                      </tr>
                      <tr>
                        <td>Start Date:</td>
                        <td className="text-end">
                          {moment(project?.startDate).format("YYYY-MM-DD")}
                        </td>
                      </tr>
                      <tr>
                        <td>Deadline:</td>
                        <td className="text-end">
                          {moment(project?.endDate).format("YYYY-MM-DD")}
                        </td>
                      </tr>
                      <tr>
                        <td>Priority:</td>
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
                              ? "High"
                              : project?.priority === "Normal Priority"
                              ? "Normal"
                              : "Low"}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>Status:</td>
                        <td className="text-end">{project?.status}</td>
                      </tr>
                    </tbody>
                  </table>
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
                    <label style={{width: '69%'}}>Assigned Leader</label>
                    <button
                      type="button"
                      className="float-end btn btn-primary btn-sm"
                      // data-bs-toggle="modal"
                      // data-bs-target="#assign_leader"
                      onClick={() => {
                        openLeaderModal();
                        setSelectedLeader(project?.projectLead);
                      }}
                      disabled={role === 'client' || role === 'focalperson'}
                    >
                      <i className="fa fa-plus" /> Edit
                    </button>
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
                                getEmployeeImage(project.projectLead) ||
                                user_icon
                              }
                            />
                            <label className="employee-name">
                              {getEmployeeFullName(project.projectLead)}
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
                    <label style={{width: '69%'}}>Assigned Developers</label>
                    <button
                      type="button"
                      className="float-end btn btn-primary btn-sm"
                      onClick={() => {
                        openUserModal();
                        setSelectedDevelopers(project?.assignedDevelopers);
                      }}
                      disabled={role === 'client' || role === 'focalperson'}
                    >
                      <i className="fa fa-plus" /> Add
                    </button>
                  </h6>
                  {LoadTeam ? (
                    <Spin size="medium" />
                  ) : (
                    <ul className="list-box">
                      {project?.assignedDevelopers.map((developerId) => (
                        <div className="list-item">
                          <div
                            className="employee-selection d-flex gap-1"
                            style={{ alignItems: "center" }}
                          >
                            <img
                              alt=""
                              className="avatar"
                              src={getEmployeeImage(developerId) || user_icon}
                            />
                            <label className="employee-name">
                              {getEmployeeFullName(developerId)}
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
      {/* /Page Content */}
      {/* Assign Leader Modal */}
      <div id="assign_leader" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Assign Leader to this project</h5>
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
              <div className="input-group m-b-30">
                <input
                  placeholder="Search to add a leader"
                  className="form-control search-input"
                  type="text"
                />
                <span className="input-group-append">
                  <button className="btn btn-primary w-100">Search</button>
                </span>
              </div>
              <div>
                <ul className="chat-user-list">
                  <li>
                    <a href="#">
                      <div className="media">
                        <span className="avatar">
                          <img alt="" src={Avatar_09} />
                        </span>
                        <div className="media-body align-self-center text-nowrap">
                          <div className="user-name">Richard Miles</div>
                          <span className="designation">Web Developer</span>
                        </div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <div className="media">
                        <span className="avatar">
                          <img alt="" src={Avatar_10} />
                        </span>
                        <div className="media-body align-self-center text-nowrap">
                          <div className="user-name">John Smith</div>
                          <span className="designation">Android Developer</span>
                        </div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <div className="media">
                        <span className="avatar">
                          <img alt="" src={Avatar_16} />
                        </span>
                        <div className="media-body align-self-center text-nowrap">
                          <div className="user-name">Jeffery Lalor</div>
                          <span className="designation">Team Leader</span>
                        </div>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="submit-section">
                <button className="btn btn-primary submit-btn">Submit</button>
              </div>
            </div>
          </div>
        </div>
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

                        placeholder="Select Leader"
                        onChange={(value) => setSelectedLeader(value)}
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
                        src={getEmployeeImage(selectedLeader) || user_icon}
                      />
                      <span className="employee-name">
                        {getEmployeeFullName(selectedLeader)}
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

      {/* /Assign Leader Modal */}
      {/* Assign User Modal */}
      <div id="assign_user" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Assign the user to this project</h5>
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
              <div className="input-group m-b-30">
                <input
                  placeholder="Search a user to assign"
                  className="form-control search-input"
                  type="text"
                />
                <span className="input-group-append">
                  <button className="btn btn-primary">Search</button>
                </span>
              </div>
              <div>
                <ul className="chat-user-list">
                  <li>
                    <a href="#">
                      <div className="media">
                        <span className="avatar">
                          <img alt="" src={Avatar_09} />
                        </span>
                        <div className="media-body align-self-center text-nowrap">
                          <div className="user-name">Richard Miles</div>
                          <span className="designation">Web Developer</span>
                        </div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <div className="media">
                        <span className="avatar">
                          <img alt="" src={Avatar_10} />
                        </span>
                        <div className="media-body align-self-center text-nowrap">
                          <div className="user-name">John Smith</div>
                          <span className="designation">Android Developer</span>
                        </div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <div className="media">
                        <span className="avatar">
                          <img alt="" src={Avatar_16} />
                        </span>
                        <div className="media-body align-self-center text-nowrap">
                          <div className="user-name">Jeffery Lalor</div>
                          <span className="designation">Team Leader</span>
                        </div>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="submit-section">
                <button className="btn btn-primary submit-btn">Submit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Assign User Modal */}

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
                    <Form.Item name="assignedDevelopers" className="custom-border">
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
                  {selectedDevelopers.map((developerId) => (
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
                            src={getEmployeeImage(developerId) || user_icon}
                          />
                          <span className="employee-name">
                            {getEmployeeFullName(developerId)}
                          </span>
                        </div>

                        <MinusCircleFilled
                          style={{ color: "red", cursor: "pointer" }}
                          onClick={() => handleRemoveDeveloper(developerId)}
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
          data={project}
          editModal={editModal}
          closeEditModal={closeEditModal}
          getprojects={GetProjects}
          getlistprojects={emptyfunction}
          allCurrencies={allCurrencies}
        />
      )}

      {/* /Edit Project Modal */}
    </div>
  );
};

export default ProjectView;
