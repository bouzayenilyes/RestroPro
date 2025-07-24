import React, { useRef, useState } from "react";
import Page from "../components/Page";
import { IconCarrot, IconFilter, IconDownload, IconArrowUpRight, IconArrowDownLeft, IconSearch, IconBox, IconAlertTriangle, IconCircleArrowDownLeft, IconCircleArrowUpRight, IconCircleMinus, IconArrowsRandom, IconLibraryMinus } from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useInventoryLogs } from "../controllers/inventory.controller";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
export default function InventoryLogsPage() {
  const { t } = useTranslation();
  const filters = [
    { key: "today", value: t("inventory.filters_option_today") },
    { key: "yesterday", value: t("inventory.filters_option_yesterday") },
    { key: "last_7days", value: t("inventory.filters_option_last_7_days") },
    { key: "this_month", value: t("inventory.filters_option_this_month") },
    { key: "last_month", value: t("inventory.filters_option_last_month") },
    { key: "custom", value: t("inventory.filters_option_custom") },
  ];

  const [selectedMovementType, setSelectedMovementType] = useState("all");

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

  const [state, setState] = useState({
    filter: filters[0].key,
    fromDate: null,
    toDate: null,
    warehouseId: "",
    search: ""
  });

  const { APIURL, data, error, isLoading } = useInventoryLogs({
    type: state.filter,
    from: state.fromDate,
    to: state.toDate,
    movementType: selectedMovementType,
  });

  if (isLoading) {
    return <Page>{t("inventory.loading_message")}</Page>;
  }

  if (error) {
    return <Page>{t("inventory.error_loading_message")}</Page>;
  }

  const handleExportData = async () => {
    try {
      const { Parser } = await import("@json2csv/plainjs");
      const { saveAs } = await import("file-saver");

      if (data.length != 0){
        const formattedData = data.map((entry) => ({
          title: entry.title,
          movement: entry.type,
          quantity: entry.quantity,
          unit:entry.unit || '',
          remarks: entry.note,
          updated_by: entry.created_by,
          created_at: moment.utc(entry.created_at).local().format("YYYY-MM-DD HH:mm"),
        }));

        const opts = {
          fields: ["title", "movement", "quantity", "unit", "remarks", "updated_by", "created_at"],
        };

        const parser = new Parser(opts);
        const csv = parser.parse(formattedData);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        const formattedDate = `${new Date().toISOString().substring(0, 10)}`;
        const fileName = `Inventory Logs - ${formattedDate}.csv`;

        saveAs(blob, fileName);
        toast.success(t("inventory.export_success_message"));
      } else {
        toast.error(t("inventory.export_no_data_message"));
      }

    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.dismiss();
      toast.error(t("inventory.export_error_message"));
    }
  };

  return (
    <Page>
      <div className="breadcrumbs text-sm mb-1">
        <ul>
          <li>
            <Link to="/dashboard/inventory">{t("inventory.breadcrumbs_inventory")}</Link>
          </li>
          <li>{t("inventory.breadcrumbs_movements")}</li>
        </ul>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <h3 className="text-2xl flex-1">{t("inventory.page_title")}</h3>
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
          className='btn btn-sm transition active:scale-95 hover:shadow-lg px-4 py-1 border bg-restro-gray hover:bg-restro-button-hover rounded-lg'>
          <IconFilter stroke={iconStroke} /> {t("inventory.filters_button")}
        </button>
        <button
          onClick={handleExportData}
          className='btn btn-sm transitiontransition active:scale-95 hover:shadow-lg px-4 py-1 border bg-restro-bg-gray hover:bg-restro-button-hover rounded-lg w-fit`'>
          <IconDownload stroke={iconStroke} size={20} />
        </button>
      </div>

      <h3 className="mt-1 text-gray-500 text-base">
        {t("inventory.showing_data_for")} {filters.find((f) => f.key == state.filter).value}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 text-restro-text">
        {[
          {
            label: t("inventory.stock_movements_all"),
            icon: <IconArrowsRandom stroke={1.5} className="text-gray-600" />,
            type: "all",
            border: "border-l-gray-400",
            countColor: "text-gray-600",
          },
          {
            label: t("inventory.stock_movements_in"),
            icon: <IconCircleArrowDownLeft stroke={1.5} className="text-green-600" />,
            type: "IN",
            border: "border-l-restro-green",
            countColor: "text-restro-green",
          },
          {
            label: t("inventory.stock_movements_out"),
            icon: <IconCircleArrowUpRight stroke={1.5} className="text-yellow-600" />,
            type: "OUT",
            border: "border-l-yellow-600",
            countColor: "text-yellow-600",
          },
          {
            label: t("inventory.stock_movements_wastage"),
            icon: <IconLibraryMinus stroke={1.5} className="text-red-600" />,
            type: "WASTAGE",
            border: "border-l-red-600",
            countColor: "text-red-100",
          },
        ].map(({ label, icon, type, border, countColor }) => {
          const isSelected = selectedMovementType === type;
          return (
            <div
              key={type}
              onClick={() => setSelectedMovementType(type)}
              className={clsx(
                "cursor-pointer flex items-center gap-4 px-4 py-4 rounded-xl border border-l-8 transition-all duration-200",
                countColor,
                border,
                isSelected
                  ? theme === "black"
                    ? "bg-restro-card-bg text-white border-restro-border-dark-mode"
                    : "bg-gray-100 text-gray-900 border-restro-green-light"
                  : theme === "black"
                    ? "text-white border-restro-border-dark-mode"
                    : "text-gray-700 border-restro-green-light"

              )}
            >
              <div className='p-3 rounded-lg shadow-inner bg-restro-bg-gray'>{icon}</div>
              <div>
                <div className="text-sm font-medium text-gray-600">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full overflow-auto h-[calc(100vh-320px)] mt-4">
        {data
          .filter((item) => {
            if (!state.search) {
              return true;
            }
            return new String(item.title).trim().toLowerCase().includes(state.search.trim().toLowerCase());
          }).length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center h-full">
            <img
              src="/assets/illustrations/orders-not-found.webp"
              alt={t("inventory.no_stock_movements_image_alt")}
              className="w-1/2 md:w-60"
            />
            <p className='text-md text-restro-text'>{t("inventory.no_stock_movements_message")}</p>
          </div>
        ) : (
          <table className="table table-sm">
            <thead className='border sticky top-0 z-10 bg-restro-bg-gray border-restro-border-green'>
              <tr>
                <th className="text-start p-2.5">#</th>
                <th className="text-start">{t("inventory.table_header_item")}</th>
                <th className="text-start">{t("inventory.table_header_quantity")}</th>
                <th className="text-start">{t("inventory.table_header_movement")}</th>
                <th className="text-start">{t("inventory.table_header_date_time")}</th>
                <th className="text-start max-w-60">{t("inventory.table_header_remarks")}</th>
                <th className="text-start">{t("inventory.table_header_updated_by")}</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((item) => {
                  if (!state.search) {
                    return true;
                  }
                  return new String(item.title).trim().toLowerCase().includes(state.search.trim().toLowerCase());
                })
                .map((inventoryItem, i) => {
                  const { id, inventory_item_id, title, type, quantity, unit, note, created_by, created_at } = inventoryItem;
                  return (
                    <tr key={i}>
                      <td>{data.length - i}</td>
                      <td>
                        <div className="flex gap-2 items-center">
                          <p className="text-ellipsis line-clamp-2">{title}</p>
                        </div>
                      </td>
                      <td>
                        <p>
                          {quantity ? `${Number(quantity).toLocaleString()} ${unit || ''}` : t("inventory.default_no_remarks")}
                        </p>
                      </td>
                      <td>
                        <div
                          className={clsx("flex items-center gap-1 w-fit px-2 py-1 rounded-lg text-xs", {
                            "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 " : type == "WASTAGE",
                            "bg-yellow-100 dark:bg-yellow-600 text-yellow-600 dark:text-yellow-300" : type == "OUT",
                            "bg-red-100 dark:bg-red-600 text-red-600 dark:text-red-200" : type == "IN",
                          })}
                        >
                          {t(`inventory.movement_type_${type.toLowerCase()}`)}
                        </div>
                      </td>
                      <td>{created_at ? moment.utc(created_at).local().format("DD/MM/YYYY, h:mm A") : t("inventory.default_no_date")}</td>
                      <td>{note || t("inventory.default_no_remarks")}</td>
                      <td>{created_by || t("inventory.default_no_updated_by")}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
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
              <label className = "block text-gray-500 text-sm">{t("inventory.filters_filter_label")}</label>
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
              <button className='px-4 py-3 rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("inventory.filters_close_button")}</button>
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
                {t("inventory.filters_apply_button")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* filter dialog */}
    </Page>
  );
}
