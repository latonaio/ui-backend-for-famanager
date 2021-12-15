const Redis = require('ioredis');
const express = require('express');
const app = express();
const config = require('../../config/db.json')[app.get('env')];
const client = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db.matching,
  showFriendlyErrorStack: true,
});

client.on('connect', () => console.log('success connection to Redis'));
client.on('error', (err) => console.log('failed connection to Redis：' + err));

module.exports = {
  getMatchingFromRedis: function (processNo = 1) {
    return new Promise((resolve, reject) => {
      client
        .zrevrangebyscore(`key-list:${processNo}`, '+inf', 0, 'LIMIT', 0, 1)
        .then((keys) => Promise.all(keys.map((key) => client.hgetall(key))))
        .then((data) => resolve(data))
        .catch((error) => {
          reject(error);
          console.log(error);
        });
    });
  },
};
