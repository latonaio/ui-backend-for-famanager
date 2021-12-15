const path = require('path');
const dateFormat = require('dateformat');
const fs = require('fs');
const Result = require('../models/Result');
const Images = require('../models/Images');
const Points = require('../models/Points');
const Works = require('../models/Works');
const CurrentVehicle = require('../models/CurrentVehicle');
const Vehicle = require('../models/Vehicles');
const Redis = require('../models/Redis');
const Cameras = require('../models/Cameras');

const directoryConstants = require('../constants/directory.constants');

module.exports = {
  get: function (req, res, _) {
    res.status(200).send('OK');
  },
  getResultByTemplateMatching: function (req, res, _) {
    Result.getLatest()
      .then((latest) => {
        to_path = copyMatchingImage(latest.img_path);
        latest.img_path = path.basename(to_path);
        latest.time_stamp = dateFormat(latest.time_stamp, 'yyyy-mm-dd HH:MM:ss');
        Works.getWorkByWorkId(latest.work_id).then((result) => {
          latest['work_name'] = result[0].name;
          latest['position_threshold_level'] = result[0].position_threshold_level;
          latest['probability_threshold_level'] = result[0].probability_threshold_level;
          console.log(
            `work name: ${latest.work_name}, pass:${latest.pass}, image:${latest.img_path}`
          );
          res.status(200).send(latest);
        });
      })
      .catch((reason) => {
        console.log(reason);
        res.status(500).send(reason);
      });
  },
  getCurrentVehicle: function (req, res, _) {
    CurrentVehicle.get()
      .then((current) => {
        return Vehicle.get(current.vehicle_id);
      })
      .then((vehicle) => {
        res.status(200).send(vehicle);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(error);
      });
  },
  getMatchingFromRedis: function (req, res, _) {
    const usageID = req.params.usageID;

    Promise.all([
      Redis.getMatchingFromRedis(usageID),
      Images.getImageByWorkId(usageID).then((image) => Points.getByImageId(image.image_id)),
    ])
      .then((result) => {
        let fitness = {};
        if (result[0].length > 0) {
          fitness = JSON.parse(result[0][0].fitness.replace(/'/g, '"')).reduce(
            (accumulator, currentValue) => ({
              ...accumulator,
              [currentValue.point_id]: {
                matching_rate: currentValue.matching_rate,
                pass_threshold: currentValue.pass_threshold,
              },
            }),
            {}
          );
        }
        return result[1].map((template) => ({
          ...template,
          ...fitness[template.point_id],
        }));
      })
      .then((matchingResult) => {
        res.status(200).send(matchingResult);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(error);
      });
  },
  checkAllTemplate: function (req, res, _) {
    Cameras.getAllCamera()
      .then((cameras) =>
        Promise.all(cameras.map((camera) => Images.getImageByWorkId(camera.usage_id)))
      )
      .then((images) => Promise.all(images.map((image) => Points.getByImageId(image.image_id))))
      .then((pointsList) => pointsList.any((points) => points.length === 0))
      .then((isAvailable) => {
        res.status(200).send(isAvailable);
      })
      .catch((error) => {
        res.status(500).send({ error: error.message });
      });
  },
};

function copyMatchingImage(image_path) {
  const file_name = path.basename(image_path);
  const upload_dir = path.join(directoryConstants.publicDir, 'uploads');
  const output_file_path = path.join(upload_dir, file_name);
  try {
    fs.copyFileSync(image_path, output_file_path);
  } catch (e) {
    throw new Error(e);
  }
  return output_file_path;
}
