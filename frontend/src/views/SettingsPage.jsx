import React from 'react'
import Page from "../components/Page";
import SettingsNavbar from '../components/SettingsNavbar';
import { Outlet } from 'react-router-dom';
export default function SettingsPage() {
  return (
    <Page className='flex h-[calc(92vh-20px)]'>
      <SettingsNavbar/>
      <div className='flex-1 h-full overflow-y-auto'>
        <Outlet />
      </div>
    </Page>
  )
}
