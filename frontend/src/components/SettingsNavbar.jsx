import React from "react";
import { iconStroke } from "../config/config";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import {
  IconArmchair2,
  IconBook,
  IconCreditCard,
  IconDevices,
  IconInfoSquareRounded,
  IconLifebuoy,
  IconPrinter,
  IconReceiptTax,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsNavbar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { theme } = useTheme();

  const items = [
    {
      icon: <IconInfoSquareRounded stroke={iconStroke} />,
      text: t("settings.details"),
      path: "/dashboard/settings",
    },
    {
      icon: <IconPrinter stroke={iconStroke} />,
      text: t("settings.print_settings"),
      path: "/dashboard/settings/print-settings",
    },
    {
      icon: <IconArmchair2 stroke={iconStroke} />,
      text: t("settings.tables"),
      path: "/dashboard/settings/tables",
    },
    {
      icon: <IconBook stroke={iconStroke} />,
      text: t("settings.menu_items"),
      path: "/dashboard/settings/menu-items",
    },
    {
      icon: <IconReceiptTax stroke={iconStroke} />,
      text: t("settings.tax_setup"),
      path: "/dashboard/settings/tax-setup",
    },
    {
      icon: <IconCreditCard stroke={iconStroke} />,
      text: t("settings.payment_types"),
      path: "/dashboard/settings/payment-types",
    },
    // {
    //   icon: <IconDevices stroke={iconStroke} />,
    //   text: "Devices",
    //   path: "/dashboard/settings/devices",
    // },
    // {
    //   icon: <IconLifebuoy stroke={iconStroke} />,
    //   text: "Contact Support",
    //   path: "/dashboard/settings/contact-support",
    // },
  ];

  return (
    <div className='w-20 md:w-60 h-full overflow-y-auto border-r md:px-4 py-3 flex items-center flex-col gap-1 md:gap-3 sticky  left-0 top-20 border-restro-border-green'>
      {items.map((item, index) => {
        const isActive = item.path === pathname;
        return (
          <Link
            to={item.path}
            key={index}
            className={clsx(
              "w-12 h-12 md:w-full md:h-auto md:min-w-fit flex items-center justify-center md:justify-normal gap-1 md:px-4 md:py-3 rounded-full transition group",
              isActive
                ? theme === "black"
                  ? "bg-[#353535] text-white font-medium"
                  : "bg-restro-border-green-light font-medium text-restro-green-dark"
                : theme === "black"
                  ? "text-white hover:bg-[#353535]"
                  : "text-restro-green-dark hover:bg-restro-border-green-light"
            )}
          >
            <span className={clsx(
              "transition-colors",
              isActive
                ? theme === "black" ? "text-white" : "text-restro-green-dark"
                : theme === "black"
                  ? "text-white"
                  : ""
            )}>
              {React.cloneElement(item.icon, {
                className: "w-6 h-6",
              })}
            </span>
            <p className={clsx(
              "hidden md:block transition-colors",
              isActive
                ? theme === "black" ? "text-white" : "text-restro-green-dark"
                : theme === "black"
                  ? "text-white"
                  : ""
            )}>
              {item.text}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
