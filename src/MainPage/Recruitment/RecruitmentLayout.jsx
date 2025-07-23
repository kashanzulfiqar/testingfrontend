import React, { useState, useEffect } from 'react';
import { Link, useLocation, Routes, Route, Navigate } from 'react-router-dom';
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
import ScreenedCandidates from './ScreenedCandidates';
import dashboard from '../../assets/iconsRecruitment/DashBoard.svg';
import interviewIcon from '../../assets/iconsRecruitment/interview.svg';
import candidateIcon from '../../assets/iconsRecruitment/candidate.svg';
import jobsIcon from '../../assets/iconsRecruitment/jobsIcon.svg';
import taskIcon from '../../assets/iconsRecruitment/taskIcon.svg';

const RecruitmentLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const pathname = location.pathname;

  const [oldOpenMenu, setOldOpenMenu] = useState("");
  const [isSideMenu, setSideMenu] = useState("");
  const [isSideMenunew, setSideMenuNew] = useState("dashboard");
  const [menuState, setMenuState] = useState(false);
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  useEffect(() => {
    if (location?.pathname !== "/settings") {
      sessionStorage.removeItem("active_setting");
    }
  }, [location]);

  useEffect(() => {
    if (document.body.classList.contains("mini-sidebar")) {
      setOldOpenMenu(isSideMenu);
      setSideMenu("");
    } else {
      setSideMenu(oldOpenMenu);
    }
  }, []);

  // Add window resize event handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
      
      // Remove mini-sidebar class on small screens
      if (window.innerWidth <= 991) {
        document.body.classList.remove("mini-sidebar");
        document.body.classList.remove("expand-menu");
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add an effect to monitor the mini-sidebar class and close submenus when it's added
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isMiniSidebar = document.body.classList.contains('mini-sidebar');
          if (isMiniSidebar) {
            // Close submenu when sidebar is toggled to mini mode
            setSideMenu("");
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  const mouseHandle = (type) => {
    // Skip hover effects on small screens
    if (window.innerWidth <= 991) {
      return;
    }
    
    if (document.body.classList.contains("mini-sidebar")) {
      document.body.classList.toggle("expand-menu", type !== "leave");

      // Close submenu when mouse leaves
      if (type === "leave") {
        setSideMenu(""); // Close submenu
      } else {
        setSideMenu(oldOpenMenu); // Open submenu again
      }
    }
  };

  const toggleSidebar = (value) => {
    // If sidebar is already in mini mode, don't allow submenu to open
    if (document.body.classList.contains("mini-sidebar") && !document.body.classList.contains("expand-menu")) {
      return;
    }
    
    setSideMenu(value === isSideMenu ? "" : value);
    setSideMenuNew(value);
  };

  // Handle mobile menu toggle
  const onMenuClick = () => {
    setMenuState(!menuState);
    document.body.classList.toggle('slide-nav');
    document.querySelector('.sidebar').classList.toggle('opened');
  };

  // Function to close sidebar on mobile when menu item is clicked
  const closeSidebarOnMobile = () => {
    const windowWidth = window.innerWidth;
    if (windowWidth <= 991) {
      setMenuState(false);
      document.body.classList.remove('slide-nav');
      document.querySelector('.sidebar').classList.remove('opened');
    }
  };

  return (
    <div className="main-wrapper">
      <Header onMenuClick={onMenuClick} />

      {/* Sidebar */}
      <div
        className="sidebar"
        id="sidebar"
        onMouseEnter={() => mouseHandle("enter")}
        onMouseLeave={() => mouseHandle("leave")}
      >
        <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
          <div style={{ position: "absolute", inset: "0px", overflowX: "hidden", marginRight: "-15px", marginBottom: "-15px" }}>
            <div className="sidebar-inner slimscroll">
              <div id="sidebar-menu" className="sidebar-menu">
                <ul>
                  <li className="menu-title align-items-center" style={{ gap: '5px' }}>
                    <div style={{ height: "4px", width: "4px", borderRadius: "50%", background: "#ff9244" }}></div>
                    <span>Main</span>
                  </li>
                  <li className={pathname.includes("/recruitment/dashboard") ? "active" : ""}>
                    <Link to="/recruitment/dashboard" onClick={closeSidebarOnMobile}>
                      <img src={dashboard} style={{ minHeight: "20px", minWidth: "20px" }} /> <span>Dashboard</span>
                    </Link>
                  </li>
                </ul>

                <ul style={{ marginTop: "10px" }}>
                  <li className="menu-title align-items-center" style={{ gap: '5px' }}>
                    <div style={{ height: "4px", width: "4px", borderRadius: "50%", background: "#ff9244" }}></div>
                    <span>Recruitment</span>
                  </li>

                  <li className={pathname.includes("/recruitment/jobs") ? "active" : ""}>
                    <Link to="/recruitment/jobs" onClick={closeSidebarOnMobile}>
                      <img src={jobsIcon} style={{ minHeight: "20px", minWidth: "20px" }} /> <span>Jobs</span>
                    </Link>
                  </li>

                  <li className={`submenu ${isSideMenu === "candidates" ? "active subdrop" : ""}`}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSidebar("candidates");
                      }}
                    >
                      <img src={candidateIcon} style={{ minHeight: "20px", minWidth: "20px" }} />
                      <span>Candidates</span>
                      <span className="menu-arrow" />
                    </a>
                    <ul style={{ display: isSideMenu === "candidates" ? "block" : "none" }}>
                      <li className={pathname.includes("/recruitment/candidates/processing") ? "active" : ""}>
                        <Link to="/recruitment/candidates/processing" onClick={closeSidebarOnMobile} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ background: "#ff9244", height: '4px', width: "4px", borderRadius: "50%" }}></div>
                          <span>Processing</span>
                        </Link>
                      </li>
                      <li className={pathname.includes("/recruitment/candidates/screened") ? "active" : ""}>
                        <Link to="/recruitment/candidates/screened" onClick={closeSidebarOnMobile} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ background: "#ff9244", height: '4px', width: "4px", borderRadius: "50%" }}></div>
                          <span>Screening</span>
                        </Link>
                      </li>
                      <li className={pathname.includes("/recruitment/candidates/offered") ? "active" : ""}>
                        <Link to="/recruitment/candidates/offered" onClick={closeSidebarOnMobile} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ background: "#ff9244", height: '4px', width: "4px", borderRadius: "50%" }}></div>
                          <span>Offered</span>
                        </Link>
                      </li>
                      <li className={pathname.includes("/recruitment/candidates/hired") ? "active" : ""}>
                        <Link to="/recruitment/candidates/hired" onClick={closeSidebarOnMobile} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ background: "#ff9244", height: '4px', width: "4px", borderRadius: "50%" }}></div>
                          <span>Hired</span>
                        </Link>
                      </li>
                      <li className={pathname.includes("/recruitment/candidates/blacklist") ? "active" : ""}>
                        <Link to="/recruitment/candidates/blacklist" onClick={closeSidebarOnMobile} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ background: "#ff9244", height: '4px', width: "4px", borderRadius: "50%" }}></div>
                          <span>Blacklist</span>
                        </Link>
                      </li>
                    </ul>
                  </li>

                  <li className={pathname.includes("/recruitment/interviews") ? "active" : ""}>
                    <Link to="/recruitment/interviews" onClick={closeSidebarOnMobile}>
                      <img src={interviewIcon} style={{ minHeight: "20px", minWidth: "20px" }} /> <span>Interviews</span>
                    </Link>
                  </li>

                  <li className={pathname.includes("/recruitment/tasks") ? "active" : ""}>
                    <Link to="/recruitment/tasks" onClick={closeSidebarOnMobile}>
                      <img src={taskIcon} style={{ minHeight: "20px", minWidth: "20px" }} /> <span>Tasks</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
          <Route path="candidates/screened" element={<ScreenedCandidates />} />
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
