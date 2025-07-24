const { Router } = require("express");

const {
  isLoggedIn,
  isAuthenticated,
  authorize,
  isSubscriptionActive,
} = require("../middlewares/auth.middleware");
const { SCOPES } = require("../config/user.config");
const {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  changeMenuItemVisibility,
  addMenuItemAddon,
  updateMenuItemAddon,
  deleteMenuItemAddon,
  getMenuItemAddons,
  getAllAddons,
  addMenuItemVariant,
  updateMenuItemVariant,
  deleteMenuItemVariant,
  getMenuItemVariants,
  getAllVariants,
  getAllMenuItems,
  getMenuItem,
  uploadMenuItemPhoto,
  removeMenuItemPhoto,
  addRecipeItem,
  getRecipeItems,
  deleteRecipeItem,
  updateRecipeItem,
} = require("../controllers/menu_item.controller");

const router = Router();

router.post(
  "/add",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  addMenuItem
);
router.post(
  "/update/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  updateMenuItem
);
router.post(
  "/update/:id/upload-photo",
  isLoggedIn,
  isAuthenticated,
  authorize([SCOPES.SETTINGS]),
  uploadMenuItemPhoto
);
router.post(
  "/update/:id/remove-photo",
  isLoggedIn,
  isAuthenticated,
  authorize([SCOPES.SETTINGS]),
  removeMenuItemPhoto
);
router.delete(
  "/delete/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  deleteMenuItem
);
router.patch(
  "/change-visibility/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  changeMenuItemVisibility
);
router.get(
  "/",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  getAllMenuItems
);
router.get(
  "/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  getMenuItem
);

/* menu item: Addons */
router.post(
  "/addons/:id/add",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  addMenuItemAddon
);
router.post(
  "/addons/:id/update/:addonId",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  updateMenuItemAddon
);
router.delete(
  "/addons/:id/delete/:addonId",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  deleteMenuItemAddon
);
router.get(
  "/addons/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  getMenuItemAddons
);
router.get(
  "/addons",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  getAllAddons
);
/* menu item: Addons */

/* menu item: variants */
router.post(
  "/variants/:id/add",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  addMenuItemVariant
);
router.post(
  "/variants/:id/update/:variantId",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  updateMenuItemVariant
);
router.delete(
  "/variants/:id/delete/:variantId",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  deleteMenuItemVariant
);
router.get(
  "/variants/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  getMenuItemVariants
);
router.get(
  "/variants",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  getAllVariants
);
/* menu item: variants */


/* menu item: Recipes */
router.get(
  "/recipe/items",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  getRecipeItems
);

router.post(
  "/recipe/:id/add",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  addRecipeItem
);

router.put(
  "/recipe/:id/update/:recipeItemId",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  updateRecipeItem
);

router.delete(
  "/recipe/:id/delete/:recipeItemId",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  deleteRecipeItem
);
/* menu item: Recipes */

module.exports = router;
