// import React, { Component } from 'react';
// import { Navigate, Route, Routes } from 'react-router-dom';
// // We will create these two pages in a moment
// //Authendication
// import LoginPage from './loginpage'
// import RegistrationPage from './RegistrationPage'
// import ForgotPassword from './forgotpassword'
// import OTP from './otp'
// import LockScreen from './lockscreen'
// import ApplyJobs from './ApplyJob';

// //Main App
// import DefaultLayout from './Sidebar/DefaultLayout';
// import Settinglayout from './Sidebar/Settinglayout';
// import Tasklayout from './Sidebar/tasklayout';
// import Emaillayout from './Sidebar/emaillayout';
// import chatlayout from './Sidebar/chatlayout';

// import uicomponents from '../MainPage/UIinterface/components';
// //Error Page
// import Error404 from '../MainPage/Pages/ErrorPage/error404';
// import Error500 from '../MainPage/Pages/ErrorPage/error500';



// export default class App extends Component {
//     componentDidMount(){
//         if (location.pathname.includes("login") || location.pathname.includes("register") || location.pathname.includes("forgotpassword")
//         || location.pathname.includes("otp")|| location.pathname.includes("lockscreen") ) {
//             // $('body').addClass('account-page');
//         }else if (location.pathname.includes("error-404") || location.pathname.includes("error-500") ) {
//             $('body').addClass('error-page');
//         }
//     }
//        render(){
//             const { location, match, user } = this.props;
            
            
           
//             if (location.pathname === '/') {                 
//                 console.log(location, 'loc====');
//                    return (<Navigate to={'/login'} />);                
//                 //    return (<Navigate to={'/app/main/dashboard'} />);                
//              }
//             return (
//                 // <Routes>
                 
//                 //     <Route path="/login" component={LoginPage} />
//                 //     <Route path="/forgotpassword" component={ForgotPassword} />
//                 //     <Route path="/register" component={RegistrationPage} />
//                 //     <Route path="/otp" component={OTP} />
//                 //     <Route path="/lockscreen" component={LockScreen} />
//                 //     <Route path="/applyjob" component={ApplyJobs} />

//                 //     <Route path="/app" component={DefaultLayout} />
//                 //     <Route path="/settings" component={Settinglayout} />
//                 //     <Route path="/tasks" component={Tasklayout} />
//                 //     <Route path="/email" component={Emaillayout} />
//                 //     <Route path="/conversation" component={chatlayout} />
                    
//                 //     <Route path="/ui-components" component={uicomponents} />
//                 //     <Route path="/error-404" component={Error404} />
//                 //     <Route path="/error-500" component={Error500} />
//                 // </Routes>

//                 <Routes>
//                     <Route path="/login" element={<LoginPage />} />
//                     <Route path="/forgotpassword" element={<ForgotPassword />} />
//                     <Route path="/register" element={<RegistrationPage />} />
//                     <Route path="/otp" element={<OTP />} />
//                     <Route path="/lockscreen" element={<LockScreen />} />
//                     <Route path="/applyjob" element={<ApplyJobs />} />

//                     <Route path="/app/*" element={<DefaultLayout />} />
//                     <Route path="/settings/*" element={<Settinglayout />} />
//                     <Route path="/tasks/*" element={<Tasklayout />} />
//                     <Route path="/email/*" element={<Emaillayout />} />
//                     <Route path="/conversation/*" element={<Chatlayout />} />

//                     <Route path="/ui-components" element={<Uicomponents />} />
//                     <Route path="/error-404" element={<Error404 />} />
//                     <Route path="/error-500" element={<Error500 />} />
//                 </Routes>
//             )
//         }
         
// }


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
import ResetPassword from './resetpassword';

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

const [menu, setMenu] = useState(false)

const toggleMobileMenu = () => {
  setMenu(!menu)
}

useEffect(() => {
// if ((location.pathname === '/' || location.pathname === '/login') && !login) {
//         nav('/login')               
//       //    return (<Navigate to={'/app/main/dashboard'} />);                
//       }
//       else{
//         nav('/employee/dashboard')
//       }
}, [])


      

  return (
    <>

      <Routes>
        {/* <Route path="/" element={<Navigate to="/login" />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/:id" element={<LoginPage />} />
        <Route path="/forget-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id" element={<ResetPassword />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/lockscreen" element={<LockScreen />} />
        <Route path="/applyjob" element={<ApplyJobs />} />

        {/* <Route path="/app/*" element={<DefaultLayout />} /> */}

        {/* <Route element={<Layout />}> */}
        <Route path="/" element={<RequireAuth />}>
          <Route>
            {/* dashboard */}
            <Route path={`main/dashboard`} element={<AdminDashboard />} />
            <Route path={`employee/dashboard`} element={<EmployeeDashboard />} />


            {/* Employee */}
            <Route path={`employee/allemployees`} element={<AllEmployees />} />

          </Route>

        {/* </Route> */}
        </Route>


        <Route path="/settings/*" element={<Settinglayout />} />
        <Route path="/tasks/*" element={<Tasklayout />} />
        <Route path="/email/*" element={<Emaillayout />} />
        <Route path="/conversation/*" element={<Chatlayout />} />

        <Route path="/ui-components" element={<Uicomponents />} />
        <Route path="/error-404" element={<Error404 />} />
        <Route path="/error-500" element={<Error500 />} />
      </Routes>

      {
        (login && (location.pathname.includes('/employee/') || location.pathname.includes('dashboard')) ) &&
        <>
          <Header onMenuClick={(value) => toggleMobileMenu()} />
          <Sidebar />
        </>
      }
    </>
  );
};

export default App;
