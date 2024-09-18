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
import { login } from '../Entryfile/features/users.jsx';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Form, Input, Spin, message } from 'antd';
import { apiLoginEmployee } from "../Services/apiLogin";
import { LoadingOutlined } from '@ant-design/icons';
import { apiServices } from '../Services/apiServices';
import { getPermissionList } from '../Redux/Reducer/permissions/actions';
import { useTranslation } from 'react-i18next';
import { superAdmin } from '../Redux/Reducer/permissions/superAdminSlice.js';
import OtpModal from './OTPModal.jsx';
//import { superAdmin } from '../Redux/Reducer/permissions/superAdminSlice';

const AdminLogin = (props) => {
  const { t, i18n } = useTranslation(); 
  const isLogin = useSelector((state) => state.user.loginvalue);
  const role = isLogin?.user?.role
  const admin = isLogin?.user?.superAdmin

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
  const [open, setOpen] = useState(false)
  const [loginData, setLoginData] = useState({})
  const [loginValues, setLoginValues] = useState({});
  const [inputValues, setInputValues] = useState({
    email: "admin@dreamguys.co.in",
    password: "123456",
  });

  useEffect(() => {
    if(isLogin && admin){
      nav(`/employee/dashboard`)
    }
  }, [])

  const languageNames = {
    'en': 'English',
    'ar': 'Arabic'
  };

  const langChange = (userLang) => {
    let languageCode = "";
    if (userLang) {
      for (const code in languageNames) {
        if (languageNames[code] === userLang) {
          languageCode = code;
          break;
        }
      }
      i18n.changeLanguage(languageCode);
      localStorage.setItem('lang', languageCode);
      document.querySelector('html').setAttribute('lang', languageCode);
    }
    else {
      languageCode = 'en'
      i18n.changeLanguage(languageCode);
      localStorage.setItem('lang', languageCode);
      document.querySelector('html').setAttribute('lang', languageCode);
    }
  }

  const onFinish = (values) => {
    setLoader(true)
    // console.log(values, ">>>")

    let data = {
      email: values?.email,
      password: values?.password,
    };
    setLoginData(data);

    apiLoginEmployee('newApi/newRoute' , data).then((res) => {
      if (res?.data?.success === true) {
        setOpen(true);
        //const userData = res?.data?.result?.user;
        // console.log('admin',userData.superAdmin)
        // setOpen(true);
        // console.log(res?.data?.result);
        //dispatch(getPermissionList({ roleId: res?.data?.result?.user?.roleId, athtoken: res?.data?.result?.access_token?.accessToken }))
        //dispatch(login(res?.data?.result));
        //dispatch(superAdmin(res?.data?.result?.user?.superAdmin))
        // if(!res?.data?.result?.user?.role && res?.data?.result?.user?.firstTimeLogin){
        //   // nav('/change-password');
        //   setTimeout(() => {
        //     setLoader(false)
        //     // window.location.href = `${window?.location?.origin}/change-password`
            
        //     window.history.replaceState(null, null, `${window?.location?.origin}/change-password`);
        //     // window.location.replace(`${window?.location?.origin}/client/client-profile`)
        //     window.location.reload();

        //     localStorage.setItem("languagePreference", JSON.stringify(res?.data?.result?.user?.languagePreference));
        //     localStorage.setItem("firstTimeLogin", JSON.stringify(res?.data?.result?.user?.firstTimeLogin));
        //     langChange(res?.data?.result?.user?.languagePreference);
        //   }, 1300);
        // }else{
        //   localStorage.setItem("languagePreference", JSON.stringify(res?.data?.result?.user?.languagePreference));
        //   langChange(res?.data?.result?.user?.languagePreference);
        //   // nav(`${res?.data?.result?.user?.role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}`);
        //   setTimeout(() => {
        //     setLoader(false)
        //     // window.location.href = `${window?.location?.origin}${res?.data?.result?.user?.role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}`

        //     window.history.replaceState(null, null, `${window?.location?.origin}/super-admin/dashboard`);
        //     // window.location.replace(`${window?.location?.origin}/client/client-profile`)
        //     window.location.reload();


        //   }, 1300);
        // }
        // nav(`${res?.data?.result?.user?.role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}`);
        // dispatch(getPermissionList({ userId: res?.data?.result?.user?._id, athtoken: res?.data?.result?.access_token }))
      }
    }).catch((err)=>{
      if (err.response.data.verified === false){
        // setresendEmail(true)
        // console.log(err);
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
        }!`
      );
  })

    // Credentials are valid, proceed with login
    // dispatch(login(data));
    // nav('/main/dashboard');
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
        <title>Super-Admin Login - DaftarPro</title>
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
            <div className="account-box" style={{ width: '100%', maxWidth: '514px', paddingInline: '55px' }}>
            <div className="account-wrapper">
                <h3 className="account-title" style={{ padding: '17px 0px 40px 0px' }}>Super-Admin Login</h3>
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
                        <div className="col-auto">
                        <Link className="text-muted" to="/forget-password">
                            Forgot password?
                        </Link>
                        </div>
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
                </div>
                {/* /Account Form */}
            </div>
            </div>
        </div>
      </div>
      
      <OtpModal
        open={open}
        handleClose={()=> setOpen(false)}
        data={loginData}
      />
    </>
  );
}


export default AdminLogin;
