import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Page from "../../components/Page";
import {
  savePrintSettings,
  usePrintSettings,
} from "../../controllers/settings.controller";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import Popover from "../../components/Popover";
import { use } from "react";
import { useTheme } from "../../contexts/ThemeContext";

export default function PrintSettingsPage() {
  const { t } = useTranslation();
  const enablePrintRef = useRef();
  const showStoreDetailsRef = useRef();
  const showCustomerDetailsRef = useRef();
  const pageSizeRef = useRef();
  const headerRef = useRef();
  const footerRef = useRef();
  const showNotesRef = useRef();
  const printTokenRef = useRef();
  const { theme } = useTheme();

  const { APIURL, data, error, isLoading } = usePrintSettings();

  if (isLoading) {
    return <Page className="px-8 py-6">{t('print_settings.please_wait')}</Page>;
  }

  if (error) {
    console.error(error);
    return <Page className="px-8 py-6">{t('print_settings.error_loading_data')}</Page>;
  }

  const {
    pageFormat,
    header,
    footer,
    showNotes,
    isEnablePrint,
    showStoreDetails,
    showCustomerDetails,
    printToken,
  } = data;

  const btnSave = async () => {
    const enablePrint = enablePrintRef.current.checked;
    const showStoreDetails = showStoreDetailsRef.current.checked;
    const showCustomerDetails = showCustomerDetailsRef.current.checked;
    const pageSize = pageSizeRef.current.value;
    const header = headerRef.current.value;
    const footer = footerRef.current.value;
    const showNotes = showNotesRef.current.checked;
    const printToken = printTokenRef.current.checked;

    try {

      toast.loading(t('print_settings.please_wait'));
      const res = await savePrintSettings(pageSize, header, footer, showNotes, enablePrint, showStoreDetails, showCustomerDetails, printToken);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
      
    } catch (error) {
      const message = error?.response?.data?.message || t('print_settings.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page className="px-8 py-6">
      <h3 className="text-3xl font-light">{t('print_settings.title')}</h3>

      <div className="mt-8 text-gray-500 text-sm">
        <div className="w-full lg:min-w-96 flex items-center justify-between">
          <label htmlFor="enablePrint" className="flex items-center gap-2">
            {t('print_settings.enable_print')}
            <Popover text={t('print_settings.enable_print_tooltip')} />
          </label>

          {/* switch */}
          <label className="relative inline-flex items-center cursor-pointer no-drag">
            <input
              ref={enablePrintRef}
              defaultChecked={isEnablePrint}
              type="checkbox"
              name="enablePrint"
              id="enablePrint"
              value=""
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-100 after:border-restro-bg-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-restro-checkbox peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-restro-ring-light peer-checked:bg-restro-green peer-checked:after:border-restro-border-green`}></div>
          </label>
          {/* switch */}
        </div>

        <div className="mt-4 w-full lg:min-w-96 flex items-center justify-between">
          <label htmlFor="showStoreDetails" className="flex items-center gap-2">
            {t('print_settings.show_store_details')}
            <Popover text={t('print_settings.show_store_details_tooltip')} />
          </label>

          {/* switch */}
          <label className="relative inline-flex items-center cursor-pointer no-drag">
            <input
              ref={showStoreDetailsRef}
              defaultChecked={showStoreDetails}
              type="checkbox"
              value=""
              name="showStoreDetails"
              id="showStoreDetails"
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-100 after:border-restro-bg-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-restro-checkbox peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-restro-ring-light peer-checked:bg-restro-green peer-checked:after:border-restro-border-green`}></div>
          </label>
          {/* switch */}
        </div>

        <div className="mt-4 w-full lg:min-w-96 flex items-center justify-between">
          <label
            htmlFor="showCustomerDetails"
            className="flex items-center gap-2"
          >
            {t('print_settings.show_customer_details')}
            <Popover text={t('print_settings.show_customer_details_tooltip')} />
          </label>

          {/* switch */}
          <label className="relative inline-flex items-center cursor-pointer no-drag">
            <input
              ref={showCustomerDetailsRef}
              defaultChecked={showCustomerDetails}
              type="checkbox"
              value=""
              name="showCustomerDetails"
              id="showCustomerDetails"
              className="sr-only peer"
            />
           <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-100 after:border-restro-bg-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-restro-checkbox peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-restro-ring-light peer-checked:bg-restro-green peer-checked:after:border-restro-border-green`}></div>
          </label>
          {/* switch */}
        </div>

        <div className="mt-4 w-full lg:min-w-96">
          <label htmlFor="pageSize" className="block mb-1">
            {t('print_settings.format_page_size')}
          </label>
          <select
            ref={pageSizeRef}
            defaultValue={pageFormat}
            name="pageSize"
            id="pageSize"
            className='block w-full lg:min-w-96 rounded-lg px-4 py-2 text-restro-text bg-restro-gray border border-restro-border-green focus:outline-restro-button-hover'
          >
            <option hidden value="">
              {t('print_settings.select_page_size')}
            </option>
            <option value="80">80mm</option>
            <option value="57">57mm</option>
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="header" className="block mb-1">
            {t('print_settings.header')}
          </label>
          <textarea
            ref={headerRef}
            defaultValue={header}
            type="text"
            name="header"
            id="header"
            placeholder={t('print_settings.header_placeholder')}
            className='block w-full h-20 lg:min-w-96 rounded-lg px-4 py-2 text-restro-text bg-restro-gray border border-restro-border-green focus:outline-restro-button-hover'
          />
        </div>

        <div className="mt-4">
          <label htmlFor="footer" className="block mb-1">
            {t('print_settings.footer')}
          </label>
          <textarea
            ref={footerRef}
            defaultValue={footer}
            type="text"
            name="footer"
            id="footer"
            placeholder={t('print_settings.footer_placeholder')}
           className='block w-full h-20 lg:min-w-96 rounded-lg px-4 py-2 text-restro-text bg-restro-gray border border-restro-border-green focus:outline-restro-button-hover'
          />
        </div>

        <div className="mt-4 w-full lg:min-w-96 flex items-center justify-between">
          <label htmlFor="showNotes" className="flex items-center gap-2">
            {t('print_settings.show_notes')}
            <Popover text={t('print_settings.show_notes_tooltip')} />
          </label>

          {/* switch */}
          <label className="relative inline-flex items-center cursor-pointer no-drag">
            <input
              ref={showNotesRef}
              defaultChecked={showNotes}
              type="checkbox"
              value=""
              name="showNotes"
              id="showNotes"
              className="sr-only peer"
            />
           <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-100 after:border-restro-bg-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-restro-checkbox peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-restro-ring-light peer-checked:bg-restro-green peer-checked:after:border-restro-border-green`}></div>
          </label>
          {/* switch */}
        </div>

        <div className="mt-4 w-full lg:min-w-96 flex items-center justify-between">
          <label htmlFor="printToken" className="flex items-center gap-2">
            {t('print_settings.print_token')}
            <Popover text={t('print_settings.print_token_tooltip')} />
          </label>

          {/* switch */}
          <label className="relative inline-flex items-center cursor-pointer no-drag">
            <input
              ref={printTokenRef}
              defaultChecked={printToken}
              type="checkbox"
              value=""
              name="printToken"
              id="printToken"
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-100 after:border-restro-bg-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-restro-checkbox peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-restro-ring-light peer-checked:bg-restro-green peer-checked:after:border-restro-border-green`}></div>
          </label>
          {/* switch */}
        </div>

        <button
          onClick={btnSave}
          className='text-white w-full lg:min-w-96 transition  active:scale-95 rounded-xl px-4 py-2 mt-6 bg-restro-green hover:bg-restro-green-button-hover '
        >
          {t('print_settings.save')}
        </button>
      </div>
    </Page>
  );
}
