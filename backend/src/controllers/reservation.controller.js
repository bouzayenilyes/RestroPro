const { nanoid } = require("nanoid");
const { addReservationDB, updateReservationDB, cancelReservationDB, deleteReservationDB, searchReservationsDB, getReservationsDB } = require("../services/reservation.service");
const { getStoreTablesDB } = require("../services/settings.service")

exports.initReservation = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const [storeTables] = await Promise.all([
            getStoreTablesDB(tenantId)
        ]);

        return res.status(200).json({
            storeTables
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.addReservation = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        
        const customerId = req.body.customerId;
        const date = req.body.date;
        const tableId = req.body.tableId;
        const status = req.body.status;
        const notes = req.body.notes;
        const peopleCount = req.body.peopleCount;
        
        if(!(customerId && date && peopleCount)) {
            return res.status(400).json({
                success: false,
                message: req.__("reservation_provide_required_details") // Translate message
            });
        }

        const uniqueCode = nanoid(10);

        const reservationId = await addReservationDB(customerId, date, tableId, status, notes, peopleCount, uniqueCode, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("reservation_done"), // Translate message
            reservationId,
            uniqueCode
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const reservationId = req.params.id;
        const date = req.body.date;
        const tableId = req.body.tableId;
        const status = req.body.status;
        const notes = req.body.notes;
        const peopleCount = req.body.peopleCount;
        
        await updateReservationDB(reservationId, date, tableId, status, notes, peopleCount, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("reservation_details_updated"), // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.cancelReservation = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const reservationId = req.params.id;
        await cancelReservationDB(reservationId, "CANCELLED", tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("reservation_cancelled"), // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const reservationId = req.params.id;
        await deleteReservationDB(reservationId, tenantId);

        return res.status(200).json({
            success: true,
            message: req.__("reservation_deleted"), // Translate message
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};

exports.searchReservation = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const searchString = req.query.q;

        if(!searchString) {
            return res.status(400).json({
                success: false,
                message: req.__("please_provide_required_details") // Translate message
            });
        }

        const result = await searchReservationsDB(searchString, tenantId);

        if(result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({
                success: false,
                message: req.__("no_results_found") // Translate message
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

exports.getReservations = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

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

        const result = await getReservationsDB(type, from, to, tenantId);

        if(result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: req.__("something_went_wrong_try_later") // Translate message
        });
    }
};