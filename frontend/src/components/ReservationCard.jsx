import React from "react";
import {
  IconArmchair,
  IconCalendarX,
  IconFriends,
  IconPencil,
  IconInfoSquareRounded
} from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function ReservationCard({
  unique_code,
  dateLocal,
  timeLocal,
  customer_name,
  people_count,
  table_title,
  notes,
  status,
  createdAt,
  btnUpdate,
  btnDelete,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div
      key={unique_code}
      className='border rounded-2xl p-4 flex gap-4 items-center text-foreground border-restro-border-green'>
      <div className='w-20 h-full rounded-lg text-base py-2 font-bold text-center flex items-center justify-center text-restro-text bg-restro-gray'>
        {dateLocal}
      </div>
      <div className="flex-1">
        <p className='text-sm text-restro-text'>{timeLocal}</p>
        <p className="font-bold text-xl">{customer_name}</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <IconFriends stroke={iconStroke} size={18} />
            {people_count || "N/A"}
          </div>
          <div className="flex items-center gap-2">
            <IconArmchair stroke={iconStroke} size={18} />
            {table_title || "N/A"}
          </div>
        </div>
        {notes && (
          <div className="tooltip tooltip-bottom" data-tip={notes}>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
              <IconInfoSquareRounded size={18} stroke={iconStroke} /> {t("reservation.view_notes")}
            </p>
          </div>
        )}
        <p className="text-xs text-gray-400">{t("reservation.status")}: {status}</p>
        <p className="text-xs text-gray-400">{t("reservation.created_at")}: {createdAt}</p>
      </div>

      <div className="flex items-center">
        <button
          onClick={btnUpdate}
          className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 hover:bg-restro-button-hover text-restro-text'
        >
          <IconPencil size={24} stroke={iconStroke} />
        </button>
        <button
          onClick={btnDelete}
          className='w-8 h-8 rounded-full flex items-center justify-center text-restro-red hover:bg-restro-button-hover transition active:scale-95'>
          <IconCalendarX size={24} stroke={iconStroke} />
        </button>
      </div>
    </div>
  );
}
