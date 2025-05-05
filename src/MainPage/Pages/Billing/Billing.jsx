// src/MainPage/Pages/Billing/Billing.jsx
import React, { useState, useEffect, useRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined, MoreOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Dropdown, Menu, Table, Tag } from "antd";
import { Helmet } from "react-helmet";

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

  const userId = user_state?.user?._id;
  const companyId = user_state?.user?.companyId;

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
    event.preventDefault();
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
              <button className="button-secondary">Add Payment Method</button>
            </div>
            <p>
              The payment is automatically charged every month using your saved
              payment method.
            </p>

            <div className="payment-method active">
              <div>
                <img
                  src="https://img.icons8.com/color/48/mastercard-logo.png"
                  alt="mastercard"
                  height="20"
                />
                <span>Master ending in {cardDetails?.last4}</span>
                <div className="meta">
                  Expiry {cardDetails?.exp_month}/{cardDetails?.exp_year}
                </div>
                <span className="badge green">Default</span>
              </div>
              <div ref={dropdownRef}>
                <Dropdown
                  overlay={cardMenu}
                  trigger={["click"]}
                  visible={dropdownVisible}
                  onVisibleChange={(flag) => setDropdownVisible(flag)}
                >
                  <MoreOutlined className="dropdown-icon" />
                </Dropdown>
              </div>
            </div>

            <div className="payment-method">
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
            </div>
          </div>

          {/* Promos */}
          <div className="box">
            <h3>Promos</h3>
            <p>
              If you have promo code, Enter it below to receive your credit.
            </p>
            <div className="promo-row">
              <input type="text" placeholder="Add New Promo Code" />
              <button className="button-secondary">Apply Code</button>
            </div>
            <button className="button-danger">Cancel Subscription</button>
          </div>
        </div>
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
        }
        .badge.orange {
          background: #ffedd5;
          color: #c2410c;
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
      `}</style>
      {/* .page-header h1 {
          margin: 8px 0;
          font-size: 24px;
          font-weight: 500;
        }

        .page-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .billing-content {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .billing-form {
          margin-top: 20px;
        }

        .card-element {
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .error-message {
          color: #dc2626;
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
        }

        .submit-button {
          width: 100%;
          height: 48px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #096dd9;
        }

        .submit-button:disabled {
          background: #bfbfbf;
          cursor: not-allowed;
        }

        .card-info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        @media (max-width: 640px) {
          .page-container {
            padding: 16px;
          }

          .billing-content {
            padding: 16px;
          }
        }
      `}</style> */}
    </div>
  );
};

export default Billing;
