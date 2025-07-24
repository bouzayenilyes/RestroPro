import React from "react";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
function OrderSuccessPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className='w-full min-h-screen flex justify-center items-center bg-gray-100 dark:bg-black p-4 md:w-96 mx-auto'>
      <div className='w-full md:w-96 mx-auto max-w-sm shadow-lg dark:rounded-xl px-10 py-8 flex flex-col justify-between bg-restro-gray border-restro-border-green'>
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            {t("order_success.thank_you_message")}
          </p>
        </div>

        <div className="text-center mb-6">
          <IconCircleCheckFilled className="text-restro-green mx-auto" size={150} />
          <p className='text-md tracking-wide mt-2 font-bold text-restro-text'>
            {t("order_success.order_placed_message")}
          </p>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccessPage;
