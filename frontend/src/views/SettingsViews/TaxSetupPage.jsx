import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Page from "../../components/Page";
import { IconDeviceFloppy, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { iconStroke } from "../../config/config";
import { addNewTax, deleteTax, updateTax, useTaxes, updateServiceCharge, useStoreSettings, getServiceCharge } from "../../controllers/settings.controller";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import { useTheme } from "../../contexts/ThemeContext";

export default function TaxSetupPage() {
  const { t } = useTranslation();

  const serviceChargeRef = useRef();
  const taxTitleAddRef = useRef();
  const taxRateAddRef = useRef();
  const taxTypeAddRef = useRef();

  const taxIdUpdateRef = useRef();
  const taxTitleUpdateRef = useRef();
  const taxRateUpdateRef = useRef();
  const taxTypeUpdateRef = useRef();
  const {theme} = useTheme();

  const { APIURL, data: taxes, error, isLoading } = useTaxes();

  const fetchServiceCharge = async () => {
    try {
      const res = await getServiceCharge();

      if(res.status == 200) {
        serviceChargeRef.current.value = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchServiceCharge();
  }, [])

  if (isLoading) {
    return <Page className="px-8 py-6">{t('tax_setup.loading_message')}</Page>;
  }

  if (error) {
    console.error(error);
    return <Page className="px-8 py-6">{t('tax_setup.error_loading_data')}</Page>;
  }

  async function btnAdd () {
    const title = taxTitleAddRef.current.value;
    const rate = taxRateAddRef.current.value;
    const type = taxTypeAddRef.current.value;

    if(!title) {
      toast.error(t('tax_setup.provide_title_error'));
      return;
    }
    if(rate < 0) {
      toast.error(t('tax_setup.invalid_tax_rate_error'));
      return;
    }
    if(!type) {
      toast.error(t('tax_setup.select_tax_type_error'));
      return;
    }

    try {
      toast.loading(t('tax_setup.please_wait'));
      const res = await addNewTax(title, rate, type);

      if(res.status == 200) {
        taxTitleAddRef.current.value = null;
        taxRateAddRef.current.value = null;
        taxTypeAddRef.current.value = null;
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('tax_setup.error_message');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnDelete = async (id) => {
    const isConfirm = window.confirm(t('tax_setup.delete_confirm'));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t('tax_setup.please_wait'));
      const res = await deleteTax(id);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('tax_setup.error_message');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnShowUpdate = async (id, title, rate, type) => {
    taxIdUpdateRef.current.value = id;
    taxTitleUpdateRef.current.value = title;
    taxRateUpdateRef.current.value = rate;
    taxTypeUpdateRef.current.value = type;
    document.getElementById('modal-update').showModal();
  };

  const btnUpdate = async () => {
    const id = taxIdUpdateRef.current.value
    const title = taxTitleUpdateRef.current.value
    const rate = taxRateUpdateRef.current.value
    const type = taxTypeUpdateRef.current.value

    if(!title) {
      toast.error(t('tax_setup.provide_title_error'));
      return;
    }
    if(rate < 0) {
      toast.error(t('tax_setup.invalid_tax_rate_error'));
      return;
    }
    if(!type) {
      toast.error(t('tax_setup.select_tax_type_error'));
      return;
    }

    try {
      toast.loading(t('tax_setup.please_wait'));
      const res = await updateTax(id, title, rate, type);

      if(res.status == 200) {
        taxIdUpdateRef.current.value = null;
        taxTypeUpdateRef.current.value = null;
        taxRateUpdateRef.current.value = null;
        taxTitleUpdateRef.current.value = null;

        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('tax_setup.error_message');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnUpdateServiceCharge = async () => {
    const serviceCharge = serviceChargeRef.current.value

    if(!serviceCharge) {
      toast.error(t('tax_setup.service_charge_error'));
      return;
    }
    if(serviceCharge < 0 || serviceCharge > 100) {
      toast.error(t('tax_setup.invalid_service_charge_error'));
      return;
    }

    try {
      toast.loading(t('tax_setup.please_wait'));
      const res = await updateServiceCharge(serviceCharge);

      if(res.status == 200) {
        serviceChargeRef.current.value = null;

        await fetchServiceCharge();
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('tax_setup.error_message');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page className="px-8 py-6">
      <div className="flex items-center gap-6">
        <h3 className="text-3xl font-light">{t('tax_setup.title')}</h3>
        <button onClick={()=>document.getElementById('modal-add').showModal()} className = "text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover">
          <IconPlus size={22} stroke={iconStroke} /> {t('tax_setup.new')}
        </button>
      </div>

      <div className="mt-8">
        <label htmlFor="servicecharge" className="block mb-1">
          {t('tax_setup.service_charge_label')}
        </label>
        <div className="flex gap-4 items-center">
          <input
            ref={serviceChargeRef}
            type="number"
            name="servicecharge"
            id="servicecharge"
            placeholder={t('tax_setup.service_charge_placeholder')}
            className='w-full block lg:min-w-96 rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
            max={100}
            min={0}
          />
          <button className='rounded-lg text-white font-semibold px-2 py-2 bg-restro-green hover:bg-restro-green-button-hover' onClick={() => btnUpdateServiceCharge()}><IconDeviceFloppy/></button>
        </div>
      </div>

      <div className="mt-8 w-full">
        <table className='w-full overflow-x-auto border border-restro-border-green'>
          <thead>
            <tr>
              <th className='px-3 py-2 font-medium md:w-20 text-start bg-restro-card-bg'>
                #
              </th>
              <th className='px-3 py-2 font-medium md:w-96 text-start bg-restro-card-bg'>
                {t('tax_setup.tax_title_label')}
              </th>

              <th className='px-3 py-2 font-medium md:w-20 text-start bg-restro-card-bg'>
                {t('tax_setup.tax_rate_label')}
              </th>

              <th className='px-3 py-2 font-medium md:w-28 text-start bg-restro-card-bg'>
                {t('tax_setup.tax_type_label')}
              </th>
              <th className='px-3 py-2 font-medium md:w-28 text-start bg-restro-card-bg'>
                {t('tax_setup.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {taxes.map((tax, index) => {
              const { id, title, rate, type } = tax;

              return (
                <tr key={index}>
                  <td className="px-3 py-2 text-start">{index+1}</td>
                  <td className="px-3 py-2 text-start">{title}</td>
                  <td className="px-3 py-2 text-start">{rate}%</td>
                  <td className="px-3 py-2 text-start">{type}</td>
                  <td className="px-3 py-2 text-start flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => {
                        btnShowUpdate(id, title, rate, type);
                      }}
                      className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text hover:bg-restro-button-hover'
                    >
                      <IconPencil stroke={iconStroke} />
                    </button>
                    <button
                      onClick={()=>{
                        btnDelete(id);
                      }}
                      className='w-8 h-8 rounded-full flex items-center justify-center text-restro-red transition active:scale-95 hover:bg-restro-button-hover'
                    >
                      <IconTrash stroke={iconStroke} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog id="modal-add" className={`modal modal-bottom sm:modal-middle `}>
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('tax_setup.add_new_tax')}</h3>

          <div className="mt-4">
            <label htmlFor="title" className={`mb-1 block text-gray-500 text-sm font-medium`}>{t('tax_setup.tax_title_label')}</label>
            <input ref={taxTitleAddRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('tax_setup.tax_title_placeholder')} />
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label htmlFor="rate" 
              className="mb-1 block text-gray-500 text-sm font-medium">{t('tax_setup.tax_title_label')} {t('tax_setup.tax_rate_label')}</label>
              <input ref={taxRateAddRef} type="number" name="rate" 
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-bg-gray' placeholder={t('tax_setup.tax_rate_placeholder')} />
            </div>
            <div className="flex-1">
              <label htmlFor="type" className="mb-1 block text-gray-500 text-sm font-medium">{t('tax_setup.tax_type_label')}</label>
              <select ref={taxTypeAddRef} name="type" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray'>
                <option value="" hidden>{t('tax_setup.tax_type_placeholder')}</option>
                <option value="exclusive">{t('tax_setup.exclusive')}</option>
                <option value="inclusive">{t('tax_setup.inclusive')}</option>
              </select>
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className='transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('tax_setup.close')}</button>
              <button onClick={()=>{btnAdd();}} className = 'rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('tax_setup.save')}</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="modal-update" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('tax_setup.update_tax')}</h3>
          <div className="mt-4">
            <input type="hidden" ref={taxIdUpdateRef} />
            <label htmlFor="title" className="mb-1 block text-gray-500 text-sm font-medium">{t('tax_setup.tax_title_label')}</label>
            <input ref={taxTitleUpdateRef} type="text" name="title"
            className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
            placeholder={t('tax_setup.tax_title_placeholder')} />
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label htmlFor="rate" className="mb-1 block text-gray-500 text-sm font-medium">{t('tax_setup.tax_rate_label')}</label>
              <input ref={taxRateUpdateRef} type="number" name="rate" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('tax_setup.tax_rate_placeholder')} />
            </div>
            <div className="flex-1">
              <label htmlFor="type" className="mb-1 block text-gray-500 text-sm font-medium">{t('tax_setup.tax_type_label')}</label>
              <select ref={taxTypeUpdateRef} name="type" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('tax_setup.tax_type_placeholder')} >
                <option value="" hidden>{t('tax_setup.tax_type_placeholder')}</option>
                <option value="exclusive">{t('tax_setup.exclusive')}</option>
                <option value="inclusive">{t('tax_setup.inclusive')}</option>
              </select>
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className='transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('tax_setup.close')}</button>
              <button onClick={()=>{btnUpdate();}} className = 'rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('tax_setup.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
    </Page>
  )
}
