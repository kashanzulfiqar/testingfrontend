/**
 * Crm Routes
 */
/* eslint-disable */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Policies from './policies';

const ReportsRoute = ({ match }) => (
   <Routes>
      <Navigate exact from={`${match.url}/`} to={`${match.url}/policies`} />
      <Route path={`${match.url}/policies`} component={Policies} />
   </Routes>
);

export default ReportsRoute;
