import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  IconArmchair2,
  IconBuildingStore,
  IconChartArea,
  IconChefHat,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceIpadHorizontal,
  IconFileInvoice,
  IconFriends,
  IconLayoutDashboard,
  IconSettings2,
  IconToolsKitchen3,
  IconUsersGroup,
} from "@tabler/icons-react";
import { clsx } from "clsx";
import Logo from "../assets/logo.svg";
import LogoDark from "../assets/LogoDark.svg";
import AvatarImg from "../assets/avatar.svg";
import { iconStroke } from "../config/config";
import { getUserDetailsInLocalStorage } from "../helpers/UserDetails";
import { NavbarContext } from "../contexts/NavbarContext";
import { toggleNavbar } from "../helpers/NavbarSettings";
import { useTheme } from "../contexts/ThemeContext";

export default function SuperAdminNavbar() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { pathname } = useLocation();
  const user = getUserDetailsInLocalStorage();
  
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useContext(NavbarContext);

  const navbarItems = [
    {
      type: "link",
      text: t('superadmin_navbar.dashboard'),
      icon: <IconLayoutDashboard stroke={iconStroke} />,
      path: "/superadmin/dashboard/home",
    },
    {
      type: "link",
      text: t('superadmin_navbar.tenants'),
      icon: <IconBuildingStore stroke={iconStroke} />,
      path: "/superadmin/dashboard/tenants",
    },
    {
      type: "link",
      text: t('superadmin_navbar.reports'),
      icon: <IconChartArea stroke={iconStroke} />,
      path: "/superadmin/dashboard/reports",
    },
  ];

  const btnToggleNavbar = () => {
    const isNavCollapsed = toggleNavbar();
    console.log(isNavCollapsed);
    if (isNavCollapsed) {
      setIsNavbarCollapsed(true);
    } else {
      setIsNavbarCollapsed(false);
    }
  };
  if (isNavbarCollapsed) {
    return (
      <div className ="flex flex-col items-start gap-4 h-screen px-5 py-6 overflow-y-auto fixed left-0 top-0 bg-restro-green-light">
        <img src={theme === "black" ? LogoDark : Logo} alt="logo" className="w-12 block mb-6" />
        {navbarItems.map((item, index) => {
          if (item.type == "text") {
            return;
          }

          return (
            <Link
              key={index}
              className={clsx(
                              `w-12 h-12 flex items-center justify-center rounded-full transition`,
                              {
                                "bg-restro-bg-hover-dark-mode font-medium text-restro-green": theme === 'black' && pathname.includes(item.path),
                                "bg-restro-border-green-light font-medium text-restro-green": theme !== 'black' && pathname.includes(item.path),
                                "hover:bg-restro-bg-hover-dark-mode": theme === 'black' && !pathname.includes(item.path),
                                "hover:bg-restro-border-green-light": theme !== 'black' && !pathname.includes(item.path),
                              }
                            )}
              to={item.path}
            >
              {item.icon}
            </Link>
          );
        })}

        <button
          onClick={btnToggleNavbar}
          className="w-12 h-12 flex items-center justify-center rounded-full transitionborder border-restro-green-light hover:bg-restro-border-green text-restro-text"
        >
          <IconChevronRight stroke={iconStroke} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <div className='md:w-72 flex flex-col items-start gap-2 md:gap-3 h-screen px-5 py-6 overflow-y-auto fixed left-0 top-0 border-r border-restro-border-green bg-restro-card-bg'>
        <img src={theme === "black" ? LogoDark : Logo} alt="logo" className="w-12 md:w-auto md:h-14 block mb-2 md:mb-6 " />

        <div className="hidden md:flex items-center gap-2 w-full md:mb-6">
          <img
            src={AvatarImg}
            alt="avatar"
            className="md:w-12 md:h-12 rounded-full block"
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">
              {new String(user.role).toUpperCase()}
              {user.designation && <span>, {user.designation}</span>}
            </p>
          </div>
        </div>

        {navbarItems.map((item, index) => {
          if (item.type == "text") {
            return (
              <p key={index} className="font-bold hidden md:block">
                {item.text}
              </p>
            );
          }

          return (
            <Link
              key={index}
              className={clsx(
                "w-12 h-12 md:w-full flex justify-center md:justify-normal items-center md:gap-1 md:px-4 md:py-3 rounded-full transition",
                {
                                "bg-restro-bg-hover-dark-mode font-medium text-restro-green": theme === 'black' && pathname.includes(item.path),
                                "bg-restro-border-green-light font-medium text-restro-green": theme !== 'black' && pathname.includes(item.path),
                                "hover:bg-restro-bg-hover-dark-mode": theme === 'black' && !pathname.includes(item.path),
                                "hover:bg-restro-border-green-light": theme !== 'black' && !pathname.includes(item.path),
                              }
              )}
              to={item.path}
            >
              {item.icon} <p className="hidden md:block">{item.text}</p>
            </Link>
          );
        })}
      </div>

      <button
              onClick={btnToggleNavbar}
              className="w-9 h-9 hidden md:flex items-center justify-center rounded-full border transition bg-restro-green-light dark:bg-restro-gray hover:bg-gray-200 dark:hover:bg-restro-button-hover text-gray-500 fixed bottom-4 left-[17.5rem] -translate-x-1/2 dark:border-restro-border-green"
            >
              <IconChevronLeft stroke={iconStroke} size={18} />
            </button>
    </div>
  );
}
