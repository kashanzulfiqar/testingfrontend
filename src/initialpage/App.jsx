import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Entryfile/features/users.jsx";

const LoginPage = lazy(() => import("./loginpage"));
const RegistrationPage = lazy(() => import("./RegistrationPage"));
const ForgotPassword = lazy(() => import("./forgotpassword"));
const OTP = lazy(() => import("./otp"));
const LockScreen = lazy(() => import("./lockscreen"));
const ApplyJobs = lazy(() => import("./ApplyJob"));
const DefaultLayout = lazy(() => import("./Sidebar/DefaultLayout"));
const Settinglayout = lazy(() => import("./Sidebar/Settinglayout"));
const Tasklayout = lazy(() => import("./Sidebar/tasklayout"));
const Emaillayout = lazy(() => import("./Sidebar/emaillayout"));
const Chatlayout = lazy(() => import("./Sidebar/chatlayout"));
const Uicomponents = lazy(() => import("../MainPage/UIinterface/components"));
const Error404 = lazy(() => import("../MainPage/Pages/ErrorPage/error404"));
const Error500 = lazy(() => import("../MainPage/Pages/ErrorPage/error500"));
const AllEmployees = lazy(() => import("../MainPage/Employees/Employees/allemployees"));
import RequireAuth from "../router_service/RequireAuth";
const LeaveAdmin = lazy(() => import("../MainPage/Employees/Employees/leave_admin"));
const AdminDashboard = lazy(() => import("../MainPage/Main/Dashboard/admindashboard"));
const EmployeeDashboard = lazy(() => import("../MainPage/Main/Dashboard/employeedashboard"));
const Sidebar = lazy(() => import("./Sidebar/sidebar"));
const Header = lazy(() => import("./Sidebar/header"));
const Layout = lazy(() => import("../SidebarLayout/Layout"));
const ResetPassword = lazy(() => import("./ResetPassword"));
const Employeeslist = lazy(() => import("../MainPage/Employees/Employees/employeeslist"));
const Settings = lazy(() => import("../MainPage/Administration/Settings/companysettings"));
const RolePermisson = lazy(() => import("../MainPage/Administration/Settings/rolespermission"));
import "antd/dist/antd.css";
const EmployeeProfile = lazy(() => import("../MainPage/Pages/Profile/employeeprofile"));
const Holidays = lazy(() => import("../MainPage/Employees/Employees/holidays"));
const LeaveEmployee = lazy(() => import("../MainPage/Employees/Employees/leaveemployee"));
const Timesheet = lazy(() => import("../MainPage/Employees/Employees/timesheet"));
const AttendanceEmployee = lazy(() => import("../MainPage/Employees/Employees/attendanceemployee"));
const AttendanceAdmin = lazy(() => import("../MainPage/Employees/Employees/attendanceadmin"));
const ChangePassword = lazy(() => import("../MainPage/Administration/Settings/changepassword"));
const LandingPage = lazy(() => import("../LandingPage"));
const SalarySlip = lazy(() => import("../MainPage/HR/Payroll/SalarySlip"));
const PayrollHistory = lazy(() => import("../MainPage/HR/Payroll/PayrollHistory"));
const EmployeeSalary = lazy(() => import("../MainPage/HR/Payroll/employeesalary"));
const Projects = lazy(() => import("../MainPage/Employees/Projects/projects"));
const ProjectView = lazy(() => import("../MainPage/Employees/Projects/projectview"));
const ProjectList = lazy(() => import("../MainPage/Employees/Projects/projectlist"));
const Clients = lazy(() => import("../MainPage/Employees/clients"));
const ClientsList = lazy(() => import("../MainPage/Employees/clientslist"));
const ClientProfile = lazy(() => import("../MainPage/Pages/Profile/clientprofile"));
const ClientLogin = lazy(() => import("./ClientLogin"));
const FocalProfile = lazy(() => import("../MainPage/Pages/Profile/FocalProfile"));
const Invoices = lazy(() => import("../MainPage/HR/Sales/invoice"));
const Invoicecreate = lazy(() => import("../MainPage/HR/Sales/invoicecreate"));
const Invoiceview = lazy(() => import("../MainPage/HR/Sales/invoiceview"));
const EditInvoice = lazy(() => import("../MainPage/HR/Sales/EditInvoice"));
const Payments = lazy(() => import("../MainPage/HR/Sales/payments"));
const Expenses = lazy(() => import("../MainPage/HR/Sales/expense"));
const Tasks = lazy(() => import("../MainPage/Employees/Projects/Tasks"));
const ProfitLoss = lazy(() => import("../MainPage/HR/Sales/ProfitLoss"));
const ViewPL = lazy(() => import("../MainPage/HR/Sales/ViewProfitLoss"));
const EmployeeTimesheet = lazy(() => import("../MainPage/Employees/Employees/EmployeeTimesheet"));
const AdminTimeSheet = lazy(() => import("../MainPage/Employees/Employees/timesheetAdmin"));
const ViewDetailTimesheet = lazy(() => import("../MainPage/Employees/Employees/ViewDetailTimesheet"));
const AttendanceReport = lazy(() => import("../MainPage/HR/Reports/attendancereport"));
const EmployeesReport = lazy(() => import("../MainPage/HR/Reports/EmployeesReport"));
const TaskBoard = lazy(() => import("../MainPage/Employees/Projects/taskboard"));
const TaskBoardList = lazy(() => import("../MainPage/Employees/Projects/taskboardlist"));
const ResourceAllocation = lazy(() => import("../MainPage/Employees/Employees/resourceAllocation"));
const ResourceAllocationDetails = lazy(() => import("../MainPage/Employees/Employees/allocationDetails"));
const Leads = lazy(() => import("../MainPage/Employees/leades"));
const GitBook = lazy(() => import("../MainPage/Administration/Settings/GitBook"));
const Query = lazy(() => import("../MainPage/Administration/Settings/Query"));
const AdminLogin = lazy(() => import("./AdminLogin"));
const SuperAdminMain = lazy(() => import("../MainPage/Main/Dashboard/superadminMain"));
const ContactUs = lazy(() => import("../LandingPage/contactForm"));
const Demo = lazy(() => import("../LandingPage/demo"));
const AdminResetPassword = lazy(() => import("./AdminReset"));
const AdminForgot = lazy(() => import("./Forgot-Admin"));
const DisabledCompanies = lazy(() => import("../MainPage/SuperAdmin/disbaledCompanies"));
const LeadsDetails = lazy(() => import("../MainPage/Employees/leadsDetails"));
const LeadReport = lazy(() => import("../MainPage/HR/Reports/leadreport"));
const ClientReport = lazy(() => import("../MainPage/HR/Reports/clientreport"));
const PrivacyPolicy = lazy(() => import("../LandingPage/privacyPolicy"));
const RefundPolicy = lazy(() => import("../LandingPage/refundPolicy"));
const TermsAndConditions = lazy(() => import("../LandingPage/TermsConditions"));
const ClientForgotPassword = lazy(() => import("./ClientForgotPassword"));
const ClientResetPassword = lazy(() => import("./ClientResetPassword"));
const Recruitment = lazy(() => import("../MainPage/Recruitment"));
const RecruitmentLayout = lazy(() => import('../MainPage/Recruitment/RecruitmentLayout'));
const RecruitmentDashboard = lazy(() => import('../MainPage/Recruitment/Dashboard'));
const Jobs = lazy(() => import('../MainPage/Recruitment/Jobs'));
const JobDetails = lazy(() => import("../MainPage/Recruitment/JobDetails"));
const EditJob = lazy(() => import("../MainPage/Recruitment/EditJob"));
const Interviews = lazy(() => import('../MainPage/Recruitment/Interviews'));
const PublicInterviewPage = lazy(() => import('../MainPage/Recruitment/PublicInterviewPage'));
const TaskDetails = lazy(() => import("../MainPage/Employees/Projects/taskDetail.jsx"));
const PaymentSetup = lazy(() => import("../MainPage/Pages/Payment/PaymentSetup"));
const Billing = lazy(() => import("../MainPage/Pages/Billing/Billing.jsx"));
const BillingHistory = lazy(() => import("../MainPage/Pages/Billing/BillingHistory.jsx"));

