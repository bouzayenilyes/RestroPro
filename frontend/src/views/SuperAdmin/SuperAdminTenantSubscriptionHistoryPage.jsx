import React from 'react'
import Page from '../../components/Page'
import { Link, useParams } from 'react-router-dom'
import { useSuperAdminTenantSubscriptionHistory } from '../../controllers/superadmin.controller'
import { IconCheck, IconCreditCard, IconX } from '@tabler/icons-react';
import { iconStroke, subscriptionPrice } from '../../config/config';
import { useTranslation } from "react-i18next";
import { useTheme } from '../../contexts/ThemeContext';

export default function SuperAdminTenantSubscriptionHistoryPage() {
  const { t } = useTranslation();
  const params = useParams();
  const tenantId = params.id;
  const { APIURL, data, error, isLoading } = useSuperAdminTenantSubscriptionHistory(tenantId);
  const { theme } = useTheme();

  if(isLoading) {
    return <Page>{t("superadmin_reports.loading_message")}</Page>
  }

  if(error) {
    console.error(error);
    return <Page>{t("superadmin_reports.error_message")}</Page>
  }

  const {
    tenantInfo,
    storeDetails,
    totalUsers,
    subscriptionHistory,
  } = data;

  return (
    <Page>

      {/* breadcrumbs */}
      <div className="breadcrumbs text-sm">
        <ul>
          <li><Link to="/superadmin/dashboard/tenants">{t('superadmin_tenant_subscription_history.tenants')}</Link></li>
          <li>{tenantInfo.name}</li>
          <li>{t('superadmin_tenant_subscription_history.subscription_history')}</li>
        </ul>
      </div>
      {/* breadcrumbs */}

      <div className="flex flex-col lg:flex-row gap-4 mt-6">
        <div className='w-full lg:w-4/12 border rounded-3xl px-5 py-6 border-restro-border-green '>
          <p className='text-xl font-bold'>{t("superadmin_tenant_subscription_history.tenant_details")}</p>

          <p className='mt-4 text-sm text-restro-text'>{t("superadmin_tenant_subscription_history.tenant_name")}</p>
          <p>{tenantInfo.name}</p>

          <p className='mt-4 text-sm text-restro-text'>{t("superadmin_tenant_subscription_history.status")}</p>
          {tenantInfo.is_active == 1 && <div className='w-fit flex items-center justify-center text-sm rounded-full  text-restro-green-dark'><IconCheck className='text-restro-green' stroke={iconStroke} /> {t("superadmin_tenant_subscription_history.active")}</div>}
          {tenantInfo.is_active == 0 && <div className='w-fit flex items-center justify-center text-sm rounded-full  text-restro-green-dark'><IconX className='text-red-500' stroke={iconStroke} /> {t("superadmin_tenant_subscription_history.inactive")}</div>}

          <p className='mt-4 text-sm text-gray-500'>{t("superadmin_tenant_subscription_history.users")}</p>
          <p>{totalUsers} {t("superadmin_tenant_subscription_history.users")}</p>

          <p className='mt-4 text-sm text-gray-500'>{t("superadmin_tenant_subscription_history.address")}</p>
          <p>{storeDetails?.address}</p>

          <div className="flex">
            <div className="flex-1">
              <p className='mt-4 text-sm text-gray-500'>{t("superadmin_tenant_subscription_history.email")}</p>
              <p>{storeDetails?.email}</p>
            </div>

            <div className="flex-1">
              <p className='mt-4 text-sm text-gray-500'>{t("superadmin_tenant_subscription_history.phone")}</p>
              <p>{storeDetails?.phone}</p>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1">
              <p className='mt-4 text-sm text-gray-500'>{t("superadmin_tenant_subscription_history.currency")}</p>
              <p>{storeDetails?.currency}</p>
            </div>

            <div className="flex-1">
              <p className='mt-4 text-sm text-gray-500'>{t("superadmin_tenant_subscription_history.qr_menu")}</p>
              <p>{storeDetails?.is_qr_menu_enabled ? t("superadmin_tenant_subscription_history.enabled") : t("superadmin_tenant_subscription_history.disabled")}</p>
            </div>
          </div>
        </div>

        <div className='w-full lg:w-8/12 border rounded-3xl px-5 py-6 border-restro-green'>
          <p className='text-xl font-bold'>{t("superadmin_tenant_subscription_history.payment_history")}</p>

          <div className="flex flex-col gap-4 mt-4">
            {subscriptionHistory.map((item, i)=>{

              const {
                id, tenant_id, created_at, starts_on, expires_on, status
              } = item;

              return (
                <div key={i} className="flex items-center gap-4 w-full">
                  <div className='w-16 h-16 rounded-xl flex items-center justify-center'>
                    <IconCreditCard stroke={iconStroke} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between w-full gap-1">
                      <p className="text-lg">
                        <span className="font-bold">{t("superadmin_tenant_subscription_history.subscription_price", { price: subscriptionPrice })}</span>
                      </p>
                      <div
                        className={`text-xs font-semibold py-1 px-3 rounded-full w-20 sm:w-18 text-center ${
                          status === "cancelled"
                            ? "bg-red-100 text-red-500 border border-red-500"
                            : status === "created"
                            ? "bg-green-100 text-green-500 border border-green-500"
                            : "bg-blue-100 text-blue-500 border border-blue-500"
                        }`}
                      >
                        {status === "cancelled" ? t("superadmin_tenant_subscription_history.cancelled") : status === "created" ? t("superadmin_tenant_subscription_history.created") : t("superadmin_tenant_subscription_history.renewed")}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                      <p className="text-xs text-gray-500">
                        {status === "cancelled" ? t("superadmin_tenant_subscription_history.cancelled_on") : t("superadmin_tenant_subscription_history.paid_on")}
                        <br />
                        {new Date(created_at).toLocaleString("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("superadmin_tenant_subscription_history.billing_period")} <br />
                        {new Date(starts_on).toLocaleDateString()}-
                        {new Date(expires_on).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );

            })}
          </div>
        </div>
      </div>
    </Page>
  )
}
