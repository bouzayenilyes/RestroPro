const { CONFIG } = require("./index")

const mySqlPromise = require("mysql2/promise");

const pool = 
mySqlPromise.createPool(`${CONFIG.DATABASE_URL}?ssl={"rejectUnauthorized":false}&multipleStatements=true&dateStrings=false&waitForConnections=true&connectionLimit=99&enableKeepAlive=true&keepAliveInitialDelay=10000`);

console.log(`DB Pool Created.`);

exports.getMySqlPromiseConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error("Pool Connection Error: =======>");
    console.error(error);
    throw error;
  }
};
