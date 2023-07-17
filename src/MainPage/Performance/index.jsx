/**
 * Tables Routes
 */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Promotion from "./promotion"
import Resignation from "./resignation"
import Termination from "./termination"

const Performanceroute = ({ match }) => (
    <Routes>
        <Navigate exact from={`${match.url}/`} to={`${match.url}/promotion`} />
        <Route path={`${match.url}/promotion`} component={Promotion} />
        <Route path={`${match.url}/resignation`} component={Resignation} />
        <Route path={`${match.url}/termination`} component={Termination} />
    </Routes>
);

export default Performanceroute;
