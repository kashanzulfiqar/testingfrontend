/**
 * TermsCondition Page
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {Avatar_01,Avatar_02,Avatar_05,Avatar_09,Avatar_10,Avatar_11,Avatar_12,Avatar_13,Avatar_16 ,Avatar_19, user_icon} from '../../../Entryfile/imagepath'
import { useSelector } from 'react-redux';
import FocalPerson from './clientProfileScreens/FocalPerson';
import InvoicesScreen from './clientProfileScreens/InvoicesScreen';
import ProjectsScreen from './clientProfileScreens/ProjectsScreen';
import { apiServices } from '../../../Services/apiServices';
import { Spin, message } from 'antd';
import { useTranslation } from 'react-i18next';

const ClientProfile = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation();
  const client_data = location?.state?.client_data;
  const nav = useNavigate();

  let active = sessionStorage.getItem("active_tab");
  let clients_tab = sessionStorage.getItem("clients_tab");

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role

  const [clientData, setClientData] = useState({})
  const [activeTab, setActiveTab] = useState(clients_tab ? clients_tab : active ? active : 'projects')
  if(clients_tab){
    setTimeout( function() { 
    sessionStorage.removeItem('clients_tab');
    }, 1000);
  }
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    if(client_data){
      setClientData(client_data)
      setLoader(false)
    }else if(role === 'client'){
        getSingleClient()
    }else if(!client_data && role !== 'client'){
      nav(role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`)
    }

    // window.history.pushState(null, '', `${window?.location?.origin}/client/focal-profile`)
    // window.onpopstate = function() {
    //   if(location.pathname === '/client/login' || location.pathname === '/login'){
    //     window.history.pushState(null, '', `${window?.location?.origin}/client/focal-profile`)
    //   }
    // }
  }, [])

  useEffect(() => {
    // window.scrollTo(0, 0);
    // sessionStorage.clear();
    sessionStorage.setItem(`active_tab`, `${activeTab}`)
  }, [activeTab])

  const getSingleClient = () => {
    apiServices("GET", `client/get-client-info?_id=${user_state?.user?._id}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setClientData(res?.data?.Client);
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
              : t('Timesheetadmin.getClientError')
          }!`
        );
      });
  }
  

    return (
      <>
       <div className="page-wrapper">
            <Helmet>
              <title>{t('client.clientProfile')} - {t('header.daftarPro')}</title>
              <meta name="description" content="Reactify Blank Page" />
            </Helmet>
           {/* Page Content */}
           <div className="content container-fluid">
             {/* Page Header */}
             <div className="page-header">
               <div className="row">
                 <div className="col-sm-12">
                   <h3 className="page-title">{t('empProfile.profile')}</h3>
                   {/* <ul className="breadcrumb">
                     <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>{t('dashboard')}</Link></li>
                     <li className="breadcrumb-item active">{t('empProfile.profile')}</li>
                   </ul> */}
                 </div>
               </div>
             </div>
             {/* /Page Header */}
             <div className="card mb-0">
              {
                loader ? <Spin size='middle' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '195px'}} /> :
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="profile-view">
                        <div className="profile-img-wrap">
                          <div className="profile-img">
                            <a href="javascript:void(0)" style={{cursor: 'default'}}>
                              <img src={clientData?.logo || user_icon} alt="profile" />
                            </a>
                          </div>
                        </div>
                        <div className="profile-basic">
                          <div className="row">
                            <div className="col-md-5">
                              <div className="profile-info-left" style={{padding: '45px 0px 80px 0px'}}>
                                <h3 className="user-name m-t-0">{clientData?.clientName}</h3>
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
                                  <span className="text"><a href="javascript:void(0)" style={{cursor: 'default', unicodeBidi: 'plaintext'}}>{clientData?.clientPhoneNo}</a></span>
                                </li>
                                <li>
                                  <span className="title">{t('aDash.email')}:</span>
                                  <span className="text"><a href="javascript:void(0)" style={{cursor: 'default'}}>{clientData?.clientEmail}</a></span>
                                </li>
                                <li>
                                  <span className="title">{t('client.country')}:</span>
                                  <span className="text">{clientData?.country}</span>
                                </li>
                                <li>
                                  <label className="title">{t('client.invoiceEmail')}:</label>
                                  <span className="text">{clientData?.invoiceEmail}</span>
                                </li>
                                <li>
                                  <label className="title">{t('client.headOfficeAddress')}:</label>
                                  <label className="text">{clientData?.headOfficeAddress}</label>
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
                     <li className="nav-item col-sm-3"><a className={`nav-link ${activeTab === 'focal' ? 'active' : ''}`} onClick={() => { setActiveTab('focal') }}>{t('client.focalPersons')}</a></li>
                     {/* <li className="nav-item col-sm-3"><a className="nav-link" data-bs-toggle="tab" href="#focal_person">Focal Person</a></li> */}
                   </ul>
                 </div>
               </div>
             </div>
             <div className="row">
               <div className="col-lg-12"> 
                 <div className="tab-content profile-tab-content">
                   {/* Projects Tab */}
                    {
                      (activeTab === 'projects' && clientData?._id) &&
                      <div id="myprojects" className="tab-pane fade show active">
                        <ProjectsScreen
                          isID={clientData?._id}
                          isRole='client'
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
                      (activeTab === 'invoices' && clientData?._id) &&
                      <div id="invoices" className="tab-pane fade show active">
                      <InvoicesScreen
                        clientId={clientData?._id}
                      />
                      </div>
                  }
                   {/* Invoice Tab */}  

                   {/* Focal Person Tab */}  
                   {
                      (activeTab === 'focal' && clientData?._id) &&
                      <div id="focal_person" className="tab-pane fade show active">
                      <FocalPerson
                        clientId={clientData?._id}
                      />
                      </div>
                  }
                   {/* Focal Person Tab */}  

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
  export default ClientProfile;
