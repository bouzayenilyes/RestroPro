const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.createOrderDB = async (tenantId, cartItems, deliveryType, customerType, customerId, tableId, paymentStatus = 'pending', invoiceId=null, username = null) => {
  const conn = await getMySqlPromiseConnection();

  try {
    // start transaction
    await conn.beginTransaction();

    // step 1: get current token no. from table token_sequences
    // if no data found give 0
    let tokenNo = 0;

    const [tokenSequence] = await conn.query("SELECT sequence_no, DATE(last_updated) as last_updated, DATE(NOW()) as todays_date FROM token_sequences WHERE tenant_id = ? LIMIT 1 FOR UPDATE", [tenantId]);
    tokenNo = tokenSequence[0]?.sequence_no || 0;
    const tokenLastUpdated = tokenSequence[0]?.last_updated ? new Date(tokenSequence[0]?.last_updated).toISOString().substring(0, 10) : new Date().toISOString().substring(0,10);

    const today = new Date(tokenSequence[0]?.todays_date || Date.now()).toISOString().substring(0,10);

    console.log(tokenLastUpdated, today);



    if(tokenLastUpdated != today) {
      tokenNo = 0;
    }

    // step 2: increase the token no. by +1
    tokenNo += 1;

    // step 3: save data to orders table
    const [orderResult] = await conn.query(`INSERT INTO orders (delivery_type, customer_type, customer_id, table_id, token_no, payment_status, invoice_id, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [deliveryType, customerType, customerId, tableId, tokenNo, paymentStatus || 'pending', invoiceId || null, tenantId]);

    const orderId = orderResult.insertId;

    // step 4: save data to order_items
    const sqlOrderItems = `
    INSERT INTO order_items
    (order_id, item_id, variant_id, price, quantity, notes, addons, tenant_id)
    VALUES ?
    `;

    await conn.query(sqlOrderItems, [cartItems.map((item)=>[orderId, item.id, item.variant_id, item.price, item.quantity, item.notes, item?.addons_ids?.length > 0 ? JSON.stringify(item.addons_ids):null, tenantId ])]);

    // step 6: Save updated token no. to table token_sequences
    await conn.query("INSERT INTO token_sequences ( sequence_no, last_updated, tenant_id) VALUES (?, NOW(), ?) ON DUPLICATE KEY UPDATE sequence_no = VALUES(sequence_no), last_updated = VALUES(last_updated) ;", [tokenNo, tenantId]);

     // Track Recipe/Inventory Item Usuage
     const inventoryUsage = {};

     cartItems.forEach(item => {
       item.recipeItems.forEach(recipe => {
         const { inventory_item_id, recipe_quantity, ingredient_title, unit, variant_id, addon_id } = recipe;

         // Skip if variant-specific and doesn't match
         if (variant_id && variant_id != item.variant_id) return;

         // Skip if addon-specific and not included
         if (addon_id && !item.addons_ids?.map(String).includes(String(addon_id))) return;

         const invId = inventory_item_id;
         const qtyNeeded = parseFloat(recipe_quantity) * item.quantity;

         if (!inventoryUsage[invId]) {
           inventoryUsage[invId] = {
             ingredient_title,
             unit,
             total_quantity: 0
           };
         }

         inventoryUsage[invId].total_quantity += qtyNeeded;
       });
     });


      // Step 7: Update inventory_items and insert into inventory_logs
      const updateInventorySql = `
        UPDATE inventory_items
        SET quantity = ?, status = ?
        WHERE id = ? AND tenant_id = ?
      `;

      const insertLogSql = `
        INSERT INTO inventory_logs
        (tenant_id, inventory_item_id, type, quantity_change, previous_quantity, new_quantity, note, created_by)
        VALUES (?, ?, 'OUT', ?, ?, ?, ?, ?)
      `;

      for (const [inventoryItemId, usage] of Object.entries(inventoryUsage)) {
        const invId = parseInt(inventoryItemId);
        const qtyUsed = parseFloat(usage.total_quantity);

        const [[currentItem]] = await conn.query(
          'SELECT quantity, min_quantity_threshold FROM inventory_items WHERE id = ? AND tenant_id = ? FOR UPDATE',
          [invId, tenantId]
        );

        const previousQty = parseFloat(currentItem?.quantity || 0);
        const newQty = previousQty - qtyUsed;
        const minQuantityThreshold = parseFloat(currentItem?.min_quantity_threshold || 0);

        // Insert into inventory_logs
        await conn.query(insertLogSql, [
          tenantId,
          invId,
          qtyUsed,
          previousQty,
          newQty,
          invoiceId ? `Auto deduction for recipe usage in invoice #${invoiceId}` : 'Auto deduction for recipe usage in order',
          username
        ]);

        let status = 'out';
        if (newQty > 0 && newQty <= minQuantityThreshold) {
          status = 'low';
        } else if (newQty > minQuantityThreshold) {
          status = 'in';
        }

        // Update inventory_items
        await conn.query(updateInventorySql, [newQty, status, invId, tenantId]);

        // if (newQty <= 0) {
        //   const [[recipeCheck]] = await conn.query(
        //     `SELECT quantity
        //      FROM menu_item_recipes
        //      WHERE inventory_item_id = ? AND variant_id = 0 AND addon_id = 0 AND tenant_id = ?`,
        //     [invId, tenantId]
        //   );

        //   if ((recipeCheck && newQty < parseFloat(recipeCheck.quantity)) || newQty <= 0) {
        //     const [menuItemsToDisable] = await conn.query(
        //       `SELECT DISTINCT mi.id
        //        FROM menu_items mi
        //        JOIN menu_item_recipes mir ON mi.id = mir.menu_item_id
        //        WHERE mir.inventory_item_id = ?
        //          AND mir.variant_id = 0
        //          AND mir.addon_id = 0
        //          AND mi.tenant_id = ?`,
        //       [invId, tenantId]
        //     );

        //     if (menuItemsToDisable.length > 0) {
        //       const menuItemIds = menuItemsToDisable.map(row => row.id);
        //       if (menuItemIds.length > 0) {
        //         await conn.query(
        //           `UPDATE menu_items
        //            SET is_enabled = 0
        //            WHERE tenant_id = ? AND id IN (?)`,
        //           [tenantId, menuItemIds]
        //         );
        //       }
        //     }
        //   }
        // }
      }

    // step 7: commit transaction / if any exception occurs then rollback
    await conn.commit();

    return {
      tokenNo,
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

exports.getPOSQROrdersCountDB = async (tenantId) => {
  const conn = await getMySqlPromiseConnection();

    try {
      const sql = `
        SELECT COUNT(*) AS total_orders FROM qr_orders
        WHERE tenant_id = ? AND status NOT IN('completed', 'cancelled');
      `;

      const [result] = await conn.query(sql, [tenantId]);
      return result[0].total_orders ?? 0;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getPOSQROrdersDB = async (tenantId) => {
  const conn = await getMySqlPromiseConnection();

    try {
      const sql = `
       SELECT
        o.id,
        o.date,
        o.delivery_type,
        o.customer_type,
        o.customer_id,
        c.name AS customer_name,
        o.table_id,
        st.table_title,
        st.floor,
        o.status,
        o.payment_status
      FROM
        qr_orders o
        LEFT JOIN customers c ON o.customer_id = c.phone AND c.tenant_id = o.tenant_id
        LEFT JOIN store_tables st ON o.table_id = st.id
      WHERE
        o.status NOT IN('completed', 'cancelled')
        AND o.tenant_id = ?
      `;

      const [kitchenOrders] = await conn.query(sql, [tenantId]);

      let kitchenOrdersItems = [];
      let addons = [];

      if(kitchenOrders.length > 0) {
        const orderIds = kitchenOrders.map(o=>o.id).join(",");
        const sql2 = `
          SELECT
            oi.id,
            oi.order_id,
            oi.item_id,
            mi.title AS item_title,
            mi.tax_id,
            t.title as tax_title,
            t.rate as tax_rate,
            t.type as tax_type,
            oi.variant_id,
            miv.title AS variant_title,
            miv.price AS variant_price,
            oi.price,
            oi.quantity,
            oi.status,
            oi.date,
            oi.addons,
            oi.notes
          FROM
            qr_order_items oi
            LEFT JOIN menu_items mi ON oi.item_id = mi.id
            LEFT JOIN taxes t ON t.id = mi.tax_id
            LEFT JOIN menu_item_variants miv ON oi.item_id = miv.item_id
            AND oi.variant_id = miv.id
          WHERE
            oi.order_id IN (${orderIds})
        `
        const [kitchenOrdersItemsResult] = await conn.query(sql2);
        kitchenOrdersItems = kitchenOrdersItemsResult;

        const addonIds = [...new Set([...kitchenOrdersItems.flatMap((o)=>o.addons?JSON.parse(o?.addons):[])])].join(",");
        const [addonsResult] = addonIds ? await conn.query(`SELECT id, item_id, title FROM menu_item_addons WHERE id IN (${addonIds});`):[]
        addons = addonsResult;
      }

      // Get recipe items for all menu items
      const recipeSql = `
        SELECT
          mir.id,
          mir.menu_item_id,
          mir.variant_id,
          mir.addon_id,
          mir.inventory_item_id,
          mi.title AS menu_item_title,
          v.title AS variant_title,
          a.title AS addon_title,
          ii.title AS ingredient_title,
          ii.unit,
          ii.quantity as current_quantity,
          ii.min_quantity_threshold,
          mir.quantity as recipe_quantity
        FROM
          menu_item_recipes mir
        LEFT JOIN menu_items mi ON mir.menu_item_id = mi.id
        LEFT JOIN menu_item_variants v ON mir.variant_id = v.id
        LEFT JOIN menu_item_addons a ON mir.addon_id = a.id
        LEFT JOIN inventory_items ii ON mir.inventory_item_id = ii.id
        WHERE mir.tenant_id = ?
      `;

      const [recipeItemsResult] = await conn.query(recipeSql, [tenantId]);
      recipeItems = recipeItemsResult;

      // Attach recipeItems to each kitchenOrderItem
      kitchenOrdersItems = kitchenOrdersItems.map(oi => {
        const relevantRecipeItems = recipeItems.filter(ri =>
          ri.menu_item_id === oi.item_id &&
          (ri.variant_id == 0 || ri.variant_id === oi.variant_id) &&
          (ri.addon_id === 0 || oi.addons?.includes(ri.addon_id))
        );
        return {
          ...oi,
          recipeItems: relevantRecipeItems
        };
      });

      return {
        kitchenOrders,
        kitchenOrdersItems,
        addons
      }
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateQROrderStatusDB = async (tenantId, orderId, status) => {
  const conn = await getMySqlPromiseConnection();

  try {
    const sql = `
      UPDATE qr_orders
      SET status = ?
      WHERE tenant_id = ? AND id = ?;
    `;

    const [result] = await conn.query(sql, [status, tenantId, orderId]);
    return
  } catch (error) {
      console.error(error);
      throw error;
  } finally {
      conn.release();
  }
};


exports.cancelAllQROrdersDB = async (tenantId, status) => {
  const conn = await getMySqlPromiseConnection();

  try {
    const sql = `
      UPDATE qr_orders
      SET status = ?
      WHERE tenant_id = ?;
    `;

    const [result] = await conn.query(sql, [status, tenantId]);
    return;
  } catch (error) {
      console.error(error);
      throw error;
  } finally {
      conn.release();
  }
};
