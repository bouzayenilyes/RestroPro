import React, { useEffect } from "react";
import Logo from "../../assets/logo.svg";
import LogoDark from "../../assets/LogoDark.svg";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isRestroUserAuthenticated } from "../../helpers/AuthStatus";
import {
  getUserDetailsInLocalStorage,
  saveUserDetailsInLocalStorage,
} from "../../helpers/UserDetails";
import { signIn } from "../../controllers/superadmin.controller";
import { useTheme } from "../../contexts/ThemeContext";

export default function SuperAdminLoginPage() {
  const { t } = useTranslation();
  const {theme} = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const restroAuthenticated = isRestroUserAuthenticated();
    if (restroAuthenticated) {
      const { role } = getUserDetailsInLocalStorage();
      if (role == "superadmin") {
        navigate("/superadmin/dashboard/home", {
          replace: true,
        });
        return;
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!username) {
      e.target.username.focus();
      toast.error(t("superadmin_login.username_error"));
      return;
    }

    if (!password) {
      e.target.password.focus();
      toast.error(t("superadmin_login.password_error"));
      return;
    }

    try {
      toast.loading(t("superadmin_login.loading_message"));

      const res = await signIn(username, password);

      if (res.status == 200) {
        toast.dismiss();
        toast.success(t("superadmin_login.success_message"));

        const user = res.data.user;
        saveUserDetailsInLocalStorage(user);

        const { role } = getUserDetailsInLocalStorage();
        navigate("/superadmin/dashboard/home", {
          replace: true,
        });
        return;
      } else {
        const message = res.data.message;
        toast.dismiss();
        toast.error(message);
        return;
      }
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || t("superadmin_login.error_message");

      toast.dismiss();
      toast.error(message);
      return;
    }
  };

  return (
    <div className='relative overflow-x-hidden md:overflow-hidden  bg-restro-green-light dark:bg-restro-card-bg'>
      <img
        src="/assets/circle_illustration.svg"
        alt="illustration"
        className = 'absolute w-96 lg:w-[1024px] h-96 lg:h-[1024px] lg:-bottom-96 lg:-right-52 -right-36  black:opacity-80'
      />

      <div className="flex flex-col md:flex-row items-center justify-end md:justify-between gap-10 h-screen container mx-auto px-4 md:px-0 py-4 md:py-0 relative lg:px-12">
        <div>
          <h3 className = "text-2xl lg:text-6xl font-black text-restro-green-dark dark:text-restro-green-dark-mode">
            {t("superadmin_login.title")}
          </h3>
          <h3 className = 'text-2xl lg:text-6xl font-black outline-text dark:text-green-600 text-green-700'>
            {t("superadmin_login.login")}.
          </h3>
        </div>

        <div className = 'bg-white dark:bg-black border border-restro-green-light rounded-2xl px-8 py-8 w-full sm:w-96 mx-8 sm:mx-0 shadow-2xl'>
          <div className="flex items-center justify-between">
            <div className='text-xl font-medium text-green-100'>
              {t("superadmin_login.login")}
            </div>
            <div>
              <img src={theme === "black" ? LogoDark : Logo} className="h-16" />
            </div>
          </div>

          <form className="mt-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className='text-restro-text'>
                {t("superadmin_login.email_label")}
              </label>
              <input
                type="email"
                id="username"
                name="username"
                required
                placeholder={t("superadmin_login.email_placeholder")}
                className = 'mt-1 block w-full px-4 py-3 rounded-xl outline-none focus-visible:ring-1 bg-restro-gray text-restro-text focus-visible:ring-restro-ring'
              />
            </div>

            <div className="mt-4">
              <label htmlFor="password" className='text-restro-text'>
                {t("superadmin_login.password_label")}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder={t("superadmin_login.password_placeholder")}
                className = 'mt-1 block w-full px-4 py-3 rounded-xl outline-none focus-visible:ring-1 bg-restro-gray text-restro-text focus-visible:ring-restro-ring'
              />
            </div>

            <button
              type="submit"
              className='block w-full mt-6 text-white rounded-xl px-4 py-3 transition hover:scale-105 active:scale-95 hover:shadow-md outline-none focus-visible:ring-1 bg-restro-green focus-visible:ring-restro-ring hover:bg-restro-green-button-hover'
            >
              {t("superadmin_login.login_button")}
            </button>
          </form>
        </div>
      </div>
    </div>

  )
}
