import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { user_icon } from '../../Entryfile/imagepath';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Menu, message as Message1 } from 'antd';
import { DownOutlined, GlobalOutlined } from '@ant-design/icons';
import DaftarProWhiteIcon from '../../files/Icons/DaftarProWhiteIcon.svg';
import { apiServices } from '../../Services/apiServices';
import { counter } from '../../Redux/Reducer/permissions/pendingCounterSlice';

const Header = (props) => {
  const { t, i18n } = useTranslation();
  const superAdmin = useSelector((state) => state.superAdmin);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
    document.querySelector('html').setAttribute('lang', lng);
  };

  const { onMenuClick } = props;
  const location = useLocation();
  const nav = useNavigate();
  const dispatch = useDispatch();
  const updated_user = JSON.parse(localStorage.getItem('updated_user'));
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const ProfileName = user_state?.user?.fullName;
  const imageURL = user_state?.user?.image;

  const handlesidebar = () => {
    console.log('sidebar btn is clicked');
    document.body.classList.toggle('mini-sidebar');
    if (props.onBarToggle) props.onBarToggle();
  };

  const onMenuClik = () => {
    console.log("small sideabr is tapped");
    if (onMenuClick) {
      onMenuClick();
    } else {
      console.warn('onMenuClick prop is not provided');
    }
  };

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);

  return (
    <div className="header" style={{ right: '0px' }}>
      {/* Logo */}
      <div className="header-left" style={{ float: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
        <Link to={superAdmin ? '/super-admin/dashboard' : '/main/dashboard'} className="logo">
          <img src={DaftarProWhiteIcon} width={40} height={40} alt="Logo" />
        </Link>
      </div>
      {/* /Logo */}
      <a id="toggle_btn" href="javascript:" onClick={handlesidebar} style={{ float: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
        <span className="bar-icon">
          <span />
          <span />
          <span />
        </span>
      </a>
      {/* Header Title */}
      <div className="page-title-box" style={{ float: i18n.dir() === 'rtl' ? 'right' : 'left' }}>
        <h3>{t('header.daftarPro')}</h3>
      </div>
      {/* /Header Title */}
      <a id="mobile_btn" className="mobile_btn" style={{ float: i18n.dir() === 'rtl' ? 'right' : 'left' }} href="javascript:void(0)" onClick={onMenuClik}>
        <i className="fa fa-bars" />
      </a>
      {/* Header Menu */}
      <ul className="nav user-menu" style={{ float: i18n.dir() === 'rtl' ? 'left' : 'right' }}>
        <li className="nav-item dropdown has-arrow main-drop">
          <a href="javascript:void(0)" className="dropdown-toggle nav-link" data-bs-toggle="dropdown">
            <span className="user-img me-1">
              <img src={imageURL || user_icon} alt="profile" style={{ width: '30px', height: '30px' }} />
              <span className="status online" />
            </span>
            <label style={{ marginInline: '5px', cursor: 'pointer' }}>{ProfileName || 'Admin'}</label>
          </a>
          <div className="dropdown-menu dropdown-menu-end" style={{ marginLeft: '50px !important' }}>
            {!superAdmin && (
              <Link to="/profile" className="dropdown-item">
                {t('header.myProfile')}
              </Link>
            )}
            <Link className="dropdown-item" to="/change-password">
              {t('header.changePassword')}
            </Link>
            <a className="dropdown-item" onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}>
              {t('header.logout')}
            </a>
          </div>
        </li>
      </ul>
      {/* /Header Menu */}
    </div>
  );
};

Header.defaultProps = {
  onMenuClick: () => {},
  onBarToggle: () => {},
};

export default Header;