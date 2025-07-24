import Page from "../components/Page";
import Logo from "../assets/logo.svg";
import LogoDark from "../assets/LogoDark.svg"
import { iconStroke, stripeProductSubscriptionId, subscriptionPrice } from '../config/config';
import React from "react";
import { getStripeSubscriptionURL, signOut } from "../controllers/auth.controller";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { getUserDetailsInLocalStorage } from "../helpers/UserDetails";
import AppBarDropdown from "../components/AppBarDropdown";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function InActiveSubscriptionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = getUserDetailsInLocalStorage();
  const {theme} = useTheme();
  const btnSubscribe = async () => {
    toast.loading(t("loading_message"));
    try {
      const res = await getStripeSubscriptionURL(stripeProductSubscriptionId);
      toast.dismiss();

      if (res.status == 200) {
        const data = res.data;
        window.location.href = data.url;
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("error_message");
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page className="">
      <div className="flex items-center justify-between px-4 py-3 border-b border-restro-gray">
        <img src={theme === "black" ? LogoDark : Logo} alt="logo" className="h-12 block" />
        <AppBarDropdown />
      </div>

      {user.role == "admin" ? (
        <>
          <h3 className="mt-4 text-center">{t("inactive_subscription.no_active_subscription_admin")}</h3>
          <div className="w-full container mx-auto grid grid-cols-1 my-20 gap-10 place-items-center px-6 lg:px-0">
            <div className="rounded-2xl px-8 py-6 border border-restro-border-green flex flex-col w-full lg:w-96">
              <h3 className="text-4xl text-green-700 font-bold text-center">{subscriptionPrice}</h3>
              <h3 className="font-bold text-2xl text-center">{t("inactive_subscription.price_per_month")}</h3>
              <ul className="text-gray-700 dark:text-white mt-6 flex flex-col gap-2 text-start">
                <li>{t("inactive_subscription.features.unlimited_orders")}</li>
                <li>{t("inactive_subscription.features.monthly_renewals")}</li>
                <li>{t("inactive_subscription.features.unlimited_devices")}</li>
                <li>{t("inactive_subscription.features.live_kitchen_orders")}</li>
              </ul>
              <button onClick={btnSubscribe} className="rounded-full bg-restro-green text-white px-4 py-3 transition active:scale-95 hover:bg-restro-green-button-hover mt-6">
                {t("inactive_subscription.subscribe_button")}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div>
          <h3 className="mt-4 text-center">{t("inactive_subscription.no_active_subscription_user")}</h3>
        </div>
      )}
    </Page>
  );
}
