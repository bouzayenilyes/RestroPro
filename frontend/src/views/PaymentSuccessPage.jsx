import React from 'react'
import AppBarDropdown from '../components/AppBarDropdown'
import Page from "../components/Page";
import Logo from "../assets/logo.svg";
import LogoDark from "../assets/LogoDark.svg"
import { IconCircleCheckFilled, IconLogout } from '@tabler/icons-react';
import { iconStroke } from '../config/config';
import toast from 'react-hot-toast';
import { signOut } from '../controllers/auth.controller';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useTheme } from '../contexts/ThemeContext';

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {theme} = useTheme();
  const btnLogout = async () => {
    try {
      toast.loading(t("loading_message"));
      const response = await signOut();
      if (response.status == 200) {
        toast.dismiss();
        toast.success(response.data.message);
        navigate("/login", { replace: true });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || t("error_message");
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page className=''>
      <div className="fixed flex items-center justify-between px-4 py-3 border-b border-restro-border-green w-full dark:bg-black">
        <img src={theme === "black" ? LogoDark : Logo} alt="logo" className="h-12 block" />

        {/* profile */}
        <AppBarDropdown />
        {/* profile */}
      </div>

      <div className="min-h-screen container mx-auto flex items-center justify-center flex-col">
        <IconCircleCheckFilled className='text-restro-green' size={48} />
        <h1 className="text-2xl font-bold mt-2">{t("payment_success.title")}</h1>
        <p className="text-center">
          {t("payment_success.message")}
        </p>

        <button onClick={btnLogout} className='flex items-center justify-center gap-2 rounded-full px-4 py-3 mt-4 bg-red-50 text-red-500 transition hover:bg-red-200 dark:bg-red-600 dark:text-white active:scale-95 dark:hover:bg-red-800 text-sm'>
          <IconLogout stroke={iconStroke} /> {t("payment_success.logout_button")}
        </button>
      </div>
    </Page>
  )
}
