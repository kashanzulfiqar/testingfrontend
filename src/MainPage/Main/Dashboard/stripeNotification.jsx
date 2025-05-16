import React, { useEffect, useState } from "react";
import { message } from "antd";
import { apiServices } from "../../../Services/apiServices";
import { CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";

const NotificationCard = ({ notification, onMarkRead }) => {
  return (
    <div
  className="notification-card"
  style={{ background: "#fee7eb", border: "1px solid #ddd", padding: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
>
  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f62d51" }}>
    <InfoCircleOutlined style={{ paddingTop: '4px', color: "#f62d51" }} />
    <p style={{ margin: 0 }}>{notification.message}</p>
  </div>
  <button type="button" className="close" onClick={() => onMarkRead(notification._id)}>
                <span aria-hidden="true">×</span>
              </button>
  {/* <Close
    onClick={() => onMarkRead(notification._id)}
    style={{ color: "#ff4d4f", cursor: "pointer" }}
  /> */}
</div>
  );
};

export const NotificationBox = ({ user_state }) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    apiServices("GET", "notifications", null, user_state)
      .then((res) => {
        if (res?.data?.success && res?.data?.data?.length > 0) {
          setNotification(res.data.data[0]);
        }
      })
      .catch((err) => {
        message.error("Failed to fetch notifications");
      });
  }, []);

  const handleMarkRead = (id) => {
    apiServices("PATCH", `notifications/${id}/mark-read`, null, user_state)
      .then(() => setNotification(null))
      .catch(() => message.error("Failed to mark as read"));
  };

  if (!notification) return null;

  return <NotificationCard notification={notification} onMarkRead={handleMarkRead} />;
};