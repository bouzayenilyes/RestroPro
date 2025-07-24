import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Page from "../../components/Page";
import { CURRENCIES } from "../../config/currencies.config";
import { saveStoreSettings, useStoreSettings,uploadStoreImage , deleteStoreImage} from "../../controllers/settings.controller";
import {toast} from "react-hot-toast"
import { mutate } from "swr";
import Popover from "../../components/Popover";
import { IconExternalLink, IconQrcode, IconTrash, IconUpload } from "@tabler/icons-react";
import { iconStroke } from "../../config/config";
import QRCode from "qrcode";
import { getQRMenuLink } from "../../helpers/QRMenuHelper";
import imageCompression from "browser-image-compression";
import { getImageURL } from "../../helpers/ImageHelper";
import { useTheme } from "../../contexts/ThemeContext";

export default function SettingDetailsPage() {
  const { t } = useTranslation();
  const storeNameRef = useRef();
  const addressRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const currencyRef = useRef();
  const isQRMenuEnabledRef = useRef();
  const isQROrderEnabledRef = useRef();
  const isFeedbackEnabledRef = useRef();
  const { theme } = useTheme();

  const { APIURL, data, error, isLoading } = useStoreSettings();

  if(isLoading) {
    return <Page className="px-8 py-6">{t('settings.please_wait')}</Page>
  }

  if(error) {
    console.error(error);
    return <Page className="px-8 py-6">{t('settings.error_loading_data')}</Page>;
  }

  const { storeImage, storeName, email, address, phone, currency, isQRMenuEnabled, uniqueQRCode , isQROrderEnabled, isFeedbackEnabled, uniqueId } = data;
  
  const QR_MENU_LINK = getQRMenuLink(uniqueQRCode);

  const btnSave = async () => {
    const storeName = storeNameRef.current.value;
    const address = addressRef.current.value;
    const email = emailRef.current.value;
    const phone = phoneRef.current.value;
    const currency = currencyRef.current.value;
    const isQRMenuEnabled = isQRMenuEnabledRef.current.checked;
    const isQROrderEnabled = isQROrderEnabledRef.current.checked;
    const isFeedbackEnabled = isFeedbackEnabledRef.current.checked;

    try {

      toast.loading(t('settings.please_wait'));
      const res = await saveStoreSettings(storeName, address, phone, email, currency, null, isQRMenuEnabled , isQROrderEnabled, isFeedbackEnabled);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }

    } catch (error) {
      const message = error?.response?.data?.message || t('settings.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnDownloadMenuQR = async () => {
    try {
      const qrDataURL = await QRCode.toDataURL(QR_MENU_LINK, {width: 1080});
      const link = document.createElement("a");
      link.download="qr.png";
      link.href=qrDataURL;
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
    }
  }


  const handleFileChange = async (e) => {

    const file = e.target.files[0];

    if(!file) {
      return;
    }

    // compress image
    try {
      toast.loading(t('settings.please_wait'));
      const compressedImage = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      })

      const formData = new FormData();
      formData.append("store_image", compressedImage);

      const res = await uploadStoreImage(formData);
      if(res.status == 200) {
        toast.dismiss();
        toast.success(res.data.message);

        // update the image state
        const imagePath = res.data.imageURL;
        await mutate(APIURL);
        location.reload();
      }

    } catch (error) {
      console.error(error);
      toast.dismiss();
      const message = error?.response?.data?.message || t('settings.something_went_wrong');
      toast.error(message)
    }
  }

  const handleFileDelete = async () => {
    try {
      toast.loading(t('settings.please_wait'));

      console.log(uniqueId);

      const res = await deleteStoreImage(uniqueId);
      if(res.status == 200) {
        toast.dismiss();
        toast.success(res.data.message);
        await mutate(APIURL);
        location.reload();
      }

    } catch (error) {
      console.error(error);
      toast.dismiss();
      const message = error?.response?.data?.message || t('settings.something_went_wrong');
      toast.error(message)
    }
  }


  return (
    <Page className="px-8 py-6">
      <h3 className="text-3xl font-light">{t('settings.store_details')}</h3>

      <div className="mt-8 text-sm text-gray-500">
        {/* Store Image Upload Section */}
        <div className="mb-6">
          <label htmlFor="storeImage" className="block mb-1 font-medium">
            {t('settings.store_image')}
          </label>
          <div className="flex flex-col items-start gap-2">
            <input
              type="file"
              name="storeImage"
              id="storeImage"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className='w-24 h-24 rounded-xl flex items-center justify-center relative border border-restro-border-green'>
              {storeImage ? (
                <img 
                  src={getImageURL(storeImage)}
                  alt="Store"
                  className="object-cover w-24 h-24 rounded-xl bg-gray-50"
                />
              ) : (
                <span className="text-gray-400 text-sm">{t('settings.no_image')}</span>
              )}

              {!storeImage ? (
                <label
                  htmlFor="storeImage"
                  className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-restro-gray p-1 rounded-full shadow cursor-pointer hover:bg-restro-button-hover z-10 border border-restro-border-green text-restro-text"
                >
                 <IconUpload size={14} stroke={iconStroke} />
                </label>
              ) : (
                <button
                  className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-restro-gray p-1 rounded-full shadow cursor-pointer hover:bg-restro-red-hover z-10 text-restro-red"
                  onClick={handleFileDelete}
                >
                  <IconTrash size={14} stroke={iconStroke}/>
                </button>
              )}

            </div>
            {/* <p className="text-xs text-gray-400">
              Supported formats: JPG, PNG. Max size: 5MB.
            </p> */}
          </div>
        </div>


        <div>
          <label htmlFor="name" className="block mb-1">
            {t('settings.store_name')}
          </label>
          <input
            ref={storeNameRef}
            type="text"
            name="name"
            id="name"
            defaultValue={storeName}
            placeholder={t('settings.store_name_placeholder')}
            className='block w-full lg:min-w-96 rounded-lg px-4 py-2 text-restro-text bg-restro-gray border border-restro-border-green focus:outline-restro-button-hover'/>
        </div>
        <div className="mt-4">
          <label htmlFor="address" className="block mb-1">
            {t('settings.address')}
          </label>
          <textarea
            ref={addressRef}
            type="text"
            name="address"
            id="address"
            defaultValue={address}
            placeholder={t('settings.address_placeholder')}
            className='block w-full lg:min-w-96 rounded-lg px-4 py-2 text-restro-text bg-restro-gray border border-restro-border-green focus:outline-restro-button-hover'
          />
        </div>
        <div className="mt-4">
          <label htmlFor="email" className="block mb-1">
            {t('settings.email')}
          </label>
          <input
            ref={emailRef}
            type="email"
            name="email"
            id="email"
            defaultValue={email}
            placeholder={t('settings.email_placeholder')}
            className='block w-full lg:min-w-96 rounded-lg px-4 py-2 text-restro-text bg-restro-gray border border-restro-border-green focus:outline-restro-button-hover'
          />
        </div>
        <div className="mt-4">
          <label htmlFor="phone" className="block mb-1">
            {t('settings.phone')}
          </label>
          <input
            ref={phoneRef}
            type="tel"
            name="phone"
            id="phone"
            defaultValue={phone}
            placeholder={t('settings.phone_placeholder')}
            className='block w-full lg:min-w-96 rounded-lg px-4 py-2 text-restro-text bg-restro-gray border border-restro-border-green focus:outline-restro-button-hover'
          />
        </div>
        <div className="mt-4">
          <label htmlFor="currency" className="block mb-1">
            {t('settings.currency')}
          </label>
          <select
            ref={currencyRef}
            name="currency"
            id="currency"
            defaultValue={currency}
            placeholder={t('settings.select_currency')}
            className='block w-full lg:min-w-96 rounded-lg px-4 py-2 text-restro-text bg-restro-gray border border-restro-border-green focus:outline-restro-button-hover'
          >
            <option value="" hidden>
              {t('settings.select_currency')}
            </option>
            {CURRENCIES.map((item, index) => {
              return (
                <option value={item.cc} key={index}>
                  {item.name} - ({item.symbol})
                </option>
              );
            })}
          </select>
        </div>

        <div className="w-full lg:min-w-96 flex items-center justify-between mt-4">
          <label htmlFor="qrmenu" className="flex items-center gap-2">
            {t('settings.enable_qr_menu')}
            <Popover text={t('settings.qr_menu_tooltip')} />
          </label>

          {/* switch */}
          <label className="relative inline-flex items-center cursor-pointer no-drag">
            <input
              ref={isQRMenuEnabledRef}
              defaultChecked={isQRMenuEnabled}
              type="checkbox"
              name="qrmenu"
              id="qrmenu"
              value=""
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-100 after:border-restro-bg-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-restro-checkbox peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-restro-ring-light peer-checked:bg-restro-green peer-checked:after:border-restro-border-green`}></div>
          </label>
          {/* switch */}
        </div>

        {
          isQRMenuEnabled && <div className="mt-4 flex flex-col lg:flex-row gap-4">
          <button
            onClick={btnDownloadMenuQR}
            className='btn btn-sm transition-colors rounded-xl bg-restro-gray hover:bg-restro-button-hover'
          >
            <IconQrcode stroke={iconStroke} /> {t('settings.download_qr_code')}
          </button>
          <a
            target="_blank"
            href={QR_MENU_LINK}
            className='btn btn-sm transition-colors rounded-xl bg-restro-gray hover:bg-restro-button-hover'
          >
            <IconExternalLink stroke={iconStroke} /> {t('settings.view_digital_menu')}
          </a>
          </div>
        }

         <div className="w-full lg:min-w-96 flex items-center justify-between mt-4">
            <label htmlFor="qrorder" className="flex items-center gap-2">
              {t('settings.enable_qr_order')}
              <Popover text={t('settings.qr_order_tooltip')} />
            </label>

            {/* switch */}
            <label className="relative inline-flex items-center cursor-pointer no-drag">
              <input
                ref={isQROrderEnabledRef}
                defaultChecked={isQROrderEnabled}
                type="checkbox"
                name="qrorder"
                id="qrorder"
                value=""
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-100 after:border-restro-bg-gray after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-restro-checkbox peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-restro-ring-light peer-checked:bg-restro-green peer-checked:after:border-restro-border-green`}></div>
            </label>
            {/* switch */}
          </div>


        <div className="w-full lg:min-w-96 flex items-center justify-between mt-4">
          <label htmlFor="feedback" className="flex items-center gap-2">
            {t('settings.enable_feedback')}
            <Popover text={t('settings.feedback_tooltip')} />
          </label>

          {/* switch */}
          <label className="relative inline-flex items-center cursor-pointer no-drag">
            <input
              ref={isFeedbackEnabledRef}
              defaultChecked={isFeedbackEnabled}
              type="checkbox"
              name="feedback"
              id="feedback"
              value=""
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
          {t('settings.save')}
        </button>
      </div>
    </Page>
  );
}
