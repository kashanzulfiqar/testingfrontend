import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar_03,
  Avatar_01,
  Avatar_02,
  Avatar_04,
  Avatar_05,
  media35,
  user_icon,
} from "../../Entryfile/imagepath";
import Select from "react-select";
import { MoreVertical } from "react-feather";
import moment from "moment";
import ReachOutModal from "./ReachOutModal";
import LeadNotes from "./leadNotes";
import { Button, Empty, message, Spin, Table } from "antd";
import { useSelector } from "react-redux";
import { apiServices } from "../../Services/apiServices";
import {
  FileExcelFilled,
  FileFilled,
  FileImageFilled,
  FilePdfFilled,
  FileWordFilled,
  LoadingOutlined,
} from "@ant-design/icons";
import EmptyTable from "../../files/Icons/EmptyTable.svg";
import { Modal } from "@mui/material";
import { useTranslation } from "react-i18next";
import { acceptableFormats } from "./Projects/EditProjects";
import { uploadFunction } from "./Projects/UploadAndDeleteFunc";
import ReasoningModal from "./ReasoningModal";

const LeadsDetails = () => {
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const location = useLocation();
  // const locationLead = location.state;
  // console.log(leadObject);
  const [activeTab, setActiveTab] = useState("notes");
  const recentlyViewd = [
    { value: "Sort By Alphabet", label: "Sort By Alphabet" },
    { value: "Ascending", label: "Ascending" },
    { value: "Descending", label: "Descending" },
  ];
  const [loader, setLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadNotes, setLoadNotes] = useState(false);
  const [loadReactOut, setLoadReachOut] = useState(false);
  const [loadStatus, setLoadStatus] = useState(false);

  const [leadObject, setLeadObject] = useState(location?.state?.lead);
  const [leadFiles, setLeadFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [reason, setReason] = useState(""); // State to hold the reason
  const [open, setOpen] = useState({
    isReasoning:false,
    isAddReachOut: false,
    isEditReachout: false,
    isDeleteReachout: false,
    isAddNotes: false,
    isEditNotes: false,
    isDeleteNotes: false,
    isDelFileOpen: false,
    data: "",
  });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  useEffect(() => {
    //setLeadObject(location?.state?.lead);
    viewFiles();
  }, []);

  const viewFiles = () => {
    setIsLoading(true);
    apiServices(
      "GET",
      `leads/view-files?leadId=${leadObject?._id}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          setLeadFiles(res?.data?.files);
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
              : "Error getting lead"
          }`
        );
        setIsLoading(false);
      });
  };

  const viewLeads = () => {
    apiServices("GET", `leads?leadId=${leadObject?._id}`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const updatedLeads = res?.data?.Lead?.docs[0]
          setLeadObject(updatedLeads);
          nav(location.pathname, { 
            state: {...location.state, lead: updatedLeads} ,
            replace: true
          }); 
          setLoadNotes(false)
          setLoadReachOut(false)
          setLoadStatus(false)
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting lead"
          }`
        );
        setLoadNotes(false);
        setLoadReachOut(false);
        setLoadStatus(false)
      });
  };

  function formatProjectType(type) {
    return type
      ?.replace(/([A-Z])/g, " $1") // Add space before capital letters
      ?.replace(/^./, (str) => str?.toUpperCase()); // Capitalize the first letter
  }

  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    const initials = nameParts.map((part) => part[0].toUpperCase()).join("");
    return initials.length > 2 ? initials.slice(0, 2) : initials; // Limit to 2 characters
  };

  const formatDateWithTime = (dateString) => {
    return moment(dateString).format("DD MMM YYYY, hh:mm a"); // e.g., 10 Oct 2024, 10:00 am
  };

  const formatDateWithoutTime = (dateString) => {
    return moment(dateString).format("DD MMM YYYY"); // e.g., 10 Oct 2024
  };

  const fileInputRef = useRef(null);

  // Function to trigger the file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const renderNotes = () => {
    return leadObject?.notes?.map((note) => {
      return (
        <div key={note._id} className="calls-box">
          <div className="caller-info">
            <div className="calls-user">
              <img src={note?.addedBy?.imageUrl} alt="img" />
              <div>
                <h6>{note?.addedBy?.fullName}</h6>
                <p>{formatDateWithTime(note?.updatedAt)}</p>
              </div>
            </div>
            <div className="dropdown dropdown-action text-end">
              <a
                href="#"
                className="action-icon dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="material-icons">more_vert</i>
              </a>
              <div className="dropdown-menu dropdown-menu-right">
                <a
                  className="dropdown-item"
                  href="javascript:void(0)"
                  onClick={(e) => {
                    setOpen({
                      isEditNotes: true,
                      data: note,
                    });
                  }}
                >
                  <i className="fa fa-pencil m-r-5" /> Edit
                </a>
                <a
                  className="dropdown-item"
                  href="javascript:void(0)"
                  onClick={(e) => {
                    setOpen({
                      isDeleteNotes: true,
                      data: note,
                    });
                  }}
                >
                  <i className="fa fa-trash-o m-r-5" /> Delete
                </a>
              </div>
            </div>
          </div>
          <p style={{ lineBreak: "anywhere" }}>{note?.text}</p>
          <ul>
            {note?.files?.map((file) => {
              // Extract the image ID from the Cloudinary URL
              const imageIdMatch = file.imageUrl?.match(/v\d+\/(.+?)\./);
              const imageId = imageIdMatch ? imageIdMatch[1] : null;

              // Determine file format from the URL if needed (e.g., "png" or "jpg")
              const format = file.imageUrl?.split(".").pop();

              const fullImageUrl = imageId
                ? `https://res.cloudinary.com/dcxpovyr9/image/upload/${imageId}.${format}`
                : file.imageUrl;
              const downloadLink = file.imageUrl?.replace(
                "/upload/",
                "/upload/fl_attachment/"
              );

              return (
                <li key={file._id}>
                  <div
                    className="note-download"
                    onClick={() => window.open(fullImageUrl, "_blank")}
                  >
                    <div className="note-info">
                      <label className="note-icon bg-success">
                        {file.fileName.toLowerCase().endsWith(".pdf") ? (
                          <i className="las la-file-pdf" />
                        ) : file.fileName.toLowerCase().endsWith(".doc") ||
                          file.fileName.toLowerCase().endsWith(".docx") ? (
                          <i className="las la-file-word" />
                        ) : file.fileName.toLowerCase().endsWith(".xls") ||
                          file.fileName.toLowerCase().endsWith(".xlsx") ? (
                          <i className="las la-file-excel" />
                        ) : file.fileName.toLowerCase().endsWith(".jpg") ||
                          file.fileName.toLowerCase().endsWith(".jpeg") ||
                          file.fileName.toLowerCase().endsWith(".png") ||
                          file.fileName.toLowerCase().endsWith(".gif") ? (
                          <i className="las la-file-image" />
                        ) : (
                          <i className="las la-file" />
                        )}
                      </label>
                      <div>
                        <h6>{file.fileName}</h6>
                        <p>{/* Add file size if available */}</p>
                      </div>
                    </div>
                    <Link
                      to={downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={(e) => e.stopPropagation()} // Prevent parent click event
                    >
                      <i className="las la-download" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    });
  };

  const renderReachOuts = () => {
    const sortedReachOuts = leadObject?.reachOuts
    ?.slice() // Create a shallow copy to avoid mutating the original array
    ?.sort((a, b) => new Date(b.date) - new Date(a.date));

    return sortedReachOuts?.map((reachOut) => {
      return (
        <div key={reachOut._id} className="calls-box">
          <div className="caller-info">
            <div className="calls-user">
              <img src={reachOut?.communicatedBy?.imageUrl || user_icon} />
              <p>
                <label>{reachOut?.communicatedBy?.fullName}</label> made a
                reach-out via{" "}
                <label>{reachOut?.communicationMedium?.title}</label> on{" "}
                {formatDateWithTime(reachOut.date)}
              </p>
            </div>
            <div className="dropdown dropdown-action text-end">
              <a
                href="#"
                className="action-icon dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="material-icons">more_vert</i>
              </a>
              <div className="dropdown-menu dropdown-menu-right">
                <a
                  className="dropdown-item"
                  href="javascript:void(0)"
                  onClick={(e) => {
                    setOpen({
                      isEditReachout: true,
                      data: reachOut,
                    });
                  }}
                >
                  <i className="fa fa-pencil m-r-5" /> Edit
                </a>
                <a
                  className="dropdown-item"
                  href="javascript:void(0)"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen({
                      isDeleteReachout: true,
                      data: reachOut,
                    });
                  }}
                >
                  <i className="fa fa-trash-o m-r-5" /> Delete
                </a>
              </div>
            </div>
          </div>
          {reachOut.comments && <p>{reachOut.comments}</p>}
        </div>
      );
    });
  };
  
  const onHandleDelete = (val) => {
    setLoader(true);
    let data = {
      leadId: leadObject?._id,
    };

    if (open.isDeleteNotes || open.isDeleteReachout) {
      data._id = val;
    } else {
      data.fileId = val?.asset_id;
      data.noteId = val?.noteId;
    }

    if(open.isDeleteNotes){
      setLoadNotes(true)
    }else if(open.isDeleteReachout){
      setLoadReachOut(true)
    }

    let apiUrl = open.isDeleteNotes
      ? "leads/deleteNote"
      : open.isDeleteReachout
      ? "leads/deleteReachout"
      : open.isDelFileOpen
      ? "leads/deleteFile"
      : "";
    apiServices("DELETE", apiUrl, data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          // setCategory([...category.filter((category) => category._id !== id)]);
          // if(categoryObj?.docs?.length === 1){
          //   console.log(categoryObj.totalPages)
          //   viewCategory((categoryObj.totalPages-1),null);
          // }
          // else{
          //}
          viewLeads();
          (open.isDeleteNotes || open.isDelFileOpen) ? viewFiles() : null;
          message.success(
            open.isDeleteNotes
              ? "Note deleted successfully"
              : open.isDeleteReachout
              ? "Reach-out record deleted successfully"
              : "File Deleted Successfully"
          );
          //viewCategory();
          setLoader(false);
          handleClose();
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
              : open.isDeleteNotes
              ? "Error Deleting Note"
              : open.isDeleteReachout
              ? "Error Deleting Reach-out"
              : "Error Deleting file"
          }!`
        );
      });
  };

  const handleUpdateStatus = (record, newStatus, type, reason) => {
    const updatedData = {
      _id: record?._id,
      reason: reason,
    };

    if (type == "projectType") {
      updatedData.projectType = newStatus;
    } else if (type == "status") {
      updatedData.status = newStatus;
      setLoadStatus(true)
    }
    apiServices("PUT", "leads", updatedData, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(
            type == "status"
              ? "Status Updated Successfully"
              : "Project Type Updated Successfully"
          );
          viewLeads();
        }
      })
      .catch((error) => {
        console.log("error", error);
        message.error("Error updating status");
      });
  };
  const handleReasoningSubmit = (enteredReason) => {
    // Close the modal and update the status with the reason
    handleUpdateStatus(leadObject, "notConverted", "status", enteredReason);
    setOpen({ isReasoning: false });
    setReason(enteredReason); // Store the reason in the state
  };
  const handleClose = () => {
    setOpen({
      isReasoning:false,
      isAddNotes: false,
      isAddReachOut: false,
      isEditReachout: false,
      isDeleteNotes: false,
      isEditNotes: false,
      isDeleteReachout: false,
      isDelFileOpen: false,
      data: "",
    });
    setLoader(false);
  };

  const uploadToLeads = async (uploadFiles) => {
    setLoader(true);
    let docs = [];
    let temp1 = [];
    if (uploadFiles?.length > 0) {
      temp1 = await uploadFunction(uploadFiles, user_state);
      docs = [...docs, ...temp1];
    }
    let data = {
      leadId: leadObject?._id,
      files: docs,
    };

    apiServices("PUT", "leads/addFiles", data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success("Files Uploaded Successfully");
          viewFiles();
          viewLeads();
          setLoader(false);
          setSelectedFiles([]);
        }
      })
      .catch((error) => {
        console.log("error", error);
        message.error("Error adding documents");
        setLoader(false);
        setSelectedFiles([]);
      });
  };

  const onFileUpload = async (files) => {
    const uploadPromises = [];
    const validFiles = []; // To store valid files
    const existingFileNames = selectedFiles?.map((file) => file?.fileName);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      //console.log("File: ", file);

      // Check file format (extension)
      const fileExtension = file?.name?.split(".").pop().toLowerCase();
      if (!acceptableFormats.includes(fileExtension)) {
        message.error(
          t("projectScreen.errors.fileFormatNotSupported", {
            file: file?.name,
          })
        );
        continue; // Skip this file and continue with the next one
      }

      // Check file size
      if (file?.size > 10485760) {
        message.error(
          t("projectScreen.errors.fileSizeExceedsLimit", { file: file?.name })
        );
        continue; // Skip this file and continue with the next one
      }

      if (existingFileNames?.includes(file?.name)) {
        message.error(
          t("projectScreen.errors.fileAlreadySelected", { file: file?.name })
        );
        continue; // Skip this file and continue with the next one
      }
      validFiles.push(file);
      setSelectedFiles((prevSelectedFiles) => {
        const uniqueValidFiles = validFiles.filter((newFile) => {
          // Check if a file with the same name already exists in the selectedFiles
          return !prevSelectedFiles?.some(
            (existingFile) => existingFile?.fileName === newFile?.name
          );
        });
        return [...prevSelectedFiles, ...uniqueValidFiles];
      });
    }
    await uploadToLeads(validFiles);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split(".")?.pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FilePdfFilled />;
      case "xlsx":
      case "xls":
        return <FileExcelFilled />;
      case "docx":
      case "doc":
        return <FileWordFilled />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
        return <FileImageFilled />;
      default:
        return <FileFilled />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  };

  const fileColumns = [
    {
      title: "#",
      dataIndex: "id",
      key: "index",
      render: (text, record, index) => (page - 1) * size + index + 1,
    },
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (fileName) => (
        <div className="file-info">
          <span className="file-icon" style={{ fontSize: "large" }}>
            {getFileIcon(fileName)}
          </span>
          <span className="file-name" style={{ marginLeft: "1%" }}>
            {fileName}
          </span>
        </div>
      ),
    },
    {
      title: "Owner",
      dataIndex: "addedBy.fullName",
      key: "addedBy.fullName",
      render: (text, record) => (
        <h2 className="table-avatar">
          <label className="avatar">
            <img alt="" src={record?.addedBy?.imageUrl || user_icon} />
          </label>
          <label>{record?.addedBy?.fullName}</label>
        </h2>
      ),
    },
    {
      title: "File size",
      dataIndex: "fileSize",
      key: "fileSize",
      render: (fileSize) => (
        <span>{fileSize ? formatFileSize(fileSize) : "0B"}</span>
      ),
    },
    {
      title: "Action",
      render: (text, record) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="#"
            className="action-icon dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              // onClick={(e) => {
              //   e.stopPropagation();
              //   getAllCurrencies();
              //   setOpen({
              //     isAddOpen: true,
              //     isDelOpen: false,
              //     data: record,
              //   });
              //   setReachOutValues(record?.reachOuts);
              //   form.setFieldsValue({
              //     ...record,
              //     reachOut: moment(record?.reachOut, "YYYY-MM-DD"),
              //     accountManager: record?.accountManager?._id,
              //     source: record?.source?._id,
              //     communicationMedium: record?.communicationMedium,
              //     reachOuts: record?.reachOuts?.map((reachOut) => ({
              //       ...reachOut,
              //       date: reachOut.date
              //         ? moment(reachOut.date, "YYYY-MM-DD")
              //         : null,
              //     })),
              //   });
              //   const initialReachouts = Array.from(
              //     { length: record?.reachOuts?.length },
              //     (_, index) => ({
              //       date: null,
              //       communicationMedium: "",
              //       communicatedBy: "",
              //       comments: "",
              //     })
              //   );
              //   setReachOuts(initialReachouts);
              // }}
            >
              <i className="fa fa-download m-r-5" /> Download
            </a>
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={(e) => {
                e.stopPropagation();
                setOpen({
                  isAddOpen: false,
                  isDelFileOpen: true,
                  data: record,
                });
              }}
            >
              <i className="fa fa-trash-o m-r-5" /> Delete
            </a>
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
            No data found
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

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col-md-4">
                <h3 className="page-title">Leads</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to={"/leads"}>
                      <span className="arrow_routes"></span>
                      Leads
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">
                    Lead {t("Details")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            {/* Contact User */}
            <div className="col-md-12">
              <div className="contact-wrap">
                <div className="contact-profile">
                  <div
                    className="avatar company-avatar"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <label className="text-icon">
                      {getInitials(leadObject?.leadName)}
                    </label>
                  </div>
                  <div className="name-user">
                    <h4>{leadObject?.leadName}</h4>
                    <p>
                      <label>
                        <i className="las la-building" />{" "}
                        {leadObject?.clientName}
                      </label>
                    </p>
                    {leadObject?.clientEmail && (
                      <p className="mb-0">
                        <i className="las la-map-marker" />{" "}
                        <label>{leadObject?.clientEmail}</label>
                      </p>
                    )}
                    {leadObject?.clientPhoneNo && (
                      <p className="mb-0">
                        <i className="las la-map-marker" />{" "}
                        <label>{leadObject?.clientPhoneNo}</label>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <div>
                    <a
                      className="btn btn-white btn-sm btn-rounded dropdown-toggle"
                      href="javascript:void(0)"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <i
                        className={`fa ${
                          leadObject?.status === "onHold"
                            ? "fa-dot-circle-o text-purple"
                            : leadObject?.status === "pending"
                            ? "fa-dot-circle-o text-info"
                            : leadObject?.status === "converted"
                            ? "fa-dot-circle-o text-success"
                            : "fa-dot-circle-o text-primary"
                        }`}
                      />{" "}
                      {loadStatus ? (
                    <Spin size="small" />
                  ) : (
                    <>
                      {leadObject?.status === "pending"
                        ? t("aRequests.Pending")
                        : leadObject?.status === "converted"
                        ? "Converted"
                        : leadObject?.status === "notConverted"
                        ? "Not Converted"
                        : leadObject?.status === "onHold"
                        ? "On Hold"
                        : leadObject?.status}
                        </>)}
                    </a>
                    <div className="dropdown-menu dropdown-menu-right">
                      <a
                        className={`dropdown-item ${
                          leadObject?.status === "pending" && "disabled"
                        }`}
                        href="javascript:void(0)"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpdateStatus(leadObject, "pending", "status");
                        }}
                      >
                        <i className="fa fa-dot-circle-o text-info" /> Pending
                      </a>
                      <a
                        className={`dropdown-item ${
                          leadObject?.status === "onHold" && "disabled"
                        }`}
                        href="javascript:void(0)"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpdateStatus(leadObject, "onHold", "status");
                        }}
                      >
                        <i className="fa fa-dot-circle-o text-purple" /> On Hold
                      </a>
                      <a
                        className={`dropdown-item ${
                          leadObject?.status === "converted" && "disabled"
                        }`}
                        href="javascript:void(0)"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpdateStatus(leadObject, "converted", "status");
                        }}
                      >
                        <i className="fa fa-dot-circle-o text-success" />{" "}
                        Converted
                      </a>
                      <a
                        className={`dropdown-item ${
                          leadObject?.status === "notConverted" && "disabled"
                        }`}
                        href="javascript:void(0)"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen({ isReasoning: true })
                        }}
                      >
                        <i className="fa fa-dot-circle-o text-primary" /> Not
                        Converted
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Contact User */}
            {/* Contact Sidebar */}
            <div className="col-xl-3">
              <div className="stickybar">
                <div className="card contact-sidebar">
                  <h5>
                    <label>Lead Information</label>
                  </h5>
                  <ul className="other-info">
                    <li>
                      <label className="other-title">Date Created</label>
                      <label>{formatDateWithTime(leadObject?.createdAt)}</label>
                    </li>
                    <li>
                      <label className="other-title">Value</label>
                      <label>
                        {leadObject?.projectWorth
                          ? `${leadObject?.projectWorth?.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )} ${leadObject?.currency}`
                          : "None"}
                      </label>
                    </li>
                    <li>
                      <label className="other-title">Last Follow Up</label>
                      <label>
                        {formatDateWithoutTime(leadObject?.lastReachOut)}
                      </label>
                    </li>
                    <li>
                      <label className="other-title">Source</label>
                      <label>{leadObject?.source?.title}</label>
                    </li>
                  </ul>
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h5>
                      <label>Account Manager</label>
                    </h5>
                  </div>
                  <ul className="deals-info">
                    <li>
                      <label>
                        <img
                          src={
                            leadObject?.accountManager?.imageUrl || user_icon
                          }
                          alt="img"
                        />
                      </label>
                      <div>
                        <p>{leadObject?.accountManager?.fullName}</p>
                      </div>
                    </li>
                  </ul>
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h5>
                      <label>Project Type</label>
                    </h5>
                  </div>
                  <ul className="priority-info">
                    <li>
                      <div className="dropdown">
                        <a
                          className="dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <label>
                            {formatProjectType(leadObject?.projectType)}{" "}
                            {/* Display the current project type */}
                          </label>
                          <i className="las la-angle-down ms-1" />
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                          {[
                            "staffAugmentation",
                            "endToEndProject",
                            "bugFixes",
                          ].map((type) => (
                            <a
                              key={type}
                              className={`dropdown-item ${
                                leadObject?.projectType === type
                                  ? "disabled-option"
                                  : ""
                              }`}
                              onClick={() => {
                                if (leadObject.projectType !== type) {
                                  handleUpdateStatus(
                                    leadObject,
                                    type,
                                    "projectType"
                                  );
                                  console.log(`Selected project type: ${type}`);
                                }
                              }}
                            >
                              <label>{formatProjectType(type)}</label>
                            </a>
                          ))}
                        </div>
                      </div>
                    </li>
                  </ul>

                  {leadObject?.reason && 
                  <>
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h5>
                      <label>Reason</label>
                    </h5>
                  </div>
                  <ul className="other-info">
                    <li>
                      <label style={{lineBreak:"anywhere"}}>
                        {leadObject?.reason}
                      </label>
                    </li>
                  </ul>
                  </>
                  }

                  <ul className="other-info">
                    <li>
                      <label className="other-title">Last Modified</label>
                      <label>{formatDateWithTime(leadObject?.updatedAt)}</label>
                    </li>
                    <li>
                      <label className="other-title">Modified By</label>
                      <label>
                        <img
                          src={leadObject?.modifiedBy?.imageUrl || user_icon}
                          className="avatar-xs rounded-circle"
                          alt="img"
                        />{" "}
                        {leadObject?.modifiedBy?.fullName}
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Contact Sidebar */}
            {/* Contact Details */}
            <div className="col-xl-9">
              <div className="contact-tab-wrap">
                <ul className="contact-nav nav">
                  <li>
                    <a
                      onClick={() => setActiveTab("notes")}
                      data-bs-toggle="tab"
                      data-bs-target="#notes"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                      className={activeTab === "notes" ? "active" : ""}
                    >
                      <i className="las la-file" />
                      Notes
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setActiveTab("calls")}
                      data-bs-toggle="tab"
                      data-bs-target="#calls"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                      className={activeTab === "calls" ? "active" : ""}
                    >
                      <i className="las la-phone-volume" />
                      Reach Outs
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setActiveTab("files")}
                      data-bs-toggle="tab"
                      data-bs-target="#files"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                      className={activeTab === "files" ? "active" : ""}
                    >
                      <i className="las la-file" />
                      Files
                    </a>
                  </li>
                </ul>
              </div>
              {/* Tab Content */}
              <div className="contact-tab-view">
                <div className="tab-content pt-0">
                  {/* Notes */}
                  <div
                    className={`tab-pane fade ${
                      activeTab === "notes" ? "active show" : ""
                    }`}
                    id="notes"
                  >
                    <div className="view-header">
                      <h3>Notes</h3>
                      <ul>
                        {/* <li>
                          <div className="form-sort deals-dash-select">
                            <Select
                              className="select w-100"
                              options={recentlyViewd}
                              placeholder="Ascending"
                            />
                          </div>
                        </li> */}
                        <li>
                          <a
                            className="com-add"
                            onClick={() => setOpen({ isAddNotes: true })}
                          >
                            <i className="las la-plus-circle me-1" />
                            Add New
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="notes-activity">
                      {leadObject?.notes && leadObject.notes.length > 0 ? (
                        loadNotes ? <Spin size="large" style={{display: "flex", justifyContent:"center"}}/> : renderNotes() // Pass the required data
                      ) : (
                        <p>No Notes Added Yet.</p>
                      )}
                    </div>
                  </div>
                  {/* /Notes */}
                  {/* Calls */}
                  <div
                    className={`tab-pane fade ${
                      activeTab === "calls" ? "active show" : ""
                    }`}
                    id="calls"
                  >
                    <div className="view-header">
                      <h3>Reach Outs</h3>
                      <ul>
                        <li>
                          <a
                            className="com-add"
                            onClick={() => setOpen({ isAddReachOut: true })}
                          >
                            <i className="las la-plus-circle me-1" />
                            Add New
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="calls-activity">
                      {leadObject?.reachOuts &&
                      leadObject.reachOuts.length > 0 ? (
                        loadReactOut ? <Spin size="large" style={{display: "flex", justifyContent:"center"}}/> : renderReachOuts() // Pass the required data
                      ) : (
                        <p>No communication records available.</p>
                      )}
                    </div>
                  </div>
                  {/* /Calls */}
                  {/* Files */}
                  <div
                    className={`tab-pane fade ${
                      activeTab === "files" ? "active show" : ""
                    }`}
                    id="files"
                  >
                    <div className="view-header">
                      <h3>Files</h3>
                    </div>
                    <div className="files-activity">
                      <div className="files-wrap">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <div className="file-info">
                              <h4>Manage Documents</h4>
                              <p>
                                Upload customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <ul className="file-action">
                              <li>
                                <a
                                  className="btn btn-primary"
                                  onClick={handleUploadClick}
                                >
                                  Upload Documents
                                </a>
                                <input
                                  type="file"
                                  multiple
                                  ref={fileInputRef}
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    onFileUpload(e.target.files);
                                  }}
                                />
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <Table
                          className="table-striped"
                          locale={{
                            emptyText: isLoading ? null : customEmptyText,
                          }}
                          style={{ overflowX: "auto"}}
                          loading={isLoading}
                          pagination={false}
                          columns={fileColumns}
                          // Use columns1 for the first table
                          dataSource={leadFiles} // Define your data source for the first table
                          rowKey={(record) => record?._id}
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
                          onRow={(record, rowIndex) => ({
                            style: { cursor: "pointer" },
                            ...(i18n.dir() === "rtl" && {
                              style: { textAlign: "right" }, // Align table data to the right
                            }),
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  {/* /Files */}
                </div>
              </div>
              {/* /Tab Content */}
            </div>
            {/* /Contact Details */}
          </div>
        </div>
      </div>
      {/* /Page Content */}

      <Modal
        open={open.isDeleteNotes || open.isDeleteReachout || open.isDelFileOpen}
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
                  Delete{" "}
                  {open.isDeleteNotes
                    ? "Note"
                    : open.isDeleteReachout
                    ? "Reach-out"
                    : open.isDelFileOpen
                    ? "File"
                    : ""}
                </h3>
                {open.isDelFileOpen ? (
                  <p>Are you sure you want to delete the file?</p>
                ) : (
                  <p>Are you sure you want to delete?</p>
                )}
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() =>
                        onHandleDelete(
                          open.isDelFileOpen ? open.data : open?.data?._id
                        )
                      }
                      disabled={loader}
                      style={{ width: "100%" }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        t("delete")
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

      {open.isAddReachOut && (
        <ReachOutModal
          openModal={open.isAddReachOut}
          closeModal={handleClose}
          data={null}
          leadId={leadObject?._id}
          viewLeads={viewLeads}
          viewFiles={null}
          setLoadReachOut={setLoadReachOut}
        />
      )}
      {open.isEditReachout && (
        <ReachOutModal
          openModal={open.isEditReachout}
          closeModal={handleClose}
          data={open?.data}
          leadId={leadObject?._id}
          viewLeads={viewLeads}
          viewFiles={null}
          setLoadReachOut={setLoadReachOut}
        />
      )}
      {open.isEditNotes && (
        <LeadNotes
          openModal={open.isEditNotes}
          closeModal={handleClose}
          data={open?.data}
          leadId={leadObject?._id}
          viewLeads={viewLeads}
          viewFiles={viewFiles}
          setLoadNotes={setLoadNotes}
        />
      )}
      {open.isAddNotes && (
        <LeadNotes
          openModal={open.isAddNotes}
          closeModal={handleClose}
          data={null}
          leadId={leadObject?._id}
          viewLeads={viewLeads}
          viewFiles={viewFiles}
          setLoadNotes={setLoadNotes}
        />
      )}
      {open.isReasoning &&(
        <ReasoningModal
          openModal={open.isReasoning}
          closeModal={handleClose}
          onSubmit={handleReasoningSubmit} // Pass the submit handler
        />
      )}
    </>
  );
};
export default LeadsDetails;
