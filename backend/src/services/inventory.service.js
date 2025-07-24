const { escape } = require("mysql2");
const { getMySqlPromiseConnection } = require("../config/mysql.db");

exports.addInventoryItemDB = async (
  title,
  quantity,
  unit,
  minQuantityThreshold,
  tenantId,
  username
) => {
  const conn = await getMySqlPromiseConnection();
  try {
    await conn.beginTransaction();

    let status = 'out';
    if (quantity > 0 && quantity <= minQuantityThreshold) {
      status = 'low';
    } else if (quantity > minQuantityThreshold) {
      status = 'in';
    }

    const sql = `
      INSERT INTO inventory_items
      (title, quantity, unit, min_quantity_threshold, status, tenant_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await conn.query(sql, [
      title,
      quantity,
      unit,
      minQuantityThreshold,
      status,
      tenantId,
    ]);

    const inventoryItemId = result.insertId;

    await conn.query(
      `INSERT INTO inventory_logs
      (tenant_id, inventory_item_id, type, quantity_change, previous_quantity, new_quantity, note, created_by)
      VALUES (?, ?, 'IN', ?, 0, ?, 'Initial stock', ?)`,
      [tenantId, inventoryItemId, quantity, quantity, username]
    );

    await conn.commit();

    return result.insertId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

exports.getInventoryItemsDB = async (status, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    let sql = '';

    let countsSql = `
      SELECT
        status,
        COUNT(*) AS count
      FROM inventory_items
      WHERE tenant_id = ?
      GROUP BY status
    `;

    const [statusCounts] = await conn.query(countsSql, [tenantId]);

    const statusCountMap = {
      in: 0,
      low: 0,
      out: 0,
    };

    statusCounts.forEach(({ status, count }) => {
      if (statusCountMap[status] !== undefined) {
        statusCountMap[status] = count;
      }
    });

    if(status != 'all'){
      sql = `
      SELECT
        id,
        title,
        quantity,
        unit,
        min_quantity_threshold,
        status,
        tenant_id,
        created_at,
        updated_at
      FROM inventory_items
      WHERE tenant_id = ? AND status = ?
      ORDER BY id DESC
    `;
      const [rows] = await conn.query(sql, [tenantId, status]);
      return {items: rows, statusCounts: statusCountMap};
    }else{
      sql = `
      SELECT
        id,
        title,
        quantity,
        unit,
        min_quantity_threshold,
        status,
        tenant_id,
        created_at,
        updated_at
      FROM inventory_items
      WHERE tenant_id = ?
      ORDER BY id DESC
    `;
      const [rows] = await conn.query(sql, [tenantId]);
      return { items: rows, statusCounts: statusCountMap };
    }

  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

exports.updateInventoryItemDB = async (
  itemId,
  title,
  unit,
  minQuantityThreshold,
  tenantId
) => {
  const conn = await getMySqlPromiseConnection();
  try {

    let status = 'out';
    if (quantity > 0 && quantity <= minQuantityThreshold) {
      status = 'low';
    } else if (quantity > minQuantityThreshold) {
      status = 'in';
    }

    const sql = `
      UPDATE inventory_items
      SET title = ?, unit = ?, min_quantity_threshold = ?, status = ?,
      WHERE id = ? AND tenant_id = ?
    `;
    await conn.query(sql, [
      title,
      unit,
      minQuantityThreshold,
      status,
      itemId,
      tenantId,
    ]);
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

exports.addInventoryItemStockMovementDB = async (req, itemId, movementType, quantity, note, tenantId, username) => {
  const conn = await getMySqlPromiseConnection();
  try {
    await conn.beginTransaction();

    // Step 1: Get current quantity
    const [rows] = await conn.query(
      `SELECT quantity, min_quantity_threshold FROM inventory_items WHERE id = ? AND tenant_id = ? FOR UPDATE`,
      [itemId, tenantId]
    );
    if (rows.length === 0) throw new Error(req.__('inventory_item_not_found_message'));

    const previousQuantity = parseFloat(rows[0].quantity);
    const minQuantityThreshold = parseFloat(rows[0].min_quantity_threshold);

    // Determine quantity delta based on movement type
    let deltaQuantity;
    switch (movementType) {
      case 'IN':
        deltaQuantity = parseFloat(quantity);
        break;
      case 'OUT':
      case 'WASTAGE':
        deltaQuantity = -1 * parseFloat(quantity);
        break;
      default:
        throw new Error(req.__('invalid_movement_type_message'));
    }

    const newQuantity = previousQuantity + deltaQuantity;

    // Prevent negative inventory
    if (newQuantity < 0) throw new Error(req.__('insufficient_inventory_quantity_message'));

    // Determine new status
    let status = 'out';
    if (newQuantity > 0 && newQuantity <= minQuantityThreshold) {
      status = 'low';
    } else if (newQuantity > minQuantityThreshold) {
      status = 'in';
    }

    // Step 2: Update inventory quantity and status
    await conn.query(
      `UPDATE inventory_items SET quantity = ?, status = ? WHERE id = ? AND tenant_id = ?`,
      [newQuantity, status, itemId, tenantId]
    );

    // Step 3: Insert inventory log with correct type
    await conn.query(
      `INSERT INTO inventory_logs (tenant_id, inventory_item_id, type, quantity_change, previous_quantity, new_quantity, note, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, itemId, movementType, Math.abs(deltaQuantity), previousQuantity, newQuantity, note, username]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};


exports.deleteInventoryItemDB = async (itemId, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    const sql = `DELETE FROM inventory_items WHERE id = ? AND tenant_id = ?`;
    await conn.query(sql, [itemId, tenantId]);
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

exports.getInventoryLogsDB = async (movementType, type, from, to, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    const {filter, params} = getFilterCondition('l.created_at', type, from, to);

    let sql = "";

    if(movementType != 'all'){
      sql = `
        SELECT
          l.id,
          l.inventory_item_id,
          i.title,
          i.unit,
          l.type,
          l.quantity_change as quantity,
          l.note,
          l.created_by,
          l.created_at
        FROM inventory_logs l
        JOIN inventory_items i ON i.id = l.inventory_item_id
        WHERE l.tenant_id = ${tenantId} AND l.type = '${movementType}' AND ${filter}
        ORDER BY l.created_at DESC
      `;
      const [rows] = await conn.query(sql, params);
      return rows;
    }else{
      sql = `
        SELECT
          l.id,
          l.inventory_item_id,
          i.title,
          i.unit,
          l.type,
          l.quantity_change as quantity,
          l.note,
          l.created_by,
          l.created_at
        FROM inventory_logs l
        JOIN inventory_items i ON i.id = l.inventory_item_id
        WHERE l.tenant_id = ${tenantId} AND ${filter}
        ORDER BY l.created_at DESC
      `;
      const [rows] = await conn.query(sql, params);
      return rows;
    }

  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

exports.getCummulativeInventoryMovementsDB = async (type, from, to, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    const { filter, params } = getFilterCondition('l.created_at', type, from, to);

    const sql = `
      SELECT
        l.inventory_item_id,
        i.title,
        i.unit,
        SUM(CASE WHEN l.type = 'in' THEN l.quantity_change ELSE 0 END) AS total_in,
        SUM(CASE WHEN l.type = 'out' THEN l.quantity_change ELSE 0 END) AS total_out,
        SUM(CASE WHEN l.type = 'wastage' THEN l.quantity_change ELSE 0 END) AS total_wastage,
        COUNT(*) AS movement_count
      FROM inventory_logs l
      JOIN inventory_items i ON i.id = l.inventory_item_id
      WHERE l.tenant_id = ? AND ${filter}
      GROUP BY l.inventory_item_id
      ORDER BY (total_in + total_out + total_wastage) DESC
    `;

    const [rows] = await conn.query(sql, [tenantId, ...params]);
    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

exports.getInventoryUsageVsCurrentStockDB = async (type, from, to, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    const { filter, params } = getFilterCondition('l.created_at', type, from, to);

    const sql = `
      SELECT
        i.id AS inventory_item_id,
        i.title,
        i.quantity AS current_stock,
        i.min_quantity_threshold,
        i.unit,
        i.status,
        SUM(CASE WHEN l.type = 'out' THEN l.quantity_change ELSE 0 END) AS total_usage
      FROM inventory_items i
      LEFT JOIN inventory_logs l
        ON l.inventory_item_id = i.id AND l.tenant_id = i.tenant_id AND ${filter}
      WHERE i.tenant_id = ?
      GROUP BY i.id
      ORDER BY total_usage DESC
    `;

    const [rows] = await conn.query(sql, [...params, tenantId]);
    return rows;
  } catch (error) {
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

/* inventory_vendors */
exports.addVendorDB = async (phone, name, contactPerson, addressLine1, addressLine2, city, state, country, zipcode, taxIdNo, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO inventory_vendors
        (phone, name, contact_person, address_line1, address_line2, city, state, country, zipcode, tax_id_no, tenant_id)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [phone, name, contactPerson, addressLine1, addressLine2, city, state, country, zipcode, taxIdNo, tenantId]);

        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getVendorsDB = async(page, perPage, sort, filter, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        // Validate and sanitize inputs
        const currentPage = parseInt(page) || 1;
        const limit = parseInt(perPage) || 10; // Define default page size
        const offset = (currentPage - 1) * limit;
        const sortedBy = sort ? `ORDER BY ${escape(sort)}` : 'ORDER BY created_at DESC'; // Add sorting based on query param

        // Build filter query based on 'filter' param (use appropriate library for complex filters)
        const filterQuery = filter ? `WHERE (name LIKE '${filter}%' OR phone='${filter}') AND tenant_id=${tenantId}` : `WHERE tenant_id=${tenantId}`;

        const [vendors] = await conn.execute(
            `SELECT id, phone, name, contact_person, address_line1, address_line2, city, state, country, zipcode, tax_id_no, created_at FROM inventory_vendors ${filterQuery} ${sortedBy} LIMIT ${limit} OFFSET ${offset} ;`
        );

        // Prepared statement for total customer count
        const [totalVendors] = await conn.execute(
            `SELECT COUNT(*) AS total FROM inventory_vendors ${filterQuery} ;`
        );

        // Prepare response data
        const response = {
            vendors,
            currentPage,
            perPage,
            totalPages: Math.ceil(totalVendors[0].total / limit),
            totalVendors: totalVendors[0].total
        };



        return response;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getAllVendorsDB = async(tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        SELECT id, phone, name, contact_person, address_line1, address_line2, city, state, country, zipcode, tax_id_no, created_at FROM inventory_vendors
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
exports.getVendorDB = async(id, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const [result] = await conn.execute(
          `SELECT id, phone, name, contact_person, address_line1, address_line2, city, state, country, zipcode, tax_id_no, created_at FROM inventory_vendors
          WHERE id = ? AND tenant_id = ?
          LIMIT 1;`,
          [id, tenantId]
      );

      return result[0];
  } catch (error) {
      console.error(error);
      throw error;
  } finally {
      conn.release();
  }
}

exports.searchVendorDB = async(searchString, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const [result] = await conn.execute(
          `
          SELECT id, phone, name, contact_person, address_line1, address_line2, city, state, country, zipcode, tax_id_no, created_at FROM inventory_vendors
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

exports.updateVendorDB = async (id, phone, name, contactPerson, addressLine1, addressLine2, city, state, country, zipcode, taxIdNo, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const sql = `
      UPDATE inventory_vendors
      SET
      name = ?, phone = ?, contact_person = ?, address_line1 = ?,
      address_line2 = ?, city = ?, state = ?, country = ?, zipcode = ?, tax_id_no = ?, updated_at = NOW()
      WHERE id = ? AND tenant_id = ?
      `;

      await conn.query(sql, [name, phone, contactPerson, addressLine1, addressLine2, city, state, country, zipcode, taxIdNo, id, tenantId]);
      return;
  } catch (error) {
      console.error(error);
      throw error;
  } finally {
      conn.release();
  }
};

exports.deleteVendorDB = async (id, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const sql = `
      DELETE FROM inventory_vendors
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
/* inventory_vendors */

/* Purchase Orders */
exports.addItemToPurchaseOrdersDraftsDB = async (inventoryItemId, tenantId, quantity) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const sql = `
      INSERT INTO inventory_purchase_orders_drafts
      (item_id, quantity, tenant_id, created_at)
      VALUES
      (?, ?, ?, NOW());
      `;

      const [result] = await conn.query(sql, [inventoryItemId, quantity, tenantId]);

      return result.insertId;
  } catch (error) {
      console.error(error);
      throw error;
  } finally {
      conn.release();
  }
};
exports.addBulkItemsToPurchaseOrdersDraftsDB = async (items) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const sql = `
      INSERT INTO inventory_purchase_orders_drafts
      (item_id, quantity, tenant_id)
      VALUES
      ?
      `;

      const [result] = await conn.query(sql, [items]);

      return;
  } catch (error) {
      console.error(error);
      throw error;
  } finally {
      conn.release();
  }
};
exports.getPurchaseOrderDraftsDB = async(tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const [result] = await conn.execute(
        `
        SELECT
        inv_pod.id, item_id,
        inv_pod.quantity, inv_pod.created_at,
        inv_items.title,
        inv_items.unit
        FROM inventory_purchase_orders_drafts inv_pod
        LEFT JOIN inventory_items inv_items ON inv_pod.item_id = inv_items.id
        WHERE inv_pod.tenant_id = ?
        `,
        [tenantId]
      );

      return result;
  } catch (error) {
      console.error(error);
      throw error;
  } finally {
      conn.release();
  }
}
exports.updatePurchaseOrderDraftItemQuantityDB = async (id, quantity, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const sql = `
      UPDATE inventory_purchase_orders_drafts
      SET
      quantity = ?, updated_at = NOW()
      WHERE id = ? AND tenant_id = ?
      `;

      await conn.query(sql, [quantity, id, tenantId]);
      return;
  } catch (error) {
      console.error(error);
      throw error;
  } finally {
      conn.release();
  }
};
exports.deletePurchaseOrderDraftItemDB = async (id, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

      const sql = `
      DELETE FROM inventory_purchase_orders_drafts
      WHERE id = ? AND tenant_id = ?
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

exports.createPurchaseOrderDB = async (vendorId, vendorName, contactPerson, taxIdNo, address, notes, items, userId, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    await conn.beginTransaction()

    // get PO sequence
    let purchaseOrderId = 0;

    const [orderIdRes] = await conn.query(`SELECT current_value FROM sequences WHERE tenant_id = ? AND table_name='inventory_purchase_orders' LIMIT 1 FOR UPDATE`, [tenantId])
    if(orderIdRes.length > 0) {
      purchaseOrderId = Number(orderIdRes[0]?.current_value || 0)
    }

    purchaseOrderId += 1

    // insert into po
    await conn.query(`
      INSERT INTO inventory_purchase_orders (id, tenant_id, created_at, vendor_id, vendor_name, contact_person, tax_id_no, address, created_by, notes, status) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
    `, [purchaseOrderId, tenantId, vendorId, vendorName, contactPerson, taxIdNo, address, userId, notes, 'ordered'])

    const itemsParams = items.map((item)=>[purchaseOrderId, tenantId, item.item_id, item.title, item.unit, item.quantity])

    // insert into po items
    await conn.query(`
      INSERT INTO inventory_purchase_order_items (purchase_order_id, tenant_id, inventory_item_id, inventory_item_name, inventory_item_unit, quantity) VALUES ?
    `, [itemsParams])

    // delete from drafts
    await conn.query(`DELETE FROM inventory_purchase_orders_drafts WHERE id IN (?) AND tenant_id = ?`, [items.map((item)=>item.id), tenantId])

    // update sequence
    await conn.query(
      `INSERT INTO sequences
      (tenant_id, table_name, current_value)
      VALUES (?, 'inventory_purchase_orders', ?)
      ON DUPLICATE KEY UPDATE
      current_value = VALUES(current_value)
      `
      , [tenantId, purchaseOrderId]);

    await conn.commit();
    return;
  } catch (error) {
    await conn.rollback();
    console.error(error);
    throw error;
  } finally {
    conn.release();
  }
};

exports.updatePurchaseOrderToCompleteDB = async (
  id,
  fullfilledDate,
  userId,
  tenantId
) => {
  const conn = await getMySqlPromiseConnection();
  try {
    await conn.beginTransaction();

    const sql = `
      UPDATE inventory_purchase_orders
      SET
      status = 'completed', fullfilled_at = ?
      WHERE id = ? AND tenant_id = ?
      `;

    await conn.query(sql, [fullfilledDate, id, tenantId]);

    // Add to inventory
    const [purchaseOrderItems] = await conn.query(
      `
        SELECT inventory_item_id, quantity FROM inventory_purchase_order_items
        WHERE purchase_order_id = ? AND tenant_id = ?
      `,
      [id, tenantId]
    );

    const inventoryItemIds = purchaseOrderItems.map(
      (item) => item.inventory_item_id
    );

    const [inventoryItems] = await conn.query(
      `
        SELECT id, quantity FROM inventory_items
        WHERE id IN (?) AND tenant_id = ?
        FOR UPDATE
      `,
      [inventoryItemIds, tenantId]
    );

    const inventoryUpdates = [];
    const inventoryLogs = [];

    purchaseOrderItems.forEach((poItem) => {
      const inventoryItem = inventoryItems.find(
        (item) => item.id === poItem.inventory_item_id
      );
      if (inventoryItem) {
        const previousQuantity = parseFloat(inventoryItem.quantity);
        const newQuantity = previousQuantity + parseFloat(poItem.quantity);

        // Prepare inventory update
        inventoryUpdates.push([newQuantity, inventoryItem.id, tenantId]);

        // Prepare inventory log
        inventoryLogs.push([
          tenantId,
          inventoryItem.id,
          "IN",
          poItem.quantity,
          previousQuantity,
          newQuantity,
          `Purchase Order #${id} fulfilled`,
          userId,
          new Date(),
        ]);
      }
    });

    // Update inventory quantities
    for (const [newQuantity, itemId, tenantId] of inventoryUpdates) {
      await conn.query(
        `
          UPDATE inventory_items
          SET quantity = ?
          WHERE id = ? AND tenant_id = ?
        `,
        [newQuantity, itemId, tenantId]
      );
    }

    // Add to inventory logs
    if (inventoryLogs.length > 0) {
      await conn.query(
        `
          INSERT INTO inventory_logs
          (tenant_id, inventory_item_id, type, quantity_change, previous_quantity, new_quantity, note, created_by, created_at)
          VALUES ?
        `,
        [inventoryLogs]
      );
    }

    // ENable Menu item again if disbaled and inventory items required for preparation are all available now
    const [disabledMenuItems] = await conn.query(
      `SELECT id FROM menu_items WHERE is_enabled = 0 AND tenant_id = ?`,
      [tenantId]
    );

    for (const menu of disabledMenuItems) {
      const menuItemId = menu.id;

      // Step 2: Get base recipe inventory requirements
      const [recipes] = await conn.query(
        `SELECT mir.inventory_item_id, mir.quantity, ii.quantity AS available_quantity
        FROM menu_item_recipes mir
        JOIN inventory_items ii ON mir.inventory_item_id = ii.id AND mir.tenant_id = ii.tenant_id
        WHERE mir.menu_item_id = ? AND mir.variant_id = 0 AND mir.addon_id = 0 AND mir.tenant_id = ?`,
        [menuItemId, tenantId]
      );

      // Step 3: Check if all required items are available
      const canEnable = recipes.length > 0 && recipes.every(r =>
        parseFloat(r.available_quantity) >= parseFloat(r.quantity)
      );

      // Step 4: Enable if all ingredients are sufficient
      if (canEnable) {
        await conn.query(
          `UPDATE menu_items SET is_enabled = 1 WHERE id = ? AND tenant_id = ?`,
          [menuItemId, tenantId]
        );
      }
    }

    await conn.commit();
    return;
  } catch (error) {
    await conn.rollback();
    console.error(error);
    throw error;
  } finally {
    conn.release();
  }
};

exports.getPurchaseOrdersDB = async (type, from, to, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    const { filter, params } = getFilterCondition(
      `po.created_at`,
      type,
      from,
      to
    );

    const sql = `
        SELECT id, tenant_id, created_at, fullfilled_at, vendor_id, vendor_name, contact_person, tax_id_no, address, created_by, notes, status
        FROM rasoirasta.inventory_purchase_orders po
        WHERE ${filter} AND tenant_id = ?
        ORDER BY po.created_at DESC
        `;

    const [results] = await conn.query(sql, [...params, tenantId]);
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
  }
};

exports.getPurchaseOrderItemsDB = async (purchaseOrderIds, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    const sql = `
      SELECT id, purchase_order_id, tenant_id, inventory_item_id, inventory_item_name, inventory_item_unit, quantity FROM inventory_purchase_order_items
      WHERE purchase_order_id IN (?) AND tenant_id = ?
    `;

    const [results] = await conn.query(sql, [purchaseOrderIds, tenantId]);
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
  }
};

/* Purchase Orders */
