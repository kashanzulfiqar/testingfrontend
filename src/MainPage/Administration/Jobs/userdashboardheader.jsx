// /**
//  * Signin Firebase
//  */

//  import React, { Component } from 'react';
//  import { Link } from 'react-router-dom';
//  import { withRouter } from 'react-router-dom';
 
//  const UserDashboardHeader = (props) => {
 
//     const {  location } = props
//     let pathname = location.pathname

//     return (  
//         <div className="card">
//             <div className="card-body">
//                 <ul className="nav nav-tabs nav-tabs-solid nav-justified">
//                     <li className="nav-item"><Link className={`nav-link ${pathname.includes('user-dashboard') ?"active" :""}`} to="/app/administrator/user-dashboard">Dashboard</Link></li>
//                     <li className="nav-item"><Link className={`nav-link ${pathname.includes('user-all-jobs') ?"active" :""}`} to="/app/administrator/user-all-jobs">All </Link></li>
//                     <li className="nav-item"><Link className={`nav-link ${pathname.includes('saved-jobs') ?"active" :""}`} to="/app/administrator/saved-jobs">Saved</Link></li>
//                     <li className="nav-item"><Link className={`nav-link ${pathname.includes('applied-jobs') ?"active" :""}`} to="/app/administrator/applied-jobs">Applied</Link></li>
//                     <li className="nav-item"><Link className={`nav-link ${pathname === ('/app/administrator/interviewing') 
//                     ||pathname.includes('job-aptitude') || pathname.includes('questions') ?"active" :""}`} to="/app/administrator/interviewing">Interviewing</Link></li>
//                     <li className="nav-item"><Link className={`nav-link ${pathname.includes('offered-jobs') ?"active" :""}`} to="/app/administrator/offered-jobs">Offered</Link></li>
//                     <li className="nav-item"><Link className={`nav-link ${pathname.includes('visited-jobs') ?"active" :""}`} to="/app/administrator/visited-jobs">Visitied </Link></li>
//                     <li className="nav-item"><Link className={`nav-link ${pathname.includes('archived-jobs') ?"active" :""}`} to="/app/administrator/archived-jobs">Archived </Link></li>
//                 </ul>
//             </div>
//         </div>
//     )
//  }
 
//  export default withRouter(UserDashboardHeader);
 

import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const UserDashboardHeader = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="card">
      <div className="card-body">
        <ul className="nav nav-tabs nav-tabs-solid nav-justified">
          <li className="nav-item">
            <NavLink className="nav-link" to="/app/administrator/user-dashboard" isActive={(match, location) =>
              location.pathname.includes('user-dashboard')}
            >
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/app/administrator/user-all-jobs" isActive={(match, location) =>
              location.pathname.includes('user-all-jobs')}
            >
              All
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/app/administrator/saved-jobs" isActive={(match, location) =>
              location.pathname.includes('saved-jobs')}
            >
              Saved
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/app/administrator/applied-jobs" isActive={(match, location) =>
              location.pathname.includes('applied-jobs')}
            >
              Applied
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/app/administrator/interviewing"
              isActive={(match, location) =>
                location.pathname === '/app/administrator/interviewing' ||
                location.pathname.includes('job-aptitude') ||
                location.pathname.includes('questions')
              }
            >
              Interviewing
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/app/administrator/offered-jobs" isActive={(match, location) =>
              location.pathname.includes('offered-jobs')}
            >
              Offered
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/app/administrator/visited-jobs" isActive={(match, location) =>
              location.pathname.includes('visited-jobs')}
            >
              Visited
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/app/administrator/archived-jobs" isActive={(match, location) =>
              location.pathname.includes('archived-jobs')}
            >
              Archived
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserDashboardHeader;
