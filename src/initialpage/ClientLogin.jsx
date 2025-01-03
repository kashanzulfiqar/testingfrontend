/**
 * Signin Firebase
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import DaftarProLogo from '../files/Icons/DaftraProLogo.svg'
// import { Applogo } from '../Entryfile/imagepath.jsx'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup';
import { alphaNumericPattern, emailrgx } from '../constant'
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../Entryfile/features/users.jsx';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Form, Input, Spin, message } from 'antd';
import { apiLoginEmployee } from "../Services/apiLogin";
import { LoadingOutlined } from '@ant-design/icons';
import { apiServices } from '../Services/apiServices';
import { getPermissionList } from '../Redux/Reducer/permissions/actions';

const ClientLogin = (props) => {

  const isLogin = useSelector((state) => state.user.loginvalue);
  const role = isLogin?.user?.role

  const nav = useNavigate();
  const location = useLocation();
  const param = useParams();

  // let verificationToken = location.pathname.split('/')[2]?.split('&token=')[1]
  // let verificationEmail = location.pathname.split('/')[2]?.split('&token=')[0]

  let verificationToken = param?.token?.replace(/^token=/, '')
  let verificationEmail = param?.email

  // console.log(verificationEmail, verificationToken);


  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [emailVal, setEmailVal] = useState();
  const [loader, setLoader] = useState(false)
  const [loginValues, setLoginValues] = useState({});
  const [inputValues, setInputValues] = useState({
    email: "admin@dreamguys.co.in",
    password: "123456",
  });

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

  useEffect(() => {
    if(isLogin){
      nav(role === 'client' ? `/client/client-profile` : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`)
    }
  }, [])


  const onFinish = (values) => {
    setLoader(true)
    // console.log(values, ">>>")

    let data = {
      token: verificationToken,
      email: values?.email,
      password: values?.password,
    };

    apiLoginEmployee( !verificationToken ? 'client/login-client' : `user/login-user?token=${verificationToken}` , data).then((res) => {
      if (res?.data?.success === true) {
        // console.log(res?.data?.result);
        dispatch(loginSuccess(res?.data?.result));
        if(res?.data?.result?.user?.firstTimeLogin){
          setTimeout(() => {
            setLoader(false)
            // window.location.href = `${window?.location?.origin}/change-password`

            window.history.replaceState(null, null, `${window?.location?.origin}/change-password`);
            // window.location.replace(`${window?.location?.origin}/client/client-profile`)
            window.location.reload();

            localStorage.setItem("firstTimeLogin", JSON.stringify(res?.data?.result?.user?.firstTimeLogin));
          }, 1300);
        }else{
          if(res?.data?.result?.user?.role === "client"){
            setTimeout(() => {
              setLoader(false)
              // window.location.href = `${window?.location?.origin}/client/client-profile`

              window.history.replaceState(null, null, `${window?.location?.origin}/client/client-profile`);
              // window.location.replace(`${window?.location?.origin}/client/client-profile`)
              window.location.reload();


            }, 1300);
          }
          else if(res?.data?.result?.user?.role === "focalperson") {
            setTimeout(() => {
              setLoader(false)
              // window.location.href = `${window?.location?.origin}/client/focal-profile`

              window.history.replaceState(null, null, `${window?.location?.origin}/client/focal-profile`);
              // window.location.replace(`${window?.location?.origin}/client/focal-profile`)
              window.location.reload();


            }, 1300);
          }

        }
      }
    }).catch((err)=>{
      if (err.response.data.verified === false){
        setEmailNotVerified(true)
        setEmailVal(data?.email)
      }
      setLoader(false)
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Login"
        } Error`
      );
  })
  }
  const dispatch = useDispatch();
  const [eye, seteye] = useState(true);


  const onEyeClick = () => {
    seteye(!eye)
  }

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 30,
        color: '#fff'
      }}
      spin
    />
  );

  const ResendEmail = (email) => {
    let data1 = {
      email: email
    }
    apiServices("PUT", "user/resend-verification-mail", data1, null)
    .then((res) => {
      if (res?.data?.success === true) {
        message.success('Email has been sent Successfully!')
      }
    })
    .catch((err) => {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Resend Email Error"
        }!`
      );
    });
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
              <div className="account-box" style={{ width: '100%', maxWidth: '514px', height: '487px', paddingInline: '55px' }}>
                <div className="account-wrapper">
                  <h3 className="account-title" style={{ padding: '17px 0px 40px 0px' }}>Client & Focal Person Login</h3>
                  {/* <p className="account-subtitle">Access to our dashboard</p> */}
                  {/* Account Form */}
                  <div>
                    <Form
                      // form={form}
                      name="control-hooks"
                      onFinish={onFinish}
                      onFinishFailed={() => message.error('Please Fill Required Fields!')}
                      initialValues={{
                        email: verificationEmail ? verificationEmail : ''
                      }}
                    >
                      <div className="form-group">
                        <label>Email Address</label>
                        <Form.Item
                          name="email"
                          rules={[
                            {
                              whitespace: true,
                              required: true,
                              message: "please enter email address",
                            },
                            {
                              type: "email",
                              message: "Please enter a valid email",
                            },
                          ]}
                          className="custom-border"
                        >
                          <Input
                            className={`form-control`}
                            disabled={verificationEmail ? true : false}
                          />
                        </Form.Item>
                      </div>
                      <div className="form-group">
                        <div className="row">
                          <div className="col">
                            <label>Password</label>
                          </div>
                          {/* <div className="col-auto">
                            <Link className="text-muted" to="/forget-password">
                              Forgot password?
                            </Link>
                          </div> */}
                        </div>
                        <Form.Item
                          name="password"
                          rules={[
                            {
                              whitespace: true,
                              required: true,
                              message: "please enter password",
                            },
                          ]}
                          className="custom-border"
                        >
                          <div className="pass-group password-eye">
                            <Input
                              type={eye ? "password" : "text"}
                              className={`form-control passwordStyle`}
                            />
                            <span onClick={onEyeClick} style={{ cursor: 'pointer', top: '12px' }} className={`toggles-password fa toggle-password`}>
                              {
                                eye ? <EyeInvisibleOutlined style={{ color: '#666666', fontSize: '20px' }} /> :
                                  <EyeOutlined style={{ color: '#666666', fontSize: '20px' }} />
                              }
                            </span>
                          </div>
                        </Form.Item>
                      </div>
                      <div className="form-group text-center" style={{ marginTop: '35px' }}>
                        <button
                          className="btn btn-primary account-btn"
                          type="submit"
                          disabled={loader}
                        >
                          {
                            loader ? <Spin size="small" indicator={antIcon} />
                              : 'Login'
                          }
                        </button>

                      </div>
                    </Form>
                    <div className="account-footer">
                    <div style={{borderBottom: '1px dashed #b7b7b7', margin: '10px 0px 15px'}}></div>
                      <label style={{fontSize: '15px'}}>If you are an Employee or Admin. <Link to="/login">Login here</Link></label>
                    </div>
                  </div>
                  {/* /Account Form */}
                </div>
              </div> :
              <div className="account-box" style={{ width: '100%', maxWidth: '630px', height: 'auto', paddingInline: '20px' }}>
                <div className="account-wrapper">
                  <h3 className="account-title" style={{ padding: '30px 0px 20px 0px', fontSize: '32px' }}>Email not verified yet!</h3>
                  {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                  {/* Account Form */}
                  <div className="account-footer">
                    <label style={{ color: '#6F6F6F', fontSize: '18px', margin: '4px 0px'}}>Confirm your email address. We have sent a verification <br /> email to</label>
                    <div style={{ fontWeight: '700', fontSize: '18px', margin: '15px 0px 11px 0px' }}>{emailVal}</div>
                    <label style={{ color: '#0097C7', fontSize: '18px', margin: '8px 0px' }}>Not your email address?</label>
                    {/* <p style={{fontSize: '18px'}}>Please <a onClick={() => {setEmailNotVerified(false); setLoginValues({})}} style={{color: '#0097C7'}}>Click-Here</a> to Login again with the correct email address.</p> */}
                    <label style={{ color: '#6F6F6F', fontSize: '18px', margin: '8px 0px' }}>Make sure to check your inbox and your spam folder if you can't find the email.</label>
                    <label style={{ color: '#6F6F6F ', fontSize: '18px', margin: '8px 0px' }}>Still not Received? <a onClick={() => ResendEmail(emailVal)} style={{ color: '#0097C7' }}>Resend Email</a></label>
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

export default ClientLogin