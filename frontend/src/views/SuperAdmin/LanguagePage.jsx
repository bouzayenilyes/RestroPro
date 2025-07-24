import React from 'react'
import Page from "../../components/Page";
import LanguageChanger from "../../components/LanguageChanger";
import { useTranslation } from 'react-i18next';

export default function LanguagePage() {
  const { t } = useTranslation();
  return (
    <Page>
      <h3 className="text-center mt-4">{t('appbar.change_language')}</h3>

      <div className="flex flex-col gap-4 w-full items-center justify-center mt-8">
        <div className="w-full md:w-96 rounded-3xl border border-restro-green-light">
          <div className="px-4 py-3">
            <label className="block mb-2">{t('appbar.select_language')}</label>
            <LanguageChanger className="hover:bg-gray-100 text-gray-700 rounded-full px-4 py-2 transition active:scale-95 w-full border" />
          </div>
        </div>
      </div>
    </Page>
  );
}