const bcrypt = require("bcrypt");
const { getMySqlPromiseConnection } = require("../config/mysql.db")
const {doUserExistDB} = require('../services/user.service');
const { CONFIG } = require("../config");

exports.signInDB = async (username, password) => {

    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
        email, password, name
        FROM superadmins
        WHERE email = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [username]);
        const user = result[0];

        if(!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(passwordMatch) {
            return user;
        } else {
            return null;
        }

    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};
exports.getAdminUserDB = async (username) => {

    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
        email, password, name
        FROM superadmins
        WHERE email = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [username]);
        const user = result[0];
        return user;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};


exports.getOrdersProcessedTodayDB = async() => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            COUNT(*) AS todays_orders
        FROM
            orders
        WHERE
            DATE(\`date\`) = CURDATE()
        `;

        const [result] = await conn.query(sql, []);

        return result[0]?.todays_orders || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getSalesVolumeTodayDB = async() => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            IFNULL(SUM(i.total * er.rate_to_usd),0) AS sales_volume_today
        FROM
            invoices i
            LEFT JOIN store_details sd ON i.tenant_id = sd.tenant_id
            LEFT JOIN exchange_rates er ON sd.currency = er.currency_code
        WHERE
            date(i.created_at) = CURDATE()
        `;

        const [result] = await conn.query(sql, []);

        return result[0]?.sales_volume_today || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getMRRValueDB = async() => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            count(*) AS active_tenants
        FROM
            tenants
        WHERE
            is_active = 1
        `;

        const [result] = await conn.query(sql, []);

        return result[0]?.active_tenants || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getARRValueDB = async() => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            count(*) AS active_tenants
        FROM
            tenants
        WHERE
            is_active = 1
        `;

        const [result] = await conn.query(sql, []);

        return result[0]?.active_tenants || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getActiveTenantsDB = async() => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            count(*) AS active_tenants
        FROM
            tenants
        WHERE
            is_active = 1
        `;

        const [result] = await conn.query(sql, []);
        return result[0]?.active_tenants || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}


