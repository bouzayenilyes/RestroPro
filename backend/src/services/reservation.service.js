const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.addReservationDB = async (customerId, date, tableId, status, notes, peopleCount, uniqueCode, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        conn.config.dateStrings = true;
        const sql = `
        INSERT INTO reservations
        (customer_id, date, table_id, status, notes, people_count, unique_code, tenant_id)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const utcDateTime = new Date(date).toISOString().slice(0, 19).replace("T", " ");
        const [result] = await conn.query(sql, [customerId, utcDateTime, tableId, status, notes, peopleCount, uniqueCode, tenantId]);

        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.updateReservationDB = async (reservationId, date, tableId, status, notes, peopleCount, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        conn.config.dateStrings = true;
        const sql = `
        UPDATE reservations
        SET
        date = ?, table_id = ?, status = ?, notes = ?, people_count = ?, updated_at = NOW()
        WHERE id = ? AND tenant_id = ?;
        `;
        const utcDateTime = new Date(date).toISOString().slice(0, 19).replace("T", " ");
        await conn.query(sql, [utcDateTime, tableId, status, notes, peopleCount, reservationId, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.cancelReservationDB = async (reservationId, status, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE reservations
        SET
        status = ?
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [status, reservationId, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.deleteReservationDB = async (reservationId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM reservations
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [reservationId, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.searchReservationsDB = async (search, tenant_id) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT r.id, customer_id, c.name as customer_name, r.date, table_id, st.table_title, status, notes, people_count, unique_code, r.created_at, r.updated_at
        FROM reservations r
        INNER JOIN customers c ON r.customer_id = c.phone AND r.tenant_id = c.tenant_id
        LEFT JOIN store_tables st
        ON r.table_id = st.id
        WHERE r.tenant_id = ? AND (r.id = ? OR customer_id = ? OR unique_code = ?)
        ORDER BY r.created_at DESC
        LIMIT 20;
        `;
        conn.config.dateStrings = true;
        const [results] = await conn.query(sql, [tenant_id, search, search, search]);

        return results;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

exports.getReservationsDB = async (type, from, to, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterConditionForReservationSearch(type, from, to, tenantId);

        const sql = `
        SELECT r.id, customer_id, c.name as customer_name, r.date, 
        table_id, st.table_title, status, notes, people_count, unique_code, r.created_at, r.updated_at
        FROM reservations r
        INNER JOIN customers c ON r.customer_id = c.phone AND r.tenant_id = c.tenant_id
        LEFT JOIN store_tables st
        ON r.table_id = st.id
        WHERE ${filter}
        `;

        conn.config.dateStrings=true;

        const [results] = await conn.query(sql, params);

        return results;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
      }
};

const getFilterConditionForReservationSearch = (type, from, to, tenantId) => {
    const params = [];
    let filter = '';

    switch (type) {
        case 'custom': {
            params.push(from, to, tenantId);
            filter = `(DATE(date) >= ? AND DATE(date) <= ?) AND r.tenant_id = ?`;
            break;
        }
        case 'today': {
            params.push(tenantId);
            filter = `DATE(date) = CURDATE() AND r.tenant_id = ?`;
            break;
        }
        case 'this_month': {
            params.push(tenantId);
            filter = `YEAR(date) = YEAR(NOW()) AND MONTH(date) = MONTH(NOW()) AND r.tenant_id = ?`;
            break;
        }
        case 'last_month': {
            params.push(tenantId);
            filter = `DATE(date) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND DATE(date) <= CURDATE() AND r.tenant_id = ?`;
            break;
        }
        case 'last_7days': {
            params.push(tenantId);
            filter = `DATE(date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND DATE(date) <= CURDATE() AND r.tenant_id = ?`;
            break;
        }
        case 'yesterday': {
            params.push(tenantId);
            filter = `DATE(date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND r.tenant_id = ?`;
            break;
        }
        case 'tomorrow': {
            params.push(tenantId);
            filter = `DATE(date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND r.tenant_id = ?`;
            break;
        }
        default: {
            params.push(tenantId);
            filter = 'r.tenant_id = ?';
        }
    }

    return { params, filter };
}
