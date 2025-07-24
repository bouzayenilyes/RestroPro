const { Router } = require("express");
const { hasRefreshToken, isAuthenticated, isLoggedIn, isSuperAdmin } = require("../middlewares/auth.middleware");
const { signIn, signOut, getNewAccessToken, getSuperAdminDashboardData,  getTenants , getSuperAdminTenantsCntData , addTenant , updateTenant, deleteTenant , getSuperAdminReportsData , getTenantsDataByStatus, getTenantSubscriptionHistory } = require("../controllers/superadmin.controller");
const router = Router();


router.post("/signin", signIn)
router.post("/signout", hasRefreshToken, signOut)
router.post("/refresh-token", hasRefreshToken, getNewAccessToken);

router.get("/dashboard", isLoggedIn, isAuthenticated, isSuperAdmin, getSuperAdminDashboardData);

router.get('/tenantsData', isLoggedIn, isAuthenticated, isSuperAdmin, getSuperAdminTenantsCntData);
router.get('/tenants', isLoggedIn, isAuthenticated, isSuperAdmin, getTenants);
router.get('/tenants/:id/subscription-history', isLoggedIn, isAuthenticated, isSuperAdmin, getTenantSubscriptionHistory);
router.post('/tenants/add' ,  isLoggedIn, isAuthenticated, isSuperAdmin, addTenant)
router.patch('/tenants/update/:id' ,  isLoggedIn, isAuthenticated, isSuperAdmin, updateTenant)
router.delete('/tenants/delete/:id' ,  isLoggedIn, isAuthenticated, isSuperAdmin, deleteTenant)
router.get('/tenantsData/:status' ,  isLoggedIn, isAuthenticated, isSuperAdmin, getTenantsDataByStatus);

router.get("/reports", isLoggedIn, isAuthenticated, isSuperAdmin, getSuperAdminReportsData);


module.exports = router;
