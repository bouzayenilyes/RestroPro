import React from 'react'
import Page from "../../components/Page";
import { removeDevice, useDevices } from '../../controllers/settings.controller';
import { IconDevices, IconTrash } from "@tabler/icons-react";
import { iconStroke } from "../../config/config";
import { mutate } from 'swr';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { useTheme } from '../../contexts/ThemeContext';

export default function DevicesPage() {
  const { t } = useTranslation();
  const {APIURL, data:devices, error, isLoading} = useDevices();
  const { theme } = useTheme();
  if(isLoading) {
    return <Page>
      {t("devices.please_wait")}
    </Page>
  }

  if(error) {
    console.error(error);
    return <Page>
      {t("devices.error_loading_devices")}
    </Page>
  }

  const btnRemoveDevice = async (deviceId) => {
    const isConfirm = window.confirm(t("devices.remove_device_confirm"));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t("devices.please_wait"));
      const res = await removeDevice(deviceId);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("devices.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  return (
    <Page>
      <h3>{t("devices.title")}</h3>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full mt-6">
        {devices.map((device, index)=>{

          const { 
            device_id,
            device_ip,
            device_name,
            device_location,
            created_at,
            isMyDevice,
           } = device;

          return <div key={index} className={`border border-restro-green-light text-restro-text flex-1 rounded-2xl p-4 flex bg-white items-center gap-2 relative dark:bg-restro-card-bg ${isMyDevice ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className='w-12 h-12 flex items-center justify-center text-restro-text bg-restro-bg-gray rounded-full border border-restro-green-light '>
              <IconDevices stroke={iconStroke} />
            </div>

            <div className='flex-1'>
              <p className='text-sm'>{device_name} <span className="text-xs text-gray-500">- {device_ip}</span></p>
              <p className='text-xs text-gray-500'>{t("devices.created_at")}: {created_at}</p>
              {isMyDevice && <div className='mt-2 rounded-full text-green-700 bg-green-100 font-bold px-2 py-1 text-xs w-fit'>{t("devices.this_device")}</div>}
            </div>

            {isMyDevice?<></>:<button onClick={()=>{btnRemoveDevice(device_id)}} className='rounded-full w-8 h-8 flex items-center justify-center bg-restro-gray text-restro-red transition hover:bg-restro-red-hover active:scale-95'><IconTrash size={18} stroke={iconStroke} /></button>}
          </div>
        })}
      </div>

    </Page>
  )
}
