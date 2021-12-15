const { getConnection, releaseConnection } = require('../db');

module.exports = {
  get: function (vehicle_id) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select w.work_id,
                                 w.vehicle_id,
                                 w.name,
                                 w.position_threshold_level,
                                 w.probability_threshold_level,
                                 w.last_updated
                          from FAManager.works w
                          where vehicle_id = ?`,
            vehicle_id
          );
        })
        .then((work) => {
          if (work === null || work.length < 1) {
            throw new Error('Work not found.');
          }
          return work;
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
  updateThresholdWithVehicle: function (
    vehicle_id,
    position_threshold_level,
    probability_threshold_level
  ) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `update FAManager.works
                                set 
                                    position_threshold_level = ${position_threshold_level}, 
                                    probability_threshold_level = ${probability_threshold_level}
                                where 
                                    vehicle_id = ?`,
            vehicle_id
          );
        })
        .then((result) => {
          if (result == null || result.length < 1) {
            throw new Error('Not update vehicle_id: ' + vehicle_id);
          }
          releaseConnection(con);
          resolve(true);
        })
        .catch((error) => {
          console.log(error);
          if (con) {
            con.rollback();
            releaseConnection(con);
          }
          reject(error);
        });
    });
  },
  getWorkByWorkId: function (work_id) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select *
                          from FAManager.works
                          where work_id = ?`,
            work_id
          );
        })
        .then((name) => {
          if (name == null || name.length < 1) {
            throw new Error('Not found work name: ' + work_id);
          }
          return name;
        })
        .then((ret) => {
          releaseConnection(con);
          resolve(ret);
        })
        .catch((reason) => {
          if (con) {
            releaseConnection(con);
          }
          console.log(reason);
          reject(reason);
        });
    });
  },
  updateLastUpdated: function (workID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          con.query(
            `update FAManager.works
                     set last_updated = current_timestamp
                     where vehicle_id = ?`,
            workID
          );
        })
        .then(() => {
          releaseConnection(con);
          resolve();
        })
        .catch((reason) => {
          if (con) {
            releaseConnection(con);
          }
          console.log(reason);
          reject(reason);
        });
    });
  },
};
