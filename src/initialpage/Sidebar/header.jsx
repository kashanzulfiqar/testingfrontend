import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { user_icon } from "../../Entryfile/imagepath";
import notifications from "../../assets/json/notifications";
import message from "../../assets/json/message";
import DaftarProWhiteIcon from "../../files/Icons/DaftarProWhiteIcon.svg";
import { apiServices } from "../../Services/apiServices";
//import { changeLanguage } from 'i18next';
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Menu, message as Message1 } from "antd";
import { DownOutlined, GlobalOutlined } from "@ant-design/icons";
import { counter } from "../../Redux/Reducer/permissions/pendingCounterSlice";
import { setHasAssignedInterviews } from "../../Entryfile/features/users.jsx";
import {
  joinNotificationRooms,
  subscribeToNewNotifications,
  subscribeToNotificationRefresh,
} from "../../Services/socketClient";
import { ensurePushSubscription } from "../../Services/pushNotifications";

const Header = (props) => {
  const { t, i18n } = useTranslation();

  const [notifList, setNotifList] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const superAdmin = useSelector((state) => state.superAdmin);
  // const firstchange = (lng) =>{
  //   i18n.changeLanguage(lng);
  //   localStorage.setItem('lang', lng);
  //   document.querySelector('html').setAttribute('lang', lng); // Update lang attribute
  // }

  let userLang = localStorage.getItem("languagePreference");
  //console.log(userLang)

  const languageNames = {
    en: "English",
    ar: "Arabic",
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
    document.querySelector("html").setAttribute("lang", lng); // Update lang attribute
    userLang = languageNames[lng];
    const data = {
      languagePreference: userLang,
    };
    apiServices("PUT", "user/language", data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          Message1.success(t("header.languagePreferenceUpdated"));
          localStorage.setItem("languagePreference", userLang);
        }
      })
      .catch((err) => {
        Message1.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("header.failedToUpdateLanguage")
          }!`
        );
      });
  };

  const notificationRouteMap = {
    task_comment: "/projects/tasks",
    task_assignment: "/projects/tasks",
    task_removal: "/projects/tasks",
  
    project_assignment: "/projects/project_dashboard",
    projectReminder: "/projects/project_dashboard",
    project_removal: "/projects/project_dashboard",
  
    taskboard_assigned: "/task-board",
    taskboard_removal: "/task-board",
  
    leave_status_change: "/employee/requests",
    payment_success: "/payroll/payslip",
    celebration: "/employee/dashboard",
    interview_assignment: "/recruitment/interviews",
  };
  
  const LangMenu = (
    <Menu>
      <Menu.Item key="en" onClick={() => changeLanguage("en")}>
        English
      </Menu.Item>
      <Menu.Item key="ar" onClick={() => changeLanguage("ar")}>
        Arabic
      </Menu.Item>
    </Menu>
  );
  const { onMenuClick } = props;
  // console.log(Emails?.split('@')[0]);
  // const Emailss=Emails;
  //  console.log(loginvalue?.email,"ss");
  const location = useLocation();
  const nav = useNavigate();
  const dispatch = useDispatch();
  const updated_user = JSON.parse(localStorage.getItem("updated_user"));

  const data = notifications.notifications;
  const datas = message.message;
  const [notification, setNotifications] = useState(false);

  const handlesidebar = () => {
    document.body.classList.toggle("mini-sidebar");
    if (typeof props.onBarToggle === "function") {
      props.onBarToggle();
    }
  };
  const onMenuClik = () => {
    if (typeof props.onMenuClick === "function") {
      props.onMenuClick();
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    apiServices("GET", "notifications", null, user_state).then((res) => {
      if (res?.data?.success && res?.data?.data?.length > 0) {
        setNotifList(res.data.data);
      }
    });
  };

  useEffect(() => {
    // Update direction when language changes
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);

  useEffect(() => {
    if (
      !user_state?.user?.superAdmin &&
      (user_state?.user?.role === "admin" ||
        permissions?.viewAllRequest ||
        permissions?.teamRequest)
    )
      getCounter();
  }, []);

  const getCounter = () => {
    apiServices(
      "GET",
      "requests/view-all-request?employeeName=&leaveType=&requestTo=&requestFrom=&page=1&limit=10&status=",
      null,
      user_state
    ).then((res) => {
      if (res?.data?.success === true) {
        console.log("pending", res.data?.pendingRequests);
        dispatch(counter(res.data?.pendingRequests));
      }
    });
  };

  const handleNotificationClick = (item) => {
    const route = notificationRouteMap[item.type];
    if (route) {
      nav(route);
    }
  };
  
  let pathname = location.pathname;
  // const { loginvalue } = useSelector((state) => state.user);
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const UserName = user_state?.email?.split("@")[0];
  const ProfileName = user_state?.user?.fullName;
  const imageURL = user_state?.user?.image;
  const userIdForSocket = user_state?.user?._id || user_state?.email;
  // const ProfileName = UserName?.charAt(0).toUpperCase() + UserName?.slice(1)
  console.log(ProfileName, "headerLoginvalue=====");

  useEffect(() => {
    if (!userIdForSocket) {
      return;
    }

    joinNotificationRooms({
      userId: userIdForSocket,
      companyId: user_state?.user?.companyId,
    });

    const unsubscribe = subscribeToNewNotifications((notification) => {
      if (!notification) {
        return;
      }

      setNotifList((prev) => {
        const alreadyExists = prev.some(
          (item) => item?._id === notification?._id
        );
        if (alreadyExists) {
          return prev.map((item) =>
            item?._id === notification?._id ? notification : item
          );
        }
        // If this notification assigns an interview to the current user,
        // ensure the UI knows the user has assigned interviews so the
        // Interviews tab becomes visible without a full page refresh.
        try {
          if (
            notification?.type === "interview_assignment" &&
            (notification.userId === user_state?.user?._id || notification.userId === user_state?.email)
          ) {
            dispatch(setHasAssignedInterviews(true));
          }
        } catch (e) {
          // best-effort: do not break notifications display
        }

        return [notification, ...prev];
      });
    });

    const unsubscribeRefresh = subscribeToNotificationRefresh(() => {
      loadNotifications();
    });

    return () => {
      unsubscribe();
      unsubscribeRefresh();
    };
  }, [userIdForSocket, user_state?.user?.companyId]);

  useEffect(() => {
    const setupPush = async () => {
      try {
        await ensurePushSubscription({ user: user_state });
      } catch (error) {
        console.error("Push subscription failed", error);
      }
    };

    if (userIdForSocket) {
      setupPush();
    }
  }, [userIdForSocket]);

  const markNotificationRead = (id) => {
    apiServices("PATCH", `notifications/${id}/mark-read`, null, user_state)
      .then((res) => {
        if (res?.data?.success) {
          // Update the notification list in the UI
          setNotifList((prev) =>
            prev.map((notif) =>
              notif._id === id ? { ...notif, read: true } : notif
            )
          );
        }
      })
      .catch((err) => {
        Message1.error(
          err?.response?.data?.msg || "Failed to mark notification as read!"
        );
      });
  };

  const NotificationDropdown = (
    <div
      className="dropdown-menu dropdown-menu-end"
      style={{ minWidth: "300px", maxHeight: "400px", overflowY: "auto" }}
    >
      <div className="p-2">
        <h6 className="fw-bold mb-2">Notifications</h6>

        {notifList.length === 0 && (
          <p className="text-muted mb-0">No notifications</p>
        )}

        {notifList.slice(0, 5).map(
          (item, index) => (
            <div 
              key={index} 
              className="border-bottom py-2" 
              style={{ 
                cursor: "pointer",
                backgroundColor: item.read ? "#ffffff" : "#fff3e0",
                padding: "8px",
                borderRadius: "4px",
                marginBottom: "5px"
              }}
              onClick={() => {
                handleNotificationClick(item);
                if (!item.read) {
                  markNotificationRead(item._id);
                }
              }} 
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <strong>{item.title}</strong>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    cursor: "pointer",
                    marginLeft: "8px"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationRead(item._id);
                  }}
                  title={item.read ? "Mark as unread" : "Mark as read"}
                >
                  {item.read ? "✓" : "•"}
                </span>
              </div>
              <p className="mb-1">{item.message}</p>
            </div>
          )
        )}
        {notifList.length > 5 && (
          <div
            className="text-center mt-2"
            style={{
              cursor: "pointer",
              color: "#007bff",
              fontWeight: 500,
            }}
            onClick={() => nav("/employee/dashboard")}
          >
            View all notifications
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="header" style={{ right: "0px" }}>
      {/* Logo */}
      <div
        className="header-left"
        style={{ float: i18n.dir() === "rtl" ? "right" : "left" }}
      >
        <Link
          to={superAdmin == true ? "/super-admin/dashboard" : "/main/dashboard"}
          className="logo"
        >
          <img src={DaftarProWhiteIcon} width={40} height={40} alt="" />
          {/* <img src={headerlogo} width={40} height={40} alt="" /> */}
        </Link>
      </div>
      {/* /Logo */}
      <a
        id="toggle_btn"
        href="javascript:"
        onClick={handlesidebar}
        style={{ float: i18n.dir() === "rtl" ? "right" : "left" }}
      >
        <span className="bar-icon">
          <span />
          <span />
          <span />
        </span>
      </a>
      {/* Header Title */}
      <div
        className="page-title-box"
        style={{ float: i18n.dir() === "rtl" ? "right" : "left" }}
      >
        <h3>{t("header.daftarPro")}</h3>
      </div>
      {/* /Header Title */}
      <a
        id="mobile_btn"
        className="mobile_btn"
        style={{ float: i18n.dir() === "rtl" ? "right" : "left" }}
        href="javascript:void(0)"
        onClick={() => onMenuClik()}
      >
        <i className="fa fa-bars" />
      </a>
      {/* Header Menu */}
      <ul
        className="nav user-menu"
        style={{ float: i18n.dir() === "rtl" ? "left" : "right" }}
      >
        {/* Search */}
        {/* <li className="nav-item">
          <div className="top-nav-search"> */}
        {/* <a href="" className="responsive-search">
              <i className="fa fa-search" />
            </a> */}
        {/* <form>
              <input className="form-control" type="text" placeholder={t('header.searchHere')} />
              <button className="btn" type="submit"><i className="fa fa-search" /></button>
            </form>
          </div>
        </li> */}

        {/* <li className="nav-item dropdown has-arrow main-drop"
        style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
          <div className="dropdown">
            <button
              className="btn btn-transparent text-light dropdown-toggle"
              type="button"
              id="languageDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ background: 'transparent', border: 'none' }}
            >
              <GlobalOutlined style={{ marginRight: '5px' }} />
              {i18n.language === 'en' ? 'English' : 'العربية'} 
            </button>
            <ul className="dropdown-menu dropdown-menu1 dropdown-menu-end" aria-labelledby="languageDropdown">
              <li><button className="dropdown-item" onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>English</button></li>
              <li><button className="dropdown-item" onClick={() => changeLanguage('ar')} disabled={i18n.language === 'ar'}>العربية</button></li>
            </ul>
          </div>
        </li> */}
        <li className="nav-item dropdown">
          <a
            href="javascript:void(0)"
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <i className="fa fa-bell" style={{ fontSize: "18px" }}></i>

            {notifList.filter(n => !n.read).length > 0 && (
              <span
                className="badge bg-danger"
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "0px",
                  fontSize: "10px",
                }}
              >
                {notifList.filter(n => !n.read).length}
              </span>
            )}
          </a>

          {NotificationDropdown}
        </li>

        <li className="nav-item dropdown has-arrow main-drop">
          <a
            href="javascript:void(0)"
            className="dropdown-toggle nav-link"
            data-bs-toggle="dropdown"
          >
            <span className="user-img me-1">
              <img
                src={
                  location?.state?.updated_user?.imageUrl === null ||
                  updated_user?.imageUrl === null
                    ? user_icon
                    : location?.state?.updated_user?.imageUrl
                    ? location?.state?.updated_user?.imageUrl
                    : updated_user?.imageUrl
                    ? updated_user?.imageUrl
                    : imageURL
                    ? imageURL
                    : user_icon
                }
                alt="profile"
                style={{ width: "30px", height: "30px" }}
              />
              {/* <span className="user-img me-1"><img src={Avatar_21} alt="" /> */}
              <span className="status online" />
            </span>
            <label style={{ marginInline: "5px", cursor: "pointer" }}>
              {location?.state?.updated_user?.fullName
                ? ` ${location?.state?.updated_user?.fullName} `
                : updated_user?.fullName
                ? ` ${updated_user?.fullName} `
                : ProfileName
                ? ` ${ProfileName} `
                : "Admin"}
            </label>
          </a>
          <div
            className="dropdown-menu dropdown-menu-end"
            style={{ marginLeft: "50px !important" }}
          >
            {!superAdmin && (
              <Link
                to={
                  user_state?.user?.role === "client"
                    ? "/client/client-profile"
                    : user_state?.user?.role === "focalperson"
                    ? "/client/focal-profile"
                    : "/profile"
                }
                onClick={() =>
                  user_state?.user?.role === "client" ||
                  user_state?.user?.role === "focalperson"
                    ? ""
                    : sessionStorage.setItem(`employee_tab`, "profile")
                }
                className="dropdown-item"
              >
                {t("header.myProfile")}
              </Link>
            )}
            <Link className="dropdown-item" to="/change-password">
              {t("header.changePassword")}
            </Link>
            {/* <Link className="dropdown-item" to="/login">Logout</Link> */}
            <a
              className="dropdown-item"
              onClick={() => {
                // First trigger the logout event for other tabs with user info
                const logoutData = {
                  userId: user_state?.user?._id || user_state?.email,
                  timestamp: Date.now(),
                };
                localStorage.setItem("logout", JSON.stringify(logoutData));
                // Then handle the logout in this tab
                localStorage.clear();
                sessionStorage.clear();
                const currentOrigin = window?.location?.origin;
                window.history.replaceState(
                  null,
                  null,
                  `${currentOrigin}${
                    superAdmin
                      ? "/admin-login"
                      : user_state?.user?.role === "client" ||
                        user_state?.user?.role === "focalperson"
                      ? "/client/login"
                      : "/login"
                  }`
                );
                window.location.reload();
              }}
            >
              {t("header.logout")}
            </a>
          </div>
        </li>
      </ul>
      {/* /Header Menu */}
      {/* Mobile Menu */}
      <div className="dropdown mobile-user-menu">
        <a
          href="javascript:void(0)"
          className="nav-link dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fa fa-ellipsis-v" />
        </a>
        <div className="dropdown-menu dropdown-menu-start dropdown-menu-left">
          {/* <Link to="/profile" className="dropdown-item">My Profile</Link> */}
          <a
            className="dropdown-item"
            href="#"
            onClick={(e) => {
              e.preventDefault(); // stops browser link behavior
              e.stopPropagation(); // stops bootstrap dropdown from closing
              setNotifOpen(!notifOpen);
            }}
          >
            <i className="fa fa-bell me-2"></i> Notifications
            {notifList.filter(n => !n.read).length > 0 && (
              <span
                className="badge bg-danger"
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "0px",
                  fontSize: "10px",
                }}
              >
                {notifList.filter(n => !n.read).length}
              </span>
            )}
          </a>

          {notifOpen && (
            <div
              className="p-2 border-top"
              onClick={(e) => e.stopPropagation()} // <== IMPORTANT
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {notifList.length === 0 && (
                <p className="text-muted mb-0">No notifications</p>
              )}

              {notifList.slice(0, 5).map((item, index) => (
                <div 
                  key={index} 
                  className="border-bottom py-2"  
                  style={{ 
                    cursor: "pointer",
                    backgroundColor: item.read ? "#ffffff" : "#fff3e0",
                    padding: "8px",
                    borderRadius: "4px",
                    marginBottom: "5px"
                  }}
                  onClick={() => {
                    handleNotificationClick(item);
                    if (!item.read) {
                      markNotificationRead(item._id);
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <strong>{item.title}</strong>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        cursor: "pointer",
                        marginLeft: "8px"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(item._id);
                      }}
                      title={item.read ? "Mark as unread" : "Mark as read"}
                    >
                      {item.read ? "✓" : "•"}
                    </span>
                  </div>
                  <p className="mb-1">{item.message}</p>
                </div>
              ))}
              {notifList.length > 5 && (
                <div
                  className="text-center mt-2"
                  style={{
                    cursor: "pointer",
                    color: "#007bff",
                    fontWeight: 500,
                  }}
                  onClick={() => nav("/employee/dashboard")}
                >
                  View all notifications
                </div>
              )}
            </div>
          )}

          {!superAdmin && (
            <Link
              to={
                user_state?.user?.role === "client"
                  ? "/client/client-profile"
                  : user_state?.user?.role === "focalperson"
                  ? "/client/focal-profile"
                  : "/profile"
              }
              onClick={() =>
                user_state?.user?.role === "client" ||
                user_state?.user?.role === "focalperson"
                  ? ""
                  : sessionStorage.setItem(`employee_tab`, "profile")
              }
              className="dropdown-item"
            >
              {t("header.myProfile")}
            </Link>
          )}
          <Link className="dropdown-item" to="/change-password">
            {t("header.changePassword")}
          </Link>
          {/* <Link className="dropdown-item" to="/login">Logout</Link> */}
          {/* <a
      className="dropdown-item"
      onClick={() => {
        const newLanguage = i18n.language === 'en' ? 'ar' : 'en';
        changeLanguage(newLanguage);
      }}
    >
      <GlobalOutlined style={{ marginLeft: i18n.dir()==="rtl" ? '5px' : "unset", marginRight: i18n.dir()==="rtl" ? 'unset' : "5px" }} /> 
      {i18n.language === 'en' ? t('header.switchToLanguage', {language: "'العربية'"}) : t('header.switchToLanguage', {language: "'English'"})}
    </a> */}
          <a
            className="dropdown-item"
            onClick={() => {
              // First trigger the logout event for other tabs with user info
              const logoutData = {
                userId: user_state?.user?._id || user_state?.email,
                timestamp: Date.now(),
              };
              localStorage.setItem("logout", JSON.stringify(logoutData));
              // Then handle the logout in this tab
              localStorage.clear();
              sessionStorage.clear();
              const currentOrigin = window?.location?.origin;
              window.history.replaceState(
                null,
                null,
                `${currentOrigin}${
                  superAdmin
                    ? "/admin-login"
                    : user_state?.user?.role === "client" ||
                      user_state?.user?.role === "focalperson"
                    ? "/client/login"
                    : "/login"
                }`
              );
              window.location.reload();
            }}
          >
            {t("header.logout")}
          </a>
        </div>
      </div>
      {/* /Mobile Menu */}
    </div>
  );
};

export default Header;
