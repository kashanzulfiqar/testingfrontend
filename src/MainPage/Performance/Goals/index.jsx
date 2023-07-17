/**
 * Tables Routes
 */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import GoalList from "./goallist"
import GoalType from "./goaltype"

const Goalroute = ({ match }) => (
    <Routes>
        <Navigate exact from={`${match.url}/`} to={`${match.url}/goal-tracking`} />
        <Route path={`${match.url}/goal-tracking`} component={GoalList} />
        <Route path={`${match.url}/goal-type`} component={GoalType} />
    </Routes>
);

export default Goalroute;
