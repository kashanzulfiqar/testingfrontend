import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import LoginPage from './loginpage';
import RegistrationPage from './RegistrationPage';
import ForgotPassword from './forgotpassword';
import OTP from './otp';
import LockScreen from './lockscreen';
import ApplyJobs from './ApplyJob';
import DefaultLayout from './Sidebar/DefaultLayout';
import Settinglayout from './Sidebar/Settinglayout';
import Tasklayout from './Sidebar/tasklayout';
import Emaillayout from './Sidebar/emaillayout';
import Chatlayout from './Sidebar/chatlayout';
import Uicomponents from '../MainPage/UIinterface/components';
import Error404 from '../MainPage/Pages/ErrorPage/error404';
import Error500 from '../MainPage/Pages/ErrorPage/error500';
import AllEmployees from '../MainPage/Employees/Employees/allemployees';
import RequireAuth from '../router_service/RequireAuth';
import LeaveAdmin from '../MainPage/Employees/Employees/leave_admin';
import AdminDashboard from '../MainPage/Main/Dashboard/admindashboard';
import EmployeeDashboard from '../MainPage/Main/Dashboard/employeedashboard';
import Sidebar from './Sidebar/sidebar';
import Header from './Sidebar/header';
import { useSelector } from 'react-redux';
import Layout from '../SidebarLayout/Layout';
import ResetPassword from './ResetPassword';
import Employeeslist from '../MainPage/Employees/Employees/employeeslist';
import Settings from '../MainPage/Administration/Settings/companysettings';
import RolePermisson from '../MainPage/Administration/Settings/rolespermission';
import 'antd/dist/antd.css';
import EmployeeProfile from '../MainPage/Pages/Profile/employeeprofile';
import Holidays from '../MainPage/Employees/Employees/holidays';
import LeaveEmployee from '../MainPage/Employees/Employees/leaveemployee';
import Timesheet from '../MainPage/Employees/Employees/timesheet';
import AttendanceEmployee from '../MainPage/Employees/Employees/attendanceemployee';
import AttendanceAdmin from '../MainPage/Employees/Employees/attendanceadmin';
import ChangePassword from '../MainPage/Administration/Settings/changepassword';
import LandingPage from '../LandingPage';
import SalarySlip from '../MainPage/HR/Payroll/SalarySlip';
import PayrollHistory from '../MainPage/HR/Payroll/PayrollHistory';
import EmployeeSalary from '../MainPage/HR/Payroll/employeesalary';
import Projects from '../MainPage/Employees/Projects/projects';
import ProjectView from '../MainPage/Employees/Projects/projectview';
import ProjectList from '../MainPage/Employees/Projects/projectlist';
import Clients from '../MainPage/Employees/clients';
import ClientsList from '../MainPage/Employees/clientslist';
import ClientProfile from '../MainPage/Pages/Profile/clientprofile';
import ClientLogin from './ClientLogin';
import FocalProfile from '../MainPage/Pages/Profile/FocalProfile';
import Invoices from '../MainPage/HR/Sales/invoice';
import Invoicecreate from '../MainPage/HR/Sales/invoicecreate';
import Invoiceview from '../MainPage/HR/Sales/invoiceview';
import EditInvoice from '../MainPage/HR/Sales/EditInvoice';
import Payments from '../MainPage/HR/Sales/payments';
import Expenses from '../MainPage/HR/Sales/expense';
import Tasks from '../MainPage/Employees/Projects/Tasks';
import ProfitLoss from '../MainPage/HR/Sales/ProfitLoss';
import ViewPL from '../MainPage/HR/Sales/ViewProfitLoss';
import EmployeeTimesheet from '../MainPage/Employees/Employees/EmployeeTimesheet';
import AdminTimeSheet from '../MainPage/Employees/Employees/timesheetAdmin';
import ViewDetailTimesheet from '../MainPage/Employees/Employees/ViewDetailTimesheet';
import AttendanceReport from '../MainPage/HR/Reports/attendancereport';
import EmployeesReport from '../MainPage/HR/Reports/EmployeesReport';
import TaskBoard from '../MainPage/Employees/Projects/taskboard';
import TaskBoardList from '../MainPage/Employees/Projects/taskboardlist';
import ResourceAllocation from '../MainPage/Employees/Employees/resourceAllocation';
import ResourceAllocationDetails from '../MainPage/Employees/Employees/allocationDetails';
import Leads from '../MainPage/Employees/leades';
import GitBook from '../MainPage/Administration/Settings/GitBook';
import Query from '../MainPage/Administration/Settings/Query';
import AdminLogin from './AdminLogin';
import SuperAdminMain from '../MainPage/Main/Dashboard/superadminMain';
import ContactUs from '../LandingPage/contactForm';
import Demo from '../LandingPage/demo';


