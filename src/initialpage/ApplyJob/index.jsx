/**
 * Crm Routes
 */
/* eslint-disable */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import JobsList from './JobsList';
import Jobdetails from './jobdetails';

const JobRoute = ({ match }) => (
   <div className="dashboard-wrapper">
      <Routes>
         <Navigate exact from={`${match.url}/`} to={`${match.url}/joblist`} />
         <Route path={`${match.url}/joblist`} component={JobsList} />
         <Route path={`${match.url}/jobdetail`} component={Jobdetails} />
      </Routes>
   </div>
);

export default JobRoute;
