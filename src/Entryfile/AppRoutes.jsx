import React, { Suspense } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./features/users.jsx";

const LoginPage = React.lazy(() => import("../initialpage/loginpage"));
const RegistrationPage = React.lazy(() => import("../initialpage/RegistrationPage"));
const ForgotPassword = React.lazy(() => import("../initialpage/forgotpassword"));
const OTP = React.lazy(() => import("../initialpage/otp"));
const LockScreen = React.lazy(() => import("../initialpage/lockscreen"));
const ApplyJobs = React.lazy(() => import("../initialpage/ApplyJob"));
const DefaultLayout = React.lazy(() => import("../initialpage/Sidebar/DefaultLayout"));
const Settinglayout = React.lazy(() => import("../initialpage/Sidebar/Settinglayout"));
const Tasklayout = React.lazy(() => import("../initialpage/Sidebar/tasklayout"));
const Emaillayout = React.lazy(() => import("../initialpage/Sidebar/emaillayout"));
const Chatlayout = React.lazy(() => import("../initialpage/Sidebar/chatlayout"));
const Uicomponents = React.lazy(() => import("../MainPage/UIinterface/components"));
const Error404 = React.lazy(() => import("../MainPage/Pages/ErrorPage/error404"));
const Error500 = React.lazy(() => import("../MainPage/Pages/ErrorPage/error500"));
const AllEmployees = React.lazy(() => import("../MainPage/Employees/Employees/allemployees"));
const RequireAuth = React.lazy(() => import("../router_service/RequireAuth"));
const LeaveAdmin = React.lazy(() => import("../MainPage/Employees/Employees/leave_admin"));
const AdminDashboard = React.lazy(() => import("../MainPage/Main/Dashboard/admindashboard"));
const EmployeeDashboard = React.lazy(() => import("../MainPage/Main/Dashboard/employeedashboard"));
const Sidebar = React.lazy(() => import("../initialpage/Sidebar/sidebar"));
const Header = React.lazy(() => import("../initialpage/Sidebar/header"));
const Layout = React.lazy(() => import("../SidebarLayout/Layout"));
const ResetPassword = React.lazy(() => import("../initialpage/ResetPassword"));
const Employeeslist = React.lazy(() => import("../MainPage/Employees/Employees/employeeslist"));
const Settings = React.lazy(() => import("../MainPage/Administration/Settings/companysettings"));
const RolePermisson = React.lazy(() => import("../MainPage/Administration/Settings/rolespermission"));
const EmployeeProfile = React.lazy(() => import("../MainPage/Pages/Profile/employeeprofile"));
const Holidays = React.lazy(() => import("../MainPage/Employees/Employees/holidays"));
const LeaveEmployee = React.lazy(() => import("../MainPage/Employees/Employees/leaveemployee"));
const Timesheet = React.lazy(() => import("../MainPage/Employees/Employees/timesheet"));
const AttendanceEmployee = React.lazy(() => import("../MainPage/Employees/Employees/attendanceemployee"));
const AttendanceAdmin = React.lazy(() => import("../MainPage/Employees/Employees/attendanceadmin"));
const ChangePassword = React.lazy(() => import("../MainPage/Administration/Settings/changepassword"));
const SalarySlip = React.lazy(() => import("../MainPage/HR/Payroll/SalarySlip"));
const PayrollHistory = React.lazy(() => import("../MainPage/HR/Payroll/PayrollHistory"));
const EmployeeSalary = React.lazy(() => import("../MainPage/HR/Payroll/employeesalary"));
const Projects = React.lazy(() => import("../MainPage/Employees/Projects/projects"));
const ProjectView = React.lazy(() => import("../MainPage/Employees/Projects/projectview"));
const ProjectList = React.lazy(() => import("../MainPage/Employees/Projects/projectlist"));
const Clients = React.lazy(() => import("../MainPage/Employees/clients"));
const ClientsList = React.lazy(() => import("../MainPage/Employees/clientslist"));
const ClientProfile = React.lazy(() => import("../MainPage/Pages/Profile/clientprofile"));
const ClientLogin = React.lazy(() => import("../initialpage/ClientLogin"));
const FocalProfile = React.lazy(() => import("../MainPage/Pages/Profile/FocalProfile"));
const Invoices = React.lazy(() => import("../MainPage/HR/Sales/invoice"));
const Invoicecreate = React.lazy(() => import("../MainPage/HR/Sales/invoicecreate"));
const Invoiceview = React.lazy(() => import("../MainPage/HR/Sales/invoiceview"));
const EditInvoice = React.lazy(() => import("../MainPage/HR/Sales/EditInvoice"));
const Payments = React.lazy(() => import("../MainPage/HR/Sales/payments"));
const Expenses = React.lazy(() => import("../MainPage/HR/Sales/expense"));
const Tasks = React.lazy(() => import("../MainPage/Employees/Projects/Tasks"));
const ProfitLoss = React.lazy(() => import("../MainPage/HR/Sales/ProfitLoss"));
const ViewPL = React.lazy(() => import("../MainPage/HR/Sales/ViewProfitLoss"));
const EmployeeTimesheet = React.lazy(() => import("../MainPage/Employees/Employees/EmployeeTimesheet"));
const AdminTimeSheet = React.lazy(() => import("../MainPage/Employees/Employees/timesheetAdmin"));
const ViewDetailTimesheet = React.lazy(() => import("../MainPage/Employees/Employees/ViewDetailTimesheet"));
const AttendanceReport = React.lazy(() => import("../MainPage/HR/Reports/attendancereport"));
const EmployeesReport = React.lazy(() => import("../MainPage/HR/Reports/EmployeesReport"));
const TaskBoard = React.lazy(() => import("../MainPage/Employees/Projects/taskboard"));
const TaskBoardList = React.lazy(() => import("../MainPage/Employees/Projects/taskboardlist"));
const ResourceAllocation = React.lazy(() => import("../MainPage/Employees/Employees/resourceAllocation"));
const ResourceAllocationDetails = React.lazy(() => import("../MainPage/Employees/Employees/allocationDetails"));
const Leads = React.lazy(() => import("../MainPage/Employees/leades"));
const GitBook = React.lazy(() => import("../MainPage/Administration/Settings/GitBook"));
const Query = React.lazy(() => import("../MainPage/Administration/Settings/Query"));
const AdminLogin = React.lazy(() => import("../initialpage/AdminLogin"));
const SuperAdminMain = React.lazy(() => import("../MainPage/Main/Dashboard/superadminMain"));
const AdminResetPassword = React.lazy(() => import("../initialpage/AdminReset"));
const AdminForgot = React.lazy(() => import("../initialpage/Forgot-Admin"));
const DisabledCompanies = React.lazy(() => import("../MainPage/SuperAdmin/disbaledCompanies"));
const LeadsDetails = React.lazy(() => import("../MainPage/Employees/leadsDetails"));
const LeadReport = React.lazy(() => import("../MainPage/HR/Reports/leadreport"));
// const ClientReport = React.lazy(() => import("../MainPage/HR/Reports/clientreport"));
const ClientForgotPassword = React.lazy(() => import("../initialpage/ClientForgotPassword"));
const ClientResetPassword = React.lazy(() => import("../initialpage/ClientResetPassword"));
const Recruitment = React.lazy(() => import("../MainPage/Recruitment"));
const RecruitmentLayout = React.lazy(() => import('../MainPage/Recruitment/RecruitmentLayout'));
const RecruitmentDashboard = React.lazy(() => import('../MainPage/Recruitment/Dashboard'));
const Jobs = React.lazy(() => import('../MainPage/Recruitment/Jobs'));
const JobDetails = React.lazy(() => import("../MainPage/Recruitment/JobDetails"));
const EditJob = React.lazy(() => import("../MainPage/Recruitment/EditJob"));
const Interviews = React.lazy(() => import('../MainPage/Recruitment/Interviews'));
const PublicInterviewPage = React.lazy(() => import('../MainPage/Recruitment/PublicInterviewPage'));
const TaskDetails = React.lazy(() => import("../MainPage/Employees/Projects/taskDetail.jsx"));
const PaymentSetup = React.lazy(() => import("../MainPage/Pages/Payment/PaymentSetup"));
const Billing = React.lazy(() => import("../MainPage/Pages/Billing/Billing.jsx"));
const BillingHistory = React.lazy(() => import("../MainPage/Pages/Billing/BillingHistory.jsx"));

