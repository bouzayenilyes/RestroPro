const { doCustomerExistDB, addCustomerDB, getCustomersDB, updateCustomerDB, deleteCustomerDB, getCustomerDB, searchCustomerDB, getAllCustomersDB, uploadBulkCustomersDB } = require("../services/customer.service");

exports.addCustomer = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const phone = req.body.phone;
        const name = req.body.name;
        const email = req.body.email;
        const birthDate = req.body.birthDate;
        const gender = req.body.gender;
        const isMember = req.body.isMember;

        if(!(phone && name)) {
            return res.status(400).json({
                success: false,
                message: req.__("customer_provide_required_details") // Translate message
            });
        }

        const doCustomerExist = await doCustomerExistDB(phone, tenantId);

        if(doCustomerExist) {
            return res.status(400).json({
                success: false,
                message: req.__("customer_already_exists", { phone }) // Translate message
            });
        }

        await addCustomerDB(phone, name, email, birthDate, gender, isMember, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("customer_added", { phone }) // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const { page, perPage, sort, filter } = req.query;

        const result = await getCustomersDB(page, perPage, sort, filter, tenantId);

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const result = await getAllCustomersDB(tenantId);

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.uploadBulkCustomers = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const customers = req.body.customers;

        if(customers?.length == 0) {
            return res.status(400).json({
                success: false, 
                message: req.__("empty_file_provided") // Translate message
            });
        }

        const formattedResult = customers.map((item, i)=>{
            const phone = item[0]
            const name = item[1]
            const email = item[2] || null
            const birth_date = item[3] || null
            const gender = item[4] || null

            if(gender) {
                const g = new String(gender).toLowerCase();
                if(g != "male" && g != "female") {
                    throw new Error(req.__("invalid_gender_value", { row: i+1, phone })) // Translate message
                }
            }

            return [phone, name, email, birth_date, gender, tenantId];
        })

        await uploadBulkCustomersDB(formattedResult);

        return res.status(200).json({
            success: true,
            message: req.__("customers_uploaded_successfully") // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || req.__("something_went_wrong_try_later"), // Translate message
        });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const phone = req.params.id;
        const name = req.body.name;
        const email = req.body.email;
        const birthDate = req.body.birthDate;
        const gender = req.body.gender;

        if(!(phone && name)) {
            return res.status(400).json({
                success: false,
                message: req.__("customer_provide_required_details") // Translate message
            });
        }

        await updateCustomerDB(phone, name, email, birthDate, gender, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("customer_details_updated", { phone }) // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};


exports.deleteCustomer = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const phone = req.params.id;

        await deleteCustomerDB(phone, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("customer_deleted", { phone }) // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.getCustomer = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const phone = req.params.id;

        const result = await getCustomerDB(phone, tenantId);

        if(result) {
            return res.status(200).json(result);
        }
        return res.status(404).json({
            success: false,
            message: req.__("no_customer_found", { phone }) // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.searchCustomer = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const searchString = req.query.q;

        const result = await searchCustomerDB(searchString, tenantId);

        if(result.length > 0) {
            return res.status(200).json(result);
        }
        return res.status(404).json({
            success: false,
            message: req.__("no_customers_found") // Translate message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};