import { IconCheck } from '@tabler/icons-react'
import React from 'react'
import { use } from 'react';
import { useTranslation } from "react-i18next";
import { useTheme } from '../contexts/ThemeContext';
export default function RatingComponent({
  name
}) {
  const { t } = useTranslation();
  const {theme } = useTheme();
  const values = [
    {value: 1, icon: '😠', text: t("rating.worst")},
    {value: 2, icon: '🙁', text: t("rating.bad")},
    {value: 3, icon: '😐', text: t("rating.average")},
    {value: 4, icon: '🙂', text: t("rating.good")},
    {value: 5, icon: '😍', text: t("rating.loved")}
  ]

  return (
    <div className="flex items-center gap-2 mt-2">
      {values.map((ratingItem, i)=>{
        return <label key={i} className='w-20 h-20 block relative cursor-pointer transition hover:scale-105 active:scale-95'>
          <input type="radio" value={ratingItem.value} name={name} className='hidden peer' />
          <div className={
            `w-full h-full flex flex-col items-center justify-center border-2 rounded-2xl p-2
            ${theme === "black"
              ? "border-restro-border-dark-mode bg-restro-card-iconbg peer-checked:border-restro-green peer-checked:bg-[#1a2b1a]"
              : "border-white bg-gray-100 peer-checked:border-restro-green peer-checked:bg-[#F3FFF2]"
            }`
          }>
            <p className={`text-xl ${theme === "black" ? "text-white" : "text-black"}`}>{ratingItem.icon}</p>
            <p className={`${theme === "black" ? "text-white" : "text-black"}`}>{ratingItem.text}</p>
          </div>
          <div className={`absolute hidden peer-checked:flex w-5 h-5 rounded-full transition active:scale-95 hover:shadow-lg border text-white items-center justify-center -top-1 -right-1 ${theme === 'black' ? 'bg-restro-bg-button-dark-mode hover:bg-restro-bg-button-dark-mode/70' : 'bg-restro-green hover:bg-restro-green-light'}`}><IconCheck size={12} /></div>
        </label>
      })}
    </div>
  )
}
