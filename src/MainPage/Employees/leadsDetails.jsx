import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { Tooltip } from "react-bootstrap";
import moment from "moment";
import ReachOutModal from "./ReachOutModal";
import LeadNotes from "./leadNotes";
import { message } from "antd";
import { useSelector } from "react-redux";
import { apiServices } from "../../Services/apiServices";

const LeadsDetails = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  const location = useLocation();
  // const leadObject = location.state;
  // console.log(leadObject);
  const recentlyViewd = [
    { value: "Sort By Alphabet", label: "Sort By Alphabet" },
    { value: "Ascending", label: "Ascending" },
    { value: "Descending", label: "Descending" },
  ];
  const [showFirstField, setShowFirstField] = useState(false);  

  const [leadObject, setLeadObject] = useState(location.state)
  const [open, setOpen] = useState({
    isAddReachOut: false,
    isEditReachout: false,
    isDeleteReachout: false,
    isAddNotes: false,
    isEditNotes: false,
    isDeleteNotes: false,
    data: "",
  });

  useEffect(() => {
    setLeadObject(location?.state);
  }, []);

  const viewLeads = () => {
    apiServices("GET", `leads?leadId=${leadObject?._id}`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          setLeadObject(res?.data?.Lead?.docs[0]);
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
      })
  };

  const handleSaveAndNext = () => {
    setShowFirstField(true);
  };

  const handleCancel = () => {
    setShowFirstField(false);
  };

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
            <a className="dropdown-item" 
            href="javascript:void(0)"
            // onClick={(e) => {
            //   e.stopPropagation()
            //   setOpen({
            //     isAddOpen: false,
            //     isDelOpen: true,
            //     data: record,
            //   });
            // }}
            >
              <i className="fa fa-trash-o m-r-5" /> Delete
            </a>
          </div>
        </div>
          </div>
          <p>
          {note?.text}
          </p>
          <ul>
            <li>
              <div className="note-download">
                <div className="note-info">
                  <label className="note-icon bg-success">
                    <i className="las la-file-excel" />
                  </label>
                  <div>
                    <h6>Project Specs.xls</h6>
                    <p>365 KB</p>
                  </div>
                </div>
                <Link to="#">
                  <i className="las la-download" />
                </Link>
              </div>
            </li>
            <li>
              <div className="note-download">
                <div className="note-info">
                  <label className="note-icon">
                    <img src={media35} alt="img" />
                  </label>
                  <div>
                    <h6>090224.jpg</h6>
                    <p>365 KB</p>
                  </div>
                </div>
                <Link to="#">
                  <i className="las la-download" />
                </Link>
              </div>
            </li>
          </ul>
        </div>
      );
    });
  };

  const renderReachOuts = () => {
    return leadObject?.reachOuts?.map((reachOut) => {
      return (
        <div key={reachOut._id} className="calls-box">
          <div className="caller-info">
            <div className="calls-user">
              <img src={reachOut?.communicatedBy?.imageUrl || user_icon} />
              <p>
                <label>{reachOut?.communicatedBy?.fullName}</label> made a
                reach-out via <label>{reachOut?.communicationMedium?.title}</label> on{" "}
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
            // onClick={(e) => {
            //   e.stopPropagation()
            //   setOpen({
            //     isAddOpen: false,
            //     isDelOpen: true,
            //     data: record,
            //   });
            // }}              
            >
              <i className="fa fa-pencil m-r-5" /> Edit
            </a>
            <a className="dropdown-item" 
            href="javascript:void(0)"
            // onClick={(e) => {
            //   e.stopPropagation()
            //   setOpen({
            //     isAddOpen: false,
            //     isDelOpen: true,
            //     data: record,
            //   });
            // }}
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
                    <Link to="/admin-dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Leads</li>
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
                <div className="contacts-action">
                  <div className="dropdown action-drops">
                    <Link
                      to="#"
                      className="dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <label>
                        Converted
                        <i className="las la-angle-down ms-2" />
                      </label>
                    </Link>
                    <div className="dropdown-menu dropdown-menu-right">
                      <Link className="dropdown-item" to="#">
                        <label>Not Converted</label>
                      </Link>
                      <Link className="dropdown-item" to="#">
                        <label>Opened</label>
                      </Link>
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
                      <label className="other-title">Follow Up</label>
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
                        <Link
                          to="#"
                          className="dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <label>
                            <i className="fa-solid fa-circle me-1 text-danger circle" />
                            High
                          </label>
                          <i className="las la-angle-down ms-1" />
                        </Link>
                        <div className="dropdown-menu dropdown-menu-right">
                          <Link className="dropdown-item" to="#">
                            <label>
                              <i className="fa-solid fa-circle me-1 text-danger circle" />
                              High
                            </label>
                          </Link>
                          <Link className="dropdown-item" to="#">
                            <label>
                              <i className="fa-solid fa-circle me-1 text-success circle" />
                              Low
                            </label>
                          </Link>
                        </div>
                      </div>
                    </li>
                  </ul>
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
                    <Link
                      to="#"
                      data-bs-toggle="tab"
                      data-bs-target="#notes"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      <i className="las la-file" />
                      Notes
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      data-bs-toggle="tab"
                      data-bs-target="#calls"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      <i className="las la-phone-volume" />
                      Reach Outs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      data-bs-toggle="tab"
                      data-bs-target="#files"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      <i className="las la-file" />
                      Files
                    </Link>
                  </li>
                </ul>
              </div>
              {/* Tab Content */}
              <div className="contact-tab-view">
                <div className="tab-content pt-0">
                  {/* Notes */}
                  <div className="tab-pane fade" id="notes">
                    <div className="view-header">
                      <h3>Notes</h3>
                      <ul>
                        <li>
                          <div className="form-sort deals-dash-select">
                            <Select
                              className="select w-100"
                              options={recentlyViewd}
                              placeholder="Ascending"
                            />
                          </div>
                        </li>
                        <li>
                          <a className="com-add" onClick={() => setOpen({isAddNotes:true})}>
                            <i className="las la-plus-circle me-1" />
                            Add New
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="notes-activity">
                      {leadObject?.notes &&
                        leadObject.notes.length > 0 ? (
                          renderNotes()// Pass the required data
                          ) : (
                            <p>No Notes Added Yet.</p>
                        )
                      }
                    </div>
                  </div>
                  {/* /Notes */}
                  {/* Calls */}
                  <div className="tab-pane fade" id="calls">
                    <div className="view-header">
                      <h4>Reach Outs</h4>
                      <ul>
                        <li>
                          <Link
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#create_call"
                            className="com-add"
                          >
                            <i className="las la-plus-circle me-1" />
                            Add New
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="calls-activity">
                      {leadObject?.reachOuts &&
                      leadObject.reachOuts.length > 0 ? (
                        renderReachOuts()// Pass the required data
                      ) : (
                        <p>No communication records available.</p>
                      )}
                    </div>
                  </div>
                  {/* /Calls */}
                  {/* Files */}
                  <div className="tab-pane fade" id="files">
                    <div className="view-header">
                      <h4>Files</h4>
                    </div>
                    <div className="files-activity">
                      <div className="files-wrap">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <div className="file-info">
                              <h4>Manage Documents</h4>
                              <p>
                                Send customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <ul className="file-action">
                              <li>
                                <Link
                                  to="#"
                                  className="btn btn-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#new_file"
                                >
                                  Create Document
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="files-wrap">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <div className="file-info">
                              <h4>Collier-Turner Proposal</h4>
                              <p>
                                Send customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                              <div className="file-user">
                                <img src={Avatar_04} alt="img" />
                                <div>
                                  <p>
                                    <label>Owner</label> Vaughan
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <ul className="file-action">
                              <li>
                                <label className="badge badge-soft-pink">
                                  Proposal
                                </label>
                              </li>
                              <li>
                                <label className="badge badge-soft-grey priority-badge">
                                  <i className="fa-solid fa-circle" />
                                  Low
                                </label>
                              </li>
                              <li>
                                <div className="dropdown action-drop">
                                  <Link
                                    to="#"
                                    className="dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <MoreVertical size={15} />
                                  </Link>
                                  <div className="dropdown-menu dropdown-menu-right">
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-edit me-1" />
                                      Edit
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-trash me-1" />
                                      Delete
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-download me-1" />
                                      Download
                                    </Link>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="files-wrap">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <div className="file-info">
                              <h4>Collier-Turner Proposal</h4>
                              <p>
                                Send customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                              <div className="file-user">
                                <img src={Avatar_03} alt="img" />
                                <div>
                                  <p>
                                    <label>Owner</label> Jessica
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <ul className="file-action">
                              <li>
                                <label className="badge badge-soft-info">
                                  Quote
                                </label>
                              </li>
                              <li>
                                <label className="badge badge-soft-success priority-badge">
                                  <i className="fa-solid fa-circle" />
                                  Sent
                                </label>
                              </li>
                              <li>
                                <div className="dropdown action-drop">
                                  <Link
                                    to="#"
                                    className="dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <MoreVertical size={15} />
                                  </Link>
                                  <div className="dropdown-menu dropdown-menu-right">
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-edit me-1" />
                                      Edit
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-trash me-1" />
                                      Delete
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-download me-1" />
                                      Download
                                    </Link>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="files-wrap">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <div className="file-info">
                              <h4>Collier-Turner Proposal</h4>
                              <p>
                                Send customizable quotes, proposals and
                                contracts to close deals faster.
                              </p>
                              <div className="file-user">
                                <img src={Avatar_05} alt="img" />
                                <div>
                                  <p>
                                    <label>Owner</label> Vaughan
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <ul className="file-action">
                              <li>
                                <label className="badge badge-soft-pink">
                                  Proposal
                                </label>
                              </li>
                              <li>
                                <label className="badge badge-soft-grey priority-badge">
                                  <i className="fa-solid fa-circle" />
                                  Low
                                </label>
                              </li>
                              <li>
                                <div className="dropdown action-drop">
                                  <Link
                                    to="#"
                                    className="dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <MoreVertical size={15} />
                                  </Link>
                                  <div className="dropdown-menu dropdown-menu-right">
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-edit me-1" />
                                      Edit
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-trash me-1" />
                                      Delete
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="las la-download me-1" />
                                      Download
                                    </Link>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
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
      {
        open.isAddReachOut && (
            <ReachOutModal 
            openModal={open.isAddReachOut}
            closeModal={!open.isAddReachOut}
            data={open?.data}
            />
        )
      }
      {
        open.isEditNotes && (
            <LeadNotes
            openModal={open.isEditNotes}
            closeModal={()=>{
              setOpen({isEditNotes:false})
            }}
            data={open?.data}
            leadId={leadObject?._id}
            viewLeads={viewLeads}
            />
        )
      }
      {
        open.isAddNotes && (
            <LeadNotes
            openModal={open.isAddNotes}
            closeModal={()=>{
              setOpen({isAddNotes:false})
            }}
            data={null}
            leadId={leadObject?._id}
            viewLeads={viewLeads}
            />
        )
      }
    </>
  );
};
export default LeadsDetails;
