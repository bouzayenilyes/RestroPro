const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.getInvoicesDB = async (type, from, to, tenantId) => {
  const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterConditionForInvoices(type, from, to, tenantId)

        const sql = `
        SELECT
            o.invoice_id,
            o.id AS order_id,
            i.created_at,
            i.sub_total,
            i.tax_total,
            i.service_charge_total,
            i.total,
            o.table_id,
            st.table_title,
            st.\`floor\`,
            o.payment_status,
            o.token_no,
            o.delivery_type,
            o.customer_type,
            o.customer_id,
            c.\`name\`,
            c.email,
            i.payment_type_id
        FROM
            orders o
            INNER JOIN invoices i ON o.invoice_id = i.id AND i.tenant_id = o.tenant_id
            LEFT JOIN customers c ON o.customer_id = c.phone AND c.tenant_id = o.tenant_id
            LEFT JOIN store_tables st ON o.table_id = st.id
        WHERE ${filter}
        ORDER BY
            i.created_at DESC
        `;

        const [results] = await conn.query(sql, params);
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
      conn.release();
  }
};
const getFilterConditionForInvoices = (type, from, to, tenantId) => {
    const params = [];
    let filter = '';

    switch (type) {
        case 'custom': {
            params.push(from, to, tenantId);
            filter = `DATE(i.created_at) >= ? AND DATE(i.created_at) <= ? AND i.tenant_id = ?`;
            break;
        }
        case 'today': {
            params.push(tenantId);
            filter = `DATE(i.created_at) = CURDATE() AND i.tenant_id = ?`;
            break;
        }
        case 'this_month': {
          params.push(tenantId);
            filter = `YEAR(i.created_at) = YEAR(NOW()) AND MONTH(i.created_at) = MONTH(NOW()) AND i.tenant_id = ?`;
            break;
        }
        case 'last_month': {
          params.push(tenantId);
            filter = `DATE(i.created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND DATE(i.created_at) <= CURDATE() AND i.tenant_id = ?`;
            break;
        }
        case 'last_7days': {
          params.push(tenantId);
            filter = `DATE(i.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND DATE(i.created_at) <= CURDATE() AND i.tenant_id = ?`;
            break;
        }
        case 'yesterday': {
          params.push(tenantId);
            filter = `DATE(i.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND i.tenant_id = ?`;
            break;
        }
        case 'tomorrow': {
          params.push(tenantId);
            filter = `DATE(i.created_at) = DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND i.tenant_id = ?`;
            break;
        }
        default: {
          params.push(tenantId);
            filter = 'i.tenant_id = ?';
        }
    }

    return { params, filter };
}

exports.searchInvoicesDB = async (search, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

    const sql = `
    SELECT
      o.invoice_id,
      o.id AS order_id,
      i.created_at,
      i.sub_total,
      i.tax_total,
      i.service_charge_total,
      i.total,
      o.table_id,
      st.table_title,
      st.\`floor\`,
      o.payment_status,
      o.token_no,
      o.delivery_type,
      o.customer_type,
      o.customer_id,
      c.\`name\`,
      c.email,
      i.payment_type_id
    FROM
      orders o
      INNER JOIN invoices i ON o.invoice_id = i.id AND i.tenant_id = o.tenant_id
      LEFT JOIN customers c ON o.customer_id = c.phone AND c.tenant_id = o.tenant_id
      LEFT JOIN store_tables st ON o.table_id = st.id
    WHERE (o.invoice_id = ? OR o.id = ? OR o.customer_id LIKE ? OR c.\`name\` LIKE ?) AND i.tenant_id = ?
    ORDER BY
      i.created_at DESC
    LIMIT 20
    `;

    const [results] = await conn.query(sql, [search, search, search, `%${search}%`, tenantId]);
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
  }
};


exports.getInvoiceOrdersDB = async (orderIdsToFindSummary) => {
  const conn = await getMySqlPromiseConnection();
    try {

      const sql = `
      SELECT
        o.id,
        o.date,
        o.delivery_type,
        o.customer_type,
        o.customer_id,
        c. \`name\` AS customer_name,
        o.table_id,
        st.table_title,
        st. \`floor\`,
        o.status,
        o.payment_status,
        o.token_no
      FROM
        orders o
        LEFT JOIN customers c ON o.customer_id = c.phone AND c.tenant_id = o.tenant_id
        LEFT JOIN store_tables st ON o.table_id = st.id
      WHERE
        o.status NOT IN ('cancelled')
        AND o.id IN (${orderIdsToFindSummary})
      `;

      const [kitchenOrders] = await conn.query(sql);

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
          oi.variant_id,
          miv.title as variant_title,
          miv.price as variant_price,
          mi.price,
          mi.tax_id,
          t.title as tax_title,
          t.rate as tax_rate,
          t.type as tax_type,
          oi.quantity,
          oi.status,
          oi.date,
          oi.addons,
          oi.notes
        FROM
          order_items oi
          LEFT JOIN menu_items mi ON oi.item_id = mi.id
          LEFT JOIN menu_item_variants miv ON oi.item_id = miv.item_id AND oi.variant_id = miv.id
          LEFT JOIN taxes t ON mi.tax_id = t.id

        WHERE oi.order_id IN (${orderIds}) AND oi.status NOT IN ('cancelled')
        `
        const [kitchenOrdersItemsResult] = await conn.query(sql2);
        kitchenOrdersItems = kitchenOrdersItemsResult;

        const addonIds = [...new Set([...kitchenOrdersItems.flatMap((o)=>o.addons?JSON.parse(o?.addons):[])])].join(",");
        const [addonsResult] = addonIds ? await conn.query(`SELECT id, item_id, title, price FROM menu_item_addons WHERE id IN (${addonIds});`):[]
        addons = addonsResult;
      }

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

  exports.getInvoiceByIdDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();
      try {

          const sql = `
          SELECT
              id,
              created_at,
              sub_total,
              tax_total,
              service_charge_total,
              total,
              payment_type_id
          FROM
              invoices i
          WHERE id = ? AND tenant_id = ?
          `;

          const [results] = await conn.query(sql, [id, tenantId]);
          return results[0];
      } catch (error) {
          console.error(error);
          throw error;
      } finally {
        conn.release();
    }
  };
