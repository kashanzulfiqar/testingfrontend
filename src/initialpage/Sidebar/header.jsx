import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  headerlogo, lnEnglish, lnFrench, lnSpanish, lnGerman, Avatar_02, Avatar_03, Avatar_05,
  Avatar_06, Avatar_08, Avatar_09, Avatar_13, Avatar_17, Avatar_21, user_icon
} from '../../Entryfile/imagepath'
import notifications from '../../assets/json/notifications';
import message from '../../assets/json/message';
import DaftarProWhiteIcon from '../../files/Icons/DaftarProWhiteIcon.svg'
import { apiServices } from '../../Services/apiServices';
import { counter } from '../../Redux/Reducer/permissions/pendingCounterSlice';
//import { changeLanguage } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Menu, message as Message1 } from 'antd';
import { DownOutlined, GlobalOutlined } from '@ant-design/icons';

const Header = (props) => {
  const { t, i18n } = useTranslation(); 

  const superAdmin = useSelector((state) => state.superAdmin);
  // const firstchange = (lng) =>{
  //   i18n.changeLanguage(lng);
  //   localStorage.setItem('lang', lng);
  //   document.querySelector('html').setAttribute('lang', lng); // Update lang attribute
  // }

  let userLang = localStorage.getItem("languagePreference");
  //console.log(userLang)

  const languageNames = {
    'en': 'English',
    'ar': 'Arabic'
  };

  useEffect(() => {
    if (props.AdminLogin) {
      nav('super-admin/dashboard')
    }
  }, [])


  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
    document.querySelector('html').setAttribute('lang', lng); // Update lang attribute
    userLang = languageNames[lng];
    const data = { 
      languagePreference: userLang 
    };
    apiServices("PUT", "user/language", data, user_state) 
      .then((res) => {
        if (res?.data?.success === true) {
          Message1.success(t('header.languagePreferenceUpdated'));
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
              : t('header.failedToUpdateLanguage')
          }!`
        );
      });
  };
  

  const LangMenu = (
    <Menu>
      <Menu.Item key="en" onClick={() => changeLanguage('en')}>
        English
      </Menu.Item>
      <Menu.Item key="ar" onClick={() => changeLanguage('ar')}>
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
    document.body.classList.toggle('mini-sidebar');
    props.onBarToggle()
  }
  const onMenuClik = () => {
    props.onMenuClick()
  }
  useEffect(() => {
    // Update direction when language changes
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);

  useEffect(() => {
    if(user_state?.user?.role === 'admin' || permissions?.viewAllRequest || permissions?.teamRequest)
    getCounter()
      }, [location])
    
    
    const getCounter = () => {
        apiServices("GET", "requests/view-all-request?employeeName=&leaveType=&requestTo=&requestFrom=&page=1&limit=10&status=", null, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            console.log('pending', res.data?.pendingRequests);
            dispatch(counter(res.data?.pendingRequests))
          }
        })
      }

  
  let pathname = location.pathname
  // const { loginvalue } = useSelector((state) => state.user);
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const UserName = user_state?.email?.split('@')[0];
  const ProfileName = user_state?.user?.fullName
  const imageURL = user_state?.user?.image
  // const ProfileName = UserName?.charAt(0).toUpperCase() + UserName?.slice(1)
  console.log(ProfileName, "headerLoginvalue=====");
  


  return (
    <div className="header" style={{ right: "0px" }}>
      {/* Logo */}
      <div className="header-left" style={{ float: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
        <Link to={superAdmin == true ? "/super-admin/dashboard" : "/main/dashboard"}className="logo">
          <img src={DaftarProWhiteIcon} width={40} height={40} alt="" />
          {/* <img src={headerlogo} width={40} height={40} alt="" /> */}
        </Link>
      </div>
      {/* /Logo */}
      <a id="toggle_btn" href="javascript:" onClick={handlesidebar} style={{ float: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
        <span className="bar-icon"><span />
          <span />
          <span />
        </span>
      </a>
      {/* Header Title */}
      <div className="page-title-box" style={{ float: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
        <h3>{t('header.daftarPro')}</h3>
      </div>
      {/* /Header Title */}
      <a id="mobile_btn" className="mobile_btn" style={{ float: i18n.dir() === 'rtl' ? 'right' : 'left' }} href="javascript:void(0)" onClick={() => onMenuClik()}><i className="fa fa-bars" /></a>
      {/* Header Menu */}
      <ul className="nav user-menu" style={{ float: i18n.dir() === 'rtl' ? 'left' : 'right' }}>
        {/* Search */}
        <li className="nav-item">
          <div className="top-nav-search">
            {/* <a href="" className="responsive-search">
              <i className="fa fa-search" />
            </a> */}
            <form>
              <input className="form-control" type="text" placeholder={t('header.searchHere')} />
              <button className="btn" type="submit"><i className="fa fa-search" /></button>
            </form>
          </div>
        </li>

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
 
        <li className="nav-item dropdown has-arrow main-drop">
          <a href="javascript:void(0)" className="dropdown-toggle nav-link" data-bs-toggle="dropdown">
            <span className="user-img me-1"><img src={(location?.state?.updated_user?.imageUrl === null || updated_user?.imageUrl === null) ? user_icon : location?.state?.updated_user?.imageUrl ? location?.state?.updated_user?.imageUrl : updated_user?.imageUrl ? updated_user?.imageUrl : imageURL ? imageURL : user_icon} alt="profile" style={{width: '30px', height: '30px'}} />
            {/* <span className="user-img me-1"><img src={Avatar_21} alt="" /> */}
              <span className="status online" /></span>
            <label style={{marginInline: '5px', cursor: 'pointer'}}>{location?.state?.updated_user?.fullName ? ` ${location?.state?.updated_user?.fullName} ` : updated_user?.fullName ? ` ${updated_user?.fullName} ` : ProfileName ? ` ${ProfileName} ` : "Admin"}</label>
          </a>
          <div className="dropdown-menu dropdown-menu-end" style={{marginLeft: '50px !important'}}>
          {
            !superAdmin &&  
            <Link to={user_state?.user?.role === 'client' ? '/client/client-profile' : user_state?.user?.role === 'focalperson' ? '/client/focal-profile' : "/profile"} onClick={() => (user_state?.user?.role === 'client' || user_state?.user?.role === 'focalperson') ? '' : sessionStorage.setItem(`employee_tab`, 'profile')} className="dropdown-item">{t('header.myProfile')}</Link>
          }
            <Link className="dropdown-item" to="/change-password">{t('header.changePassword')}</Link>
            {/* <Link className="dropdown-item" to="/login">Logout</Link> */}
            <a className="dropdown-item" onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              // nav('/login');
              setTimeout(() => {
                localStorage.clear();
                sessionStorage.clear();

                // window.location.href = `${window?.location?.origin}/login`
                // window.location.href = `${window?.location?.origin}${(user_state?.user?.role === 'client' || user_state?.user?.role === 'focalperson') ? '/client/login' : '/login'}`
                window.history.replaceState(null, null, `${window?.location?.origin}${superAdmin ? '/admin-login' : ((user_state?.user?.role === 'client' || user_state?.user?.role === 'focalperson') ? '/client/login' : '/login')}`);
                // window.history.back();
                window.location.reload();
              }, 800);
            }}>{t('header.logout')}</a>
          </div>
        </li>
      </ul>
      {/* /Header Menu */}
      {/* Mobile Menu */}
      <div className="dropdown mobile-user-menu">
        <a href="javascript:void(0)" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v" /></a>
        <div className="dropdown-menu dropdown-menu-start dropdown-menu-left">
        {/* <Link to="/profile" className="dropdown-item">My Profile</Link> */}
        {
          !superAdmin &&  
          <Link to={user_state?.user?.role === 'client' ? '/client/client-profile' : user_state?.user?.role === 'focalperson' ? '/client/focal-profile' : "/profile"} onClick={() => (user_state?.user?.role === 'client' || user_state?.user?.role === 'focalperson') ? '' : sessionStorage.setItem(`employee_tab`, 'profile')} className="dropdown-item">{t('header.myProfile')}</Link>
        }
          <Link className="dropdown-item" to="/change-password">{t('header.changePassword')}</Link>
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
          <a className="dropdown-item" onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              // nav('/login');
              // window.location.href = `${window?.location?.origin}/login`
              setTimeout(() => {
                localStorage.clear();
                sessionStorage.clear();

                // window.location.href = `${window?.location?.origin}${(user_state?.user?.role === 'client' || user_state?.user?.role === 'focalperson') ? '/client/login' : '/login'}`
                window.history.replaceState(null, null, `${window?.location?.origin}${superAdmin ? '/admin-login' : ((user_state?.user?.role === 'client' || user_state?.user?.role === 'focalperson') ? '/client/login' : '/login')}`);
                // window.history.back();
                window.location.reload();
              }, 800);
            }}>{t('header.logout')}</a>
        </div>
      </div>
      {/* /Mobile Menu */}
    </div>

  );
}


export default Header;