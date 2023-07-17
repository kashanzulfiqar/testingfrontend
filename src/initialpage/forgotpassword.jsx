/**
 * Signin Firebase
 */

import React, { Component, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import {Applogo} from '../Entryfile/imagepath.jsx'
import DaftarProLogo from '../files/Icons/DaftraProLogo.svg'

const ForgotPassword = () => {

  const [successSection, setSuccessSection] = useState(false)
  const [email, setEmail] = useState('')

  const submitHandler = (e) => {
    e.preventDefault();
    if(!email){
      return
    }
    setSuccessSection(true)
    console.log('clicked');
  }

      return (
          <>
            <Helmet>
                    <title>Forgot Password - DaftarPro</title>
                    <meta name="description" content="Login page"/>					
            </Helmet>
          <div className="account-content">
            {/* <Link to="/applyjob/joblist" className="btn btn-primary apply-btn">Apply Job</Link> */}
            <div className="container">
              {/* Account Logo */}
              <div className="account-logo">
                <Link to="/"><img src={DaftarProLogo} alt="DaftarPro" /></Link>
              </div>
              {/* /Account Logo */}
              {
                !successSection ? 
                <div className="account-box" style={{width: '100%', maxWidth: '514px', height: '425px', paddingInline: '55px'}}>
                <div className="account-wrapper">
                  <h3 className="account-title" style={{padding: '25px 0px 40px 0px'}}>Forgot Password?</h3>
                  {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                  {/* Account Form */}
                  <form>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group text-center" style={{marginTop: '40px'}}>
                      <button className="btn btn-primary account-btn" style={{fontSize: '19px'}} onClick={submitHandler} type="submit">Request Password Change</button>
                    </div>
                    <div className="account-footer mt-3">
                      <p>Remember your password? <Link to="/login">Login</Link></p>
                    </div>
                  </form>
                  {/* /Account Form */}
                </div>
                </div> :
                <div className="account-box" style={{width: '100%', maxWidth: '630px', height: '460px', paddingInline: '20px'}}>
                <div className="account-wrapper">
                  <h3 className="account-title" style={{padding: '25px 0px 40px 0px'}}>All Done!</h3>
                  {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                  {/* Account Form */}
                    <div className="account-footer">
                      <p style={{color: '#6F6F6F'}}>We’ve emailed you with instructions to reset your password.</p>
                      <p style={{fontWeight: '700'}}>{email}</p>
                      <p>Not your email address?</p>
                      <p>Please <a onClick={() => {setSuccessSection(false); setEmail('')}} style={{color: '#0097C7'}}>Click-Here</a> to Reset again with the correct email address.</p>
                      <p style={{color: '#6F6F6F'}}>Make sure to check your inbox and your spam folder if you can't find the email.</p>
                      <p style={{color: '#6F6F6F '}}>Still not Received? <a style={{color: '#0097C7'}}>Click here to Contact Us</a></p>
                    </div>
                  {/* /Account Form */}
                </div>
                </div>
              }
            </div>
          </div>
        </>
      );
   }



export default ForgotPassword;
