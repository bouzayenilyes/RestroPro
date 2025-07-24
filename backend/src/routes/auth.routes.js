const express = require("express");
const { signIn, signOut, getNewAccessToken, removeDeviceAccessToken, getDevices, signUp, stripeProductSubscriptionLookup, stripeWebhook, getSubscriptionDetails, cancelSubscription, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { isLoggedIn, isAuthenticated, hasRefreshToken, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/signout", isLoggedIn, isAuthenticated, signOut);
router.post("/refresh-token", hasRefreshToken, getNewAccessToken);
router.post("/remove-device", isLoggedIn, isAuthenticated, removeDeviceAccessToken);
router.get("/devices", isLoggedIn, isAuthenticated, getDevices);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/subscription-details", isLoggedIn, isAuthenticated, authorize([]), getSubscriptionDetails);
router.post("/cancel-subscription", isLoggedIn, isAuthenticated, authorize([]), cancelSubscription);

router.post("/stripe-product-lookup", isLoggedIn, isAuthenticated, stripeProductSubscriptionLookup)
router.post("/stripe-webhook", stripeWebhook)

module.exports = router;