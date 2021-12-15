const result = require('../models/Result');
const vehicle = require('../models/Vehicles');
const work = require('../models/Works');

const MAX_LIST_LENGTH = 20;

module.exports = {
  getResultByTemplateMatching: function (req, res, _) {
    result
      .getList(MAX_LIST_LENGTH)
      .then((items) => items.map((item) => item.metadata[0].value.reverse()))
      .then((data) => {
        const list = [];
        // 配列をフラットにする
        data.map((metadata) => metadata.map((image_result) => list.push(image_result)));
        return list.slice(0, MAX_LIST_LENGTH);
      })
      .then((data) => {
        console.log(data);
        res.status(200).send(data);
      })
      .catch((reason) => {
        console.log(reason);
        res.status(500).send(reason);
      });
  },
  getVehicleNameList: function (req, res, _) {
    vehicle
      .getAll()
      .then((vehicles) => {
        const dict = {};
        return Promise.all(
          vehicles.map((ve) =>
            work.get(ve.vehicle_id).then((works) => {
              const workDict = {};
              works.map((wo) => (workDict[wo.work_id] = wo));
              dict[ve.vehicle_id] = { vehicle: ve, work: workDict };
            })
          )
        ).then((_) => dict);
      })
      .then((data) => {
        console.log(data);
        res.status(200).send(data);
      })
      .catch((reason) => {
        console.log(reason);
        res.status(500).send(reason);
      });
  },
};
