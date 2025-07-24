import React, { useRef, useState } from 'react'
import Page from "../../components/Page";
import { useSuperAdminReports } from '../../controllers/superadmin.controller';
import { IconBuildingStore, IconCarrot, IconFilter, IconInfoCircleFilled, IconListDetails } from '@tabler/icons-react';
import { iconStroke, subscriptionAmount } from '../../config/config';
import ImgGirlSmiling from "../../assets/girl-smiling.webp"
import { useTranslation } from "react-i18next";
import { useTheme } from '../../contexts/ThemeContext';

export default function SuperAdminReportsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const filters = [
    { key: "today", value: t("superadmin_reports.filters.today") },
    { key: "yesterday", value: t("superadmin_reports.filters.yesterday") },
    { key: "last_7days", value: t("superadmin_reports.filters.last_7days") },
    { key: "this_month", value: t("superadmin_reports.filters.this_month") },
    { key: "last_month", value: t("superadmin_reports.filters.last_month") },
    { key: "custom", value: t("superadmin_reports.filters.custom") },
  ];

  const fromDateRef = useRef();
  const toDateRef = useRef();
  const filterTypeRef = useRef();

  const now = new Date();
  const defaultDateFrom = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const defaultDateTo = `${now.getFullYear()}-${(now.getMonth() + 2)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  const [state, setState] = useState({
    filter: filters[0].key,
    fromDate: null,
    toDate: null,
  });

  const {APIURL, data, error, isLoading} = useSuperAdminReports({
    type: state.filter,
    from: state.fromDate,
    to: state.toDate,
  });

  if(isLoading) {
    return <Page>
      {t("superadmin_reports.loading_message")}
    </Page>
  }

  if(error) {
    console.error(error);
    return <Page>
      {t("superadmin_reports.error_message")}
    </Page>;
  }

  const {
    activeTenants, mrr, arr,
    totalCustomers, topSellingItems,
    salesVolume, ordersProcessed
  } = data;

  const mrrValue = mrr * subscriptionAmount
  const arrValue = arr * subscriptionAmount*12

  return (
    <Page className='px-4 py-3 overflow-x-hidden h-full'>
      <div className="flex items-center justify-between">
        <h3 className="text-2xl">{t("superadmin_reports.title")}</h3>

        <button
          onClick={() => document.getElementById("filter-dialog").showModal()}
          className='btn btn-sm rounded-full border border-restro-green-light bg-restro-gray hover:bg-restro-button-hover flex items-center gap-2'
        >
          <IconFilter stroke={iconStroke} /> {t("superadmin_reports.filter")}
        </button>
      </div>

      <h3 className="mt-6 mb-4 text-base">{t("superadmin_reports.showing_data_for", { filter: filters.find(f=>f.key==state.filter).value })}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">

        <div className='md:row-span-3 h-[28rem] bg-restro-superadmin-widget-bg rounded-[42px] overflow-hidden'>
          <p className='text-restro-superadmin-text-green font-bold text-center mt-4'>{t("superadmin_reports.active_tenants")}</p>
          <p className='text-white font-black text-7xl text-center'>{Number(activeTenants).toLocaleString("en", {
            notation: "compact"
          })}</p>
          <img src={ImgGirlSmiling} alt="img" className='block h-96 mx-auto' />
        </div>

        <div className = 'md:row-span-3 h-[28rem] rounded-[42px] overflow-y-auto scrollbar-none border border-restro-border-green text-black dark:text-white'>
          <div className = 'py-6 px-8 rounded-t-[42px] sticky top-0 border-t border-restro-green-light'>
            <h3 className='font-bold'>{t("superadmin_reports.top_selling_items")}</h3>
          </div>
          {topSellingItems?.length == 0 && 
            <div className='w-full mt-20 flex items-center justify-center flex-col px-8 2xl:px-10'>
              <IconListDetails stroke={iconStroke} />
              <p className='text-center text-gray-500'>{t("superadmin_reports.no_bestsellers")}</p>
            </div>
          }

          <div className='px-8 flex flex-col'>
            {
              topSellingItems.map((item, i)=>{
                const {tenant_name, tenant_id, item_id, title, qty} = item
                return <div key={i} className={`rounded-3xl flex items-center gap-2 p-4 mb-4`}>
                  <div className = 'w-12 h-12 rounded-xl flex items-center justify-center text-restro-text bg-restro-gray'>
                    <IconCarrot stroke={iconStroke} />
                  </div>
                  <div className="flex-1">
                    <p>{title}</p>
                    <p className="text-xs">{tenant_name}</p>
                  </div>
                  <p className='font-bold mr-2'>
                    {Number(qty).toLocaleString("en",{notation: "compact"})}
                  </p>
                </div>
              })
            }
          </div>
        </div>

        <div className='rounded-[42px] border px-8 py-5 flex flex-col justify-center dark:text-white border-restro-border-green text-restro-superadmin-text-black'>
          <p className='font-bold'>{t("superadmin_reports.mrr")}</p>
          <p className='font-black text-5xl  mt-2'>${Number(mrrValue).toLocaleString('en',{notation: "compact"})}</p>
        </div>

        <div className='rounded-[42px] border px-8 py-5 flex flex-col justify-center dark:text-white border-restro-border-green text-restro-superadmin-text-black'>
          <p className='font-bold'>{t("superadmin_reports.arr")}</p>
          <p className='font-black text-5xl text-restro-green mt-2'>${Number(arrValue).toLocaleString('en',{notation: "compact"})}</p>
        </div>

        <div className='rounded-[42px] border px-8 py-5 flex flex-col justify-center dark:text-white border-restro-border-green text-restro-superadmin-text-black'>
          <div className="flex items-center gap-1">
            <p className='font-bold'>{t("superadmin_reports.store_sales_volume")}</p>
            <div className='tooltip cursor-pointer tooltip-top' data-tip={t("superadmin_reports.store_sales_info")}><IconInfoCircleFilled size={18} stroke={iconStroke}/></div>
          </div>
          <p className='font-black text-5xl mt-2'>
            ${Number(salesVolume).toLocaleString("en", {notation: "compact"})}
          </p>
        </div>

        <div className='rounded-[42px] border px-8 py-5 flex flex-col justify-center dark:text-white border-restro-border-green text-restro-superadmin-text-black'>
          <p className='font-bold'>{t("superadmin_reports.orders_processed")}</p>
          <p className='font-black text-5xl mt-2'>{Number(ordersProcessed).toLocaleString("en",{notation: "compact"})}</p>
        </div>

        <div className='rounded-[42px] px-8 py-5 flex flex-col justify-center border border-restro-border-green text-restro-superadmin-text-black dark:text-white '>
          <p className='font-bold'>{t("superadmin_reports.all_tenants_customers")}</p>
          <p className='font-black text-5xl mt-2'>{Number(totalCustomers).toLocaleString("en",{notation: "compact"})}</p>
        </div>
      </div>

      {/* filter dialog */}
      <dialog id="filter-dialog" className="modal">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg flex items-center">
            <IconFilter stroke={iconStroke} /> {t("superadmin_reports.filter")}
          </h3>
          {/* filters */}
          <div className="my-4">
            <div>
              <label className=" block text-gray-500 text-sm">{t("superadmin_reports.filter")}</label>
              <select
                className="select select-sm w-full border border-restro-border-green rounded-lg focus:outline-none focus:ring-2 focus:ring-restro-gray dark:bg-black dark:text-white"
                ref={filterTypeRef}
              >
                {filters.map((filter, index) => (
                  <option key={index} value={filter.key}>
                    {filter.value}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-4">
              <div className="flex-1">
                <label
                  htmlFor="fromDate"
                  className="block text-gray-500 text-sm"
                >
                  {t("superadmin_reports.from")}
                </label>
                <input
                  defaultValue={defaultDateFrom}
                  type="date"
                  ref={fromDateRef}
                  className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="toDate"
                  className=" block text-gray-500 text-sm"
                >
                  {t("superadmin_reports.to")}
                </label>
                <input
                  defaultValue={defaultDateTo}
                  type="date"
                  ref={toDateRef}
                  className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                />
              </div>
            </div>
          </div>
          {/* filters */}
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='transition active:scale-95 hover:shadow-lg px-4 py-3 rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("superadmin_reports.close")}</button>
              <button
                onClick={() => {
                  setState({
                    ...state,
                    filter: filterTypeRef.current.value,
                    fromDate: fromDateRef.current.value || null,
                    toDate: toDateRef.current.value || null,
                  });
                }}
                className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t("superadmin_reports.apply")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* filter dialog */}
    </Page>
  )
}
