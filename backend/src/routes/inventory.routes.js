const { Router } = require("express");
const {
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize,
} = require("../middlewares/auth.middleware");
const { SCOPES } = require("../config/user.config");

const {
  addInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  addInventoryItemStockMovement,
  getInventoryLogs,
  getInventoryDashboardData
} = require("../controllers/inventory.controller.js");

const router = Router();

router.post(
  "/add-item",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVENTORY]),
  addInventoryItem
);

router.get(
  "/",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVENTORY]),
  getInventoryItems
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVENTORY]),
  updateInventoryItem
);

router.patch(
  "/:id/add-stock-movement",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVENTORY]),
  addInventoryItemStockMovement
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVENTORY]),
  deleteInventoryItem
);

router.get(
  "/logs",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVENTORY]),
  getInventoryLogs
);

router.get(
  "/dashboard",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVENTORY]),
  getInventoryDashboardData
);

module.exports = router;
