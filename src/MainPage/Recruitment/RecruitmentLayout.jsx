import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import Header from '../../initialpage/Sidebar/header';

const RecruitmentLayout = ({ children }) => {
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
        {children}
      </div>
    </div>
  );
};

export default RecruitmentLayout; 