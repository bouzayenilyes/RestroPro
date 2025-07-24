import React, { useEffect } from 'react'
import { getLanguage, setLanguage } from '../helpers/LocalizationHelper'
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from "../config/languages";
import { useTheme } from '../contexts/ThemeContext';

export default function LanguageChanger({className}) {
  const { i18n } = useTranslation();
  const lang = getLanguage() || 'en';
  const {theme} = useTheme();
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  }

  useEffect(()=>{
    document.documentElement.setAttribute('dir', i18n.dir(i18n.language));
  }, [i18n.language])

  return (
    <select
      onChange={(e) => {
        changeLanguage(e.target.value);
      }}
      defaultValue={lang}
      className={className?className:"rounded-full px-4 py-2 transition active:scale-95"}
    >
      {LANGUAGES.map((lang)=>{
        return <option value={lang.code} key={lang.code}>{lang.title}</option>
      })}
    </select>
  );
}
