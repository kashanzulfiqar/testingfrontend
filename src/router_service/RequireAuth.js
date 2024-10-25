import React, { useEffect, useState } from 'react'

import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useSelector } from 'react-redux';
import Header from '../initialpage/Sidebar/header';
import Sidebar from '../initialpage/Sidebar/sidebar';
const RequireAuth = ({Role}) => {
    
  const nav = useNavigate();
    const value = useSelector(state => state.user.loginvalue)
    //const permissions = useSelector((state) => state?.permissionsSlice?.data);
    const role = value?.user?.role
    const firstTimeLogin = localStorage.getItem("firstTimeLogin");
    const { auth } = useAuth();
    const location = useLocation();
    const superAdmin = useSelector((state) => state.superAdmin);
    // const res =JSON.parse(localStorage.getItem("AuthObj"))
    console.log(auth, 'aut=====');
    let AuthRole = value ? true : false
    // let AuthRole = res?.acesstoken

    const [menu, setMenu] = useState(false);
    const [barMenu, setBarMenu] = useState(true);

    const toggleMobileMenu = () => {
      setMenu(!menu);
      document.body.classList.remove('mini-sidebar');
    };
    const toggleBar = () => {
      setBarMenu(!barMenu);
    };
    
    useEffect(() => {
      // Detect Safari using more robust feature detection (for both mobile and desktop)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                       (navigator.vendor && navigator.vendor.includes('Apple') && !navigator.userAgent.includes('CriOS') && !navigator.userAgent.includes('FxiOS'));
    
      if (isSafari) {
        console.log("Detected Safari");
        // Apply custom styles for Safari
        document.documentElement.style.setProperty('--word-spacing', '0px');
        document.documentElement.style.setProperty('--heading-spacing', '0px');
        document.documentElement.style.setProperty('--div-spacing', '0px');
        document.documentElement.style.setProperty('--a-spacing', '0px');
      } else {
        console.log("Not Safari");
        document.documentElement.style.setProperty('--word-spacing', '-3.5px');
        document.documentElement.style.setProperty('--heading-spacing', '-7px');
        document.documentElement.style.setProperty('--div-spacing', '-2px');
        document.documentElement.style.setProperty('--a-spacing', '-4px');
      }
    }, []);
    
    // const getCounter = () => {
    //   apiServices("GET", "requests/view-all-request?employeeName=&leaveType=&requestTo=&requestFrom=&page=1&limit=10&status=", null, value)
    //   .then((res) => {
    //     if (res?.data?.success === true) {
    //       console.log('pending', res.data?.pendingRequests);
    //       dispatch(counter(res.data?.pendingRequests))
    //     }
    //   })
    // }

    // useEffect(() => {
    //   if(!value?.user?.superAdmin && (value?.user?.role === 'admin' || permissions?.viewAllRequest || permissions?.teamRequest))
    //     getCounter()
    //   }, [])

    useEffect(() => {
      if(location.pathname !== '/change-password'){
        if(!role && firstTimeLogin){
          nav('/change-password')
          // message.error('Please Change Your Password First!')
        }
        if((role === 'client' || role === 'focalperson') && firstTimeLogin){
          nav('/change-password')
          // message.error('Please Change Your Password First!')
        }
      }
      // for client and focal person redirect code
      if( role === 'client' && location.pathname !== '/client/client-profile' && location.pathname !== '/client/focal-profile' && location.pathname !== '/change-password' && !location.pathname.includes('invoices/view-invoice') && !location.pathname.includes('/projects/projects-view/')){
        nav('/client/client-profile')
      }
      if( role === 'focalperson' && location.pathname !== '/client/focal-profile' && location.pathname !== '/change-password' && !location.pathname.includes('/projects/projects-view/')){
        nav('/client/focal-profile')
      }
    }, [location])

    useEffect(() => {
      // Check if the current path is already a super admin path
      if (superAdmin && !location.pathname.startsWith('/super-admin')) {
        nav('/super-admin/dashboard');
      }
    }, []);

    useEffect(() => {
      setMenu(false);
      window.scrollTo(0, 0);
    }, [location])
    

    return (
        AuthRole
            ?
            <div className={`main-wrapper ${menu ? 'slide-nav' : ''}`}> 
                <Header onMenuClick={toggleMobileMenu} onBarToggle={toggleBar} AdminLogin={superAdmin} /> 
                <Sidebar barMenu={barMenu} /> 
                <Outlet />
            </div>
            :
            <Navigate to='/login' replace={true} />
            // auth?.user ?
            //     alert('unauthorized') :
                // <Navigate to='/login' state={{ from: location.pathname }} replace />
    );
}
export default RequireAuth;
