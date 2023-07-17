/**
 * Crm Routes
 */
/* eslint-disable */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import EmployeeSalary from './employeesalary';
import Payrollitem from './payrollitem';
import Payslip from './payslip';

const ReportsRoute = ({ match }) => (
   <Routes>
      <Navigate exact from={`${match.url}/`} to={`${match.url}/_salary`} />
      <Route path={`${match.url}/_salary`} component={EmployeeSalary} />
      <Route path={`${match.url}/payroll-items`} component={Payrollitem} />
      <Route path={`${match.url}/salary-view`} component={Payslip} />
   </Routes>
);

export default ReportsRoute;
