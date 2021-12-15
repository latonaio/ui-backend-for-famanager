const { getConnection, releaseConnection } = require('../db');

module.exports = {
  get: function (deviceID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select *
                          from ServiceBroker.devices
                          where device_id = ?
                          limit 1`,
            deviceID
          );
        })
        .then((vehicle) => {
          if (vehicle === null || vehicle.length < 1) {
            throw new Error('Device not found.');
          }
          return vehicle;
        })
        .then((result) => {
          releaseConnection(con);
          return resolve(result);
        })
        .catch((error) => {
          if (con) {
            releaseConnection(con);
          }
          console.log(error);
          return reject(error);
        });
    });
  },
};
