/**
 * Tables Routes
 */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import EmployeeProfile from "./employeeprofile"
import ClientProfile from "./clientprofile"
import UserAssets from './userassets';



const subscriptionroute = ({ match }) => (
    <Routes>
        <Navigate exact from={`${match.url}/`} to={`${match.url}/employee-profile`} />
        <Route path={`${match.url}/employee-profile`} component={EmployeeProfile} />
        <Route path={`${match.url}/client-profile`} component={ClientProfile} />
        <Route path={`${match.url}/userassets`} component={UserAssets} />

        
    </Routes>
);

export default subscriptionroute;
