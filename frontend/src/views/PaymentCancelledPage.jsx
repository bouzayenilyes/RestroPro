import React from 'react'
import AppBarDropdown from '../components/AppBarDropdown'
import Page from "../components/Page";
import Logo from "../assets/logo.svg";
import { IconChevronLeft, IconCircleXFilled } from '@tabler/icons-react';
import { iconStroke } from '../config/config';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useTheme } from '../contexts/ThemeContext';

export default function PaymentCancelledPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {theme } = useTheme();

  return (
    <Page className=''>
      <div className="fixed flex items-center justify-between px-4 py-3 border-b border-restro-border-green w-full">
        <img src={Logo} alt="logo" className="h-12 block" />

        {/* profile */}
        <AppBarDropdown />
        {/* profile */}
      </div>

      <div className="min-h-screen container mx-auto flex items-center justify-center flex-col">
        <IconCircleXFilled className='text-red-500' size={48} />
        <h1 className="text-2xl font-bold mt-2">{t("payment_cancelled.title")}</h1>
        <p className="text-center">
          {t("payment_cancelled.message")}
        </p>

        <button onClick={()=>{navigate("/dashboard/profile")}}  className='flex items-center justify-center gap-2 rounded-full px-4 py-3 mt-4 bg-restro-gray text-gray-500 dark:text-white transition hover:bg-restro-button-hover active:scale-95 text-sm'>
          <IconChevronLeft stroke={iconStroke} /> {t("payment_cancelled.go_back_button")}
        </button>
      </div>
    </Page>
  )
}
