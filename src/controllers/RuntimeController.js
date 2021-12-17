const fs = require('fs');
const dateFormat = require('dateformat');
const path = require('path');

const Images = require('../models/Images');
const Points = require('../models/Points');
const Cameras = require('../models/Cameras');
const directoryConstants = require('../constants/directory.constants');

const { getRabbitmqClient, QUEUE_TO_TEMPLATE, QUEUE_TO_TEMPLATE_2 } = require('../rabbitmq');

const { asyncHandler } = require('../util');

export const setTemplatesToAll = asyncHandler(async (req, res) => {
  try {
    const camerasImageData = await Cameras.getAllCamera()
      .then((cameras) =>
        Promise.all(
          cameras.map((c) =>
            Promise.all([
              Images.getImageByWorkId(c.usage_id),
              Images.getThresholds(c.usage_id),
            ]).then((img) => ({
              ...img[0],
              ...img[1],
            }))
          )
        )
      )
      .then((images) =>
        Promise.all(
          images.map((image) => Promise.all([image, Points.getByImageId(image.image_id)]))
        )
      )
      .then((templates) =>
        Promise.all(templates.map((template) => template[1].length === 0)).then((noTemplates) => {
          if (noTemplates.reduce((a, c) => a || c, false)) {
            throw Error('テンプレートがセットされていないワークがあります。');
          }
          return templates;
        })
      )
      .then((templates) =>
        Promise.all(
          templates.map((template) => {
            const image = template[0];
            if (image.image_id === undefined) {
              throw Error('アノテーションを登録してください。');
            }
            if (!fs.existsSync(image.image_path)) {
              throw Error(
                'ファイルが存在しません。もう一度アノテーションを登録しなおしてください。'
              );
            }
            const dest = path.join(
              directoryConstants.templateOutputDir,
              `template_${image.work_id}${path.extname(image.image_path)}`
            );
            fs.copyFileSync(image.image_path, dest);
            console.log(`copy: ${image.image_path} -> ${dest}`);
            return template;
          })
        )
      )
      .then((templates) =>
        Promise.all(
          templates.map((template) => ({
            [`template-${template[0].work_id}`]: {
              outputDataPath: '/var/lib/aion/Data/template-matching-by-opencv-for-rtsp_1/',
              metadata: {
                template_timestamp: new Date(),
                template: template[1].map((t) => ({
                  template_image: {
                    path: path.join(
                      directoryConstants.templateOutputDir,
                      `template_${template[0].work_id}${path.extname(template[0].image_path)}`
                    ),
                    trim_points: [
                      [t.point_left, t.point_top],
                      [t.point_right, t.point_bottom],
                    ],
                  },
                  image: {
                    trim_points: [
                      [t.point_left, t.point_top],
                      [t.point_right, t.point_bottom],
                    ],
                    trim_points_ratio: template[0].pos_threshold,
                  },
                  metadata: {
                    point_id: t.point_id,
                    work_id: template[0].work_id,
                    pass_threshold: template[0].pass_threshold,
                  },
                })),
              },
            },
          }))
        )
      )
      .then((data) => {
        const outputData = {
          connections: data.reduce(
            (accumulator, currentValue) => ({ ...accumulator, ...currentValue }),
            {}
          ),
        };
        // outputJsonFile(outputData, 'template');
        return outputData;
      });

    for (const [serviceName, payload] of Object.entries(camerasImageData.connections)) {
      console.log(`serviceName: ${serviceName}, payload:`, payload);

      const queueName = {
        'template-1': QUEUE_TO_TEMPLATE,
        'template-2': QUEUE_TO_TEMPLATE_2,
      }[serviceName];

      // RabbitMQ クライアントを使って送信
      const client = await getRabbitmqClient();
      await client.send(queueName, payload.metadata);

      console.log(`sent to ${queueName}:`, payload.metadata);
    }

    res.status(200).send(camerasImageData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

export const execStartRecording = asyncHandler(async (req, res) => {
  const now = new Date();
  const isProduction = req.body.isProduction;

  try {
    const next_service_list = [
      {
        name: 'ServiceBrokerR',
        directory: path.join(directoryConstants.dataDir, 'service-broker-r'),
        runtime: 'node',
        script: 'yarn start',
        device: directoryConstants.deviceName,
      },
    ];
    const metadata = {
      start_service: 'RealTimeVideoStreaming',
    };

    if (isProduction) {
      // 本番撮影の場合はテンプレートのセットを同時に行う
      const next_service = {
        name: 'SetTemplateForMatching',
        directory: path.join(directoryConstants.dataDir, 'set-template-for-matching'),
        runtime: 'python',
        script: 'main.py',
        device: directoryConstants.deviceName,
      };
      next_service_list.push(next_service);
    }

    const data = {
      nextServiceList: next_service_list,
      metadata: metadata,
    };
    // outputJsonFile(data, 'start_execution', now);
    res.status(200).send(true);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

export const execEndRecording = (req, res) => {
  const now = new Date();

  try {
    // outputJsonFile(
    //   {
    //     nextServiceList: [
    //       {
    //         name: 'ServiceBrokerR',
    //         directory: path.join(directoryConstants.dataDir, 'service-broker-r'),
    //         runtime: 'node',
    //         script: 'yarn start',
    //         device: directoryConstants.deviceName,
    //       },
    //     ],
    //     metadata: {
    //       stop_service: 'RealTimeVideoStreaming',
    //     },
    //   },
    //   'stop_execution',
    //   now
    // );

    res.status(200).send(true);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

// const outputJsonFile = (data, prefix, now) => {
//   if (now === undefined) {
//     now = new Date();
//   }
//   const outputPath =
//     directoryConstants.jsonOutputDir +
//     '/' +
//     prefix +
//     '_' +
//     dateFormat(now, 'yyyymmddHHMMssl') +
//     '.json';

//   try {
//     fs.writeFileSync(outputPath, JSON.stringify(data));
//     console.log('Successfully Written to ' + outputPath);
//   } catch (e) {
//     console.log(e);
//     throw e;
//   }
// };
