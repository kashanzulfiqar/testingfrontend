import React from 'react';

const RecruitmentDashboard = () => {
  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Recruitment Dashboard</h3>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
          <div className="card dash-widget">
            <div className="card-body">
              <span className="dash-widget-icon"><i className="la la-briefcase"></i></span>
              <div className="dash-widget-info">
                <h3>10</h3>
                <span>Open Positions</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
          <div className="card dash-widget">
            <div className="card-body">
              <span className="dash-widget-icon"><i className="la la-users"></i></span>
              <div className="dash-widget-info">
                <h3>25</h3>
                <span>Active Candidates</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
          <div className="card dash-widget">
            <div className="card-body">
              <span className="dash-widget-icon"><i className="la la-calendar"></i></span>
              <div className="dash-widget-info">
                <h3>8</h3>
                <span>Interviews</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
          <div className="card dash-widget">
            <div className="card-body">
              <span className="dash-widget-icon"><i className="la la-check-circle"></i></span>
              <div className="dash-widget-info">
                <h3>5</h3>
                <span>Offers Sent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentDashboard; 