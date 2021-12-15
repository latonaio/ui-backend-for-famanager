const { getConnection, releaseConnection } = require('../db');
const table = 'images';
const path = require('path');
const util = require('util');

const directoryConstants = require('../constants/directory.constants');
module.exports = {
  get: function (imageId, absolutePath) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`select * from ${table} where image_id = ? limit 1`, imageId);
        })
        .then((images) => {
          if (images === null || images.length < 1) {
            throw new Error('Image not found.');
          }
          return images;
        })
        .then((images) => {
          for (let i = 0; i < images.length; i++) {
            if (!absolutePath && images[i].image_path !== null) {
              images[i].image_path = images[i].image_path.replace(directoryConstants.publicDir, '');
            }
          }
          return images;
        })
        .then((result) => {
          releaseConnection(con);
          resolve(result);
        })
        .catch((error) => {
          con.rollback();
          releaseConnection(con);
          console.log(error);
          reject(error);
        });
    });
  },
  getLatest: function () {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`select * from ${table} order by image_id desc limit 1`);
        })
        .then((result) => {
          releaseConnection(con);
          resolve(result);
        })
        .catch((error) => {
          con.rollback();
          releaseConnection(con);
          console.log(error);
          reject(error);
        });
    });
  },
  register: function (imagePath, workID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`insert into FAManager.images (work_id, image_path) value (?, ?)`, [
            workID,
            imagePath,
          ]);
        })
        .then((result) => {
          releaseConnection(con);
          resolve(result);
        })
        .catch((error) => {
          if (con) {
            con.rollback();
            releaseConnection(con);
          }
          console.log(error);
          reject(error);
        });
    });
  },
  getImageByCaptureToken: function (captureToken) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select *
            from ${table}
            where capture_token = ?
            order by image_id desc
            limit 1`,
            captureToken
          );
        })
        .then((images) => {
          if (images.length > 0 && images[0].image_path !== null) {
            images[0].image_path = images[0].image_path.replace(directoryConstants.publicDir, '');
            const fileTimeStamp = images[0].image_path.split('/').slice(-1)[0].split('.')[0];
            images[0].file_time_stamp = util.format(
              '%s-%s-%s %s:%s:%s.%s',
              fileTimeStamp.substring(0, 4),
              fileTimeStamp.substring(4, 6),
              fileTimeStamp.substring(6, 8),
              fileTimeStamp.substring(8, 10),
              fileTimeStamp.substring(10, 12),
              fileTimeStamp.substring(12, 14),
              fileTimeStamp.substring(14, 17)
            );
          }
          return images;
        })
        .then((result) => {
          releaseConnection(con);
          resolve(result);
        })
        .catch((error) => {
          con.rollback();
          releaseConnection(con);
          console.log(error);
          reject(error);
        });
    });
  },
  getImageByWorkId: function (usageID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select *
                            from images i
                                     JOIN works w using (work_id)
                            where w.work_id = ?
                            order by i.time_stamp desc
                            limit 1`,
            usageID
          );
        })
        .then((images) => {
          if (images.length < 1 || images[0].image_path == null) {
            resolve({});
          } else {
            const image = {
              ...images[0],
              image_path_from_public: path.relative(
                directoryConstants.publicDir,
                images[0].image_path
              ),
            };
            resolve(image);
          }
          releaseConnection(con);
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
  getThresholds: function (usageID) {
    return new Promise((resolve, reject) => {
      let con;
      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(
            `select pass.pass_threshold  pass_threshold,
                      pos.trim_image_ratio pos_threshold
               from works w
                        join master_pass pass on w.probability_threshold_level = pass.master_pass_id
                        join master_pos pos on w.position_threshold_level = pos.master_pos_id
               where w.work_id = ?`,
            usageID
          );
        })
        .then((threshold) => {
          if (threshold.length < 1) {
            resolve({
              pass_threshold: 0.8,
              pos_threshold: 0.5,
            });
          } else {
            resolve(threshold[0]);
          }
          releaseConnection(con);
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
