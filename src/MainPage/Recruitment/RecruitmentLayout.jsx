import React, { useState } from 'react';
import { Link, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import Header from '../../initialpage/Sidebar/header';
import Dashboard from './Dashboard';
import Jobs from './Jobs';
import JobDetails from './JobDetails';
import EditJob from './EditJob';
import Candidates from './Candidates';
import CandidateDetails from './CandidateDetails';
import EditCandidate from './EditCandidate';
import Interviews from './Interviews';
import InterviewDetails from './InterviewDetails';
import Tasks from './Tasks';
import TaskDetails from './TaskDetails';
import HiredCandidates from './HiredCandidates';
import BlacklistedCandidates from './BlacklistedCandidates';
import OfferedCandidates from './OfferedCandidates';
import dashboard from '../../assets/iconsRecruitment/DashBoard.svg';
import interviewIcon from '../../assets/iconsRecruitment/interview.svg';
import candidateIcon from '../../assets/iconsRecruitment/candidate.svg';
import jobsIcon from '../../assets/iconsRecruitment/jobsIcon.svg';
import taskIcon from '../../assets/iconsRecruitment/taskIcon.svg';

const RecruitmentLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const pathname = location.pathname;
  const [openMenus, setOpenMenus] = useState([]);

  const toggleSubmenu = (menu) => {
    if (openMenus.includes(menu)) {
      setOpenMenus(openMenus.filter(item => item !== menu));
    } else {
      setOpenMenus([...openMenus, menu]);
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      
      {/* Recruitment-specific sidebar */}
      <div className="sidebar" id="sidebar">
        <div className="sidebar-inner slimscroll">
          <div id="sidebar-menu" className="sidebar-menu">
            <ul>
              <li className="menu-title align-items-center" style={{gap:'5px'}}>
                <div style={{height:"4px" , width:"4px" , borderRadius:"50%" , background:"#ff9244"}}></div>
                <span>Main</span>
              </li>

              <li className={pathname.includes("/recruitment/dashboard") ? "active" : ""}>
                <Link to="/recruitment/dashboard">
                  <img src={dashboard}></img> <span>Dashboard</span>
                </Link>
              </li>
            </ul>
            <ul style={{marginTop:"10px"}}>
              <li className="menu-title align-items-center" style={{gap:'5px'}}>
                <div style={{height:"4px" , width:"4px" , borderRadius:"50%" , background:"#ff9244"}}></div>
                <span>Recruitment</span>
              </li>

              <li className={pathname.includes("/recruitment/jobs") ? "active" : ""}>
                <Link to="/recruitment/jobs">
                  <img src={jobsIcon}></img> <span>Jobs</span>
                </Link>
              </li>

              <li className={`submenu ${pathname.includes("/recruitment/candidates") || openMenus.includes('candidates') ? "active" : ""}`}>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu('candidates');
                }}>
                  <img src={candidateIcon}></img> 
                  <span>Candidates</span>
                  <span className={`menu-arrow ${openMenus.includes('candidates') ? 'active' : ''}`} />
                </a>
                <ul style={{ 
                  display: pathname.includes("/recruitment/candidates") || openMenus.includes('candidates') ? "block" : "none",
                }}>
                  <li className={pathname.includes("/recruitment/candidates/processing") ? "active" : ""}>
                    <Link to="/recruitment/candidates/processing"  style={{display:"flex" , alignItems:"center"}}>
                      <div style={{background:"#ff9244" , height:'4px' , width:"4px" , borderRadius:"50%"}}></div>
                      <span>Processing</span>
                    </Link>
                  </li>
                  <li className={pathname.includes("/recruitment/candidates/offered") ? "active" : ""}>
                    <Link to="/recruitment/candidates/offered" style={{display:"flex" , alignItems:"center"}}>
                      <div style={{background:"#ff9244" , height:'4px' , width:"4px" , borderRadius:"50%"}}></div>
                      <span>Offered</span>
                    </Link>
                  </li>
                  <li className={pathname.includes("/recruitment/candidates/hired") ? "active" : ""}>
                    <Link to="/recruitment/candidates/hired" style={{display:"flex" , alignItems:"center"}}>
                      <div style={{background:"#ff9244" , height:'4px' , width:"4px" , borderRadius:"50%"}}></div>
                      <span>Hired</span>
                    </Link>
                  </li>
                  <li className={pathname.includes("/recruitment/candidates/blacklist") ? "active" : ""}>
                    <Link to="/recruitment/candidates/blacklist" style={{display:"flex" , alignItems:"center"}}>
                      <div style={{background:"#ff9244" , height:'4px' , width:"4px" , borderRadius:"50%"}}></div>
                      <span>Blacklist</span>
                    </Link>
                  </li>
                </ul>
              </li>

              <li className={pathname.includes("/recruitment/interviews") ? "active" : ""}>
                <Link to="/recruitment/interviews">
                  <img src={interviewIcon}></img> <span>Interviews</span>
                </Link>
              </li>

              <li className={pathname.includes("/recruitment/tasks") ? "active" : ""}>
                <Link to="/recruitment/tasks">
                  <img src={taskIcon}></img> <span>Tasks</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:jobId" element={<JobDetails />} />
          <Route path="jobs/:jobId/edit" element={<EditJob />} />
          <Route path="candidates/processing" element={<Candidates />} />
          <Route path="candidates/hired" element={<HiredCandidates />} />
          <Route path="candidates/offered" element={<OfferedCandidates />} />
          <Route path="candidates/blacklist" element={<BlacklistedCandidates />} />
          <Route path="candidates/:id" element={<CandidateDetails />} />
          <Route path="candidates/:id/edit" element={<EditCandidate />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="interviews/:id" element={<InterviewDetails />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default RecruitmentLayout; 