const App = () => {
  const login = useSelector((state) => state.user.loginvalue);
  const nav = useNavigate();
  const location = useLocation();
  //   useEffect(() => {
  //     if (
  //       location.pathname.includes('login') ||
  //       location.pathname.includes('register') ||
  //       location.pathname.includes('forgotpassword') ||
  //       location.pathname.includes('otp') ||
  //       location.pathname.includes('lockscreen')
  //     ) {
  //       // $('body').addClass('account-page');
  //     } else if (
  //       location.pathname.includes('error-404') ||
  //       location.pathname.includes('error-500')
  //     ) {
  //       $('body').addClass('error-page');
  //     }
  //   }, []);

  

  useEffect(() => {
    // console.log('loc--------',location.pathname);
    if (!login) {
      // nav('/login');
    }
    if ((location.pathname === '/' || location.pathname === '/login' || location.pathname === '/client/login' || location.pathname === '/login/:email/:token' 
    || location.pathname === '/forget-password' || location.pathname === '/reset-password/:id'
    || location.pathname === '/register') && login)
    {
      // nav('/employee/dashboard');
    }
  }, []);

  useEffect(() => {
    if(location?.pathname !== "/profile/employee-profile"){
      localStorage.removeItem('allDataLocal');
    }
    if(location?.pathname !== "/admin-timesheet/details"){
      localStorage.removeItem('allDataLocalStorage')
    }
  }, [location])


  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/live-demo" element={<Demo />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/login/:email/:token" element={<LoginPage />} />
        <Route path="/forget-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* <Route path="/app/*" element={<DefaultLayout />} /> */}

        {/* <Route element={<Layout />}> */}
        <Route path="/" element={<><RequireAuth /> </>}>
          {/* <Route> */}
          {/* dashboard */}
          <Route path={`/restricted`} element={<Navigate to={login?.user?.role === 'admin' ? `/main/dashboard` : `/employee/dashboard`} />} />
          <Route path={`super-admin/dashboard`} element={<SuperAdminMain />} />
          <Route path={`main/dashboard`} element={<AdminDashboard />} />
          <Route path={`employee/dashboard`} element={<EmployeeDashboard />} />

          {/* Employee */}
          <Route path={`employee/allemployees`} element={<AllEmployees />} />
          <Route path={`task-board/:id`} element={<TaskBoard />} />
          <Route path={`task-board`} element={<TaskBoardList />} />
          <Route path={`employee/allemployees`} element={<AllEmployees />} />
          <Route path={`employee/employees-list`} element={<Employeeslist />} />
          <Route path={`employee/holidays`} element={<Holidays />} />
          <Route path={`employee/requests`} element={<LeaveEmployee />} />
          <Route path={`employee/request-admin`} element={<LeaveAdmin />} />
          <Route path={`employee/request-admin/:id`} element={<LeaveAdmin />} />
          <Route path={`employee/timesheet`} element={<Timesheet />} />
          <Route path={`/profile/employee-profile`} element={<EmployeeProfile />} />
          <Route path={`/profile`} element={<EmployeeProfile />} />
          <Route path={`/change-password`} element={<ChangePassword />} />
          <Route path={`payroll/payslip`} element={<SalarySlip />} />
          <Route path={`payroll/payroll-histroy`} element={<PayrollHistory />} />
          <Route path={`clients`} element={<Clients />} />
          <Route path={`clients-list`} element={<ClientsList />} />
          <Route path={`client/client-profile`} element={<ClientProfile />} />
          <Route path={`client/focal-profile`} element={<FocalProfile />} />
          <Route path={`invoices`} element={<Invoices />} />
          <Route path={`invoices/create-invoice`} element={<Invoicecreate />} />
          <Route path={`invoices/edit-invoice`} element={<EditInvoice />} />
          <Route path={`invoices/view-invoice`} element={<Invoiceview />} />
          <Route path={`payments`} element={<Payments />} />
          <Route path={`expenses`} element={<Expenses />} />
          <Route path={`profit-loss`} element={<ProfitLoss />} />
          <Route path={`projects/tasks`} element={<Tasks />} />
          <Route path={`employee-timesheet`} element={<EmployeeTimesheet />} />
          <Route path={`admin-timesheet`} element={<AdminTimeSheet />} />
          <Route path={`admin-timesheet/details`} element={<ViewDetailTimesheet />} />
          <Route path={`employee-report`} element={<EmployeesReport />} />
          <Route path={`employee/resource-allocation`} element={<ResourceAllocation />} />
          <Route path={`/resource-allocation/details`} element={<ResourceAllocationDetails />} />
          <Route path={`/leads`} element={<Leads />} />
          <Route path={`/documentation`} element={<GitBook />} />
          <Route path={`/report-problem`} element={<Query />} />

          {/* Settings  */}
          <Route path="/settings" element={<Settings />} />
          {/* <Route path="/settings/roles-permissions" element={<RolePermisson />} /> */}

          {/* Settings  */}
          <Route path="/employee/attendance-employee" element={<AttendanceEmployee />} />
          <Route path="/employee/attendance-admin" element={<AttendanceAdmin />} />

          {/* Payrolls */}
          <Route path="/payroll/current-payroll" element={<EmployeeSalary />} />

          {/* Projects */}
          <Route path="/projects/project_dashboard" element={<Projects />} />
          <Route path="/projects/projects-view/:_id" element={<ProjectView />} />
          <Route path="/profit-loss/view" element={<ViewPL />} />

          <Route path="/attendance-report" element={<AttendanceReport />} />

          {/* <Link to={`/projects/projects-view/${record?._id}`} style={{color: '#333333'}}>
          <label style={{cursor: 'pointer'}} className="longText">{text}</label>
        </Link> */}


        </Route>
        
        {/* <Route path="/404" element={<Error404 />}></Route> */}
        <Route path="*" element={<Error404 />}></Route>

        {/* </Route> */}
        {/* </Route> */}

        {/* <Route path="/settings/*" element={<Settinglayout />} /> */}
        {/* <Route path="/tasks/*" element={<Tasklayout />} />
        <Route path="/email/*" element={<Emaillayout />} />
        <Route path="/conversation/*" element={<Chatlayout />} />

        <Route path="/ui-components" element={<Uicomponents />} />
        <Route path="/error-404" element={<Error404 />} />
        <Route path="/error-500" element={<Error500 />} /> */}
      </Routes>

      {/* {login &&
        !location.pathname.includes('/login') &&
        !location.pathname.includes('/login/:id') &&
        !location.pathname.includes('/forget-password') &&
        !location.pathname.includes('/reset-password/:id') &&
        !location.pathname.includes('/register') && (
          <div className={`main-wrapper ${menu ? 'slide-nav' : ''}`}>
            <Header onMenuClick={toggleMobileMenu} />
            <Sidebar />
          </div>
        )} */}
    </div>
  );
};

export default App;
