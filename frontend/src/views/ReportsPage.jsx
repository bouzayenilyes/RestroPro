import React, { useRef, useState } from "react";
import Page from "../components/Page";
import { IconCarrot, IconDownload, IconFilter } from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { useReports } from "../controllers/reports.controller"
import { CURRENCIES } from "../config/currencies.config";
import ReportPaymentTypePieChart from "../components/ReportPaymentTypePieChart";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function ReportsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const filters = [
    { key: "today", value: t("reports.filters.today") },
    { key: "yesterday", value: t("reports.filters.yesterday") },
    { key: "last_7days", value: t("reports.filters.last_7days") },
    { key: "this_month", value: t("reports.filters.this_month") },
    { key: "last_month", value: t("reports.filters.last_month") },
    { key: "custom", value: t("reports.filters.custom") },
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

  const {APIURL, data, error, isLoading} = useReports({
    type: state.filter,
    from: state.fromDate,
    to: state.toDate,
  });

  if(isLoading) {
    return <Page>
      {t("reports.loading_message")}
    </Page>
  }

  if(error) {
    console.error(error);
    return <Page>
      {t("reports.error_message")}
    </Page>;
  }

  const {
    ordersCount, newCustomers, repeatedCustomers, currency:currencyCode, averageOrderValue, totalCustomers, netRevenue, taxTotal, serviceChargeTotal, topSellingItems, revenueTotal, totalPaymentsByPaymentTypes
  } = data;

  const currency = CURRENCIES.find((c)=>c.cc==currencyCode)?.symbol;

  const btnExportCSV = async () => {
    try {
      const { Parser } = await import("@json2csv/plainjs");
      const { saveAs } = await import("file-saver");

      const summaryData = [{
        "Orders": ordersCount ?? 0,
        "New Customers": newCustomers ?? 0,
        "Repeated Customers": repeatedCustomers ?? 0,
        "Avg. Order Value": Number(averageOrderValue ?? 0).toFixed(2),
        "Total Customers": totalCustomers ?? 0,
        "Net Revenue": Number(netRevenue ?? 0).toFixed(2),
        "Tax Total": Number(taxTotal ?? 0).toFixed(2),
        "Service Charge Total": Number(serviceChargeTotal ?? 0).toFixed(2),
        "Revenue Total": Number(revenueTotal ?? 0).toFixed(2),
      }];

      const topSellingItemsData = (topSellingItems || []).map(item => ({
        "Item Title": item.title || '',
        "Item Price": Number(item.price ?? 0).toFixed(2),
        "Item Net Price": Number(item.net_price ?? 0).toFixed(2),
        "Orders Count": item.orders_count ?? 0,
      }));

      // Total Payments by Payment Type
      const totalPaymentsData = (totalPaymentsByPaymentTypes || []).map(payment => ({
        "Payment Type": payment.title || '',
        "Total": Number(payment.total ?? 0).toFixed(2),
      }));

      // Create CSV data
      const parser1 = new Parser();
      const parser2 = new Parser();
      const parser3 = new Parser();

      // Generate CSV for each section
      const summaryCsv = parser1.parse(summaryData);
      const topSellingItemsCsv = topSellingItemsData.length > 0 ? parser2.parse(topSellingItemsData) : '';
      const totalPaymentsCsv = totalPaymentsData.length > 0 ? parser3.parse(totalPaymentsData) : '';

      // Combine all CSV sections
      const csv = `
        Reports,
        ${summaryCsv}
        ,
        ,
        ,
        ,
        ,
        Top Selling Items,
        ${topSellingItemsCsv}
        ,
        ,
        ,
        ,
        ,
        Total Payments by Types,
        ${totalPaymentsCsv}`;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const formattedDate = `${new Date().toISOString().substring(0, 10)}`;
      const fileName = `Reports Data - ${formattedDate}.csv`;

      saveAs(blob, fileName);
      toast.success(t("reports.saved_successfully"));

    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.dismiss();
      toast.error(t("reports.error_saving_file"));
    }
  };

  return (
    <Page>
      <div className="flex items-center justify-between">
        <h3 className="text-2xl">{t("reports.title")}</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={() => document.getElementById("filter-dialog").showModal()}
            className="btn btn-sm rounded-full text-restro-text bg-restro-bg-gray border-none hover:bg-restro-button-hover"
          >
            <IconFilter stroke={iconStroke} /> {t("reports.filters_button")}
          </button>
          <button
            onClick={btnExportCSV}
            className="btn btn-sm rounded-full text-restro-text bg-restro-bg-gray hover:bg-restro-button-hover"
          >
            <IconDownload stroke={iconStroke} /> {t("reports.download_button")}
          </button>
        </div>
      </div>

      <h3 className="mt-6 mb-4 text-base">{t("reports.showing_data_for", { filter: filters.find(f=>f.key==state.filter).value })}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
         {/* popular items */}
         <div className='row-span-3 rounded-3xl h-96 overflow-y-auto border border-restro-border-green'>
          <div className='py-5 px-6 backdrop-blur rounded-t-3xl sticky top-0'>
            <h3 className='font-bold'>{t("reports.top_selling_items")}</h3>
          </div>

          {topSellingItems?.length == 0 && <div className='w-full flex items-center justify-center flex-col px-8 2xl:px-10'>
            <img
              src="/assets/illustrations/top-selling-not-found.webp"
              alt="no-top-selling items"
              className='w-7/12 mx-auto'
            />
            <p className='mt-4 text-center text-gray-500 font-semibold'>{t("reports.no_bestsellers")}</p>
            <p className='text-center text-gray-500'>{t("reports.no_bestsellers_message")}</p>
          </div>}

          {
            topSellingItems?.length > 0 && <div className='px-6 flex flex-col'>
            {/* item */}
            {topSellingItems.map((item,i)=>{
              return <div className='mb-4 flex items-center gap-2 w-full' key={i}>
                <div className='w-12 h-12 flex items-center justify-center text-gray-500 dark:text-white rounded-lg bg-restro-bg-gray border border-restro-border-green'>
                  <IconCarrot stroke={iconStroke} />
                </div>

                <div className='flex-1'>
                  <p>{item?.title}</p>
                  <p className="text-xs text-gray-500">{currency||""}{item?.price}</p>
                </div>

                <p className='font-bold'>{item?.orders_count}</p>
              </div>;
            })}
            {/* item */}
          </div>
          }
        </div>
        {/* popular items */}

        {/* items sold */}
        <div className='rounded-3xl h-28 py-5 px-6 border border-restro-border-green'>
          <h3 className="font-bold">{t("reports.orders")}</h3>
          <p className="mt-2 text-4xl">{ordersCount || 0}</p>
        </div>
        {/* items sold */}

        {/* avg. order value */}
        <div className='h-28 py-5 px-6 rounded-3xl border border-restro-border-green'>
          <h3 className="font-bold">{t("reports.avg_order_value")}</h3>
          <p className="mt-2 text-4xl">{currency}{Number(averageOrderValue).toFixed(2) || 0}</p>
        </div>
        {/* avg. order value */}

        {/* total customers */}
        <div className='h-28 py-5 px-6 rounded-3xl border border-restro-border-green'>
          <h3 className="font-bold">{t("reports.total_customers")}</h3>
          <p className="mt-2 text-4xl">{totalCustomers}</p>
        </div>
        {/* total customers */}

        {/* New customers */}
        <div className='h-28 py-5 px-6 rounded-3xl border border-restro-border-green'>
            <h3 className="font-bold">{t("reports.new_customers")}</h3>
          <p className="mt-2 text-4xl">{newCustomers}</p>
        </div>
        {/* New customers */}

        {/* repeat customers */}
         <div className='h-28 py-5 px-6 rounded-3xl border border-restro-border-green'>
          <h3 className="font-bold">{t("reports.repeat_customers")}</h3>
          <p className="mt-2 text-4xl">{repeatedCustomers}</p>
        </div>
        {/* repeat customers */}

        {/* revenue */}
        <div className='h-28 py-5 px-6 rounded-3xl border border-restro-border-green'>          
          <h3 className="font-bold">{t("reports.revenue")}</h3>
          <p className="mt-2 text-4xl">{currency}{revenueTotal}</p>
        </div>
        {/* revenue */}

        {/* payment total by payment types */}
        <div className='row-span-3 py-5 px-6 rounded-3xl border border-restro-border-green'>
          <h3 className="font-bold">{t("reports.payments_by_methods")}</h3>
          <ReportPaymentTypePieChart paymentTypes={totalPaymentsByPaymentTypes} />
        </div>
        {/* payment total by payment types */}

        {/* net sales */}
        <div className='h-28 py-5 px-6 rounded-3xl border border-restro-border-green'>
          <h3 className="font-bold">{t("reports.net_sales")}</h3>
          <p className="mt-2 text-4xl">{currency}{netRevenue}</p>
        </div>
        {/* net sales */}

        {/* tax */}
        <div className='h-28 py-5 px-6 rounded-3xl border border-restro-border-green'>
          <h3 className="font-bold">{t("reports.tax")}</h3>
          <p className="mt-2 text-4xl">{currency}{taxTotal}</p>
        </div>
        {/* tax */}

        {/* Service Charge */}
        <div className='h-28 py-5 px-6 rounded-3xl border border-restro-border-green'>
          <h3 className="font-bold">{t("reports.service_charge_total")}</h3>
          <p className="mt-2 text-4xl">{currency}{serviceChargeTotal}</p>
        </div>
        {/* Service Charge */}
        
      </div>

      {/* filter dialog */}
      <dialog id="filter-dialog" className="modal">
        <div className = 'modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className = "font-bold text-lg flex items-center">
            <IconFilter stroke={iconStroke} /> {t("reports.filter")}
          </h3>
          {/* filters */}
          <div className="my-4">
            <div>
              <label className={`mb-1 block text-gray-500 text-sm font-medium w-full`}>
              {t("reports.filter_label")}</label>
              <select
                className='select select-sm w-full rounded-lg border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
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
                  className=" block text-gray-500 text-sm"
                >
                  {t("reports.from")}
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
                  {t("reports.to")}
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
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("reports.close")}</button>
              <button
                onClick={() => {
                  setState({
                    ...state,
                    filter: filterTypeRef.current.value,
                    fromDate: fromDateRef.current.value || null,
                    toDate: toDateRef.current.value || null,
                  });
                }}
                className = 'btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t("reports.apply")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* filter dialog */}
    </Page>
  );
}
