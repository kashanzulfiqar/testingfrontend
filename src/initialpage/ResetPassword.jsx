/**
 * Signin Firebase
 */

import React, { Component, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import {Applogo} from '../Entryfile/imagepath.jsx'
import DaftarProLogo from '../files/Icons/DaftraProLogo.svg'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import SuccessIcon from '../files/Icons/SuccessIcon.svg'



const ResetPassword = () => {

  const [successSection, setSuccessSection] = useState(false)
  const [email, setEmail] = useState('')
  const [passwords, setPasswords] = useState({ password: '' })
  const [eye1, setEye1] = useState(true)
  const [eye, setEye] = useState(true)
  const [passworderror,setPasswordError] = useState("");

//   const[eye,setEye]=useState(true);


  const submitHandler = (e) => {
    e.preventDefault();
    if(!passwords.password && !passwords.confirm_password){
      message.error('Input Fields cannot be Empty!')
      return
    }
    if(passwords.password.length < 8){
      message.error('Password should be at least 8 characters long!')
      return
    }
      if(passwords.password !== passwords.confirm_password){
        message.error('Please Enter the Same Password!')
        return
      }
    console.log('clicked');
    setSuccessSection(true)
  }
  
  const onEyeClick1 = () =>{
    setEye1(!eye1)
  }
  const onEyeClick = () =>{
    setEye(!eye)
  }
  const onInputChange = (val, type) => {
    setPasswords({ ...passwords, [type]: val })
    if(passwords.password.length < 8){
      setPasswordError({length: 'Password length must be atleast 8 characters'})
    }
  }
  const calculateStrength = () => {
    // const strengthPercentage = (passwords?.password?.length / 10) * 100; // Example: Assume maximum strength is achieved when the password length is 10 characters
    // return passwords?.password?.length === 0 ? 0 : strengthPercentage;
    let stre = 0;
    const regexUpper = /[A-Z]/;
    const regexLower = /[a-z]/;
    const regexSpecialChar = /[!@#$%^&*()\-=_+[\]{};':"\\|,.<>/?]/;
    const regexNum = /\d/;

    if(passwords.password.length >= 8){
      stre += 20;
    }
    if(regexLower.test(passwords?.password)){
      stre += 10;
    }
    if(regexUpper.test(passwords?.password)){
      stre += 20;
    }
    if(regexSpecialChar.test(passwords?.password)){
      stre += 30;
    }
    if(regexNum.test(passwords?.password)){
      stre += 20;
    }
    return stre;
  };

      return (
          <>
            <Helmet>
                    <title>Reset Password - DaftarPro</title>
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
                <div className="account-box" style={{width: '100%', maxWidth: '512px', height: '540px', paddingInline: '55px'}}>
                <div className="account-wrapper">
                  <h3 className="account-title" style={{padding: '25px 0px 40px 0px'}}>Create New Password</h3>
                  {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                  {/* Account Form */}
                  <form>
                  <div className="form-group">
                         <label className="col-form-label">New Password <span className="text-danger">*</span></label>
                         <div className="pass-group password-eye">
                            <input
                              type={eye1 ? "password" : "text"}
                              className={`form-control passwordStyle`}
                              onChange={(e) => onInputChange(e.target.value, 'password')}
                              value={passwords?.password}
                            />
                            {/* <input type={eye ? "password" : "text"} className={`form-control  ${errors?.password ? "error-input" : ""}`} value={password} onChange={e => SetPassword(e.target.value)} autoComplete="false" /> */}
                            <span onClick={onEyeClick1} style={{cursor: 'pointer', top: '12px'}} className={`toggles-password fa toggle-password`}>
                            {
                              eye1 ? <EyeInvisibleOutlined style={{color: '#666666', fontSize: '20px'}} /> :
                              <EyeOutlined style={{color: '#666666', fontSize: '20px'}} />
                            }
                            </span>
                            {/* <span onClick={onEyeClick} style={{cursor: 'pointer'}} className={`toggles-password fa toggle-password ${eye ? "fa-light fa-eye-slash" : "fa-light fa-eye"} `} /> */}
                          </div>
                          {passworderror && <div className="invalid-feedback">{passworderror.length}</div>}
                          
                        </div>
                       <div className="form-group">
                         <label className="col-form-label">Confirm New Password <span className="text-danger">*</span></label>
                         <div className="pass-group password-eye">
                            <input
                              type={eye ? "password" : "text"}
                              className={`form-control passwordStyle`}
                              onChange={(e) => onInputChange(e.target.value, 'confirm_password')}
                              value={passwords?.confirm_password}
                            />
                            {/* <input type={eye ? "password" : "text"} className={`form-control  ${errors?.password ? "error-input" : ""}`} value={password} onChange={e => SetPassword(e.target.value)} autoComplete="false" /> */}
                            <span onClick={onEyeClick} style={{cursor: 'pointer', top: '12px'}} className={`toggles-password fa toggle-password`}>
                            {
                              eye ? <EyeInvisibleOutlined style={{color: '#666666', fontSize: '20px'}} /> :
                              <EyeOutlined style={{color: '#666666', fontSize: '20px'}} />
                            }
                            </span>
                            {/* <span onClick={onEyeClick} style={{cursor: 'pointer'}} className={`toggles-password fa toggle-password ${eye ? "fa-light fa-eye-slash" : "fa-light fa-eye"} `} /> */}
                          </div>
                          <div className="strength-bar-back"></div>
                          <div className="strength-bar-main" style={{ width: `${calculateStrength() > 100 ? 100 : calculateStrength()}%`, backgroundImage: `linear-gradient(to right, #F3C652 0%, #F3C652 94%, transparent 50%)` }}></div>
                          {/* <div className="strength-bar" style={{ width: `${calculateStrength()}%`, backgroundImage: 'linear-gradient(to right, #F3C652 0%, #F3C652 94%, transparent 50%)' }}></div> */}
                       </div>
                    <div className="form-group text-center" style={{marginTop: '40px'}}>
                      <button className="btn btn-primary account-btn" style={{fontSize: '19px'}} onClick={submitHandler} type="submit">Reset Password</button>
                    </div>
                    <div className="account-footer mt-3">
                        <p style={{color: '#6F6F6F '}}>Need Help? <a style={{color: '#0097C7'}}>Contact Support</a></p>
                    </div>
                  </form>
                  {/* /Account Form */}
                </div>
                </div> : 
                <div className="account-box" style={{width: '100%',maxWidth: '560px', height: 'auto', paddingInline: '55px'}}>
                <div className="account-wrapper">
                  <div style={{display: 'grid', justifyItems: 'center'}}>
                    <img style={{padding: '17px 0px 30px 0px'}} src={SuccessIcon} alt="Success" />
                    <h3 className="account-title" style={{padding: '0px 0px 15px 0px'}}>Congratulations!</h3>
                    <div className="account-footer">
                      <p style={{color: '#444444', padding: '0px 0px 20px 0px'}}>Your Password has been Reset.</p>
                    </div>

                  </div>


                  <div className="form-group text-center">
                    <Link to='/login'><span className="account-btn" style={{color: 'white'}}>Login Now</span></Link>
                  </div>  
              </div>
            </div>
              }
            </div>
          </div>
        </>
      );
   }



export default ResetPassword;