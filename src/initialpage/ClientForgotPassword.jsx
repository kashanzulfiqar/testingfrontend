import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { Form, Input, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { apiServices } from '../Services/apiServices';
import DaftarProLogo from '../files/Icons/DaftraProLogo.svg';

const ClientForgotPassword = () => {
  const [loader, setLoader] = useState(false);
  const [successSection, setSuccessSection] = useState(false);
  const [email, setEmail] = useState("");
  const [resendLoader, setResendLoader] = useState(false);

  useEffect(() => {
    // Detect Safari using more robust feature detection (for both mobile and desktop)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                     (navigator.vendor && navigator.vendor.includes('Apple') && !navigator.userAgent.includes('CriOS') && !navigator.userAgent.includes('FxiOS'));
  
    if (isSafari) {
      console.log("Detected Safari");
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

  const onFinish = (values) => {
    setLoader(true);
    const data = {
      email: values.email,
      userType: 'client'
    };

    apiServices("POST", "client/forgot-password", data, null)
      .then((res) => {
        if (res?.data?.return?.success === true) {
          setEmail(values.email);
          setSuccessSection(true);
          message.success(res?.data?.msg || 'Reset password link has been sent to your email!');
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Failed to send reset password link"
          }`
        );
      })
      .finally(() => {
        setLoader(false);
      });
  };

  const ResendEmail = (email) => {
    setResendLoader(true);
    const data = {
      email: email,
      userType: 'client'
    };
    
    apiServices("POST", "client/forgot-password", data, null)
      .then((res) => {
        if (res?.data?.return?.success === true) {
          message.success(res?.data?.msg || 'Reset Link has been sent Successfully!')
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Reset Link Error!"
          }!`
        );
      })
      .finally(() => {
        setResendLoader(false);
      });
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 30,
        color: '#fff'
      }}
      spin
    />
  );

  return (
    <>
      <Helmet>
        <title>Forgot Password - DaftarPro</title>
        <meta name="description" content="Forgot Password page" />
      </Helmet>
      <div className="account-content">
        <div className="container">
          <div className="account-logo pt-3 pb-2">
            <Link to="/"><img src={DaftarProLogo} alt="DaftarPro" /></Link>
          </div>
          {!successSection ? (
            <div className="account-box" style={{ width: '100%', maxWidth: '514px', height: 'auto', paddingInline: '55px' }}>
              <div className="account-wrapper">
                <h3 className="account-title" style={{ padding: '25px 0px 40px 0px' }}>Forgot Password?</h3>
                <Form
                  name="forgot-password"
                  onFinish={onFinish}
                  onFinishFailed={() => message.error('Please Fill Required Fields!')}
                >
                  <div className="form-group">
                    <label>Email Address</label>
                    <Form.Item
                      name="email"
                      rules={[
                        {
                          whitespace: true,
                          required: true,
                          message: "Please enter email address",
                        },
                        {
                          type: "email",
                          message: "Please enter a valid email",
                        },
                      ]}
                      className="custom-border"
                    >
                      <Input className="form-control" />
                    </Form.Item>
                  </div>
                  <div className="form-group text-center" style={{ marginTop: "40px" }}>
                    <button className="btn btn-primary account-btn" style={{ fontSize: "19px" }} type="submit" disabled={loader}>
                      {loader ? <Spin indicator={antIcon} /> : 'Request Password Change'}
                    </button>
                  </div>
                  <div className="account-footer mt-3" style={{fontSize: '15px'}}>
                    <p>Remember your password? <Link to="/client/login">Login</Link></p>
                  </div>
                </Form>
              </div>
            </div>
          ) : (
            <div className="account-box" style={{ width: '100%', maxWidth: '630px', height: 'auto', paddingInline: '20px' }}>
              <div className="account-wrapper">
                <h3 className="account-title" style={{ padding: '30px 0px 20px 0px', fontSize: '32px' }}>
                  All Done!
                </h3>
                <div className="account-footer">
                  <label style={{ color: "#6F6F6F", fontSize: "18px", margin: '4px 0px' }}>
                    We've emailed you with instructions to reset your password.
                  </label>
                  <div style={{ fontWeight: "700", fontSize: "18px", margin: '15px 0px 11px 0px' }}>{email}</div>
                  <a
                    style={{ color: "#0097C7", fontSize: "18px", margin: '8px 0px' }}
                    onClick={() => setSuccessSection(false)}
                  >
                    Not your email address?
                  </a>
                  <label style={{ color: "#6F6F6F", fontSize: "18px", margin: '8px 0px' }}>
                    Make sure to check your inbox and your spam folder if you can't find the email.
                  </label>
                  <label style={{ color: "#6F6F6F", fontSize: "18px", margin: '8px 0px' }}>
                    Still not Received?{" "}
                    <label
                      style={{
                        color: resendLoader ? "#aaa" : "#0097C7",
                        cursor: resendLoader ? "not-allowed" : "pointer",
                        fontSize: "18px",
                        margin: "8px 0px",
                      }}
                      onClick={() => !resendLoader && ResendEmail(email)}
                    >
                      {resendLoader ? <Spin size="small" /> : "Resend Email"}
                    </label>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientForgotPassword; 