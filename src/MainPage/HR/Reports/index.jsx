/**
 * Crm Routes
 */
/* eslint-disable */
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ExpenseReport from "./expensereport";
import Invoicereport from "./invoicereport";
import PaymentReport from "./paymentreport";
import ProjectReport from "./projectreport";
import TaskReport from "./taskreport";
import UserReport from "./userreport";
import EmployeeReport from "./employeereport";
import PayslipReport from "./payslipreport";
import AttendanceReport from "./attendancereport";
import LeaveReport from "./leavereport";
import DailyReport from "./dailyreport";
import LeadReport from "./leadreport";

const ReportsRoute = () => (
  <Routes>
    <Route path="/expense-reports" element={<ExpenseReport />} />
    <Route path="/invoice-reports" element={<Invoicereport />} />
    <Route path="/payments-reports" element={<PaymentReport />} />
    <Route path="/project-reports" element={<ProjectReport />} />
    <Route path="/task-reports" element={<TaskReport />} />
    <Route path="/user-reports" element={<UserReport />} />
    <Route path="/employee-reports" element={<EmployeeReport />} />
    <Route path="/payslip-reports" element={<PayslipReport />} />
    <Route path="/attendance-report" element={<AttendanceReport />} />
    <Route path="/leave-reports" element={<LeaveReport />} />
    <Route path="/daily-reports" element={<DailyReport />} />
    <Route path="/lead-report" element={<LeadReport />} />
  </Routes>
);

export default ReportsRoute;
