import React from "react";
import Logo from "../assets/logo.svg";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../controllers/auth.controller";
import { useTranslation } from "react-i18next";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const password = e.target.password.value;

    if(!token) {
      toast.error(t("reset_password.invalid_request"));
      return;
    }
    
    if (!password) {
      e.target.password.focus();
      toast.error(t("reset_password.new_password_error"));
      return;
    }

    try {
      toast.loading(t("reset_password.loading_message"));

      const res = await resetPassword(token, password);
      if(res.status == 200) {
        toast.dismiss();
        toast.success(t("reset_password.success_message"));
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || t("reset_password.error_message");
      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <div className="bg-restro-green-light relative overflow-x-hidden md:overflow-hidden">
      <img src="/assets/circle_illustration.svg" alt="illustration" className="absolute w-96 lg:w-[1024px] h-96 lg:h-[1024px]  lg:-bottom-96 lg:-right-52 -right-36 " />

      <div className="flex flex-col md:flex-row items-center justify-end md:justify-between gap-10 h-screen container mx-auto px-4 md:px-0 py-4 md:py-0 relative">
        <div>
          <h3 className="text-2xl lg:text-6xl font-black text-restro-green-dark">{t("home.cafe_restaurant")}</h3>
          <h3 className="text-2xl lg:text-6xl font-black text-restro-green-light outline-text">{t("home.hotel_bar")}</h3>
        </div>
        <div className="bg-white rounded-2xl px-8 py-8 w-full sm:w-96 mx-8 sm:mx-0 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-restro-green-dark text-xl font-medium">
              {t("reset_password.title")}
            </div>
            <div>
              <img src={Logo} className="h-16" />
            </div>
          </div>

          <form className="mt-6" onSubmit={handleSubmit}>
            <div>
              <label className="block" htmlFor="password">
                {t("reset_password.new_password_label")}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder={t("reset_password.new_password_placeholder")}
                className="mt-1 block w-full bg-gray-100 px-4 py-3 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="block w-full mt-6 bg-restro-green text-white rounded-xl px-4 py-3 transition hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-green-800/20"
            >
              {t("reset_password.reset_button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
