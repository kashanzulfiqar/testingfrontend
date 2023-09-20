import React, { useEffect, useState } from 'react'

import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useSelector } from 'react-redux';
import Header from '../initialpage/Sidebar/header';
import Sidebar from '../initialpage/Sidebar/sidebar';
import { message } from 'antd';
const RequireAuth = ({Role}) => {
    
  const nav = useNavigate();
    const value = useSelector(state => state?.user?.loginvalue)
    const role = value?.user?.role
    const firstTimeLogin = localStorage.getItem("firstTimeLogin");
    const { auth } = useAuth();
    const location = useLocation();
    // const res =JSON.parse(localStorage.getItem("AuthObj"))
    console.log(auth, 'aut=====');
    let AuthRole = value ? true : false
    // let AuthRole = res?.acesstoken

    const [menu, setMenu] = useState(false);

    const toggleMobileMenu = () => {
      setMenu(!menu);
    };
    
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
      if( role === 'client' && location.pathname !== '/client/client-profile' && location.pathname !== '/client/focal-profile' && location.pathname !== '/change-password'){
        nav('/client/client-profile')
      }
      if( role === 'focalperson' && location.pathname !== '/client/focal-profile' && location.pathname !== '/change-password'){
        nav('/client/focal-profile')
      }
    }, [location])

    useEffect(() => {
    if(!AuthRole){
      const handleBackButtonPress = (event) => {
        nav('/login')
      };
  
      // Add the event listener when the component mounts
      window.addEventListener("popstate", handleBackButtonPress);
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
                <Header onMenuClick={toggleMobileMenu} /> 
                <Sidebar /> 
                <Outlet />
            </div>
            :
            <Navigate to='/login' />
            // auth?.user ?
            //     alert('unauthorized') :
                // <Navigate to='/login' state={{ from: location.pathname }} replace />
    );
}
export default RequireAuth;
