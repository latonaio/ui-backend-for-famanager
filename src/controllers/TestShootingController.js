const Images = require('../models/Images');
const Camera = require('../models/Cameras');
const Vehicles = require('../models/Vehicles');
const Works = require('../models/Works');

module.exports = {
  getImageByCaptureToken: function (req, res, _) {
    const captureToken = req.params.token;

    Images.getImageByCaptureToken(captureToken)
      .then((image) => {
        res.status(200).send(image);
      })
      .catch((reason) => {
        console.log(reason);
        res.status(500).send(reason);
      });
  },
  getImageByWorkId: function (req, res, _) {
    const workId = req.params.id;
    Images.getImageByWorkId(workId)
      .then((image) => {
        res.status(200).send(image);
      })
      .catch((reason) => {
        res.status(500).send(reason);
      });
  },
  getCameraStatus: function (req, res, _) {
    Camera.getCameraStatus().then((image) => {
      res.status(200).send(image);
    });
  },
  getVehicleByWorkID: function (req, res, _) {
    const workID = req.params.id;
    Vehicles.getByWorkID(workID)
      .then((vehicle) => {
        res.status(200).send(vehicle);
      })
      .catch((reason) => {
        res.status(500).send(reason);
      });
  },
  getWork: function (req, res, _) {
    const workID = req.params.id;
    Works.get(workID)
      .then((work) => {
        res.status(200).send(work);
      })
      .catch((reason) => {
        res.status(500).send(reason);
      });
  },
};
