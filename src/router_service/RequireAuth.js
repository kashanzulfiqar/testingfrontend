import React, { useEffect, useState } from 'react'

import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useSelector } from 'react-redux';
import Header from '../initialpage/Sidebar/header';
import Sidebar from '../initialpage/Sidebar/sidebar';
const RequireAuth = ({Role}) => {
    
    const value = useSelector(state => state.user.loginvalue)
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
            auth?.user ?
                alert('unauthorized') :
                <Navigate to='/login' state={{ from: location.pathname }} replace />
    );
}
export default RequireAuth;
