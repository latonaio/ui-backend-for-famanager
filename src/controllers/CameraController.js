const Camera = require('../models/Cameras');

module.exports = {
  getCameraStatus: function (req, res, _) {
    Camera.getCameraStatus()
      .then((image) => {
        res.status(200).send(image);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({ error });
      });
  },
  getCameraByUsageID: function (req, res, _) {
    Camera.getCameraByUsageID(req.params.usageID)
      .then((camera) => res.status(200).send(camera))
      .catch((error) => {
        console.log(error);
        res.status(500).send({ error });
      });
  },
  getAllCamera: function (req, res, _) {
    Camera.getAllCamera()
      .then((cameras) => res.status(200).send(cameras))
      .catch((error) => {
        console.log(error);
        res.status(500).send({ error });
      });
  },
};
