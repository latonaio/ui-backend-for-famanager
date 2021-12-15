const path = require('path');
const userName = process.env.USER;
const deviceName = process.env.DEVICE_NAME;

const publicDir = process.env.PUBLIC_DIR;
const dataDir = process.env.DATA_DIR;

module.exports = {
  userName: userName,
  deviceName: deviceName,
  publicDir: publicDir,
  dataDir: dataDir,
  jsonOutputDir: path.join(dataDir, 'direct-next-service_1'),
  templateOutputDir: path.join(dataDir, 'template-matching-by-opencv-for-rtsp'),
};
