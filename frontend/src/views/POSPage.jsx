import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import Page from "../components/Page";
import { IconPlus, IconNotes, IconArmchair, IconScreenShare, IconSearch, IconDeviceFloppy, IconChefHat, IconCash, IconMinus, IconNote, IconTrash, IconFilter, IconPhoto, IconFilterFilled, IconClipboardList, IconX, IconClearAll, IconPencil, IconCheck, IconCarrot, IconRotate, IconQrcode, IconArmchair2, IconUser, IconCategory, IconGridDots, IconLayoutGrid, IconListDetails, IconListTree, IconMenu4, IconLayoutGridFilled, IconMenu2, IconLayoutList, IconLayout2, IconLayout2Filled, IconAlertTriangleFilled } from "@tabler/icons-react";
import { VITE_BACKEND_SOCKET_IO, iconStroke } from "../config/config";
import { cancelAllQROrders, cancelQROrder, createOrder, createOrderAndInvoice, getDrafts, getQROrders, getQROrdersCount, initPOS, setDrafts } from "../controllers/pos.controller";
import { CURRENCIES } from '../config/currencies.config';
import { PAYMENT_ICONS } from "../config/payment_icons";
import { toast } from "react-hot-toast";
import { searchCustomer } from '../controllers/customers.controller';
import { Link, useNavigate } from 'react-router-dom';
import { setDetailsForReceiptPrint } from '../helpers/ReceiptHelper';
import { SocketContext } from "../contexts/SocketContext";
import { initSocket } from '../utils/socket';
import { getImageURL } from '../helpers/ImageHelper';
import { getUserDetailsInLocalStorage } from '../helpers/UserDetails';
import AsyncCreatableSelect from 'react-select/async-creatable';
import DialogAddCustomer from '../components/DialogAddCustomer';
import POSMenuItemDetailedView from '../components/POSMenuItemDetailedView';
import POSMenuItemCompactView from '../components/POSMenuItemCompactView';
import { clsx } from "clsx";
import { useTheme } from '../contexts/ThemeContext';

