import React from 'react';
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

const RecruitmentLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const pathname = location.pathname;

  return (
    <div className="main-wrapper">
      <Header />
      
      {/* Recruitment-specific sidebar */}
      <div className="sidebar" id="sidebar">
        <div className="sidebar-inner slimscroll">
          <div id="sidebar-menu" className="sidebar-menu">
            <ul>
              <li className="menu-title">
                <span>Recruitment</span>
              </li>

              <li className={pathname.includes("/recruitment/dashboard") ? "active" : ""}>
                <Link to="/recruitment/dashboard">
                  <i className="la la-dashboard" /> <span>Dashboard</span>
                </Link>
              </li>

              <li className={pathname.includes("/recruitment/jobs") ? "active" : ""}>
                <Link to="/recruitment/jobs">
                  <i className="la la-briefcase" /> <span>Jobs</span>
                </Link>
              </li>

              <li className={pathname.includes("/recruitment/candidates") ? "active submenu" : "submenu"}>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <i className="la la-user-plus" /> 
                  <span>Candidates</span>
                  <span className="menu-arrow" />
                </a>
                <ul style={{ display: pathname.includes("/recruitment/candidates") ? "block" : "none" }}>
                  <li className={pathname === "/recruitment/candidates/processing" ? "active" : ""}>
                    <Link to="/recruitment/candidates/processing">Under Processing</Link>
                  </li>
                  <li className={pathname === "/recruitment/candidates/hired" ? "active" : ""}>
                    <Link to="/recruitment/candidates/hired">Hired Resource</Link>
                  </li>
                  <li className={pathname === "/recruitment/candidates/blacklist" ? "active" : ""}>
                    <Link to="/recruitment/candidates/blacklist">Blacklist</Link>
                  </li>
                </ul>
              </li>

              <li className={pathname.includes("/recruitment/interviews") ? "active" : ""}>
                <Link to="/recruitment/interviews">
                  <i className="la la-calendar" /> <span>Interviews</span>
                </Link>
              </li>

              <li className={pathname.includes("/recruitment/tasks") ? "active" : ""}>
                <Link to="/recruitment/tasks">
                  <i className="la la-tasks" /> <span>Tasks</span>
                </Link>
              </li>

              <li className={pathname.includes("/recruitment/offers") ? "active" : ""}>
                <Link to="/recruitment/offers">
                  <i className="la la-file-text" /> <span>Offers</span>
                </Link>
              </li>

              <li className={pathname.includes("/recruitment/settings") ? "active" : ""}>
                <Link to="/recruitment/settings">
                  <i className="la la-cog" /> <span>Settings</span>
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