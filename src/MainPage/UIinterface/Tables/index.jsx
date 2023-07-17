/**
 * Tables Routes
 */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import basictable from "./basic"
import datatable from "./data-table"


const Pages = ({ match }) => (
    <Routes>
        <Navigate exact from={`${match.url}/`} to={`${match.url}/basic`} />
        <Route path={`${match.url}/basic`} component={basictable} />
        <Route path={`${match.url}/data-table`} component={datatable} />
    </Routes>
);

export default Pages;
