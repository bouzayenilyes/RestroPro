const { getOrdersDB, updateOrderItemStatusDB, cancelOrderDB, completeOrderDB, getOrdersPaymentSummaryDB, createInvoiceDB, completeOrdersAndSaveInvoiceIdDB, getInvoiceIdFromOrderIdsDB, getEncryptedInvoiceIdDB } = require("../services/orders.service");
const {
  getPaymentTypesDB,
  getPrintSettingDB,
  getStoreSettingDB,
  getServiceChargeDB,
} = require("../services/settings.service");

exports.getOrders = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const {kitchenOrders,kitchenOrdersItems,addons} = await getOrdersDB(tenantId);

    const formattedOrders = kitchenOrders.map((order)=>{
      const orderItems = kitchenOrdersItems.filter((oi)=>oi.order_id == order.id);

      orderItems.forEach((oi, index)=>{
        const addonsIds = oi?.addons ? JSON.parse(oi?.addons) : null;

        if(addonsIds) {
          const itemAddons = addonsIds.map((addonId)=>{
            const addon = addons.filter((a)=>a.id == addonId);
            return addon[0];
          });
          orderItems[index].addons = [...itemAddons];
        }
      });

      return {
        ...order,
        items: orderItems
      }
    })

    // group orders based on table id
    let ordersGroupedByTable = [];

    for (const order of formattedOrders) {
        const tableId = order.table_id;

        if(!tableId) {
            ordersGroupedByTable.push({
                table_id: tableId,
                table_title: order.table_title,
                floor: order.floor,
                orders: [{...order}],
                order_ids: [order.id],
            })
            continue;
        }

        const orderIndex = ordersGroupedByTable.findIndex(o=>o.table_id==tableId);
        if(orderIndex == -1) {
            ordersGroupedByTable.push({
                table_id: tableId,
                table_title: order.table_title,
                floor: order.floor,
                orders: [{...order}],
                order_ids: [order.id],
            })
        } else {
            ordersGroupedByTable[orderIndex].orders.push({...order})
            ordersGroupedByTable[orderIndex].order_ids.push(order.id)
        }
    }

    // add orders where table not present


    return res.status(200).json(ordersGroupedByTable);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getOrdersInit = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const [paymentTypes, printSettings, storeSettings] = await Promise.all([
      getPaymentTypesDB(true, tenantId),
      getPrintSettingDB(tenantId),
      getStoreSettingDB(tenantId),
    ]);

    return res.status(200).json({
      paymentTypes,
      printSettings,
      storeSettings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.updateKitchenOrderItemStatus = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const orderItemId = req.params.id;
    const { status } = req.body

    if(!status) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    await updateOrderItemStatusDB(orderItemId, status, tenantId)

    return res.status(200).json({
      success: true,
      message: req.__("order_item_status_updated") // Translate message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.cancelKitchenOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { orderIds } = req.body

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    await cancelOrderDB(orderIds, tenantId);

    return res.status(200).json({
      success: true,
      message: req.__("order_cancelled_successfully") // Translate message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.completeKitchenOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { orderIds } = req.body

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    await completeOrderDB(orderIds, tenantId);

    return res.status(200).json({
      success: true,
      message: req.__("order_completed_successfully") // Translate message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getOrdersPaymentSummary = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const orderIds = req.body.orderIds;

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).JSON({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    const orderIdsParams = orderIds.join(",");

    const [ordersPaymentSummaryData, applicableServiceChargePercentage] = await Promise.all([
      getOrdersPaymentSummaryDB(orderIdsParams, tenantId),
      getServiceChargeDB(tenantId),
    ]);

    const { kitchenOrders, kitchenOrdersItems, addons } = ordersPaymentSummaryData;


    const formattedOrders = kitchenOrders.map((order)=>{
      const orderItems = kitchenOrdersItems.filter((oi)=>oi.order_id == order.id);

      orderItems.forEach((oi, index)=>{
        const addonsIds = oi?.addons ? JSON.parse(oi?.addons) : null;

        if(addonsIds) {
          const itemAddons = addonsIds.map((addonId)=>{
            const addon = addons.filter((a)=>a.id == addonId);
            return addon[0];
          });
          orderItems[index].addons = [...itemAddons];
        }
      });

      return {
        ...order,
        items: orderItems
      }
    })


    // calculate summary
    let subtotal = 0;
    let taxTotal = 0;
    let serviceChargeTotal = 0;
    let total = 0;

    for (const order of formattedOrders) {
      const items = order.items;

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        const { variant_price, price, tax_rate, tax_type: taxType, quantity, addons } = item;

        const taxRate = Number(tax_rate);
        let addonsTotal = 0;
        if(addons) {
          for (const addon of addons) {
            addonsTotal += Number(addon.price)
          }
        }

        const itemPrice = ((Number(variant_price?variant_price:price) + addonsTotal) * Number(quantity));

        if (taxType == "exclusive") {
          const tax = (itemPrice * taxRate) / 100;
          const priceWithTax = itemPrice + tax;

          taxTotal += tax;
          subtotal += itemPrice;
          total += priceWithTax;
        } else if (taxType == "inclusive") {
          const tax = itemPrice - (itemPrice * (100 / (100 + taxRate)));
          const priceWithoutTax = itemPrice - tax;

          taxTotal += tax;
          subtotal += priceWithoutTax;
          total += itemPrice;
        } else {
          subtotal += itemPrice;
          total += itemPrice;
        }
      }

    }

    // Calculate Total Service charge % from items total
    if (applicableServiceChargePercentage) {
      let serviceCharge = (Number(subtotal) * Number(applicableServiceChargePercentage)) / 100;
      serviceChargeTotal += serviceCharge;
      total += serviceCharge;
    }
    // calculate summary



    return res.status(200).json({
      subtotal,
      taxTotal,
      serviceChargeTotal,
      total,
      orders: formattedOrders
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.payAndCompleteKitchenOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { orderIds, subTotal, taxTotal, serviceChargeTotal, total, selectedPaymentType } = req.body

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    const now = new Date();
    const date = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // get invoice id
    const invoiceId = await createInvoiceDB(subTotal, taxTotal, serviceChargeTotal, total, date, selectedPaymentType, tenantId);

    await completeOrdersAndSaveInvoiceIdDB(orderIds, invoiceId, tenantId);

    // get encrypted invoice id and customer id.
    const result = await getEncryptedInvoiceIdDB(invoiceId, tenantId);

    return res.status(200).json({
      success: true,
      message: req.__("order_completed_successfully"), // Translate message
      invoiceId: result?.invoice_id || null,
      customerId: result?.customer_id || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getInvoiceIdFromOrderId = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { orderIds } = req.body

    if(!orderIds || orderIds?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("invalid_request") // Translate message
      });
    }

    const result = await getInvoiceIdFromOrderIdsDB(orderIds, tenantId);

    return res.status(200).json({
      invoiceId: result?.invoice_id || null,
      customerId: result?.customer_id || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};
