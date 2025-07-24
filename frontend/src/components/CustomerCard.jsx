import { IconCalendarPlus, IconCalendarTime, IconMail, IconPhone, IconUser, IconX } from "@tabler/icons-react";
import React from "react";
import { iconStroke } from "../config/config";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function CustomerCard({phone, name, email, birth_date=null, gender=null, created_at=null, btnAction = null}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div
      className="border px-4 py-5 dark:bg-restro-gray-dark-mode dark:border-restro-border-dark-mode border-restro-border-green-light rounded-2xl"
    >
      <div className="flex items-center gap-2">
        <div className="flex w-12 h-12 rounded-full items-center justify-center text-gray-500 dark:text-white bg-restro-bg-gray border-restro-border-green">
          <IconUser />
        </div>
        <div className="flex-1">
          <p>{name}</p>
          <p className="text-sm flex items-center gap-1 text-gray-500">
            <IconPhone stroke={iconStroke} size={18} /> {phone}
          </p>
        </div>

        {
          btnAction && <button className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 dark:bg-red-900 dark:text-white text-red-400 hover:bg-red-100 active:scale-95 transition" onClick={btnAction}>
            <IconX stroke={iconStroke} size={18} />
          </button>
        }
      </div>

      {email && (
        <p className="mt-4 text-sm flex flex-wrap items-center gap-1 text-gray-500 truncate ">
          <IconMail stroke={iconStroke} size={18} /> {email}
        </p>
      )}
      {birth_date && (
        <p className="text-sm flex items-center gap-1 text-gray-500">
          {t('customers.birth_date')}: {new Date(birth_date).toLocaleDateString()}
        </p>
      )}
      {gender && (
        <p className="text-sm flex items-center gap-1 text-gray-500">
          {t('customers.gender')}: {gender}
        </p>
      )}

      {created_at && <div className="mt-4 text-sm flex items-center gap-1 text-gray-500">
        <IconCalendarPlus stroke={iconStroke} size={18} />{" "}
        {new Date(created_at).toLocaleString()}
      </div>}
    </div>
  );
}
