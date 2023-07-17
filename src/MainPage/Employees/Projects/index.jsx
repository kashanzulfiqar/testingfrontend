/**
 * Crm Routes
 */
/* eslint-disable */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Projects from './projects';
import ProjectView from './projectview';
import ProjectList from './projectlist';
import Taskboard from './taskboard';

const ProjectRoute = ({ match }) => (
   <Routes>
      <Navigate exact from={`${match.url}/`} to={`${match.url}/project_dashboard`} />
      <Route path={`${match.url}/project_dashboard`} component={Projects} />
      <Route path={`${match.url}/projects-list`} component={ProjectList} />
      <Route path={`${match.url}/projects-view`} component={ProjectView} />
      <Route path={`${match.url}/task-board`} component={Taskboard} />
   </Routes>
);

export default ProjectRoute;
