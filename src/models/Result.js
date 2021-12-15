const express = require('express');
const app = express();
const mongo = require('mongodb');
const config = require('../../config/db.json')[app.get('env')];
const PRIOR_SERVICE_NAME = 'TemplateMatchingOutputImage';

module.exports = {
  getLatest: () => {
    let con;
    return new Promise((resolve, reject) => {
      mongo.MongoClient.connect(`mongodb://${config.mongo.host}:${config.mongo.port}`)
        .then((connection) => {
          con = connection;
          return con.db(config.mongo.db);
        })
        .then((db) => {
          return db.collection(config.mongo.collection);
        })
        .then((collection) => {
          return collection
            .find({ priorServiceName: PRIOR_SERVICE_NAME }, { hint: { finishAt: -1 }, limit: 1 })
            .toArray();
        })
        .then((data) => {
          if (!data) {
            throw new Error('Not Found result from mongodb');
          }
          latest = data[0].metadata[0].value.slice(-1)[0];
          time_stamp = data[0].finishAt;
          if (latest.work_id < 0) {
            throw new Error('Not Found result (default template)');
          }
          let ret = {
            vehicle_id: latest.vehicle_id,
            vehicle_name: latest.vehicle_name,
            vehicle_no: latest.vehicle_no,
            work_id: latest.work_id,
            img_path: latest.output_path,
            pass: latest.pass,
            time_stamp: time_stamp,
          };
          con.close();
          resolve(ret);
        })
        .catch((error) => {
          if (con) {
            con.close();
          }
          console.log(error);
          reject(error);
        });
    });
  },
  getList: (limit) => {
    let con;
    return new Promise((resolve, reject) => {
      mongo.MongoClient.connect(`mongodb://${config.mongo.host}:${config.mongo.port}`)
        .then((connection) => {
          con = connection;
          return con.db(config.mongo.db);
        })
        .then((db) => {
          return db.collection(config.mongo.collection);
        })
        .then((collection) => {
          return collection
            .find(
              { priorServiceName: PRIOR_SERVICE_NAME },
              { hint: { finishAt: -1 }, limit: limit }
            )
            .toArray();
        })
        .then((data) => {
          con.close();
          resolve(data);
        })
        .catch((error) => {
          if (con) {
            con.close();
          }
          console.log(error);
          reject(error);
        });
    });
  },
};
