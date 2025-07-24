import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import { getLanguage } from "./helpers/LocalizationHelper";
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(Backend)
  .init({
    lng: getLanguage() || 'en', // default language
    fallbackLng: 'en', // fallback language
    debug: true, // enable debug mode in development

    // Load translations from JSON files
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // path to the JSON files
    },
    
    interpolation: {
      escapeValue: false, // react already escapes values
    },
  }, ()=>{
    i18n.dir();
    document.documentElement.setAttribute('dir', i18n.dir(i18n.language)); // Set direction after init
  });

export default i18n;
