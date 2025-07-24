import React from 'react'
import Page from "../../components/Page";
import { IconBrandGmail, IconCopy, IconExternalLink, IconMail, IconX } from "@tabler/icons-react";
import { iconStroke, supportEmail } from "../../config/config";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { useTheme } from '../../contexts/ThemeContext';
export default function SuperAdminContactSupportPage() {
  const { t } = useTranslation();
  const email = supportEmail;
  const { theme } = useTheme();
  return (
    <Page>
      <h3>{t("superadmin_contact_support.title")}</h3>

      <div className="mt-6 w-full lg:max-w-lg rounded-2xl px-4 py-3 border border-restro-bg-gray flex items-center gap-8 justify-between">
        <p className='text-2xl'>
          {t("superadmin_contact_support.need_help")}<br/>
          <span className="text-base text-restro-text font-normal" dangerouslySetInnerHTML={{ __html: t("superadmin_contact_support.description", { email }) }} />
        </p>

        <button onClick={()=>{
          document.getElementById("mailto").showModal();
        }} className='mailtoui flex items-center gap-2 justify-center rounded-full text-white bg-restro-green px-4 py-3'><IconMail stroke={iconStroke} /> {email}</button>
      </div>

      <dialog id="mailto" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t("superadmin_contact_support.send_mail")}</h3>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-circle btn-ghost"><IconX stroke={iconStroke} /></button>
            </form>  
          </div>
          
          <div className="flex gap-2 mt-4">
            <input type="email" id='mailto_email' disabled value={email} className='input input-bordered input-disabled flex-1' />
            <button onClick={()=>{
              const mailElem = document.getElementById("mailto_email");

              mailElem.select();

              navigator.clipboard.writeText(mailElem.value);
              toast.success(t("superadmin_contact_support.copied_to_clipboard"));
            }} className='btn bg-gray-500 dark:bg-restro-gray hover:bg-gray-600 dark:hover:bg-restro-button-hover text-white rounded-xl'><IconCopy stroke={iconStroke} />{t("superadmin_contact_support.copy")}</button>
          </div>

          <div className="border-b my-6"></div>

          <p className='text-center mb-2'>{t("superadmin_contact_support.or_open_with")}</p>

          <a href={`mailto:${email}`} className='flex items-center gap-2 transition active:scale-95 bg-gray-100 hover:bg-gray-200 px-4 rounded-full py-3 text-restro-text dark:bg-restro-gray dark:hover:bg-restro-button-hover'><IconMail stroke={iconStroke} />{t("superadmin_contact_support.default_mail_app")}</a>

          <a target='_blank' href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=&cc=&bcc=&body=`} className='flex items-center gap-2 transition active:scale-95 bg-gray-100 hover:bg-gray-200 dark:bg-restro-gray dark:hover:bg-restro-button-hover px-4 rounded-full py-3 text-restro-text mt-2'><IconBrandGmail stroke={iconStroke} />{t("superadmin_contact_support.gmail_in_browser")}</a>
        </div>
      </dialog>
    </Page>
  )
}
