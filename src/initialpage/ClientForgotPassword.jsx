import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { Form, Input, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { apiServices } from '../Services/apiServices';
import DaftarProLogo from '../files/Icons/DaftraProLogo.svg';

const ClientForgotPassword = () => {
  const [loader, setLoader] = useState(false);

  const onFinish = (values) => {
    setLoader(true);
    const data = {
      email: values.email,
      userType: 'client' // This will handle both client and focal person
    };

    apiServices("POST", "client/forgot-password", data, null)
      .then((res) => {
        if (res?.data?.success === true) {
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
          <div className="account-box" style={{ width: '100%', maxWidth: '514px', height: '487px', paddingInline: '55px' }}>
            <div className="account-wrapper">
              <h3 className="account-title" style={{ padding: '17px 0px 40px 0px' }}>Forgot Password</h3>
              <p className="account-subtitle">Enter your email to get a password reset link</p>
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
                <div className="form-group text-center">
                  <button className="btn btn-primary account-btn" type="submit" disabled={loader}>
                    {loader ? <Spin indicator={antIcon} /> : 'Reset Password'}
                  </button>
                </div>
                <div className="account-footer">
                  <p>Remember your password? <Link to="/client/login">Login</Link></p>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientForgotPassword; 