const { getOrdersCountDB, getNewCustomerCountDB, getRepeatCustomerCountDB, getAverageOrderValueDB, getTotalCustomersDB, getTotalNetRevenueDB, getTotalTaxDB, getRevenueDB, getTopSellingItemsDB, getTotalPaymentsByPaymentTypesDB, getTotalServiceChargeDB } = require("../services/reports.service")
const { getCurrencyDB } = require("../services/settings.service")

exports.getReports = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const from = req.query.from || null;
        const to = req.query.to || null;
        const type = req.query.type;

        if(!type) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details") // Translate message
            });
        }

        if(type == 'custom') {
            if(!(from && to)) {
                return res.status(400).json({
                    success: false,
                    message: req.__("provide_from_to_dates") // Translate message
                });
            }
        }

        const [ordersCount, newCustomers, repeatedCustomers, averageOrderValue, totalCustomers, netRevenue, taxTotal, serviceChargeTotal,  revenueTotal, topSellingItems, totalPaymentsByPaymentTypes, currency] = await Promise.all([
            getOrdersCountDB(type, from, to, tenantId),
            getNewCustomerCountDB(type, from, to, tenantId),
            getRepeatCustomerCountDB(type, from, to, tenantId),
            getAverageOrderValueDB(type, from, to, tenantId),
            getTotalCustomersDB(tenantId),
            getTotalNetRevenueDB(type, from, to, tenantId),
            getTotalTaxDB(type, from, to, tenantId),
            getTotalServiceChargeDB(type, from, to, tenantId),
            getRevenueDB(type, from, to, tenantId),
            getTopSellingItemsDB(type, from, to, tenantId),
            getTotalPaymentsByPaymentTypesDB(type, from, to, tenantId),
            getCurrencyDB(tenantId),
        ]);

        return res.status(200).json({
            ordersCount, newCustomers, repeatedCustomers, currency, averageOrderValue, totalCustomers, netRevenue, taxTotal, serviceChargeTotal, revenueTotal, topSellingItems, totalPaymentsByPaymentTypes
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
