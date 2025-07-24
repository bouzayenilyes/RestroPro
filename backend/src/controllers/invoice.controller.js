const {
  getInvoicesDB,
  getInvoiceOrdersDB,
  searchInvoicesDB,
  getInvoiceByIdDB,
} = require("../services/invoice.service");
const {
  getPrintSettingDB,
  getStoreSettingDB,
  getPaymentTypesDB,
  getServiceChargeDB,
} = require("../services/settings.service");

exports.getInvoicesInit = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const [printSettings, storeSettings, paymentTypes] = await Promise.all([
      getPrintSettingDB(tenantId),
      getStoreSettingDB(tenantId),
      getPaymentTypesDB(false, tenantId),
    ]);

    return res.status(200).json({
      printSettings,
      storeSettings,
      paymentTypes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const from = req.query.from || null;
    const to = req.query.to || null;
    const type = req.query.type;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: req.__("please_provide_required_details"), // Translate message
      });
    }

    if (type == "custom") {
      if (!(from && to)) {
        return res.status(400).json({
          success: false,
          message: req.__("provide_from_to_dates"), // Translate message
        });
      }
    }

    const result = await getInvoicesDB(type, from, to, tenantId);

    if (result.length > 0) {
      // format the result
      const invoices = [];

      for (let index = 0; index < result.length; index++) {
        const invoice = result[index];
        const {
          invoice_id,
          created_at,
          sub_total,
          tax_total,
          service_charge_total,
          total,
          table_id,
          table_title,
          floor,
          order_id,
          payment_status,
          token_no,
          delivery_type,
          customer_type,
          customer_id,
          name,
          email,
          payment_type_id
        } = invoice;

        const existingInvoiceId = invoices.findIndex(
          (i) => i.invoice_id == invoice_id
        );

        if (existingInvoiceId == -1) {
          invoices.push({
            invoice_id,
            created_at,
            sub_total,
            tax_total,
            service_charge_total,
            total,
            table_id,
            table_title,
            floor,
            delivery_type,
            customer_type,
            customer_id,
            name,
            email,
            payment_type_id,
            orders: [{ order_id, payment_status, token_no }],
          });
        } else {
          invoices[existingInvoiceId].orders.push({
            order_id,
            payment_status,
            token_no,
          });
        }
      }

      return res.status(200).json(invoices);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.searchInvoices = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const searchString = req.query.q;

    if (!searchString) {
      return res.status(400).json({
        success: false,
        message: req.__("please_provide_required_details"), // Translate message
      });
    }

    const result = await searchInvoicesDB(searchString, tenantId);

    if (result.length > 0) {
      // format the result
      const invoices = [];

      for (let index = 0; index < result.length; index++) {
        const invoice = result[index];
        const {
          invoice_id,
          created_at,
          sub_total,
          tax_total,
          service_charge_total,
          total,
          table_id,
          table_title,
          floor,
          order_id,
          payment_status,
          token_no,
          delivery_type,
          customer_type,
          customer_id,
          name,
          email,
          payment_type_id
        } = invoice;

        const existingInvoiceId = invoices.findIndex(
          (i) => i.invoice_id == invoice_id
        );

        if (existingInvoiceId == -1) {
          invoices.push({
            invoice_id,
            created_at,
            sub_total,
            tax_total,
            service_charge_total,
            total,
            table_id,
            table_title,
            floor,
            delivery_type,
            customer_type,
            customer_id,
            name,
            email,
            payment_type_id,
            orders: [{ order_id, payment_status, token_no }],
          });
        } else {
          invoices[existingInvoiceId].orders.push({
            order_id,
            payment_status,
            token_no,
          });
        }
      }

      return res.status(200).json(invoices);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getInvoiceOrders = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const orderIds = req.body.orderIds;
    const invoiceId = req.body.invoiceId;

    if (!orderIds || orderIds?.length == 0) {
      return res.status(400).JSON({
        success: false,
        message: req.__("invalid_request"), // Translate message
      });
    }

    const orderIdsParams = orderIds.join(",");

    const [invoiceOrdersData, invoiceData] = await Promise.all([
        getInvoiceOrdersDB(orderIdsParams),
        getInvoiceByIdDB(invoiceId, tenantId),
      ]);

    const { kitchenOrders, kitchenOrdersItems, addons } = invoiceOrdersData;
    const {sub_total, tax_total, service_charge_total, total} = invoiceData;

    const formattedOrders = kitchenOrders.map((order) => {
      const orderItems = kitchenOrdersItems.filter(
        (oi) => oi.order_id == order.id
      );

      orderItems.forEach((oi, index) => {
        const addonsIds = oi?.addons ? JSON.parse(oi?.addons) : null;

        if (addonsIds) {
          const itemAddons = addonsIds.map((addonId) => {
            const addon = addons.filter((a) => a.id == addonId);
            return addon[0];
          });
          orderItems[index].addons = [...itemAddons];
        }
      });

      return {
        ...order,
        items: orderItems,
      };
    });

    return res.status(200).json({
      subtotal : sub_total,
      taxTotal : tax_total,
      serviceChargeTotal : service_charge_total,
      total : total,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};
