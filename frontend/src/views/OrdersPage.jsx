import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Page from "../components/Page";
import {
  cancelKitchenOrder,
  completeKitchenOrder,
  getCompleteOrderPaymentSummary,
  getInvoiceIdFromOrderId,
  getOrders,
  getOrdersInit,
  payAndCompleteKitchenOrder,
  updateKitchenOrderItemStatus,
} from "../controllers/orders.controller";
import { toast } from "react-hot-toast";
import {
  IconArmchair,
  IconBoxSeam,
  IconCash,
  IconCheck,
  IconChecks,
  IconClock,
  IconDotsVertical,
  IconExternalLink,
  IconReceipt,
  IconRefresh,
  IconStars,
  IconX,
} from "@tabler/icons-react";
import { FRONTEND_DOMAIN, VITE_BACKEND_SOCKET_IO, iconStroke } from "../config/config";
import { CURRENCIES } from "../config/currencies.config";
import { PAYMENT_ICONS } from "../config/payment_icons";
import { setDetailsForReceiptPrint } from "../helpers/ReceiptHelper";

import { SocketContext } from "../contexts/SocketContext";
import { initSocket } from "../utils/socket";
import { textToSpeech } from "../utils/textToSpeech";
import { getUserDetailsInLocalStorage } from "../helpers/UserDetails";
import QRCode from "qrcode"
import { getQRMenuLink } from "../helpers/QRMenuHelper";
import { useTheme } from "../contexts/ThemeContext";
import clsx from "clsx";

