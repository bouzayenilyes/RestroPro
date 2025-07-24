const { Router } = require("express");

const {
  isLoggedIn,
  isAuthenticated,
  authorize,
  isSubscriptionActive,
} = require("../middlewares/auth.middleware");
const { SCOPES } = require("../config/user.config");
const {
  getInvoices,
  getInvoicesInit,
  getInvoiceOrders,
  searchInvoices,
} = require("../controllers/invoice.controller");

const router = Router();

router.get(
  "/search",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVOICES, SCOPES.POS]),
  searchInvoices
);
router.get(
  "/",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVOICES, SCOPES.POS]),
  getInvoices
);
router.get(
  "/init",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVOICES, SCOPES.POS]),
  getInvoicesInit
);

router.post(
  "/orders",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.INVOICES, SCOPES.POS]),
  getInvoiceOrders
);

module.exports = router;
