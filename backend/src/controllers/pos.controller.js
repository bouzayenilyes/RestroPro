const {
  getCategoriesDB,
  getPaymentTypesDB,
  getPrintSettingDB,
  getStoreSettingDB,
  getStoreTablesDB,
  getServiceChargeDB,
} = require("../services/settings.service");
const {
  getAllMenuItemsDB,
  getAllAddonsDB,
  getAllVariantsDB,
  getAllRecipeItemsDB,
} = require("../services/menu_item.service");
const { createOrderDB, getPOSQROrdersCountDB, getPOSQROrdersDB, updateQROrderStatusDB, cancelAllQROrdersDB } = require("../services/pos.service");
const { createInvoiceDB } = require("../services/orders.service");

exports.getPOSInitData = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const [categories, paymentTypes, printSettings, storeSettings, storeTables, serviceCharge] = await Promise.all([
      getCategoriesDB(tenantId),
      getPaymentTypesDB(true, tenantId),
      getPrintSettingDB(tenantId),
      getStoreSettingDB(tenantId),
      getStoreTablesDB(tenantId),
      getServiceChargeDB(tenantId)
    ]);

    const [menuItems, addons, variants, recipeItems] = await Promise.all([
      getAllMenuItemsDB(tenantId),
      getAllAddonsDB(tenantId),
      getAllVariantsDB(tenantId),
      getAllRecipeItemsDB(tenantId)
    ]);

    const formattedMenuItems = menuItems.map((item) => {
      const itemAddons = addons.filter((addon) => addon.item_id == item.id);
      const itemVariants = variants.filter(
        (variant) => variant.item_id == item.id
      );
      const itemRecipeItems = recipeItems.filter(
        (recipeItem) => recipeItem.menu_item_id == item.id
      );

      return {
        ...item,
        addons: [...itemAddons],
        variants: [...itemVariants],
        recipeItems: [...itemRecipeItems]
      };
    });

    return res.status(200).json({
      categories,
      paymentTypes,
      printSettings,
      storeSettings,
      storeTables,
      menuItems: formattedMenuItems,
      serviceCharge
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const username = req.user.username;
    const {cart, deliveryType, customerType, customerId, tableId, selectedQrOrderItem} = req.body;

    if(cart?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("cart_is_empty") // Translate message
      });
    }

    const result = await createOrderDB(tenantId, cart, deliveryType, customerType, customerId?.phone || null, tableId || null, 'pending', null, username);

    if(selectedQrOrderItem) {
      await updateQROrderStatusDB(tenantId, selectedQrOrderItem, "completed");
    }

    return res.status(200).json({
      success: true,
      message: req.__("order_created_token", { token: result.tokenNo }), // Translate message
      tokenNo: result.tokenNo,
      orderId: result.orderId,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("error_processing_request_try_later") // Translate message
    });
  }
};


function canPrepareMenuItem(menuItem, quantity = 1) {
  const selectedVariantId = parseInt(menuItem.variant_id);
  const selectedAddonIds = (menuItem.addons_ids || []).map(String);

  const relevantRecipeItems = menuItem.recipeItems.filter((recipe) => {
    if (recipe.variant_id === 0 && recipe.addon_id === 0) return true;
    if (recipe.variant_id > 0 && recipe.variant_id == selectedVariantId) return true;
    if (recipe.addon_id > 0 && selectedAddonIds.includes(String(recipe.addon_id))) return true;
    return false;
  });

  const insufficientIngredients = [];

  for (const recipe of relevantRecipeItems) {
    const currentQty = parseFloat(recipe.current_quantity);
    const requiredQty = parseFloat(recipe.recipe_quantity) * quantity;
    if (currentQty < requiredQty) {
      insufficientIngredients.push({
        itemTitle: menuItem.title,
        variantTitle: menuItem.variant?.title || '',
        addonTitle: recipe.addon_title || '',
        ingredientTitle: recipe.ingredient_title,
        requiredQty,
        currentQty,
      });
    }
  }

  return insufficientIngredients;
}

exports.createOrderAndInvoice = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const username = req.user.username;
    const {cart, deliveryType, customerType, customerId, tableId, netTotal, taxTotal, serviceChargeTotal, total, selectedQrOrderItem, selectedPaymentType} = req.body;

    if(cart?.length == 0) {
      return res.status(400).json({
        success: false,
        message: req.__("cart_is_empty") // Translate message
      });
    }

    let allInsufficientIngredients = [];

    for (const item of cart) {
      const result = canPrepareMenuItem(item, item.quantity);
      if (result.length > 0) {
        allInsufficientIngredients = [...allInsufficientIngredients, ...result];
      }
    }

    if (allInsufficientIngredients.length > 0) {
      const messages = allInsufficientIngredients.map(i =>
        `‘${i.itemTitle} ${i.variantTitle ? `(${i.variantTitle})` : ''}${i.addonTitle ? ` + ${i.addonTitle}` : ''}’ is missing '${i.ingredientTitle}' (need ${i.requiredQty}, have ${i.currentQty})`
      );

      return res.status(400).json({
        success: false,
        message: "Unavailable: Not enough stock." + "\n" + messages.join("; "),
      });
    }

    // create invoice
    const now = new Date();
    const date = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const invoiceId = await createInvoiceDB(netTotal, taxTotal, serviceChargeTotal, total, date, selectedPaymentType, tenantId);
    // create invoice

    const result = await createOrderDB(tenantId, cart, deliveryType, customerType, customerId?.phone || null, tableId || null, 'paid', invoiceId, username);
    const orderId = result.orderId;
    const tokenNo = result.tokenNo;

    if(selectedQrOrderItem) {
      await updateQROrderStatusDB(tenantId, selectedQrOrderItem, "completed");
    }

    return res.status(200).json({
      success: true,
      message: req.__("order_created_token", { token: tokenNo }), // Translate message
      tokenNo,
      orderId,
      invoiceId
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("error_processing_request_try_later") // Translate message
    });
  }
};

exports.getPOSQROrdersCount = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const totalQROrders = await getPOSQROrdersCountDB(tenantId);
    return res.status(200).json({
      status: true,
      totalQROrders: totalQROrders
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getPOSQROrders = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const { kitchenOrders, kitchenOrdersItems, addons } = await getPOSQROrdersDB(tenantId);

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

    return res.status(200).json(formattedOrders)
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.updatePOSQROrderStatus = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const orderId = req.params.id;
    const status = req.body.status;

    if(!status) {
      return res.status(400).json({
        success: false,
        message: req.__("please_provide_required_details") // Translate message
      });
    }

    await updateQROrderStatusDB(tenantId, orderId, status);
    return res.status(200).json({
      status: true,
      message: req.__("qr_order_item_status_updated") // Translate message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.cancelAllQROrders = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const status = 'cancelled';

    await cancelAllQROrdersDB(tenantId, status);
    return res.status(200).json({
      status: true,
      message: req.__("all_qr_order_items_cleared") // Translate message
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};
