/**
 * Signin Firebase
 */

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Offcanvas from "../../../Entryfile/offcanvance";
import favicon from "../../../files/Icons/DaftarProIcon.svg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Company from "./Company";
import Leaves from "./Leaves";
import Roles from "./Roles";
import Departments from "./Departments";
import Designation from "./Designation";
import Shifts from "./Shifts";
import TaxSlabs from "./TaxSlabs";
import { useSelector } from "react-redux";
import InvoiceTaxes from "./InvoiceTaxes";
import InvoiceTags from "./InvoiceTags";
import InvoiceCounter from "./InvoiceCounter";
import BankDetails from "./BankDetails";
import ExpenseCategory from "./ExpenseCategory";
import { useTranslation } from "react-i18next";
import WokringDays from "./WorkingDays";
import AssetsManagement from "./AssetsManagement";
import AI_Config from "./AI_Config";
import Location from "./Location"


const Settings = ({test}) => {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role
  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  // Generate a unique window ID if it doesn't exist
  useEffect(() => {
    if (!localStorage.getItem('windowId')) {
      localStorage.setItem('windowId', `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  const windowId = localStorage.getItem('windowId');

  // Get initial component from URL or default to Company Settings
  const getInitialComponent = () => {
    const params = new URLSearchParams(location.search);
    const settingFromURL = params.get('setting');
    if (settingFromURL) {
      const decoded = decodeURIComponent(settingFromURL);
      // Redirect old asset component names to Assets Management
      if (decoded === 'Assets Category' || decoded === 'Assets Sub-Category' || decoded === 'Assets Tag') {
        return 'Assets Management';
      }
      return decoded;
    }
    return 'Company Settings';
  };

  const [editModal, setEditModal] = useState('')
  const [showComponent, setShowComponent] = useState(getInitialComponent())

  // Handle menu item clicks
  const handleMenuClick = (setting) => {
    setShowComponent(setting);
    // Update URL without reloading
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('setting', encodeURIComponent(setting));
    window.history.pushState({}, '', newUrl);
  };

  // Create URL for menu items
  const getMenuItemUrl = (setting) => {
    const url = new URL(window.location);
    url.searchParams.set('setting', encodeURIComponent(setting));
    return url.toString();
  };

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  useEffect(() => {
    if(role === 'admin' || permissions?.companyManagement) {

    }else{
      navigate('/restricted', { state: { unAuthorize: true}})
    }
  }, [])
  


useEffect(() => {
  window.scrollTo(0, 0);
  // sessionStorage.clear();
  sessionStorage.setItem(`active_setting`, `${showComponent}`)
}, [showComponent])

// Update component when URL changes
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const settingFromURL = params.get('setting');
  if (settingFromURL) {
    const decoded = decodeURIComponent(settingFromURL);
    // Redirect old asset component names to Assets Management
    if (decoded === 'Assets Category' || decoded === 'Assets Sub-Category' || decoded === 'Assets Tag') {
      setShowComponent('Assets Management');
      // Update URL to reflect the change
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('setting', encodeURIComponent('Assets Management'));
      // Preserve the old setting as subTab for AssetsManagement component
      newUrl.searchParams.set('subTab', encodeURIComponent(decoded));
      window.history.replaceState({}, '', newUrl);
    } else {
      setShowComponent(decoded);
    }
  }
}, [location.search]);


  return (
    <div>
      <div className="page-wrapper">
        <Helmet>
          <title>{
          showComponent==="Company Settings" 
          ? t('settings.companySettings.companySettings') 
          : showComponent==="Leave Settings" 
          ? t('settings.leaveSettings')
          : showComponent==="Location" 
          ? t('settings.location')
          : showComponent==="Roles" 
          ? t('settings.roles')
          : showComponent==="Departments" 
          ? t('settings.departments')
          : showComponent==="Designations" 
          ? t('settings.designations')
          : showComponent==="Shifts" 
          ? t('settings.shifts')
          : showComponent==="Tax Slabs" 
          ? t('settings.taxSlabs')
          : showComponent==="Bank Details" 
          ? t('settings.bankDetails')
          : showComponent==="Invoice Tax Slabs" 
          ? t('settings.invoiceTaxSlabs')
          : showComponent==="Invoice Tags" 
          ? t('settings.invoiceTags')
          : showComponent==="Invoice Counter" 
          ? t('settings.invoiceCounter')
          : showComponent==="Expense Categories" 
          ? t('settings.expenseCategories')
          : showComponent==="Assets Management" 
          ? 'Assets Management'
          : showComponent==="Working Days" 
          ? 'Working Days'
          : showComponent
          } - {t('header.daftarPro')}</title>
          <meta name="description" content="Login page" />
          <link rel="icon" type="image/x-icon" href={favicon} />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-12">
                <h4 className="page-title">{t('sideBar.settings')}</h4>
                
              </div>
              <div className="col-9 m-b-0 text-right"></div>
            </div>
          </div>

          {/* new */}
          <div className="row">
             <div className="col-sm-4 col-md-4 col-lg-4 col-xl-3" style={{paddingBottom: '20px'}}>
               {/* <a href="#" className="btn btn-primary btn-block w-100" data-bs-toggle="modal" data-bs-target="#add_role"><i className="fa fa-plus" /> Add Roles</a> */}
               <div className="roles-menu" style={{margin: '0px'}}>
                 <ul>
                    <li className={showComponent === 'Company Settings' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Company Settings')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Company Settings');
                        }}
                      >
                        <i className="fa fa-fw fa-info-circle" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.companySettings.companySettings')}
                      </a>
                    </li>
                    <li className={showComponent === 'Location' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Location')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Location');
                        }}
                      >
                        <i className="fa fa-fw fa-location-arrow" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        Locations 
                      </a>
                    </li>
                    <li className={showComponent === 'Working Days' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Working Days')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Working Days');
                        }}
                      >
                        <i className="fa fa-fw fa-calendar" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        Working Days
                      </a>
                    </li>
                    <li className={showComponent === 'Leave Settings' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Leave Settings')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Leave Settings');
                        }}
                      >
                        <i className="fa fa-fw fa-warning" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.leaveSettings')}
                      </a>
                    </li>
                    <li className={showComponent === 'Roles' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Roles')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Roles');
                        }}
                      >
                        <i className="fa fa-fw fa-list-alt" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.roles')}
                      </a>
                    </li>
                    <li className={showComponent === 'Departments' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Departments')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Departments');
                        }}
                      >
                        <i className="fa fa-fw fa-sitemap" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.departments')}
                      </a>
                    </li>
                    <li className={showComponent === 'Designations' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Designations')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Designations');
                        }}
                      >
                        <i className="fa fa-fw fa-users" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.designations')}
                      </a>
                    </li>
                    <li className={showComponent === 'Shifts' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Shifts')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Shifts');
                        }}
                      >
                        <i className="fa fa-fw fa-clock-o" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.shifts')}
                      </a>
                    </li>
                    <li className={showComponent === 'Tax Slabs' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Tax Slabs')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Tax Slabs');
                        }}
                      >
                        <i className="fa fa-fw fa-money" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.taxSlabs')}
                      </a>
                    </li>
                    <li className={showComponent === 'Bank Details' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Bank Details')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Bank Details');
                        }}
                      >
                        <i className="fa fa-fw fa-bank" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.bankDetails')}
                      </a>
                    </li>
                    <li className={showComponent === 'Invoice Tax Slabs' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Invoice Tax Slabs')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Invoice Tax Slabs');
                        }}
                      >
                        <i className="fa fa-fw fa-money" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.invoiceTaxSlabs')}
                      </a>
                    </li>
                    <li className={showComponent === 'Invoice Tags' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Invoice Tags')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Invoice Tags');
                        }}
                      >
                        <i className="fa fa-fw fa-tags" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.invoiceTags')}
                      </a>
                    </li>
                    <li className={showComponent === 'Invoice Counter' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Invoice Counter')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Invoice Counter');
                        }}
                      >
                        <i className="fa fa-fw fa-money" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.invoiceCounter')}
                      </a>
                    </li>
                    <li className={showComponent === 'Expense Categories' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Expense Categories')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Expense Categories');
                        }}
                      >
                        <i className="fa fa-fw fa-sitemap" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        {t('settings.expenseCategories')}
                      </a>
                    </li>
                    <li className={showComponent === 'Assets Management' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('Assets Management')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('Assets Management');
                        }}
                      >
                        <i className="fa fa-fw fa-cubes" style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}></i>
                        Assets Management
                      </a>
                    </li>
                    <li className={showComponent === 'AI Configuration' ? 'active' : ''}>
                      <a 
                        href={getMenuItemUrl('AI Configuration')}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuClick('AI Configuration');
                        }}
                      >
                        <i className="fa fa-fw fa-android" 
                          style={{ marginLeft: i18n.dir()==="rtl" ? '8px' : undefined, marginRight: i18n.dir()==="rtl" ? undefined : '8px'}}
                        ></i>
                        AI Configuration
                      </a>
                    </li>
                  </ul>
               </div>
             </div>
             <div className="cardStyle col-sm-8 col-md-8 col-lg-8 col-xl-9">
              {
                showComponent === 'Company Settings' ? <Company /> :
                showComponent === 'Location' ? <Location /> :
                showComponent === 'Leave Settings' ? <Leaves /> :
                showComponent === 'Roles' ? <Roles /> :
                showComponent === 'Departments' ? <Departments /> :
                showComponent === 'Designations' ? <Designation /> :
                showComponent === 'Shifts' ? <Shifts /> : 
                showComponent === 'Tax Slabs' ? <TaxSlabs /> :
                showComponent === 'Invoice Tax Slabs' ? <InvoiceTaxes /> :
                showComponent === 'Invoice Tags' ? <InvoiceTags /> : 
                showComponent === 'Invoice Counter' ? <InvoiceCounter /> : 
                showComponent === 'Bank Details' ? <BankDetails /> : 
                showComponent === 'Expense Categories' ? <ExpenseCategory /> : 
                showComponent === 'Assets Management' ? <AssetsManagement /> : 
                showComponent === 'AI Configuration' ? <AI_Config /> :
                <WokringDays />
              }
             </div>
           </div>

           {/* Add Role Modal */}
         <div id="add_role" className="modal custom-modal fade" role="dialog">
           <div className="modal-dialog modal-dialog-centered" role="document">
             <div className="modal-content">
               <div className="modal-header">
                 <h5 className="modal-title">Add Role</h5>
                 <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                   <span aria-hidden="true">×</span>
                 </button>
               </div>
               <div className="modal-body">
                 <form>
                   <div className="form-group">
                     <label>Role Name <span className="text-danger">*</span></label>
                     <input className="form-control" type="text" />
                   </div>
                   <div className="submit-section">
                     <button className="btn btn-primary submit-btn">Submit</button>
                   </div>
                 </form>
               </div>
             </div>
           </div>
         </div>
         {/* /Add Role Modal */}
         {/* Edit Role Modal */}
         <div id="edit_role" className="modal custom-modal fade" role="dialog">
           <div className="modal-dialog modal-dialog-centered" role="document">
             <div className="modal-content modal-md">
               <div className="modal-header">
                 <h5 className="modal-title">Edit Role {editModal}</h5>
                 <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                   <span aria-hidden="true">×</span>
                 </button>
               </div>
               <div className="modal-body">
                 <form>
                   <div className="form-group">
                     <label>Role Name <span className="text-danger">*</span></label>
                     <input
                        className="form-control"
                        defaultValue={editModal ? editModal : ''}
                        type="text"
                      />
                   </div>
                   <div className="submit-section">
                     <button className="btn btn-primary submit-btn">Save</button>
                   </div>
                 </form>
               </div>
             </div>
           </div>
         </div>
         {/* /Edit Role Modal */}
         {/* Delete Role Modal */}
         <div className="modal custom-modal fade" id="delete_role" role="dialog">
           <div className="modal-dialog modal-dialog-centered">
             <div className="modal-content">
               <div className="modal-body">
                 <div className="form-header">
                   <h3>Delete Role</h3>
                   <p>Are you sure want to delete?</p>
                 </div>
                 <div className="modal-btn delete-action">
                   <div className="row">
                     <div className="col-6">
                       <a href="" className="btn btn-primary continue-btn">Delete</a>
                     </div>
                     <div className="col-6">
                       <a href="" data-bs-dismiss="modal" className="btn btn-primary cancel-btn">Cancel</a>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>

          


        </div>
        {/* /Page Content */}
      </div>
      <Offcanvas />
    </div>
  );
};

export default Settings;
