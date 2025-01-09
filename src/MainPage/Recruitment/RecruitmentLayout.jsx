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

              <li className={pathname.includes("/recruitment/candidates") ? "active" : ""}>
                <Link to="/recruitment/candidates">
                  <i className="la la-user-plus" /> <span>Candidates</span>
                </Link>
              </li>

              <li className={pathname.includes("/recruitment/interviews") ? "active" : ""}>
                <Link to="/recruitment/interviews">
                  <i className="la la-calendar" /> <span>Interviews</span>
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
          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/:id" element={<CandidateDetails />} />
          <Route path="candidates/:id/edit" element={<EditCandidate />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="interviews/:id" element={<InterviewDetails />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default RecruitmentLayout; 