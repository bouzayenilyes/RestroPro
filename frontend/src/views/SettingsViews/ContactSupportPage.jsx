import React from 'react'
import Page from "../../components/Page";
import { IconBrandGmail, IconCopy, IconExternalLink, IconMail, IconX } from "@tabler/icons-react";
import { iconStroke, supportEmail } from "../../config/config";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { useTheme } from '../../contexts/ThemeContext';

export default function ContactSupportPage() {
  const { t } = useTranslation();
  const email = supportEmail;
  const { theme } = useTheme();

  return (
    <Page>
      <h3>{t("contact_support.title")}</h3>

      <div className='mt-6 w-full lg:max-w-lg rounded-2xl px-4 py-3 flex items-center gap-8 justify-between border border-restro-border-green bg-restro-gray'>
        <p className='text-2xl'>
          {t("contact_support.need_help")}<br/>
          <span className="text-base font-normal" dangerouslySetInnerHTML={{ __html: t("contact_support.description", { email }) }}></span>
        </p>

        <button onClick={()=>{
          document.getElementById("mailto").showModal();
        }} className='mailtoui flex items-center gap-2 justify-center rounded-full px-4 py-3 text-white bg-restro-green hover:bg-restro-green-button-hover'><IconMail stroke={iconStroke} /> {email}</button>
      </div>

      <dialog id="mailto" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t("contact_support.send_mail")}</h3>
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
              toast.success(t("contact_support.copied_to_clipboard"));
            }} className='btn bg-gray-600 text-white'><IconCopy stroke={iconStroke} />{t("contact_support.copy")}</button>
          </div>


          <div className="border-b my-6"></div>

          <p className='text-center mb-2'>{t("contact_support.or_open_with")}</p>

          <a href={`mailto:${email}`} className='flex items-center gap-2 transition active:scale-95 bg-gray-100 hover:bg-gray-200 px-4 rounded-full py-3 text-gray-600'><IconMail stroke={iconStroke} />{t("contact_support.default_mail_app")}</a>

          <a target='_blank' href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=&cc=&bcc=&body=`} className='flex items-center gap-2 transition active:scale-95 bg-gray-100 hover:bg-gray-200 px-4 rounded-full py-3 text-gray-600 mt-2'><IconBrandGmail stroke={iconStroke} />{t("contact_support.gmail_in_browser")}</a>
        </div>

      </dialog>
    </Page>
  )
}
