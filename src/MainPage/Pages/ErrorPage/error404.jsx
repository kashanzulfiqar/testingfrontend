/**
 * Signin Firebase
 */

import React, { Component, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DaftarProLogo from '../../../files/Icons/DaftraProLogo.svg'

const Error404 = () => {

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role
     
  useEffect(() => {
    document.body.classList.add("error-page");
   
    return () => document.body.classList.remove("error-page");
    }, []);
      return (
         <>
            <div className="account-logo pt-3 pb-2">
              <Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}><img src={DaftarProLogo} alt="DaftarPro" /></Link>
            </div>
         <div className='main-wrapper'>
            <Helmet>
                <title>Error 404 - DaftarPro</title>
                <meta name="description" content="Login page"/>					
            </Helmet>
         <div className="error-box">
           <h1 style={{fontSize: '29px'}}><i className="fa fa-warning" /> Webpage is Under Construction!</h1>
           <h3 className='mb-5 mt-3'> Please visit later...</h3>
           {/* <h1>404</h1>
           <h3><i className="fa fa-warning" /> Oops...  Page not found!</h3>
           <p>The page you requested was not found.</p> */}
           <Link onClick={()=>localStorage.setItem("firstload","true")} to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'} className="btn btn-custom">Back to Home</Link >
         </div>
         </div>
       </>
        
      );
   
}

export default Error404;
