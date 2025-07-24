import React from 'react'
import Page from "../components/Page";
import { IconArmchair2, IconCarrot, IconChevronRight, IconFriends } from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { Link } from "react-router-dom";
import { useDashboard } from '../controllers/dashboard.controller';
import { CURRENCIES } from "../config/currencies.config";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, error, isLoading } = useDashboard();
  const { theme } = useTheme();

  if(isLoading) {
    return <Page>
      {t('dashboard.loading_message')}
    </Page>
  }

  if(error) {
    console.error(error);
    return <Page>
      {t('dashboard.error')}
    </Page>;
  }

  const {
    reservations, topSellingItems, ordersCount, newCustomerCount, repeatedCustomerCount, currency:currencyCode
  } = data;

  const currency = CURRENCIES.find((c)=>c.cc==currencyCode);

  return (
    <Page>
      <h3 className="text-2xl">{t('dashboard.title')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">

        {/* reservation */}
        <div className="border rounded-3xl h-96 overflow-y-auto border-restro-border-green">
          <div className= "py-5 px-6 border-b-0 backdrop-blur rounded-t-3xl sticky top-0">
            <Link to="/dashboard/reservation" className='font-bold'>{t('dashboard.reservations')}</Link>
          </div>

          {reservations?.length == 0 && <div className='w-full px-8 2xl:px-10 pt-2'>
            <img
              src="/assets/illustrations/reservation-not-found.webp"
              alt="no-reservation"
              className='w-7/12 mx-auto'
            />
            <p className='mt-2 text-center text-gray-500 font-semibold'>Oh snap! 🍽️</p>
            <p className='text-center text-gray-500'>{t('dashboard.no_reservations')}</p>
          </div>}

          {
            reservations?.length > 0 && <div className='px-6 flex flex-col divide-y dark:divide-restro-border-green'>

            {/* item */}
            {reservations.map((reservation,i)=>{

              const {
                id,
                customer_id,
                customer_name,
                date,
                table_id,
                table_title,
                status,
                notes,
                people_count,
                unique_code,
                created_at,
                updated_at,
              } = reservation;

              const formmatedDate = new Intl.DateTimeFormat("en", {dateStyle: "medium", timeStyle: "short"}).format(new Date(date))

              return <div className='py-1' key={i}>
                <p className="text-xs text-gray-500">{formmatedDate}</p>
                <p className='text-base mt-1'>{customer_name} <span className="text-xs text-gray-500">- ({customer_id})</span></p>
                <div className='flex items-center gap-2 mt-1'>
                  <p className="flex items-center gap-2 text-xs">
                    <IconFriends stroke={iconStroke} size={14} /> {people_count} People
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <IconArmchair2 stroke={iconStroke} size={14} /> {table_title}
                  </p>
                </div>
              </div>;
            })}
            {/* item */}

          </div>
          }

          <div className="h-6"></div>
        </div>
        {/* reservation */}

        {/* popular items */}
        <div className="border rounded-3xl h-96 overflow-y-auto border-restro-border-green">
          <div className="py-5 px-6 border-b-0 backdrop-blur rounded-t-3xl sticky top-0">
            <h3 className='font-bold'>{t('dashboard.top_selling_items')}</h3>
          </div>

          {topSellingItems?.length == 0 && <div className='w-full px-8 2xl:px-10'>
            <img
              src="/assets/illustrations/top-selling-not-found.webp"
              alt="no-top-selling items"
              className='w-7/12 mx-auto'
            />
            <p className='mt-2 text-center text-gray-500 font-semibold'>Uh-oh! 🚨</p>
            <p className='text-center text-gray-500'>{t('dashboard.no_top_selling_items')}</p>
          </div>}

          {
            topSellingItems?.length > 0 && <div className='px-6 pt-1 flex flex-col'>
            {/* item */}
            {topSellingItems.map((item,i)=>{
              return <div className='mb-4 flex items-center gap-2 w-full' key={i}>
                <div className='flex items-center justify-center w-12 h-12 rounded-lg bg-restro-bg-gray text-restro-text'>
                  <IconCarrot stroke={iconStroke} />
                </div>

                <div className='flex-1'>
                  <p>{item?.title}</p>
                  <p className="text-xs text-gray-500">{currency?.symbol}{item?.price}</p>
                </div>

                <p className='font-bold'>{item?.orders_count}</p>
              </div>;
            })}
            {/* item */}
          </div>
          }
        </div>
        {/* popular items */}


        <div className="flex flex-col gap-6">
          {/* items sold */}
        <div className="border rounded-3xl h-28 py-5 px-6 border-restro-border-green backdrop-blur">
          <h3 className="font-bold">{t('dashboard.orders')}</h3>
          <p className="mt-2 text-4xl">{ordersCount||0}</p>
        </div>
        {/* items sold */}

        {/* new customers */}
        <div className="border rounded-3xl h-28 py-5 px-6 border-restro-border-green backdrop-blur">
          <h3 className="font-bold">{t('dashboard.new_customers')}</h3>
          <p className="mt-2 text-4xl">{newCustomerCount||0}</p>
        </div>
        {/* new customers */}

        {/* repeated customers */}
        <div className="border rounded-3xl h-28 py-5 px-6 border-restro-border-green backdrop-blur">
          <h3 className="font-bold">{t('dashboard.repeat_customers')}</h3>
          <p className="mt-2 text-4xl">{repeatedCustomerCount||0}</p>
        </div>
        {/* repeated customers */}
        </div>

        {/* banner: view more in reports */}
        <Link to="/dashboard/reports" className = "block rounded-3xl py-5 px-6 transition active:scale-95 border bg-[url(/assets/circle_illustration.svg)] bg-no-repeat bg-right-bottom border-restro-border-green hover:bg-restro-button-hover">
          <p>{t('dashboard.view_more_reports')} <IconChevronRight stroke={iconStroke}/></p>
        </Link>
        {/* banner: view more in reports */}
      </div>
    </Page>
  )
}
