const { getAllMenuItemsDB, getAllAddonsDB, getAllVariantsDB, getAllRecipeItemsDB } = require("../services/menu_item.service");
const { checkInvoiceIdDB } = require("../services/orders.service");
const { getStoreSettingDB, getCategoriesDB, getTenantIdFromQRCode, getStoreTableByEncryptedIdDB , placeOrderViaQrMenuDB, saveFeedbackDB, getServiceChargeDB} = require("../services/settings.service");

exports.getQRMenuInit = async (req, res) => {
    try {
        const qrcode = req.params.qrcode;
        const tableId = req.query.tableId;

        const tenantId = await getTenantIdFromQRCode(qrcode);

        if(!tenantId) {
            return res.status(404).json({
                success: false,
                message: req.__("qr_digital_menu_not_found") // Translate message
            });
        }

        const [categories, storeSettings, storeTable, serviceCharge] = await Promise.all([
            getCategoriesDB(tenantId),
            getStoreSettingDB(tenantId),
            getStoreTableByEncryptedIdDB(tenantId, tableId),
            getServiceChargeDB(tenantId),
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
            categories: categories,
            storeSettings: storeSettings,
            menuItems: formattedMenuItems,
            storeTable: storeTable,
            serviceCharge:serviceCharge,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.placeOrderViaQrMenu = async (req, res) => {
    try {
      const qrcode = req.params.qrcode;

      const tenantId = await getTenantIdFromQRCode(qrcode);

      const {deliveryType , cartItems, customerType, customer, tableId} = req.body;

      if(cartItems?.length == 0) {
        return res.status(400).json({
          success: false,
          message: req.__("cart_is_empty") // Translate message
        });
      }

      const result = await placeOrderViaQrMenuDB(tenantId, deliveryType , cartItems, customerType, customer.phone || null, tableId || null , customer.name || null);

      return res.status(200).json({
        success: true,
        message: req.__("order_placed_successfully"), // Translate message
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

exports.collectFeedback = async (req, res) => {
  try {
    const qrcode = req.params.qrcode;

    const tenantId = await getTenantIdFromQRCode(qrcode);

    const {invoiceId:encryptedInvoiceId, customerId, name, phone, email, birthdate, food_quality, service, ambiance, staff_behavior, recommend, remarks } = req.body;

    const averageRating = (Number(food_quality) + Number(service) + Number(ambiance) + Number(staff_behavior) + Number(recommend)) / 5;

    // 0. get tenant id
    if(!tenantId) {
      return res.status(400).json({
        success: false,
        message: req.__("broken_link_goto_homepage") // Translate message
      });
    }

    // 1. check if invoice is valid or not, if yes then get invoice id
    const { invoice_id, customer_id } = await checkInvoiceIdDB(encryptedInvoiceId);

    await saveFeedbackDB(tenantId, invoice_id, customer_id, phone, name, email, birthdate, averageRating, food_quality, service, ambiance, staff_behavior, recommend, remarks);

    return res.status(200).json({
      success: true,
      message: req.__("feedback_saved_successfully") // Translate message
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("error_processing_request_try_later") // Translate message
    });
  }
};
