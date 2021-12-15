const StreamWS = require('../ws/rtsp');
const Images = require('../models/Images');

module.exports = {
  getRtspToWsPort: (req, res, _) => {
    const type = req.params.type;
    const usageID = req.params.usageID;

    StreamWS.connectToRTSPServer(Number(usageID), type)
      .then((port) => res.status(200).send({ port }))
      .catch((err) => {
        console.error(err);
        res.status(501).send(false);
      });
  },
  stopRtspToWs: (req, res, _) => {
    StreamWS.disconnectFromRTSPServer()
      .then((result) => {
        res.status(200).send({ result: result });
      })
      .catch((err) => {
        console.error(err);
        res.status(501).send({ result: false });
      });
  },
  captureImage: (req, res, _) => {
    const file = req.file.path;
    const workID = req.body.workID;

    Images.register(file, workID)
      .then((result) => Images.get(result.insertId, false))
      .then((result) => {
        res.status(200).send({ image: result[0] });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({ error: error });
      });
  },
};
