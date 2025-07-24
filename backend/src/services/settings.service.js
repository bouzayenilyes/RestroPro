const { CONFIG } = require("../config");
const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.getTenantIdFromQRCode = async (qrcode) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT
            tenant_id
        FROM
            store_details
        WHERE
            unique_qr_code = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [qrcode]);
        return result[0]?.tenant_id;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getCurrencyDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT
            currency
        FROM
            store_details
        WHERE tenant_id = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [tenantId]);
        return result[0]?.currency;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getStoreSettingDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT tenant_id, store_image, store_name, address, phone, email, currency, is_qr_menu_enabled, unique_qr_code, is_qr_order_enabled, is_feedback_enabled, unique_id FROM store_details
        WHERE tenant_id = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [tenantId]);

        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.setStoreSettingDB = async (storeName, address, phone, email, currency, isQRMenuEnabled, isQROrderEnabled , uniqueQRCode, isFeedbackEnabled, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        INSERT INTO store_details ( store_name, address, phone, email, currency, is_qr_menu_enabled, is_qr_order_enabled, unique_qr_code, is_feedback_enabled, tenant_id)
        VALUES
        ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        store_name = VALUES(store_name),
        is_qr_menu_enabled = VALUES(is_qr_menu_enabled),
        address = VALUES(address),
        phone = VALUES(phone),
        email = VALUES(email),
        currency = VALUES(currency),
        tenant_id = VALUES(tenant_id),
        is_qr_order_enabled = VALUES(is_qr_order_enabled),
        is_feedback_enabled = VALUES(is_feedback_enabled);
        `;

        await conn.query(sql, [storeName, address, phone, email, currency, isQRMenuEnabled,isQROrderEnabled ,uniqueQRCode, isFeedbackEnabled, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.uploadStoreImageDB = async (image, uniqueId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        INSERT INTO store_details (tenant_id, store_image, unique_id)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        tenant_id = VALUES(tenant_id),
        store_image = VALUES(store_image),
        unique_id = VALUES(unique_id);`

        await conn.query(sql, [tenantId, image, uniqueId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteStoreImageDB = async (image, uniqueId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        UPDATE store_details SET
        store_image = ?
        WHERE unique_id = ? AND tenant_id = ?;`

        await conn.query(sql, [image, uniqueId, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateServiceChargeDB = async (serviceCharge, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        INSERT INTO store_details (tenant_id, service_charge)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE service_charge = VALUES(service_charge);
        `;

        await conn.query(sql, [tenantId, serviceCharge]);
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getServiceChargeDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT service_charge FROM store_details where tenant_id = ?
        `;

        const [result] = await conn.query(sql, [tenantId]);
        return result[0]?.service_charge || null;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getQRMenuCodeDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT unique_qr_code FROM store_details
        WHERE tenant_id = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [tenantId]);
        return result[0]?.unique_qr_code || null;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateQRMenuCodeDB = async (uniqueQRCode, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        UPDATE store_details SET unique_qr_code = ?
        WHERE tenant_id = ?;
        `;

        await conn.query(sql, [uniqueQRCode, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getPrintSettingDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT  page_format, header, footer, show_notes, is_enable_print, show_store_details, show_customer_details, print_token FROM print_settings
        WHERE tenant_id = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [tenantId]);
        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.setPrintSettingDB = async (pageFormat, header, footer, showNotes, isEnablePrint, showStoreDetails, showCustomerDetails, printToken, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        INSERT INTO print_settings
        ( page_format, header, footer, show_notes, is_enable_print, show_store_details, show_customer_details, print_token, tenant_id)
        VALUES
        ( ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        page_format = VALUES(page_format),
        header = VALUES(header),
        footer = VALUES(footer),
        show_notes = VALUES(show_notes),
        is_enable_print = VALUES(is_enable_print),
        show_store_details = VALUES(show_store_details),
        show_customer_details = VALUES(show_customer_details),
        print_token = VALUES(print_token),
        tenant_id = VALUES(tenant_id);
        `;

        await conn.query(sql, [pageFormat, header, footer, showNotes, isEnablePrint, showStoreDetails, showCustomerDetails, printToken, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.addTaxDB = async (title, rate, type, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        INSERT INTO taxes
        (title, rate, type, tenant_id)
        VALUES (?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [title, rate, type, tenantId]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getTaxesDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT id, title, rate, type FROM taxes WHERE tenant_id = ?;
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

exports.getTaxDB = async (taxId, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT id, title, rate, type FROM taxes
        WHERE id = ? AND tenant_id = ?
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [taxId, tenantId]);
        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteTaxDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        DELETE FROM taxes WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateTaxDB = async (id, title, rate, type, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        UPDATE taxes
        SET
        title = ?, rate = ?, type = ?
        WHERE id = ? AND tenant_id = ?
        `;

        await conn.query(sql, [title, rate, type, id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};


exports.addPaymentTypeDB = async (title, isActive, tenantId, icon) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        INSERT INTO payment_types
        (title, is_active, tenant_id, icon)
        VALUES (?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [title, isActive, tenantId, icon]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getPaymentTypesDB = async (activeOnly=false, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        let sql = `
        SELECT id, title, is_active, icon FROM payment_types
        WHERE tenant_id = ?;
        `;

        if(activeOnly) {
            sql = `
            SELECT id, title, is_active, icon FROM payment_types
            WHERE is_active = 1 AND tenant_id = ?;
            `
        }

        const [result] = await conn.query(sql, [tenantId]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updatePaymentTypeDB = async (id, title, isActive, tenantId, icon) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        UPDATE payment_types
        SET title = ?, is_active = ?, icon = ?
        WHERE id = ? AND tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [title, isActive, icon, id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.togglePaymentTypeDB = async (id, isActive, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        UPDATE payment_types
        SET is_active = ?
        WHERE id = ? AND tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [isActive, id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deletePaymentTypeDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        DELETE FROM payment_types
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.addStoreTableDB = async (title, floor, seatingCapacity, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        INSERT INTO store_tables
        (table_title, floor, seating_capacity, tenant_id)
        VALUES (?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [title, floor, seatingCapacity, tenantId]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getStoreTablesDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
        id,
        HEX(AES_ENCRYPT(HEX(id), ?)) AS encrypted_id,
        table_title,
        floor,
        seating_capacity
        FROM store_tables
        WHERE tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [CONFIG.ENCRYPTION_KEY, tenantId]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getStoreTableByEncryptedIdDB = async (tenantId, encryptedTableId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT
        id,
        table_title,
        floor,
        seating_capacity
        FROM store_tables
        WHERE tenant_id = ? AND AES_DECRYPT(UNHEX(?), ?) = HEX(id)
        LIMIT 1;
        `;

        const [result] = await conn.query(sql, [tenantId, encryptedTableId, CONFIG.ENCRYPTION_KEY]);

        return result[0] || null;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateStoreTableDB = async (id, title, floor, seatingCapacity, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        UPDATE store_tables SET
        table_title = ?, floor = ?, seating_capacity = ?
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [title, floor, seatingCapacity, id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteStoreTableDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        DELETE FROM store_tables
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.addCategoryDB = async (title, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        INSERT INTO categories
        (title, tenant_id)
        VALUES (?, ?);
        `;

        const [result] = await conn.query(sql, [title, tenantId]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getCategoriesDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        SELECT id, title, is_enabled FROM categories
        WHERE tenant_id = ?;
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

exports.updateCategoryDB = async (id, title, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        UPDATE categories
        SET title = ?
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [title, id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteCategoryDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        DELETE FROM categories
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [id, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.changeCategoryVisibiltyDB = async (id, isEnabled, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
         UPDATE categories SET
         is_enabled = ?
         WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [isEnabled, id, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.placeOrderViaQrMenuDB = async (tenantId, deliveryType , cartItems, customerType, customerId, tableId, customerName ,paymentStatus = 'pending') => {
    const conn = await getMySqlPromiseConnection();

    try {
      // start transaction
      await conn.beginTransaction();

      // step 1: save data to orders table
      const [orderResult] = await conn.query(`INSERT INTO qr_orders (delivery_type, customer_type, customer_id, table_id, payment_status, tenant_id) VALUES (?, ?, ?, ?, ?, ?)`, [deliveryType, customerType, customerId, tableId, paymentStatus || 'pending', tenantId]);

      const orderId = orderResult.insertId;

      // step 2: save data to order_items
      const sqlOrderItems = `
      INSERT INTO qr_order_items
      (order_id, item_id, variant_id, price, quantity, notes, addons, tenant_id)
      VALUES ?
      `;

      await conn.query(sqlOrderItems, [cartItems.map((item)=>[orderId, item.id, item.variant_id, item.price, item.quantity, item.notes, item?.addons_ids?.length > 0 ? JSON.stringify(item.addons_ids):null, tenantId ])]);


			// Step 3 : Search customer by phone in customer table - if not existing - create one
			if(customerId){
				const sqlIsExistingCustomer = `
					SELECT 1 from customers where phone = ? AND tenant_id = ?
			`

				const [existingCustomer] = await conn.query(sqlIsExistingCustomer , [customerId, tenantId]);


				if (!existingCustomer.length) {
					const sqlAddCustomer = `
							INSERT INTO customers (phone, name,tenant_id) VALUES (?, ?,?)
					`;

					await conn.query(sqlAddCustomer, [customerId, customerName, tenantId]);
				}
			}


      // step 7: commit transaction / if any exception occurs then rollback
      await conn.commit();

      return {
        orderId
      }
    } catch (error) {
      console.error(error);
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  };

exports.saveFeedbackDB = async (tenantId, invoiceId, customerId, phone, name, email, birthdate, averageRating, food_quality, service, ambiance, staff_behavior, recommend, remarks) => {
    const conn = await getMySqlPromiseConnection();

    try {
      // start transaction
      await conn.beginTransaction();


    const sqlIsExistingCustomer = `SELECT 1 from customers where phone = ? AND tenant_id = ?`

    const [existingCustomer] = await conn.query(sqlIsExistingCustomer , [customerId || phone, tenantId]);


    if (existingCustomer.length == 0) {
        const sqlAddCustomer = `
                INSERT INTO customers (phone, name, email, birth_date, tenant_id) VALUES (?, ?, ?, ?, ?)
        `;

        await conn.query(sqlAddCustomer, [phone, name, email || null, birthdate || null, tenantId]);
    }

    const uniqueCustomerId = customerId || phone || null;

    await conn.query(`INSERT INTO feedbacks (invoice_id, phone, created_by, average_rating, food_quality_rating, service_rating, staff_behavior_rating, ambiance_rating, recommend_rating, remarks, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [invoiceId, uniqueCustomerId, null, averageRating, food_quality, service, staff_behavior, ambiance, recommend, remarks||null, tenantId]);

      // step 7: commit transaction / if any exception occurs then rollback
      await conn.commit();

      return;
    } catch (error) {
      console.error(error);
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
};
