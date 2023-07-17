/**
 * Crm Routes
 */
/* eslint-disable */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AllEmployees from './allemployees';
import AllEmployeesList from './employeeslist';
import Holidays from './holidays';
import LeaveAdmin from './leave_admin';
import LeaveEmployee from './leaveemployee';
import Leavesetting from './leavesettings';
import AttendanceAdmin from './attendanceadmin';
import AttendanceEmployee from './attendanceemployee';
import Department from './department';
import Designation from './designation';
import Timesheet from './timesheet';
import Overtime from './overtime';
import ShiftScheduling from './shiftscheduling';
import ShiftList from './shiftlist';
import AuthRoute from '../../../hooks/useAuth';

const EmployeesRoute = ({ match }) => (
   <Routes>
      {console.log('hello=======')}
      {/* <Navigate exact from={`${match.url}/`} to={`${match.url}/allemployees`} /> */}
      {/* <AuthRoute exact
          path={`${match.url}/allemployees`} element={<AllEmployees />}
          isAuthenticated={false}
          /> */}
      <Route path={`${match.url}/allemployees`} element={<AllEmployees />} />
      <Route path={`${match.url}/employees-list`} element={<AllEmployeesList />} />
      <Route path={`${match.url}/holidays`} component={Holidays} />
      <Route path={`${match.url}/leaves-admin`} component={LeaveAdmin} />
      <Route path={`${match.url}/leaves-employee`} component={LeaveEmployee} />
      <Route path={`${match.url}/leave-settings`} component={Leavesetting} />
      <Route path={`${match.url}/attendance-admin`} component={AttendanceAdmin} />
      <Route path={`${match.url}/attendance-employee`} component={AttendanceEmployee} />
      <Route path={`${match.url}/departments`} component={Department} />
      <Route path={`${match.url}/designations`} component={Designation} />
      <Route path={`${match.url}/timesheet`} component={Timesheet} />
      <Route path={`${match.url}/overtime`} component={Overtime} />
      <Route path={`${match.url}/shift-scheduling`} component={ShiftScheduling} />
      <Route path={`${match.url}/shift-list`} component={ShiftList} />
   </Routes>
);

export default EmployeesRoute;
