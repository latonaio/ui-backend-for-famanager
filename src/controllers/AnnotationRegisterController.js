const Images = require('../models/Images');
const Points = require('../models/Points');

module.exports = {
  get: function (req, res, _) {
    const imageId = req.params.id;
    Images.get(imageId)
      .then((image) => {
        res.status(200).send(image);
      })
      .catch((reason) => res.status(500).send(reason));
  },
  getPoints: function (req, res, _) {
    const imageId = req.params.id;
    Points.getByImageId(imageId)
      .then((points) => {
        res.status(200).send(points);
      })
      .catch((reason) => res.status(500).send(reason));
  },
  getPointsByWorkID: function (req, res, _) {
    const workID = req.params.work_id;
    Images.getImageByWorkId(workID)
      .then((image) => Points.getByImageId(image.image_id))
      .then((points) => {
        res.status(200).send(points);
      })
      .catch((reason) => res.status(500).send(reason));
  },
  registerPoint: function (req, res, _) {
    const imageId = req.body.imageId;
    const rateCoordinate = req.body.rateCoordinate;
    Images.get(imageId, true)
      .then((image) => Points.registerPoint(imageId, rateCoordinate, image[0].image_path))
      .then(() => Points.getByImageId(imageId))
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((reason) => {
        console.log(reason);
        res.status(500).send(reason);
      });
  },
  deletePoint: function (req, res, _) {
    const pointId = req.body.pointId;
    const imageId = req.body.imageId;
    Points.get(pointId, true)
      .then(() => Points.deletePoint(pointId))
      .then(() => Points.getByImageId(imageId))
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((reason) => {
        console.log(reason);
        res.status(500).send(reason);
      });
  },
  getLatest: function (req, res, _) {
    Images.getLatest()
      .then((result) => {
        res.status(200).send('SUCCESS');
      })
      .catch((reason) => {
        console.log(reason);
        res.status(500).send('FAIL');
      });
  },
};
