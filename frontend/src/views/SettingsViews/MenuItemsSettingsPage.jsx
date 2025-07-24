import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Page from "../../components/Page";
import { IconCarrot, IconEye, IconEyeOff, IconPencil, IconPlus, IconToggleLeft, IconTrash } from "@tabler/icons-react";
import { iconStroke } from "../../config/config";
import { useCategories, useTaxes } from "../../controllers/settings.controller";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { Link, useNavigate } from "react-router-dom";
import { addMenuItem, changeMenuItemVisibility, deleteMenuItem, useMenuItems } from "../../controllers/menu_item.controller";
import { useTheme } from "../../contexts/ThemeContext";
import clsx from "clsx";
export default function MenuItemsSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const titleRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const netPriceRef = useRef();
  const taxIdRef = useRef();
  const categoryIdRef = useRef();
  const {theme} = useTheme();

  const {
    APIURL: APIURLCategories,
    data: categories,
    error: errorCategories,
    isLoading: isLoadingCategories,
  } = useCategories();

  const { APIURL: APIURLTaxes, data:taxes, error:errorTaxes, isLoading:isLoadingTaxes } = useTaxes();

  const {APIURL,data: menuItems,error,isLoading} = useMenuItems();

  if (isLoadingCategories || isLoadingTaxes || isLoading) {
    return <Page>{t('menu_items.please_wait')}</Page>;
  }

  if (errorCategories || errorTaxes || error) {
    return <Page>{t('menu_items.error_loading_details')}</Page>;
  }

  async function btnAdd() {
    const title = titleRef.current.value;
    const description = descriptionRef.current.value || null;
    const price = priceRef.current.value;
    const netPrice = netPriceRef.current.value || null;
    const categoryId = categoryIdRef.current.value || null;
    const taxId = taxIdRef.current.value || null;

    if(!title) {
      toast.error(t,('menu_items.please_enter_title'));
      return;
    }

    if(price < 0) {
      toast.error(t('menu_items.please_provide_valid_price'));
      return;
    }

    try {
      toast.loading(t('menu_items.please_wait'));
      const res = await addMenuItem(title, description, price, netPrice, categoryId, taxId);

      if(res.status == 200) {
        titleRef.current.value = null;
        descriptionRef.current.value = null;
        priceRef.current.value = null;
        netPriceRef.current.value = null;
        categoryIdRef.current.value = "";
        taxIdRef.current.value = "";

        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error.response.data.message || t('menu_items.something_went_wrong');
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  }

  const btnDelete = async (id) => {
    const isConfirm = window.confirm(t('menu_items.process_irreversible'));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t('menu_items.please_wait'));
      const res = await deleteMenuItem(id);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('menu_items.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnShowUpdate = (id) => {
    navigate(`/dashboard/settings/menu-items/${id}`);
  }

  const btnChangeItemVisibilty = async (id, isEnabled) => {
    try {
      toast.loading(t('menu_items.please_wait'));
      const res = await changeMenuItemVisibility(id, isEnabled);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('menu_items.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page className="px-8 py-6">
      <div className="flex md:items-center flex-col md:flex-row gap-2">
        <h3 className="text-3xl font-light mr-6">{t('menu_items.title')}</h3>
        <button
          onClick={() => document.getElementById("modal-add").showModal()}
          className = 'rounded-lg border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 mr-4 w-fit text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover'
        >
          <IconPlus size={22} stroke={iconStroke} /> {t('menu_items.new')}
        </button>
        <Link
          to="categories"
         className='rounded-lg border transition active:scale-95 hover:shadow-lg px-3 py-1 flex items-center gap-1 mr-4 w-fit text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover'
        >
          {t('menu_items.categories')}
        </Link>
      </div>

      <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {menuItems.map((menuItem, index) => {
          const { id, title, price, net_price, tax_id, category_id, category_title, addons, variants, is_enabled } = menuItem;

          return (
            <div
              key={id}
              className={`px-4 py-3 rounded-2xl flex flex-wrap items-center gap-2 text-sm border border-restro-border-green ${!is_enabled ? 'bg-gray-200 dark:bg-gray-900 opacity-50' : ''}`}
            >
              <div className = 'w-12 h-12 rounded-full flex items-center justify-center text-gray-400 dark:text-white bg-restro-bg-gray border-restro-border-green'>
                <IconCarrot stroke={iconStroke} />
              </div>
              <div className="flex-1">
                <p>
                  {title} - {price}
                </p>
                <p className="text-gray-400 text-xs">
                  {category_title}
                </p>
                {variants.length > 0 && <p className="text-gray-400 text-xs">
                  {variants.length} {t('menu_items.variants')}
                </p>}
              </div>
              <div className="flex gap-0">
                <button
                  onClick={() => {
                    btnChangeItemVisibilty(id, !is_enabled);
                  }}
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text',
                    {
                      // Visibility ON
                      'hover:bg-restro-button-hover': is_enabled && theme === 'light',
                      'text-white': is_enabled && theme === 'black',
                      // Visibility OFF
                      'hover:bg-restro-button-hover': !is_enabled && theme === 'light',
                      'text-white': !is_enabled && theme === 'black',
                    }
                  )}
                >
                  {is_enabled ? (
                    <IconEye stroke={iconStroke} />
                  ) : (
                    <IconEyeOff stroke={iconStroke} />
                  )}
                </button>
                <button
                  onClick={() => {
                    btnShowUpdate(id);
                  }}
                  className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text hover:bg-restro-button-hover'
                >
                  <IconPencil stroke={iconStroke} />
                </button>
                <button
                  onClick={() => {
                    btnDelete(id);
                  }}
                  className='w-8 h-8 rounded-full flex items-center justify-center text-restro-red transition active:scale-95 hover:bg-restro-button-hover'
                >
                  <IconTrash stroke={iconStroke} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* add dialog */}
      <dialog id="modal-add" className="modal modal-bottom sm:modal-middle ">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('menu_items.add_new_item')}</h3>

          <div className="mt-4">
            <label htmlFor="title" className={`mb-1 block text-gray-500 text-sm font-medium`}>
              {t('menu_items.item_title')}
            </label>
            <input
              ref={titleRef}
              type="text"
              name="title"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
              placeholder={t('menu_items.enter_item_title')}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="mb-1 block text-gray-500 text-sm font-medium">
              {t('menu_items.item_description')}
              <span className="text-xs text-gray-500 ml-1">{t('menu_items.max_chars')}</span>
            </label>
            <textarea
              ref={descriptionRef}
              name="description"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
              placeholder={t('menu_items.enter_item_description')}
              rows="6"
              maxLength={500}
            />
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label
                htmlFor="price"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t('menu_items.item_price')}
              </label>
              <input
                ref={priceRef}
                type="number"
                name="price"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t('menu_items.enter_item_price')}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="nprice"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t('menu_items.item_net_price')}
              </label>
              <input
                ref={netPriceRef}
                type="number"
                name="nprice"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t('menu_items.enter_item_net_price')}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label
                htmlFor="category"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t('menu_items.item_category')}
              </label>
              <select
                ref={categoryIdRef}
                name="category"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t('menu_items.select_category')}
              >
                <option value="">{t('menu_items.none')}</option>
                {
                  categories.map((category, index)=>{
                    return <option value={category.id} key={category.id}>{category.title}</option>
                  })
                }
              </select>
            </div>
            <div className="flex-1">
              <label
                htmlFor="tax"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t('menu_items.item_tax')}
              </label>
              <select
                ref={taxIdRef}
                name="tax"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t('menu_items.select_tax')}
              >
                <option value="">{t('menu_items.none')}</option>
                {
                  taxes.map((tax, index)=>{
                    return <option value={tax.id} key={tax.id}>{tax.title} - {tax.rate}% ({tax.type})</option>
                  })
                }
              </select>
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
                {t('menu_items.close')}
              </button>
              <button
                onClick={() => {
                  btnAdd();
                }}
                className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t('menu_items.save')}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* add dialog */}
    </Page>
  );
}
