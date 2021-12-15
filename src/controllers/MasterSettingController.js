const Vehicles = require('../models/Vehicles');
const Works = require('../models/Works');

module.exports = {
  fetch: function (req, res, _) {
    Vehicles.getAll()
      .then((vehicles) =>
        Promise.all(
          vehicles.map((vehicle) =>
            Works.get(vehicle.vehicle_id).then((works) => ({
              ...vehicle,
              works: works,
            }))
          )
        )
      )
      .then((data) => {
        res.status(200).send(data);
      })
      .catch((reason) => {
        res.status(500).send(reason);
      });
  },
  updateThreshold: function (req, res, _) {
    const vehicle_id = req.body.vehicle_id;
    const position_threshold_level = req.body.position_threshold_level;
    const probability_threshold_level = req.body.probability_threshold_level;

    Works.updateThresholdWithVehicle(
      vehicle_id,
      position_threshold_level,
      probability_threshold_level
    )
      .then(() => {
        res.status(200).send(null);
      })
      .catch((reason) => {
        res.status(500).send(reason);
      });
  },
};
