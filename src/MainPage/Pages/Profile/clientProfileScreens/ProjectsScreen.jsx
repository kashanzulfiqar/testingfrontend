import React, { useEffect } from 'react'
import {Avatar_01,Avatar_02,Avatar_05,Avatar_09,Avatar_10,Avatar_11,Avatar_12,Avatar_13,Avatar_16 ,Avatar_19, user_icon} from '../../../../Entryfile/imagepath'
import { Link } from 'react-router-dom';

const ProjectsScreen = () => {

    useEffect(() => {
        console.log('projects');
      }, [])


  return (
    <>
        <div className="row">
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
                <h4 className="project-title"><Link to = "/app/projects/projects-view">Office Management</Link></h4>
                <small className="block text-ellipsis m-b-15">
                    <span className="text-xs">1</span> <span className="text-muted">open tasks, </span>
                    <span className="text-xs">9</span> <span className="text-muted">tasks completed</span>
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
        </div>
    </>
  )
}

export default ProjectsScreen