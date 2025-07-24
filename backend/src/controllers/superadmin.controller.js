const { CONFIG } = require("../config");
const { removeRefreshTokenDB, addRefreshTokenDB, verifyRefreshTokenDB } = require("../services/auth.service");

const { signInDB, getAdminUserDB, getActiveTenantsDB, getInActiveTenantsDB,getAllTenantsDB,  getOrdersProcessedTodayDB, getSalesVolumeTodayDB, getMRRValueDB, getARRValueDB, getRestaurantsTotalCustomersDB, getSuperAdminTopSellingItemsDB, getSuperAdminSalesVolumeDB, getSuperAdminOrdersProcessedDB, getTenantsDB , addTenantDB , updateTenantDB , getTenantCntByIdDB ,getTenantDetailsByIdDB , logoutAllUsersOfTenantDB , deleteTenantDB , getTenantsDataByStatusDB, getTenantSubscriptionHistoryDB, getTenantTotalUsersDB, getTenantDetailsDB, getTenantStoreDetailsDB } = require("../services/superadmin.service")
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const {checkEmailExistsSuperadminDB} = require('../services/auth.service');

exports.signIn = async (req, res) => {
    try {

        const username = req.body.username;
        const password = req.body.password;

        if (!(username && password)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details") // Translate message
            });
        }

        const result = await signInDB(username, password);

        if (result) {
            // set cookie
            const cookieOptions = {
                expires: new Date(Date.now() + parseInt(CONFIG.COOKIE_EXPIRY)),
                httpOnly: true,
                domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
                sameSite: false,
                secure: process.env.NODE_ENV == "production",
                path: "/"
            };

            const refreshTokenExpiry = new Date(Date.now() + parseInt(CONFIG.COOKIE_EXPIRY_REFRESH));
            const cookieRefreshTokenOptions = {
                expires: refreshTokenExpiry,
                httpOnly: true,
                domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
                sameSite: false,
                secure: process.env.NODE_ENV == "production",
                path: "/"
            };

            result.password = undefined;

            const payload = {
                username: result.email,
                name: result.name,
                role: "superadmin",
            }
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            res.cookie('accessToken', accessToken, cookieOptions);
            res.cookie('refreshToken', refreshToken, cookieRefreshTokenOptions);
            res.cookie('restroprosaas__authenticated', true, {
                expires: new Date(Date.now() + parseInt(CONFIG.COOKIE_EXPIRY_REFRESH)),
                domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
                sameSite: false,
                secure: process.env.NODE_ENV == "production",
                path: "/"
            })

            // set refresh token in DB.
            const deviceDetails = req.useragent;

            const deviceIP = req.connection.remoteAddress;
            const deviceName = `${deviceDetails.platform}\nBrowser: ${deviceDetails.browser}`;
            const deviceLocation = null;
            await addRefreshTokenDB(username, refreshToken, refreshTokenExpiry, deviceIP, deviceName, deviceLocation, null);

            return res.status(200).json({
                success: true,
                message: req.__("login_successful"), // Translate message
                accessToken,
                user: payload
            })

        } else {
            return res.status(401).json({
                success: false,
                message: req.__("email_or_password_invalid") // Translate message
            });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("facing_issues_try_later") // Translate message
        });
    }
}
exports.signOut = async (req, res) => {
    try {
        const user = req.user;
        const refreshToken = req.cookies.refreshToken;

        const cookieOptions = {
            expires: new Date(Date.now()),
            httpOnly: true,
            domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
            sameSite: false,
            secure: process.env.NODE_ENV == "production",
            path: "/"
        };

        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        res.clearCookie('restroprosaas__authenticated', {
            expires: new Date(Date.now()),
            domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
            sameSite: false,
            secure: process.env.NODE_ENV == "production",
            path: "/"
        });

        // remove refreshToken in DB.
        await removeRefreshTokenDB(user.username, refreshToken);

        return res.status(200).json({
            success: true,
            message: req.__("logout_successful") // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
}

exports.getNewAccessToken = async (req, res) => {
    try {
        const user = req.user;
        const refreshToken = req.cookies.refreshToken;

        // verify the refresh token with the DB
        const isExist = await verifyRefreshTokenDB(refreshToken);

        if(isExist) {
            // generate new access token
            // set cookie
            const cookieOptions = {
                expires: new Date(Date.now() + parseInt(CONFIG.COOKIE_EXPIRY)),
                httpOnly: true,
                domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
                sameSite: false,
                secure: process.env.NODE_ENV == "production",
                path: "/"
            };
            const u = await getAdminUserDB(user.username);
            const payload = {
                username: u.email,
                name: u.name,
                role: "superadmin",
            }
            const accessToken = generateAccessToken(payload);

            res.cookie('accessToken', accessToken, cookieOptions);

            return res.status(200).json({
                success: true,
                message: req.__("new_token_created_successfully"), // Translate message
                accessToken
            });
        } else {
            res.clearCookie('accessToken', {
                expires: new Date(Date.now()),
                httpOnly: true,
                domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
                sameSite: false,
                secure: process.env.NODE_ENV == "production",
                path: "/"
            });
            res.clearCookie('refreshToken', {
                expires: new Date(Date.now()),
                httpOnly: true,
                domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
                sameSite: false,
                secure: process.env.NODE_ENV == "production",
                path: "/"
            });
            res.clearCookie('restroprosaas__authenticated', {
                expires: new Date(Date.now()),
                domain: CONFIG.FRONTEND_DOMAIN_COOKIE,
                sameSite: false,
                secure: process.env.NODE_ENV == "production",
                path: "/"
            });
            return res.status(401).json({
                success: false,
                loginNeeded: true,
                message: req.__("login_again_to_access") // Translate message
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.getTenants = async (req, res) => {
    try {
        const { page, perPage, search, status, type, from, to } = req.query;

        // if (!type) {
        //     return res.status(400).json({
        //       success: false,
        //       message: req.__("please_provide_required_details") // Translate message
        //     });
        //   }

        if (type == "custom") {
            if (!(from && to)) {
                return res.status(400).json({
                    success: false,
                    message: req.__("provide_from_to_dates") // Translate message
                });
            }
        }

        const result = await getTenantsDB(page, perPage, search, status, type, from, to);

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
}

exports.getSuperAdminTenantsCntData = async (req, res) => {
    try {

        const [activeTenants, inactiveTenants, allTenants] = await Promise.all([
            getActiveTenantsDB(),
            getInActiveTenantsDB(),
            getAllTenantsDB(),
        ]);

        return res.status(200).json({
            activeTenants, inactiveTenants, allTenants
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
}

exports.getSuperAdminDashboardData = async (req, res) => {
    try {

        const [activeTenants, ordersProcessedToday, salesVolumeToday, mrr, arr] = await Promise.all([
            getActiveTenantsDB(),
            getOrdersProcessedTodayDB(),
            getSalesVolumeTodayDB(),
            getMRRValueDB(),
            getARRValueDB()
        ]);

        return res.status(200).json({
            activeTenants, ordersProcessedToday, salesVolumeToday, mrr, arr
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.addTenant = async (req, res) => {
    try {
        const { name, email, password, isActive } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: req.__("please_provide_required_details") // Translate message
            });
        }

        const isAdmin = 1;

        const tenantData = await addTenantDB({ name, email, password, isAdmin, isActive });

        return res.status(200).json({ message: req.__("tenant_added_successfully"), tenant: tenantData }); // Translate message
    } catch (error) {
        console.error("Error adding tenant:", error);

        if (error == "User already exist! Try Different Email!") {
            return res.status(409).json({ message: req.__("user_already_exist_try_different_email") }); // Translate message
        }

        return res.status(500).json({ message: req.__("error_adding_tenant") }); // Translate message
    }
};


exports.updateTenant = async (req, res) => {
    try {
        const tenantId = req.params.id;
        const { name, email, isActive } = req.body;

        if(!tenantId){
            return res.status(400).json({ message: req.__("invalid_tenant") }); // Translate message
        }
        if (!name || !email || isActive === undefined) {
            return res.status(400).json({ message: req.__("missing_required_fields") }); // Translate message
        }

        const tenantCnt = await getTenantCntByIdDB(tenantId);

        if (tenantCnt != 1) {
            return res.status(404).json({ message: req.__("tenant_not_found") }); // Translate message
        }

        const currentTenant = await getTenantDetailsByIdDB(tenantId);

        if(currentTenant.username !== email){
            // check if email exists
            const isEmailExists = await checkEmailExistsSuperadminDB(email, tenantId);

            if(isEmailExists) {
                return res.status(400).json({
                    success: false,
                    message: req.__("account_exists_try_login") // Translate message
                });
            }
        }

        await updateTenantDB(tenantId, name, email, isActive, currentTenant.username);

        if (currentTenant.username !== email || (isActive == 0 && currentTenant.is_active == 1)) {
            await logoutAllUsersOfTenantDB(tenantId);
        }

        return res.status(200).json({ message: req.__("tenant_updated_successfully") }); // Translate message
    } catch (error) {
        console.error('Error updating tenant:', error);
        return res.status(500).json({ message: req.__("error_updating_tenant") }); // Translate message
    }
};

exports.deleteTenant= async (req , res) => {
    try {
        const tenantId = req.params.id;

        if(!tenantId){
            return res.status(400).json({ message: req.__("invalid_tenant") }); // Translate message
        }

        const tenantCnt = await getTenantCntByIdDB(tenantId);

        if (tenantCnt != 1) {
            return res.status(404).json({ message: req.__("tenant_not_found") }); // Translate message
        }

        await deleteTenantDB(tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("tenant_deleted_successfully") // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
}

exports.getTenantsDataByStatus = async (req, res) => {
    try {
        const status = req.params.status;

        if(status != 'active' && status != 'inactive' && status != 'all'){
            return res.status(400).json({
                success: false,
                message: req.__("invalid_status_try_again_later") // Translate message
            });
        }

        let data;

        if(status == 'active'){
            data = await getTenantsDataByStatusDB(1);
        }else if(status == 'inactive'){
            data = await getTenantsDataByStatusDB(0);
        }else if(status == 'all'){
            data = await getTenantsDataByStatusDB(null);

        }

        return res.status(200).json(data);
        } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
}

exports.getTenantSubscriptionHistory = async (req, res) => {
    try {
        const tenantId = req.params.id;

        const subscriptionHistory = await getTenantSubscriptionHistoryDB(tenantId);

        // tenant info
        const tenantDetails = await getTenantDetailsDB(tenantId);

        // store details
        const storeDetails = await getTenantStoreDetailsDB(tenantId);

        // tenant users
        const tenantTotalUsers = await getTenantTotalUsersDB(tenantId);

        return res.status(200).json({
            tenantInfo: tenantDetails,
            storeDetails: storeDetails,
            totalUsers: tenantTotalUsers,
            subscriptionHistory: subscriptionHistory
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
}

exports.getSuperAdminReportsData = async (req, res) => {
    try {
        const from = req.query.from || null;
        const to = req.query.to || null;
        const type = req.query.type;

        if(!type) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details") // Translate message
            });
        }

        if(type == 'custom') {
            if(!(from && to)) {
                return res.status(400).json({
                    success: false,
                    message: req.__("provide_from_to_dates") // Translate message
                });
            }
        }

        const [activeTenants, mrr, arr, totalCustomers, topSellingItems, salesVolume, ordersProcessed] = await Promise.all([
            getActiveTenantsDB(),
            getMRRValueDB(),
            getARRValueDB(),
            getRestaurantsTotalCustomersDB(),
            getSuperAdminTopSellingItemsDB(type, from, to),
            getSuperAdminSalesVolumeDB(type, from, to),
            getSuperAdminOrdersProcessedDB(type, from, to)
        ]);

        return res.status(200).json({
            activeTenants, mrr, arr, totalCustomers, topSellingItems,
            salesVolume, ordersProcessed
        });
        } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
