const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.getOverallFeedbackSummaryDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT 
            COUNT(CASE WHEN average_rating BETWEEN 4.5 AND 5 THEN 1 END) AS loved,
            COUNT(CASE WHEN average_rating BETWEEN 3.5 AND 4.4 THEN 1 END) AS good,
            COUNT(CASE WHEN average_rating BETWEEN 2.5 AND 3.4 THEN 1 END) AS average,
            COUNT(CASE WHEN average_rating BETWEEN 1.5 AND 2.4 THEN 1 END) AS bad,
            COUNT(CASE WHEN average_rating BETWEEN 1 AND 1.4 THEN 1 END) AS worst
        FROM feedbacks
        WHERE tenant_id = ?;
        `;

        const [results] = await conn.query(sql, [tenantId]);
        return results[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
      conn.release();
  }
}

exports.getOverallFeedbackSummaryByQuestionDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT 
            avg(food_quality_rating) as food_quality_rating,
            avg(service_rating) as service_rating,
            avg(staff_behavior_rating) as staff_behavior_rating,
            avg(ambiance_rating) as ambiance_rating,
            avg(recommend_rating) as recommend_rating,
            avg(average_rating) as average_rating
        FROM feedbacks
        WHERE tenant_id = ?;
        `;

        const [results] = await conn.query(sql, [tenantId]);
        return results[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
      conn.release();
  }
}

exports.getFeedbacksDB = async (type, from, to, tenantId) => {
  const conn = await getMySqlPromiseConnection();
    try {

        const {filter, params} = getFilterConditionForInvoices(type, from, to, tenantId)

        const sql = `
        SELECT
            id,
            invoice_id,
            DATE(date) AS date,
            f.phone,
            c.name,
            average_rating,
            food_quality_rating,
            service_rating,
            staff_behavior_rating,
            ambiance_rating,
            recommend_rating,
            remarks
        FROM
            feedbacks f
            LEFT JOIN customers c ON f.phone = c.phone
            AND f.tenant_id = c.tenant_id
        WHERE
            ${filter}
        ORDER BY
            f.date DESC;
        `;

        const [results] = await conn.query(sql, params);
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
      conn.release();
  }
};

exports.searchFeedbacksDB = async (search, tenantId) => {
    const conn = await getMySqlPromiseConnection();
      try {  
          const sql = `
          SELECT
              id,
              invoice_id,
              DATE(date) AS date,
              f.phone,
              c.name,
              average_rating,
              food_quality_rating,
              service_rating,
              staff_behavior_rating,
              ambiance_rating,
              recommend_rating,
              remarks
          FROM
              feedbacks f
              LEFT JOIN customers c ON f.phone = c.phone
              AND f.tenant_id = c.tenant_id
          WHERE
              (f.invoice_id = ? OR f.phone LIKE ? OR c.\`name\` LIKE ?)
              AND f.tenant_id = ?
          ORDER BY
              f.date DESC;
          `;
  
          const [results] = await conn.query(sql, [search, search, `%${search}%`, tenantId]);
          return results;
      } catch (error) {
          console.error(error);
          throw error;
      } finally {
        conn.release();
    }
};

const getFilterConditionForInvoices = (type, from, to, tenantId) => {
    const params = [];
    let filter = '';

    switch (type) {
        case 'custom': {
            params.push(from, to, tenantId);
            filter = `DATE(f.date) >= ? AND DATE(f.date) <= ? AND f.tenant_id = ?`;
            break;
        }
        case 'today': {
            params.push(tenantId);
            filter = `DATE(f.date) = CURDATE() AND f.tenant_id = ?`;
            break;
        }
        case 'this_month': {
          params.push(tenantId);
            filter = `YEAR(f.date) = YEAR(NOW()) AND MONTH(f.date) = MONTH(NOW()) AND f.tenant_id = ?`;
            break;
        }
        case 'last_month': {
          params.push(tenantId);
            filter = `DATE(f.date) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND DATE(f.date) <= CURDATE() AND f.tenant_id = ?`;
            break;
        }
        case 'last_7days': {
          params.push(tenantId);
            filter = `DATE(f.date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND DATE(f.date) <= CURDATE() AND f.tenant_id = ?`;
            break;
        }
        case 'yesterday': {
          params.push(tenantId);
            filter = `DATE(f.date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND f.tenant_id = ?`;
            break;
        }
        case 'tomorrow': {
          params.push(tenantId);
            filter = `DATE(f.date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND f.tenant_id = ?`;
            break;
        }
        default: {
          params.push(tenantId);
            filter = 'f.tenant_id = ?';
        }
    }

    return { params, filter };
}