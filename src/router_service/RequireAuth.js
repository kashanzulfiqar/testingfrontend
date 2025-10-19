import React, { useEffect, useState, useRef } from 'react'

import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../Entryfile/features/users';
import { apiServices } from '../Services/apiServices';
import Header from '../initialpage/Sidebar/header';
import Sidebar from '../initialpage/Sidebar/sidebar';
import PaymentSetup from '../MainPage/Pages/Payment/PaymentSetup';
import DaftarProLogo from '../files/Icons/DaftraProLogo.svg';

const RequireAuth = ({Role}) => {
    const nav = useNavigate();
    const dispatch = useDispatch();
    const value = useSelector(state => state.user.loginvalue)
    const role = value?.user?.role
    const companyDetails = value?.user?.companyDetails
    const firstTimeLogin = localStorage.getItem("firstTimeLogin");
    const { auth } = useAuth();
    const location = useLocation();
    const superAdmin = useSelector((state) => state.superAdmin);
    const hasCheckedSubscriptionRef = useRef(false);
    const permissions = useSelector((state) => state.permissionsSlice.data);

    let AuthRole = value ? true : false

    const [menu, setMenu] = useState(false);
    const [barMenu, setBarMenu] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

    const handleLogout = () => {
      localStorage.clear();
      sessionStorage.clear();
      dispatch(loginSuccess(null));
      nav("/login", { replace: true });
    };



    // Fetch subscription status for admin users first (skip on super-admin routes)
    useEffect(() => {
      const fetchSubscriptionStatus = async () => {
        // Skip subscription check entirely on super-admin routes
        if (location.pathname.startsWith('/super-admin')) {
          hasCheckedSubscriptionRef.current = true;
          return;
        }
        // Only fetch for admin users and if we haven't checked yet
        if (!isCheckingSubscription && !hasCheckedSubscriptionRef.current) {
          try {
            setIsCheckingSubscription(true);
            const response = await apiServices(
              'GET',
              'company/subscription-status',
              null,
              value
            );

            if (response?.data?.success) {
              // Update Redux state with subscription status
              const updatedUserState = {
                ...value,
                user: {
                  ...value.user,
                  companyDetails: {
                    ...value.user.companyDetails,
                    subscriptionStatus: response.data.subscriptionStatus
                  }
                }
              };
              dispatch(loginSuccess(updatedUserState));
            }
          } catch (error) {
            const errorMsg = error?.response?.data?.msg || error?.message || "";
            const errorName = error?.response?.data?.error?.name || "";

            if (
              error?.response?.status === 500 ||
              errorName === "TokenExpiredError" ||
              errorMsg.toLowerCase().includes("token expired") ||
              errorMsg.toLowerCase().includes("jwt expired")
            ) {
              // Clear user state and redirect to login
              localStorage.clear();
              sessionStorage.clear();
              dispatch(loginSuccess(null));
              nav("/login", { replace: true });
              return; // Stop further execution
            } else {
            console.error('Error fetching subscription status:', error?.response?.data || error);
            // If there's an error, we'll assume the subscription is incomplete
            const updatedUserState = {
              ...value,
              user: {
                ...value.user,
                companyDetails: {
                  ...value.user.companyDetails,
                  subscriptionStatus: 'incomplete'
                }
              }
            };
            dispatch(loginSuccess(updatedUserState));}
          } finally {
            setIsCheckingSubscription(false);
            hasCheckedSubscriptionRef.current = true;
          }
        }
      };

      fetchSubscriptionStatus();
    }, [role, isCheckingSubscription, location.pathname]);

    const toggleMobileMenu = () => {
      setMenu(!menu);
      document.body.classList.remove('mini-sidebar');
    };
    const toggleBar = () => {
      setBarMenu(!barMenu);
    };
    
    useEffect(() => {
      // Detect Safari using more robust feature detection (for both mobile and desktop)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                       (navigator.vendor && navigator.vendor.includes('Apple') && !navigator.userAgent.includes('CriOS') && !navigator.userAgent.includes('FxiOS'));
    
      // if (isSafari) {
      //   console.log("Detected Safari");
      //   // Apply custom styles for Safari
      //   document.documentElement.style.setProperty('--word-spacing', '0px');
      //   document.documentElement.style.setProperty('--heading-spacing', '0px');
      //   document.documentElement.style.setProperty('--div-spacing', '0px');
      //   document.documentElement.style.setProperty('--a-spacing', '0px');
      // } else {
      //   console.log("Not Safari");
      //   document.documentElement.style.setProperty('--word-spacing', '-3.5px');
      //   document.documentElement.style.setProperty('--heading-spacing', '-7px');
      //   document.documentElement.style.setProperty('--div-spacing', '-2px');
      //   document.documentElement.style.setProperty('--a-spacing', '-4px');
      // }

      document.documentElement.style.setProperty('--word-spacing', '0px');
      document.documentElement.style.setProperty('--heading-spacing', '0px');
      document.documentElement.style.setProperty('--div-spacing', '0px');
      document.documentElement.style.setProperty('--a-spacing', '0px');
    }, []);

    useEffect(() => {
      if (value?.user) {
        setIsLoading(false);
      }
    }, [value]);

    // Early return conditions
    if (isLoading || isCheckingSubscription) {
      return null;
    }

    if (!AuthRole) {
      return <Navigate to='/login' replace={true} />;
    }

    // Check for non-admin roles with incomplete subscription
    if (role === '' && companyDetails?.subscriptionStatus === 'incomplete' && !permissions?.stripeManagement) {
      return (
        <div style={{padding: '20px 0px'}}>
          <div className="account-logo pt-3 pb-2" style={{ textAlign: 'center' }}>
            <img src={DaftarProLogo} alt="DaftarPro" />
          </div>
          <div className="account-content" style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="container">
              {/* Account Logo */}
              <div className="account-box" style={{ width: '100%', maxWidth: '514px', height: 'auto', paddingInline: '55px', margin: '0 auto' }}>
                <div className="account-wrapper">
                  {/* <h3 className="account-title" style={{ padding: '17px 0px 40px 0px' }}>Subscription Status</h3> */}
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#333', marginBottom: '15px' }}>Subscription Expired</h2>
                    <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
                      Please contact your administrator to activate the subscription.
                    </p>
                  </div>
                  <div className="form-group text-center" style={{ marginTop: '35px' }}>
                    <button
                      className="btn btn-primary account-btn"
                      onClick={handleLogout}
                      style={{ width: '100%' }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Check for incomplete subscription before any other logic
    if ((role === 'admin' || permissions?.stripeManagement) && companyDetails?.subscriptionStatus === 'incomplete') {
      // If we're already on the payment setup page, show it
      if (location.pathname === '/payment/setup') {
        return <PaymentSetup />;
      }
      // Otherwise redirect to payment setup
      return <Navigate to="/payment/setup" replace={true} />;
    }

    // Only proceed with other routing logic if payment is not required
    if (superAdmin && !location.pathname.startsWith('/super-admin')) {
      return <Navigate to='/super-admin/dashboard' replace={true} />;
    }

    if (firstTimeLogin && (!role || (role === 'client' || role === 'focalperson'))) {
      return <Navigate to='/change-password' replace={true} />;
    }

    if (role === 'client' && 
        !location.pathname.includes('/client/client-profile') && 
        !location.pathname.includes('/client/focal-profile') && 
        !location.pathname.includes('/change-password') && 
        !location.pathname.includes('invoices/view-invoice') && 
        !location.pathname.includes('/projects/projects-view/') &&
        !location.pathname.includes('/projects/project_dashboard') &&
        !location.pathname.includes('/projects/tasks') &&
        !location.pathname.includes('/tasks/') &&
        !location.pathname.includes('/task-board')) {
      return <Navigate to='/client/client-profile' replace={true} />;
    }

    if (role === 'focalperson' && 
        !location.pathname.includes('/client/focal-profile') && 
        !location.pathname.includes('/change-password') && 
        !location.pathname.includes('/projects/projects-view/') &&
        !location.pathname.includes('/projects/project_dashboard') &&
        !location.pathname.includes('/projects/tasks') &&
        !location.pathname.includes('/tasks/') &&
        !location.pathname.includes('/task-board')) {
      return <Navigate to='/client/focal-profile' replace={true} />;
    }

    // Only render the full layout if all checks pass
    return (
        <div className={`main-wrapper ${menu ? 'slide-nav' : ''}`}> 
            <Header onMenuClick={toggleMobileMenu} onBarToggle={toggleBar} AdminLogin={superAdmin} /> 
            <Sidebar barMenu={barMenu} /> 
            <Outlet />
        </div>
    );
}

export default RequireAuth;
