import React, { useEffect, useState } from "react";
import {
  Avatar_01,
  Avatar_02,
  Avatar_05,
  Avatar_09,
  Avatar_10,
  Avatar_11,
  Avatar_12,
  Avatar_13,
  Avatar_16,
  Avatar_19,
  user_icon,
} from "../../../../Entryfile/imagepath";
import { Link } from "react-router-dom";
import { apiServices } from "../../../../Services/apiServices";
import { useSelector } from "react-redux";
import { Button, Empty, Pagination, Spin, Tooltip, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import EmptyTable from "../../../../files/Icons/EmptyTable.svg";
import { itemRender } from "../../../paginationfunction";
import EditProjects from "../../../Employees/Projects/EditProjects";
import Modal from "@mui/material/Modal";
import { useTranslation } from "react-i18next";


const ProjectsScreen = ({ isID, isRole }) => {
  const user_state = useSelector((state) => state.user.loginvalue);
  const { t, i18n } = useTranslation();
  const [allProjects, setAllProjects] = useState();
  const [tableLoader, setTableLoader] = useState(true);
  const [empLoader, setEmpLoader] = useState(true);
  const [loader, setLoader] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [empInfo, setEmpInfo] = useState();
  const [open, setOpen] = useState({
    editOpen: false,
    delOpen: false,
    data: "",
  });

  useEffect(() => {
    getAllProjects();
    //getEmployees();
  }, []);

  //   const d = [
  //     {_id: 1, projectName: 'Office Management Task Task', projectDescription: 'Project description project description project description project description project description project description project description project description project description project description project description', endDate: '2023-09-15', projectLead: '64ea194c7f50012b6221681a', assignedDevelopers: ['64ad03c05a16f308a6ce1e2b', '64af9143ad4f55990dfbae86']},
  //     {_id: 2, projectName: 'Office Management 3', projectDescription: 'Project description project description project description project description project description project description project description project description project description project description project description', endDate: '2023-09-15', projectLead: '64ea194c7f50012b6221681a', assignedDevelopers: ['64ad03c05a16f308a6ce1e2b', '64af9143ad4f55990dfbae86']},
  //     {_id: 3, projectName: 'Office Management 5', projectDescription: 'Project description project description project description project description project description project description project description project description project description project description project description', endDate: '2023-09-15', projectLead: '64ea194c7f50012b6221681a', assignedDevelopers: ['64ad03c05a16f308a6ce1e2b', '64af9143ad4f55990dfbae86']},
  //     {_id: 4, projectName: 'Office Management 6', projectDescription: 'Project description project description project description project description project description project description project description project description project description project description project description', endDate: '2023-09-15', projectLead: '64ea194c7f50012b6221681a', assignedDevelopers: ['64ad03c05a16f308a6ce1e2b', '64af9143ad4f55990dfbae86']},
  //     {_id: 5, projectName: 'Office Management 7', projectDescription: 'Project description project description project description project description project description project description project description project description project description project description project description', endDate: '2023-09-15', projectLead: '64ea194c7f50012b6221681a', assignedDevelopers: ['64ad03c05a16f308a6ce1e2b', '64af9143ad4f55990dfbae86']},
  //   ]
  //   const getAllProjects2 = () => {
  //       setAllProjects(d)
  //       setPaginationDetail({total: d.length})
  //       setTableLoader(false)
  //     }

  const getEmployees = () => {
    setEmpLoader(true);
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          res?.data?.User?.map((emp) => {
            setEmpInfo((prevEmp) => ({
              ...prevEmp,
              // [emp?._id]: emp?.fullName,
              [emp?._id]: { fullName: emp?.fullName, image: emp?.imageUrl },
            }));
          });
          setEmpLoader(false);
        }
      })
      .catch((err) => {
        setEmpLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('empProfile.errors.getEmployeeInfoError')
          }!`
        );
      });
  };

  const getAllProjects = (current_page, page_size) => {
    setTableLoader(true);
    apiServices(
      "GET",
      `project-management/project-by-id?role=${isRole}&id=${isID}&page=${
        current_page ? current_page : currentPage ? currentPage : 1
      }&limit=${page_size ? page_size : pageSize ? pageSize : 20}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          console.log(res?.data);
          setAllProjects(res?.data?.projects?.docs);
          setPaginationDetail(res?.data?.projects);
          setTableLoader(false);
        }
      })
      .catch((err) => {
        setTableLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aDash.errors.getProjectError')
          }!`
        );
      });
  };

  const getAllProjectsOnEdit = () => {
    getAllProjects(currentPage, pageSize)
  }

  const DeleteProject = (id) => {

    setLoader(true);
    apiServices("DELETE", `project-management/`, id, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(t('projectScreen.errors.projectDeletedSuccessfully'));
          setLoader(false);
          getAllProjects(currentPage, pageSize);
          closeModal();
        }
      })

      .catch((err) => {
        setLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('projectScreen.errors.errorDeletingProject')
          }`
        );
      });
  };

  const closeModal = () => {
    setOpen({
      editOpen: false,
      delOpen: false,
      data: "",
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
            {/* {
                  (role === 'admin' || permissions?.viewAllUsers) ? 'No Employee Record found!' : 'You are Restricted to View Employees'
                } */}
            No Projects Record Found!
          </div>
        </div>
      }
    />
  );

  const formattedDate = (text) => {
    const date = new Date(text);
    const day = date.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
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

  return (
    <>
      <div className="row">
        {tableLoader ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              height: "150px",
              background: "#efefef",
              alignItems: "center",
              borderRadius: "10px",
            }}
          >
            {" "}
            <Spin size="middle" />{" "}
          </div>
        ) : allProjects?.length > 0 ? (
          allProjects.map((project, index) => (
            <div
              key={index}
              className="col-lg-4 col-sm-6 col-md-4 col-xl-3 d-flex"
            >
              <div className="card" style={{ width: "100%" }}>
                <div
                  className="card-body"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  {/* <div className="dropdown profile-action">
                    <a
                      href="javascript:void(0)"
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
                        onClick={() => {
                          setOpen({
                            editOpen: true,
                            delOpen: false,
                            data: project,
                          });
                        }}
                      >
                        <i className="fa fa-pencil m-r-5" /> Edit
                      </a>
                      <a
                        className="dropdown-item"
                        href="javascript:void(0)"
                        onClick={() => {
                          setOpen({
                            editOpen: false,
                            delOpen: true,
                            data: project,
                          });
                        }}
                      >
                        <i className="fa fa-trash-o m-r-5" /> Delete
                      </a>
                    </div>
                  </div> */}
                  <h4 className="project-title" style={{ width: "190px" }}>
                    <Link to={`/projects/projects-view/${project?._id}`} state={{ project: project }}>
                      {project?.projectName}
                    </Link>
                  </h4>
                  {/* <div style={{margin: 'auto auto 0px'}}> */}
                  <small className="block text-ellipsis m-b-15">
                    {/* <span className="text-xs">1</span> <span className="text-muted">open tasks, </span>
                        <span className="text-xs">9</span> <span className="text-muted">tasks completed</span> */}
                  </small>
                  <div
                    className="text-muted projectDesc"
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "22px",
                      width: "100%",
                    }}
                  >
                    {project?.projectDescription}
                  </div>
                  <div style={{ margin: "auto 0px 0px" }}>
                    <div className="pro-deadline m-b-15">
                      <div className="sub-title">{t('projectScreen.deadline')}:</div>
                      <div className="text-muted">
                        {formattedDate(project?.endDate)}
                      </div>
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
                          <Tooltip title={project.projectLead?.fullName}>
                          <a
                            href="javascript:void(0)"
                          >
                            <img
                              alt=""
                              src={
                                project.projectLead?.imageUrl || user_icon
                              }
                            />
                          </a>
                          </Tooltip>
                        </li>
                      </ul>
                    </div>
                    <div className="project-members m-b-15">
                      <div>{t('projectScreen.team')}:</div>
                      <ul
                        className="team-members"
                        style={{ marginLeft: "10px" }}
                      >
                        {project?.assignedDevelopers?.map((dev, index) => (
                          <>
                            {index < 4 && (
                              <li>
                                <Tooltip title={dev?.fullName} >
                                  <a
                                    href="javascript:void(0)"
                                    className="projectTeamMember"
                                  >
                                    <img
                                      alt=""
                                      src={dev?.imageUrl || user_icon}
                                    />
                                  </a>
                                </Tooltip>
                              </li>
                            ) 
                            // : (
                            //   <li className="dropdown avatar-dropdown">
                            //     <a
                            //       href="javascript:void(0)"
                            //       className="all-users dropdown-toggle projectTeamMember"
                            //       style={{ display: "inline-flex" }}
                            //       data-bs-toggle="dropdown"
                            //       aria-expanded="false"
                            //     >
                            //       +{project?.assignedDevelopers?.length - 4}
                            //     </a>
                            //     <div className="dropdown-menu dropdown-menu-right">
                            //       <div className="avatar-group">
                            //         <a
                            //           className="avatar avatar-xs projectTeamMember"
                            //           href="javascript:void(0)"
                            //           data-bs-toggle="tooltip"
                            //           title={dev?.fullName}
                            //         >
                            //           <img
                            //             alt=""
                            //             src={dev?.imageUrl || user_icon}
                            //           />
                            //         </a>
                            //       </div>
                            //       {/* <div className="avatar-pagination">
                            //                     <ul className="pagination">
                            //                     <li className="page-item">
                            //                         <a className="page-link" href="#" aria-label="Previous">
                            //                         <span aria-hidden="true">«</span>
                            //                         <span className="sr-only">Previous</span>
                            //                         </a>
                            //                     </li>
                            //                     <li className="page-item"><a className="page-link" href="#">1</a></li>
                            //                     <li className="page-item"><a className="page-link" href="#">2</a></li>
                            //                     <li className="page-item">
                            //                         <a className="page-link" href="#" aria-label="Next">
                            //                         <span aria-hidden="true">»</span>
                            //                         <span className="sr-only">Next</span>
                            //                         </a>
                            //                     </li>
                            //                     </ul>
                            //                 </div> */}
                            //     </div>
                            //   </li>
                            // )
                            }
                          </>
                        ))}
                        {
                               project?.assignedDevelopers?.length > 4 && (
                                <li className="dropdown avatar-dropdown">
                                <a
                                  href="javascript:void(0)"
                                  className="all-users dropdown-toggle projectTeamMember"
                                  style={{ display: "inline-flex" }}
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  +{project?.assignedDevelopers?.length - 4}
                                </a>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <div className="avatar-group">
                                  {
                                    project?.assignedDevelopers?.slice(4)
                                    .map((dev, index) => (
                                      <Tooltip title={dev?.fullName}>
                                        <a
                                          key={index}
                                          className="avatar avatar-xs projectTeamMember"
                                          href="javascript:void(0)"
                                        >
                                          <img alt="" src={dev?.imageUrl || user_icon} />
                                        </a>
                                      </Tooltip>
                                    ))}
                                  </div>
                                </div>
                              </li>
                               )
                            }
                      </ul>
                      {/* <li className="dropdown avatar-dropdown">
                                <a href="javascript:void(0)" className="all-users dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">+15</a>
                                <div className="dropdown-menu dropdown-menu-right">
                                    <div className="avatar-group">
                                        <a className="avatar avatar-xs" href="javascript:void(0)">
                                        <img alt="" src={Avatar_02} />
                                        </a>
                                        <a className="avatar avatar-xs" href="javascript:void(0)">
                                        <img alt="" src={Avatar_09} />
                                        </a>
                                        <a className="avatar avatar-xs" href="#">
                                        <img alt="" src={Avatar_10} />
                                        </a>
                                        <a className="avatar avatar-xs" href="#">
                                        <img alt="" src={Avatar_05} />
                                        </a>
                                        <a className="avatar avatar-xs" href="#">
                                        <img alt="" src={Avatar_11} />
                                        </a>
                                        <a className="avatar avatar-xs" href="#">
                                        <img alt="" src={Avatar_12} />
                                        </a>
                                        <a className="avatar avatar-xs" href="#">
                                        <img alt="" src={Avatar_13} />
                                        </a>
                                        <a className="avatar avatar-xs" href="#">
                                        <img alt="" src={Avatar_01} />
                                        </a>
                                        <a className="avatar avatar-xs" href="#">
                                        <img alt="" src={Avatar_16} />
                                        </a>
                                    </div>
                                    <div className="avatar-pagination">
                                        <ul className="pagination">
                                        <li className="page-item">
                                            <a className="page-link" href="#" aria-label="Previous">
                                            <span aria-hidden="true">«</span>
                                            <span className="sr-only">Previous</span>
                                            </a>
                                        </li>
                                        <li className="page-item"><a className="page-link" href="#">1</a></li>
                                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                                        <li className="page-item">
                                            <a className="page-link" href="#" aria-label="Next">
                                            <span aria-hidden="true">»</span>
                                            <span className="sr-only">Next</span>
                                            </a>
                                        </li>
                                        </ul>
                                    </div>
                                </div>
                            </li>  */}
                    </div>
                    {/* <p className="m-b-5">Progress <span className="text-success float-end">40%</span></p>
                    <div className="progress progress-xs mb-0">
                        <div className="progress-bar bg-success" role="progressbar" data-bs-toggle="tooltip" title="40%" style={{width: '40%'}} />
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          customEmptyText
        )}
        {allProjects?.length > 0 && (
          <div>
            <Pagination
              style={{ display: "flex", float: "right" }}
              total={paginationDetail?.total}
              pageSize={pageSize}
              defaultCurrent={1}
              current={currentPage}
              showTotal={(total, range) =>
                t('paginationShow', { range1: range[0], range2: range[1], total: total })
              }
              onChange={(page, size) => {
                console.log(page, size);
                setPageSize(size);
                setCurrentPage(page);
                getAllProjects(page, size);
              }}
              showSizeChanger={true}
              pageSizeOptions={["20", "30", "40", "50"]}
              itemRender={(current, type, originalElement) =>
                itemRender(current, type, originalElement, t)
              }
            />
          </div>
        )}
        {/* <div className="col-lg-4 col-sm-6 col-md-4 col-xl-3">
            <div className="card">
                <div className="card-body">
                <div className="dropdown profile-action">
                    <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                    <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_project"><i className="fa fa-pencil m-r-5" /> Edit</a>
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_project"><i className="fa fa-trash-o m-r-5" /> Delete</a>
                    </div>
                </div>
                <h4 className="project-title"><Link to = "/app/projects/projects-view">Project Management</Link></h4>
                <small className="block text-ellipsis m-b-15">
                    <span className="text-xs">2</span> <span className="text-muted">open tasks, </span>
                    <span className="text-xs">5</span> <span className="text-muted">tasks completed</span>
                </small>
                <p className="text-muted">Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. When an unknown printer took a galley of type and
                    scrambled it...
                </p>
                <div className="pro-deadline m-b-15">
                    <div className="sub-title">
                    Deadline:
                    </div>
                    <div className="text-muted">
                    17 Apr 2019
                    </div>
                </div>
                <div className="project-members m-b-15">
                    <div>Project Leader :</div>
                    <ul className="team-members">
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Jeffery Lalor"><img alt="" src={Avatar_16} /></a>
                    </li>
                    </ul>
                </div>
                <div className="project-members m-b-15">
                    <div>Team :</div>
                    <ul className="team-members">
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="John Doe"><img alt="" src={Avatar_02} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Richard Miles"><img alt="" src={Avatar_09} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="John Smith"><img alt="" src={Avatar_10} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Mike Litorus"><img alt="" src={Avatar_05} /></a>
                    </li>
                    <li className="dropdown avatar-dropdown">
                        <a href="#" className="all-users dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">+15</a>
                        <div className="dropdown-menu dropdown-menu-right">
                        <div className="avatar-group">
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_02} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_09} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_10} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_05} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_11} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_12} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_13} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_01} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_16} />
                            </a>
                        </div>
                        <div className="avatar-pagination">
                            <ul className="pagination">
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Previous">
                                <span aria-hidden="true">«</span>
                                <span className="sr-only">Previous</span>
                                </a>
                            </li>
                            <li className="page-item"><a className="page-link" href="#">1</a></li>
                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Next">
                                <span aria-hidden="true">»</span>
                                <span className="sr-only">Next</span>
                                </a>
                            </li>
                            </ul>
                        </div>
                        </div>
                    </li>
                    </ul>
                </div>
                <p className="m-b-5">Progress <span className="text-success float-end">40%</span></p>
                <div className="progress progress-xs mb-0">
                    <div className="progress-bar bg-success" role="progressbar" data-bs-toggle="tooltip" title="40%" style={{width: '40%'}} />
                </div>
                </div>
            </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-md-4 col-xl-3">
            <div className="card">
                <div className="card-body">
                <div className="dropdown profile-action">
                    <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                    <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_project"><i className="fa fa-pencil m-r-5" /> Edit</a>
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_project"><i className="fa fa-trash-o m-r-5" /> Delete</a>
                    </div>
                </div>
                <h4 className="project-title"><Link to = "/app/projects/projects-view">Video Calling App</Link></h4>
                <small className="block text-ellipsis m-b-15">
                    <span className="text-xs">3</span> <span className="text-muted">open tasks, </span>
                    <span className="text-xs">3</span> <span className="text-muted">tasks completed</span>
                </small>
                <p className="text-muted">Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. When an unknown printer took a galley of type and
                    scrambled it...
                </p>
                <div className="pro-deadline m-b-15">
                    <div className="sub-title">
                    Deadline:
                    </div>
                    <div className="text-muted">
                    17 Apr 2019
                    </div>
                </div>
                <div className="project-members m-b-15">
                    <div>Project Leader :</div>
                    <ul className="team-members">
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Jeffery Lalor"><img alt="" src={Avatar_16} /></a>
                    </li>
                    </ul>
                </div>
                <div className="project-members m-b-15">
                    <div>Team :</div>
                    <ul className="team-members">
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="John Doe"><img alt="" src={Avatar_02} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Richard Miles"><img alt="" src={Avatar_09} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="John Smith"><img alt="" src={Avatar_10} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Mike Litorus"><img alt="" src={Avatar_05} /></a>
                    </li>
                    <li className="dropdown avatar-dropdown">
                        <a href="#" className="all-users dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">+15</a>
                        <div className="dropdown-menu dropdown-menu-right">
                        <div className="avatar-group">
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_02} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_09} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_10} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_05} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_11} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_12} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_13} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_01} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_16} />
                            </a>
                        </div>
                        <div className="avatar-pagination">
                            <ul className="pagination">
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Previous">
                                <span aria-hidden="true">«</span>
                                <span className="sr-only">Previous</span>
                                </a>
                            </li>
                            <li className="page-item"><a className="page-link" href="#">1</a></li>
                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Next">
                                <span aria-hidden="true">»</span>
                                <span className="sr-only">Next</span>
                                </a>
                            </li>
                            </ul>
                        </div>
                        </div>
                    </li>
                    </ul>
                </div>
                <p className="m-b-5">Progress <span className="text-success float-end">40%</span></p>
                <div className="progress progress-xs mb-0">
                    <div className="progress-bar bg-success" role="progressbar" data-bs-toggle="tooltip" title="40%" style={{width: '40%'}} />
                </div>
                </div>
            </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-md-4 col-xl-3">
            <div className="card">
                <div className="card-body">
                <div className="dropdown profile-action">
                    <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                    <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_project"><i className="fa fa-pencil m-r-5" /> Edit</a>
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_project"><i className="fa fa-trash-o m-r-5" /> Delete</a>
                    </div>
                </div>
                <h4 className="project-title"><Link to = "/app/projects/projects-view">Hospital Administration</Link></h4>
                <small className="block text-ellipsis m-b-15">
                    <span className="text-xs">12</span> <span className="text-muted">open tasks, </span>
                    <span className="text-xs">4</span> <span className="text-muted">tasks completed</span>
                </small>
                <p className="text-muted">Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. When an unknown printer took a galley of type and
                    scrambled it...
                </p>
                <div className="pro-deadline m-b-15">
                    <div className="sub-title">
                    Deadline:
                    </div>
                    <div className="text-muted">
                    17 Apr 2019
                    </div>
                </div>
                <div className="project-members m-b-15">
                    <div>Project Leader :</div>
                    <ul className="team-members">
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Jeffery Lalor"><img alt="" src={Avatar_16} /></a>
                    </li>
                    </ul>
                </div>
                <div className="project-members m-b-15">
                    <div>Team :</div>
                    <ul className="team-members">
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="John Doe"><img alt="" src={Avatar_02} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Richard Miles"><img alt="" src={Avatar_09} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="John Smith"><img alt="" src={Avatar_10} /></a>
                    </li>
                    <li>
                        <a href="#" data-bs-toggle="tooltip" title="Mike Litorus"><img alt="" src={Avatar_05} /></a>
                    </li>
                    <li className="dropdown avatar-dropdown">
                        <a href="#" className="all-users dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">+15</a>
                        <div className="dropdown-menu dropdown-menu-right">
                        <div className="avatar-group">
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_02} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_09} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_10} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_05} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_11} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_12} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_13} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_01} />
                            </a>
                            <a className="avatar avatar-xs" href="#">
                            <img alt="" src={Avatar_16} />
                            </a>
                        </div>
                        <div className="avatar-pagination">
                            <ul className="pagination">
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Previous">
                                <span aria-hidden="true">«</span>
                                <span className="sr-only">Previous</span>
                                </a>
                            </li>
                            <li className="page-item"><a className="page-link" href="#">1</a></li>
                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Next">
                                <span aria-hidden="true">»</span>
                                <span className="sr-only">Next</span>
                                </a>
                            </li>
                            </ul>
                        </div>
                        </div>
                    </li>
                    </ul>
                </div>
                <p className="m-b-5">Progress <span className="text-success float-end">40%</span></p>
                <div className="progress progress-xs mb-0">
                    <div className="progress-bar bg-success" role="progressbar" data-bs-toggle="tooltip" title="40%" style={{width: '40%'}} />
                </div>
                </div>
            </div>
            </div> */}
        {open?.editOpen && (
          <EditProjects
            data={open?.data}
            editModal={open?.editOpen}
            closeEditModal={closeModal}
            getlistprojects={getAllProjectsOnEdit}
          />
        )}
        {/* Delete Modal */}
        <Modal
          open={open?.delOpen}
          onClose={closeModal}
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
                  <p>
                    Are you sure you want to Delete{" "}
                    <b>{open?.data?.projectName}</b>?
                  </p>
                </div>

                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <Button
                        htmlType="submit"
                        className="btn btn-primary continue-btn"
                        onClick={() => DeleteProject(open?.data?._id)}
                        style={{ width: "100%" }}
                        disabled={loader}
                      >
                        {
                        loader ? <Spin size="small" indicator={antIcon} />
                          : 'Delete'
                        }
                      </Button>
                    </div>

                    <div className="col-6">
                      <Button
                        onClick={closeModal}
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
    </>
  );
};

export default ProjectsScreen;
