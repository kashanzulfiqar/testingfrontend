/**
 * Signin Firebase
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import DaftarProLogo from '../files/Icons/DaftraProLogo.svg'
// import { Applogo } from '../Entryfile/imagepath.jsx'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup';
import { alphaNumericPattern, emailrgx } from '../constant'
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../Entryfile/features/users.jsx';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const Loginpage = (props) => {
  const nav = useNavigate();
  const [emailerror, setEmailError] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [loginValues, setLoginValues] = useState({});
  const [nameerror, setNameError] = useState("");
  const [passworderror, setPasswordError] = useState("");
  const [formgroup, setFormGroup] = useState("");
  const [inputValues, setInputValues] = useState({
    email: "admin@dreamguys.co.in",
    password: "123456",
  });

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email is required')
      .email('Email is invalid'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(20, 'Password must not exceed 20 characters'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onInputHandle = (val, type) => {
    setLoginValues({ ...loginValues, [type]: val})
  }

  const onSubmit = (data) => {
    console.log(data, ">>>")
    const { email, password } = data;
    // setEmailNotVerified(!emailNotVerified);
  
    // Check if email and password match the expected values
    if (email !== "admin@dreamguystech.com" || password !== "123456") {
      // Show error message or handle invalid credentials
      // For example, set an error state and display an error message
      setEmailError("Invalid email or password");
      setPasswordError("Invalid email or password");
      return;
    }
  
    // Clear any previous error messages
    setEmailError("");
    setPasswordError("");
  
    // Credentials are valid, proceed with login
    dispatch(login(data));
    nav('/main/dashboard');
  }
  const dispatch = useDispatch();
  const [email, SetEmail] = useState("");
  const [password, SetPassword] = useState(0);
  const [eye, seteye] = useState(true);


  const onEyeClick = () => {
    seteye(!eye)
  }
  return (


    <>
      <Helmet>
        <title>Login - DaftarPro</title>
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="account-content">
        {/* <Link to="/applyjob/joblist" className="btn btn-primary apply-btn">Apply Job</Link> */}
        <div className="container">
          {/* Account Logo */}
          <div className="account-logo pt-3 pb-2">
            <Link to="/"><img src={DaftarProLogo} alt="DaftarPro" /></Link>
            {/* <Link to="/app/main/dashboard"><img src={Applogo} alt="Dreamguy's Technologies" /></Link> */}
          </div>
          {/* /Account Logo */}
          {
            !emailNotVerified ?
            <div className="account-box" style={{width: '100%', maxWidth: '514px', height: '510px', paddingInline: '55px'}}>
              <div className="account-wrapper">
                <h3 className="account-title" style={{padding: '17px 0px 40px 0px'}}>Login</h3>
                {/* <p className="account-subtitle">Access to our dashboard</p> */}
                {/* Account Form */}
                <div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                      <label>Email Address</label>
                      {/* <Controller
                        name="email"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <input   className={`form-control  ${errors?.email ? "error-input" : "" }`} type="text" value={value} onChange={onChange} autoComplete="false"   />

                        )}
                        defaultValue="admin@dreamguys.co.in"
                      />											 */}
                      <input
                        type="text"
                        {...register('email')}
                        // className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        className={`form-control ${emailerror ? 'is-invalid' : ''}`}
                        placeholder="Enter your email address"
                        defaultValue="admin@dreamguystech.com"
                        onChange={(e) => onInputHandle(e.target.value, 'email')}
                        value={loginValues?.email}
                      />
                      {/* <input name="email" className={`form-control  ${errors?.email ? "error-input" : ""}`} type="email" value={email} onChange={e => SetEmail(e.target.value)} autoComplete="false" /> */}
                      {emailerror && <div className="invalid-feedback">{emailerror}</div>}
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <div className="col">
                          <label>Password</label>
                        </div>
                        <div className="col-auto">
                          <Link className="text-muted" to="/forget-password">
                            Forgot password?
                          </Link>
                        </div>
                      </div>
                      {/* <Controller
                        name="password"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <div className="pass-group password-eye">
                            <input type={eye ? "password" : "text"} className={`form-control  ${errors?.password ? "error-input" : ""}`} value={value} onChange={onChange} autoComplete="false" />
                            <span onClick={onEyeClick} className={`fa toggle-password ${eye ? "fa-eye-slash" : "fa-eye"}`} />
                          </div>
                        )}
                        defaultValue="123456"
                        />											 */}
                        <div className="pass-group password-eye">
                          <input
                            type={eye ? "password" : "text"}
                            className={`form-control`}
                            // className={`form-control ${passworderror ? 'is-invalid' : ''}`}
                            // className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Enter your password"
                            {...register('password')}
                            defaultValue={123456}
                            value={loginValues?.password}
                            onChange={(e) => onInputHandle(e.target.value, 'password')}
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
                        {console.log(passworderror)}
                      {passworderror && <div className="invalid-feedback">{passworderror}</div>}
                    </div>
                    <div className="form-group text-center" style={{marginTop: '25px'}}>
                      <button
                        className="btn btn-primary account-btn"
                        type="submit"
                      >
                        Login
                      </button>

                    </div>
                  </form>
                  <div className="account-footer">
                    <p>Don't have an account yet? <Link to="/register">Register</Link></p>
                  </div>
                </div>
                {/* /Account Form */}
              </div>
            </div> :
            <div className="account-box" style={{width: '100%', maxWidth: '630px', height: '460px', paddingInline: '20px'}}>
                  <div className="account-wrapper">
                    <h3 className="account-title" style={{padding: '30px 0px 20px 0px', fontSize: '32px'}}>Email not verified yet!</h3>
                    {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                    {/* Account Form */}
                      <div className="account-footer">
                        <p style={{color: '#6F6F6F', fontSize: '18px'}}>Confirm your email address. we have sent a verification email to</p>
                        <p style={{fontWeight: '700', fontSize: '18px'}}>{loginValues?.email}</p>
                        <p style={{color: '#0097C7', fontSize: '18px'}}>Not your email address?</p>
                        {/* <p style={{fontSize: '18px'}}>Please <a onClick={() => {setEmailNotVerified(false); setLoginValues({})}} style={{color: '#0097C7'}}>Click-Here</a> to Login again with the correct email address.</p> */}
                        <p style={{color: '#6F6F6F', fontSize: '18px'}}>Make sure to check your inbox and your spam folder if you can't find the email.</p>
                        <p style={{color: '#6F6F6F ', fontSize: '18px'}}>Still not Received? <a style={{color: '#0097C7'}}>Contact Us</a></p>
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


export default Loginpage;
