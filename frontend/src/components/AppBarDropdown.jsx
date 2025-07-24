import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import AvatarImg from "../assets/avatar.svg";
import {
  IconChevronDown,
  IconDevices,
  IconLanguage,
  IconLifebuoy,
  IconLogout,
  IconUser,
  IconSun,
  IconMoon
} from "@tabler/icons-react";

import { signOut } from "../controllers/auth.controller";
import { iconStroke } from "../config/config";
import { getUserDetailsInLocalStorage } from "../helpers/UserDetails";
import { useTheme } from "../contexts/ThemeContext";
import clsx from "clsx";

export default function AppBarDropdown() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = getUserDetailsInLocalStorage();
  const { theme, toggleTheme } = useTheme();

  const btnLogout = async () => {
    try {
      toast.loading(t("toast.please_wait"));
      const response = await signOut();
      if (response.status === 200) {
        toast.dismiss();
        toast.success(t("toast.logout_success"));
        navigate("/login", { replace: true });
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("toast.something_went_wrong");
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  const itemBaseClasses =
    "group flex gap-2 w-full items-center rounded-2xl px-3 py-2 text-sm transition-colors ";

  return (
    <Menu as="div" className="relative inline-block text-left z-50">
      <div>
        <Menu.Button
          className={clsx(
            "text-sm transition rounded-full flex items-center gap-0 md:gap-2",
            theme === "black"
              ? "bg-restro-gray hover:bg-restro-button-hover text-white"
              : "bg-restro-green-light hover:bg-restro-button-hover text-restro-green-dark"
          )}
        >
          <img src={AvatarImg} alt="avatar" className="w-10 h-10 rounded-full p-1" />
          <p className="font-medium hidden md:block">{user.name}</p>
          <IconChevronDown stroke={iconStroke} className="mr-1" size={18} />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            "absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-600 rounded-2xl shadow-lg ring-1 ring-black/5 focus:outline-none bg-background border-restro-border-green"
            
          )}
        >
          <div className="px-1 py-1">
            {[
              {
                label: t("appbar.profile"),
                icon: <IconUser stroke={iconStroke} />,
                to: "/dashboard/profile"
              },
              {
                label: t("appbar.my_devices"),
                icon: <IconDevices stroke={iconStroke} />,
                to: "/dashboard/devices"
              },
              {
                label: t("appbar.language"),
                icon: <IconLanguage stroke={iconStroke} />,
                to: "/dashboard/language"
              },
              {
                label: t("appbar.support"),
                icon: <IconLifebuoy stroke={iconStroke} />,
                to: "/dashboard/contact-support"
              }
            ].map((item, idx) => (
              <Menu.Item key={idx}>
                {({ active }) => (
                  <Link
                    to={item.to}
                    className={clsx(
                      itemBaseClasses,
                      "hover:bg-restro-button-hover"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </Menu.Item>
            ))}

            {/* Theme Toggle */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={toggleTheme}
                  className={clsx(
                    itemBaseClasses,
                    "hover:bg-restro-button-hover"
                  )}
                >
                  {theme === "light" ? <IconMoon stroke={iconStroke} /> : <IconSun stroke={iconStroke} />}
                  {theme === "light" ? t("appbar.dark_mode") : t("appbar.light_mode")}
                </button>
              )}
            </Menu.Item>

            {/* Logout */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={btnLogout}
                  className={clsx(
                    itemBaseClasses,
                    "hover:bg-red-100 dark:hover:bg-red-800/20",
                    theme === "black"
                      ? active
                        ? "bg-red-100 text-red-600"
                        : "text-red-500"
                      : active
                      ? "bg-red-100 text-red-400"
                      : "text-red-400"
                  )}
                >
                  <IconLogout stroke={iconStroke} />
                  {t("appbar.logout")}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
