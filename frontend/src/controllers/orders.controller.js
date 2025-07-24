import ApiClient from "../helpers/ApiClient";

export async function getOrders() {
    try {
        const res = await ApiClient.get("/orders");
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getOrdersInit() {
    try {
        const res = await ApiClient.get("/orders/init");
        return res;
    } catch (error) {
        throw error;
    }
}

export async function updateKitchenOrderItemStatus(
    orderItemId,
    status
) {
    try {
        const response = await ApiClient.post(`/orders/update-status/${orderItemId}`, {
            status
        });
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * @param {Array<Number>} orderIds - list of orders to cancel
 *  */
export async function cancelKitchenOrder(
    orderIds,
) {
    try {
        const response = await ApiClient.post(`/orders/cancel`, {
            orderIds
        });
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * @param {Array<Number>} orderIds - list of orders to cancel
 *  */
export async function completeKitchenOrder(
    orderIds,
) {
    try {
        const response = await ApiClient.post(`/orders/complete`, {
            orderIds
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getCompleteOrderPaymentSummary(orderIds) {
    try {
        const res = await ApiClient.post("/orders/complete-order-payment-summary", {
            orderIds
        });
        return res;
    } catch (error) {
        throw error;
    }
}

export async function getInvoiceIdFromOrderId(orderIds) {
    try {
        const res = await ApiClient.post("/orders/get-invoice-id", {
            orderIds
        });
        return res;
    } catch (error) {
        throw error;
    }
}

/**
 * @param {Array<Number>} orderIds - list of orders to cancel
 * @param {Number} subTotal
 * @param {Number} taxTotal
 * @param {Number} total
 *  */
export async function payAndCompleteKitchenOrder(
    orderIds,
    subTotal,
    taxTotal,
    serviceChargeTotal,
    total,
    selectedPaymentType
) {
    try {
        const response = await ApiClient.post(`/orders/complete-and-pay-order`, {
            orderIds,
            subTotal, taxTotal, serviceChargeTotal, total,
            selectedPaymentType
        });
        return response;
    } catch (error) {
        throw error;
    }
}
