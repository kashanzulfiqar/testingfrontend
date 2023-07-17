/**
 * Tables Routes
 */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Forms from "./Forms"
import Tables from "./Tables"


const Uiinterfaceroute = ({ match }) => (
    <Routes>
        <Navigate exact from={`${match.url}/`} to={`${match.url}/basic`} />
        <Route path={`${match.url}/forms`} component={Forms} />
        <Route path={`${match.url}/tables`} component={Tables} />
    </Routes>
);

export default Uiinterfaceroute;
