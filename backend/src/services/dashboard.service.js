const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.getTodaysOrdersCountDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT
            count(*) AS todays_orders
        FROM
            orders
        WHERE
            DATE(\`date\`) = CURDATE() AND tenant_id = ?
        `;
    
        const [result] = await conn.query(sql, [tenantId]);
        return result[0].todays_orders;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getTodaysNewCustomerCountDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        SELECT
            count(*) AS new_customers_count
        FROM
            customers
        WHERE
            DATE(created_at) = CURDATE() AND tenant_id = ?
        `;
    
        const [result] = await conn.query(sql, [tenantId]);
        return result[0].new_customers_count;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getTodaysRepeatCustomerCountDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT
            COUNT(distinct customer_id) as todays_repeat_customers
        FROM
            orders
        WHERE
            DATE(\`date\`) = CURDATE()
            AND customer_type = 'CUSTOMER' AND tenant_id = ?;
        `;
    
        const [result] = await conn.query(sql, [tenantId]);

        return result[0].todays_repeat_customers;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getTodaysTopSellingItemsDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

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
                    status <> 'cancelled'
                    AND DATE(\`date\`) = CURDATE()
                    AND tenant_id = ?
                GROUP BY
                    item_id
                LIMIT 50) oi_c ON mi.id = oi_c.item_id
        WHERE tenant_id = ?
        ORDER BY
            oi_c.orders_count DESC;
        `;
    
        const [result] = await conn.query(sql, [tenantId, tenantId]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};
