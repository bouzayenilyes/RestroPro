import { IconCreditCard } from "@tabler/icons-react";
import React from "react";
import { iconStroke } from "../config/config";
import { cancelSubscription, useSubscriptionDetails } from "../controllers/auth.controller";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function SubscriptionDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error, isLoading, data } = useSubscriptionDetails();
  const {theme} = useTheme();

  if(isLoading) {
    return <div>{t("toast.please_wait")}</div>
  }

  if(error) {
    console.error(error);
    return <div>{t("toast.something_went_wrong")}</div>
  }  

  const btnCancelSubscription = async () => {
    const subscriptionId = data?.subscription_id;

    const isConfirm = window.confirm(t("subscription.cancel_confirm"));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t("toast.please_wait"));
      const res = await cancelSubscription(subscriptionId);
      if(res.status == 200) {
        toast.dismiss();
        toast.success(t("subscription.cancel_success"));

        navigate("/dashboard/inactive-subscription");
      }
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || t("subscription.cancel_error");
      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <div className="w-full md:w-96 rounded-3xl border border-restro-border-green px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-restro-green text-white">
          <IconCreditCard stroke={iconStroke} />
        </div>
        <p>{t("subscription.details")}</p>
      </div>

      <p className="mt-4">{t("subscription.status")}: {data?.is_active ? t("subscription.active") : t("subscription.inactive")}</p>
      <p className="mt-2">{t("subscription.renews_at")}: {new String(data?.subscription_end).substring(0, 10)}</p>

      <button onClick={btnCancelSubscription} className="w-full block mt-4 bg-red-50 text-red-500 px-4 py-2 rounded-2xl transition hover:bg-red-100 active:scale-95 text-sm">
        {t("subscription.cancel_subscription")}
      </button>
    </div>
  );
}
