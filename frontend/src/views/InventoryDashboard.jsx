import React, { useRef, useState } from "react";
import Page from "../components/Page";
import { IconFilter, IconArrowUpRight, IconArrowDownLeft, IconSearch, IconBox, IconAlertTriangle, IconCircleMinus, IconCopyMinus } from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useInventoryDashboard } from "../controllers/inventory.controller";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function InventoryDashboardPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const filters = [
    { key: "today", value: t("inventory.filters_option_today") },
    { key: "yesterday", value: t("inventory.filters_option_yesterday") },
    { key: "last_7days", value: t("inventory.filters_option_last_7_days") },
    { key: "this_month", value: t("inventory.filters_option_this_month") },
    { key: "last_month", value: t("inventory.filters_option_last_month") },
    { key: "custom", value: t("inventory.filters_option_custom") },
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
    warehouseId: "",
    search: ""
  });

  const { APIURL, data, error, isLoading } = useInventoryDashboard({
    type: state.filter,
    from: state.fromDate,
    to: state.toDate,
  });

  if (isLoading) {
    return <Page>{t("inventory.loading_message")}</Page>;
  }

  if (error) {
    return <Page>{t("inventory.error_loading_message")}</Page>;
  }

  const {
    cummulativeInventoryMovements,
    inventoryUsageVSCurrentStock
  } = data;

  return (
    <Page>
      <div className="breadcrumbs text-sm mb-1">
        <ul>
          <li>
            <Link to="/dashboard/inventory">{t("inventory.breadcrumbs_inventory")}</Link>
          </li>
          <li>{t("inventory.breadcrumbs_dashboard")}</li>
        </ul>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <h3 className="text-2xl flex-1">{t("inventory.page_title_dashboard")}</h3>
        <div className="relative md:w-80">
          <IconSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            className="input input-sm input-bordered focus:outline-none focus:ring-1 focus-within:ring-gray-200 transition pl-8 pr-2 w-full rounded-lg text-gray-500 py-4 h-8"
            placeholder={t("inventory.search_placeholder")}
            value={state.search}
            onChange={(e) => {
              setState({
                ...state,
                search: e.target.value,
              });
            }}
          />
        </div>
        <button
          onClick={() => document.getElementById("filter-dialog").showModal()}
          className='btn btn-sm rounded-lg w-fit bg-restro-gray hover:bg-restro-button-hover text-restro-text border border-restro-border-green'
        >
          <IconFilter stroke={iconStroke} /> {t("inventory.filters_button")}
        </button>
      </div>

      <h3 className="mt-1 text-gray-500 text-base">
        {t("inventory.showing_data_for")} {filters.find((f) => f.key == state.filter).value}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mt-6">
        {/* Top Moving Inventory Items */}
        <div className='h-[calc(100vh-220px)] rounded-3xl border border-restro-border-green text-restro-text'>
          <div className='pt-5 px-4 backdrop-blur sticky top-0 z-10 font-bold pb-1 bg-restro-bg-gray rounded-t-3xl'>
            {t("inventory.cummulative_inventory_movements")}
          </div>

          <div className="mt-4 h-[calc(100%-60px)] overflow-auto">
            {cummulativeInventoryMovements?.filter((item) => {
              if (!state.search) {
                return true;
              }
              return new String(item.title).trim().toLowerCase().includes(state.search.trim().toLowerCase());
            })?.length > 0 ? (
              <table className="table table-sm w-full text-xs lg:text-sm">
                <thead className='px-4 sticky top-0 z-10 bg-restro-bg-gray'>
                  <tr>
                    <th>{t("inventory.table_header_number")}</th>
                    <th>{t("inventory.table_header_item")}</th>
                    <th className="text-green-600">{t("inventory.table_header_in")}</th>
                    <th className="text-red-600">{t("inventory.table_header_out")}</th>
                    <th className="text-yellow-600">{t("inventory.table_header_wastage")}</th>
                  </tr>
                </thead>
                <tbody>
                  {cummulativeInventoryMovements.filter((item) => {
                    if (!state.search) {
                      return true;
                    }
                    return new String(item.title).trim().toLowerCase().includes(state.search.trim().toLowerCase());
                  })?.map((item, index) => (
                    <tr key={item.inventory_item_id}>
                      <td>{index + 1}</td>
                      <td>{item.title}</td>
                      <td className="text-green-600">
                        <div className="flex gap-1 items-center">
                          <IconArrowDownLeft stroke={iconStroke} size={18} />
                          {item.total_in} {item.unit}
                        </div>
                      </td>
                      <td className="text-red-600">
                        <div className="flex gap-1 items-center">
                          <IconArrowUpRight stroke={iconStroke} size={18} />
                          {item.total_out} {item.unit}
                        </div>
                      </td>
                      <td className="text-yellow-600">
                        <div className="flex gap-1 items-center">
                          {item.total_wastage > 0 && <IconCircleMinus stroke={iconStroke} size={18} />}
                          {item.total_wastage > 0 ? `${item.total_wastage} ${item.unit}` : t("inventory.default_no_remarks")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm mt-8">
                <img
                  src="/assets/illustrations/top-selling-not-found.webp"
                  alt={t("inventory.no_data_image_alt")}
                  className="w-1/4 mx-auto mb-2"
                />
                <span>{t("inventory.no_inventory_movements_message")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Usage vs Current Stock */}
        <div className='h-[calc(100vh-220px)] border rounded-3xl border-restro-border-green'>
          <div className='pt-5 px-4 sticky top-0 z-10 font-bold pb-1 rounded-t-3xl bg-restro-bg-gray border-t-restro-border-green'>
            {t("inventory.usage_vs_current_stock")}
          </div>

          <div className="mt-4 h-[calc(100%-60px)] overflow-auto">
            {inventoryUsageVSCurrentStock?.filter((item) => {
              if (!state.search) {
                return true;
              }
              return new String(item.title).trim().toLowerCase().includes(state.search.trim().toLowerCase());
            }).length > 0 ? (
              <table className="table table-sm w-full text-xs lg:text-sm">
                <thead className='sticky top-0 z-10 bg-restro-bg-gray'>
                  <tr>
                    <th>{t("inventory.table_header_number")}</th>
                    <th>{t("inventory.table_header_item")}</th>
                    <th className="text-red-600">{t("inventory.table_header_used")}</th>
                    <th className="text-green-600">{t("inventory.table_header_current_stock")}</th>
                    <th className="text-yellow-600">{t("inventory.table_header_min_qty")}</th>
                    <th>{t("inventory.table_header_status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryUsageVSCurrentStock.filter((item) => {
                    if (!state.search) {
                      return true;
                    }
                    return new String(item.title).trim().toLowerCase().includes(state.search.trim().toLowerCase());
                  }).map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.title}</td>
                        <td className="text-restro-red">
                          <div className="flex gap-1 items-center">
                            <IconCopyMinus stroke={iconStroke} size={18} />
                            {item.total_usage} {item.unit}
                          </div>
                        </td>
                        <td className="text-restro-green">
                          <div className="flex gap-1 items-center">
                            <IconBox stroke={iconStroke} size={18} />
                            {item.current_stock} {item.unit}
                          </div>
                        </td>
                        <td className="text-restro-yellow flex gap-1 items-center">
                          <IconAlertTriangle stroke={iconStroke} size={16} />
                          {Number(item.min_quantity_threshold).toFixed(2)} {item.unit}
                        </td>
                        <td>
                          <span
                            className={clsx(
                              "px-2 py-1 text-xs font-medium rounded-lg",
                              item.status === "in" && "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 ",
                              item.status === "low" && "bg-yellow-100 dark:bg-yellow-600 text-yellow-600 dark:text-yellow-300",
                              item.status === "out" && "bg-red-100 dark:bg-red-600 text-red-600 dark:text-red-300"
                            )}
                          >
                            {item.status === "in" && t("inventory.status_in_stock")}
                            {item.status === "low" && t("inventory.status_low_stock")}
                            {item.status === "out" && t("inventory.status_out_of_stock")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm mt-8">
                <img
                  src="/assets/illustrations/kitchen-order-not-found.webp"
                  alt={t("inventory.no_data_image_alt")}
                  className="w-1/4 mx-auto mb-2"
                />
                <span>{t("inventory.no_usage_vs_stock_message")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* filter dialog */}
      <dialog id="filter-dialog" className="modal">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg flex items-center">
            <IconFilter stroke={iconStroke} /> {t("inventory.filters_dialog_title")}
          </h3>
          {/* filters */}
          <div className="my-4">
            <div>
              <label className=" block text-gray-500 text-sm">{t("inventory.filters_filter_label")}</label>
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
                  {t("inventory.filters_from_date_label")}
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
                  {t("inventory.filters_to_date_label")}
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
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("inventory.filters_close_button")}</button>
              <button
                onClick={() => {
                  setState({
                    ...state,
                    filter: filterTypeRef.current.value,
                    fromDate: fromDateRef.current.value || null,
                    toDate: toDateRef.current.value || null,
                  });
                }}
                className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t("inventory.filters_apply_button")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* filter dialog */}
    </Page>
  );
}