const AppRoutes = () => {
  const loginState = useSelector((state) => state.user.loginvalue);
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  return (
    <div>
      <Routes>
        <Route path="/admin-login" element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLogin />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/client/login" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ClientLogin />
          </Suspense>
        } />
        <Route
          path="/client/forgot-password"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ClientForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/client/reset-password/:token"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ClientResetPassword />
            </Suspense>
          }
        />
        <Route path="/login/:email/:token" element={
          <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/forget" element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminForgot />
          </Suspense>
        } />
        <Route path="/forget-password" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ForgotPassword />
          </Suspense>
        } />
        <Route path="/reset-password/:token" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
          </Suspense>
        } />
        <Route path="/reset/:token" element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminResetPassword />
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<div>Loading...</div>}>
            <RegistrationPage />
          </Suspense>
        } />
        <Route path={`/change-password`} element={
          <Suspense fallback={<div>Loading...</div>}>
            <ChangePassword />
          </Suspense>
        } />

        <Route
          path="/"
          element={
            <>
              <Suspense fallback={<div>Loading...</div>}>
                <RequireAuth />
              </Suspense>
            </>
          }
        >
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
          <Route path={`super-admin/dashboard`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <SuperAdminMain />
            </Suspense>
          } />
          <Route
            path={`super-admin/disabled-companies`}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <DisabledCompanies />
              </Suspense>
            }
          />
          <Route path={`main/dashboard`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path={`employee/dashboard`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <EmployeeDashboard />
            </Suspense>
          } />

          <Route path={`employee/allemployees`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <AllEmployees />
            </Suspense>
          } />
          <Route path={`task-board/:id`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <TaskBoard />
            </Suspense>
          } />
          <Route path={`task-board`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <TaskBoardList />
            </Suspense>
          } />
          <Route path={`employee/employees-list`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Employeeslist />
            </Suspense>
          } />
          <Route path={`employee/holidays`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Holidays />
            </Suspense>
          } />
          <Route path={`employee/requests`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <LeaveEmployee />
            </Suspense>
          } />
          <Route path={`employee/request-admin`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <LeaveAdmin />
            </Suspense>
          } />
          <Route path={`employee/request-admin/:id`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <LeaveAdmin />
            </Suspense>
          } />
          <Route path={`employee/timesheet`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Timesheet />
            </Suspense>
          } />
          <Route
            path={`/profile/employee-profile/:id`}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <EmployeeProfile />
              </Suspense>
            }
          />
          <Route path={`/profile`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <EmployeeProfile />
            </Suspense>
          } />
          <Route path={`payroll/payslip`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <SalarySlip />
            </Suspense>
          } />
          <Route
            path={`payroll/payroll-histroy`}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <PayrollHistory />
              </Suspense>
            }
          />
          <Route path={`clients`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Clients />
            </Suspense>
          } />
          <Route path={`clients-list`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <ClientsList />
            </Suspense>
          } />
          <Route path={`client/client-profile`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <ClientProfile />
            </Suspense>
          } />
          <Route path={`client/focal-profile`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <FocalProfile />
            </Suspense>
          } />
          <Route path={`invoices`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Invoices />
            </Suspense>
          } />
          <Route path={`invoices/create-invoice`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Invoicecreate />
            </Suspense>
          } />
          <Route path={`invoices/edit-invoice`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <EditInvoice />
            </Suspense>
          } />
          <Route path={`invoices/view-invoice`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Invoiceview />
            </Suspense>
          } />
          <Route path={`payments`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Payments />
            </Suspense>
          } />
          <Route path={`expenses`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Expenses />
            </Suspense>
          } />
          <Route path={`profit-loss`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <ProfitLoss />
            </Suspense>
          } />
          <Route path={`projects/tasks`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Tasks />
            </Suspense>
          } />
          <Route path={`employee-timesheet`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <EmployeeTimesheet />
            </Suspense>
          } />
          <Route path={`admin-timesheet`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <AdminTimeSheet />
            </Suspense>
          } />
          <Route
            path={`admin-timesheet/details`}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ViewDetailTimesheet />
              </Suspense>
            }
          />
          <Route path={`employee-report`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <EmployeesReport />
            </Suspense>
          } />
          <Route
            path={`employee/resource-allocation`}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ResourceAllocation />
              </Suspense>
            }
          />
          <Route
            path={`/resource-allocation/details`}
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ResourceAllocationDetails />
              </Suspense>
            }
          />
          <Route path={`/leads`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Leads />
            </Suspense>
          } />
          <Route path={`/leads-details`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <LeadsDetails />
            </Suspense>
          } />
          <Route path={`/documentation`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <GitBook />
            </Suspense>
          } />
          <Route path={`/report-problem`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <Query />
            </Suspense>
          } />

          <Route path="/settings" element={
            <Suspense fallback={<div>Loading...</div>}>
              <Settings />
            </Suspense>
          } />

          <Route path="/subscription-details" element={
            <Suspense fallback={<div>Loading...</div>}>
              <Billing />
            </Suspense>
          } />

          <Route path="/invoice-history" element={
            <Suspense fallback={<div>Loading...</div>}>
              <BillingHistory />
            </Suspense>
          } />

          <Route
            path="/employee/attendance-employee"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <AttendanceEmployee />
              </Suspense>
            }
          />
          <Route
            path="/employee/attendance-admin"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <AttendanceAdmin />
              </Suspense>
            }
          />

          <Route path="/payroll/current-payroll" element={
            <Suspense fallback={<div>Loading...</div>}>
              <EmployeeSalary />
            </Suspense>
          } />

          <Route path="/projects/project_dashboard" element={
            <Suspense fallback={<div>Loading...</div>}>
              <Projects />
            </Suspense>
          } />
          <Route
            path="/projects/projects-view/:_id"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ProjectView />
              </Suspense>
            }
          />
          <Route path="/tasks/:_id" element={
            <Suspense fallback={<div>Loading...</div>}>
              <TaskDetails />
            </Suspense>
          } />
          <Route path="/profit-loss/view" element={
            <Suspense fallback={<div>Loading...</div>}>
              <ViewPL />
            </Suspense>
          } />

          <Route path="/attendance-report" element={
            <Suspense fallback={<div>Loading...</div>}>
              <AttendanceReport />
            </Suspense>
          } />
          <Route path="/lead-report" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LeadReport />
            </Suspense>
          } />
          {/* <Route path="/client-report" element={
            <Suspense fallback={<div>Loading...</div>}>
              <ClientReport />
            </Suspense>
          } /> */}
          <Route path="/recruitment/*" element={
            <Suspense fallback={<div>Loading...</div>}>
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
            </Suspense>
          } />

          <Route path={`payment/setup`} element={
            <Suspense fallback={<div>Loading...</div>}>
              <PaymentSetup />
            </Suspense>
          } />
        </Route>

        <Route path="*" element={
          <Suspense fallback={<div>Loading...</div>}>
            <Error404 />
          </Suspense>
        }></Route>
      </Routes>
    </div>
  );
};

export default AppRoutes;
