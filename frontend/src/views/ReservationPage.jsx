import React, { useRef, useState, Fragment } from "react";
import Page from "../components/Page";
import {
  IconFilter,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";

import { searchCustomer } from "../controllers/customers.controller";
import CustomerCard from "../components/CustomerCard";
import {
  addReservation,
  deleteReservation,
  searchReservations,
  updateReservation,
  useReservations,
  useReservationsInit,
} from "../controllers/reservations.controller";
import ReservationCard from "../components/ReservationCard";
import { SCOPES } from "../config/scopes";
import { getUserDetailsInLocalStorage } from "../helpers/UserDetails";
import AsyncCreatableSelect from 'react-select/async-creatable';
import DialogAddCustomer from '../components/DialogAddCustomer';
import { useTheme } from "../contexts/ThemeContext";

export default function ReservationPage() {
  const { t } = useTranslation();
  const {theme} = useTheme();

  const { role, scope } = getUserDetailsInLocalStorage();
  const userScopes = scope?.split(",");
  let isManageAllowed = false;
  if(role == "admin") {
    isManageAllowed = true;
  } else {
    if(userScopes.includes(SCOPES.MANAGE_RESERVATIONS) || userScopes.includes(SCOPES.RESERVATIONS)) {
      isManageAllowed = true;
    }
  }

  const filters = [
    { key: "today", value: t("reservations.filters.today") },
    { key: "tomorrow", value: t("reservations.filters.tomorrow") },
    { key: "yesterday", value: t("reservations.filters.yesterday") },
    { key: "last_7days", value: t("reservations.filters.last_7days") },
    { key: "this_month", value: t("reservations.filters.this_month") },
    { key: "last_month", value: t("reservations.filters.last_month") },
    { key: "custom", value: t("reservations.filters.custom") },
  ];

  const searchRef = useRef();
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

  const customerSearchRef = useRef();
  const reservationDateRef = useRef();
  const reservationTableRef = useRef();
  const reservationPeopleCountRef = useRef();
  const reservationStatusRef = useRef();
  const reservationNotesRef = useRef();

  const updateReservationIdRef = useRef();
  const updateReservationDateRef = useRef();
  const updateReservationTableRef = useRef();
  const updateReservationPeopleCountRef = useRef();
  const updateReservationStatusRef = useRef();
  const updateReservationNotesRef = useRef();

  const [state, setState] = useState({
    search: "",
    searchResults: [],
    spage: 1,
    filter: filters[0].key,
    fromDate: null,
    toDate: null,
    customer: null,
    addCustomerDefaultValue: null,
    addReservationSelectedBranch: null,
  });

  const {
    data: storeTablesData,
    error: errorStoreTables,
    isLoading: isLoadingStoreTables,
  } = useReservationsInit();


  const {
    APIURL,
    data: reservations,
    error,
    isLoading,
  } = useReservations({
    type: state.filter,
    from: state.fromDate,
    to: state.toDate,
  });

  if (isLoadingStoreTables) {
    return <Page>{t("reservations.loading_message")}</Page>;
  }
  if (errorStoreTables) {
    return <Page>{t("reservations.error_message")}</Page>;
  }

  if (isLoading) {
    return <Page>{t("reservations.loading_message")}</Page>;
  }

  if (error) {
    return <Page>{t("reservations.error_message")}</Page>;
  }

  const { storeTables } =  storeTablesData;

  const btnSearch = async () => {
    const searchQuery = searchRef.current.value;
    if (!new String(searchQuery).trim()) {
      return;
    }

    try {
      toast.loading(t("reservations.loading_message"));
      const res = await searchReservations(new String(searchQuery).trim());
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
        toast.error(t("reservations.no_result"));
      }

    } catch (error) {
      console.error(error);
      const message = error.response.data.message || t("reservations.error_message");

      toast.dismiss();
      toast.error(message);
    }
  };
  const btnClearSearch = () => {
    searchRef.current.value = null;

    setState({
      ...state,
      search: "",
      searchResults: [],
      spage: 1,
    });
  };

  const btnSearchCustomer = async () => {
    const customerSearch = customerSearchRef.current.value;

    if (!customerSearch) {
      toast.error(t("reservations.customer_search_error"));
      return;
    }

    try {
      toast.loading(t("reservations.loading_message"));

      const res = await searchCustomer(customerSearch);
      if (res.status == 200) {
        toast.dismiss();

        const customer = res.data;
        setState({
          ...state,
          customer: customer,
        });
      } else {
        toast.dismiss();
        toast.error(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("reservations.error_message");
      toast.dismiss();
      toast.error(message);
    }
  };

  const clearSelectedCustomer = () => {
    setState({
      ...state,
      customer: null,
    });
  };

  const setCustomer = (customer) => {
    if(customer) {
      setState({
        ...state,
        customer: {phone: customer.value, name:customer.label},
      })
    } else {
      clearSelectedCustomer();
    }
  }

  const searchCustomersAsync = async (inputValue) => {

    try {
      if(inputValue) {
        const resp = await searchCustomer(inputValue);
        if(resp.status == 200) {
          return resp.data.map((data)=>( {label: `${data.name} - (${data.phone})`, value: data.phone} ));
        }
      }
    } catch (error) {
      console.log(error);

    }
  }

  const btnAdd = async () => {
    const customerId = state.customer.phone;
    const date = reservationDateRef.current.value;
    const tableId = reservationTableRef.current.value || null;
    const peopleCount = reservationPeopleCountRef.current.value || null;
    const status = reservationStatusRef.current.value || null;
    const notes = reservationNotesRef.current.value || null;

    if (!customerId) {
      toast.error(t("reservations.select_customer_error"));
      return;
    }

    if (!date) {
      toast.error(t("reservations.select_date_error"));
      return;
    }

    try {
      const res = await addReservation(
        customerId,
        date,
        tableId,
        status,
        notes,
        peopleCount
      );
      if (res.status == 200) {
        reservationDateRef.current.value = null;
        reservationTableRef.current.value = null;
        reservationPeopleCountRef.current.value = null;
        reservationStatusRef.current.value = null;
        reservationNotesRef.current.value = null;

        await mutate(APIURL);
        clearSelectedCustomer();
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("reservations.error_message");
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  const btnDelete = async id => {
    const isConfirm = window.confirm(t("reservations.delete_confirm"));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t("reservations.loading_message"));
      const res = await deleteReservation(id);

      if(res.status == 200) {
        await mutate(APIURL);
        setState({
          ...state,
          searchResults: state.searchResults.filter(s=>s.id != id)
        });
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("reservations.error_message");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnShowUpdate = (id, date, table, peopleCount, status, notes) => {
    updateReservationIdRef.current.value = id;
    updateReservationDateRef.current.value = date;
    updateReservationTableRef.current.value = table;
    updateReservationPeopleCountRef.current.value = peopleCount;
    updateReservationStatusRef.current.value = status;
    updateReservationNotesRef.current.value = notes;

    document.getElementById("modal-update").showModal();
  };

  const btnUpdate = async () => {
    const id = updateReservationIdRef.current.value;
    const date = updateReservationDateRef.current.value;
    const tableId = updateReservationTableRef.current.value || null;
    const peopleCount = updateReservationPeopleCountRef.current.value || null;
    const status = updateReservationStatusRef.current.value || null;
    const notes = updateReservationNotesRef.current.value || null;

    if (!id) {
      toast.error(t("reservations.invalid_request"));
      return;
    }

    if (!date) {
      toast.error(t("reservations.select_date_error"));
      return;
    }

    try {
      const res = await updateReservation(
        id, date, tableId, status, notes, peopleCount
      );
      if (res.status == 200) {
        updateReservationIdRef.current.value = null;
        updateReservationDateRef.current.value = null;
        updateReservationTableRef.current.value = null;
        updateReservationPeopleCountRef.current.value = null;
        updateReservationStatusRef.current.value = null;
        updateReservationNotesRef.current.value = null;

        await mutate(APIURL);
        clearSelectedCustomer();
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("reservations.error_message");
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page>
      <div className="flex flex-wrap gap-4 flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex gap-6">
          <h3 className="text-2xl">{t("reservations.title")}</h3>
          {
            isManageAllowed && <button
            onClick={() => {
              document.getElementById("modal-add").showModal();
            }}
            className = "text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover"
          >
            <IconPlus size={22} stroke={iconStroke} /> {t("reservations.new")}
          </button>
          }
        </div>

        <div className="flex gap-2">
          <div className='px-2 py-1 rounded-lg flex items-center bg-restro-bg-gray border border-restro-border-green'>
            <input
              ref={searchRef}
              defaultValue={state.search}
              type="text"
              placeholder={t("reservations.search_placeholder")}
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
             className='transition active:scale-95 hover:shadow-lg px-3 py-1 text-white ml-2 rounded-xl border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
          >
            {t("reservations.search_button")}
          </button>
          <button
            onClick={() => document.getElementById("filter-dialog").showModal()}
            className='w-8 h-8 flex items-center justify-center text-restro-text rounded-full active:scale-95 transition hover:bg-restro-button-hover'
          >
            <IconFilter />
          </button>
        </div>
      </div>


      {/* search result */}
      {state.searchResults.length > 0 && <div className="mt-6">
        <h3>{t("reservations.showing_search_result", { search: state.search })}</h3>
        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 rounded-lg'>
        {state.searchResults.map((reservation, index) => {
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

            const dateObj = new Date(date);
            const createdAt = new Date(created_at).toLocaleString("en", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            const dateLocal = dateObj.toLocaleDateString("en", {
              dateStyle: "medium",
            });
            const timeLocal = dateObj.toLocaleTimeString("en", {
              timeStyle: "short",
            });
            
            const localDateTime = new Date(dateObj.toLocaleString('en'));
            const dateFormatted = `${localDateTime.getFullYear()}-${(localDateTime.getMonth()+1).toString().padStart(2, '0')}-${(localDateTime.getDate()).toString().padStart(2, '0')} ${(localDateTime.getHours()).toString().padStart(2, '0')}:${(localDateTime.getMinutes()).toString().padStart(2, '0')}:${(localDateTime.getSeconds()).toString().padStart(2, '0')}`;

            return <ReservationCard
              btnDelete={()=>{
                btnDelete(id)
              }}
              btnUpdate={()=>{
                btnShowUpdate(id, dateFormatted, table_id, people_count, status, notes);
              }}
              createdAt={createdAt}
              customer_name={customer_name}
              dateLocal={dateLocal}
              notes={notes}
              people_count={people_count}
              status={status}
              table_title={table_title}
              timeLocal={timeLocal}
              unique_code={unique_code}
              key={unique_code}
            />;
          })}
        </div>
      </div>}
      {/* search result */}

      {/* data */}
      <h3 className="mt-6 mb-4 text-restro-text">{t("reservations.showing_reservations_for", { filter: filters.find(f=>f.key==state.filter).value })}</h3>
      {reservations.length == 0 ? (
        <div className="text-center w-full h-[50vh] flex flex-col items-center justify-center text-restro-text">
          <img
            src="/assets/illustrations/reservation-not-found.webp"
            alt="no reservation"
            className="w-1/2 md:w-60"
          />
          <p>{t("reservations.no_reservation")}</p>
          <p>{t("reservations.double_checked")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {reservations.map((reservation, index) => {
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

            console.log(date);
            

            const dateObj = new Date(date);
            const createdAt = new Date(created_at).toLocaleString("en", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            const dateLocal = dateObj.toLocaleDateString("en", {
              dateStyle: "medium",
            });
            const timeLocal = dateObj.toLocaleTimeString("en", {
              timeStyle: "short",
            });
            
            const localDateTime = new Date(dateObj.toLocaleString('en'));
            const dateFormatted = `${localDateTime.getFullYear()}-${(localDateTime.getMonth()+1).toString().padStart(2, '0')}-${(localDateTime.getDate()).toString().padStart(2, '0')} ${(localDateTime.getHours()).toString().padStart(2, '0')}:${(localDateTime.getMinutes()).toString().padStart(2, '0')}:${(localDateTime.getSeconds()).toString().padStart(2, '0')}`;

            return <ReservationCard
              btnDelete={()=>{
                btnDelete(id)
              }}
              btnUpdate={()=>{
                btnShowUpdate(id, dateFormatted, table_id, people_count, status, notes);
              }}
              createdAt={createdAt}
              customer_name={customer_name}
              dateLocal={dateLocal}
              notes={notes}
              people_count={people_count}
              status={status}
              table_title={table_title}
              timeLocal={timeLocal}
              unique_code={unique_code}
              key={unique_code}
            />;
          })}
        </div>
      )}
      {/* data */}

      {/* filter dialog */}
      <dialog id="filter-dialog" className="modal">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg flex items-center">
            <IconFilter stroke={iconStroke} /> {t("reservations.filter")}
          </h3>
          {/* filters */}
          <div className="my-4">
            <div>
              <label className="block text-gray-500 text-sm">{t("reservations.filter_label")}</label>
              <select
                 className='select relative w-full cursor-default text-left sm:text-sm border border-restro-border-green dark:bg-black rounded-lg px-2 py-2 focus:border-restro-border-green focus:outline-none'
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
                  {t("reservations.from")}
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
                  {t("reservations.to")}
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
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("reservations.close")}</button>
              <button onClick={()=>{
                setState({
                  ...state,
                  filter: filterTypeRef.current.value,
                  fromDate: fromDateRef.current.value || null,
                  toDate: toDateRef.current.value || null,
                });
              }}   
              className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t("reservations.apply")}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* filter dialog */}

      {/* add dialog */}
      <DialogAddCustomer
        defaultValue={state.addCustomerDefaultValue}
        branchId={state.addReservationSelectedBranch}
        role={role}
        onSuccess={(phone, name)=>{
          setCustomer({value: phone, label: `${name} - (${phone})`})
        }}
      />
      <dialog id="modal-add" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("reservations.add_reservation")}</h3>

          <div className="mt-4">
            <label
              htmlFor="customer"
              className="mb-1 block text-gray-500 text-sm"
            >
              {t("reservations.select_customer")}{" "}
              <span className="text-xs text-gray-400">- {t("reservations.required")}</span>
            </label>
            <AsyncCreatableSelect
              menuPlacement='auto'
              loadOptions={searchCustomersAsync}
              isClearable
              noOptionsMessage={(v)=>{return t("reservations.type_to_find")}}
              onChange={(v)=>{
                setCustomer(v);
              }}
              onCreateOption={(inputValue)=>{
                setState({
                  ...state,
                  addCustomerDefaultValue: inputValue,
                })
                document.getElementById("modal-add-customer").showModal();
              }}
             styles={{
              control: (base) => ({
                ...base,
                backgroundColor: theme === "black" ? "" : "",
                borderRadius: "0.5rem",
                borderColor: theme === "black" ? "#232323" : "#f3f4f6",
                height: 40,
                boxShadow: "none",
                color: theme === "black" ? "#ffffff" : "#111827", // text color
                "&:hover": {
                  borderColor: theme === "black" ? "#23233" : "#9ca3af",
                },
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0.5rem",
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: 150,
                overflowY: "auto",
                borderRadius: "0.5rem",
                backgroundColor: theme === "black" ? "#232323" : "white",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? theme === "black"
                    ? "#292929"
                    : "#e5e7eb"
                  : theme === "black"
                    ? "#232323"
                    : "white",
                color: theme === "black" ? "#f9fafb" : "#111827",
                "&:active": {
                  backgroundColor: theme === "black" ? "#6b7280" : "#d1d5db",
                },
              }),
              indicatorSeparator: (base) => ({
                ...base,
                backgroundColor: theme === "black" ? "#272727" : "#d1d5db", // divider color based on theme
              }),
            }}
            />
          </div>

          <div className="mt-4">
            {state.customer && (
              <CustomerCard
                phone={state.customer.phone}
                name={state.customer.name}
                // email={state.customer.email}
                birth_date={state.customer.birth_date}
                gender={state.customer.gender}
                // created_at={state.customer.created_at}
                btnAction={() => {
                  clearSelectedCustomer();
                }}
              />
            )}
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label
                htmlFor="date"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("reservations.date")} <span className="text-xs text-gray-400">- {t("reservations.required")}</span>
              </label>
              <input
                ref={reservationDateRef}
                type="datetime-local"
                name="date"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("reservations.select_date")}
                min={new Date().toISOString().slice(0,new Date().toISOString().lastIndexOf(":"))}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="table"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("reservations.table")}
              </label>
              <select
                ref={reservationTableRef}
                name="table"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("reservations.select_table")}
              >
                <option value="">{t("reservations.select_table")}</option>
                {storeTables.map((storeTable, index) => (
                  <option key={storeTable.id} value={storeTable.id}>
                    {storeTable.table_title} ({t("reservations.capacity")}:{" "}
                    {storeTable.seating_capacity}) - {storeTable.floor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 w-full mt-4">
            <div className="flex-1">
              <label
                htmlFor="people"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("reservations.people_count")}{" "}
                <span className="text-xs text-gray-400">- {t("reservations.required")}</span>
              </label>
              <input
                ref={reservationPeopleCountRef}
                min={0}
                type="number"
                name="people"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("reservations.enter_people_count")}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="status"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("reservations.status")}
              </label>
              <select
                ref={reservationStatusRef}
                name="status"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("reservations.select_status")}
              >
                <option value="booked">{t("reservations.booked")}</option>
                <option value="paid">{t("reservations.paid")}</option>
                <option value="cancelled">{t("reservations.cancelled")}</option>
              </select>
            </div>
          </div>

          <div className="my-4">
            <label htmlFor="notes" className="mb-1 block text-gray-500 text-sm">
              {t("reservations.notes")}
            </label>
            <textarea
              ref={reservationNotesRef}
              name="notes"
              placeholder={t("reservations.enter_notes")}
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
            ></textarea>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button
                onClick={() => {
                  clearSelectedCustomer();
                }}
                className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'
              >
                {t("reservations.close")}
              </button>
              <button
                onClick={() => {
                  btnAdd();
                }}
                className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t("reservations.save")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* add dialog */}

      {/* update dialog */}
      <dialog id="modal-update" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("reservations.update_reservation")}</h3>
          <input type="hidden" ref={updateReservationIdRef} />
          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label
                htmlFor="date"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("reservations.date")} <span className="text-xs text-gray-400">- {t("reservations.required")}</span>
              </label>
              <input
                ref={updateReservationDateRef}
                type="datetime-local"
                name="date"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder="Select Date"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="table"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("reservations.table")}
              </label>
              <select
                ref={updateReservationTableRef}
                name="table"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("reservations.select_table")}
              >
                <option value="">{t("reservations.select_table")}</option>
                {storeTables.map((storeTable, index) => (
                  <option key={storeTable.id} value={storeTable.id}>
                    {storeTable.table_title} ({t("reservations.capacity")}:{" "}
                    {storeTable.seating_capacity}) - {storeTable.floor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 w-full mt-4">
            <div className="flex-1">
              <label
                htmlFor="people"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("reservations.people_count")}{" "}
                <span className="text-xs text-gray-400">- {t("reservations.required")}</span>
              </label>
              <input
                ref={updateReservationPeopleCountRef}
                min={0}
                type="number"
                name="people"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("reservations.enter_people_count")}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="status"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("reservations.status")}
              </label>
              <select
                ref={updateReservationStatusRef}
                name="status"
               className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("reservations.select_status")}
              >
                <option value="booked">{t("reservations.booked")}</option>
                <option value="paid">{t("reservations.paid")}</option>
                <option value="cancelled">{t("reservations.cancelled")}</option>
              </select>
            </div>
          </div>

          <div className="my-4">
            <label htmlFor="notes" className="mb-1 block text-gray-500 text-sm">
              {t("reservations.notes")}
            </label>
            <textarea
              ref={updateReservationNotesRef}
              name="notes"
              placeholder={t("reservations.enter_notes")}
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
            ></textarea>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
               <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
                {t("reservations.close")}
              </button>
              <button
                onClick={() => {
                  btnUpdate();
                }}
                className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t("reservations.save")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* update dialog */}
    </Page>
  );
}