const App = () => {
  const loginState = useSelector((state) => state.user.loginvalue);
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Add cross-tab logout listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "logout" && e.newValue) {
        try {
          // Parse the logout data
          const logoutData = JSON.parse(e.newValue);
          const loggedOutUser = logoutData.userId;
          const currentUser = loginState?.user?._id || loginState?.email;

          // Only logout if it's the same user
          if (loggedOutUser === currentUser) {
            localStorage.clear();
            sessionStorage.clear();
            dispatch(logout());
            const currentOrigin = window?.location?.origin;
            window.history.replaceState(null, null, `${currentOrigin}/login`);
            window.location.reload();
          }
        } catch (error) {
          console.error("Error handling logout event:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch, nav, loginState]);

  useEffect(() => {
    // console.log('loc--------',location.pathname);
    if (!loginState) {
      // nav('/login');
    }
    if (
      (location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/client/login" ||
        location.pathname === "/login/:email/:token" ||
        location.pathname === "/forget-password" ||
        location.pathname === "/reset-password/:id" ||
        location.pathname === "/register") &&
      loginState
    ) {
      // nav('/employee/dashboard');
    }
  }, []);

  useEffect(() => {
    if (location?.pathname !== "/profile/employee-profile") {
      localStorage.removeItem("allDataLocal");
    }
    if (location?.pathname !== "/admin-timesheet/details") {
      localStorage.removeItem("allDataLocalStorage");
    }
  }, [location]);

  return (
    <div>
      <Suspense fallback={<div />}> 
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/live-demo" element={<Demo />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route
          path="/client/forgot-password"
          element={<ClientForgotPassword />}
        />
        <Route
          path="/client/reset-password/:token"
          element={<ClientResetPassword />}
        />
        <Route path="/login/:email/:token" element={<LoginPage />} />
        <Route path="/forget" element={<AdminForgot />} />
        <Route path="/forget-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset/:token" element={<AdminResetPassword />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path={`/change-password`} element={<ChangePassword />} />
        {/* <Route path="/app/*" element={<DefaultLayout />} /> */}

        {/* Protected Routes */}
        {/* <Route element={<Layout />}> */}
        <Route
          path="/"
          element={
            <>
              <RequireAuth />{" "}
            </>
          }
        >
          {/* <Route> */}
          {/* dashboard */}
          <Route
            path={`/restricted`}
            element={
              <Navigate
                to={
                  loginState?.user?.role === "admin"
                    ? `/main/dashboard`
                    : `/employee/dashboard`
                }
              />
            }
          />
          <Route path={`super-admin/dashboard`} element={<SuperAdminMain />} />
          <Route
            path={`super-admin/disabled-companies`}
            element={<DisabledCompanies />}
          />
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
          <Route
            path={`/profile/employee-profile/:id`}
            element={<EmployeeProfile />}
          />
          <Route path={`/profile`} element={<EmployeeProfile />} />
          <Route path={`payroll/payslip`} element={<SalarySlip />} />
          <Route
            path={`payroll/payroll-histroy`}
            element={<PayrollHistory />}
          />
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
          <Route
            path={`admin-timesheet/details`}
            element={<ViewDetailTimesheet />}
          />
          <Route path={`employee-report`} element={<EmployeesReport />} />
          <Route
            path={`employee/resource-allocation`}
            element={<ResourceAllocation />}
          />
          <Route
            path={`/resource-allocation/details`}
            element={<ResourceAllocationDetails />}
          />
          <Route path={`/leads`} element={<Leads />} />
          <Route path={`/leads-details`} element={<LeadsDetails />} />
          <Route path={`/leads-details`} element={<LeadsDetails />} />
          <Route path={`/documentation`} element={<GitBook />} />
          <Route path={`/report-problem`} element={<Query />} />

          {/* Settings  */}
          <Route path="/settings" element={<Settings />} />
          {/* <Route path="/settings/roles-permissions" element={<RolePermisson />} /> */}

          {/* Billing  */}
          <Route path="/subscription-details" element={<Billing />} />

          {/* Billing History  */}
          <Route path="/invoice-history" element={<BillingHistory />} />

          <Route
            path="/employee/attendance-employee"
            element={<AttendanceEmployee />}
          />
          <Route
            path="/employee/attendance-admin"
            element={<AttendanceAdmin />}
          />

          {/* Payrolls */}
          <Route path="/payroll/current-payroll" element={<EmployeeSalary />} />

          {/* Projects */}
          <Route path="/projects/project_dashboard" element={<Projects />} />
          <Route
            path="/projects/projects-view/:_id"
            element={<ProjectView />}
          />
          <Route path="/tasks/:_id" element={<TaskDetails />} />
          <Route path="/profit-loss/view" element={<ViewPL />} />

          <Route path="/attendance-report" element={<AttendanceReport />} />
          <Route path="/lead-report" element={<LeadReport />} />
          <Route path="/client-report" element={<ClientReport />} />
          <Route path="/recruitment/*" element={
            <RecruitmentLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/recruitment/dashboard" replace />} />
                <Route path="dashboard" element={<RecruitmentDashboard />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="jobs/:jobId" element={<JobDetails />} />
                <Route path="jobs/:jobId/edit" element={<EditJob />} />
                <Route path="candidates" element={<div>Candidates Page</div>} />
                <Route path="interviews" element={<Interviews />} />
                <Route path="offers" element={<div>Offers Page</div>} />
                <Route path="settings" element={<div>Settings Page</div>} />
              </Routes>
            </RecruitmentLayout>
          } />

          {/* <Link to={`/projects/projects-view/${record?._id}`} style={{color: '#333333'}}>
          <label style={{cursor: 'pointer'}} className="longText">{text}</label>
        </Link> */}

          {/* Add payment setup route */}
          <Route path={`client/focal-profile`} element={<FocalProfile />} />
          <Route path={`invoices`} element={<Invoices />} />
          <Route path={`invoices/create-invoice`} element={<Invoicecreate />} />
          <Route path={`invoices/edit-invoice`} element={<EditInvoice />} />
          <Route path={`invoices/view-invoice`} element={<Invoiceview />} />
          <Route path={`payment/setup`} element={<PaymentSetup />} />
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
      </Suspense>

      {/* {loginState &&
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
