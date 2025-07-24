const { Router } = require("express");

const {
  isLoggedIn,
  isAuthenticated,
  authorize,
  isSubscriptionActive,
} = require("../middlewares/auth.middleware");
const { SCOPES } = require("../config/user.config");
const {
  addCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  getCustomer,
  searchCustomer,
  getAllCustomers,
  uploadBulkCustomers,
} = require("../controllers/customer.controller");

const router = Router();

router.post(
  "/add",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.MANAGE_CUSTOMERS]),
  addCustomer
);

router.get(
  "/",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.CUSTOMERS, SCOPES.VIEW_CUSTOMERS]),
  getCustomers
);

router.get(
  "/download/all",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.CUSTOMERS, SCOPES.VIEW_CUSTOMERS]),
  getAllCustomers
);

router.post(
  "/upload/bulk",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.CUSTOMERS, SCOPES.VIEW_CUSTOMERS]),
  uploadBulkCustomers
);

router.get(
  "/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.CUSTOMERS, SCOPES.VIEW_CUSTOMERS]),
  getCustomer
);
router.get(
  "/search-by-phone-name/search",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.CUSTOMERS, SCOPES.VIEW_CUSTOMERS]),
  searchCustomer
);

router.post(
  "/:id/update",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.CUSTOMERS, SCOPES.MANAGE_CUSTOMERS]),
  updateCustomer
);
router.delete(
  "/:id/delete",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.CUSTOMERS, SCOPES.MANAGE_CUSTOMERS]),
  deleteCustomer
);

module.exports = router;
