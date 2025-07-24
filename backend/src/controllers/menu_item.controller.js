const { addMenuItemDB, updateMenuItemDB, deleteMenuItemDB, addMenuItemAddonDB, updateMenuItemAddonDB, deleteMenuItemAddonDB, getMenuItemAddonsDB, getAllAddonsDB, addMenuItemVariantDB, updateMenuItemVariantDB, deleteMenuItemVariantDB, getMenuItemVariantsDB, getAllVariantsDB, getAllMenuItemsDB, getMenuItemDB, updateMenuItemImageDB, changeMenuItemVisibilityDB, getRecipeItemsDB, addRecipeItemDB, deleteRecipeItemDB, updateRecipeItemDB } = require("../services/menu_item.service");

const path = require("path")
const fs = require("fs");
const { getInventoryItemsDB } = require("../services/inventory.service");

exports.addMenuItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const {title, description, price, netPrice, taxId, categoryId} = req.body;

        if(!(title && price)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_provide_required_details") // Translate message
            });
        }

        const menuItemId = await addMenuItemDB(title, description, price, netPrice, taxId, categoryId, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_added"), // Translate message
            menuItemId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;
        const {title, description, price, netPrice, taxId, categoryId} = req.body;

        if(!(title && price)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_provide_required_details") // Translate message
            });
        }

        await updateMenuItemDB(id, title, description, price, netPrice, taxId, categoryId, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_updated") // Translate message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.uploadMenuItemPhoto = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;

        const file = req.files.image;

        const imagePath = path.join(__dirname, `../../public/${tenantId}/`) + id;

        if(!fs.existsSync(path.join(__dirname, `../../public/${tenantId}/`))) {
            fs.mkdirSync(path.join(__dirname, `../../public/${tenantId}/`));
        }

        const imageURL = `/public/${tenantId}/${id}`;

        await file.mv(imagePath);
        await updateMenuItemImageDB(id, imageURL, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_image_uploaded"), // Translate message
            imageURL: imageURL
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.removeMenuItemPhoto = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;
        const imagePath = path.join(__dirname, `../../public/${tenantId}/`) + id;

        fs.unlinkSync(imagePath)

        await updateMenuItemImageDB(id, null, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_image_removed") // Translate message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;

        await deleteMenuItemDB(id, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_deleted") // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.changeMenuItemVisibility = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;
        const isEnabled = req.body.isEnabled;

        await changeMenuItemVisibilityDB(id, isEnabled, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_visibility_updated") // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.getAllMenuItems = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const [menuItems, addons, variants] = await Promise.all([
            getAllMenuItemsDB(tenantId),
            getAllAddonsDB(tenantId),
            getAllVariantsDB(tenantId)
        ]);

        const formattedMenuItems = menuItems.map(item => {
            const itemAddons = addons.filter(addon => addon.item_id == item.id);
            const itemVariants = variants.filter(variant => variant.item_id == item.id);

            return {
                ...item,
                addons: [...itemAddons],
                variants: [...itemVariants],
            }
        })

        return res.status(200).json(formattedMenuItems);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.getMenuItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;

        const [menuItem, addons, variants, recipeItems, inventoryItemsResult] = await Promise.all([
            getMenuItemDB(id, tenantId),
            getMenuItemAddonsDB(id, tenantId),
            getMenuItemVariantsDB(id, tenantId),
            getRecipeItemsDB(id, tenantId), //Menu item Recipe Items
            getInventoryItemsDB('all' /**status */, tenantId)
        ]);

        const formattedMenuItem = {
            ...menuItem,
            addons: [...addons],
            variants: [...variants],
            recipeItems: [...recipeItems],
        }

        const { items: inventoryItems } = inventoryItemsResult;

        return res.status(200).json({formattedMenuItem, inventoryItems});
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

/* Addons */
exports.addMenuItemAddon = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;
        const {title, price} = req.body;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_addon_provide_required_details") // Translate message
            });
        }

        const menuItemAddonId = await addMenuItemAddonDB(itemId, title, price, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_addon_added"), // Translate message
            addonId: menuItemAddonId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.updateMenuItemAddon = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;
        const addonId = req.params.addonId;
        const {title, price} = req.body;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_addon_provide_required_details") // Translate message
            });
        }

        await updateMenuItemAddonDB(itemId, addonId, title, price, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_addon_updated"), // Translate message
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.deleteMenuItemAddon = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;
        const addonId = req.params.addonId;

        await deleteMenuItemAddonDB(itemId, addonId, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_addon_deleted"), // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.getMenuItemAddons = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;

        const itemAddons = await getMenuItemAddonsDB(itemId, tenantId);

        if(itemAddons.length == 0) {
            return res.status(404).json({
                success: false,
                message: req.__("no_addons_found_for_item") // Translate message
            });
        }

        return res.status(200).json(itemAddons);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.getAllAddons = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const addons = await getAllAddonsDB(tenantId);

        return res.status(200).json(addons);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
/* Addons */


/* Variants */
exports.addMenuItemVariant = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;
        const {title, price} = req.body;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_variant_provide_required_details") // Translate message
            });
        }

        const menuItemVariantId = await addMenuItemVariantDB(itemId, title, price, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_variant_added"), // Translate message
            variantId: menuItemVariantId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.updateMenuItemVariant = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;
        const variantId = req.params.variantId;
        const {title, price} = req.body;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("menu_item_variant_provide_required_details") // Translate message
            });
        }

        await updateMenuItemVariantDB(itemId, variantId, title, price, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_variant_updated") // Translate message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.deleteMenuItemVariant = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;
        const variantId = req.params.variantId;

        await deleteMenuItemVariantDB(itemId, variantId, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("menu_item_variant_deleted") // Translate message
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.getMenuItemVariants = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;

        const itemVariants = await getMenuItemVariantsDB(itemId, tenantId);

        if(itemVariants.length == 0) {
            return res.status(404).json({
                success: false,
                message: req.__("no_variants_found_for_item") // Translate message
            });
        }

        return res.status(200).json(itemVariants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
exports.getAllVariants = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const allVariants = await getAllVariantsDB(tenantId);

        return res.status(200).json(allVariants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
/* Variants */


/** Recipes */
exports.addRecipeItem = async (req, res) => {
    try {
      const tenantId = req.user.tenant_id;
      const menuItemId = req.params.id;
      const { variantId, addonId, ingredientId, quantity } = req.body;

      if (!menuItemId || !variantId && !addonId && !ingredientId) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required data"
        });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid quantity."
        });
      }

      const recipeItemId = await addRecipeItemDB(menuItemId, variantId, addonId, ingredientId, quantity, tenantId);

      return res.status(200).json({
        success: true,
        message: "Recipe Item Added.",
        recipeItemId: recipeItemId
      });
    } catch (error) {
      console.error(error);

      if (error.errno === 1062) {
        return res.status(400).json({
          success: false,
          message: "Recipe item already exists. Please update the quantity if needed."
        });
      }

      return res.status(500).json({
        success: false,
        message: "Something went wrong! Please try again later."
      });
    }
  };

  exports.updateRecipeItem = async (req, res) => {
    try {
      const tenantId = req.user.tenant_id;
      const menuItemId = req.params.id;
      const recipeItemId = req.params.recipeItemId;
      const { variantId, addonId, ingredientId, quantity } = req.body;

      if (!menuItemId || !recipeItemId || (!variantId && !addonId && !ingredientId)) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required data.",
        });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid quantity.",
        });
      }

      await updateRecipeItemDB(recipeItemId, menuItemId, variantId, addonId, ingredientId, quantity, tenantId);

      return res.status(200).json({
        success: true,
        message: "Recipe Item Updated.",
      });
    } catch (error) {
      console.error(error);

      if (error.errno === 1062) {
        return res.status(400).json({
          success: false,
          message: "Recipe item already exists. Please update the quantity if needed."
        });
      }

      return res.status(500).json({
        success: false,
        message: "Something went wrong! Please try again later.",
      });
    }
  };


  exports.getRecipeItems = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const menuItemId = req.params.id;

        const recipeItems = await getRecipeItemsDB(menuItemId, tenantId);

        return res.status(200).json(recipeItems);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try again later."
        });
    }
 };

 exports.deleteRecipeItem = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const itemId = req.params.id;
        const recipeItemId = req.params.recipeItemId;

        const {variant = null, addon = null} = req.query;

        await deleteRecipeItemDB(itemId, recipeItemId, variant, addon, tenantId);

        return res.status(200).json({
            success: true,
            message: "Recipe Item Deleted.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
};

/** Recipes*/
