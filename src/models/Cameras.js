const { getConnection, releaseConnection } = require('../db');

module.exports = {
  getCameraStatus: function () {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select *
             from PeripheralDevice.cameras
             where state = 1
             limit 1`
          );
        })
        .then((result) => {
          if (result && result.length !== 0) {
            result = result[0];
          } else {
            result = {};
          }
          resolve(result);
          releaseConnection(con);
        })
        .catch((error) => {
          reject(error);
          releaseConnection(con);
        });
    });
  },
  getCameraByUsageID: function (usageID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select *
             from PeripheralDevice.cameras
             where usage_id = ?
             limit 1`,
            [usageID]
          );
        })
        .then((result) => {
          if (result && result.length !== 0) {
            result = result[0];
          } else {
            result = {};
          }
          resolve(result);
          releaseConnection(con);
        })
        .catch((error) => {
          reject(error);
          releaseConnection(con);
        });
    });
  },
  getAllCamera: function () {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select *
             from PeripheralDevice.cameras
             where usage_id is not null`
          );
        })
        .then((result) => {
          resolve(result);
          releaseConnection(con);
        })
        .catch((error) => {
          reject(error);
          if (con) {
            releaseConnection(con);
          }
        });
    });
  },
};