exports.getInActiveTenantsDB = async() => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            count(*) AS inactive_tenants
        FROM
            tenants
        WHERE
            is_active = 0
        `;

        const [result] = await conn.query(sql, []);

        return result[0]?.inactive_tenants || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}
exports.getAllTenantsDB = async() => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            count(*) AS all_tenants
        FROM
            tenants
        `;

        const [result] = await conn.query(sql, []);

        return result[0]?.all_tenants || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getTenantSubscriptionHistoryDB = async(tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            id, tenant_id, created_at, starts_on, expires_on, status
        FROM
            subscription_history
        WHERE
            tenant_id = ?
        ORDER BY created_at DESC;
        `;

        const [result] = await conn.query(sql, [tenantId]);

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getTenantTotalUsersDB = async(tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            count(*) as total_users
        FROM
            users
        WHERE
            tenant_id = ?
        `;

        const [result] = await conn.query(sql, [tenantId]);

        return result[0]?.total_users || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getTenantDetailsDB = async(tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            id, name, is_active, created_at, subscription_id, payment_customer_id,
            subscription_start, subscription_end
        FROM
            tenants
        WHERE
            id = ?
        LIMIT 1
        `;

        const [result] = await conn.query(sql, [tenantId]);

        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getTenantStoreDetailsDB = async(tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            tenant_id, store_name, address, phone, email, currency, is_qr_menu_enabled, unique_qr_code
        FROM
            store_details
        WHERE
            tenant_id = ?
        LIMIT 1
        `;

        const [result] = await conn.query(sql, [tenantId]);

        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getTenantsDB = async (page, perPage, search, status, type , from , to) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const currentPage = parseInt(page) || 1;
        const limit = parseInt(perPage) || 5;
        const offset = (currentPage - 1) * limit;
        let queryParams = [];

        let query = `
            SELECT t.*, u.username AS email
            FROM tenants t
            LEFT JOIN users u ON t.id = u.tenant_id and u.role = 'admin'
            WHERE 1=1
        `;

        if (status == 'active') {
            query += " AND t.is_active = 1";
        } else if (status == 'inactive') {
            query += " AND t.is_active = 0";
        }

        if (search) {
            const searchParam = `%${search}%`
            query += ` AND (t.name LIKE '${searchParam}' OR u.username LIKE '${searchParam}')`;
        }

        const {filter, params} = getFilterConditionForTenants('created_at' , type, from, to)

        if(filter){
            query += ` AND ${filter}`;
            queryParams.push(params);
        }

        query += ` ORDER BY t.id DESC LIMIT ${limit} OFFSET ${offset}`;

        const [tenants] = await conn.execute(query , params);

        const response = {
            tenants,
            currentPage,
            perPage: limit,
            // totalPages: Math.ceil((tenants.length) / limit),
            // totalTenants : tenants.length
        };

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

const getFilterConditionForTenants = (field , type, from, to) => {
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
            filter = `YEAR(${field}) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(${field}) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`;
            break;
        }
        case 'last_7days': {
            filter = `DATE(${field}) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
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


exports.addTenantDB = async ({ name, email, password, isAdmin , isActive }) => {
    const conn = await getMySqlPromiseConnection();
    try {
        await conn.beginTransaction();

        const [tenantResult] = await conn.query(
            `INSERT INTO tenants (name, is_active) VALUES (?, ?)`,
            [name, isActive ? 1 : 0]
        );

        const tenantId = tenantResult.insertId;

        const userExist = await doUserExistDB(email);
        if(userExist) {
            throw("User already exist! Try Different Email!");
        }

        const encryptedPassword = await bcrypt.hash(password, CONFIG.PASSWORD_SALT);

        const role = isAdmin ? 'admin' : 'user';

        const [userResult] = await conn.query(
            `INSERT INTO users (username, password, name, role , tenant_id) VALUES (?, ?, ?, ? , ?)`,
            [email, encryptedPassword, name, role , tenantId]
        );

        await conn.commit();

        return { tenantId, name, isActive , role};
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

exports.getTenantCntByIdDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            COUNT(*) as count
        FROM
            tenants
        WHERE
            id = ?
        `;

        const [result] = await conn.query(sql, [tenantId]);

        return result[0].count || null;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getTenantDetailsByIdDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            t.is_active, u.username
        FROM
            tenants t JOIN users u
        ON
            t.id = u.tenant_id
        WHERE
            t.id = ?
        `;

        const [result] = await conn.query(sql, [tenantId]);

        return result[0] || null;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.updateTenantDB = async(tenantId , name , email , isActive, existingEmail) => {
    const conn = await getMySqlPromiseConnection();
    try {
        await conn.beginTransaction();

        const updateTenantSQL = `
        UPDATE tenants
        SET is_active = ?, name = ?
        WHERE id = ?;
        `;

        await conn.query(updateTenantSQL, [isActive, name, tenantId]);

        const [currentUser] = await conn.query('SELECT name, username FROM users WHERE tenant_id = ? and username = ?', [tenantId, existingEmail]);

        if (currentUser.length === 0) {
            throw new Error('User not found');
        }

        if (currentUser[0].name !== name) {
            const updateNameSql = `
                UPDATE users
                SET name = ?
                WHERE tenant_id = ? AND username = ?;
            `;

            await conn.query(updateNameSql, [name, tenantId, existingEmail]);
        }

        if (currentUser[0].username !== email) {
            const updateUsernameSql = `
                UPDATE users
                SET username = ?
                WHERE tenant_id = ? AND username = ?;
            `;

            await conn.query(updateUsernameSql, [email, tenantId, existingEmail]);
        }
        await conn.commit();
        return;
    } catch (error) {
        conn.rollback();
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.logoutAllUsersOfTenantDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        await conn.query('DELETE FROM refresh_tokens where tenant_id = ?' , [tenantId]);
    } catch (error) {
        console.error('Error logging out all users:', error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteTenantDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        await conn.query('DELETE FROM tenants where id = ?' , [tenantId]);
    } catch (error) {
        console.error('Error deleting tenant : ', error);
              throw error;
    } finally {
        conn.release();
    }
}

exports.getRestaurantsTotalCustomersDB = async() => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
            count(*) AS total_customers
        FROM
            customers
        `;

        const [result] = await conn.query(sql, []);

        return result[0]?.total_customers || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getTenantsDataByStatusDB = async (is_active) => {
    const conn = await getMySqlPromiseConnection();

    try {
        let sql = `
            SELECT t.*, u.username AS email
            FROM tenants t
            LEFT JOIN users u ON t.id = u.tenant_id AND u.role = 'admin'
        `;

        const params = [];

        if (is_active != null) {
            sql += ' WHERE t.is_active = ?';
            params.push(is_active);
        }

        const [result] = await conn.query(sql, params);

        return result;
         } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getSuperAdminTopSellingItemsDB = async(type, from, to) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const {filter, params} = getFilterCondition('date', type, from, to);

        const sql = `
        SELECT
            trending_items.tenant_id,
            t.name as tenant_name,
            trending_items.item_id,
            mi.title,
            qty
        FROM (
            SELECT
                tenant_id,
                item_id,
                count(*) AS qty
            FROM
                order_items
            WHERE ${filter}
            GROUP BY
                item_id,
                tenant_id
            ORDER BY
                count(*)
                DESC
        ) AS trending_items
        INNER JOIN menu_items mi ON trending_items.item_id = mi.id
        INNER JOIN tenants t ON trending_items.tenant_id = t.id
        ORDER BY qty DESC
        LIMIT 50
        `;

        const [result] = await conn.query(sql, params);

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getSuperAdminSalesVolumeDB = async(type, from, to) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const {filter, params} = getFilterCondition('i.created_at', type, from, to);

        const sql = `
        SELECT
            IFNULL(SUM(i.total * er.rate_to_usd),0) AS sales_volume_today
        FROM
            invoices i
            LEFT JOIN store_details sd ON i.tenant_id = sd.tenant_id
            LEFT JOIN exchange_rates er ON sd.currency = er.currency_code
        WHERE
            ${filter}
        `;

        const [result] = await conn.query(sql, params);

        return result[0]?.sales_volume_today || 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getSuperAdminOrdersProcessedDB = async(type, from, to) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const {filter, params} = getFilterCondition('date', type, from, to);

        const sql = `
        SELECT
            COUNT(*) AS orders
        FROM
            orders
        WHERE
            ${filter}
        `;

        const [result] = await conn.query(sql, params);

        return result[0]?.orders || 0;
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
