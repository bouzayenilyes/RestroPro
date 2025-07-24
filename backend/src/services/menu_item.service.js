const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.addMenuItemDB = async (title, description, price, netPrice, taxId, categoryId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO menu_items
        (title, description, price, net_price, tax_id, category, tenant_id)
        VALUES
        (?, ?, ?, ?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [title, description, price, netPrice, taxId, categoryId, tenantId]);

        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.updateMenuItemDB = async (id, title, description, price, netPrice, taxId, categoryId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE menu_items SET
        title = ?, description = ?, price = ?, net_price = ?, tax_id = ?, category = ?
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [title, description, price, netPrice, taxId, categoryId, id, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.updateMenuItemImageDB = async (id, image, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE menu_items SET
        image = ?
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [image, id, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.deleteMenuItemDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM menu_items
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
}

exports.changeMenuItemVisibilityDB = async (id, isEnabled, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
         UPDATE menu_items SET
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

exports.getAllMenuItemsDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT
        i.id, i.title, i.description, price, net_price, tax_id, t.title AS tax_title, t.rate AS tax_rate, t.type AS tax_type, category as category_id, c.title AS category_title, image, i.is_enabled
        FROM menu_items i
        LEFT JOIN taxes t
        ON i.tax_id = t.id
        LEFT JOIN categories c
        ON i.category = c.id
        WHERE i.tenant_id = ?;
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

exports.getMenuItemDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT
        i.id, i.title, i.description, price, net_price, tax_id, t.title AS tax_title, t.rate AS tax_rate, t.type AS tax_type, category as category_id, c.title AS category_title, image, i.is_enabled
        FROM menu_items i
        LEFT JOIN taxes t
        ON i.tax_id = t.id
        LEFT JOIN categories c
        ON i.category = c.id
        WHERE i.id = ? AND i.tenant_id = ?
        `;

        const [result] = await conn.query(sql, [id, tenantId]);
        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

/**
 * @param {number} itemId Menu Item ID to add Addon
 * @param {string} title Title of Addon
 * @param {number} price Additonal Price for addon, Put 0 / null to make addon as free option
 * @returns {Promise<number>}
 *  */
exports.addMenuItemAddonDB = async (itemId, title, price, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO menu_item_addons
        (item_id, title, price, tenant_id)
        VALUES
        (?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [itemId, title, price, tenantId]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * @param {number} itemId Menu Item ID
 * @param {number} addonId Addon ID
 * @param {string} title Title of Addon
 * @param {number} price Additonal Price for addon, Put 0 / null to make addon as free option
 * @returns {Promise<void>}
 *  */
exports.updateMenuItemAddonDB = async (itemId, addonId, title, price, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE menu_item_addons
        SET
        title = ?, price = ?
        WHERE id = ? AND item_id = ? AND tenant_id = ?
        `;

        await conn.query(sql, [title, price, addonId, itemId, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * @param {number} itemId Menu Item ID
 * @param {number} addonId Addon ID
 * @returns {Promise<void>}
 *  */
exports.deleteMenuItemAddonDB = async (itemId, addonId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM menu_item_addons
        WHERE id = ? AND item_id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [addonId, itemId, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * @param {number} itemId Menu Item ID
 * @param {number} addonId Addon ID
 * @returns {Promise<Array>}
 *  */
exports.getMenuItemAddonsDB = async (itemId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT id, item_id, title, price FROM menu_item_addons
        WHERE item_id = ? AND tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [itemId, tenantId]);

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getAllAddonsDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT id, item_id, title, price FROM menu_item_addons
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

/**
 * @param {number} itemId Menu Item ID to add Variant
 * @param {string} title Title of Variant
 * @param {number} price Additonal Price for Variant, Put 0 / null to make Variant as free option
 * @returns {Promise<number>}
 *  */
exports.addMenuItemVariantDB = async (itemId, title, price, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO menu_item_variants
        (item_id, title, price, tenant_id)
        VALUES
        (?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [itemId, title, price, tenantId]);

        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateMenuItemVariantDB = async (itemId, variantId, title, price, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE menu_item_variants
        SET
        title = ?, price = ?
        WHERE item_id = ? AND id = ? AND tenant_id = ?
        `;

        await conn.query(sql, [title, price, itemId, variantId, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteMenuItemVariantDB = async (itemId, variantId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM menu_item_variants
        WHERE item_id = ? AND id = ? AND tenant_id = ?
        `;

        await conn.query(sql, [itemId, variantId, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getMenuItemVariantsDB = async (itemId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT id, item_id, title, price FROM menu_item_variants
        WHERE item_id = ? AND tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [itemId, tenantId]);

        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};
exports.getAllVariantsDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT id, item_id, title, price FROM menu_item_variants
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


exports.addRecipeItemDB = async (menuItemId, variantId, addonId, ingredientId, quantity, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        INSERT INTO menu_item_recipes
        (menu_item_id, variant_id, addon_id, inventory_item_id, quantity, tenant_id)
        VALUES
        (?, ?, ?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [menuItemId, variantId, addonId, ingredientId, quantity, tenantId]);

        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateRecipeItemDB = async (recipeItemId, menuItemId, variantId, addonId, ingredientId, quantity, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        UPDATE menu_item_recipes
        SET
          menu_item_id = ?,
          variant_id = ?,
          addon_id = ?,
          inventory_item_id = ?,
          quantity = ?
        WHERE id = ? AND tenant_id = ?;
      `;

        const [result] = await conn.query(sql, [
            menuItemId,
            variantId,
            addonId,
            ingredientId,
            quantity,
            recipeItemId,
            tenantId
        ]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getRecipeItemsDB = async (menuItemId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
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
            mir.quantity
        FROM
            menu_item_recipes mir
        LEFT JOIN
            menu_items mi ON mir.menu_item_id = mi.id
        LEFT JOIN
            menu_item_variants v ON mir.variant_id = v.id
        LEFT JOIN
            menu_item_addons a ON mir.addon_id = a.id
        LEFT JOIN
            inventory_items ii ON mir.inventory_item_id = ii.id
        WHERE
            mir.menu_item_id = ? AND mir.tenant_id = ?
        `;

        const [rows] = await conn.query(sql, [menuItemId, tenantId]);
        return rows;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getAllRecipeItemsDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
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
        LEFT JOIN
            menu_items mi ON mir.menu_item_id = mi.id
        LEFT JOIN
            menu_item_variants v ON mir.variant_id = v.id
        LEFT JOIN
            menu_item_addons a ON mir.addon_id = a.id
        LEFT JOIN
            inventory_items ii ON mir.inventory_item_id = ii.id
        WHERE
            mir.tenant_id = ?
        `;

        const [rows] = await conn.query(sql, [tenantId]);
        return rows;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteRecipeItemDB = async (itemId, recipeItemId, variant, addon, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {
        let sql = `
        DELETE FROM menu_item_recipes
        WHERE menu_item_id = ?
        AND id = ?
        AND tenant_id = ?
      `;

        const params = [itemId, recipeItemId, tenantId];

        if (variant) {
            sql += ` AND variant_id = ?`;
            params.push(variant);
        }

        if (addon) {
            sql += ` AND addon_id = ?`;
            params.push(addon);
        }

        await conn.query(sql, params);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};
