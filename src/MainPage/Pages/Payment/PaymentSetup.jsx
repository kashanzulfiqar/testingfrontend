import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiServices } from "../../../Services/apiServices";
import {
  LoadingOutlined,
  LockOutlined,
  CreditCardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { loginSuccess } from "../../../Entryfile/features/users";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

const PaymentSetup = () => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user_state = useSelector((state) => state.user.loginvalue);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    dispatch(loginSuccess(null));
    navigate("/login", { replace: true });
  };

  const createSubscription = async () => {
    const res = await apiServices(
      "POST",
      "stripe/create-subscription",
      {
        companyId: user_state?.user?.companyId,
      },
      user_state
    );

    if (res.data.status) {
      console.log("Subscription created!", res.data.subscriptionId);
    } else {
      alert("Subscription failed: " + res.data.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError(t("payment.stripeNotLoaded"));
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    console.log("element in card elements", cardElement);

    try {
      // Step 1: Request server to create a SetupIntent
      const setupIntentResponse = await apiServices(
        "POST",
        "payment/create-setup-intent",
        { companyId: user_state?.user?.companyId },
        user_state
      );

      console.log(setupIntentResponse);

      const clientSecret = setupIntentResponse?.data?.data?.client_secret;

      if (!clientSecret) {
        throw new Error(t("payment.missingClientSecret"));
      }

      // Step 2: Confirm the card setup
      const { setupIntent, error: confirmError } =
        await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      // Step 3: Send payment method to server to attach
      const response = await apiServices(
        "POST",
        "payment/setup",
        {
          paymentMethodId: setupIntent.payment_method,
          companyId: user_state?.user?.companyId,
        },
        user_state
      );

      if (response?.data?.status) {
        const updatedUserState = {
          ...user_state,
          user: {
            ...user_state.user,
            companyDetails: {
              ...user_state.user.companyDetails,
              subscriptionStatus: response.data.data.subscriptionStatus,
              isActive: response.data.data.isActive,
            },
          },
        };
        dispatch(loginSuccess(updatedUserState));
        createSubscription();
        navigate("/main/dashboard", { replace: true });
      } else {
        setError(response?.data?.message || t("payment.setupFailed"));
      }
    } catch (err) {
      setError(
        err?.response?.data?.msg || err.message || t("payment.processingError")
      );
    }

    setLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        ":focus": {
          color: "#32325d",
        },
        ":-webkit-autofill": {
          color: "#32325d",
        },
      },
      invalid: {
        color: "#dc3545",
        ":focus": {
          color: "#dc3545",
        },
        iconColor: "#dc3545",
      },
    },
    hidePostalCode: true,
  };

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
    <div className="payment-setup-page">
      <Helmet>
        <title>{t("payment.setupTitle")} - DaftarPro</title>
        <meta name="description" content={t("payment.setupDescription")} />
      </Helmet>

      <button onClick={handleLogout} className="logout-button">
        <LogoutOutlined />
        <span>{t("Log-Out")}</span>
      </button>

      <div className="payment-setup-container">
        <div className="payment-setup-card">
          <div className="payment-setup-header">
            <div className="logo-container">
              <CreditCardOutlined className="card-icon" />
            </div>
            <h1>{t("payment.setupRequired")}</h1>
            <p>{t("payment.setupDescription")}</p>
            <div className="secure-badge">
              <LockOutlined /> {t("Secure Payment")}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="payment-setup-form">
            <div className="form-group">
              <label>Card Number</label>
              <div className="card-element-container">
                <CardElement className="card-element" />
              </div>
            </div>

            {error && <p className="text-danger">{error}</p>}

            <button
              style={{ display: "block", justifySelf: "center" }}
              type="submit"
              disabled={!stripe || loading}
              className="btn btn-primary submit-btn"
            >
              {loading ? (
                <Spin size="small" indicator={antIcon} />
              ) : (
                t("payment.addPaymentMethod")
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .payment-setup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
          padding: 20px;
        }

        .payment-setup-container {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .payment-setup-card {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }

        .payment-setup-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-container {
          margin-bottom: 24px;
        }

        .card-icon {
          font-size: 48px;
          color: #ff9b44;
        }

        .payment-setup-header h1 {
          font-size: 24px;
          font-weight: 600;
          color: #1a1f36;
          margin-bottom: 12px;
        }

        .payment-setup-header p {
          color: #697386;
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
        }

        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #55ce631a;
          color: #55ce63;
          border-radius: 20px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #1a1f36;
          font-weight: 500;
        }

        .card-element-container {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          transition: border-color 0.15s ease;
        }

        .card-element-container:hover {
          border-color: #bfdbfe;
        }

        .error-message {
          color: #dc2626;
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .submit-button {
          width: 100%;
          height: 48px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-button:hover:not(:disabled) {
          background: #096dd9;
        }

        .submit-button:disabled {
          background: #bfbfbf;
          cursor: not-allowed;
        }

        .submit-button.loading {
          background: #1890ff;
          opacity: 0.8;
        }

        .secure-info {
          text-align: center;
          margin-top: 24px;
          color: #697386;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .logout-button {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .logout-button:hover {
          background: white;
          color: #dc2626;
          border-color: #fecaca;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .logout-button span {
          line-height: 1;
        }

        @media (max-width: 640px) {
          .payment-setup-card {
            padding: 24px;
          }

          .payment-setup-header h1 {
            font-size: 20px;
          }

          .payment-setup-header p {
            font-size: 14px;
          }

          .logout-button {
            top: 12px;
            right: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentSetup;
