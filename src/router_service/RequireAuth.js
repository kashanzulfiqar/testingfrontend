import React from 'react'

import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useSelector } from 'react-redux';
const RequireAuth = ({Role}) => {
    
    const value = useSelector(state => state.user.loginvalue)
    const { auth } = useAuth();
    const location = useLocation();
    // const res =JSON.parse(localStorage.getItem("AuthObj"))
    console.log(auth, 'aut=====');
    let AuthRole = value ? true : false
    // let AuthRole = res?.acesstoken
    

    return (
        AuthRole
            ?
            <Outlet />
            :
            auth?.user ?
                alert('unauthorized') :
                <Navigate to='/login' state={{ from: location.pathname }} replace />
    );
}
export default RequireAuth;
