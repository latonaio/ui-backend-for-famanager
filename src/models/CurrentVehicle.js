const { getConnection, releaseConnection } = require('../db');
const table = 'current_vehicles';

module.exports = {
  get: function () {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`SELECT * FROM ${table} 
                                ORDER BY setting_timestamp DESC
                                LIMIT 1`);
        })
        .then((data) => {
          if (data === null || data.length < 1) {
            throw new Error('Current vehicle not found.');
          }
          releaseConnection(con);
          resolve(data[0]);
        })
        .catch((error) => {
          if (con) {
            releaseConnection(con);
          }
          console.log(error);
          reject(error);
        });
    });
  },
};
