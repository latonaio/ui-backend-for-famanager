const Stream = require('node-rtsp-stream');

const DEFAULT_RAW_DATA_PORT_NO = 8554;
const DEFAULT_MATCHING_RESULT_PORT_NO = 4999;

module.exports = {
  stream: undefined,
  checkRtspConnection: () => {
    if (this.stream !== undefined && this.stream.mpeg1Muxer.exitCode !== undefined) {
      this.stream.stop();
      this.stream = undefined;
      console.log('[rtsp to websocket server] connection closed');
    }
  },
  connectToRTSPServer: async (usageID, type) => {
    const port = getNodePort(type);
    console.log('=====================================');
    console.log(usageID);
    const url = getURL(usageID, type);
    console.log(url);
    console.log('=====================================');

    if (this.stream != null) {
      this.stream.stop();
      this.stream = undefined;
      console.log('[rtsp to websocket server] reconnect to rtsp server');
    }
    this.stream = new Stream({
      name: 'fitness',
      streamUrl: url,
      width: 864,
      height: 480,
      wsPort: port,
      ffmpegOptions: {
        // options ffmpeg flags
        '-stats': '', // an option with no neccessary value uses a blank string
        '-r': 30, // options with required values specify the value after the key
        '-tune': 'zerolatency',
        '-async': 1,
        '-q': 1,
      },
    });
    console.log('Connect to server');
    setTimeout(module.exports.checkRtspConnection, 1000);
    return port;
  },
  disconnectFromRTSPServer: async () => {
    if (this.stream == null) {
      return false;
    }
    console.log('Disconnect from server');
    this.stream.stop();
    this.stream = undefined;
    console.log('[rtsp to websocket server] received request from server');
  },
};

function getNodePort(type) {
  if (type === 'test') {
    return 30555;
  } else if (type === 'production') {
    return 30555;
  } else {
    throw Error(`Invalid type Error {type: ${type}`);
  }
}

function getURL(usageID, type) {
  if (type === 'test') {
    return `rtsp://stream-usb-video-by-rtsp-multiple-camera-${usageID}-001-srv:${
      DEFAULT_RAW_DATA_PORT_NO + usageID
    }/usb`;
  } else if (type === 'production') {
    return `rtsp://template-matching-by-opencv-for-rtsp-${usageID}-001-srv:${
      DEFAULT_MATCHING_RESULT_PORT_NO + usageID
    }/fitness`;
  } else {
    throw Error(`Invalid type Error {type: ${type}`);
  }
}
