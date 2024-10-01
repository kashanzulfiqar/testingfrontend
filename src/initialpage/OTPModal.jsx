import React, { useEffect, useState } from "react";
import { Modal } from "@mui/material";
import {
  Form,
  Input,
  message,
  Button,
  Spin,
} from "antd";
import { useTranslation } from "react-i18next";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiServices } from "../Services/apiServices";
import { useDispatch, useSelector } from 'react-redux';
import { superAdmin } from "../Redux/Reducer/permissions/superAdminSlice";
import { login } from "../Entryfile/features/users";

const OtpModal = ({ data, open, handleClose }) => {

  const dispatch = useDispatch();
  const nav = useNavigate();
  const {email, password} = data;
  const { t, i18n } = useTranslation(); 
  const [loader, setLoader] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpComplete, setIsOtpComplete] = useState(false);

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );  
  
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

  useEffect(() => {
    let countdown;
    if (resendDisabled && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
      setTimer(60);
    }

    return () => clearInterval(countdown);
  }, [resendDisabled, timer]);

  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to the next input box
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      setIsOtpComplete(true);
    } else {
      setIsOtpComplete(false);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const onFinish = () => {
    setLoader(true)
    const otpValue = otp.join("");
    data.token = otpValue;
    apiServices("POST", "newApi/newRoute", data)
      .then((res) => {
        if (res?.data?.success) {                    
            localStorage.clear();
            sessionStorage.clear()
            const userData = res?.data?.result?.user;
            console.log('admin',userData.superAdmin)
            console.log(res?.data?.result);
            //dispatch(getPermissionList({ roleId: res?.data?.result?.user?.roleId, athtoken: res?.data?.result?.access_token?.accessToken }))
            dispatch(login(res?.data?.result));
            dispatch(superAdmin(res?.data?.result?.user?.superAdmin))
            setOtp(["", "", "", "", "", ""]);
            handleClose();

            localStorage.setItem("languagePreference", JSON.stringify(res?.data?.result?.user?.languagePreference));
            langChange(res?.data?.result?.user?.languagePreference);
            // nav(`${res?.data?.result?.user?.role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}`);
            setTimeout(() => {
                setLoader(false)
                // window.location.href = `${window?.location?.origin}${res?.data?.result?.user?.role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}`

                window.history.replaceState(null, null, `${window?.location?.origin}/super-admin/dashboard`);
                // window.location.replace(`${window?.location?.origin}/client/client-profile`)
                window.location.reload();


            }, 1300);
        }
      })
      .catch((err) => {
        console.error(err)
        message.error(
            `${
            err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "OTP verification error"
            }`
        );
        setLoader(false)
      })
  };

  const handleResendOtp = () => {
    apiServices("POST", "newApi/resend-otp", { email })
      .then((res) => {
        if (res?.data?.success) {
          message.success("OTP has been sent to your email");
          setResendDisabled(true);
          setTimer(60);
        }
      })
      .catch((err) => {
        message.error(
            `${
            err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error resending OTP"
            }`
        );
      })
  };

  return (
    <Modal
      open={open}
      onClose={() => {}}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableRestoreFocus
      disableEscapeKeyDown 
      BackdropProps={{
        style: { backgroundColor: "rgb(0 0 0 / 87%)" }, 
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          <div className="modal-body">
            <Form
              name="control-hooks"
              onFinish={onFinish}
            >
              <div
                className="form-header"
                style={{ marginBottom: "50px", marginTop: "21px" }}
              >
                <h3 style={{ marginBottom: "20px", wordSpacing : "2px" }}>
                  OTP Verification
                </h3>
                <p style={{ fontSize: "15px", display:"flex", justifyContent: "center", flexDirection: "column"}}>
                  <span>
                    An OTP has been sent to this email address:{" "}                    
                  </span>
                  <span style={{marginLeft:"20px"}}>
                    <strong>{email}</strong>
                    <Button 
                      type="link"
                      onClick={handleResendOtp}
                      disabled={resendDisabled}
                    >
                      Resend OTP {resendDisabled && `(${timer}s)`}
                    </Button>
                  </span>
                </p>
              </div>

              <div className="otp-inputs" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-input-${index}`}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    maxLength={1}
                    style={{ width: "40px", height: "40px", textAlign: "center", fontSize: "18px" }}
                    inputMode="numeric"    
                    onInput={(e) => {
                    // Ensure only numeric input
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                  />
                ))}
              </div>

              <div className="submit-section" style={{ marginTop: "30px" }}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="btn btn-primary submit-btn"
                    disabled={!isOtpComplete || loader}
                  >
                    {loader ? (
                      <Spin size="small" indicator={antIcon} />
                    ) : (
                      t("submit")
                    )}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OtpModal;
