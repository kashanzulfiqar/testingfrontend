import React from 'react';
import { Outlet } from 'react-router-dom';

const Recruitment = () => {
  return (
    <div className="page-wrapper">
      <Outlet />
    </div>
  );
};

export default Recruitment;
