import React from 'react';
import { Outlet } from "react-router-dom"
import DashboardWrapper from "./DashboardWrapper"

const Layout = () => {
    return (
        <main className="App">
            <DashboardWrapper>
                <Outlet />
            </DashboardWrapper>
        </main>
    )
}

export default Layout
