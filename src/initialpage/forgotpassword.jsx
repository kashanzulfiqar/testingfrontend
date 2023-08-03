/**
 * Signin Firebase
 */

import React, { Component, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Applogo } from "../Entryfile/imagepath.jsx";
import DaftarProLogo from "../files/Icons/DaftraProLogo.svg";
import { Form, Input, Spin, message } from "antd";
import { apiServices } from "../Services/apiServices";
import { LoadingOutlined } from '@ant-design/icons';


const ForgotPassword = () => {
  const [successSection, setSuccessSection] = useState(false);
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false)

  const onFinish = (values) => {
    setLoader(true)
    // console.log(values);

    apiServices("POST", "user/forgot-password", values).then((res) => {
      // console.log(res);
      if (res?.data?.return?.success === true) {
        setLoader(false)
        setEmail(values?.email);
        setSuccessSection(true);
        message.success('Reset Link has been sent Successfully!')
      }
   }).catch((err)=>{
    // console.log(err);
       setLoader(false)
       message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Forgot Password"
        } Error`
      );
   })
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
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="account-content">
        {/* <Link to="/applyjob/joblist" className="btn btn-primary apply-btn">Apply Job</Link> */}
        <div className="container">
          {/* Account Logo */}
          <div className="account-logo pt-3 pb-2">
            <Link to="/">
              <img src={DaftarProLogo} alt="DaftarPro" />
            </Link>
          </div>
          {/* /Account Logo */}
          {!successSection ? (
            <div
              className="account-box"
              style={{
                width: "100%",
                maxWidth: "514px",
                height: "auto",
                paddingInline: "55px",
              }}
            >
              <div className="account-wrapper">
                <h3
                  className="account-title"
                  style={{ padding: "25px 0px 40px 0px" }}
                >
                  Forgot Password?
                </h3>
                {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                {/* Account Form */}
                <Form
                  // form={form}
                  name="control-hooks"
                  onFinish={onFinish}
                  onFinishFailed={() =>
                    message.error("Please Fill Required Fields!")
                  }
                  initialValues={
                    {
                      // email: verificationEmail ? verificationEmail : ''
                    }
                  }
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
                      <Input className={`form-control`} />
                    </Form.Item>
                  </div>
                  <div
                    className="form-group text-center"
                    style={{ marginTop: "40px" }}
                  >
                    <button
                      className="btn btn-primary account-btn"
                      style={{ fontSize: "19px" }}
                      type="submit"
                      disabled={loader}
                    >
                      {
                        loader ? <Spin size="small" indicator={antIcon} />
                          : 'Request Password Change'
                      }
                    </button>
                  </div>
                  <div className="account-footer mt-3" style={{fontSize: '15px'}}>
                    <p>
                      Remember your password? <Link to="/login">Login</Link>
                    </p>
                  </div>
                </Form>
                {/* /Account Form */}
              </div>
            </div>
          ) : (
            <div
              className="account-box"
              style={{
                width: "100%",
                maxWidth: "630px",
                height: "auto",
                paddingInline: "20px",
              }}
            >
              <div className="account-wrapper">
                <h3
                  className="account-title"
                  style={{
                    padding: "30px 0px 20px 0px",
                    fontSize: "32px",
                    wordSpacing: "-9px",
                  }}
                >
                  All Done!
                </h3>
                {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                {/* Account Form */}
                <div className="account-footer">
                  <p
                    style={{
                      color: "#6F6F6F",
                      fontSize: "18px",
                      wordSpacing: "-4.5px",
                    }}
                  >
                    We’ve emailed you with instructions to reset your password.
                  </p>
                  <p style={{ fontWeight: "700", fontSize: "18px" }}>{email}</p>
                  <p
                    style={{
                      color: "#0097C7",
                      fontSize: "18px",
                      wordSpacing: "-4.5px",
                    }}
                  >
                    Not your email address?
                  </p>
                  {/* <p style={{fontSize: '18px'}}>Please <a onClick={() => {setEmailNotVerified(false); setLoginValues({})}} style={{color: '#0097C7'}}>Click-Here</a> to Login again with the correct email address.</p> */}
                  <p
                    style={{
                      color: "#6F6F6F",
                      fontSize: "18px",
                      wordSpacing: "-4.5px",
                    }}
                  >
                    Make sure to check your inbox and your spam folder if you
                    can't find the email.
                  </p>
                  <p
                    style={{
                      color: "#6F6F6F ",
                      fontSize: "18px",
                      wordSpacing: "-4.5px",
                    }}
                  >
                    Still not Received?{" "}
                    <a style={{ color: "#0097C7" }}>Contact Us</a>
                  </p>
                </div>
                {/* /Account Form */}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
