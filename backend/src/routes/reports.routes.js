const { Router } = require("express");

const { isLoggedIn, isAuthenticated,
    authorize,
    isSubscriptionActive,
  } = require("../middlewares/auth.middleware");
  const { SCOPES } = require("../config/user.config");
const { getReports } = require("../controllers/reports.controller");

const router = Router();

router.get("/", isLoggedIn, isAuthenticated, isSubscriptionActive, authorize([SCOPES.REPORTS]), getReports);

module.exports = router;