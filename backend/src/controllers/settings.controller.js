const { nanoid } = require("nanoid");
const { getStoreSettingDB, setStoreSettingDB, uploadStoreImageDB, deleteStoreImageDB, getPrintSettingDB, setPrintSettingDB, getTaxesDB, addTaxDB, updateTaxDB, deleteTaxDB, getTaxDB, addPaymentTypeDB, getPaymentTypesDB, updatePaymentTypeDB, deletePaymentTypeDB, togglePaymentTypeDB, addStoreTableDB, getStoreTablesDB, updateStoreTableDB, deleteStoreTableDB, addCategoryDB, getCategoriesDB, updateCategoryDB, deleteCategoryDB, getQRMenuCodeDB, updateQRMenuCodeDB, changeCategoryVisibiltyDB, updateServiceChargeDB, getServiceChargeDB } = require("../services/settings.service");
const path = require("path");
const fs = require("fs");

exports.getStoreDetails = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const result = await getStoreSettingDB(tenantId);

        const storeSettings = {
            storeImage : result?.store_image || null,
            storeName: result?.store_name || null,
            address: result?.address || null,
            phone: result?.phone || null,
            email: result?.email || null,
            currency: result?.currency || null,
            image: result?.image || null,
            isQRMenuEnabled: result?.is_qr_menu_enabled || false,
            isQROrderEnabled: result?.is_qr_order_enabled || false,
            uniqueQRCode: result?.unique_qr_code || null,
            isFeedbackEnabled: result?.is_feedback_enabled || false,
            uniqueId:result?.unique_id || null,
        };

        return res.status(200).json(storeSettings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.setStoreDetails = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const storeName = req.body.storeName;
        const address = req.body.address;
        const phone = req.body.phone;
        const email = req.body.email;
        const currency = req.body.currency;
        const isQRMenuEnabled = req.body.isQRMenuEnabled;
        const isQROrderEnabled = req.body.isQROrderEnabled;
        const isFeedbackEnabled = req.body.isFeedbackEnabled;

        const uniqueQRCode = nanoid();

        const qrCodeExists = await getQRMenuCodeDB(tenantId);
        if(qrCodeExists) {
            await setStoreSettingDB(storeName, address, phone, email, currency, isQRMenuEnabled,isQROrderEnabled , uniqueQRCode, isFeedbackEnabled, tenantId);
        } else {
            await updateQRMenuCodeDB(uniqueQRCode, tenantId);
            await setStoreSettingDB(storeName, address, phone, email, currency, isQRMenuEnabled, isQROrderEnabled, uniqueQRCode, isFeedbackEnabled, tenantId);
        }

        return res.status(200).json({
            success: true,
            message: req.__("details_saved_successfully")
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.uploadStoreImage = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const file = req.files.store_image;

        const uniqueId = nanoid();

        const imagePath = path.join(__dirname, `../../public/${tenantId}/`) + uniqueId;

        if(!fs.existsSync(path.join(__dirname, `../../public/${tenantId}/`))) {
            fs.mkdirSync(path.join(__dirname, `../../public/${tenantId}/`));
        }

        const imageURL = `/public/${tenantId}/${uniqueId}`;

        await file.mv(imagePath);
        await uploadStoreImageDB(imageURL, uniqueId, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("store_image_uploaded"),
            imageURL: imageURL
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.deleteStoreImage = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const uniqueId = req.body.uniqueId;

        if(!uniqueId){
            return res.status(200).json({
                success: false,
                message: req.__("invalid_request"),
            })
        }

        const imagePath = path.join(__dirname, `../../public/${tenantId}/`) + uniqueId;

        fs.unlinkSync(imagePath)

        await deleteStoreImageDB(null, uniqueId, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("store_image_removed"),
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.updateServiceCharge = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const serviceCharge = req.body.serviceCharge;

        if(!(serviceCharge)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_service_charge")
            });
        }

        if(serviceCharge < 0 || serviceCharge > 100) {
            return res.status(400).json({
                success: false,
                message: req.__("invalid_service_charge")
            });
        }

        await updateServiceChargeDB(serviceCharge, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("service_charge_updated")
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.getServiceCharge = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const serviceCharge = await getServiceChargeDB(tenantId);

        return res.status(200).json(serviceCharge);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.getPrintSettings = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const result = await getPrintSettingDB(tenantId);

        const printSettings = {
            pageFormat: result?.page_format || null,
            header: result?.header || null,
            footer: result?.footer || null,
            showNotes: result?.show_notes || null,
            isEnablePrint: result?.is_enable_print || null,
            showStoreDetails: result?.show_store_details || null,
            showCustomerDetails: result?.show_customer_details || null,
            printToken: result?.print_token || null
        };

        return res.status(200).json(printSettings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.setPrintSettings = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const pageFormat = req.body.pageFormat;
        const header = req.body.header;
        const footer = req.body.footer;
        const showNotes = req.body.showNotes;
        const isEnablePrint = req.body.isEnablePrint;
        const showStoreDetails = req.body.showStoreDetails;
        const showCustomerDetails = req.body.showCustomerDetails;
        const printToken = req.body.printToken;

        await setPrintSettingDB(pageFormat, header, footer, showNotes, isEnablePrint, showStoreDetails, showCustomerDetails, printToken, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("details_saved_successfully")
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.getAllTaxes = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const result = await getTaxesDB(tenantId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.getTax = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const taxId = req.params.id;
        const result = await getTaxDB(taxId, tenantId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.addTax = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const title = req.body.title;
        const taxRate = req.body.rate;
        const type = req.body.type;

        if(!(title && taxRate && type)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details")
            });
        }

        const taxId = await addTaxDB(title, taxRate, type, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("tax_details_added"),
            taxId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.updateTax = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const taxId = req.params.id;
        const title = req.body.title;
        const taxRate = req.body.rate;
        const type = req.body.type;

        if(!(title && taxRate && type)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details")
            });
        }

        await updateTaxDB(taxId, title, taxRate, type, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("tax_details_updated"),
            taxId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.deletTax = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const taxId = req.params.id;

        await deleteTaxDB(taxId, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("tax_detail_removed"),
            taxId
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};


exports.addPaymentType = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const title = req.body.title;
        const isActive = req.body.isActive;
        const icon = req.body.icon;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details")
            });
        }

        const id = await addPaymentTypeDB(title, isActive, tenantId, icon);
        return res.status(200).json({
            success: true,
            message: req.__("payment_type_added"),
            id
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.getAllPaymentTypes = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const result = await getPaymentTypesDB(false, tenantId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.updatePaymentType = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;
        const title = req.body.title;
        const isActive = req.body.isActive;
        const icon = req.body.icon;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details")
            });
        }

        await updatePaymentTypeDB(id, title, isActive, tenantId, icon);
        return res.status(200).json({
            success: true,
            message: req.__("payment_type_updated"),
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.togglePaymentType = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;
        const isActive = req.body.isActive;

        await togglePaymentTypeDB(id, isActive, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("payment_type_status_updated"),
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.deletePaymentType = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;

        await deletePaymentTypeDB(id, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("payment_type_deleted"),
            id
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.addStoreTable = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const title = req.body.title;
        const floor = req.body.floor;
        const seatingCapacity = req.body.seatingCapacity;

        if(!(title && floor && seatingCapacity)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details")
            });
        }

        if(seatingCapacity < 0) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_valid_seating_capacity_count")
            });
        }

        const id = await addStoreTableDB(title, floor, seatingCapacity, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("store_table_added"),
            id
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.getAllStoreTables = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const result = await getStoreTablesDB(tenantId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.updateStoreTable = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;
        const title = req.body.title;
        const floor = req.body.floor;
        const seatingCapacity = req.body.seatingCapacity;

        if(!(title && floor && seatingCapacity)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details")
            });
        }

        await updateStoreTableDB(id, title, floor, seatingCapacity, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("store_table_details_updated"),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.deleteStoreTable = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;

        await deleteStoreTableDB(id, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("store_table_details_deleted"),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};


exports.addCategory = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const title = req.body.title;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details")
            });
        }

        const id = await addCategoryDB(title, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("category_added"),
            id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const result = await getCategoriesDB(tenantId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;
        const title = req.body.title;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details")
            });
        }

        await updateCategoryDB(id, title, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("category_updated"),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;

        await deleteCategoryDB(id, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("category_deleted"),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};

exports.changeCategoryVisibilty = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const id = req.params.id;
        const isEnabled = req.body.isEnabled;

        await changeCategoryVisibiltyDB(id, isEnabled, tenantId);
        return res.status(200).json({
            success: true,
            message: req.__("category_visibility_updated"),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later")
        });
    }
};
