import React, { useContext } from 'react'
import { Outlet } from "react-router-dom"
import Navbar from '../components/Navbar'
import AppBar from '../components/AppBar'
import { NavbarContext } from '../contexts/NavbarContext'

export default function DashboardLayout() {

  const [isNavbarCollapsed] = useContext(NavbarContext)

  return (
    <div className='flex'>
      <Navbar />
      <div className={isNavbarCollapsed?`w-full pl-[5.5rem]`:`w-full pl-[5.5rem] md:pl-72`}>
        <AppBar />
        <Outlet />
      </div>
    </div>
  )
}