export default function OrdersPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const printReceiptRef = useRef();
  const user = getUserDetailsInLocalStorage();
  const { socket, isSocketConnected } = useContext(SocketContext);

  const [state, setState] = useState({
    kitchenOrders: [],
    printSettings: null,
    storeSettings: null,
    paymentTypes: [],
    isLoading: true,

    cancelOrderIds: [],
    completeOrderIds: [],
    completeTokenIds: "",

    currency: null,

    summaryNetTotal: 0,
    summaryTaxTotal: 0,
    summaryServiceChargeTotal:0,
    summaryTotal: 0,
    summaryOrders: [],
    order: null,

    selectedPaymentType: null,

    feedbackInvoiceId: null,
    feedbackCustomerId: null,
    feedbackQRCode: null,
  });

  useEffect(() => {
    _init();
    _initSocket();

    return () => {
      // socket.disconnect()
      socket.off('new_order')
      socket.off('order_update')
    }
  }, []);

  const {
    kitchenOrders,
    printSettings,
    storeSettings,
    paymentTypes,
    isLoading,
    currency,
  } = state;

  const _init = async () => {
    try {
      const [ordersResponse, ordersInitResponse] = await Promise.all([
        getOrders(),
        getOrdersInit(),
      ]);

      if (ordersResponse.status == 200 && ordersInitResponse.status == 200) {
        const orders = ordersResponse?.data || [];
        const ordersInit = ordersInitResponse.data;

        const currency = CURRENCIES.find(
          (c) => c.cc == ordersInit?.storeSettings?.currency
        );

        setState({
          ...state,
          kitchenOrders: orders,
          printSettings: ordersInit.printSettings || {},
          storeSettings: ordersInit.storeSettings || {},
          paymentTypes: ordersInit.paymentTypes || {},
          currency: currency?.symbol,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Error loading orders! Please try later!");

      setState({
        ...state,
        isLoading: false,
      });
    }
  };

  const refreshOrders = async () => {
    try {
      toast.loading(t('orders.loading_message'));
      const res = await getOrders();
      toast.dismiss();
      if (res.status == 200) {
        toast.success(t('orders.orders_loaded'));
        setState({
          ...state,
          kitchenOrders: res.data,
          isLoading: false,
        });
      }
    } catch (error) {
      const message =
        error.response.data.message ||
        "Error loading orders! Please try later!";
      console.error(error);
      toast.dismiss();
      toast.error(message);
      setState({
        ...state,
        isLoading: false,
      });
    }
  };

  const _initSocket = () => {
    const audio = new Audio("/new_order_sound.mp3");
    if (isSocketConnected) {
      socket.emit("authenticate", user.tenant_id);
      socket.on("new_order", (payload) => {
        console.log(payload);
        // textToSpeech(`New order received, token number: ${payload}`)
        audio.play();
        refreshOrders();
      });

      socket.on("order_update", () => {
        console.log("Order update");
        refreshOrders();
      });
    } else {
      initSocket();
      socket.emit("authenticate", user.tenant_id);
      socket.on("new_order", (payload) => {
        console.log(payload);
        // textToSpeech(`New order received, token number: ${payload}`);
        audio.play();
        refreshOrders();
      });

      socket.on("order_update", () => {
        console.log("Order update");
        refreshOrders();
      });
    }
  };

  const sendOrderUpdateEvent = () => {
    const user = getUserDetailsInLocalStorage();

    if (isSocketConnected) {
      socket.emit("order_update_backend", {}, user.tenant_id);
    } else {
      // Handle disconnected state (optional)
      initSocket();
      socket.emit("order_update_backend", {}, user.tenant_id);
    }
  };

  if (state.isLoading) {
    return <Page>{t('orders.loading_message')}</Page>;
  }

  const btnChangeOrderItemStatus = async (orderItemId, status) => {
    try {
      toast.loading(t('orders.loading_message'));
      const res = await updateKitchenOrderItemStatus(orderItemId, status);
      toast.dismiss();
      if (res.status == 200) {
        sendOrderUpdateEvent();
        await refreshOrders();
        toast.success(res.data.message);
        document.getElementById("modal-order-item-status-update").showModal();
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Error processing your request, Please try later!";
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };

  const btnShowCancelOrderModal = (orderIds) => {
    setState({
      ...state,
      cancelOrderIds: orderIds,
    });
    document.getElementById("modal-order-cancel").showModal();
  };
  const btnCancelOrder = async () => {
    try {
      toast.loading(t('orders.loading_message'));
      const res = await cancelKitchenOrder(state.cancelOrderIds);
      toast.dismiss();
      if (res.status == 200) {
        sendOrderUpdateEvent();
        await refreshOrders();
        toast.success(res.data.message);
        document.getElementById("modal-order-cancel").close();
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Error processing your request, Please try later!";
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };

  const btnShowCompleteOrderModal = (orderIds) => {
    setState({
      ...state,
      completeOrderIds: orderIds,
    });
    document.getElementById("modal-order-complete").showModal();
  };
  const btnCompleteOrder = async () => {
    try {
      toast.loading(t('orders.loading_message'));
      const res = await completeKitchenOrder(state.completeOrderIds);
      toast.dismiss();
      if (res.status == 200) {
        sendOrderUpdateEvent();
        await refreshOrders();
        toast.success(res.data.message);
        document.getElementById("modal-order-complete").close();
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Error processing your request, Please try later!";
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };

  const btnShowPayAndComplete = async (orderIds, order) => {
    try {
      toast.loading(t('orders.loading_message'));
      const res = await getCompleteOrderPaymentSummary(orderIds);
      toast.dismiss();

      if (res.status == 200) {
        const { subtotal, taxTotal, serviceChargeTotal, total, orders } = res.data;


        const tokenNoArray = orders.map(o=>o.token_no);
        const tokens = tokenNoArray.join(",");

        setState({
          ...state,
          summaryNetTotal: subtotal,
          summaryTaxTotal: taxTotal,
          summaryServiceChargeTotal:serviceChargeTotal,
          summaryTotal: total,
          summaryOrders: orders,
          completeOrderIds: orderIds,
          completeTokenIds: tokens,
          order: order,
        });

        document.getElementById("modal-order-summary-complete").showModal();
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Error processing your request, Please try later!";
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };
  const btnPayAndComplete = async () => {
    const isPrintReceipt = printReceiptRef.current.checked || false;

    if(!state.selectedPaymentType) {
      return toast.error(t('orders.select_payment_method'));
    }
    try {
      toast.loading(t('orders.loading_message'));
      const res = await payAndCompleteKitchenOrder(
        state.completeOrderIds,
        state.summaryNetTotal,
        state.summaryTaxTotal,
        state.summaryServiceChargeTotal,
        state.summaryTotal,
        state.selectedPaymentType,
      );
      toast.dismiss();
      if (res.status == 200) {
        const invoiceId = res.data?.invoiceId || null;
        const customerId = res.data?.customerId || null;

        sendOrderUpdateEvent();
        await refreshOrders();
        toast.success(res.data.message);
        document.getElementById("modal-order-summary-complete").close();

        if (isPrintReceipt) {
          const { table_id, table_title, floor } = state.order;

          const orders = [];
          const orderIds = state.completeOrderIds.join(", ");

          for (const o of state.summaryOrders) {
            const items = o.items;
            items.forEach((i) => {
              const variant = i.variant_id
                ? {
                    id: i.variant_id,
                    title: i.variant_title,
                    price: i.variant_price,
                  }
                : null;
              orders.push({
                ...i,
                title: i.item_title,
                addons_ids:
                  i?.addons?.length > 0 ? i?.addons?.map((a) => a.id) : [],
                variant: variant,
              });
            });
          }

          const {
            customer_id,
            customer_type,
            customer_name,
            date,
            delivery_type,
          } = state.summaryOrders[0];

          const paymentType = paymentTypes.find((v)=>v.id == state.selectedPaymentType);
          let paymentMethodText;
          if(paymentType) {
            paymentMethodText = paymentType.title;
          }

          setDetailsForReceiptPrint({
            cartItems: orders,
            deliveryType: delivery_type,
            customerType: customer_type,
            customer: { id: customer_id, name: customer_name },
            tableId: table_id,
            currency,
            storeSettings,
            printSettings,
            itemsTotal: state.summaryNetTotal,
            taxTotal: state.summaryTaxTotal,
            serviceChargeTotal:state.summaryServiceChargeTotal,
            payableTotal: state.summaryTotal,
            tokenNo: state.completeTokenIds,
            orderId: orderIds,
            paymentMethod: paymentMethodText
          });

          const receiptWindow = window.open(
            "/print-receipt",
            "_blank",
            "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400"
          );
          receiptWindow.onload = (e) => {
            setTimeout(() => {
              receiptWindow.print();
            }, 400);
          };
        }



        // Feedback
        const link = getQRMenuLink(storeSettings?.unique_qr_code) + `/feedback?_ref=${invoiceId}${customerId?`&_cref=${customerId}`:''}`

        const qrDataURL = await QRCode.toDataURL(link, {width: 1080});

        if(storeSettings?.is_feedback_enabled) {
          document.getElementById("modal-collect-feedback").showModal();
        }

        setState((prev)=>({...prev,
          selectedPaymentType: null,
          feedbackInvoiceId: invoiceId,
          feedbackCustomerId: customerId,
          feedbackQRCode: qrDataURL
        }));
        // Feedback
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Error processing your request, Please try later!";
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };

  const btnPrintReceipt = async (orderIdsArr, tokens) => {
    try {
      toast.loading(t('orders.loading_message'));
      const res = await getCompleteOrderPaymentSummary(orderIdsArr);
      toast.dismiss();

      if (res.status == 200) {
        const { subtotal, taxTotal, serviceChargeTotal, total, orders: ordersArr } = res.data;

        const orders = [];
        const orderIds = orderIdsArr.join(", ");

        for (const o of ordersArr) {
          const items = o.items;
          items.forEach((i) => {
            const variant = i.variant_id
              ? {
                  id: i.variant_id,
                  title: i.variant_title,
                  price: i.variant_price,
                }
              : null;
            orders.push({
              ...i,
              title: i.item_title,
              addons_ids:
                i?.addons?.length > 0 ? i?.addons?.map((a) => a.id) : [],
              variant: variant,
            });
          });
        }

        const {
          customer_id,
          customer_type,
          customer_name,
          date,
          delivery_type,
        } = ordersArr;

        setDetailsForReceiptPrint({
          cartItems: orders,
          deliveryType: delivery_type,
          customerType: customer_type,
          customer: { id: customer_id, name: customer_name },
          tableId: null,
          currency,
          storeSettings,
          printSettings,
          itemsTotal: subtotal,
          taxTotal: taxTotal,
          serviceChargeTotal:serviceChargeTotal,
          payableTotal: total,
          tokenNo: tokens,
          orderId: orderIds,
        });

        const receiptWindow = window.open(
          "/print-receipt",
          "_blank",
          "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400"
        );
        receiptWindow.onload = (e) => {
          setTimeout(() => {
            receiptWindow.print();
          }, 400);
        };
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Error processing your request, Please try later!";
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };

  const btnCollectFeedback = async (orderIdsArr) => {
    try {
      toast.loading(t('orders.loading_message'));
      const res = await getInvoiceIdFromOrderId(orderIdsArr);
      toast.dismiss();

      if (res.status == 200) {
        const { invoiceId, customerId } = res.data;

        if(!invoiceId) {
          toast.error("Please finish the order to collect feedback!");
          return;
        }

        const link = getQRMenuLink(storeSettings?.unique_qr_code) + `/feedback?_ref=${invoiceId}${customerId?`&_cref=${customerId}`:''}`

        const qrDataURL = await QRCode.toDataURL(link, {width: 1080});

        setState({
          ...state,
          feedbackInvoiceId: invoiceId,
          feedbackCustomerId: customerId,
          feedbackQRCode: qrDataURL
        })

        document.getElementById("modal-collect-feedback").showModal();
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Error processing your request, Please try later!";
      toast.dismiss();
      console.error(error);
      toast.error(message);
    }
  };

  const btnOpenFeedbackLink = () => {
    const a = document.createElement("a");
    a.href = getQRMenuLink(storeSettings?.unique_qr_code) + `/feedback?_ref=${state.feedbackInvoiceId}${state.feedbackCustomerId?`&_cref=${state.feedbackCustomerId}`:''}`;
    a.target = '_blank';
    a.click();
    a.remove();

    document.getElementById("modal-collect-feedback").close();
  };

  return (
    <Page>
      <div className="flex items-center gap-6">
        <h3 className="text-3xl font-light">{t('orders.title')}</h3>
        <button
          onClick={refreshOrders}
          className = "flex items-center gap-1 rounded-xl text-restro-text shadow-none transition active:scale-95 px-2 py-1 bg-restro-gray hover:bg-restro-button-hover border border-restro-border-green"
        >
          <IconRefresh size={22} stroke={iconStroke} /> {t('orders.refresh')}
        </button>
      </div>

      {kitchenOrders?.length == 0 && (
        <div className="w-full h-[calc(100vh-15vh)] flex gap-4 flex-col items-center justify-center">
          <img
            src="/assets/illustrations/orders-not-found.webp"
            alt={t('orders.no_orders_img_alt')}
            className="w-1/2 md:w-60"
          />
          <p className="text-gray-400">{t('orders.no_orders')}</p>
        </div>
      )}

      {kitchenOrders?.length > 0 && (
        <div className={`mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 `}>
          {kitchenOrders.map((order, index) => {
            const { table_id, table_title, floor, orders, order_ids } = order;

            const tokenNoArray = orders.map(o=>o.token_no);
            const tokens = tokenNoArray.join(",")

            const isPaid = orders.every((o)=>o.payment_status=='paid');

            return (
              <div
                key={index}
                className = "flex flex-col divide-y divide-dashed divide-gray-200 dark:divide-gray-700 px-4 py-5 border rounded-2xl border-restro-border-green"
              >
                <div className="flex md:items-center flex-col md:flex-row md:justify-between md:text-center gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <div className = "flex w-12 h-12 rounded-full items-center justify-center bg-restro-gray">
                      {table_id ? (
                        <IconArmchair size={24} stroke={iconStroke} />
                      ) : (
                        <IconReceipt size={24} stroke={iconStroke} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold">
                        {table_id ? `${table_title}` : "Dine Out / Delivery"}
                      </p>
                      {floor && <p className="text-sm">{floor}</p>}
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      role="button"
                      className="m-1 btn btn-sm btn-circle bg-transparent border-none shadow-none p-2 rounded-full hover:bg-restro-button-hover"
                    >
                      <IconDotsVertical size={18} stroke={iconStroke} />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-52 border border-restro-border-green "
                    >
                      <li>
                        <button
                          className="flex items-center gap-2 bg-transparent border-none shadow-none "
                          onClick={() => {
                            btnPrintReceipt(order_ids, tokens);
                          }}
                        >
                          <IconReceipt size={18} stroke={iconStroke} /> {t('orders.print_receipt')}
                        </button>
                      </li>
                      {storeSettings?.is_feedback_enabled ? <li>
                        <button
                          className="flex items-center gap-2 bg-transparent border-none shadow-none "
                          onClick={() => {
                            btnCollectFeedback(order_ids);
                          }}
                        >
                          <IconStars size={18} stroke={iconStroke} /> {t('orders.collect_feedback')}
                        </button>
                      </li>:<></>}
                      <li>
                        <button
                          className="flex items-center gap-2 bg-transparent border-none shadow-none text-restro-red"
                          onClick={() => {
                            btnShowCancelOrderModal(order_ids);
                          }}
                        >
                          <IconX size={18} stroke={iconStroke} /> {t('orders.cancel')}
                        </button>
                      </li>
                      <li>
                        <button
                          className="flex items-center gap-2 bg-transparent border-none shadow-none text-restro-green"
                          onClick={() => {
                            if(isPaid == false) {
                              toast.error(t('orders.payment_not_collected_error'));
                              return;
                            }
                            btnShowCompleteOrderModal(order_ids);
                          }}
                        >
                          <IconCheck size={18} stroke={iconStroke} /> {t('orders.complete')}
                        </button>
                      </li>
                      <li>
                        <button
                          className="flex items-center gap-2 bg-transparent border-none shadow-none "
                          onClick={() => {
                            if(isPaid == true) {
                              toast.error(t('orders.payment_already_collected_error'));
                              return;
                            }
                            btnShowPayAndComplete(order_ids, order);
                          }}
                        >
                          <IconCash size={18} stroke={iconStroke} /> {t('orders.pay_complete')}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {orders.map((o, i) => {
                  const {
                    id,
                    date,
                    delivery_type,
                    customer_type,
                    customer_id,
                    customer_name,
                    status,
                    payment_status,
                    token_no,
                    items,
                  } = o;

                  return (
                    <div className = "py-2 px-2 mt-2 mb-2 rounded-xl bg-gray-50 dark:bg-restro-gray" key={i}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center justify-center flex-col text-center">
                          <p>{t('orders.token')}</p>
                          <div className = "w-12 h-12 flex items-center justify-center font-bold rounded-full bg-gray-700 dark:bg-[#0a0a0a] text-white" >
                            {token_no}
                          </div>
                        </div>
                        <div className="text-end">
                          <p>
                            {new Intl.DateTimeFormat("en-US", {
                              timeStyle: "short",
                            }).format(new Date(date))}
                          </p>
                          <p className={clsx("flex gap-2 items-center text-sm", {
                            "text-amber-500": payment_status == "pending",
                            "text-restro-green": payment_status == "paid",
                          })}>
                            {" "}
                            <IconCash stroke={iconStroke} size={18} />{" "}
                            {payment_status.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* order items */}
                      <div className="mt-4 flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((item, index) => {
                          const {
                            id: orderItemId,
                            order_id,
                            item_id,
                            item_title,
                            variant_id,
                            variant_title,
                            quantity,
                            status,
                            date,
                            addons,
                            notes,
                          } = item;

                          const addonsText =
                            addons?.length > 0
                              ? addons?.map((a) => a.title)?.join(", ")
                              : null;

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 py-2"
                            >
                              {/* status */}
                              {status == "preparing" && (
                                <IconClock
                                  stroke={iconStroke}
                                  className="text-restro-yellow"
                                />
                              )}
                              {status == "completed" && (
                                <IconCheck
                                  stroke={iconStroke}
                                  className="text-restro-green"
                                />
                              )}
                              {status == "cancelled" && (
                                <IconX
                                  stroke={iconStroke}
                                  className="text-restro-red"
                                />
                              )}
                              {status == "delivered" && (
                                <IconChecks
                                  stroke={iconStroke}
                                  className="text-restro-green"
                                />
                              )}
                              {/* status */}

                              {/* item title */}
                              <div className="flex-1">
                                <p>
                                  {item_title} {variant_title} x {quantity}
                                </p>
                                {addonsText && (
                                  <p className="text-sm text-gray-700 dark:text-white">
                                    Addons: {addonsText}
                                  </p>
                                )}
                                {notes && (
                                  <p className="text-sm text-gray-700 dark:text-white">
                                    Notes: {notes}
                                  </p>
                                )}
                              </div>
                              {/* item title */}

                              {/* action */}
                              <div className="dropdown dropdown-left">
                                <div
                                  tabIndex={0}
                                  role="button"
                                  className="btn btn-sm btn-circle bg-transparent border-none shadow-none m-1"
                                >
                                  <IconDotsVertical
                                    size={18}
                                    stroke={iconStroke}
                                  />
                                </div>
                                <ul
                                  tabIndex={0}
                                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 w-52 rounded-lg border border-restro-border-green"
                                >
                                  <li>
                                    <button
                                      className="flex items-center gap-2 bg-transparent border-none shadow-none text-restro-yellow"
                                      onClick={() => {
                                        btnChangeOrderItemStatus(
                                          orderItemId,
                                          "preparing"
                                        );
                                      }}
                                    >
                                      <IconClock
                                        size={18}
                                        stroke={iconStroke}
                                      />{" "}
                                      {t('orders.preparing')}
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="flex items-center gap-2 bg-transparent border-none shadow-none text-restro-green"
                                      onClick={() => {
                                        btnChangeOrderItemStatus(
                                          orderItemId,
                                          "completed"
                                        );
                                      }}
                                    >
                                      <IconCheck
                                        size={18}
                                        stroke={iconStroke}
                                      />{" "}
                                      {t('orders.completed')}
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="flex items-center gap-2 bg-transparent border-none shadow-none "
                                      onClick={() => {
                                        btnChangeOrderItemStatus(
                                          orderItemId,
                                          "delivered"
                                        );
                                      }}
                                    >
                                      <IconChecks
                                        size={18}
                                        stroke={iconStroke}
                                      />{" "}
                                      {t('orders.delivered')}
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="flex items-center gap-2 bg-transparent border-none shadow-none text-restro-red"
                                      onClick={() => {
                                        btnChangeOrderItemStatus(
                                          orderItemId,
                                          "cancelled"
                                        );
                                      }}
                                    >
                                      <IconX size={18} stroke={iconStroke} />{" "}
                                      {t('orders.cancelled')}
                                    </button>
                                  </li>
                                </ul>
                              </div>
                              {/* action */}
                            </div>
                          );
                        })}
                      </div>
                      {/* order items */}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* dialog: successful order item status update */}
      <dialog id="modal-order-item-status-update" className="modal">
        <div className = "modal-box border border-restro-border-green rounded-2xl">
          <h3 className="font-bold text-lg">{t('orders.success')}</h3>
          <p className="py-4">{t('orders.order_item_status_success')}</p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn transition active:scale-95 hover:shadow-lg px-4 py-3 border border-restro-border-green rounded-xl dark:hover:border-restro-gray">{t('orders.close')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: successful order item status update */}

      {/* dialog: cancel order */}
      <dialog id="modal-order-cancel" className="modal">
        <div className="modal-box border border-restro-border-green rounded-2xl ">
          <h3 className="font-bold text-lg">{t('orders.alert')}</h3>
          <p className="py-4">
            {t('orders.cancel_order_alert')}
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn transition active:scale-95 hover:shadow-lg px-4 py-3 border border-restro-border-green rounded-xl bg-restro-gray hover:bg-restro-button-hover">{t('orders.dismiss')}</button>
              <button
                onClick={() => {
                  btnCancelOrder();
                }}
                className={`ml-2 btn bg-restro-red text-white hover:bg-red-500 transition active:scale-95 px-4 py-3 rounded-xl border-restro-red hover:border-red-600`}
              >
                {t('orders.confirm')}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: cancel order */}

      {/* dialog: complete order */}
      <dialog id="modal-order-complete" className="modal">
        <div className="modal-box border border-restro-border-green rounded-2xl ">
          <h3 className="font-bold text-lg">{t('orders.alert')}</h3>
          <p className="py-4">
            {t('orders.complete_order_alert')}
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn border-restro-gray bg-restro-gray rounded-xl hover:bg-restro-button-hover">{t('orders.dismiss')}</button>
              <button
                onClick={() => {
                  btnCompleteOrder();
                }}
                className="ml-2 btn bg-restro-green border-restro-green-light hover:bg-restro-green-button-hover rounded-xl"
              >
                {t('orders.confirm')}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: complete order */}

      {/* dialog: complete order & payment summary */}
      <dialog id="modal-order-summary-complete" className="modal">
        <div className="modal-box border border-restro-border-green rounded-2xl ">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t('orders.pay_complete_order')}</h3>
            <form method='dialog'>
              <button className="btn btn-sm btn-circle text-restro-red border-none transition active:scale-95 hover:bg-restro-gray"><IconX size={18} stroke={iconStroke} /></button>
            </form>
          </div>

          <div className="my-6">
            <div className="my-8 space-y-4 px-1">
            {[
              { label: t('orders.items_net_total'), value: state.summaryNetTotal },
              { label: t('orders.tax_total'), value: state.summaryTaxTotal, prefix: "+" },
              { label: t('orders.service_charge_total'), value: state.summaryServiceChargeTotal, prefix: "+" },
            ].map(({ label, value, prefix = "" }, index) => (
              <div key={index} className="flex items-center justify-between text-restro-text">
                <p>{label}</p>
                <p className="text-lg">
                  {prefix}{currency}{value.toFixed(2)}
                </p>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-gray-300 dark:border-restro-bg-gray pt-2 mt-2">
              <p className="text-xl font-medium">{t('orders.payable_total')}</p>
              <p className="text-xl font-bold text-restro-green">
                {currency}{state.summaryTotal.toFixed(2)}
              </p>
            </div>
          </div>

            <label
              htmlFor="print_receipt"
              className="mt-4 w-full flex justify-end items-center gap-2 "
            >
              <input
                type="checkbox"
                className="checkbox rounded-lg"
                id="print_receipt"
                ref={printReceiptRef}
              />{" "}
              {t('orders.print_receipt_option')}
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
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

          <div className="modal-action">
            
              {/* if there is a button in form, it will close the modal */}
              <button
                onClick={() => {
                  btnPayAndComplete();
                }}
                className="w-full rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 bg-restro-green hover:bg-restro-green-button-hover"
              >
                {t('orders.pay_complete_order')}
              </button>
           
          </div>
        </div>
      </dialog>
      {/* dialog: complete order & payment summary */}

      {/* dialog: complete order */}
      <dialog id="modal-collect-feedback" className="modal">
        <div className="modal-box border border-restro-border-green rounded-2xl ">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-restro-gray">
            <IconStars stroke={iconStroke} />
          </div>
          <h3 className="mt-4 font-bold text-lg text-center">{t('orders.collect_feedback')}</h3>

          <div className="absolute top-6 right-6">
            <form method="dialog">
              <button className="btn btn-sm btn-circle border-none transition active:scale-95 text-restro-red hover:bg-restro-button-hover">
                <IconX stroke={iconStroke} size={18} />
              </button>
            </form>
          </div>

          <div className="my-4">
            <img src={state.feedbackQRCode} alt={t('orders.feedback_qr_img_alt')} className="w-52 h-52 mx-auto border rounded-lg" />
          </div>

          <p className="text-center italic mb-10" dangerouslySetInnerHTML={{__html: t('orders.feedback_message')}}>

          </p>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 border-b border-restro-gray"></div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-restro-gray">
              OR
            </div>
            <div className="flex-1 border-b border-restro-gray"></div>
          </div>

          <div className="modal-action justify-center">
            <form method="dialog">
              <button
                onClick={() => {
                  btnOpenFeedbackLink();
                }}
                className="btn ml-2 transition active:scale-95 hover:shadow-lg px-4 py-3 border bg-restro-green hover:bg-restro-green-button-hover text-white rounded-xl"
              >
                {t('orders.open_in_new_tab')} <IconExternalLink stroke={iconStroke} />
              </button>
            </form>
          </div>
          </div>
      </dialog>
      {/* dialog: complete order */}

    </Page>
  );
}
