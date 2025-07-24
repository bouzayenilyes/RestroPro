import React from "react";
import LNavbar from "./LNavbar";
import { Link } from "react-router-dom";
import {
  IconChefHat,
  IconDeviceIpadHorizontal,
  IconDeviceTablet,
  IconLayout,
} from "@tabler/icons-react";
import Logo from "../../assets/logo.svg";
import { subscriptionPrice, supportEmail } from "../../config/config";
import LanguageChanger from "../../components/LanguageChanger";
import { useTranslation } from "react-i18next";

export default function LadingPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white text-gray-800">
      {/* navbar */}
      <LNavbar />
      {/* navbar */}

      {/* hero */}
      <div className="w-full container mx-auto flex flex-col items-center mt-40 px-6 lg:px-12">
        <h3 className="text-3xl lg:text-5xl font-bold text-center text-gray-800">{t("landing_page.all_in_one_pos")}</h3>
        <h3 className="text-3xl lg:text-5xl font-bold text-center text-gray-800">
          {t("landing_page.for_your_business")}
        </h3>

        <p className="text-gray-500 mt-8 text-center">
          {t("landing_page.hero_description")}
        </p>

        <div className="flex items-center gap-4 mt-8">
          <Link
            className="hover:bg-[#70B56A]-dark bg-[#70B56A] text-lg text-white rounded-full px-5 py-3 transition active:scale-95"
            to="/login"
          >
            {t("landing_page.get_started")}
          </Link>
          <a
            className="hover:bg-gray-100 text-restro-green-dark text-lg rounded-full px-5 py-3 transition active:scale-95"
            href="#pricing"
          >
            {t("landing_page.view_pricing")}
          </a>
        </div>
      </div>
      <img
        src="/assets/hero.webp"
        alt="restro pro image"
        className="w-full block"
      />
      {/* hero */}

      {/* features */}
      <h3 className="text-4xl font-bold text-center container mx-auto mt-40">
        {t("landing_page.features")}
      </h3>
      <div
        id="features"
        className="w-full container mx-auto grid grid-cols-1 lg:grid-cols-3 my-20 gap-10 px-6 lg:px-12"
      >
        <div className="rounded-2xl px-8 py-6 border flex flex-col items-center justify-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-restro-green bg-green-100">
            <IconLayout />
          </div>
          <h3 className="mt-4 font-bold text-2xl text-center">{t("landing_page.minimal_ui")}</h3>
          <p className="text-gray-700 mt-2 text-center">
            {t("landing_page.minimal_ui_description")}
          </p>
        </div>

        <div className="rounded-2xl px-8 py-6 border flex flex-col items-center justify-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-restro-green bg-green-100">
            <IconDeviceIpadHorizontal />
          </div>
          <h3 className="mt-4 font-bold text-2xl text-center">{t("landing_page.pos")}</h3>
          <p className="text-gray-700 mt-2 text-center">
            {t("landing_page.pos_description")}
          </p>
        </div>

        <div className="rounded-2xl px-8 py-6 border flex flex-col items-center justify-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-restro-green bg-green-100">
            <IconChefHat />
          </div>
          <h3 className="mt-4 font-bold text-2xl text-center">{t("landing_page.live_updates")}</h3>
          <p className="text-gray-700 mt-2 text-center">
            {t("landing_page.live_updates_description")}
          </p>
        </div>
      </div>
      {/* features */}

      {/* pricing */}
      <h3 className="text-4xl font-bold text-center container mx-auto mt-40">
        {t("landing_page.pricing")}
      </h3>
      <div
        id="pricing"
        className="w-full container mx-auto grid grid-cols-1 my-20 gap-10 place-items-center px-6 lg:px-0"
      >
        <div className="rounded-2xl px-8 py-6 border flex flex-col w-full lg:w-96">
          <h3 className="text-4xl text-green-700 font-bold text-center">{subscriptionPrice}</h3>
          <h3 className=" font-bold text-2xl text-center">{t("landing_page.per_month")}</h3>
          <ul className="text-gray-700 mt-6 flex flex-col gap-2 text-start">
            <li>{t("landing_page.unlimited_orders")}</li>
            <li>{t("landing_page.monthly_renewals")}</li>
            <li>{t("landing_page.unlimited_devices")}</li>
            <li>{t("landing_page.live_kitchen_orders")}</li>
          </ul>
        </div>
      </div>
      {/* pricing */}

      {/* contact */}
      <div id="contact" className="container mx-auto my-40 px-6 lg:px-12">
        <div
          className="lg:h-40 px-10 py-6 flex gap-4 flex-col md:flex-row lg:items-center rounded-3xl bg-[#243922] text-restro-green shadow-2xl shadow-green-700/40"
        >
          <h3 className="flex-1 font-bold text-4xl text-white">
            {t("landing_page.have_any_queries")}
          </h3>
          <a
            className="bg-white text-lg text-restro-green-dark rounded-full px-5 py-3 transition active:scale-95 block"
            href={`mailto:${supportEmail}`}
          >
            {t("landing_page.contact_us")}
          </a>
        </div>
      </div>
      {/* contact */}

      {/* footer */}
      <div className="w-full border-t">
        <div className="flex flex-col lg:flex-row  lg:justify-between gap-4 container mx-auto px-4 py-10 lg:px-12">
          <div className="w-full md:max-w-80">
            <img src={Logo} alt="logo" className="h-12" />
            <p className="mt-2 text-sm text-gray-500">
              {t('landing_page.footer_description')}
            </p>

            <div className="flex items-center mt-6 gap-2">
              <label htmlFor="language">{t("landing_page.language")}</label>
              <LanguageChanger className="border bg-white hover:bg-gray-100 text-gray-700 rounded-full px-4 py-2 transition active:scale-95" />
            </div>
          </div>
          <div className="flex flex-col lg:flex-col">
            <a
              className="hover:bg-gray-100 text-gray-700 rounded-full px-4 py-2 transition active:scale-95"
              href="#"
            >
              {t("landing_page.privacy_policy")}
            </a>
            <a
              className="hover:bg-gray-100 text-gray-700 rounded-full px-4 py-2 transition active:scale-95"
              href="#"
            >
              {t("landing_page.refund_policy")}
            </a>
            <a
              className="hover:bg-gray-100 text-gray-700 rounded-full px-4 py-2 transition active:scale-95"
              href="#"
            >
              {t("landing_page.terms_conditions")}
            </a>
          </div>
        </div>

        <div className="border-t text-sm text-gray-500 text-center py-6">
          {t("landing_page.made_with_love")}
        </div>
      </div>
      {/* footer */}
    </div>
  );
}