export default function POSPage() {
  const { t } = useTranslation();
  const user = getUserDetailsInLocalStorage();
  const { socket, isSocketConnected } = useContext(SocketContext);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const diningOptionRef = useRef();
  const tableRef = useRef();

  // dialog: notes ref
  const dialogNotesIndexRef = useRef();
  const dialogNotesTextRef = useRef();
  // dialog: notes ref

  // dialog: category filter
  const categoryFilterDropdownRef = useRef(null);
  // dialog: category filter

  // dialog: category filter
  const draftTitleRef = useRef(null);
  // dialog: category filter

  // dialog: search customer
  const searchCustomerRef = useRef(null);
  // dialog: search customer

  const tapSound = new Audio("/tap.mp3");

  const [state, setState] = useState({
    view:"detailed",
    categories: [],
    menuItems: [],
    paymentTypes: [],
    printSettings: null,
    storeSettings: null,
    storeTables: [],
    serviceCharge:null,
    currency: "",
    isLoading: true,

    cartItems: [],
    customerType: "WALKIN",
    customer: null,
    addCustomerDefaultValue: null,

    searchQuery: "",
    selectedCategory: "all",

    selectedItemId: null,

    drafts: [],

    itemsTotal: 0,
    taxTotal: 0,
    serviceChargeTotal:0,
    payableTotal: 0,

    orderId: null,
    tokenNo: null,

    qrOrdersCount: 0,
    qrOrders: [],
    selectedQrOrderItem: null,

    selectedPaymentType: null,
  });

  useEffect(()=>{
    _initPOS();
    _initSocket();
  },[]);

  const { categories, menuItems, paymentTypes, printSettings, storeSettings, storeTables, currency, cartItems, searchQuery, selectedCategory, selectedItemId, drafts, customer, customerType, isLoading } = state;



  const sendNewOrderEvent = (tokenNo, orderId) => {
    if (isSocketConnected) {
      socket.emit('new_order_backend', {tokenNo, orderId}, user.tenant_id);
    } else {
      // Handle disconnected state (optional)
      initSocket();
      socket.emit('new_order_backend', {tokenNo, orderId}, user.tenant_id);
    }
  }

  const playTapSound = () => {
    tapSound.play();
  }

  async function _initPOS() {
    try {
      const res = await initPOS();
      let totalQROrders = 0;

      if(res.status == 200) {
        const data = res.data;

        const currency = CURRENCIES.find((c)=>c.cc==data?.storeSettings?.currency);

        try {
          totalQROrders = await _getQROrdersCount();
        } catch (error) {
          console.log(error);
        }

        const savedView = sessionStorage.getItem('view') || 'detailed';

        setState((prev) => ({
          ...prev,
          view:savedView,
          categories: data.categories,
          menuItems: data.menuItems,
          paymentTypes: data.paymentTypes,
          printSettings: data.printSettings,
          storeSettings: data.storeSettings,
          storeTables: data.storeTables,
          serviceCharge:data.serviceCharge,
          currency: currency?.symbol || "",
          qrOrdersCount: totalQROrders || 0,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }

  const _getQROrdersCount = async () => {
    try {
      const res = await getQROrdersCount();
      if(res.status == 200) {
        const data = res.data;

        return data?.totalQROrders || 0;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  const _initSocket = () => {
    if(isSocketConnected) {
      socket.emit("authenticate", user.tenant_id);
      socket.on('new_qrorder', async (payload)=>{
        try {
          const totalQROrders = await _getQROrdersCount();

          setState((prevState)=>({
            ...prevState,
            qrOrdersCount: totalQROrders || 0
          }))
        } catch (error) {
          console.log(error);
        }
      })
    } else {
      initSocket();
      socket.emit("authenticate", user.tenant_id);
      socket.on('new_qrorder', async (payload)=>{
        try {
          const totalQROrders = await _getQROrdersCount();

          setState((prevState)=>({
            ...prevState,
            qrOrdersCount: totalQROrders || 0
          }))
        } catch (error) {
          console.log(error);
        }
      })
    }
  }

  if(isLoading) {
    return <Page className='px-4 py-3 flex flex-col min-h-0'>
      <div className='mt-4 h-[calc(100vh-136px)] flex gap-4 skeleton'>
        <div className='border border-restro-border-green-light rounded-2xl h-full w-[70%] overflow-y-auto'></div>
        <div className='border border-restro-border-green-light rounded-2xl h-full w-[30%] relative flex flex-col'></div>
      </div>
    </Page>
  }


  // cart
  function canPrepareMenuItem(menuItem, quantity = 1, selectedVariantId = null, selectedAddonIds = []) {
    const usageMap = {};

    menuItem.recipeItems.forEach((recipe) => {
      const appliesToBase = recipe.variant_id === 0 && recipe.addon_id === 0;
      const appliesToVariant = recipe.variant_id > 0 && recipe.variant_id == selectedVariantId;
      const appliesToAddon = recipe.addon_id > 0 && selectedAddonIds.includes(recipe.addon_id.toString());

      if (appliesToBase || appliesToVariant || appliesToAddon) {
        const invId = recipe.inventory_item_id;
        const requiredQty = parseFloat(recipe.recipe_quantity) * quantity;

        if (!usageMap[invId]) {
          usageMap[invId] = {
            ingredient_title: recipe.ingredient_title,
            total_required: 0,
            current_quantity: parseFloat(recipe.current_quantity || 0),
          };
        }

        usageMap[invId].total_required += requiredQty;
      }
    });

    for (const invId in usageMap) {
      const { ingredient_title, total_required, current_quantity } = usageMap[invId];
      if (current_quantity < total_required) {
        console.warn(
          `Cannot prepare '${menuItem.title}' - Ingredient '${ingredient_title}' is insufficient`
        );
        return false;
      }
    }

    return true;
  }

  function addItemToCart(item) {
    const modifiedItem = {
      ...item,
      quantity: 1,
      notes: null
    }

    if (!canPrepareMenuItem(item, 1)) {
      toast.error(t('inventory.insufficient_stock_message_pos'));
      return;
    }

    if(!cartItems) {
      setState({
        ...state,
        cartItems: [modifiedItem]
      })
      return;
    }
    setState({
      ...state,
      cartItems: [...cartItems, modifiedItem]
    })
    playTapSound();
  }

  function removeItemFromCart(index) {
    setState({
      ...state,
      cartItems: cartItems.filter((c,i)=> i !== index)
    })
    playTapSound();
  }

  function addCartItemQuantity(index, currentQuantity) {
    const newQuantity = currentQuantity + 1;
    const newCartItems = cartItems;

    if (!canPrepareMenuItem(newCartItems[index], newQuantity, newCartItems[index].variant_id, newCartItems[index].addons_ids)) {
      toast.error(t('inventory.insufficient_stock_message_pos'));
      return;
    }

    newCartItems[index].quantity = newQuantity;

    setState({
      ...state,
      cartItems: [...newCartItems]
    });
    playTapSound();
  }
  function minusCartItemQuantity(index, currentQuantity) {
    const newQuantity = currentQuantity - 1;
    let newCartItems = cartItems;

    newCartItems[index].quantity = newQuantity;

    if(newQuantity == 0) {
      newCartItems = cartItems.filter((v, i)=>i!=index);
    }

    setState({
      ...state,
      cartItems: [...newCartItems]
    });
    playTapSound();
  }
  // cart

  // order notes
  const btnOpenNotesModal = (index, notes) => {
    dialogNotesIndexRef.current.value = index;
    dialogNotesTextRef.current.value = notes;
    document.getElementById('modal-notes').showModal()
  }
  const btnAddNotes = () => {
    const index = dialogNotesIndexRef.current.value;
    const notes = dialogNotesTextRef.current.value || null;

    const newCartItems = cartItems;
    newCartItems[index].notes = notes;

    setState({
      ...state,
      cartItems: newCartItems
    })
  };
  // order notes

  // category filter modal
  const btnOpenCategoryFilterModal = () => {
    categoryFilterDropdownRef.current.value = selectedCategory;
    document.getElementById('modal-categories').showModal()
  }
  const btnApplyCategoryFilter = () => {
    const selectedCategoryFromDropdown = categoryFilterDropdownRef.current.value || "";
    setState({
      ...state,
      selectedCategory: selectedCategoryFromDropdown
    })
  }
  const btnClearSelectedCategory = () => {
    setState({
      ...state,
      selectedCategory: "all"
    })
  };
  // category filter modal

  // variant, addon modal

  const resetVariantsAndAddons = () => {
    const itemVariants = document.getElementsByName("variants");
    itemVariants.forEach((item, index) => {
      item.checked = index === 0;
    });

    const itemAddons = document.getElementsByName("addons");
    itemAddons.forEach((item) => {
      item.checked = false;
    });
  };

  const btnOpenVariantAndAddonModal = (menuItemId) => {

    resetVariantsAndAddons();

    setState({
      ...state,
      selectedItemId: menuItemId
    })
    document.getElementById('modal-variants-addons').showModal()
  }
  const btnAddMenuItemToCartWithVariantsAndAddon = () => {
    let price = 0;
    let selectedVariantId = null;
    const selectedAddonsId = [];

    const itemVariants = document.getElementsByName("variants");
    itemVariants.forEach((item)=>{
      if(item.checked) {
        selectedVariantId = item.value;
        return;
      }
    })

    const itemAddons = document.getElementsByName("addons");
    itemAddons.forEach((item)=>{
      if(item.checked) {
        selectedAddonsId.push(item.value);
      }
    })

    // get selected menu item
    const selectedItem = menuItems.find((item)=>item.id == selectedItemId);

    const addons = selectedItem?.addons || [];
    const variants = selectedItem?.variants || [];

    let selectedVariant = null;
    if(selectedVariantId) {
      selectedVariant = variants.find((v)=>v.id == selectedVariantId);
      price = parseFloat(selectedVariant.price);
    } else {
      price = parseFloat(selectedVariant?.price ?? selectedItem.price)
    }

    let selectedAddons = [];
    if(selectedAddonsId.length > 0) {
      selectedAddons = selectedAddonsId.map((addonId)=>addons.find((addon)=>addon.id == addonId))
      selectedAddons.forEach((addon)=>{
        const addonPrice = parseFloat(addon.price);
        price = price + addonPrice
      });
    }

    const canPrepare = canPrepareMenuItem(selectedItem, 1/**quantity */, selectedVariantId, selectedAddonsId);

    if (!canPrepare) {
      toast.error(t('inventory.insufficient_stock_message_pos'));
      return;
    }

    const itemCart = {...selectedItem, price: price, variant_id: selectedVariantId, variant: selectedVariant, addons_ids: selectedAddonsId, addons: selectedAddons}
    addItemToCart(itemCart)
  };
  // variant, addon modal

  // drafts
  const btnOpenSaveDraftModal = () => {
    if(cartItems.length == 0) {
      toast.error(t('pos.empty_cart'));
      return;
    }
    document.getElementById('modal-save-draft').showModal()
  }
  const btnAddtoDrafts = () => {
    const drafts = getDrafts();

    const nameRef = draftTitleRef.current.value || "";
    const date = new Date().toLocaleString();

    const draftItem = {
      nameRef: nameRef,
      date,
      cart: cartItems
    };

    drafts.push(draftItem);

    setDrafts(drafts);
    setState({
      ...state,
      cartItems: []
    })
  };

  const btnInitNewOrder = () => {
    setState({
      ...state,
      cartItems: [],
      customer: null,
      customerType: "WALKIN",
      selectedQrOrderItem: null,
    })
    playTapSound();
  }

  const btnOpenDraftsModal = () => {
    const drafts = getDrafts();
    setState({
      ...state,
      drafts: [...drafts]
    });
    document.getElementById("modal-drafts").showModal();
  }

  const btnDeleteDraftItem = index => {
    const drafts = getDrafts();
    const newDrafts = drafts.filter((v,i)=>i!=index);

    setDrafts(newDrafts);

    setState({
      ...state,
      drafts: [...newDrafts]
    });
  };

  const btnClearDrafts = () => {
    setDrafts([]);
    setState({
      ...state,
      drafts: []
    });
  };
  const btnSelectDraftItemToCart = draftItem => {
    const {nameRef, date, cart} = draftItem;

    setState({
      ...state,
      cartItems: [...cart]
    });

    document.getElementById("modal-drafts").close();
  };
  // drafts

  // QR Menu Orders
  const btnShowQROrdersModal = async () => {
    try {
      const res = await getQROrders();
      if(res.status == 200) {
        const data = res.data;
        setState({
          ...state,
          qrOrders: [...data]
        })
        document.getElementById("modal-qrorders").showModal();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const btnClearQROrders = async () => {
    const isConfirm = window.confirm(t('pos.delete_confirm'));
    if(!isConfirm) {
      return;
    }
    try {
      toast.loading(t('pos.please_wait'));
      const res = await cancelAllQROrders();
      if(res.status == 200) {
        toast.dismiss();
        toast.success(res.data.message);
        setState((prevState)=>({
          ...prevState, qrOrders: [], qrOrdersCount: 0,
        }))
        playTapSound();
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('pos.getting_issues');
      console.log(error);
      toast.dismiss();
      toast.error(message);
    }
  }
  const btnCancelQROrder = async (orderId) => {
    const isConfirm = window.confirm(t('pos.delete_confirm'));
    if(!isConfirm) {
      return;
    }
    try {
      toast.loading(t('pos.please_wait'));
      const res = await cancelQROrder(orderId);
      if(res.status == 200) {
        toast.dismiss();
        toast.success(res.data.message);

        const newQROrders = state.qrOrders.filter((item)=>item.id != orderId);
        const newQROrderItem = state.qrOrdersCount - 1;

        setState((prevState)=>({
          ...prevState, qrOrders: [...newQROrders], qrOrdersCount: newQROrderItem,
        }))
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('pos.getting_issues');
      console.log(error);
      toast.dismiss();
      toast.error(message);
    }
  }
  const btnSelectQROrder = (qrOrder) => {
    console.log(qrOrder);

    if(qrOrder.table_id) {
      tableRef.current.value = qrOrder.table_id;
    }

    // const itemCart = {...selectedItem, price: price, variant_id: selectedVariantId, variant: selectedVariant, addons_ids: selectedAddonsId, addons: selectedAddons}

    const modifiedCart = qrOrder.items.map((item)=>{
      const id = item.item_id;

      let selectedVariant = {
        id: item.variant_id,
        item_id: id,
        price: item.variant_price,
        title: item.variant_title,
      }

      return {
        ...item,
        id: id,
        title: item.item_title,
        addons_ids: item?.addons?.map((i)=>i.id),
        variant: selectedVariant || null,
        variant_id: item.variant_id || null,
      }
    })

    setState({
      ...state,
      cartItems: modifiedCart,
      selectedQrOrderItem: qrOrder.id,
      customerType: qrOrder.customer_type,
      customer: {phone: qrOrder.customer_id, name: qrOrder.customer_name},
    })
    playTapSound();

    document.getElementById('modal-qrorders').close();
  };
  // QR MEnu Orders

  // search customer modal
  const btnOpenSearchCustomerModal = () => {
    document.getElementById("modal-search-customer").showModal();
  };
  const btnClearSearchCustomer = () => {
    setState({
      ...state,
      customerType: "WALKIN",
      customer: null
    })
  }
  const btnSearchCustomer = async () => {
    const phone = searchCustomerRef.current.value;

    if(!phone) {
      toast.error(t('pos.please_provide_phone'));
      return;
    }

    try {
      toast.loading(t('pos.please_wait'));
      const resp = await searchCustomer(phone);
      toast.dismiss();
      if(resp.status == 200) {
        setState({
          ...state,
          customer: resp.data,
          customerType: "CUSTOMER"
        })
        document.getElementById("modal-search-customer").close()
      }

    } catch (error) {
      console.log(error);
      const message = error.response.data.message || t('pos.error_getting_details');
      toast.dismiss();
      toast.error(message);
    }
  }
  // search customer modal


  // send to kitchen modal
  const calculateOrderSummary = () => {
    let itemsTotal = 0; // without tax - net amount
    let taxTotal = 0;
    let serviceChargeTotal = 0;
    let payableTotal = 0;

    cartItems.forEach((item)=>{
      const taxId = item.tax_id;
      const taxTitle = item.tax_title;
      const taxRate = Number(item.tax_rate);
      const taxType = item.tax_type; // inclusive or exclusive or NULL

      const itemPrice = Number(item.price) * Number(item.quantity);

      if (taxType == "exclusive") {
        const tax = (itemPrice * taxRate) / 100;
        const priceWithTax = itemPrice + tax;

        taxTotal += tax;
        itemsTotal += itemPrice;
        payableTotal += priceWithTax;
      } else if (taxType == "inclusive") {
        const tax = itemPrice - (itemPrice * (100 / (100 + taxRate)));
        const priceWithoutTax = itemPrice - tax;

        taxTotal += tax;
        itemsTotal += priceWithoutTax;
        payableTotal += itemPrice;
      } else {
        itemsTotal += itemPrice;
        payableTotal += itemPrice;
      }
    });

    // Calculate Total Service charge % from items total
    if (state.serviceCharge) {
      let serviceCharge = (Number(itemsTotal) * Number(state.serviceCharge)) / 100;
      serviceChargeTotal += serviceCharge;
      payableTotal += serviceCharge;
    }

    return {
      itemsTotal, taxTotal, serviceChargeTotal, payableTotal
    }
  };
  const btnShowPayAndSendToKitchenModal = () => {
    // calculate the item - total, tax, incl. tax, excl. tax, tax total, payable total

    if(cartItems?.length == 0) {
      toast.error(t('pos.empty_cart'));
      return;
    }

    const { itemsTotal, taxTotal, serviceChargeTotal, payableTotal } = calculateOrderSummary();

    setState({
      ...state,
      itemsTotal,
      taxTotal,
      serviceChargeTotal,
      payableTotal
    });
    document.getElementById('modal-pay-and-send-kitchen-summary').showModal();
  }
  const btnPayAndSendToKitchen = async () => {
    if(!state.selectedPaymentType) {
      return toast.error(t('orders.select_payment_method'));
    }
    try {
      const deliveryType = diningOptionRef.current.value;
      const tableId = tableRef.current.value;
      const customerType = state.customerType;
      const customer = state.customer;

      toast.loading(t('pos.please_wait'));
      const res = await createOrderAndInvoice(cartItems, deliveryType, customerType, customer, tableId, state.itemsTotal, state.taxTotal, state.serviceChargeTotal , state.payableTotal, state.selectedQrOrderItem, state.selectedPaymentType);
      toast.dismiss();
      if(res.status == 200) {
        const data = res.data;
        toast.success(res.data.message);
        document.getElementById("modal-pay-and-send-kitchen-summary").close();

        const page_format = printSettings?.page_format || null;
        const is_enable_print = printSettings?.is_enable_print || 0;

        const paymentType = paymentTypes.find((v)=>v.id == state.selectedPaymentType);
        let paymentMethodText;
        if(paymentType) {
          paymentMethodText = paymentType.title;
        }

        setDetailsForReceiptPrint({
          cartItems, deliveryType, customerType, customer, tableId, currency, storeSettings, printSettings,
          itemsTotal: state.itemsTotal,
          taxTotal: state.taxTotal,
          serviceChargeTotal:state.serviceChargeTotal,
          payableTotal: state.payableTotal,
          tokenNo: data.tokenNo,
          orderId: data.orderId,
          paymentMethod: paymentMethodText
        });

        sendNewOrderEvent(data.tokenNo, data.orderId);

        let newQROrderItemCount = state.qrOrdersCount;
        let newQROrders = [];
        if(state.selectedQrOrderItem) {
          newQROrderItemCount -= 1;
          newQROrders = state?.qrOrders?.filter((item)=>item.id != state.selectedQrOrderItem);
        }

        setState((prev) => ({
          ...prev,
          cartItems: [],
          tokenNo: data.tokenNo,
          orderId: data.orderId,
          selectedQrOrderItem: null,
          qrOrders: newQROrders,
          qrOrdersCount: newQROrderItemCount,
          selectedPaymentType: null,
        }))

        _initPOS()

        if(is_enable_print) {
          setTimeout(()=>{
            const receiptWindow = window.open("/print-receipt", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
            receiptWindow.onload = (e) => {
              setTimeout(()=>{
                receiptWindow.print();
              },800)
            }
          }, 100)
          return;
        }

        // show print token dialog
        document.getElementById("modal-print-token").showModal();
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('pos.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnShowSendToKitchenModal = () => {
    // calculate the item - total, tax, incl. tax, excl. tax, tax total, payable total

    if(cartItems?.length == 0) {
      toast.error(t('pos.empty_cart'));
      return;
    }

    const { itemsTotal, taxTotal, serviceChargeTotal, payableTotal } = calculateOrderSummary();

    setState({
      ...state,
      itemsTotal,
      taxTotal,
      serviceChargeTotal,
      payableTotal
    });
    document.getElementById('modal-send-kitchen-summary').showModal();
  }

  const btnSendToKitchen = async () => {
    try {
      const deliveryType = diningOptionRef.current.value;
      const tableId = tableRef.current.value;
      const customerType = state.customerType;
      const customer = state.customer;

      toast.loading(t('pos.please_wait'));
      const res = await createOrder(cartItems, deliveryType, customerType, customer, tableId, state.selectedQrOrderItem);
      toast.dismiss();
      if(res.status == 200) {
        const data = res.data;
        toast.success(res.data.message);
        document.getElementById("modal-send-kitchen-summary").close();

        const page_format = printSettings?.page_format || null;
        const is_enable_print = printSettings?.is_enable_print || 0;

        setDetailsForReceiptPrint({
          cartItems, deliveryType, customerType, customer, tableId, currency, storeSettings, printSettings,
          itemsTotal: state.itemsTotal,
          taxTotal: state.taxTotal,
          serviceChargeTotal:state.serviceChargeTotal,
          payableTotal: state.payableTotal,
          tokenNo: data.tokenNo,
          orderId: data.orderId
        });

        sendNewOrderEvent(data.tokenNo, data.orderId);

        let newQROrderItemCount = state.qrOrdersCount;
        let newQROrders = [];
        if(state.selectedQrOrderItem) {
          newQROrderItemCount -= 1;
          newQROrders = state?.qrOrders?.filter((item)=>item.id != state.selectedQrOrderItem);
        }

        setState((prev) => ({
          ...prev,
          cartItems: [],
          tokenNo: data.tokenNo,
          orderId: data.orderId,
          selectedQrOrderItem: null,
          qrOrders: newQROrders,
          qrOrdersCount: newQROrderItemCount
        }))

        _initPOS()

        if(is_enable_print) {
          setTimeout(()=>{
            const receiptWindow = window.open("/print-receipt", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
            receiptWindow.onload = (e) => {
              setTimeout(()=>{
                receiptWindow.print();
              },800)
            }
          }, 100)
          return;
        }

        // show print token dialog
        document.getElementById("modal-print-token").showModal();
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('pos.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };
  const btnPrintTokenOnly = () => {
    const tokenWindow = window.open("/print-token", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
    tokenWindow.onload = (e) => {
      setTimeout(()=>{
        tokenWindow.print();
      }, 400)
    }
    return;
  };
  // send to kitchen modal


  const setCustomer = (customer) => {

    if(customer) {
      setState({
        ...state,
        customer: {phone: customer.value, name:customer.label},
        customerType: "CUSTOMER"
      })
      document.getElementById("modal-search-customer").close()
    } else {
      btnClearSearchCustomer();
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
  // search customer modal


  return (
    <Page className='px-4 py-3 flex flex-col min-h-0'>
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-2">
        <h3>{t('pos.title')}</h3>
        <div className='flex flex-wrap items-center gap-4'>
          <button onClick={btnInitNewOrder} className = "text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover">
            <IconPlus size={18} stroke={iconStroke}  /> {t('pos.new_order')}
          </button>

          {/* QR Menu Orders */}
          <button
          onClick={btnShowQROrdersModal}
          className = "relative text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover">
            <IconQrcode size={18} stroke={iconStroke}  /> {t('pos.qr_menu_orders')}

            {state.qrOrdersCount > 0 && <div className='absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center'> {state.qrOrdersCount}
            </div>}
          </button>
          {/* QR Menu Orders */}

          <button onClick={btnOpenDraftsModal} className = "relative text-sm rounded-lg border transition active:scale-95 hover:shadow-lg text-gray-500 px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover">
            <IconNotes size={18} stroke={iconStroke}  /> {t('pos.drafts_list')}
          </button>

          <Link to="/dashboard/orders" className = "relative text-sm rounded-lg border transition active:scale-95 hover:shadow-lg text-gray-500 px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover">
            <IconArmchair size={18} stroke={iconStroke} /> {t('pos.table_orders')}
          </Link>
        </div>
      </div>

      <div className='mt-4 md:h-[calc(100vh-136px)] flex flex-col-reverse md:flex-row gap-4'>

        {/* pos items */}
        <div className = "h-full md:w-[70%] overflow-y-auto scrollbar-none border rounded-2xl border-restro-border-green">
          {/* categories, search, toggle View*/}
         <div className="bg-background flex gap-2 justify-between sticky top-0 w-full z-10 px-4 py-3 rounded-t-2xl">
            <div className="flex overflow-x-auto space-x-2 text-sm custom-scroll-wrapper scrollbar scrollbar-none custom-scroll-div-horizon-smooth">
              <div className="flex overflow-x-auto space-x-2 text-sm scrollbar scrollbar-none custom-scroll-div-horizon-smooth">
                <button
                  className={`min-w-28 px-4 py-2 rounded-xl ${selectedCategory === "all"  ? theme === 'black' ? 'bg-restro-green-dark-mode text-white' : 'bg-restro-green text-white' : theme=== 'black' ? 'bg-restro-bg-seconday-dark-mode' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => {
                    setState({
                      ...state,
                      selectedCategory: 'all'
                    })
                  }}
                >
                  {t('pos.all')}
                </button>
                {categories.filter((category) => category.is_enabled).map((category, index) => (
                <button
                    key={index}
                    className={`min-w-fit px-4 py-2 rounded-xl ${selectedCategory === category.id  ? theme === 'black' ? 'bg-restro-green-dark-mode text-white' : 'bg-restro-green text-white' : theme=== 'black' ? 'bg-restro-bg-seconday-dark-mode' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => {
                      setState({
                        ...state,
                        selectedCategory: category.id
                      })
                    }}
                  >
                    {category.title}
                </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center w-60 rounded-xl px-3 py-2 gap-2 bg-restro-gray border border-restro-border-green">
                <IconSearch size={18} stroke={iconStroke} /> 
                 <input value={searchQuery} onChange={e=>setState({...state, searchQuery: e.target.value})} type="search" placeholder={t('appbar.search_placeholder')} className='w-full bg-transparent outline-none' />
              </label>
              <button
              className={clsx(`px-3 py-2 rounded-xl`,
                theme === "black" ? state.view === "compact" ? "text-restro-green bg-restro-bg-seconday-dark-mode hover:bg-restro-bg-hover-dark-mode" : "text-gray-300 bg-restro-bg-seconday-dark-mode hover:bg-restro-bg-hover-dark-mode" : state.view === "compact" ? "text-restro-green bg-gray-100  hover:bg-gray-200" : "text-gray-400 bg-gray-100  hover:bg-gray-200"
)}
              onClick={() => {
                const newView = state.view === 'detailed' ? 'compact' : 'detailed';
                setState((prev) => ({
                  ...prev,
                  view: newView
                }));
                sessionStorage.setItem('view', newView);
              }}>
                <IconLayout2 size={24} stroke={2}/>
              </button>
            </div>
          </div>
          {/* categories, search */}


          {/* list */}
          <div className='flex-1 h-full pt-3'>
          {state.view == 'detailed' ?
            <POSMenuItemDetailedView
              menuItems={menuItems}
              selectedCategory={selectedCategory}
              categories={categories}
              searchQuery={searchQuery}
              currency={currency}
              btnOpenVariantAndAddonModal={btnOpenVariantAndAddonModal}
              addItemToCart={addItemToCart}
            />:
            <POSMenuItemCompactView
              menuItems={menuItems}
              selectedCategory={selectedCategory}
              categories={categories}
              searchQuery={searchQuery}
              currency={currency}
              btnOpenVariantAndAddonModal={btnOpenVariantAndAddonModal}
              addItemToCart={addItemToCart}
            />
          }
          </div>
          {/* list */}


        </div>
        {/* pos items */}

        {/* cart */}
        <div className = "flex flex-col h-full md:w-[30%] relative border rounded-2xl border-restro-border-green">

          <div className = "sticky w-full px-4 py-3 border-b rounded-t-2xl border-restro-border-green">
            {/* search customer */}
            <div onClick={btnOpenSearchCustomerModal} className="flex items-center gap-2">
              <input value={customerType=="WALKIN"?t('pos.walkin_customer'):`${customer.name}`} type="text" placeholder={t('pos.search_customer')} className= "flex items-center gap-1 text-sm w-full px-4 py-2 transition active:scale-95 hover:shadow-lg border rounded-lg bg-restro-gray border-restro-border-green hover:bg-restro-button-hover outline-restro-border-green"/>
              <button onClick={btnOpenSearchCustomerModal} className = "flex items-center justify-center w-9 h-9 transition active:scale-95 rounded-lg hover:shadow-lg bg-restro-gray border border-restro-border-green hover:bg-restro-button-hover">
                <IconSearch size={18} stroke={iconStroke} />
              </button>
            </div>
            {/* search customer */}

            {/* delivery type */}
            <select ref={diningOptionRef} className="mt-3 text-sm w-full border rounded-lg px-4 py-2 justify-center bg-restro-gray border-restro-border-green hover:bg-restro-button-hover focus:outline-restro-border-green">
              <option value="">{t('pos.select_dining_option')}</option>
              <option value="dinein">{t('pos.dinein')}</option>
              <option value="delivery">{t('pos.delivery')}</option>
              <option value="takeaway">{t('pos.takeaway')}</option>
            </select>
            {/* delivery type */}

            {/* table selection */}
            <select ref={tableRef} className="mt-3 text-sm w-full border rounded-lg px-4 py-2 justify-center bg-restro-gray border-restro-border-green hover:bg-restro-button-hover focus:outline-restro-border-green">
              <option value="">{t('pos.select_table')}</option>
              {
                storeTables.map((table, index)=>{
                  return <option value={table.id} key={index}>{table.table_title} ({table.seating_capacity} {t('pos.person')}) - {table.floor}</option>
                })
              }
            </select>
            {/* table selection */}
          </div>


          {/* items */}
          <div className='flex-1 flex flex-col gap-4 overflow-y-auto px-4 pb-36'>
            <div className="h-1"></div>
            {cartItems?.map((cartItem, i)=>{
              const {quantity, notes, title, price, variant, addons} = cartItem;
              const itemTotal = price * quantity;
              return <div key={i} className="text-sm rounded-lg p-2 relative border border-restro-border-green">
                <p>#{i+1} {title} x {quantity}</p>
                <p className='mt-1'>{currency}{Number(price).toFixed(2)} <span className='text-xs'>x {quantity}</span> <span className='font-bold'>= {currency}{itemTotal.toFixed(2)}</span></p>
                {notes && <p className="mt-1 text-xs text-gray-400">
                  {t('pos.notes')}: {notes}
                </p>
                }

                {variant && <p className="mt-1 text-xs text-gray-400">{t('pos.variant')}: {variant.title}</p>}
                {(addons && addons?.length > 0 ) && <p className="mt-1 text-xs text-gray-400">{t('pos.addons')}: {addons?.map((addon)=>(`${addon.title}`))?.join(", ")}</p>}

                <div className="flex items-center justify-between gap-2 w-full mt-4">
                  <div className='flex items-center gap-2'>
                    <button onClick={()=>{
                      minusCartItemQuantity(i, quantity);
                    }} className="btn btn-square btn-xs rounded-md bg-restro-gray hover:bg-restro-button-hover">
                      <IconMinus stroke={iconStroke} size={18} />
                    </button>
                    <div className='w-8 h-8 flex items-center justify-center font-semibold'>
                      {quantity}
                    </div>
                    <button onClick={()=>{
                      addCartItemQuantity(i, quantity);
                    }} className = "btn btn-square btn-xs rounded-md bg-restro-gray hover:bg-restro-button-hover">
                      <IconPlus stroke={iconStroke} size={18} />
                    </button>
                  </div>
                  <div>
                    <button onClick={()=>{btnOpenNotesModal(i, notes)}} className = "flex items-center text-sm transition active:scale-95 hover:shadow-lg  px-2 py-1 gap-1 rounded-lg border border-restro-border-green bg-restro-gray hover:bg-restro-button-hover">
                      <div><IconNote size={18} stroke={iconStroke}  /></div> <p>{t('pos.add_notes')}</p>
                    </button>
                  </div>
                </div>

                {/* action btn delete */}
                <button onClick={()=>{
                  removeItemFromCart(i);
                }} className = "flex items-center justify-center absolute right-2 top-2 text-restro-red rounded-full w-6 h-6 transition bg-restro-gray hover:bg-restro-button-hover ">
                  <IconTrash stroke={iconStroke} size={14} />
                </button>
                {/* action btn delete */}
              </div>
            })}
          </div>
          {/* items */}



          {/* actions */}
          <div className = "absolute w-full bottom-0 pb-4 rounded-b-2xl px-4 backdrop-blur border border-t border-b-0 border-l-0 border-r-0 border-restro-border-green">
            <div className="flex items-center flex-col lg:flex-row gap-2 mt-4">
              <button onClick={btnOpenSaveDraftModal} className = "flex items-center flex-1 lg:flex-none text-sm transition active:scale-95 hover:shadow-lg px-2 py-2 gap-1 text-restro-text border rounded-lg border-restro-border-green bg-restro-gray hover:bg-restro-button-hover">
                <IconDeviceFloppy size={18} stroke={iconStroke}  /> {t('pos.draft')}
              </button>

              <button onClick={btnShowSendToKitchenModal} className = "flex-1 flex justify-center items-center text-sm transition active:scale-95 hover:shadow-lg px-2 py-2  gap-1 text-restro-text border rounded-lg border-restro-border-green bg-restro-gray hover:bg-restro-button-hover">
                <div><IconChefHat size={18} stroke={iconStroke}  /></div> <p>{t('pos.send_to_kitchen')}</p>
              </button>
            </div>
            <div className="mt-2">
              <button onClick={btnShowPayAndSendToKitchenModal} className="flex items-center justify-center text-sm transition active:scale-95 hover:shadow-lg px-2 py-2 w-full gap-1 text-white border rounded-lg border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover">
                <div><IconCash size={18} stroke={iconStroke}  /></div> <p>{t('pos.create_receipt_pay')}</p>
              </button>
            </div>
          </div>
          {/* actions */}

        </div>
        {/* cart */}

      </div>


      {/* dialog: notes */}
      <dialog id="modal-notes" className="modal modal-bottom sm:modal-middle">
        <div className = "modal-box border border-restro-border-green dark:rounded-2xl">
          <div className='flex justify-between items-center'>
            <h3 className="font-bold text-lg">{t('pos.add_notes')}</h3>
            <button className = "text-restro-red p-2 rounded-full bg-restro-gray hover:bg-restro-button-hover" onClick={() => document.getElementById('modal-notes').close()}><IconX size={18} stroke={iconStroke}/></button>
          </div>

          <div className="my-4">
            <input type="hidden" ref={dialogNotesIndexRef} />
            <label htmlFor="dialogNotesText" className="mb-1 block text-gray-500 text-sm">{t('pos.notes')} <span className="text-xs text-gray-500">({t('pos.100_max_characters')})</span></label>
            <input ref={dialogNotesTextRef} type="text" name="dialogNotesText" id='dialogNotesText' className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('pos.notes_placeholder')}/>
          </div>

          <div className="modal-action">
            <form method="dialog" className='w-full'>
              {/* if there is a button in form, it will close the modal */}
              <button onClick={()=>{btnAddNotes();}} className='rounded-xl transition active:scale-95 hover:shadow-lg w-full px-4 py-3 text-white border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('pos.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: notes */}

      {/* dialog: category selection */}
      <dialog id="modal-categories" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('pos.filters')}</h3>

          <div className="my-4">
            <label htmlFor="select_category" className='mb-1 text-sm w-full border rounded-lg px-2 py-2 block text-gray-500'>{t('pos.select_category')}</label>
            <select ref={categoryFilterDropdownRef} type="text" name="select_category" id='select_category' className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('pos.select_category')} >
              <option value="all">{t('pos.all')}</option>
              {
                categories.filter((category) => category.is_enabled).map((category, index)=><option value={category.id} key={index}>{category.title}</option>)
              }
            </select>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button onClick={()=>{btnClearSelectedCategory()}} className="rounded-lg hover:bg-gray-200 transition active:scale-95 hover:shadow-lg px-4 py-3 bg-gray-200 text-gray-500">{t('pos.close')}</button>
              <button onClick={()=>{btnApplyCategoryFilter();}} className="rounded-lg hover:bg-green-800 transition active:scale-95 hover:shadow-lg px-4 py-3 bg-restro-green text-white ml-3">{t('pos.apply')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: category selection */}

      {/* dialog: variants & addons */}
      <dialog id="modal-variants-addons" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <div className='flex justify-between items-center'>
            <h3 className="font-bold text-lg">{t('pos.select_variant_addons')}</h3>
            <button className='text-red-500 p-2 rounded-full bg-restro-button-hover' onClick={() => document.getElementById('modal-variants-addons').close()}><IconX size={18} stroke={iconStroke}/></button>
          </div>
          <div className="my-8 flex gap-2">
            <div className="flex-1">
              <h3>{t('pos.variants')}</h3>
              <div className="flex flex-col gap-2 mt-2">
              {
                menuItems.find((item)=>item.id==selectedItemId)?.variants?.map((variant, index)=>{
                  const {id, item_id, title, price} = variant;

                  const fullItem = state.menuItems.find(item => item.id == selectedItemId);

                  const variantRecipeItems = fullItem.recipeItems?.filter(
                    r => r.variant_id === id && r.addon_id === 0
                  );

                  const isLowStock = variantRecipeItems?.some(
                    (r) => parseFloat(r.current_quantity) <= parseFloat(r.min_quantity_threshold)
                  );

                  const quantitiesPossible = variantRecipeItems?.map(r => {
                    const currentQty = parseFloat(r.current_quantity || "0");
                    const requiredQty = parseFloat(r.recipe_quantity || "1");
                    return Math.floor(currentQty / requiredQty);
                  });

                  const minItemsCanBeMade = quantitiesPossible?.length > 0
                    ? Math.min(...quantitiesPossible)
                    : null;

                  return (
                  <label key={index} className='cursor-pointer label justify-start gap-2'>
                    <input type="radio" className='radio' name="variants" id="" value={id} defaultChecked={index==0} />
                    <div>
                    <span className="label-text">{title} - {currency}{price}</span>
                    {isLowStock && (
                        <div className="mt-1 bg-yellow-100 text-yellow-800 text-[10px] font-medium px-1 py-[1px] z-10 w-full flex flex-col items-center gap-[2px] rounded-md">
                          <div className="flex items-center gap-1">
                            <IconAlertTriangleFilled size={12} />
                            <span>{t('inventory.low_stock')} - {minItemsCanBeMade} {t('inventory.qty')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                )})
              }
              </div>
            </div>
            <div className="flex-1">
              <h3>{t('pos.addons')}</h3>
              <div className="flex flex-col gap-2 mt-2">
              {
                state.menuItems.find((item)=>item.id==selectedItemId)?.addons?.map((addon, index)=>{
                  const {id, item_id, title, price} = addon;

                  const fullItem = menuItems.find(item => item.id == selectedItemId);

                  const addonRecipeItems = fullItem.recipeItems?.filter(
                    (r) => r.addon_id === id && r.variant_id === 0
                  );

                  const quantitiesPossible = addonRecipeItems?.map(r => {
                    const currentQty = parseFloat(r.current_quantity || "0");
                    const requiredQty = parseFloat(r.recipe_quantity || "1");
                    return Math.floor(currentQty / requiredQty);
                  });

                  const minItemsCanBeMade = quantitiesPossible?.length > 0
                    ? Math.min(...quantitiesPossible)
                    : null;

                  const isLowStock = addonRecipeItems?.some(
                    (r) => parseFloat(r.current_quantity) <= parseFloat(r.min_quantity_threshold)
                  );

                  return (
                  <label key={index} className='cursor-pointer label justify-start gap-2'>
                    <input type="checkbox" name="addons" id="" className='checkbox  checkbox-sm' value={id} />
                    <div>
                    <span className="label-text">{title} (+{currency}{price})</span>
                    {isLowStock && (
                      <div className="mt-1 bg-yellow-100 text-yellow-800 text-[10px] font-medium px-1 py-[1px] z-10 w-full flex flex-col items-center gap-[2px] rounded-md">
                        <div className="flex items-center gap-1">
                          <IconAlertTriangleFilled size={12} />
                          <span>{t('inventory.low_stock')} - {minItemsCanBeMade} {t('inventory.qty')}</span>
                        </div>
                      </div>
                    )}
                    </div>
                  </label>
                )})
              }
              </div>
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog" className="w-full flex gap-2">
              {/* if there is a button in form, it will close the modal */}
              <button onClick={()=>{btnAddMenuItemToCartWithVariantsAndAddon()}} className='transition active:scale-95 hover:shadow-lg w-full px-4 py-3 text-white rounded-xl border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('pos.add')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: variants & addons */}


      {/* dialog: save draft */}
      <dialog id="modal-save-draft" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('pos.save_cart_items_to_drafts')}</h3>

          <div className="my-4">
            <label htmlFor="draftTitleRef" className="mb-1 block text-gray-500 text-sm">{t('pos.reference')}</label>
            <input ref={draftTitleRef} type="text" name="draftTitleRef" id='draftTitleRef' className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('pos.enter_reference_name')} />
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('pos.close')}</button>
              <button onClick={()=>{btnAddtoDrafts();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('pos.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: save draft */}

      {/* dialog: drafts list */}
      <dialog id="modal-drafts" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box p-0 border border-restro-border-green dark:rounded-2xl'>
          <div className='flex justify-between items-center sticky top-0 backdrop-blur px-6 py-4 bg-restro-gray'>
            <h3 className="font-bold text-lg">{t('pos.drafts')}</h3>
            <form method="dialog" className='flex gap-1'>
              {/* if there is a button in form, it will close the modal */}
              <button onClick={btnClearDrafts} className='transition active:scale-95 text-red-500 p-2 rounded-ful rounded-full w-9 h-9 flex items-center justify-center hover:bg-restro-button-hover'><IconClearAll stroke={iconStroke} /></button>
              <button className='transition active:scale-95 text-restro-text p-2 rounded-ful rounded-full w-9 h-9 flex items-center justify-center hover:bg-restro-button-hover'><IconX stroke={iconStroke} /></button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6 pt-4">
            {drafts.map((draftItem, index)=>{
              const {nameRef, date, cart} = draftItem;

              return <div key={index} className='flex items-center gap-1 rounded-2xl p-2 border border-restro-border-green'>
                <div className='w-12 h-12 rounded-full flex items-center justify-center text-restro-text bg-restro-bg-gray'>
                  <IconClipboardList stroke={iconStroke} />
                </div>
                <div className='flex-1'>
                  <p>{t('pos.ref')}: {nameRef}</p>
                  <p className='text-xs'>{cart?.length} {t('pos.cart_items')}</p>
                  <p className='text-xs text-gray-500'>{date}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={()=>{btnSelectDraftItemToCart(draftItem)}}  className='rounded-full transition active:scale-95 w-6 h-6 flex items-center justify-center text-restro-text bg-restro-gray hover:bg-restro-button-hover'><IconPencil size={14} stroke={iconStroke} /></button>

                  <button onClick={()=>{btnDeleteDraftItem(index)}} className='rounded-full transition active:scale-95 text-red-500 w-6 h-6 flex items-center justify-center bg-restro-gray hover:bg-restro-button-hover'><IconTrash size={14} stroke={iconStroke} /></button>
                </div>
              </div>
            })}
          </div>


        </div>
      </dialog>
      {/* dialog: drafts list */}

      <DialogAddCustomer defaultValue={state.addCustomerDefaultValue} onSuccess={(phone, name)=>{
        setCustomer({value: phone, label: `${name} - (${phone})`})
        document.getElementById("modal-search-customer").close();
      }} />

      {/* dialog: search customer */}
      <dialog id="modal-search-customer" className="modal modal-bottom sm:modal-middle">
      <div className='modal-box border border-restro-border-green dark:rounded-2xl h-96'>
          <div className="flex items-center justify-between">
            
            <h3 className="font-bold text-lg">{t('pos.search_customer')}</h3>
            <form method="dialog">
              <button onClick={btnClearSearchCustomer} className='btn btn-circle btn-sm text-restro-text border-none bg-restro-gray hover:bg-restro-button-hover'><IconRotate size={18} stroke={iconStroke}/></button>
              <button className='ml-2 btn btn-circle btn-sm text-red-500 border-none bg-restro-gray hover:bg-restro-button-hover'><IconX size={18} stroke={iconStroke}/></button>
            </form>
          </div>

          <div className="my-4 flex items-end gap-2">
            <div className='flex-1'>
              <label htmlFor="searchCustomerRef" className="mb-1 block text-gray-500 text-sm">{t('pos.search_customer')}</label>
              {/* <input ref={searchCustomerRef} type="search" name="searchCustomerRef" id='searchCustomerRef' className="text-sm w-full border rounded-lg px-4 py-2 bg-gray-50 outline-restro-border-green-light" placeholder="Enter Customer Phone here..." /> */}
              <AsyncCreatableSelect
                menuPlacement='auto'
                loadOptions={searchCustomersAsync}
                isClearable
                noOptionsMessage={(v)=>{return t('pos.type_to_find')}}
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
                    backgroundColor: theme === "black" ? "#ffffff" : "#d1d5db", // divider color based on theme
                  }),
                }}
              />
            </div>
          </div>
        </div>
      </dialog>
      {/* dialog: search customer */}

      {/* dialog: send to kitchen summary */}
      <dialog id="modal-send-kitchen-summary" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-lg">{t('pos.send_order_to_kitchen')}</h3>
            <form method='dialog'>
              <button className='text-red-500 p-2 rounded-full bg-restro-gray hover:bg-restro-button-hover'><IconX size={18} stroke={iconStroke} /></button>
            </form>
          </div>

          <div className="my-8 space-y-4 px-1">
            {[
              { label: t('pos.items_net_total'), value: state.itemsTotal },
              { label: t('pos.tax_total'), value: state.taxTotal, prefix: "+" },
              { label: t('pos.service_charge_total'), value: state.serviceChargeTotal, prefix: "+" },
            ].map(({ label, value, prefix = "" }, index) => (
              <div key={index} className='flex items-center justify-between text-restro-text'>
                <p>{label}</p>
                <p className="text-lg">
                  {prefix}{currency}{value.toFixed(2)}
                </p>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-gray-300 dark:border-restro-bg-gray pt-2 mt-2">
              <p className="text-xl font-medium">{t('pos.payable_total')}</p>
              <p className="text-xl font-bold text-restro-green">
                {currency}{state.payableTotal.toFixed(2)}
              </p>
            </div>
          </div>


          <div className="modal-action">
            <form method="dialog" className="w-full">
              {/* if there is a button in form, it will close the modal */}
              <button onClick={btnSendToKitchen} className='w-full rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('pos.send_to_kitchen')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: send to kitchen summary */}

      {/* dialog: collect payment & send to kitchen summary */}
      <dialog id="modal-pay-and-send-kitchen-summary" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t('pos.collect_payment_send_order_to_kitchen')}</h3>
            <form method='dialog'>
              <button className='text-red-500 p-2 rounded-full bg-restro-gray hover:bg-restro-button-hover'><IconX size={18} stroke={iconStroke} /></button>
            </form>
          </div>

          <div className="my-8 space-y-4 px-1">
            {[
              { label: t('pos.items_net_total'), value: state.itemsTotal },
              { label: t('pos.tax_total'), value: state.taxTotal, prefix: "+" },
              { label: t('pos.service_charge_total'), value: state.serviceChargeTotal, prefix: "+" },
            ].map(({ label, value, prefix = "" }, index) => (
              <div key={index} className='flex items-center justify-between' text-restro-text>
                <p>{label}</p>
                <p className="text-lg">
                  {prefix}{currency}{value.toFixed(2)}
                </p>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-gray-300 dark:border-restro-bg-gray pt-2 mt-2">
              <p className="text-xl font-medium">{t('pos.payable_total')}</p>
              <p className="text-xl font-bold text-restro-green">
                {currency}{state.payableTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <div
            className={`grid gap-2 grid-cols-3`
          }
          >
            {paymentTypes.map((paymentType, i)=>{
              const uniqueId = `icon-${paymentType?.id}`;
              return <label key={i} className=''>
                <input
                checked={state?.selectedPaymentType == paymentType?.id}
                onChange={e=>{
                  setState({
                    ...state,
                    selectedPaymentType: e.target.value,
                  });
                }} type="radio" name="payment_type" id={uniqueId} value={paymentType?.id} className='peer hidden' />
                <label htmlFor={uniqueId} className='border dark:border-restro-gray rounded-2xl flex items-center justify-center gap-1 flex-col px-4 py-3 peer-checked:border-restro-green peer-checked:text-restro-green peer-checked:font-bold cursor-pointer transition'>
                  {paymentType?.icon ? <div>{PAYMENT_ICONS[paymentType?.icon]}</div>:<></>}
                  <p className='text-xs'>{paymentType.title}</p>
                </label>
              </label>
            })}
          </div>

          <div className="modal-action flex items-center justify-center w-full">
            
            {/* if there is a button in form, it will close the modal */}
            <button onClick={()=>{btnPayAndSendToKitchen();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white w-full fborder border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('pos.collect_payment_send_to_kitchen')}</button>
            
          </div>
        </div>
      </dialog>
      {/* dialog: collect payment & send to kitchen summary */}

      {/* dialog: print-token */}
      <dialog id="modal-print-token" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg text-center">{t('pos.order_sent_to_kitchen')}</h3>

          <div className="my-8 mx-auto w-fit">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center bg-restro-green text-white rounded-full">
                <IconCheck stroke={iconStroke} size={32} />
              </div>
              <p className="font-bold text-5xl">#{state?.tokenNo}</p>
            </div>

            <p className="text-sm mt-4 text-center">{t('pos.order_id')}: {state?.orderId}</p>
          </div>

          <div className="modal-action justify-center">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t('pos.close')}</button>
              <button onClick={btnPrintTokenOnly}className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t('pos.print_token')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: print-token */}

      {/* dialog: qrorders */}
      <dialog id="modal-qrorders" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl p-0'>
          <div className="flex justify-between items-center sticky top-0 px-6 py-4">
            <h3 className="font-bold text-lg">{t('pos.qr_orders')}</h3>
            <form method="dialog" className='flex gap-2'>
              {/* if there is a button in form, it will close the modal */}
              <button onClick={btnClearQROrders} className="rounded-full hover:bg-red-200 transition active:scale-95 bg-red-50 dark:bg-red-500 dark:text-white text-red-500 w-9 h-9 flex items-center justify-center"><IconClearAll stroke={iconStroke} /></button>
              <button className="rounded-full hover:bg-gray-200 dark:hover:bg-black transition active:scale-95 bg-gray-100 dark:bg-restro-gray text-gray-500 dark:text-white w-9 h-9 flex items-center justify-center"><IconX stroke={iconStroke} /></button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6">
            {state?.qrOrders?.map((qrOrder, index)=>{
              const { customer_type, customer_id, customer_name, table_id, table_title, items, id } = qrOrder;

              return <div key={index} className='flex items-center gap-1 rounded-2xl p-2 border dark:border-restro-gray'>
                <div className='w-12 h-12 rounded-full bg-gray-100 dark:bg-restro-gray dark:text-white text-gray-500 flex items-center justify-center'>
                  <IconClipboardList stroke={iconStroke} />
                </div>
                <div className='flex-1'>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <IconArmchair2 stroke={iconStroke} size={14} />
                    <p className=''>{table_title || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <IconUser stroke={iconStroke} size={14} />
                    <p className=''>{customer_type == "WALKIN" ? "WALKIN" : customer_name}</p>
                  </div>
                  <p className='text-xs'>{items?.length} {t('pos.cart_items')}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={()=>{btnSelectQROrder(qrOrder)}} className='rounded-full transition active:scale-95 w-6 h-6 flex items-center justify-center text-restro-text bg-restro-gray hover:bg-restro-button-hover'><IconPencil size={14} stroke={iconStroke} /></button>

                  <button onClick={()=>{btnCancelQROrder(id)}} className='rounded-full transition active:scale-95 text-red-500 w-6 h-6 flex items-center justify-center bg-restro-gray hover:bg-restro-button-hover'><IconTrash size={14} stroke={iconStroke} /></button>
                </div>
              </div>
            })}
          </div>
        </div>
      </dialog>
      {/* dialog: qrorders */}
    </Page>
  )
}
