import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Offcanvas from "../../../Entryfile/offcanvance";
import favicon from "../../../files/Icons/DaftarProIcon.svg";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Form, Input, Button, message, Spin } from 'antd';
import { LoadingOutlined } from "@ant-design/icons";
import { apiServices } from "../../../Services/apiServices";

const Query = () => {

  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const role = user_state?.user?.role;

  const { t, i18n } = useTranslation();

  const [form] = Form.useForm();
  const [loader, setLoader] = useState(false);

  const onFinish = (values) => {
    setLoader(true);
    // Handle form submission
    apiServices("POST", "send-query", values, user_state)
        .then((res) => {
          if (res?.data?.success === true) {

            message.success('Problem reported successfully');
            setLoader(false);
            form.resetFields();
          }
        })
        .catch((err) => {
          setLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : 'Error reporting problem'
            }!`
          );
          setLoader(false);
        });
    //console.log('Form Values:', values);
    //message.success('Query submitted successfully!');
  };

  const onFinishFailed = ({errorFields}) => {
    const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
    if(consecutiveSpacesError){
      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
    }else{
      message.error(t('allEmp.errors.fillRequiredFields'))
    }
  };

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  return (
    <div>
      <div className="page-wrapper">
        <Helmet>
          <title>Report - {t('header.daftarPro')}</title>
          <meta name="description" content="Login page" />
          <link rel="icon" type="image/x-icon" href={favicon} />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">Report Problems</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link
                      to={
                        role === "admin"
                          ? "/main/dashboard"
                          : "/employee/dashboard"
                      }
                    >
                      {t("holiday.dashboard")}
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Report Problems</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Form */}
          <Form
            form={form}
            name="query-form"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <div className="col-sm-6 col-md-4">  
              <div className=' form-groupfilterDateMonth'>
              <label style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>Full Name <span className="text-danger">*</span></div>
                    {/* <small style={{marginTop: '5px', fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)'}}>{descLength} / 150</small> */}
                </label>
                  <Form.Item
                    name="fullName"
                    className="custom-border"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter your full name',
                          },
                      {
                        validator: (_, value) => {
                          if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          return Promise.resolve();
                        },
                      },
                      {
                        min: 3,
                        message: 'Minimum length should be 3 characters',
                      },
                    ]}
                    validateTrigger="onSubmit"
                  >
                    <Input className='form-control' style={{height:'50px'}} placeholder='Enter your name' />
                  </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-4">  
              <div className=' form-groupfilterDateMonth'>
              <label style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>Email <span className="text-danger">*</span></div>
                    {/* <small style={{marginTop: '5px', fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)'}}>{descLength} / 150</small> */}
                </label>
                  <Form.Item
                    name="email"
                    className="custom-border"
                    rules={[
                    {
                       required: true,
                       message: 'Please enter your email address',
                      },
                      {
                        type: 'email',
                        message: 'Please enter a valid email address',
                      },
                      {
                        validator: (_, value) => {
                          if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    validateTrigger="onSubmit"
                  >
                    <Input className='form-control' style={{height:'50px'}} placeholder='Enter your email' />
                  </Form.Item>
              </div>
            </div>
            {/* <Form.Item
              label={t('email')}
              name="email"
              rules={[
                { required: true, message: t('requests.errors.pleaseEnterEmail') },
                { type: 'email', message: t('requests.errors.invalidEmail') },
              ]}
            >
              <Input />
            </Form.Item> */}
            <label style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>Describe your problem <span className="text-danger">*</span></div>
                    {/* <small style={{marginTop: '5px', fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)'}}>{descLength} / 150</small> */}
                </label>
            <Form.Item
              name="description"
              rules={[
                {
                  required: true,
                  message: 'please enter the description',
                },
                {
                    min: 5,
                    message: 'Minimum length should be 5 characters',
                  },
              ]}
                validateTrigger="onSubmit"
            >
              <Input.TextArea className="form-control" rows={5} />
            </Form.Item>
            {/* <Form.Item>
              <Button type="primary" htmlType="submit">
                {t('submit')}
              </Button>
            </Form.Item> */}
            <div className="submit-section">
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                      disabled={loader}
                      >
                        {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        t('submit')
                      )}
                    </Button>
                  </Form.Item>
                </div>
          </Form>
        </div>
      </div>
      <Offcanvas />
    </div>
  );
};

export default Query;
