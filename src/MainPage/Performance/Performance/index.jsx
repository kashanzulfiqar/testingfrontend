/**
 * Tables Routes
 */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import PerformanceAppraisal from "./perappraisal"
import PerformanceIndicator from "./perindicator"
import PerformanceReview from "./perreview"

const Performanceroute = ({ match }) => (
    <Routes>
        <Navigate exact from={`${match.url}/`} to={`${match.url}/performance-appraisal`} />
        <Route path={`${match.url}/performance-appraisal`} component={PerformanceAppraisal} />
        <Route path={`${match.url}/performance-indicator`} component={PerformanceIndicator} />
        <Route path={`${match.url}/performance-review`} component={PerformanceReview} />
    </Routes>
);

export default Performanceroute;
