import React, { useEffect, useRef, useState } from "react";
import Page from "../components/Page";
import { IconAlertTriangle, IconBox, IconCarrot, IconCategory2,IconCircleMinus, IconDotsVertical, IconLogs, IconPencil, IconPlus, IconSearch, IconTrash, IconX } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { iconStroke } from "../config/config";
import { addInventoryItem, addInventoryItemStockMovement, deleteInventoryItem, updateInventoryItem, useInventoryItems } from "../controllers/inventory.controller";
import toast from "react-hot-toast";
import moment from "moment";
import { mutate } from "swr";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export const UNIT_LABELS = {
  kg: "Kilograms",
  g: "Grams",
  l: "Liters",
  ml: "Milliliters",
  pc: "Pieces",
};

export default function InventoryPage() {
  const { t } = useTranslation();
  const {theme} = useTheme();
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [state, setState] = useState({
    search: '',
    inventory: [],
    statusCounts: {
      all: 0,
      in: 0,
      low: 0,
      out: 0,
    },
  })

  const titleRef = useRef(null);
  const quantityRef = useRef(null);
  const unitRef = useRef(null);
  const minQuantityThresholdRef = useRef(null);

  const updateTitleRef = useRef(null);
  const updateQuantityRef = useRef(null);
  const updateUnitRef = useRef(null);
  const updateMinQuantityThresholdRef = useRef(null);

  const [selectedUpdateItem, setSelectedUpdateItem] = useState(null);

  const [selectedDeletItem, setSelectedDeleteItem] = useState(null);

  const addStockMovementTypeRef = useRef("IN");
  const addStockMovementItemIdRef = useRef(null);
  const addStockMovementQuantityRef = useRef(null);
  const addStockMovementNoteRef = useRef(null);

  const { APIURL, data, error, isLoading } = useInventoryItems({
    status: selectedStatus
  });

  useEffect(() => {
    if (data) {
      setState({
        ...state,
        inventory: data.items || [],
        statusCounts: data.statusCounts || {},
      });
    }
  }, [data])

  if (isLoading) {
    return <Page>{t('inventory.loading_text')}</Page>;
  }

  if (error) {
    return <Page>{t('inventory.error_loading_text')}</Page>;
  }

  const handleAddInventoryItem = async () => {
    const title = titleRef.current?.value.trim();
    const quantity = parseFloat(quantityRef.current?.value || 0);
    const unit = unitRef.current?.value;
    const minQuantityThreshold = parseFloat(minQuantityThresholdRef.current?.value || 0);

    if (!title) {
      toast.error(t('inventory.toast_item_name_required'));
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error(t('inventory.toast_quantity_positive_required'));
      return;
    }
    if (!unit) {
      toast.error(t('inventory.toast_unit_required'));
      return;
    }
    if (!minQuantityThreshold || minQuantityThreshold <= 0) {
      toast.error(t('inventory.toast_min_quantity_positive_required'));
      return;
    }
    if (minQuantityThreshold > quantity) {
      toast.error(t('inventory.toast_min_quantity_less_than_stock'));
      return;
    }

    try {
      const res = await addInventoryItem({
        title,
        quantity,
        unit,
        min_quantity_threshold: minQuantityThreshold,
      });

      if (res.status === 200) {
        toast.dismiss();
        toast.success(res.data.message);

        titleRef.current.value = "";
        quantityRef.current.value = "";
        unitRef.current.value = "pc";
        minQuantityThresholdRef.current.value = "";

        document.getElementById('modal-add-inventory-item').close();

        await mutate(APIURL);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('inventory.toast_default_error');
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  const handleUpdateInventoryItem = async () => {
    const title = updateTitleRef.current?.value.trim();
    const quantity = parseFloat(updateQuantityRef.current?.value || 0);
    const unit = updateUnitRef.current?.value;
    const minQuantityThreshold = parseFloat(updateMinQuantityThresholdRef.current?.value || 0);

    if(!selectedUpdateItem){
      toast.error(t('inventory.toast_invalid_request'));
      return;
    }
    if (!title) {
      toast.error(t('inventory.toast_item_name_required'));
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error(t('inventory.toast_quantity_positive_required'));
      return;
    }
    if (!unit) {
      toast.error(t('inventory.toast_unit_required'));
      return;
    }
    if (!minQuantityThreshold || minQuantityThreshold <= 0) {
      toast.error(t('inventory.toast_min_quantity_positive_required'));
      return;
    }
    if (minQuantityThreshold > quantity) {
      toast.error(t('inventory.toast_min_quantity_less_than_stock'));
      return;
    }

    try {
      const res = await updateInventoryItem({
        id: selectedUpdateItem,
        title,
        unit,
        min_quantity_threshold: minQuantityThreshold,
      });

      if (res.status === 200) {
        toast.dismiss();
        toast.success(res.data.message);

        updateTitleRef.current.value = "";
        updateQuantityRef.current.value = "";
        updateUnitRef.current.value = "pc";
        updateMinQuantityThresholdRef.current.value = "";
        setSelectedUpdateItem(null);

        document.getElementById('modal-update-inventory-item').close();

        await mutate(APIURL);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('inventory.toast_default_error');
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  const handleDeleteInventoryItem = async () => {
    if(!selectedDeletItem){
      toast.error(t('inventory.toast_invalid_request'));
      return;
    }

    try {
      const res = await deleteInventoryItem({
        id: selectedDeletItem
      });

      if (res.status === 200) {
        toast.dismiss();
        toast.success(res.data.message);

        setSelectedDeleteItem(null)

        document.getElementById('modal-delete-inventory-item').close();

        await mutate(APIURL);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('inventory.toast_default_error');
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  const handleAddItemStockMovement = async () => {
    const movementType = addStockMovementTypeRef.current?.value || null;
    const itemId = addStockMovementItemIdRef.current?.value || null;
    const quantity = parseFloat(addStockMovementQuantityRef.current?.value || "0");
    const note = addStockMovementNoteRef.current?.value?.trim();

    if(!itemId){
      toast.error(t('inventory.toast_invalid_request'));
      return;
    }

    if(!movementType){
      toast.error(t('inventory.toast_select_movement_type'));
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      toast.error(t('inventory.toast_invalid_quantity'));
      return;
    }

    try {
      const res = await addInventoryItemStockMovement({
        id: itemId,
        movementType,
        quantity,
        note
      });

      if (res.status === 200) {
        toast.dismiss();
        toast.success(res.data.message);

        addStockMovementTypeRef.current.value = 'IN'
        addStockMovementItemIdRef?.current.value == null;
        addStockMovementQuantityRef.current.value = "";
        addStockMovementNoteRef.current.value = "";

        document.getElementById("modal-add-inventory-stock-movement")?.close();

        await mutate(APIURL);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('inventory.toast_default_error');
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page>
      <div className="flex flex-wrap gap-4 flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h3 className="text-2xl">{t('inventory.title')}</h3>
          <Link
            to="dashboard"
            className='rounded-lg border-none b shadow-none transition active:scale-95 text-restro-text px-2 py-1 flex items-center gap-1 bg-restro-bg-gray hover:bg-restro-button-hover'
          >
            <IconCategory2 stroke={iconStroke} size={18} /> {t('inventory.dashboard')}
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="flex items-center justify-between">
            <div className="relative md:w-80">
              <IconSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                className="input input-sm input-bordered focus:outline-none focus:ring-1 focus-within:ring-gray-200 transition pl-8 pr-2 w-full rounded-lg text-gray-500 py-4 h-8"
                placeholder={t('inventory.search_placeholder')}
                value={state.search}
                onChange={(e) => {
                  setState({
                    ...state,
                    search: e.target.value,
                  });
                }}
              />
            </div>
            <div></div>
          </div>
          <button onClick={()=>{
              document.getElementById('modal-add-inventory-item').showModal();
          }}  className = "text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover">
            <IconPlus size={18} stroke={iconStroke}/>
            {t('inventory.add_stock_item')}
          </button>
          <Link
            to="stock-movements"
            className='rounded-lg border-none b shadow-none transition active:scale-95 text-restro-text px-2 py-1 flex items-center gap-1 bg-restro-bg-gray hover:bg-restro-button-hover'
          >
            <IconLogs stroke={iconStroke} size={18} /> {t('inventory.stock_movements')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {[
          {
            label: t('inventory.status_all'),
            icon: <IconBox stroke={1.5} className="text-gray-600" />,
            status: "all",
            count: state.inventory?.length || 0,
            border: "border-l-gray-400",
            countColor: "text-gray-600",
          },
          {
            label: t('inventory.status_in'),
            icon: <IconCarrot stroke={1.5} className="text-green-600" />,
            status: "in",
            count: state.statusCounts?.in,
            border: "border-l-restro-green",
            countColor: "text-restro-green",
          },
          {
            label: t('inventory.status_low'),
            icon: <IconAlertTriangle stroke={1.5} className="text-yellow-600" />,
            status: "low",
            count: state.statusCounts?.low,
            border: "border-l-yellow-600",
            countColor: "text-yellow-600",
          },
          {
            label: t('inventory.status_out'),
            icon: <IconCircleMinus stroke={1.5} className="text-red-600"/>,
            status: "out",
            count: state.statusCounts?.out,
            border: "border-l-red-600",
            countColor: "text-red-600",
          },
        ].map(({ label, icon, status, count, border, countColor }) => {
          const isSelected = selectedStatus === status;
          return (
            <div
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={clsx(
                "cursor-pointer flex items-center gap-4 px-4 py-4 rounded-xl border border-l-8 transition-all duration-200",
                border,
                isSelected
                  ? theme === 'black'
                    ? "bg-restro-card-iconbg/80 border-restro-border-dark-mode"
                    : "border-restro-green-light bg-gray-50"
                  : theme === 'black'
                    ? " border-restro-border-dark-mode"
                    : "border-restro-green-light"
              )}
            >
              <div className='p-3 rounded-lg  shadow-inner bg-restro-card-bg'>{icon}</div>
              <div>
                <div className={`text-sm font-medium ${theme === 'black' ? 'text-white' : 'text-gray-600'} `}>{label}</div>
                <div className={`text-lg font-bold ${countColor}`}>{count}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-[calc(100vh-260px)] overflow-auto w-[100%] mt-4">
       {(state.inventory || [])
        .filter((item) => {
          if (!state.search) return true;
          return item.title?.toLowerCase().includes(state.search.trim().toLowerCase());
        }).length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center h-full">
            <img
              src="/assets/illustrations/orders-not-found.webp"
              alt={t('inventory.no_items_image_alt')}
              className="w-1/2 md:w-60"
            />
            <p className='text-md text-restro-text'>{t('inventory.no_items_message')}</p>
          </div>
        ) :
        (<table className="table table-sm">
          <thead className='border sticky top-0 z-10 bg-restro-bg-gray border-restro-border-green'>
            <tr>
              <th className="text-start p-2.5">#</th>
              <th className="text-start">{t('inventory.table_item')}</th>
              <th className="text-start">{t('inventory.table_current_stock')}</th>
              <th className="text-start">{t('inventory.table_min_stock')}</th>
              <th className="text-start">{t('inventory.table_stock_status')}</th>
              <th className="text-start max-w-20">{t('inventory.table_updated_on')}</th>
              <th className="text-start">{t('inventory.table_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {
              (state.inventory || [])
              .filter((item) => {
                if (!state.search) return true;
                return item.title?.toLowerCase().includes(state.search.trim().toLowerCase());
              })
              .map((inventoryItem, i) => {
                const { id, title, quantity, unit, min_quantity_threshold, status, updated_at } = inventoryItem;
                return (
                  <tr key={id}>
                    <td>{state.inventory?.length - i}</td>
                    <td>
                      <p className="text-ellipsis line-clamp-2">{title}</p>
                    </td>
                    <td>
                      <p>
                        {quantity ? quantity : "-"} {unit}
                      </p>
                    </td>
                    <td>
                      <p>
                        {min_quantity_threshold ? min_quantity_threshold : "-"} {unit}
                      </p>
                    </td>
                    <td>
                      <span
                        className={`text-xs rounded-lg py-1 px-2 font-semibold
                          ${status === 'in' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : ''}
                          ${status === 'low' ? 'bg-yellow-100 dark:bg-yellow-600 text-yellow-600 dark:text-yellow-300' : ''}
                          ${status === 'out' ? 'bg-red-100 dark:bg-red-700 text-red-600 dark:text-red-200' : ''}
                        `}
                      >
                        {status === 'in' ? t('inventory.stock_status_in') :
                        status === 'low' ? t('inventory.stock_status_low') :
                        status === 'out' ? t('inventory.stock_status_out') : '-'}
                      </span>
                    </td>
                    <td>
                      {updated_at
                        ? moment.utc(updated_at).local().format("DD/MM/YYYY, h:mm A")
                        : "-"}
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className='m-1 text-restro-text hover:bg-restro-button-hover p-2 rounded-full'>
                          <IconDotsVertical size={18} stroke={iconStroke} />
                        </div>
                        <ul tabIndex={0} className='dropdown-content menu menu-sm bg-base-100 rounded-xl border w-56 z-[1] p-2 text-restro-text bg-restro-gray border-restro-border-green'>
                          <li>
                            <button
                              onClick={()=>{
                                requestAnimationFrame(() => {
                                  if (addStockMovementItemIdRef?.current) {
                                    addStockMovementItemIdRef.current.value = inventoryItem.id;
                                  }
                                });
                                document.getElementById('modal-add-inventory-stock-movement').showModal();
                              }}
                            ><IconPlus size={18} stroke={iconStroke} /> {t('inventory.dropdown_add_stock_movement')}</button>
                          </li>
                          <li>
                            <button
                             onClick={() => {
                              requestAnimationFrame(() => {
                                setSelectedUpdateItem(inventoryItem.id);
                                updateTitleRef.current.value = inventoryItem.title;
                                updateQuantityRef.current.value = inventoryItem.quantity;
                                updateUnitRef.current.value = inventoryItem.unit;
                                updateMinQuantityThresholdRef.current.value = inventoryItem.min_quantity_threshold;
                              });
                              document.getElementById('modal-update-inventory-item').showModal();
                            }}

                            ><IconPencil size={18}  stroke={iconStroke} /> {t('inventory.dropdown_update_item')}</button>
                          </li>
                          <li>
                            <button
                              onClick={()=>{
                                setSelectedDeleteItem(inventoryItem?.id || null)
                                document.getElementById('modal-delete-inventory-item').showModal();
                              }}
                              className="text-red-500"
                            ><IconTrash size={18} stroke={iconStroke} /> {t('inventory.dropdown_delete_item')}</button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>)}
      </div>
      {/* dialog: add stock items */}    
      <dialog id="modal-add-inventory-item" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <div className='flex justify-between items-center'>
            <h3 className="font-bold text-lg">{t('inventory.modal_add_title')}</h3>
            <button className='text-red-500 p-2 rounded-full bg-restro-bg-gray hover:bg-restro-button-hover'  onClick={() => document.getElementById('modal-add-inventory-item').close()}><IconX size={18} stroke={iconStroke}/></button>
          </div>

          {/* Title */}
          <div className="mt-4">
            <label htmlFor="item_title" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_item_name_label')}</label>
            <input ref={titleRef} type="text"  className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('inventory.form_item_name_placeholder')} />
          </div>

          <div className="mt-4 flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="item_unit" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_item_unit_label')}</label>
              <select ref={unitRef} className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'>
                <option value="pc">{t('inventory.form_item_unit_pc')}</option>
                <option value="kg">{t('inventory.form_item_unit_kg')}</option>
                <option value="g">{t('inventory.form_item_unit_g')}</option>
                <option value="l">{t('inventory.form_item_unit_l')}</option>
                <option value="ml">{t('inventory.form_item_unit_ml')}</option>
              </select>
            </div>
          </div>

          {/* Current Qty and Min Qty */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="item_qty" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_item_qty_label')}</label>
              <input ref={quantityRef} type="number"  className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('inventory.form_item_qty_placeholder')} />
            </div>
            <div className="flex-1">
              <label htmlFor="low_stock_qty" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_item_min_qty_label')}</label>
              <input ref={minQuantityThresholdRef} type="number" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('inventory.form_item_min_qty_placeholder')} />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action w-full">
            <form method="dialog" className="w-full">
              <button
                type="button"
                onClick={handleAddInventoryItem}
                className='flex justify-center w-full rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('inventory.form_save_button')}</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* dialog: update item */}
      <dialog id="modal-update-inventory-item" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <div className='flex justify-between items-center'>
            <h3 className="font-bold text-lg">{t('inventory.modal_update_title')}</h3>
            <button className='text-red-600 p-2 rounded-full bg-restro-bg-gray hover:bg-restro-button-hover' onClick={() => document.getElementById('modal-update-inventory-item').close()}><IconX size={18} stroke={iconStroke}/></button>
          </div>

          {/* Title */}
          <div className="mt-4">
            <label htmlFor="item_title" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_update_item_name_label')}</label>
            <input ref={updateTitleRef} type="text" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('inventory.form_item_name_placeholder')} />
          </div>

          <div className="mt-4 flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="item_unit" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_update_unit_label')}</label>
              <select ref={updateUnitRef} disabled className='disabled:cursor-not-allowed text-sm w-full border rounded-lg px-4 py-2 border-restro-border-green dark:bg-black focus:outline-restro-border-green' >
                <option value="pc">{t('inventory.form_item_unit_pc')}</option>
                <option value="kg">{t('inventory.form_item_unit_kg')}</option>
                <option value="g">{t('inventory.form_item_unit_g')}</option>
                <option value="l">{t('inventory.form_item_unit_l')}</option>
                <option value="ml">{t('inventory.form_item_unit_ml')}</option>
              </select>
            </div>
          </div>

          {/* Current Qty and Min Qty */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="item_qty" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_update_qty_label')}</label>
              <input ref={updateQuantityRef} type="number" disabled className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('inventory.form_update_qty_placeholder')} />
            </div>
            <div className="flex-1">
              <label htmlFor="low_stock_qty" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_update_min_qty_label')}</label>
              <input ref={updateMinQuantityThresholdRef} type="number" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('inventory.form_update_min_qty_placeholder')} />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action w-full">
            <form method="dialog" className="w-full">
              <button
                type="button"
                onClick={() => {
                  handleUpdateInventoryItem()
                }}
                className='flex w-full justify-center rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('inventory.form_save_button')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: update item */}

      {/* dialog: add stock */}
      <dialog id="modal-add-inventory-stock-movement" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <div className='flex justify-between items-center'>
            <h3 className="font-bold text-lg">{t('inventory.modal_add_stock_movement_title')}</h3>
            <button  className='text-red-600 p-2 rounded-full hover:bg-restro-button-hover' onClick={() => document.getElementById('modal-add-inventory-stock-movement').close()}><IconX size={18} stroke={iconStroke}/></button>
          </div>

          <div className="mt-4">
            <label htmlFor="movement_type" className="mb-1 block text-gray-500 text-sm">
              {t('inventory.modal_add_stock_movement_type')}
            </label>
            <select
              ref={addStockMovementTypeRef}
              name="movement_type"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
              defaultValue="IN"
            >
              <option value="IN">{t('inventory.movement_type_in')}</option>
              <option value="OUT">{t('inventory.movement_type_out')}</option>
              <option value="WASTAGE">{t('inventory.movement_type_wastage')}</option>
            </select>
          </div>

          <div className="mt-4">
            <input type="hidden" ref={addStockMovementItemIdRef} />
            <label htmlFor="add_quantity" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_add_stock_qty_label')}</label>
            <input
              ref={addStockMovementQuantityRef}
              type="number"
              name="add_quantity"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' 
              placeholder={t('inventory.form_add_stock_qty_placeholder')}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="add_notes" className="mb-1 block text-gray-500 text-sm">{t('inventory.form_add_stock_notes_label')}</label>
            <textarea
              ref={addStockMovementNoteRef}
              name="add_notes"
              rows={4}
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green resize-none'
              placeholder={t('inventory.form_add_stock_notes_placeholder')}
            />
          </div>

          <div className="modal-action w-full">
            <form method="dialog" className="w-full">
              <button
                type="button"
                onClick={handleAddItemStockMovement}
                className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white w-full border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t('inventory.form_save_button')}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: add stock */}

      {/* dialog: delete inventory item */}
      <dialog id="modal-delete-inventory-item" className="modal">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('inventory.modal_delete_title')}</h3>
          <p className="py-4">
            {t('inventory.modal_delete_confirm')}
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('inventory.modal_delete_cancel')}</button>
              <button
                onClick={() => {
                  handleDeleteInventoryItem();
                }}
                className="ml-2 rounded-lg btn hover:bg-red-700 bg-red-600 text-white"
              >
                {t('inventory.modal_delete_confirm_button')}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: delete inventory item */}


    </Page>
  );
}
