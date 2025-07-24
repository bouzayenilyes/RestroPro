import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Page from "../../components/Page";
import {
  IconPencil,
  IconPlus,
  IconTrash,
  IconArmchair2,
  IconQrcode,
} from "@tabler/icons-react";
import { iconStroke } from "../../config/config";
import { addNewStoreTable, deleteTable, updateStoreTable, useStoreSettings, useStoreTables } from "../../controllers/settings.controller";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { getTableQRMenuLink } from "../../helpers/QRMenuHelper";
import QRCode from "qrcode";
import { useTheme } from "../../contexts/ThemeContext";

export default function TableSettingsPage() {
  const { t } = useTranslation();

  const tableTitleRef = useRef();
  const tableFloorRef = useRef();
  const tableSeatingCapacityRef = useRef();

  const tableIdRef = useRef();
  const tableTitleUpdateRef = useRef();
  const tableFloorUpdateRef = useRef();
  const tableSeatingCapacityUpdateRef = useRef();
  const {theme} = useTheme();

  const { data:storeSettings, error:errorStore, isLoading:isLoadingStore } = useStoreSettings();
  const { APIURL, data: storeTables, error, isLoading } = useStoreTables();

  if (isLoading) {
    return <Page className="px-8 py-6">{t('table_settings.please_wait')}</Page>;
  }

  if (error) {
    console.error(error);
    return <Page className="px-8 py-6">{t('table_settings.error_loading_data')}</Page>;
  }

  if (isLoadingStore) {
    return <Page className="px-8 py-6">{t('table_settings.please_wait')}</Page>;
  }

  const { uniqueQRCode, isQRMenuEnabled } = storeSettings

  const btnDelete = async (id) => {
    const isConfirm = window.confirm(t('table_settings.are_you_sure'));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t('table_settings.please_wait'));
      const res = await deleteTable(id);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('table_settings.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  async function btnAdd() {
    const title = tableTitleRef.current.value;
    const floor = tableFloorRef.current.value;
    const seatingCapacity = tableSeatingCapacityRef.current.value;

    if(!title) {
      toast.error(t('table_settings.provide_title_error'));
      return;
    }
    if(!floor) {
      toast.error(t('table_settings.provide_floor_error'));
      return;
    }
    if(!seatingCapacity) {
      toast.error(t('table_settings.provide_seating_capacity_error'));
      return;
    }

    if(seatingCapacity < 0) {
      toast.error(t('table_settings.provide_valid_seating_capacity_error'));
      return;
    }

    try {
      toast.loading(t('table_settings.please_wait'));
      const res = await addNewStoreTable(title, floor, seatingCapacity);

      if(res.status == 200) {
        tableTitleRef.current.value = null;
        tableFloorRef.current.value = null;
        tableSeatingCapacityRef.current.value = null;
        
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('table_settings.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  const btnShowUpdate = async (id, title, floor, seatingCapacity) => {
    tableIdRef.current.value = id;
    tableTitleUpdateRef.current.value = title;
    tableFloorUpdateRef.current.value = floor;
    tableSeatingCapacityUpdateRef.current.value = seatingCapacity;
    document.getElementById('modal-update').showModal();
  };

  const btnUpdate = async ()=>{
    const id = tableIdRef.current.value;
    const title = tableTitleUpdateRef.current.value;
    const floor = tableFloorUpdateRef.current.value;
    const seatingCapacity = tableSeatingCapacityUpdateRef.current.value;

    if(!title) {
      toast.error(t('table_settings.provide_title_error'));
      return;
    }
    if(!floor) {
      toast.error(t('table_settings.provide_floor_error'));
      return;
    }
    if(!seatingCapacity) {
      toast.error(t('table_settings.provide_seating_capacity_error'));
      return;
    }

    if(seatingCapacity < 0) {
      toast.error(t('table_settings.provide_valid_seating_capacity_error'));
      return;
    }

    try {
      toast.loading(t('table_settings.please_wait'));
      const res = await updateStoreTable(id, title, floor, seatingCapacity);

      if(res.status == 200) {
        tableIdRef.current.value = null;
        tableTitleUpdateRef.current.value = null;
        tableFloorUpdateRef.current.value = null;
        tableSeatingCapacityUpdateRef.current.value = null;
        
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('table_settings.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnDownloadTableMenuQR = async (tableId, title) => {
    try {
      if(!isQRMenuEnabled) {
        toast.error(t('table_settings.enable_qr_menu_error'));
        return;
      }

      const QR_MENU_LINK = getTableQRMenuLink(uniqueQRCode, tableId)
      const qrDataURL = await QRCode.toDataURL(QR_MENU_LINK, {width: 1080});
      const link = document.createElement("a");

      const fileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()

      link.download=`${fileName}-qr.png`;
      link.href=qrDataURL;
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Page className="px-8 py-6">
      <div className="flex items-center gap-6">
        <h3 className="text-3xl font-light">{t('table_settings.store_tables')}</h3>
        <button
          onClick={() => document.getElementById("modal-add").showModal()}
          className='border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 w-fit text-restro-text rounded-lg bg-restro-card-bg border-restro-border-green hover:bg-restro-button-hover'
        >
          <IconPlus size={22} stroke={iconStroke} /> {t('table_settings.new')}
        </button>
      </div>

      <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {storeTables.map((storeTable, index) => {
          const { id, table_title, seating_capacity, floor, encrypted_id } = storeTable;

          return (
            <div
              key={id}
              className='flex flex-wrap flex-col px-4 py-5 rounded-2xl gap-4 text-sm border border-restro-border-green'
            >
              <div className="flex items-center gap-2">
                <div className='w-12 h-11 rounded-full flex items-center justify-center text-gray-500 dark:text-white bg-restro-bg-gray border-restro-border-green'>
                  <IconArmchair2 />
                </div>
                <div>
                  <p>
                    {table_title} - {floor}
                  </p>
                  <p className="text-gray-400">
                    {t('table_settings.seating_capacity')}: {seating_capacity}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => {
                      btnShowUpdate(id, table_title, floor, seating_capacity);
                    }}
                    className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text hover:bg-restro-button-hover'
                  >
                    <IconPencil stroke={iconStroke} />
                  </button>
                  <button
                    onClick={() => {btnDelete(id);}}
                    className='w-8 h-8 rounded-full flex items-center justify-center text-restro-red transition active:scale-95 hover:bg-restro-button-hover'
                  >
                    <IconTrash stroke={iconStroke} />
                  </button>
                </div>
              </div>

              <button onClick={()=>{
                btnDownloadTableMenuQR(encrypted_id, table_title);
              }} className='btn btn-xs transition active:scale-95 hover:shadow-lg rounded-lg border border-restro-border-green bg-restro-bg-gray hover:bg-restro-button-hover'><IconQrcode size={18} stroke={iconStroke} /> {t('table_settings.download_table_qr')}</button>
            </div>
          );
        })}
      </div>

      <dialog id="modal-add" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('table_settings.add_new_table')}</h3>
          
          <div className="mt-4">
            <label htmlFor="title" className="mb-1 block text-gray-500 text-sm">{t('table_settings.title')}</label>
            <input ref={tableTitleRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green' placeholder={t('table_settings.enter_table_title')} />
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label htmlFor="floor" className="mb-1 block text-gray-500 text-sm">{t('table_settings.floor')}</label>
              <input ref={tableFloorRef} type="text" name="floor" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green' placeholder={t('table_settings.enter_floor_title')} />
            </div>
            <div className="flex-1">
              <label htmlFor="capacity" className="mb-1 block text-gray-500 text-sm">{t('table_settings.seating_capacity')}</label>
              <input ref={tableSeatingCapacityRef} type="number" min={0} name="capacity" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green' placeholder={t('table_settings.enter_seating_capacity')} />
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('table_settings.close')}</button>
              <button onClick={()=>{btnAdd();}} className = 'btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('table_settings.save')}</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="modal-update" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('table_settings.update_table')}</h3>
          
          <div className="mt-4">
            <input type="hidden" ref={tableIdRef} />
            <label htmlFor="title" className="mb-1 block text-gray-500 text-sm">{t('table_settings.title')}</label>
            <input ref={tableTitleUpdateRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('table_settings.enter_table_title')} />
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label htmlFor="floor" className="mb-1 block text-gray-500 text-sm">{t('table_settings.floor')}</label>
              <input ref={tableFloorUpdateRef} type="text" name="floor" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('table_settings.enter_floor_title')} />
            </div>
            <div className="flex-1">
              <label htmlFor="capacity" className="mb-1 block text-gray-500 text-sm">{t('table_settings.seating_capacity')}</label>
              <input ref={tableSeatingCapacityUpdateRef} type="number" name="capacity" min={0} className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black bg-restro-gray focus:outline-restro-border-green' placeholder={t('table_settings.enter_seating_capacity')} />
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('table_settings.close')}</button>
              <button onClick={()=>{btnUpdate();}} className = 'btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('table_settings.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
    </Page>
  );
}