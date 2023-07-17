import React from 'react'
import { useLocation,Navigate,Outlet } from "react-router-dom";
import Sidebar from '../initialpage/Sidebar/sidebar';

export default function DashboardWrapper({children}) {
  return <Sidebar children={children}>
    <Outlet/>
  </Sidebar>
}

