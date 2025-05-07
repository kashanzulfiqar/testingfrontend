// src/MainPage/Pages/Billing/Billing.jsx
import React, { useState, useEffect, useRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined, MoreOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  message,
  Spin,
  Table,
  Tag,
} from "antd";
import { Helmet } from "react-helmet";
import { Modal } from "@mui/material";

const Billing = () => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const user_state = useSelector((state) => state.user.loginvalue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardDetails, setCardDetails] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [cardName, setCardName] = useState("");
  const userId = user_state?.user?._id;
  const companyId = user_state?.user?.companyId;
  const [promoCode, setPromoCode] = useState("");
  const [loadings, setLoadings] = useState(false);
  const customerId = currentInvoice?.customerId;
  const subscriptionId = currentInvoice?.subscriptionId;
  const [open, setOpen] = useState({
    isUpdateOpen: false,
  });
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const cardRes = await apiServices(
          "GET",
          `payment/card-details/?userId=${userId}`,
          null,
          user_state
        );
        setCardDetails(cardRes.data.data);

        const currentInvoiceRes = await apiServices(
          "GET",
          `payment/upcoming-invoice?companyId=${companyId}`,
          null,
          user_state
        );
        setCurrentInvoice(currentInvoiceRes.data);
      } catch (err) {
        console.error("Error fetching billing data:", err);
      }
    };

    if (userId) fetchBillingData();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUpdateCard = async (event) => {
    // event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError(t("payment.stripeNotLoaded"));
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { paymentMethod, error: stripeError } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    try {
      const response = await apiServices(
        "POST",
        "payment/update-card",
        { paymentMethodId: paymentMethod.id, userId },
        user_state
      );
      setCardDetails(response.data.data);
      cardElement.clear();
    } catch (err) {
      setError(err?.response?.data?.msg || t("payment.processingError"));
    }
    setOpen({
      isUpdateOpen: false,
    });
    setLoading(false);
  };

  const cardMenu = (
    <Menu>
      <Menu.Item
        key="edit"
        onClick={() => {
          document.getElementById("updateCardForm").scrollIntoView()({
            behavior: "smooth",
          });
          setDropdownVisible(false);
        }}
      >
        {t("billing.updateCard")}
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => setDropdownVisible(false)}>
        {t("billing.delete")}
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
    },
    {
      title: "Created On",
      dataIndex: "creationDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Employees",
      dataIndex: "totalEmployees",
    },
    {
      title: "Per Emp.",
      dataIndex: "amountPerEmployee",
      render: (amount) => `$${amount}`,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (amount) => `$${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Paid" ? "green" : "orange"}>{status}</Tag>
      ),
    },
  ];

  const handleClose = () => {
    setOpen({ isUpdateOpen: false });
    setLoading(false);
  };

  const brandLogos = {
    visa: "https://img.icons8.com/color/48/visa.png",
    mastercard: "https://img.icons8.com/color/48/mastercard-logo.png",
    amex: "https://img.icons8.com/color/48/amex.png",
    discover: "https://img.icons8.com/color/48/discover.png",
    diners: "https://img.icons8.com/color/48/diners-club.png",
    jcb: "https://img.icons8.com/color/48/jcb.png",
    unionpay: "https://img.icons8.com/color/48/unionpay.png",
    default: "https://img.icons8.com/color/48/bank-card-back-side.png",
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

  const handleApply = async () => {
    if (!promoCode) {
      message.error("Please enter a promo code.");
      return;
    }

    setLoadings(true);
    try {
      const response = await apiServices(
        "POST",
        "payment/apply-promo-code",
        { customerId, subscriptionId, promoCode },
        user_state
      );

      message.success("Promo code applied to next invoice!");
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to apply promo code.");
    } finally {
      setLoadings(false);
    }
  };

  const handleCancellation = async () => {
    const response = await apiServices(
      "POST",
      "payment/cancel-subscription",
      { customerId, subscriptionId, userId },
      user_state
    );
    if (response?.data?.status === true){
      console.log("status is true");
      
      window.location.reload();
    }
  };
  return (
    <div className="main-wrapper">
      <Helmet>
        <title>{t("billing.title")}</title>
        <meta name="description" content="Billing page" />
      </Helmet>

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">{t("billing.title")}</h3>
              </div>
            </div>
          </div>

          {/* Current Invoice Box */}
          {currentInvoice && (
            <div className="box invoice-box">
              <div className="box-header">
                <h3>Upcoming Invoice</h3>
                <p className="payment-date">
                  Payment Date
                  <br />
                  <strong>
                    {new Date(currentInvoice.due_date).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </strong>
                </p>
              </div>
              <div className="invoice-amount">
                <h2>
                  ${(currentInvoice.amount_due / 100).toFixed(2)}{" "}
                  {currentInvoice.currency.toUpperCase()}
                </h2>
                <p>
                  Your current charges are based on active user seats linked to
                  your subscription plan.
                </p>
              </div>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount Per User</th>
                    <th>Active Users</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{currentInvoice.line_items[0].description}</td>
                    <td>
                      $
                      {(currentInvoice.line_items[0].unit_amount / 100).toFixed(
                        2
                      )}{" "}
                      {currentInvoice.currency.toUpperCase()}
                    </td>
                    <td>{currentInvoice.line_items[0].quantity}</td>
                    <td>
                      ${(currentInvoice.line_items[0].amount / 100).toFixed(2)}{" "}
                      {currentInvoice.currency.toUpperCase()}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="invoice-summary">
                <div>
                  Sub Total{" "}
                  <span>
                    ${(currentInvoice.line_items[0].amount / 100).toFixed(2)}{" "}
                    {currentInvoice.currency.toUpperCase()}
                  </span>
                </div>
                <div>
                  Tax{" "}
                  <span>
                    {currentInvoice.tax !== null
                      ? `$${(currentInvoice.tax / 100).toFixed(
                          2
                        )} ${currentInvoice.currency.toUpperCase()}`
                      : "-"}
                  </span>
                </div>
                <div className="total-line">
                  Total{" "}
                  <span>${(currentInvoice.amount_due / 100).toFixed(2)}</span>
                </div>
              </div>
              <a href="/billing-history" className="link">
                View Your Past Invoices Billing History
              </a>
            </div>
          )}

          {/* Payment Methods */}
          <div className="box">
            <div className="box-header">
              <h3>Payment Method</h3>
              <button
                className="button-secondary"
                onClick={() => {
                  setOpen({
                    isUpdateOpen: true,
                  });
                }}
              >
                Update Payment Method
              </button>
            </div>
            <p>
              The payment is automatically charged every month using your saved
              payment method.
            </p>

            <div className="payment-method active">
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <img
                  src={brandLogos[cardDetails?.brand] || brandLogos.default}
                  alt={cardDetails?.brand}
                  height="20"
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "black" }}>
                    {cardDetails?.brand?.charAt(0).toUpperCase() +
                      cardDetails?.brand?.slice(1)}{" "}
                    ending in {cardDetails?.last4}
                  </span>
                  <div className="meta">
                    Expiry {cardDetails?.exp_month}/{cardDetails?.exp_year}
                  </div>
                  <span className="badge green">Default</span>
                </div>
              </div>
            </div>

            {/* <div className="payment-method">
              <div>
                <img
                  src="https://img.icons8.com/color/48/visa.png"
                  alt="visa"
                  height="20"
                />
                <span>Visa ending in 3449</span>
                <div className="meta">Expiry 06/27</div>
                <span className="badge orange">Set as Default</span>
              </div>
            </div> */}
          </div>

          {/* Promos */}
          <div className="box">
            <h3>Promos</h3>
            <p>
              If you have promo code, Enter it below to receive your credit.
            </p>
            <div className="promo-row">
              <input
                type="text"
                placeholder="Add New Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button
                className="button-secondary"
                onClick={handleApply}
                disabled={loadings}
              >
                {loadings ? "Applying..." : "Apply Code"}
              </button>
            </div>
          </div>
          <button className="button-danger" onClick={handleCancellation}>
            Cancel Subscription
          </button>
        </div>
        <Modal
          open={open.isUpdateOpen}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          disableRestoreFocus
          BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" },
          }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <div className="centered-header-content">
                  <h5 className="modal-title">Update Payment Method</h5>
                  <p>
                    Please add a payment method to <br></br> continue using the
                    system
                  </p>
                  <span className="badge secure">🔒 Secure Payment</span>
                </div>
                <button type="button" className="close" onClick={handleClose}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <Form
                  onFinish={handleUpdateCard}
                  autoComplete="off"
                  layout="vertical"
                >
                  <div className="form-group">
                    <label>Card Number</label>
                    <div className="custom-border card-element-wrapper">
                      <CardElement className="card-element" />
                    </div>
                  </div>

                  {error && <p className="text-danger">{error}</p>}

                  <div className="submit-section">
                    <Form.Item>
                      <Button
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <Spin size="small" indicator={antIcon} />
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <style jsx>{`
        .page-container {
          height: 100%;
          padding: 24px;
          background: #f5f7fa;
          overflow-y: auto;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .box {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }
        .box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .invoice-amount h2 {
          font-size: 28px;
          margin: 12px 0 4px;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .invoice-table th,
        .invoice-table td {
          border-bottom: 1px solid #eee;
          padding: 12px 8px;
          text-align: left;
        }
        .invoice-summary {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-weight: 500;
        }
        .invoice-summary span {
          float: right;
        }
        .total-line {
          font-size: 18px;
          font-weight: bold;
          margin-top: 8px;
        }
        .payment-method {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .payment-method.active {
          border: 2px solid #f97316;
          background: #fff7ed;
        }
        .meta {
          font-size: 12px;
          color: #6b7280;
        }
        .badge {
          display: inline-block;
          margin-top: 4px;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .badge.green {
          background: #dcfce7;
          color: #15803d;
          width: fit-content;
        }
        .badge.secure {
          background: #55ce631a;
          color: #55ce63;
        }
        .dropdown-icon {
          font-size: 20px;
          cursor: pointer;
        }
        .promo-row {
          display: flex;
          gap: 12px;
          margin: 12px 0;
          width: 50%;
        }
        .promo-row input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .button-secondary {
          background: #fff;
          border: 1px solid #f97316;
          color: #f97316;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
        }
        .button-danger {
          margin-top: 16px;
          border: 1px solid #ef4444;
          color: #ef4444;
          background: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
        }
        .link {
          color: #3b82f6;
          text-decoration: underline;
          margin-top: 16px;
          display: inline-block;
        }
        .centered-header-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Billing;
