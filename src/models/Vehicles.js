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
            `select *
                          from FAManager.vehicles
                          where vehicle_id = ?
                          limit 1`,
            vehicle_id
          );
        })
        .then((vehicle) => {
          if (vehicle === null || vehicle.length < 1) {
            throw new Error('Vehicle not found.');
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
  getByWorkID: function (workID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select v.vehicle_id, v.name, v.no, v.device_id
                            from FAManager.vehicles v
                                     join FAManager.works w on v.vehicle_id = w.vehicle_id
                            where w.work_id = ?
                            limit 1`,
            workID
          );
        })
        .then((vehicle) => {
          if (vehicle === null || vehicle.length < 1) {
            throw new Error('Vehicle not found.');
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
  getAll: function () {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`
            select v.vehicle_id,
                   v.name,
                   v.no,
                   c.usage_id
            from FAManager.vehicles v
                     join PeripheralDevice.cameras c
                          on v.vehicle_id = c.usage_id`);
        })
        .then((vehicles) => {
          if (vehicles === null || vehicles.length < 1) {
            throw new Error('Vehicles not found.');
          }
          return vehicles;
        })
        .then((result) => {
          releaseConnection(con);
          return resolve(result);
        })
        .catch((error) => {
          if (con) {
            releaseConnection(con);
          }
          return reject(error);
        });
    });
  },
  fetchTemplatesByVehicleID: function (vehicleID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select v.vehicle_id,
                                 v.name,
                                 v.no,
                                 w.work_id,
                                 w.probability_threshold_level,
                                 w.position_threshold_level,
                                 i.image_id,
                                 i.image_path,
                                 p.point_id,
                                 p.point_left,
                                 p.point_top,
                                 p.point_right,
                                 p.point_bottom,
                                 i.time_stamp
                          from FAManager.vehicles v
                                   join FAManager.works w on v.vehicle_id = w.vehicle_id
                                   join FAManager.images i on w.work_id = i.work_id
                                   left join (select work_id, MAX(time_stamp) latest
                                              from FAManager.images
                                              group by work_id) mi
                                             on w.work_id = mi.work_id
                                   left join FAManager.points p on i.image_id = p.image_id
                          where v.vehicle_id = ?
                            and mi.latest = i.time_stamp
                          order by v.vehicle_id, w.work_id, i.image_id, p.point_id`,
            vehicleID
          );
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
  fetchVehicleByVehicleID: function (deviceID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() =>
          con.query(
            `select *
                   from FAManager.vehicles v
                   where v.device_id = ?`,
            deviceID
          )
        )
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
