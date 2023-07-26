/**
 * Signin Firebase
 */

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Offcanvas from "../../../Entryfile/offcanvance";
import favicon from "../../../files/Icons/DaftarProIcon.svg";
import { Link } from "react-router-dom";
import Company from "./Company";
import Leaves from "./Leaves";
import Roles from "./Roles";
import Departments from "./Departments";
import Designation from "./Designation";
import Shifts from "./Shifts";
import TaxSlabs from "./TaxSlabs";

const Settings = ({test}) => {

  const [editModal, setEditModal] = useState('')
  const [showComponent, setShowComponent] = useState('Company Settings')

  console.log('logi====', test);

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  return (
    <div>
      <div className="page-wrapper">
        <Helmet>
          <title>{showComponent} - DaftarPro</title>
          <meta name="description" content="Login page" />
          <link rel="icon" type="image/x-icon" href={favicon} />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-12">
                <h4 className="page-title">Settings</h4>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to ='/'>
                      Dashboard
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">{showComponent}</li>
                </ul>
              </div>
              <div className="col-9 m-b-0 text-right"></div>
            </div>
          </div>
          {/* ----- oldd ---- */}
          {/* <div className="row">
            <div className="cardStyle col-sm-4 col-md-4 col-lg-3 col-12">
              <div
                id="setting-nav"
                className="card-box settings-menu hidden-xs"
              >
                <ul>
                  <li>
                    <a
                      data-toggle="collapse"
                      data-parent="#setting-nav"
                      href="#email_menu"
                    >
                      <i className="fa fa-fw fa-envelope-o"></i> Email Settings
                    </a>
                    <ul id="email_menu" className="collapse">
                      <li class>
                        <a href="https://newhrms.com/newhrms_stagging/settings/?settings=email">
                          <i className="fa fa-fw fa-envelope-o"></i>
                          Email Settings{" "}
                        </a>
                      </li>
                      <li class>
                        <a href="https://newhrms.com/newhrms_stagging/settings/?settings=templates">
                          <i className="fa fa-fw fa-pencil-square"></i>
                          Email Templates{" "}
                        </a>
                      </li>
                    </ul>
                  </li>{" "}
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=general">
                      <i className="fa fa-fw fa-info-circle"></i>
                      General Settings{" "}
                    </a>
                  </li>
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=system">
                      <i className="fa fa-fw fa-desktop"></i>
                      System Settings{" "}
                    </a>
                  </li>
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=approval">
                      <i className="fa fa-fw fa fa-thumbs-up"></i>
                      Approval Settings{" "}
                    </a>
                  </li>
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=performance">
                      <i className="fa fa-fw fa fa-bar-chart"></i>
                      Performance Settings{" "}
                    </a>
                  </li>
                  <li className="active">
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=data_import">
                      <i className="fa fa-fw fa-download"></i>
                      Data Import{" "}
                    </a>
                  </li>
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=leave_settings">
                      <i className="fa fa-fw fa-exclamation-triangle"></i>
                      Leave Settings{" "}
                    </a>
                  </li>
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=theme">
                      <i className="fa fa-fw fa-code"></i>
                      Theme Settings{" "}
                    </a>
                  </li>
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=menu">
                      <i className="fa fa-fw fa-list-alt"></i>
                      Roles & Privileges{" "}
                    </a>
                  </li>
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=translations">
                      <i className="fa fa-fw fa-globe"></i>
                      Translations{" "}
                    </a>
                  </li>
                  <li class>
                    <a href="https://newhrms.com/newhrms_stagging/settings/?settings=tokbox_settings">
                      <i className="fa fa-fw fa fa-commenting"></i>
                      TokBox Settings{" "}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="cardStyle col-sm-8 col-md-8 col-lg-9 col-12">
              <div className="page-header">
                <div className="row">
                  <div className="col-sm-12">
                    <h3 className="page-title">Company Settings</h3>
                  </div>
                </div>
              </div>
              <form>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        defaultValue="Dreamguy's Technologies"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Contact Person</label>
                      <input
                        className="form-control "
                        defaultValue="Daniel Porter"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        className="form-control "
                        defaultValue="3864 Quiet Valley Lane, Sherman Oaks, CA, 91403"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-3">
                    <div className="form-group">
                      <label>Country</label>
                      <select className="form-control select">
                        <option>USA</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-3">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        className="form-control"
                        defaultValue="Sherman Oaks"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-3">
                    <div className="form-group">
                      <label>State/Province</label>
                      <select className="form-control select">
                        <option>California</option>
                        <option>Alaska</option>
                        <option>Alabama</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-3">
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        className="form-control"
                        defaultValue={91403}
                        type="text"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        className="form-control"
                        defaultValue="danielporter@example.com"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        className="form-control"
                        defaultValue="818-978-7102"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        className="form-control"
                        defaultValue="818-635-5579"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Fax</label>
                      <input
                        className="form-control"
                        defaultValue="818-978-7102"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label>Website Url</label>
                      <input
                        className="form-control"
                        defaultValue="https://www.example.com"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Save</button>
                </div>
              </form>
            </div>
          </div> */}



          {/* new */}
          <div className="row">
             <div className="col-sm-4 col-md-4 col-lg-4 col-xl-3" style={{paddingBottom: '20px'}}>
               {/* <a href="#" className="btn btn-primary btn-block w-100" data-bs-toggle="modal" data-bs-target="#add_role"><i className="fa fa-plus" /> Add Roles</a> */}
               <div className="roles-menu" style={{margin: '0px'}}>
                 <ul>
                    <li className={showComponent === 'Company Settings' ? 'active' : ''}>
                      <a href="javascript:void(0)" onClick={() => setShowComponent('Company Settings')}>
                        <i className="fa fa-fw fa-info-circle" style={{marginRight: '8px'}}></i>
                        Company Settings
                      </a>
                   </li>
                   <li className={showComponent === 'Leaves Settings' ? 'active' : ''}>
                      <a href="javascript:void(0)" onClick={() => setShowComponent('Leaves Settings')}>
                        <i className="fa fa-fw fa-warning" style={{marginRight: '8px'}}></i>
                        Leaves Settings
                      </a>
                   </li>
                   <li className={showComponent === 'Roles' ? 'active' : ''}>
                      <a href="javascript:void(0)" onClick={() => setShowComponent('Roles')}>
                        <i className="fa fa-fw fa-list-alt" style={{marginRight: '8px'}}></i>
                        Roles
                      </a>
                   </li>
                   <li className={showComponent === 'Departments' ? 'active' : ''}>
                      <a href="javascript:void(0)" onClick={() => setShowComponent('Departments')}>
                        <i className="fa fa-fw fa-sitemap" style={{marginRight: '8px'}}></i>
                        Departments
                      </a>
                   </li>
                   <li className={showComponent === 'Designation' ? 'active' : ''}>
                      <a href="javascript:void(0)" onClick={() => setShowComponent('Designation')}>
                        <i className="fa fa-fw fa-users" style={{marginRight: '8px'}}></i>
                        Designation
                      </a>
                   </li>
                   <li className={showComponent === 'Shifts' ? 'active' : ''}>
                      <a href="javascript:void(0)" onClick={() => setShowComponent('Shifts')}>
                        <i className="fa fa-fw fa-clock-o" style={{marginRight: '8px'}}></i>
                        Shifts
                      </a>
                   </li>
                   <li className={showComponent === 'Tax Slabs' ? 'active' : ''}>
                      <a href="javascript:void(0)" onClick={() => setShowComponent('Tax Slabs')}>
                        <i className="fa fa-fw fa-money" style={{marginRight: '8px'}}></i>
                        Tax Slabs
                      </a>
                   </li>
                   {/* <li className="">
                     <a href="#">Administrator
                       <span className="role-action">
                         <span className="action-circle large" data-bs-toggle="modal" data-bs-target="#edit_role">
                           <i className="material-icons" onClick={() => setEditModal('hello')}>edit</i>
                         </span>
                         <span className="action-circle large delete-btn" data-bs-toggle="modal" data-bs-target="#delete_role">
                           <i className="material-icons">delete</i>
                         </span>
                       </span>
                     </a>
                   </li>
                   <li>
                     <a href="#">CEO
                       <span className="role-action">
                         <span className="action-circle large" data-bs-toggle="modal" data-bs-target="#edit_role">
                           <i className="material-icons">edit</i>
                         </span>
                         <span className="action-circle large delete-btn" data-bs-toggle="modal" data-bs-target="#delete_role">
                           <i className="material-icons">delete</i>
                         </span>
                       </span>
                     </a>
                   </li>
                   <li>
                     <a href="">Manager
                       <span className="role-action">
                         <span className="action-circle large" data-bs-toggle="modal" data-bs-target="#edit_role">
                           <i className="material-icons">edit</i>
                         </span>
                         <span className="action-circle large delete-btn" data-bs-toggle="modal" data-bs-target="#delete_role">
                           <i className="material-icons">delete</i>
                         </span>
                       </span>
                     </a>
                   </li> */}
                 </ul>
               </div>
             </div>
             <div className="cardStyle col-sm-8 col-md-8 col-lg-8 col-xl-9">
              {
                showComponent === 'Company Settings' ? <Company /> :
                showComponent === 'Leaves Settings' ? <Leaves /> :
                showComponent === 'Roles' ? <Roles /> :
                showComponent === 'Departments' ? <Departments /> :
                showComponent === 'Designation' ? <Designation /> :
                showComponent === 'Shifts' ? <Shifts /> : 
                <TaxSlabs />
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
