import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, Transition } from "@headlessui/react";
import Page from "../components/Page";
import {
  IconEye,
  IconFilter,
  IconPlus,
  IconPrinter,
  IconReceipt,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { getInvoiceOrders, getInvoicesInit, searchInvoices, useInvoices } from "../controllers/invoices.controller";
import { getOrdersInit } from "../controllers/orders.controller";
import { CURRENCIES } from "../config/currencies.config";
import { setDetailsForReceiptPrint } from '../helpers/ReceiptHelper';
import { useTheme } from "../contexts/ThemeContext";

export default function InvoicesPage() {
  const { t } = useTranslation();
  const filters = [
    { key: "today", value: t("invoices.today") },
    { key: "tomorrow", value: t("invoices.tomorrow") },
    { key: "yesterday", value: t("invoices.yesterday") },
    { key: "last_7days", value: t("invoices.last_7days") },
    { key: "this_month", value: t("invoices.this_month") },
    { key: "last_month", value: t("invoices.last_month") },
    { key: "custom", value: t("invoices.custom") },
  ];

  const searchRef = useRef();
  const fromDateRef = useRef();
  const toDateRef = useRef();
  const filterTypeRef = useRef();
  const { theme } = useTheme();

  const now = new Date();
  const defaultDateFrom = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const defaultDateTo = `${now.getFullYear()}-${(now.getMonth() + 2)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  const customerSearchRef = useRef();

  const [state, setState] = useState({
    search: "",
    searchResults: [],
    spage: 1,
    filter: filters[0].key,
    fromDate: null,
    toDate: null,
    customer: null,

    printSettings: null,
    storeSettings: null,
    currency: null,

    paymentTypes: [],
  });

  useEffect(()=>{
    async function init(){
      try {
        const res = await getInvoicesInit();
        if(res.status == 200) {
          const ordersInit = res.data;
          const currency = CURRENCIES.find((c)=>c.cc==ordersInit?.storeSettings?.currency);

          setState({
            ...state,
            printSettings: ordersInit.printSettings || {},
            storeSettings: ordersInit.storeSettings || {},
            paymentTypes: ordersInit?.paymentTypes || [],
            currency: currency?.symbol,
          });
        }
      } catch (error) {
        console.error(error);
        toast.dismiss();
        toast.error(t('invoices.error_loading_orders'));
      }
    }
    init();
  },[]);

  const {data: invoices, error, isLoading} = useInvoices({
    type: state.filter,
    from: state.fromDate,
    to: state.toDate,
  });

  if (isLoading) {
    return <Page>{t('invoices.loading_message')}</Page>;
  }

  if (error) {
    return <Page>{t('invoices.error_loading_details')}</Page>;
  }

  const btnSearch = async () => {
    const searchQuery = searchRef.current.value;
    if (!new String(searchQuery).trim()) {
      return;
    }

    try {
      toast.loading(t('invoices.please_wait'));
      const res = await searchInvoices(new String(searchQuery).trim());
      if(res.status == 200) {
        toast.dismiss();
        setState({
          ...state,
          search: searchQuery,
          searchResults: res.data,
          spage: 1,
        });
      } else {
        toast.dismiss();
        toast.error(t('invoices.no_result_found'));
      }

    } catch (error) {
      console.error(error);
      const message = error.response.data.message || t('invoices.something_went_wrong');

      toast.dismiss();
      toast.error(message);
    }
  }
  const btnClearSearch = () => {
    searchRef.current.value = null;

    setState({
      ...state,
      search: "",
      searchResults: [],
      spage: 1,
    });
  };

  const btnViewReceipt = async (invoiceId, orderIdsArr, tokens, payment_type_id) => {
    try {
      toast.loading(t('invoices.please_wait'));
      const res = await getInvoiceOrders(invoiceId, orderIdsArr);
      toast.dismiss();

      if(res.status == 200) {
        const {
          subtotal,
          taxTotal,
          serviceChargeTotal,
          total,
          orders: ordersArr
        } = res.data;

        const orders = [];
        const orderIds = orderIdsArr.join(", ");

        for (const o of ordersArr) {
          const items = o.items;
          items.forEach((i)=>{
            const variant = i.variant_id ? {
                id: i.variant_id,
                title: i.variant_title,
                price: i.variant_price
            } : null;
            orders.push({
              ...i,
              title: i.item_title,
              addons_ids: i?.addons?.length > 0 ? i?.addons?.map((a)=>a.id):[],
              variant: variant
            });
          })
        }

        const {customer_id, customer_type, customer_name, date, delivery_type} = ordersArr;

        let paymentMethodText;
        if(payment_type_id) {
          const paymentType = state.paymentTypes.find((v)=>v.id == payment_type_id);
          if(paymentType) {
            paymentMethodText = paymentType.title;
          }
        }

        setDetailsForReceiptPrint({
          cartItems: orders, deliveryType:delivery_type, customerType:customer_type, customer:{id: customer_id, name: customer_name}, tableId: null, currency:state.currency, storeSettings: state.storeSettings, printSettings:state.printSettings,
          itemsTotal: subtotal,
          taxTotal: taxTotal,
          serviceChargeTotal:serviceChargeTotal,
          payableTotal: total,
          tokenNo: tokens,
          orderId: orderIds,
          paymentMethod: paymentMethodText
        });

        const receiptWindow = window.open("/print-receipt", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('invoices.error_processing_request');
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };

  const btnPrintReceipt = async (invoiceId, orderIdsArr, tokens, payment_type_id) => {
    try {
      toast.loading(t('invoices.please_wait'));
      const res = await getInvoiceOrders(invoiceId, orderIdsArr);
      toast.dismiss();

      if(res.status == 200) {
        const {
          subtotal,
          taxTotal,
          serviceChargeTotal,
          total,
          orders: ordersArr
        } = res.data;

        const orders = [];
        const orderIds = orderIdsArr.join(", ");

        for (const o of ordersArr) {
          const items = o.items;
          items.forEach((i)=>{
            const variant = i.variant_id ? {
                id: i.variant_id,
                title: i.variant_title,
                price: i.variant_price
            } : null;
            orders.push({
              ...i,
              title: i.item_title,
              addons_ids: i?.addons?.length > 0 ? i?.addons?.map((a)=>a.id):[],
              variant: variant
            });
          })
        }

        const {customer_id, customer_type, customer_name, date, delivery_type} = ordersArr;

        let paymentMethodText;
        if(payment_type_id) {
          const paymentType = state.paymentTypes.find((v)=>v.id == payment_type_id);
          if(paymentType) {
            paymentMethodText = paymentType.title;
          }
        }

        setDetailsForReceiptPrint({
          cartItems: orders, deliveryType:delivery_type, customerType:customer_type, customer:{id: customer_id, name: customer_name}, tableId: null, currency:state.currency, storeSettings: state.storeSettings, printSettings:state.printSettings,
          itemsTotal: subtotal,
          taxTotal: taxTotal,
          serviceChargeTotal:serviceChargeTotal,
          payableTotal: total,
          tokenNo: tokens,
          orderId: orderIds,
          paymentMethod: paymentMethodText
        });

        const receiptWindow = window.open("/print-receipt", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
        receiptWindow.onload = (e) => {
          setTimeout(()=>{
            receiptWindow.print();
          },400)
        }

      }
    } catch (error) {
      const message = error?.response?.data?.message || t('invoices.error_processing_request');
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };

  return (
    <Page>
      <div className="flex flex-wrap gap-4 flex-col md:flex-row md:items-center md:justify-between">
        <h3 className="text-2xl">{t('invoices.title')}</h3>

        <div className="flex flex-wrap gap-2">
          <div className='px-2 py-1 rounded-lg flex items-center bg-restro-gray border border-restro-border-green'>
            <input
              ref={searchRef}
              defaultValue={state.search}
              type="text"
              placeholder={t('invoices.search_placeholder')}
              className="bg-transparent placeholder:text-gray-400 outline-none block"
            />
            {state.search && (
              <button onClick={btnClearSearch} className="text-gray-400">
                <IconX stroke={iconStroke} size={18} />
              </button>
            )}
          </div>
          <button
            onClick={btnSearch}
            className='rounded-lg transition active:scale-95 hover:shadow-lg px-3 py-1 text-white ml-2 bg-restro-green hover:bg-restro-green-button-hover'>
            {t('invoices.search')}
          </button>
          <button
            onClick={() => document.getElementById("filter-dialog").showModal()}
            className='w-8 h-8 flex items-center justify-center text-gray-400 rounded-full active:scale-95 transition hover:bg-restro-button-hover'
          >
            <IconFilter />
          </button>
        </div>
      </div>

      {/* search result */}
      {state.searchResults.length > 0 && <div className="mt-6">
        <h3>{t('invoices.showing_search_result', { search: state.search })}</h3>
        <div className="overflow-x-auto w-full">
          <table className="table table-sm table-zebra border border-restro-bg-gray w-full">
            <thead>
              <tr>
                <th>{t('invoices.invoice_id')}</th>
                <th>{t('invoices.tokens')}</th>
                <th>{t('invoices.date')}</th>
                <th>{t('invoices.subtotal')}</th>
                <th>{t('invoices.tax')}</th>
                <th>{t('invoices.service_charge')}</th>
                <th>{t('invoices.total')}</th>
                <th>{t('invoices.delivery_type')}</th>
                <th>{t('invoices.customer')}</th>
                <th>{t('invoices.table')}</th>
                <th>{t('invoices.action')}</th>
              </tr>
            </thead>
            <tbody>
              {state.searchResults.map((invoice, index)=>{
                const {
                  invoice_id,
                  created_at,
                  sub_total,
                  tax_total,
                  service_charge_total,
                  total,
                  table_id,
                  table_title,
                  floor,
                  delivery_type,
                  customer_type,
                  customer_id,
                  name,
                  email,
                  orders,
                  payment_type_id
                } = invoice;

                const orderIdsArr = orders.map(o=>o.order_id);
                const tokenIdsArr = orders.map(o=>o.token_no);
                const orderIds = orderIdsArr.join(", ")
                const tokens = tokenIdsArr.join(", ");

                return <tr key={index}>
                  <td>{invoice_id}</td>
                  {/* <td>{orderIds}</td> */}
                  <td>{tokens}</td>
                  <td>{new Intl.DateTimeFormat('en', {dateStyle: "medium", timeStyle: "short"}).format(new Date(created_at))}</td>
                  <td>{state.currency}{sub_total}</td>
                  <td>{state.currency}{tax_total}</td>
                  <td>
                    {service_charge_total ? `${state.currency || ''}${service_charge_total}` : '-'}
                  </td>
                  <td className="font-bold">{state.currency}{total}</td>
                  <td>{delivery_type?delivery_type:"N/A"}</td>
                  <td>{customer_id ?<b>{name}-({customer_id})</b>:"WALKIN"}</td>
                  <td>{table_id ? <b>{table_title}-{floor}</b>:"N/A"}</td>

                  <td className="flex items-center gap-2">
                    <button onClick={()=>{btnViewReceipt(invoice_id, orderIdsArr, tokens, payment_type_id)}} className="btn btn-sm btn-circle text-restro-text">
                      <IconReceipt stroke={iconStroke} />
                    </button>
                    <button onClick={()=>{btnPrintReceipt(invoice_id, orderIdsArr, tokens, payment_type_id)}} className="btn btn-sm btn-circle text-restro-text">
                      <IconPrinter stroke={iconStroke} />
                    </button>
                  </td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </div>}
      {/* search result */}

      {/* data */}
      <h3 className="mt-6 mb-4 text-base">{t('invoices.showing_invoices_for', { filter: filters.find(f => f.key == state.filter).value })}</h3>
      {invoices.length == 0 ? (
        <div className="text-center w-full h-[50vh] flex flex-col items-center justify-center text-gray-500">
          <img
            src="/assets/illustrations/invoice-not-found.webp"
            alt="no invoices"
            className="w-1/2 md:w-60"
          />
          <p className="mt-4">{t('invoices.no_invoices')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className='table table-sm table-zebra border w-full border-restro-border-green'>
            <thead>
              <tr>
                <th>{t('invoices.invoice_id')}</th>
                <th>{t('invoices.tokens')}</th>
                <th>{t('invoices.date')}</th>
                <th>{t('invoices.subtotal')}</th>
                <th>{t('invoices.tax')}</th>
                <th>{t('invoices.service_charge')}</th>
                <th>{t('invoices.total')}</th>
                <th>{t('invoices.delivery_type')}</th>
                <th>{t('invoices.customer')}</th>
                <th>{t('invoices.table')}</th>
                <th>{t('invoices.action')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index)=>{
                const {
                  invoice_id,
                  created_at,
                  sub_total,
                  tax_total,
                  service_charge_total,
                  total,
                  table_id,
                  table_title,
                  floor,
                  delivery_type,
                  customer_type,
                  customer_id,
                  name,
                  email,
                  orders,
                  payment_type_id
                } = invoice;

                const orderIdsArr = orders.map(o=>o.order_id);
                const tokenIdsArr = orders.map(o=>o.token_no);
                const orderIds = orderIdsArr.join(", ")
                const tokens = tokenIdsArr.join(", ");

                return <tr key={index}>
                  <td>{invoice_id}</td>
                  {/* <td>{orderIds}</td> */}
                  <td>{tokens}</td>
                  <td>{new Intl.DateTimeFormat('en', {dateStyle: "medium", timeStyle: "short"}).format(new Date(created_at))}</td>
                  <td>{state.currency}{sub_total}</td>
                  <td>{state.currency}{tax_total}</td>
                  <td>
                    {service_charge_total ? `${state.currency || ''}${service_charge_total}` : '-'}
                  </td>
                  <td className="font-bold">{state.currency}{total}</td>
                  <td>{delivery_type?delivery_type:"N/A"}</td>
                  <td>{customer_id ?<b>{name}-({customer_id})</b>:"WALKIN"}</td>
                  <td>{table_id ? <b>{table_title}-{floor}</b>:"N/A"}</td>

                  <td className="flex items-center gap-2">
                    <button onClick={()=>{btnViewReceipt(invoice_id, orderIdsArr, tokens, payment_type_id)}} className='btn btn-sm btn-circle text-restro-text hover:bg-restro-button-hover'>
                      <IconReceipt stroke={iconStroke} />
                    </button>
                    <button onClick={()=>{btnPrintReceipt(invoice_id, orderIdsArr, tokens, payment_type_id)}} className='btn btn-sm btn-circle text-restro-text hover:bg-restro-button-hover'>
                      <IconPrinter stroke={iconStroke} />
                    </button>
                  </td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* data */}

      {/* filter dialog */}
      <dialog id="filter-dialog" className="modal">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg flex items-center">
            <IconFilter stroke={iconStroke} /> {t('invoices.filter')}
          </h3>
          {/* filters */}
          <div className="my-4">
            <div>
              <label className=" block text-gray-500 text-sm">{t('invoices.filter')}</label>
              <select
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
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
                  {t('invoices.from')}
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
                  {t('invoices.to')}
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
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('invoices.close')}</button>
              <button onClick={()=>{
                setState({
                  ...state,
                  filter: filterTypeRef.current.value,
                  fromDate: fromDateRef.current.value || null,
                  toDate: toDateRef.current.value || null,
                });
              }}  className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('invoices.apply')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* filter dialog */}
    </Page>
  )
}
