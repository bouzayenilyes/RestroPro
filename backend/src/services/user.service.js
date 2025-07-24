const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.getUserDB = async (username, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT username, role, scope FROM users
        WHERE username = ? AND tenant_id = ?
        LIMIT 1;
        `;
    
        const [result] = await conn.query(sql, [username, tenantId]);
        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getAllUsersDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT username, name, role, photo, designation, phone, email, scope FROM users
        WHERE tenant_id = ?
        ORDER BY role, name;
        `;
    
        const [result] = await conn.query(sql, [tenantId]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.doUserExistDB = async (username) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT username FROM users
        WHERE username = ?
        LIMIT 1;
        `;
    
        const [result] = await conn.query(sql, [username]);
        return result.length == 1;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.addUserDB = async (tenantId, username, encryptedPassword, name, role, photo, designation, phone, email, scope) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO users
        (username, password, name, role, photo, designation, phone, email, scope, tenant_id)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await conn.query(sql, [username, encryptedPassword, name, role, photo, designation, phone, email, scope, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteUserDB = async (username, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM refresh_tokens WHERE username = ? AND tenant_id = ?;
        DELETE FROM users WHERE username = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [username, tenantId, username, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteUserRefreshTokensDB = async (username, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM refresh_tokens WHERE username = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [username, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateUserDB = async (username, name, photo, designation, phone, email, scope, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE users
        SET
        name = ?, photo = ?, designation = ?, phone = ?, email = ?, scope = ?
        WHERE username = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [name, photo, designation, phone, email, scope, username, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateUserPasswordDB = async (username, password, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE users
        SET
        password = ?
        WHERE username = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [password, username, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};