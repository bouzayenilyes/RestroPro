import React, { useContext } from 'react'
import { Outlet } from "react-router-dom"
import SuperAdminNavbar from '../../components/SuperAdminNavbar'
import SuperAdminAppBar from '../../components/SuperAdminAppBar'
import { NavbarContext } from '../../contexts/NavbarContext'

export default function SuperAdminDashboadLayout() {
  const [isNavbarCollapsed] = useContext(NavbarContext)

  return (
   <div className='flex'>
      <SuperAdminNavbar />
      <div className={isNavbarCollapsed?`w-full ml-[5.5rem] overflow-y-auto h-screen`:`w-full ml-[5.5rem] md:ml-72 overflow-y-auto h-screen`}>
        <SuperAdminAppBar />
        <Outlet />
      </div>
    </div>
  )
}
