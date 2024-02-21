/**
 * TermsCondition Page
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {Avatar_01,Avatar_02,Avatar_05,Avatar_09,Avatar_10,Avatar_11,Avatar_12,Avatar_13,Avatar_16 ,Avatar_19, user_icon} from '../../../Entryfile/imagepath'
import { useSelector } from 'react-redux';
import InvoicesScreen from './clientProfileScreens/InvoicesScreen';
import ProjectsScreen from './clientProfileScreens/ProjectsScreen';
import { Spin, message } from 'antd';
import { apiServices } from '../../../Services/apiServices';
import { useTranslation } from 'react-i18next';

const FocalProfile = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const focal_data = location?.state?.focal_data;
  const nav = useNavigate();

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role

  const [focalData, setFocalData] = useState({})
  const [activeTab, setActiveTab] = useState('projects')
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    if(focal_data){
      setFocalData(focal_data)
      setLoader(false)
    }else if(role === 'focalperson'){
        getSingleFocal()
    }else if(!focal_data && role !== 'focalperson'){
      nav(role === 'client' ? `/client/client-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`)
    }
  }, [])

  const getSingleFocal = () => {
    apiServices("GET", `focal-person/get-focal-person-info?_id=${user_state?.user?._id}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setFocalData(res?.data?.FocalPerson);
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
              : "Get Single Focal Person Error"
          }!`
        );
      });
  }
  

    return (
      <>
       <div className="page-wrapper">
            <Helmet>
              <title>{t('client.focalPersonProfile')} - {t('header.daftarPro')}</title>
              <meta name="description" content="Reactify Blank Page" />
            </Helmet>
           {/* Page Content */}
           <div className="content container-fluid">
             {/* Page Header */}
             <div className="page-header">
               <div className="row">
                 <div className="col-sm-12">
                   <h3 className="page-title">{t('empProfile.profile')}</h3>
                   <ul className="breadcrumb">
                     <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>{t('dashboard')}</Link></li>
                     <li className="breadcrumb-item active">{t('empProfile.profile')}</li>
                   </ul>
                 </div>
               </div>
             </div>
             {/* /Page Header */}
             <div className="card mb-0">
              {
                loader ? <Spin size='middle' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '158px'}} /> :
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="profile-view">
                        <div className="profile-img-wrap">
                          <div className="profile-img">
                            <a href="javascript:void(0)" style={{cursor: 'default'}}>
                              <img src={focalData?.focalPersonImageUrl || user_icon} alt="profile" />
                            </a>
                          </div>
                        </div>
                        <div className="profile-basic">
                          <div className="row">
                            <div className="col-md-5">
                              <div className="profile-info-left" style={{padding: '45px 0px 45px 0px'}}>
                                <h3 className="user-name m-t-0">{focalData?.focalPersonName}</h3>
                                {/* <h5 className="company-role m-t-0 mb-0">Barry Cuda</h5>
                                <small className="text-muted">CEO</small>
                                <div className="staff-id">Employee ID : CLT-0001</div>
                                <div className="staff-msg"><Link to = "/conversation/chat" className="btn btn-custom">Send Message</Link></div> */}
                              </div>
                            </div>
                            <div className="col-md-7">
                              <ul className="personal-info">
                                <li>
                                  <span className="title">{t('empProfile.phone')}:</span>
                                  <span className="text"><a href="javascript:void(0)" style={{cursor: 'default'}}>{focalData?.focalPersonPhoneNo}</a></span>
                                </li>
                                <li>
                                  <span className="title">{t('aDash.email')}:</span>
                                  <span className="text"><a href="javascript:void(0)" style={{cursor: 'default'}}>{focalData?.focalPersonEmail}</a></span>
                                </li>
                                <li>
                                  <span className="title">{t('allEmp.designation')}:</span>
                                  <span className="text">{focalData?.designation}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
             </div>
             <div className="card tab-box">
               <div className="row user-tabs">
                 <div className="col-lg-12 col-md-12 col-sm-12 line-tabs">
                   <ul className="nav nav-tabs nav-tabs-bottom">
                     <li className="nav-item col-sm-3"><a className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => { setActiveTab('projects') }}>{t('projects')}</a></li>
                     {/* <li className="nav-item col-sm-3"><a className="nav-link active" data-bs-toggle="tab" href="#myprojects">Projects</a></li> */}
                     {/* <li className="nav-item col-sm-3"><a className="nav-link" data-bs-toggle="tab" href="#tasks">Tasks</a></li> */}
                     <li className="nav-item col-sm-3"><a className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => { setActiveTab('invoices') }}>{t('aDash.invoices')}</a></li>
                     {/* <li className="nav-item col-sm-3"><a className="nav-link" data-bs-toggle="tab" href="#invoices">Invoices</a></li> */}
                   </ul>
                 </div>
               </div>
             </div>
             <div className="row">
               <div className="col-lg-12"> 
                 <div className="tab-content profile-tab-content">
                   {/* Projects Tab */}
                    {
                      (activeTab === 'projects' && focalData?._id) &&
                      <div id="myprojects" className="tab-pane fade show active">
                        <ProjectsScreen
                          isID={focalData?._id}
                          isRole='focalperson'
                        />
                      </div>
                    }
                   {/* /Projects Tab */}
                   {/* Task Tab */}
                    {/*                    
                      <div id="tasks" className="tab-pane fade">
                        <div className="project-task">
                          <ul className="nav nav-tabs nav-tabs-top nav-justified mb-0">
                            <li className="nav-item"><a className="nav-link active" href="#all_tasks" data-bs-toggle="tab" aria-expanded="true">All Tasks</a></li>
                            <li className="nav-item"><a className="nav-link" href="#pending_tasks" data-bs-toggle="tab" aria-expanded="false">Pending Tasks</a></li>
                            <li className="nav-item"><a className="nav-link" href="#completed_tasks" data-bs-toggle="tab" aria-expanded="false">Completed Tasks</a></li>
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
                                            <span className="action-circle large complete-btn" title="Mark Complete">
                                              <i className="material-icons">check</i>
                                            </span>
                                          </span>
                                          <span className="task-label" contentEditable="true" suppressContentEditableWarning={true}>Patient appointment booking</span>
                                          <span className="task-action-btn task-btn-right">
                                            <span className="action-circle large" title="Assign">
                                              <i className="material-icons">person_add</i>
                                            </span>
                                            <span className="action-circle large delete-btn" title="Delete Task">
                                              <i className="material-icons">delete</i>
                                            </span>
                                          </span>
                                        </div>
                                      </li>
                                      <li className="task">
                                        <div className="task-container">
                                          <span className="task-action-btn task-check">
                                            <span className="action-circle large complete-btn" title="Mark Complete">
                                              <i className="material-icons">check</i>
                                            </span>
                                          </span>
                                          <span className="task-label" contentEditable="true" suppressContentEditableWarning={true}>Appointment booking with payment gateway</span>
                                          <span className="task-action-btn task-btn-right">
                                            <span className="action-circle large" title="Assign">
                                              <i className="material-icons">person_add</i>
                                            </span>
                                            <span className="action-circle large delete-btn" title="Delete Task">
                                              <i className="material-icons">delete</i>
                                            </span>
                                          </span>
                                        </div>
                                      </li>
                                      <li className="completed task">
                                        <div className="task-container">
                                          <span className="task-action-btn task-check">
                                            <span className="action-circle large complete-btn" title="Mark Complete">
                                              <i className="material-icons">check</i>
                                            </span>
                                          </span>
                                          <span className="task-label">Doctor available module</span>
                                          <span className="task-action-btn task-btn-right">
                                            <span className="action-circle large" title="Assign">
                                              <i className="material-icons">person_add</i>
                                            </span>
                                            <span className="action-circle large delete-btn" title="Delete Task">
                                              <i className="material-icons">delete</i>
                                            </span>
                                          </span>
                                        </div>
                                      </li>
                                      <li className="task">
                                        <div className="task-container">
                                          <span className="task-action-btn task-check">
                                            <span className="action-circle large complete-btn" title="Mark Complete">
                                              <i className="material-icons">check</i>
                                            </span>
                                          </span>
                                          <span className="task-label" contentEditable="true" suppressContentEditableWarning={true}>Patient and Doctor video conferencing</span>
                                          <span className="task-action-btn task-btn-right">
                                            <span className="action-circle large" title="Assign">
                                              <i className="material-icons">person_add</i>
                                            </span>
                                            <span className="action-circle large delete-btn" title="Delete Task">
                                              <i className="material-icons">delete</i>
                                            </span>
                                          </span>
                                        </div>
                                      </li>
                                      <li className="task">
                                        <div className="task-container">
                                          <span className="task-action-btn task-check">
                                            <span className="action-circle large complete-btn" title="Mark Complete">
                                              <i className="material-icons">check</i>
                                            </span>
                                          </span>
                                          <span className="task-label" contentEditable="true" suppressContentEditableWarning={true}>Private chat module</span>
                                          <span className="task-action-btn task-btn-right">
                                            <span className="action-circle large" title="Assign">
                                              <i className="material-icons">person_add</i>
                                            </span>
                                            <span className="action-circle large delete-btn" title="Delete Task">
                                              <i className="material-icons">delete</i>
                                            </span>
                                          </span>
                                        </div>
                                      </li>
                                      <li className="task">
                                        <div className="task-container">
                                          <span className="task-action-btn task-check">
                                            <span className="action-circle large complete-btn" title="Mark Complete">
                                              <i className="material-icons">check</i>
                                            </span>
                                          </span>
                                          <span className="task-label" contentEditable="true" suppressContentEditableWarning={true}>Patient Profile add</span>
                                          <span className="task-action-btn task-btn-right">
                                            <span className="action-circle large" title="Assign">
                                              <i className="material-icons">person_add</i>
                                            </span>
                                            <span className="action-circle large delete-btn" title="Delete Task">
                                              <i className="material-icons">delete</i>
                                            </span>
                                          </span>
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="task-list-footer">
                                    <div className="new-task-wrapper">
                                      <textarea id="new-task" placeholder="Enter new task here. . ." defaultValue={""} />
                                      <span className="error-message hidden">You need to enter a task first</span>
                                      <span className="add-new-task-btn btn" id="add-task">Add Task</span>
                                      <span className="btn" id="close-task-panel">Close</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="tab-pane" id="pending_tasks" />
                            <div className="tab-pane" id="completed_tasks" />
                          </div>
                        </div>
                      </div> 
                    */}
                   {/* /Task Tab */}

                   {/* Invoice Tab */}  
                   {
                      activeTab === 'invoices' &&
                      <div id="invoices" className="tab-pane fade show active">
                      <InvoicesScreen />
                      </div>
                  }
                   {/* Invoice Tab */} 

                 </div>
               </div>
             </div>
           </div>
           {/* /Page Content */}
         </div>
         {/* <Offcanvas/> */}
      </>
       
       
    );
  }

export default FocalProfile