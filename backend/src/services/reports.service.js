const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.getOrdersCountDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterCondition('date', type, from, to);

        const sql = `
        SELECT
            count(*) AS todays_orders
        FROM
            orders
        WHERE
            tenant_id = ? AND
            ${filter}
        `;

        const [result] = await conn.query(sql, [tenantId ,...params]);

        return result[0].todays_orders;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};


exports.getNewCustomerCountDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterCondition('created_at', type, from, to);

        const sql = `
        SELECT
            count(*) AS new_customers_count
        FROM
            customers
        WHERE
        tenant_id = ? AND
            ${filter}
        `;

        const [result] = await conn.query(sql, [ tenantId , ...params]);

        return result[0].new_customers_count;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.getRepeatCustomerCountDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterCondition('date', type, from, to);

        const sql = `
        SELECT
            COUNT(distinct customer_id) as todays_repeat_customers
        FROM
            orders
        WHERE
            tenant_id = ? AND
            ${filter}
            AND customer_type = 'CUSTOMER';
        `;

        const [result] = await conn.query(sql, [ tenantId, ...params]);

        return result[0].todays_repeat_customers;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.getAverageOrderValueDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterCondition('created_at', type, from, to);

        const sql = `
        SELECT
            avg(total) AS avg_order_value
        FROM
            invoices
        WHERE
            tenant_id = ? AND
            ${filter}
        `;

        const [result] = await conn.query(sql, [tenantId, ...params]);

        return result[0].avg_order_value;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getTotalPaymentsByPaymentTypesDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const {filter, params} = getFilterCondition('created_at', type, from, to);

        const sql = `
        SELECT
            i.payment_type_id,
            pt.title,
            SUM(total) as total
        FROM
            invoices i
        INNER JOIN
            payment_types pt
        ON i.payment_type_id = pt.id AND i.tenant_id = pt.tenant_id
        WHERE
            i.tenant_id = ? AND
            ${filter}
        GROUP BY i.payment_type_id
        `;

        const [result] = await conn.query(sql, [tenantId, ...params]);

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getTotalCustomersDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT
            count(*) AS total_customer
        FROM
            customers
        WHERE tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [tenantId]);

        return result[0].total_customer;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.getRevenueDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterCondition('created_at', type, from, to);

        const sql = `
        SELECT
            SUM(total) AS total_revenue
        FROM
            invoices
        WHERE
            tenant_id = ? AND
            ${filter}
        `;

        const [result] = await conn.query(sql, [tenantId, ...params]);

        return result[0].total_revenue;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }

};

exports.getTotalTaxDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterCondition('created_at', type, from, to);

        const sql = `
        SELECT
            SUM(tax_total) AS total_tax
        FROM
            invoices
        WHERE
            tenant_id = ? AND
            ${filter}
        `;

        const [result] = await conn.query(sql, [tenantId,...params]);

        return result[0].total_tax;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.getTotalServiceChargeDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterCondition('created_at', type, from, to);

        const sql = `
        SELECT
            SUM(service_charge_total) AS total_service_charge
        FROM
            invoices
        WHERE
            tenant_id = ? AND
            ${filter}
        `;

        const [result] = await conn.query(sql, [tenantId,...params]);

        return result[0].total_service_charge;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.getTotalNetRevenueDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterCondition('created_at', type, from, to);

        const sql = `
        SELECT
            SUM(sub_total) AS total_net_revenue
        FROM
            invoices
        WHERE
            tenant_id = ? AND
            ${filter}
        `;

        const [result] = await conn.query(sql, [tenantId, ...params]);

        return result[0].total_net_revenue;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.getTopSellingItemsDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const {filter, params} = getFilterCondition('date', type, from, to);

        const sql = `
        SELECT
            mi.*,
            oi_c.orders_count
        FROM
            menu_items mi
            INNER JOIN (
                SELECT
                    item_id,
                    SUM(quantity) AS orders_count
                FROM
                    order_items
                WHERE
                    tenant_id = ${tenantId} AND
                    status <> 'cancelled'
                    AND ${filter}
                GROUP BY
                    item_id
                ) oi_c ON mi.id = oi_c.item_id
        WHERE tenant_id = ${tenantId}
        ORDER BY
            oi_c.orders_count DESC;
        `;

        const [result] = await conn.query(sql, params);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

const getFilterCondition = (field, type, from, to) => {
    const params = [];
    let filter = '';

    switch (type) {
        case 'custom': {
            params.push(from, to);
            filter = `DATE(${field}) >= ? AND DATE(${field}) <= ?`;
            break;
        }
        case 'today': {
            filter = `DATE(${field}) = CURDATE()`;
            break;
        }
        case 'this_month': {
            filter = `YEAR(${field}) = YEAR(NOW()) AND MONTH(${field}) = MONTH(NOW())`;
            break;
        }
        case 'last_month': {
            // filter = `DATE(${field}) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND DATE(${field}) <= CURDATE()`;
            filter = `MONTH(${field}) = MONTH(DATE_ADD(NOW(), INTERVAL -1 MONTH)) AND YEAR(${field}) = YEAR(DATE_ADD(NOW(), INTERVAL -1 MONTH))`;
            break;
        }
        case 'last_7days': {
            filter = `DATE(${field}) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND DATE(${field}) <= CURDATE()`;
            break;
        }
        case 'yesterday': {
            filter = `DATE(${field}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
            break;
        }
        case 'tomorrow': {
            filter = `DATE(${field}) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
            break;
        }
        default: {
            filter = '';
        }
    }

    return { params, filter };
}
