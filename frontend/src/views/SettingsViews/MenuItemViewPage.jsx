import React, { useEffect, useRef, useState } from "react";
import Page from "../../components/Page";
import { Link, useParams } from "react-router-dom";
import { addMenuItemAddon, addMenuItemRecipeItem, addMenuItemVariant, deleteMenuItemAddon, deleteMenuItemVariant, deleteRecipeItem, getMenuItem, removeMenuItemPhoto, updateMenuItem, updateMenuItemAddon, updateMenuItemRecipeItem, updateMenuItemVariant, uploadMenuItemPhoto, useMenuItem } from "../../controllers/menu_item.controller";
import { useCategories, useTaxes } from "../../controllers/settings.controller";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { IconCarrot, IconChevronDown, IconPencil, IconTrash, IconUpload } from "@tabler/icons-react";
import { iconStroke } from "../../config/config"
import imageCompression from "browser-image-compression";
import { getImageURL } from "../../helpers/ImageHelper";
import { useTranslation } from "react-i18next";
import AsyncSelect from "react-select/async"
import { useTheme } from "../../contexts/ThemeContext";

export default function MenuItemViewPage() {
  const { t } = useTranslation();
  const {theme} = useTheme();
  const params = useParams();
  const itemId = params.id;

  const titleRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const netPriceRef = useRef();
  const taxIdRef = useRef();
  const categoryIdRef = useRef();

  const variantTitleRef = useRef();
  const variantPriceRef = useRef();

  const variantIdRef = useRef();
  const variantTitleUpdateRef = useRef();
  const variantPriceUpdateRef = useRef();

  const addonTitleRef = useRef();
  const addonPriceRef = useRef();

  const addonIdRef = useRef();
  const addonTitleUpdateRef = useRef();
  const addonPriceUpdateRef = useRef();

  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [activeAddRecipeItemTab, setActiveAddRecipeItemTab] = useState("item");
  const quantityRef = useRef();
  const [selectedRecipeData, setSelectedRecipeData] = useState({
    ingredient: null, // selected ingredient (inventory item)
    selectedBase: null, // can be item, variant, or addon
  });

  const [editRecipeData, setEditRecipeData] = useState({
    id: null,
    ingredient: null,
    quantity: null,
    selectedBase: null,
    baseType: "item", // can be item, variant, or addon
  });

  const quantityEditRef = useRef(null);

  const {
    APIURL: APIURLCategories,
    data: categories,
    error: errorCategories,
    isLoading: isLoadingCategories,
  } = useCategories();

  const {
    APIURL: APIURLTaxes,
    data: taxes,
    error: errorTaxes,
    isLoading: isLoadingTaxes,
  } = useTaxes();

  // const { APIURL, data: menuItem, error, isLoading } = useMenuItem(itemId);
  const [state, setState] = useState({
    menuItem: {},
    inventoryItems:[],
    variants:[],
    addons:[],
    recipeItems:[]
  })
 
  useEffect(()=>{
    _init(itemId)
  },[itemId]);

  const _init = async (id) => {
    try {
      const res = await getMenuItem(id);
      if(res.status == 200) {
       setTimeout(() => {
        if(taxIdRef.current){
          taxIdRef.current.value = res.data?.formattedMenuItem?.tax_id;
        }

        if(categoryIdRef.current){
          categoryIdRef.current.value = res.data?.formattedMenuItem?.category_id;
        }
       }, 100)

        setState({
          ...state,
          menuItem: res.data?.formattedMenuItem || {},
          variants: res.data?.formattedMenuItem?.variants || [],
          addons: res.data?.formattedMenuItem?.addons || [],
          recipeItems: res.data?.formattedMenuItem?.recipeItems || [],
          inventoryItems: res.data?.inventoryItems || []
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoadingCategories) {
    return <Page>{t('menu_item.please_wait')}</Page>;
  }

  if (errorCategories) {
    return <Page>{t('menu_item.error_loading_details')}</Page>;
  }

  if (isLoadingTaxes) {
    return <Page>{t('menu_item.please_wait')}</Page>;
  }

  if (errorTaxes) {
    return <Page>{t('menu_item.error_loading_details')}</Page>;
  }

  // if (isLoading) {
  //   return <Page>{t('menu_item.please_wait')}</Page>;
  // }

  // if (error) {
  //   return <Page>{t('menu_item.error_loading_details')}</Page>;
  // }

  const {
    id,
    title,
    description,
    category_id,
    category_title,
    tax_id,
    tax_title,
    tax_rate,
    tax_type,
    price,
    net_price,
    addons,
    variants,
    image
  } = state.menuItem;
  const imageURL = image ? getImageURL(image) : null;


  async function btnSave() {
    const title = titleRef.current.value;
    const description = descriptionRef.current.value;
    const price = priceRef.current.value;
    const netPrice = netPriceRef.current.value || null;
    const categoryId = categoryIdRef.current.value || null;
    const taxId = taxIdRef.current.value || null;

    if(!title) {
      toast.error(t('menu_item.provide_title_error'));
      return;
    }

    if(price < 0) {
      toast.error(t('menu_item.provide_valid_price_error'));
      return;
    }

    try {
      toast.loading(t('menu_item.please_wait'));
      const res = await updateMenuItem(id, title, description, price, netPrice, categoryId, taxId);

      if(res.status == 200) {
        await _init(itemId);
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

  const btnVariantDelete = async (variantId) => {
    const isConfirm = window.confirm(t('menu_item.confirm_delete'));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t('menu_item.please_wait'));
      const res = await deleteMenuItemVariant(id, variantId);

      if(res.status == 200) {
        await _init(itemId);
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

  const btnAddonDelete = async (addonId) => {
    const isConfirm = window.confirm(t('menu_item.confirm_delete'));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t('menu_item.please_wait'));
      const res = await deleteMenuItemAddon(id, addonId);

      if(res.status == 200) {
        await _init(itemId);
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

  async function btnAddVariant() {
    const variantTitle = variantTitleRef.current.value;
    const variantPrice = variantPriceRef.current.value || 0;

    if(!variantTitle) {
      toast.error(t('menu_item.provide_variant_title_error'));
      return;
    }
    if(variantPrice < 0) {
      toast.error(t('menu_item.provide_valid_variant_price_error'));
      return;
    }

    try {
      toast.loading(t('menu_item.please_wait'));
      const res = await addMenuItemVariant(id, variantTitle, variantPrice);

      if(res.status == 200) {
        variantTitleRef.current.value = null;
        variantPriceRef.current.value = null;

        await _init(itemId);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('menu_items.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  const btnShowVariantUpdate = (variantId, title, price) => {
    variantIdRef.current.value = variantId;
    variantTitleUpdateRef.current.value = title;
    variantPriceUpdateRef.current.value = price;
    document.getElementById('modal-update-variant').showModal()
  };

  async function btnUpdateVariant() {
    const variantId = variantIdRef.current.value;
    const variantTitle = variantTitleUpdateRef.current.value;
    const variantPrice = variantPriceUpdateRef.current.value || 0;

    if(!variantTitle) {
      toast.error(t('menu_item.provide_variant_title_error'));
      return;
    }
    if(variantPrice < 0) {
      toast.error(t('menu_item.provide_valid_variant_price_error'));
      return;
    }

    try {
      toast.loading(t('menu_item.please_wait'));
      const res = await updateMenuItemVariant(id, variantId, variantTitle, variantPrice);

      if(res.status == 200) {
        variantIdRef.current.value = null;
        variantTitleUpdateRef.current.value = null;
        variantPriceUpdateRef.current.value = null;

        await _init(itemId);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('menu_items.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  async function btnAddAddon() {
    const addonTitle = addonTitleRef.current.value;
    const addonPrice = addonPriceRef.current.value || 0;

    if(!addonTitle) {
      toast.error(t('menu_item.provide_addon_title_error'));
      return;
    }
    if(addonPrice < 0) {
      toast.error(t('menu_item.provide_valid_addon_price_error'));
      return;
    }

    try {
      toast.loading(t('menu_item.please_wait'));
      const res = await addMenuItemAddon(id, addonTitle, addonPrice);

      if(res.status == 200) {
        addonTitleRef.current.value = null;
        addonPriceRef.current.value = null;

        await _init(itemId);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('menu_items.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  const btnShowAddonUpdate = (addonId, title, price) => {
    addonIdRef.current.value = addonId;
    addonTitleUpdateRef.current.value = title;
    addonPriceUpdateRef.current.value = price;
    document.getElementById('modal-update-addon').showModal()
  };

  async function btnUpdateAddon() {
    const addonId = addonIdRef.current.value;
    const addonTitle = addonTitleUpdateRef.current.value;
    const addonPrice = addonPriceUpdateRef.current.value || 0;

    if(!addonTitle) {
      toast.error(t('menu_item.provide_addon_title_error'));
      return;
    }
    if(addonPrice < 0) {
      toast.error(t('menu_item.provide_valid_addon_price_error'));
      return;
    }

    try {
      toast.loading(t('menu_item.please_wait'));
      const res = await updateMenuItemAddon(id, addonId, addonTitle, addonPrice);

      if(res.status == 200) {
        addonIdRef.current.value = null;
        addonTitleUpdateRef.current.value = null;
        addonPriceUpdateRef.current.value = null;

        await _init(itemId);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('menu_items.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  const handleFileChange = async (e) => {

    const file = e.target.files[0];

    if(!file) {
      return;
    }

    // compress image
    try {
      toast.loading(t('menu_item.please_wait'));
      const compressedImage = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      })

      const formData = new FormData();
      formData.append("image", compressedImage);

      const res = await uploadMenuItemPhoto(itemId, formData);
      if(res.status == 200) {
        toast.dismiss();
        toast.success(res.data.message);

        // update the image state
        const imagePath = res.data.imageURL;
        await _init(itemId);
        location.reload();
      }

    } catch (error) {
      console.error(error);
      toast.dismiss();
      const message = error?.response?.data?.message || t('menu_item.upload_image_error');
      toast.error(message)
    }
  }

  const btnRemoveMenuItemImage = async () => {
    const isConfirm = window.confirm(t('menu_item.remove_image_confirm'));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t('menu_item.please_wait'));

      const res = await removeMenuItemPhoto(itemId);
      if(res.status == 200) {
        toast.dismiss();
        toast.success(res.data.message);
        await _init(itemId);
        location.reload();
      }

    } catch (error) {
      console.error(error);
      toast.dismiss();
      const message = error?.response?.data?.message || t('menu_items.something_went_wrong');
      toast.error(message)
    }
  }


  const getBaseIdOptions = () => {
    const data =
      activeAddRecipeItemTab == "variant"
        ? state.variants
        : activeAddRecipeItemTab == "addon"
        ? state.addons
        : [];

    return data.map((item) => ({
      label: item.title,
      value: item.id,
    }));
  };

  const getIngredientsOptions = () => {
    return state.inventoryItems?.map((item) => ({
      label: item.title,
      value: item.id,
      unit:item.unit
    }));
  };

  async function btnAddRecipeItem() {
    const qty = parseFloat(quantityRef.current?.value);

    if (!selectedRecipeData.ingredient) {
      toast.error("Please select an ingredient.");
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    if ((activeAddRecipeItemTab === "variant" || activeAddRecipeItemTab === "addon") && !selectedRecipeData.selectedBase) {
      toast.error("Please select a variant or addon.");
      return;
    }

    let variantId = 0;
    let addonId = 0;

    if(activeAddRecipeItemTab == 'variant'){
      variantId = selectedRecipeData?.selectedBase?.id;
    }else if(activeAddRecipeItemTab == 'addon'){
      addonId = selectedRecipeData?.selectedBase?.id;
    }

    try {
      toast.loading("Please wait...");

      const res = await addMenuItemRecipeItem({
        menuItemId: itemId,
        variantId,
        addonId,
        ingredientId: selectedRecipeData?.ingredient?.value,
        quantity:qty,
      });

      if (res.status === 200) {
        toast.dismiss();
        toast.success(res.data.message);

        quantityRef.current.value = null;
        setSelectedRecipeData({
          ingredient:null,
          selectedBase:null
        });
        setActiveAddRecipeItemTab('item')

        document.getElementById('modal-add-recipe-item').close();

        await _init(itemId);
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong!";
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  async function btnUpdateRecipeItem() {
    const qty = parseFloat(quantityEditRef.current?.value);

    if (!editRecipeData.ingredient) {
      toast.error("Please select an ingredient.");
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    if ((editRecipeData.baseType === "variant" || editRecipeData.baseType === "addon") && !editRecipeData.selectedBase) {
      toast.error("Please select a variant or addon.");
      return;
    }

    let variantId = 0;
    let addonId = 0;

    if (editRecipeData.baseType === "variant") {
      variantId = editRecipeData?.selectedBase?.id;
    } else if (editRecipeData.baseType === "addon") {
      addonId = editRecipeData?.selectedBase?.id;
    }

    try {
      toast.loading("Updating...");

      const res = await updateMenuItemRecipeItem({
        id: editRecipeData.id,
        menuItemId: itemId,
        variantId,
        addonId,
        ingredientId: editRecipeData?.ingredient?.value,
        quantity: qty,
      });

      if (res.status === 200) {
        toast.dismiss();
        toast.success(res.data.message);

        document.getElementById("modal-edit-recipe-item").close();
        await _init(itemId);
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong!";
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  }

  const btnDeleteRecipeItem = async (recipeItemId, recipeItemVariantId, recipeItemAddonId) => {
    const isConfirm = window.confirm("Are you sure! This process is irreversible!");

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading("Please wait...");
      const res = await deleteRecipeItem(itemId, recipeItemId, recipeItemVariantId, recipeItemAddonId);

      if(res.status == 200) {
        await _init(itemId);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong!";
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page className="px-4 md:px-8 py-3 md:py-6">
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <Link to="/dashboard/settings">{t('navbar.settings')}</Link>
          </li>
          <li>
            <Link to="/dashboard/settings/menu-items">{t('menu_items.title')}</Link>
          </li>
          <li>{title}</li>
        </ul>
      </div>

      <div className="my-6 flex gap-6 flex-col lg:flex-row">
        <div className="">
          <div className='relative w-32 h-32 md:w-64 md:h-64 rounded-2xl flex items-center justify-center text-2xl mb-4 text-restro-text dark:text-white bg-restro-bg-gray border-restro-border-green'>
            {
              image ? <div className="w-full h-full relative top-0 left-0">
                <img src={imageURL} alt={title} className="w-full h-full absolute top-0 left-0 rounded-2xl object-cover" />
              </div>:
              <p className="absolute"><IconCarrot stroke={iconStroke} /></p>
            }

            {/* upload image options */}
            <div className="absolute bottom-2 md:bottom-auto md:top-4 md:right-4 flex items-center gap-2">
              <label htmlFor="file" className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-restro-gray p-1 rounded-full shadow cursor-pointer hover:bg-restro-button-hover z-10 border border-restro-border-green text-restro-text">
                <IconUpload stroke={iconStroke} size={18} />
                <input
                  onChange={handleFileChange}
                  type="file"
                  name="file"
                  id="file"
                  className="hidden"
                  accept="image/*"
                />
              </label>

              {uploadedPhoto && (
                <button
                  onClick={btnRemoveMenuItemImage}
                  className="flex items-center justify-center w-9 h-9 rounded-full shadow cursor-pointer transition active:scale-95 text-restro-red hover:bg-restro-button-hover"
                >
                  <IconTrash stroke={iconStroke} size={18} />
                </button>
              )}
            </div>

            {/* upload image options */}
          </div>
          <p>{t('menu_item.price')}: {price}</p>
          {net_price ? (
            <p className={`text-sm text-gray-500`}>{t('menu_item.net_price')}: {net_price}</p>
          ): <></>}
          {category_id ? (
            <p className="text-sm text-gray-500">{t('menu_item.category')}: {category_title}</p>
          ):<></>}
          {tax_id && (
            <p className="text-sm text-gray-500">
              {t('menu_item.tax')}: {tax_title} - {tax_rate}% ({tax_type})
            </p>
          )}

          <button onClick={btnSave} className='mt-6 w-full rounded-lg transition active:scale-95 text-white hover:shadow-lg px-4 py-2 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover' >{t('menu_item.save')}</button>
        </div>
        <div className="flex-1">
          <div className="">
            <label htmlFor="title" className='text-sm mb-1 block text-restro-text'>
              {t('menu_item.title')}
            </label>
            <input
              ref={titleRef}
              defaultValue={title}
              type="text"
              name="title"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray'
              placeholder={t('menu_items.enter_item_title')}
            />
          </div>

          <div className="mt-4">
          <label htmlFor="description" className={`text-sm mb-1 block font-medium ${theme === 'black' ? 'text-gray-400' : ' text-gray-500'}`}>
            {t('menu_item.description')}
            <span className="text-xs text-gray-500 ml-1">{t('menu_items.max_chars')}</span>
          </label>
            <textarea
              ref={descriptionRef}
              defaultValue={description}
              name="description"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray'
              placeholder={t('menu_items.enter_item_description')}
              rows="6"
              maxLength={500}
            />
          </div>

          <div className="flex gap-4 w-full my-4 flex-col lg:flex-row">
            <div className="flex-1">
              <label
                htmlFor="price"
                className={`text-sm mb-1 block ${theme === 'black' ? 'text-gray-400' : ' text-gray-500'}`}
              >
                {t('menu_item.price')}
              </label>
              <input
                ref={priceRef}
                defaultValue={price}
                type="number"
                name="price"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray'
                placeholder={t('menu_items.enter_item_price')}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="nprice"
                className={`text-sm mb-1 block ${theme === 'black' ? 'text-gray-400' : ' text-gray-500'}`}
              >
                {t('menu_item.net_price')}
              </label>
              <input
                ref={netPriceRef}
                type="number"
                name="nprice"
                defaultValue={net_price}
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray'
                placeholder={t('menu_items.enter_item_net_price')}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full my-4 flex-col lg:flex-row">
            <div className="flex-1">
              <label
                htmlFor="category"
                className={`text-sm mb-1 block ${theme === 'black' ? 'text-gray-400' : ' text-gray-500'}`}
              >
                {t('menu_item.category')}
              </label>
              <select
                ref={categoryIdRef}
                defaultValue={category_id}
                name="category"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray'
                placeholder={t('menu_item.category')}
              >
                <option value="">{t('menu_item.none')}</option>
                {categories.map((category, index) => {
                  return (
                    <option value={category.id} key={category.id}>
                      {category.title}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="tax" className={`text-sm mb-1 block ${theme === 'black' ? 'text-gray-400' : ' text-gray-500'}`}>
                {t('menu_item.tax')}
              </label>
              <select
                ref={taxIdRef}
                name="tax"
                defaultValue={tax_id}
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray'
                placeholder={t('menu_item.tax')}
              >
                <option value="">{t('menu_item.none')}</option>
                {taxes.map((tax, index) => {
                  return (
                    <option value={tax.id} key={tax.id}>
                      {tax.title} - {tax.rate}% ({tax.type})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* variants */}
          <div className={`collapse collapse-arrow mt-6 border dark:rounded-lg ${theme === 'black' ? 'border-restro-border-dark-mode' : 'bg-gray-50 border-restro-green-light'}`}>
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              {t('menu_item.show_variants')}
            </div>
            <div className="collapse-content flex flex-col">
              {
                state.variants?.map((variant, index)=>{
                  return <div key={variant.id} className={`rounded-2xl flex items-center justify-between transition p-2 cursor-pointer ${theme === 'black' ? 'hover:bg-restro-card-iconbg border-restro-border-dark-mode ' : 'hover:bg-gray-100'}`}>
                    <div className="flex-1">
                      <p>{variant.title}</p>
                      <p className="text-xs text-gray-500">{t('menu_item.price')}: {variant.price}</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          btnShowVariantUpdate(variant.id, variant.title, variant.price);
                        }}
                        className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text hover:bg-restro-button-hover'>
                        <IconPencil stroke={iconStroke} />
                      </button>
                      <button
                        onClick={() => {
                          btnVariantDelete(variant.id);
                        }}
                        className='w-8 h-8 rounded-full flex items-center justify-center text-red-500 transition active:scale-95 hover:bg-restro-button-hover'
                      >
                        <IconTrash stroke={iconStroke} />
                      </button>
                    </div>
                  </div>
                })
              }

              <button onClick={()=>document.getElementById('modal-add-variant').showModal()} className="btn btn-sm mt-4 rounded-xl bg-restro-bg-gray hover:bg-restro-button-hover">{t('menu_item.add_variant')}</button>
            </div>
          </div>
          {/* variants */}

          {/* addons */}
          <div className={`collapse collapse-arrow mt-6 border dark:rounded-lg ${theme === 'black' ? 'border-restro-border-dark-mode' : 'bg-gray-50 border-restro-green-light'}`}>
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              {t('menu_item.show_addons')}
            </div>
            <div className="collapse-content flex flex-col">
              {
                state.addons?.map((addon, index)=>{
                  return <div key={addon.id} className={`rounded-2xl flex items-center justify-between transition p-2 cursor-pointer ${theme === 'black' ? 'hover:bg-restro-card-iconbg border-restro-border-dark-mode ' : 'hover:bg-gray-100'}`}>
                    <div className="flex-1">
                      <p>{addon.title}</p>
                      <p className="text-xs text-gray-500">{t('menu_item.price_increase')}: +{addon.price}</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          btnShowAddonUpdate(addon.id, addon.title, addon.price);
                        }}
                        className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text hover:bg-restro-button-hover'
                      >
                        <IconPencil stroke={iconStroke} />
                      </button>
                      <button
                        onClick={() => {
                          btnAddonDelete(addon.id);
                        }}
                        className='w-8 h-8 rounded-full flex items-center justify-center text-red-500 transition active:scale-95hover:bg-restro-button-hover'
                      >
                        <IconTrash stroke={iconStroke} />
                      </button>
                    </div>
                  </div>
                })
              }
              <button onClick={()=>document.getElementById('modal-add-addon').showModal()} className="btn btn-sm mt-4 rounded-xl bg-restro-bg-gray hover:bg-restro-button-hover">{t('menu_item.add_addon')}</button>
            </div>
          </div>
          {/* addons */}

          {/* recipe */}
          <div className={`collapse collapse-arrow mt-6 border dark:rounded-lg ${theme === 'black' ? 'border-restro-border-dark-mode' : 'bg-gray-50 border-restro-green-light'}`}>
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              Recipe Items
            </div>
            <div className="collapse-content flex flex-col">
              {
                state.recipeItems?.map((item, index)=>{
                  return <div key={item.id} className={`rounded-2xl flex items-center justify-between transition p-2 cursor-pointer ${theme === 'black' ? 'hover:bg-restro-card-iconbg border-restro-border-dark-mode ' : 'hover:bg-gray-100'}`}>
                    <div className="flex-1">
                      <p className="flex items-center">
                        {item.ingredient_title}
                        {item.variant_title && <span className={`ml-2 px-2 text-xs rounded-full bg-gray-200`}>{item.variant_title}</span>}
                        {item.addon_title && <span className={`ml-2 px-2 text-xs rounded-full ${theme === 'black' ? 'bg-restro-gray-dark-mode text-gray-400' :'bg-gray-200'}`}>{item.addon_title}</span>}
                      </p>
                      <p className="text-xs text-gray-500">({item.quantity} {item.unit})</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setEditRecipeData({
                            id: item.id,
                            quantity: item.quantity,
                            ingredient: {
                              value: item.inventory_item_id,
                              label: item.ingredient_title,
                              unit: item.unit
                            },
                            selectedBase: item.variant_id
                              ? { id: item.variant_id, label: item.variant_title }
                              : item.addon_id
                                ? { id: item.addon_id, label: item.addon_title }
                                : null,
                            baseType: item.variant_id
                              ? "variant"
                              : item.addon_id
                                ? "addon"
                                : "item",
                          });
                          setTimeout(() => {
                            if (quantityEditRef.current) quantityEditRef.current.value = item.quantity;
                          }, 100);
                          const activeTab = item.variant_id ? "variant" : item.addon_id ? "addon" : "item"
                          setActiveAddRecipeItemTab(activeTab)
                          document.getElementById("modal-edit-recipe-item").showModal();
                        }}
                        className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95text-restro-text hover:bg-restro-button-hover'
                      >
                        <IconPencil stroke={iconStroke} />
                      </button>
                      <button
                        onClick={() => {
                          btnDeleteRecipeItem(item.id, item.variant_id, item.addon_id)
                        }}
                        className='w-8 h-8 rounded-full flex items-center justify-center text-red-500 transition active:scale-95 hover:bg-restro-button-hover'
                      >
                        <IconTrash stroke={iconStroke} />
                      </button>
                    </div>
                  </div>
                })
              }
              <button onClick={()=>document.getElementById('modal-add-recipe-item').showModal()} className="btn btn-sm mt-4 rounded-xl bg-restro-bg-gray hover:bg-restro-button-hover">Add Item</button>
            </div>
          </div>
          {/* recipe / inventory */}

        </div>
      </div>

      {/* variant add dialog */}
      <dialog id="modal-add-variant" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('menu_item.add_variant')}</h3>

          <div className="mt-4">
            <label htmlFor="title" className="mb-1 block text-gray-500 text-sm">{t('menu_item.variant_title')}</label>
            <input ref={variantTitleRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('menu_item.variant_title')} />
          </div>

          <div className="my-4">
            <label htmlFor="price" className="mb-1 block text-gray-500 text-sm">{t('menu_item.variant_price')}</label>
            <input ref={variantPriceRef} type="number" name="price" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('menu_item.variant_price')} />
            <p className="text-xs text-gray-500 mt-1">{t('menu_item.final_price_note')}</p>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('menu_item.close')}</button>
              <button onClick={()=>{btnAddVariant();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 ml-3 text-white border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('menu_item.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* variant add dialog */}

      {/* variant update dialog */}
      <dialog id="modal-update-variant" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('menu_item.update_variant')}</h3>

          <div className="mt-4">
            <input type="hidden" ref={variantIdRef} />
            <label htmlFor="title" className='mb-1 block text-gray-500 text-sm' />
            
            <input ref={variantTitleUpdateRef} type="text" name="title" className="text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray" placeholder={t('menu_item.variant_title')} />
         
          </div>

          <div className="my-4">
            <label htmlFor="price" className="mb-1 block text-gray-500 text-sm">{t('menu_item.variant_price')}</label>
            <input ref={variantPriceUpdateRef} type="number" name="price" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('menu_item.variant_price')} />

            <p className="text-xs text-gray-500 mt-1">{t('menu_item.final_price_note')}</p>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('menu_item.close')}</button>
              <button onClick={()=>{btnUpdateVariant();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 ml-3 text-white border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('menu_item.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* variant update dialog */}

      {/* addon add dialog */}
      <dialog id="modal-add-addon" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('menu_item.add_addon')}</h3>

          <div className="mt-4">
            <label htmlFor="title" className="mb-1 block text-gray-500 text-sm">{t('menu_item.addon_title')}</label>
            <input ref={addonTitleRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('menu_item.addon_title')} />
          </div>

          <div className="my-4">
            <label htmlFor="price" className="mb-1 block text-gray-500 text-sm">{t('menu_item.addon_price')}</label>
            <input ref={addonPriceRef} type="number" name="price" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('menu_item.addon_price')} />

            <p className="text-xs text-gray-500 mt-1">{t('menu_item.final_price_note')}</p>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('menu_item.close')}</button>
              <button onClick={()=>{btnAddAddon();}} className = 'btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('menu_item.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* addon add dialog */}

      {/* addon update dialog */}
      <dialog id="modal-update-addon" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('menu_item.update_addon')}</h3>

          <div className="mt-4">
            <input type="hidden" ref={addonIdRef} />
            <label htmlFor="title" className="mb-1 block text-gray-500 text-sm">{t('menu_item.addon_title')}</label>
            <input ref={addonTitleUpdateRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('menu_item.addon_title')} />
          </div>

          <div className="my-4">
            <label htmlFor="price" className="mb-1 block text-gray-500 text-sm">{t('menu_item.addon_price')}</label>
            <input ref={addonPriceUpdateRef} type="number" name="price" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t('menu_item.addon_price')} />

            <p className="text-xs text-gray-500 mt-1">{t('menu_item.final_price_note')}</p>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('menu_item.close')}</button>
              <button onClick={()=>{btnUpdateAddon();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 ml-3 text-white border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('menu_item.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* addon update dialog */}

      {/* recipe add dialog */}
      <dialog
        id="modal-add-recipe-item"
        className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">Add New Recipe Item</h3>

          {/* Tabs */}
          <div role="tablist" className="tabs my-4">
            {["item", "variant", "addon"].map((tab) => (
              <a
                key={tab}
                role="tab"
                className={`
                  tab rounded-t-lg
                  ${activeAddRecipeItemTab === tab
                  ? theme === "black"
                  ? "border-b-2 border-b-restro-green text-white bg-restro-green-10 hover:bg-restro-green-10"
                  : "border-b-2 border-b-restro-green text-restro-green bg-restro-green-10 hover:bg-restro-green-10"
                  : theme === "black"
                  ? "text-white hover:bg-restro-bg-hover-dark-mode"
                  : "text-gray-500 hover:bg-gray-100"
                   }`}

                onClick={() => {
                  setSelectedRecipeData({ ingredient: null, selectedBase: null });
                  quantityRef.current.value = "";
                  setActiveAddRecipeItemTab(tab);
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </a>
            ))}
          </div>

          {/* Note */}
          {activeAddRecipeItemTab !== "item" && (
            <p className="text-xs text-gray-500 mb-4">
              <strong>Note:</strong> Add only those extra inventory items that are{" "}
              <em>not included</em> in the base item recipe.
            </p>
          )}

          {/* Base Selector (for variant/addon only) */}
          {(activeAddRecipeItemTab === "variant" || activeAddRecipeItemTab === "addon") && (
            <div className="mb-4">
              <label
                htmlFor="baseSelect"
                className="mb-1 block text-gray-500 text-sm"
              >
                {activeAddRecipeItemTab === "variant"
                  ? "Select Variant"
                  : "Select Addon"}
              </label>
              <AsyncSelect
                key={`base-${activeAddRecipeItemTab}`}
                defaultOptions={getBaseIdOptions()}
                loadOptions={(inputValue, callback) =>
                  callback(
                    getBaseIdOptions().filter((opt) =>
                      opt.label.toLowerCase().includes(inputValue.toLowerCase())
                    )
                  )
                }
                isClearable
                placeholder="Type to search..."
                onChange={(v) => {
                  setSelectedRecipeData((prev) => ({
                    ...prev,
                    selectedBase: v ? { id: v.value, label: v.label } : null, // Store full object
                  }));
                }}
                value={selectedRecipeData.selectedBase}
                noOptionsMessage={() => "No results found"}
                styles={{
              control: (base) => ({
                ...base,
                backgroundColor: theme === "black" ? "#232323" : "#f3f4f6",
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
                backgroundColor: theme === "black" ? "#333333" : "#d1d5db", // divider color based on theme
              }),
            }}
              />
            </div>
          )}

          {/* Inventory Selector */}
          <div className="mb-4 overflow-visible">
            <label
              htmlFor="inventorySelect"
              className="mb-1 block text-gray-500 text-sm"
            >
              Select Inventory Item
            </label>
            <AsyncSelect
              key={`inventory-${activeAddRecipeItemTab}`}
              defaultOptions={getIngredientsOptions()}
              loadOptions={(inputValue, callback) =>
                callback(
                  getIngredientsOptions().filter((opt) =>
                    opt.label.toLowerCase().includes(inputValue.toLowerCase())
                  )
                )
              }
              isClearable
              placeholder="Type to search..."
              onChange={(v) =>
                setSelectedRecipeData((prev) => ({ ...prev, ingredient: v }))
              }
              value={selectedRecipeData?.ingredient}
              noOptionsMessage={() => "No results found"}
              className="overflow-visible "
              styles={{
              control: (base) => ({
                ...base,
                backgroundColor: theme === "black" ? "#232323" : "#f3f4f6",
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
                backgroundColor: theme === "black" ? "#333333" : "#d1d5db", // divider color based on theme
              }),
            }}
            />
          </div>

          {/* Quantity */}
          <div className="mb-4">
           <label
              htmlFor="recipe_item_qty"
              className="mb-1 block text-gray-500 text-sm"
            >
              Qty.
              {selectedRecipeData?.ingredient?.unit != null && (
                <span> (in {selectedRecipeData.ingredient.unit})</span>
              )}
            </label>
            <input
              type="number"
              ref={quantityRef}
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray'
              placeholder="Enter Qty."
              step="any"
              min="0"
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <form method="dialog">
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
                Close
              </button>
              <button
                type="button"
                onClick={btnAddRecipeItem}
                className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* recipe add dialog */}

      {/* recipe edit dialog */}
      <dialog id="modal-edit-recipe-item" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">Edit Recipe Item</h3>

          {/* Base Type Tabs */}
          <div role="tablist" className="tabs my-4">
            {["item", "variant", "addon"].map((tab) => (
              <a
                key={tab}
                role="tab"
                className={`tab ${
                  editRecipeData.baseType === tab
                    ? "border-b-2 border-b-restro-green bg-restro-green/10 rounded-t-lg text-restro-green"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() =>
                  setEditRecipeData((prev) => ({
                    ...prev,
                    baseType: tab,
                    selectedBase: null,
                    quantity: "",
                    ingredient: null,
                  }))
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </a>
            ))}
          </div>

          {/* Note */}
          {editRecipeData.baseType !== "item" && (
            <p className="text-xs text-gray-500 mb-4">
              <strong>Note:</strong> Add only those extra inventory items that are{" "}
              <em>not included</em> in the base item recipe.
            </p>
          )}

          {/* Variant / Addon Base Selector */}
          {(editRecipeData.baseType === "variant" || editRecipeData.baseType === "addon") && (
            <div className="mb-4">
              <label className="mb-1 block text-gray-500 text-sm">
                {editRecipeData.baseType === "variant" ? "Select Variant" : "Select Addon"}
              </label>
              <AsyncSelect
                defaultOptions={getBaseIdOptions()}
                loadOptions={(inputValue, callback) =>
                  callback(
                    getBaseIdOptions().filter((opt) =>
                      opt.label.toLowerCase().includes(inputValue.toLowerCase())
                    )
                  )
                }

                isClearable
                placeholder="Type to search..."
                onChange={(v) => {
                  setEditRecipeData((prev) => ({
                    ...prev,
                    selectedBase: v ? { id: v.value, label: v.label } : null,
                  }));
                }}
                value={editRecipeData.selectedBase}
                noOptionsMessage={() => "No results found"}
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
                backgroundColor: theme === "black" ? "#333333" : "#d1d5db",
              }),
            }}
              />
            </div>
          )}

          {/* Ingredient Selector */}
          <div className="mb-4">
            <label className="mb-1 block text-gray-500 text-sm">Select Inventory Item</label>
            <AsyncSelect
              defaultOptions={getIngredientsOptions()}
              loadOptions={(inputValue, callback) =>
                callback(
                  getIngredientsOptions().filter((opt) =>
                    opt.label.toLowerCase().includes(inputValue.toLowerCase())
                  )
                )
              }
              isClearable
              placeholder="Type to search..."
              onChange={(v) =>
                setEditRecipeData((prev) => ({ ...prev, ingredient: v }))
              }
              value={editRecipeData.ingredient}
              noOptionsMessage={() => "No results found"}
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
                backgroundColor: theme === "black" ? "#333333" : "#d1d5db", // divider color based on theme
              }),
            }}
            />
          </div>

          {/* Quantity Field */}
          <div className="mb-4">
            <label className="mb-1 block text-gray-500 text-sm">
              Qty.
              {editRecipeData?.ingredient?.unit != null && (
                <span> (in {editRecipeData.ingredient.unit})</span>
              )}
            </label>
            <input
              type="number"
              ref={quantityEditRef}
              className="text-sm w-full border bg-restro-gray rounded-lg px-4 py-2 dark:bg-black border-restro-bg-gray outline-restro-green-light"
              placeholder="Enter Qty."
              step="any"
              min="0"
              defaultValue={editRecipeData.quantity}
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <form method="dialog">
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
                Close
              </button>
              <button
                type="button"
                onClick={btnUpdateRecipeItem}
                className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                Update
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* recipe edit dialog */}
    </Page>
  );
}
