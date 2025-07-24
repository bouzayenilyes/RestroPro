const { CONFIG } = require("../config");
const { ROLES, SCOPES } = require("../config/user.config");
const { getAllUsersDB, doUserExistDB, addUserDB, deleteUserDB, deleteUserRefreshTokensDB, updateUserDB, updateUserPasswordDB } = require("../services/user.service");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const result = await getAllUsersDB(tenantId);

        if(result?.length == 0) {
            return res.status(404).json({
                success: false,
                message: req.__("no_users_found") // Translate message
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
}

exports.getAllScopes = async (req, res) => {
    try {
        const scopes = Object.values(SCOPES);

        return res.status(200).json(scopes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
}

exports.addUser = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const username = req.body.username;
        const password = req.body.password;
        const name = req.body.name;
        // const role = req.body.role;
        const role = ROLES.USER;
        const designation = req.body.designation;
        const phone = req.body.phone;
        const email = req.body.email;
        const userScopes = req.body.userScopes;

        if(!(username && password && name && role)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details") // Translate message
            });
        }

        if(!Object.values(ROLES).includes(role)) {
            console.error("User provided invalid role!");
            return res.status(400).json({
                success: false,
                message: req.__("invalid_request") // Translate message
            });
        }

        // check scopes
        const allScopes = Object.values(SCOPES);
        if(!userScopes.every(s=>allScopes.includes(s))) {
            console.error("User provided invalid scope!");
            return res.status(400).json({
                success: false,
                message: req.__("invalid_request") // Translate message
            });
        }

        // 1. find if user exist
        const userExist = await doUserExistDB(username);
        if(userExist) {
            return res.status(400).json({
                success: false,
                message: req.__("user_already_exist_try_different_username") // Translate message
            });
        }

        // 2. generate encrypted password
        const encryptedPassword = await bcrypt.hash(password, CONFIG.PASSWORD_SALT);

        // 3. create user
        await addUserDB(tenantId, username, encryptedPassword, name, role, null, designation, phone, email, userScopes.join(","));

        return res.status(200).json({
            success: true,
            message: req.__("user_added_successfully") // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const username = req.params.id;

        const user = req.user;

        if(user.username == username) {
            return res.status(400).json({
                success: false,
                message: req.__("operation_not_allowed") // Translate message
            });
        }

        await deleteUserDB(username, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("user_deleted_successfully") // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const username = req.params.id;
        const name = req.body.name;
        const designation = req.body.designation;
        const phone = req.body.phone;
        const email = req.body.email;
        const userScopes = req.body.userScopes || [];

        if(!(username && name)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details") // Translate message
            });
        }

        if(username == req.user.username) {
            return res.status(400).json({
                success: false,
                message: req.__("operation_not_allowed") // Translate message
            });
        }

        // check scopes
        const allScopes = Object.values(SCOPES);
        if(!userScopes.every(s=>allScopes.includes(s))) {
            console.error("User provided invalid scope!");
            return res.status(400).json({
                success: false,
                message: req.__("invalid_request") // Translate message
            });
        }

        await deleteUserRefreshTokensDB(username, tenantId);
        await updateUserDB(username, name, null, designation, phone, email, userScopes.join(","), tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("user_details_updated") // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};


exports.updateUserPassword = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const username = req.params.id;
        const password = req.body.password;

        if(!(username && password)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details") // Translate message
            });
        }

        if(username == req.user.username) {
            return res.status(400).json({
                success: false,
                message: req.__("operation_not_allowed") // Translate message
            });
        }

        const encryptedPassword = await bcrypt.hash(password, CONFIG.PASSWORD_SALT);

        await deleteUserRefreshTokensDB(username, tenantId);
        await updateUserPasswordDB(username, encryptedPassword, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("user_password_updated") // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};
