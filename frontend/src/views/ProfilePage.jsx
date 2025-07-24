import React from 'react';
import Page from "../components/Page";
import { IconCreditCard, IconUser } from "@tabler/icons-react";
import { getUserDetailsInLocalStorage } from "../helpers/UserDetails"
import { iconStroke } from "../config/config";
import SubscriptionDetails from '../components/SubscriptionDetails';
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = getUserDetailsInLocalStorage();
  const {name, designation, photo, role} = user;
  const { theme } = useTheme();

  return (
    <Page>
      <h3 className = 'text-center mt-4'>{t("profile.title")}</h3>

      <div className = "flex flex-col gap-4 w-full items-center justify-center mt-8">
        <div className = 'w-full md:w-96 rounded-3xl border border-restro-border-green'>
          <div className = 'w-full h-20 pt-10 rounded-3xl p-2 relative bg-restro-green '>
            <div className = 'w-20 h-20  rounded-full mx-auto flex items-center justify-center text-gray-500 dark:text-white bg-gray-200 dark:bg-restro-card-bg border-restro-border-green'>
              <IconUser size={32} stroke={iconStroke} />
            </div>
          </div>

          <div className="px-4 py-3 mt-8">
            <p className=" text-sm text-gray-400">{t("profile.name_label")}</p>
            <p>{name}</p>

            <p className="mt-4 text-sm text-gray-400">{t("profile.designation_label")}</p>
            <p>{designation}</p>
          </div>
        </div>

        {
          role == "admin" && <SubscriptionDetails />
        }
      </div>
    </Page>
  )
}
