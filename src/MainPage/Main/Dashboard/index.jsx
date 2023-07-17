/**
 * Crm Routes
 */
/* eslint-disable */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Admindashboard from './admindashboard';
import Employeedashboard from './employeedashboard';

const DashboardRoute = ({ match }) => (
   <Routes>
      <Navigate exact from={`${match.url}/`} to={`${match.url}/dashboard`} />
      <Route path={`${match.url}/dashboard`} component={Admindashboard} />
      <Route path={`${match.url}/employee-dashboard`} component={Employeedashboard} />
   </Routes>
  
);

export default DashboardRoute;
