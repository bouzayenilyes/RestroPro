const { getMySqlPromiseConnection } = require("../config/mysql.db")
const { escape } = require("mysql2")
exports.doCustomerExistDB = async (phone, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT phone, name FROM customers
        WHERE phone = ? AND tenant_id = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [phone, tenantId]);

        return result.length > 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.addCustomerDB = async (phone, name, email, birthDate, gender, isMember, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO customers
        (phone, name, email, birth_date, gender, is_member, tenant_id)
        VALUES
        (?, ?, ?, ?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [phone, name, email, birthDate, gender, isMember, tenantId]);

        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getCustomersDB = async(page, perPage, sort, filter, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        // Validate and sanitize inputs
        const currentPage = parseInt(page) || 1;
        const limit = parseInt(perPage) || 10; // Define default page size
        const offset = (currentPage - 1) * limit;
        const sortedBy = sort ? `ORDER BY ${escape(sort)}` : 'ORDER BY created_at DESC'; // Add sorting based on query param

        // Build filter query based on 'filter' param (use appropriate library for complex filters)
        const filterQuery = filter ? `WHERE (name LIKE '${filter}%' OR phone='${filter}') AND tenant_id=${tenantId}` : `WHERE tenant_id=${tenantId}`;

        const [customers] = await conn.execute(
            `SELECT phone, name, email, birth_date, gender, is_member, created_at FROM customers ${filterQuery} ${sortedBy} LIMIT ${limit} OFFSET ${offset} ;`
        );

        // Prepared statement for total customer count
        const [totalCustomers] = await conn.execute(
            `SELECT COUNT(*) AS total FROM customers ${filterQuery} ;`
        );

        // Prepare response data
        const response = {
            customers,
            currentPage,
            perPage,
            totalPages: Math.ceil(totalCustomers[0].total / limit),
            totalCustomers: totalCustomers[0].total
        };



        return response;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getAllCustomersDB = async(tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        SELECT phone, name, email, birth_date, gender, is_member, created_at FROM customers
        WHERE
            tenant_id = ?
        ORDER BY
            created_at DESC
        `
        const [result] = await conn.query(sql, [tenantId]);

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.uploadBulkCustomersDB = async(customers) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        INSERT INTO customers 
        (phone, name, email, birth_date, gender, tenant_id) 
        VALUES
        ?
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        email = VALUES(email),
        birth_date = VALUES(birth_date),
        gender = VALUES(gender);

        `
        const [result] = await conn.query(sql, [customers]);

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getCustomerDB = async(phone, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const [result] = await conn.execute(
            `SELECT phone, name, email, birth_date, gender, is_member, created_at FROM customers
            WHERE phone = ? AND tenant_id = ?
            LIMIT 1;`,
            [phone, tenantId]
        );

        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.searchCustomerDB = async(searchString, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const [result] = await conn.execute(
            `
            SELECT phone, name, email, birth_date, gender, is_member, created_at FROM customers
            WHERE (phone LIKE ? OR name LIKE ?) AND tenant_id = ?
            LIMIT 10
            ;`,
            [`${searchString}%`, `%${searchString}%`, tenantId]
        );

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.updateCustomerDB = async (phone, name, email, birthDate, gender, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE customers
        SET
        name = ?, email = ?, birth_date = ?, gender = ?
        WHERE phone = ? AND tenant_id = ?
        `;

        await conn.query(sql, [name, email, birthDate, gender, phone, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteCustomerDB = async (phone, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM customers
        WHERE phone = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [phone, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};
