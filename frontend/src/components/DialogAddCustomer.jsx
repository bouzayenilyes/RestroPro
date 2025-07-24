import React, { useRef , useEffect } from "react";
import { toast } from "react-hot-toast";
import { addCustomer } from "../controllers/customers.controller";
import { mutate } from "swr";
import { validateEmail } from "../utils/emailValidator";
import { validatePhone } from "../utils/phoneValidator";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function DialogAddCustomer({APIURL, defaultValue, onSuccess}) {
  const { t } = useTranslation();
  const phoneRef = useRef();
  const nameRef = useRef();
  const emailRef = useRef();
  const genderRef = useRef();
  const birthDateRef = useRef();
  const { theme } = useTheme();

  useEffect(()=>{
    if(/^\d+$/.test(defaultValue)) {
      // it's number
      phoneRef.current.value = defaultValue;
    } else {
      if(defaultValue) {
        nameRef.current.value = defaultValue;
      }
    }
  }, [defaultValue])

  async function btnAdd() {
    const phone = phoneRef.current.value;
    const name = nameRef.current.value;
    const email = emailRef.current.value || null;
    const gender = genderRef.current.value || null;
    const birthDate = birthDateRef.current.value || null;

    if(!phone) {
      toast.error(t("customers.please_provide_phone"));
      return;
    }

    if(!name) {
      toast.error(t("customers.please_provide_name"));
      return;
    }

    if(email) {
      if(!validateEmail(email)) {
        toast.error(t("customers.please_provide_valid_email"));
        return;
      }
    }
    if(!validatePhone(phone)) {
      toast.error(t("customers.please_provide_valid_phone"));
      return;
    }

    try {
      toast.loading(t("toast.please_wait"));
      const res = await addCustomer(phone, name, email, birthDate, gender);

      if(res.status == 200) {
        phoneRef.current.value = null;
        nameRef.current.value = null;
        emailRef.current.value = null;
        genderRef.current.value = null;
        birthDateRef.current.value = null;

        if(APIURL){
          await mutate(APIURL);
        }
        toast.dismiss();
        toast.success(res.data.message);
        document.getElementById("modal-add-customer").close();
        if(onSuccess) {
          onSuccess(phone, name);
        }
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("toast.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  return (
    <dialog
      id="modal-add-customer"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
        <h3 className="font-bold text-lg">{t("customers.new")}</h3>

        <div className="mt-4">
          <label htmlFor="phone" className="mb-1 block text-gray-500 text-sm">
            {t("customers.phone")} <span className="text-xs text-gray-400">- ({t("customers.required")})</span>
          </label>
          <input
            ref={phoneRef}
            type="tel"
            name="phone"
            className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
            placeholder={t("customers.phone_placeholder")}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="name" className="mb-1 block text-gray-500 text-sm">
            {t("customers.name")} <span className="text-xs text-gray-400">- ({t("customers.required")})</span>
          </label>
          <input
            ref={nameRef}
            type="text"
            name="name"
            className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
            placeholder={t("customers.name_placeholder")}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="email" className="mb-1 block text-gray-500 text-sm">
            {t("customers.email")}
          </label>
          <input
            ref={emailRef}
            type="email"
            name="email"
            className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
            placeholder={t("customers.email_placeholder")}
          />
        </div>

        <div className="flex gap-4 w-full my-4">
          <div className="flex-1">
            <label htmlFor="birthdate"
              className="mb-1 block text-gray-500 text-sm"
              >
              {t("customers.birth_date")}
            </label>
            <input
              ref={birthDateRef}
              type="date"
              name="birthdate"
              max={new Date().toISOString().substring(0, 10)}
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
              placeholder={t("customers.birthdate_placeholder")}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="type" className="mb-1 block text-gray-500 text-sm">
              {t("customers.gender")}
            </label>
            <select
              ref={genderRef}
              name="type"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
              placeholder={t("customers.gender")}
            >
              <option value="">
                {t("customers.gender")}
              </option>
              <option value="female">{t("customers.female")}</option>
              <option value="male">{t("customers.male")}</option>
              <option value="other">{t("customers.other")}</option>
            </select>
          </div>
        </div>

        <div className="modal-action">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
              {t("customers.close")}
            </button>
          </form>
          <button
            onClick={() => {
              btnAdd();
            }}
            className='btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
          >
            {t("customers.save")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
