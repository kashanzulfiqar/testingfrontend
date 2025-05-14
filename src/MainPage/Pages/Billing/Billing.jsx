// src/MainPage/Pages/Billing/Billing.jsx
import React, { useState, useEffect, useRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import {
  CreditCardOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  MoreOutlined,
} from "@ant-design/icons";
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
  const [isCancelling, setIsCancelling] = useState(false);
  const customerId = currentInvoice?.customerId;
  const subscriptionId = currentInvoice?.subscriptionId;
  const [open, setOpen] = useState({
    isUpdateOpen: false,
  });
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
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
      window.location.reload();
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to apply promo code.");
    } finally {
      setLoadings(false);
    }
  };

  const handleCancel = () => {
    setCancelModal({
      isOpen: true,
    });
  };

  const handleCloseCancelModal = () => {
    setCancelModal({
      isOpen: false,
    });
  };

  const handleCancellation = async () => {
    setIsCancelling(true);
    try {
      const response = await apiServices(
        "POST",
        "payment/cancel-subscription",
        { customerId, subscriptionId, userId },
        user_state
      );
      if (response?.data?.status === true) {
        window.location.reload();
      }
    } catch (error) {
      message.error("Failed to cancel subscription");
    } finally {
      setIsCancelling(false);
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
                <h3 className="page-title">{t("Subscription Details")}</h3>
              </div>
            </div>
          </div>

          <div className="box">
            {/* Current Invoice Box */}
            {currentInvoice && (
              <div className="invoice-box">
                <h3>Upcoming Invoice</h3>
                <div className="section-box">
                  <div className="box-header">
                    <div>
                      <h4>Amount Due</h4>
                      <h3>${(currentInvoice.amount_due / 100).toFixed(2)}</h3>
                    </div>
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
                    <p>
                      Your current charges are based on active user seats linked
                      to your subscription plan.
                    </p>
                  </div>
                  <table className="invoice-table">
                    <thead style={{ backgroundColor: "#F8F8F8" }}>
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
                          {(
                            currentInvoice.line_items[0].unit_amount / 100
                          ).toFixed(2)}
                        </td>
                        <td>{currentInvoice.line_items[0].quantity}</td>
                        <td>
                          $
                          {(currentInvoice.line_items[0].amount / 100).toFixed(
                            2
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="invoice-summary">
                    <div className="summary-row">
                      <span className="label">Sub Total</span>
                      <span className="value">
                        $
                        {(currentInvoice.line_items[0].amount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="label">Discount</span>
                      <span className="value">
                        {currentInvoice.discount !== null
                          ? `${(currentInvoice.discount / 100).toFixed(2)}`
                          : "-"}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="label">Tax</span>
                      <span className="value">
                        {currentInvoice.tax !== null
                          ? `$${(currentInvoice.tax / 100).toFixed(2)}`
                          : "-"}
                      </span>
                    </div>

                    <div className="total-line">
                      <div className="summary-row total">
                        <span className="label">Total</span>
                        <span className="value">
                          ${(currentInvoice.amount_due / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <span>View Your Past </span>
                <a href="/invoice-history" className="link">
                  Invoices History
                </a>
              </div>
            )}

            {/* Payment Methods */}
            <div className="section-box">
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
                The payment is automatically charged every month using your
                saved payment method.
              </p>

              <div className="payment-method">
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

            <p style={{ marginTop: "16px" }}>
              <InfoCircleOutlined /> Your payment information is securely
              encrypted and processed through trusted payment gateways.
            </p>
            {/* Promos */}
            <div className="section-box" style={{ width: "50%" }}>
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
                  style={{
                    color: "white",
                    backgroundColor: "#ff9b44",
                    borderRadius: "8px",
                  }}
                  className="button-secondary"
                  onClick={handleApply}
                  disabled={loadings}
                >
                  {loadings ? "Applying..." : "Apply Code"}
                </button>
              </div>
            </div>
            <button className="button-danger" onClick={handleCancel}>
              Cancel Subscription
            </button>
          </div>
        </div>
        <Modal
          open={cancelModal.isOpen}
          onClose={handleCloseCancelModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          disableRestoreFocus
          BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" },
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ height: "280px" }}>
              <div
                className="modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="form-header">
                  <h3 style={{ marginBottom: "30px" }}>Cancel Subscription</h3>
                  <p>Are you sure you want to cancel this subscription?</p>
                </div>
                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <Button
                        className="btn btn-primary continue-btn"
                        onClick={handleCancellation}
                        style={{ width: "100%" }}
                        disabled={isCancelling}
                      >
                        Confirm
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        onClick={handleCloseCancelModal}
                        className="btn btn-primary submit-btn"
                        style={{ width: "100%" }}
                        disabled={isCancelling}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

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
                  <div className="logo-container">
                    <CreditCardOutlined className="card-icon" />
                  </div>
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
        .section-box {
          margin-top: 20px;
          border-radius: 8px;
          border: 1px solid #00000026;
          padding: 20px 10px;
        }
        .box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
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
          gap: 12px;
          font-weight: 500;
          max-width: 300px; /* optional: restrict width */
          margin-left: auto; /* aligns summary with the right column */
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
        }

        .summary-row.total {
          font-weight: bold;
          border-top: 2px solid #e0e0e0;
          padding-top: 12px;
        }

        .summary-row .label {
          flex: 1;
          text-align: left;
        }

        .summary-row .value {
          margin-right: 24px;
          text-align: right;
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
        }
        .promo-row input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .button-secondary {
          background: #fff;
          border: 1px solid #ff9b44;
          color: #ff9b44;
          padding: 8px 16px;
          border-radius: 25px;
          font-weight: 500;
        }
        .button-danger {
          display: block;
          justify-self: end;
          margin-top: 16px;
          border: 1px solid #f62d51;
          color: #f62d51;
          background: #fff;
          padding: 8px 16px;
          border-radius: 25px;
          font-weight: 500;
        }
        .link {
          color: #3b82f6;
          text-decoration: underline;
          margin-top: 16px;
          display: inline-block;
        }
        .logo-container {
          margin-bottom: 24px;
        }

        .card-icon {
          font-size: 48px;
          color: #ff9b44;
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
