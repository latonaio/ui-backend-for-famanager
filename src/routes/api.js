const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const dateFormat = require('dateformat');

const testShootingController = require('../controllers/TestShootingController');
const annotationRegisterController = require('../controllers/AnnotationRegisterController');
const productionStartController = require('../controllers/ProductionStartController');
const masterController = require('../controllers/MasterController');
const masterSettingController = require('../controllers/MasterSettingController');
const runtimeController = require('../controllers/RuntimeController');
const cameraController = require('../controllers/CameraController');
const dataExportController = require('../controllers/DataExportController');
const streamingController = require('../controllers/StreamingController');

// Test Shooting
router.get('/test-shooting/get/image/:token', testShootingController.getImageByCaptureToken);
router.get('/test-shooting/get/image-by-work-id/:id', testShootingController.getImageByWorkId);
router.get('/get/vehicle/by-work-id/:id', testShootingController.getVehicleByWorkID);
router.get('/fetch/points/by-work-id/:work_id', annotationRegisterController.getPointsByWorkID);
router.get('/get/work/:id', testShootingController.getWork);

// Annotation Register
router.get('/annotation-register/get/:id', annotationRegisterController.get);
router.get('/annotation-register/fetch-points/:id', annotationRegisterController.getPoints);
router.get('/annotation-register/get-latest/', annotationRegisterController.getLatest);
router.post('/annotation-register/register/point', annotationRegisterController.registerPoint);
router.post('/annotation-register/delete/point', annotationRegisterController.deletePoint);

// Production Start
router.get('/production-start/get/', productionStartController.getResultByTemplateMatching);
router.get('/shooting/get/current-vehicle', productionStartController.getCurrentVehicle);

// Master
router.get('/master/get/', masterController.get);
router.get('/master-setting/fetch/', masterSettingController.fetch);
router.post('/master-setting/update/threshold/', masterSettingController.updateThreshold);

// Runtime
router.post('/runtime/start-recording/', runtimeController.execStartRecording);
router.post('/runtime/end-recording/', runtimeController.execEndRecording);

// Camera status
router.get('/camera-status/get/', cameraController.getCameraStatus);

// rtsp
router.get('/video/stop-rtsp-to-ws/', streamingController.stopRtspToWs);
router.get('/video/get-rtsp-to-ws-port/:usageID/:type', streamingController.getRtspToWsPort);
router.post('/runtime/capture-image/', streamingController.captureImage);

// for list(external)
router.get('/result/get-list', dataExportController.getResultByTemplateMatching);
router.get('/result/get-vehicle', dataExportController.getVehicleNameList);

router.post('/set/template', runtimeController.setTemplatesToAll);

router.get('/get/matching/:usageID', productionStartController.getMatchingFromRedis);

router.get('/get/camera/:usageID', cameraController.getCameraByUsageID);
router.get('/get/all-camera', cameraController.getAllCamera);

router.get('/get/template/available', productionStartController.checkAllTemplate);

// file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const constants = require('../constants/directory.constants');
    cb(null, path.join(constants.publicDir, 'uploads'));
  },
  // 別の形式のファイルをアップロードする場合はfile.fieldnameで分別する
  filename: function (req, file, cb) {
    cb(null, dateFormat(new Date(), 'yyyymmddHHMMssl') + '.jpg');
  },
});
const upload = multer({ storage: storage });

// file
// upload.singleの引数はリクエストのファイルを格納しているキー名と合わせること
router.post('/file/upload/image', upload.single('blob'), streamingController.captureImage);

module.exports = router;
