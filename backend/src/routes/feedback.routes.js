const { Router } = require("express");

const {
  isLoggedIn,
  isAuthenticated,
  authorize,
  isSubscriptionActive,
} = require("../middlewares/auth.middleware");
const { SCOPES } = require("../config/user.config");
const { getFeedbackInit, getFeedbacks, searchFeedbacks } = require("../controllers/feedback.controller");

const router = Router();

router.get(
  "/",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.FEEDBACK]),
  getFeedbackInit
);

router.get(
    "/filter",
    isLoggedIn,
    isAuthenticated,
    isSubscriptionActive,
    authorize([SCOPES.FEEDBACK]),  
    getFeedbacks
);

router.get(
    "/search",
    isLoggedIn,
    isAuthenticated,
    isSubscriptionActive,
    authorize([SCOPES.FEEDBACK]),  
    searchFeedbacks
);

module.exports = router;
