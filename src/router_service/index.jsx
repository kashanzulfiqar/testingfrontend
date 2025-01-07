import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Recruitment from '../MainPage/Recruitment';
import Jobs from '../MainPage/Recruitment/Jobs';
import JobDetails from '../MainPage/Recruitment/JobDetails';
import EditJob from '../MainPage/Recruitment/EditJob';

const RouterService = () => {
  return (
    <Routes>
      <Route path="/recruitment" element={<Recruitment />}>
        <Route index element={<Navigate to="jobs" replace />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:jobId" element={<JobDetails />} />
        <Route path="jobs/:jobId/edit" element={<EditJob />} />
      </Route>
    </Routes>
  );
};

export default RouterService;