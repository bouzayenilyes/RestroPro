import React from "react";
import { IconCircleXFilled } from '@tabler/icons-react';
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

function OrderFailedPage() {
  const { t } = useTranslation();
  const {theme} = useTheme();

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4 md:w-96 mx-auto">
      <div className="w-full md:w-96 mx-auto max-w-sm shadow-lg rounded-xl px-10 py-8 flex flex-col justify-between">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">{t("order_failed.oops_message")}</p>
        </div>

        <div className="text-center mb-6">
          <IconCircleXFilled className="text-red-500 mx-auto" size={150} />
          <p className="text-md text-gray-600 tracking-wide mt-2 font-bold">
            {t("order_failed.order_failed_message")}
          </p>
          <p className="text-sm text-gray-600 tracking-wide mt-2">
            {t("order_failed.try_again_message")}
          </p>
        </div>

        <div></div>

      </div>
    </div>
  );
}

export default OrderFailedPage;
