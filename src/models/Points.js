const { getConnection, releaseConnection } = require('../db');
const table = 'points';
const express = require('express');
const app = express();
const imageSize = require('image-size');
const Jimp = require('jimp');
const fs = require('fs');
const dateFormat = require('dateformat');

const directoryConstants = require('../constants/directory.constants');

const appConfig = require('../../config/app.json')[app.get('env')];
const MAX_POINT_COUNT = 5;

module.exports = {
  get: function (pointId, absolutePath) {
    return new Promise((resolve, reject) => {
      let con;

      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`select * from ${table} where point_id = ?`, pointId);
        })
        .then((points) => {
          if (points === null || points.length < 1) {
            throw new Error('Point not found.');
          }
          return points[0];
        })
        .then((points) => {
          for (let i = 0; i < points.length; i++) {
            if (!absolutePath && points[i].image_path !== null) {
              points[i].image_path = points[i].image_path.replace(directoryConstants.publicDir, '');
            }
          }
          return points;
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
  getByImageId: function (imageId) {
    return new Promise((resolve, reject) => {
      let con;

      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`select * from ${table} where image_id = ?`, imageId);
        })
        .then((points) => {
          for (let i = 0; i < points.length; i++) {
            if (points[i].point_image_path !== null) {
              points[i].point_image_path = points[i].point_image_path.replace(
                directoryConstants.publicDir,
                ''
              );
            }
          }
          return points;
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
  registerPoint: function (imageId, rateCoordinate, imagePath) {
    return new Promise((resolve, reject) => {
      let con;
      let pointImagePath =
        directoryConstants.publicDir +
        '/uploads/point_' +
        dateFormat(Date.now(), 'yyyymmddHHMMssl') +
        '.jpg';

      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`select count(*) as count from ${table} where image_id = ?`, imageId);
        })
        .then((count) => {
          if (count[0].count >= MAX_POINT_COUNT) {
            throw new Error("Can't add point to this image");
          }
        })
        .then(() => {
          return convertRateToAbsolute(rateCoordinate, imagePath);
        })
        .then((coordinate) => {
          const result = con.query(`insert into ${table} set ? `, {
            image_id: imageId,
            point_left: coordinate.left,
            point_right: coordinate.right,
            point_top: coordinate.top,
            point_bottom: coordinate.bottom,
            point_image_path: pointImagePath,
          });

          Jimp.read(imagePath)
            .then((img) => {
              img
                .crop(
                  coordinate.left,
                  coordinate.top,
                  coordinate.right - coordinate.left,
                  coordinate.bottom - coordinate.top
                )
                .write(pointImagePath);
            })
            .catch((error) => {
              throw error;
            });

          return result;
        })
        .then((result) => {
          console.log(`Make: ${pointImagePath}`);
          releaseConnection(con);
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
          con.rollback();
          releaseConnection(con);
          reject(error);
        });
    });
  },
  deletePoint: function (pointId) {
    return new Promise((resolve, reject) => {
      let con;

      getConnection()
        .then((connection) => {
          con = connection;
        })
        .then(() => {
          return con.query(`select * from ${table} where point_id = ?`, pointId);
        })
        .then((points) => {
          if (points === null || points.length < 1) {
            throw new Error('Point not found.');
          }
          return points[0];
        })
        .then((point) => {
          const result = con.query(`delete from ${table} where point_id = ?`, pointId);
          fs.unlinkSync(point.point_image_path);
          return result;
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
};

const convertRateToAbsolute = (rateCoordinate, imagePath) => {
  try {
    const image = imageSize(imagePath);
    return {
      left: Math.floor(rateCoordinate.left * image.width),
      right: Math.floor(rateCoordinate.right * image.width),
      top: Math.floor(rateCoordinate.top * image.height),
      bottom: Math.floor(rateCoordinate.bottom * image.height),
    };
  } catch (e) {
    throw e;
  }
};
