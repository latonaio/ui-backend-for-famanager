const express = require('express');
const app = express();
const mysql = require('promise-mysql');

// MySQLのコネクションプールを作成
const config = require('../config/db.json')[app.get('env')];
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || config.mysql.host,
  user: process.env.MYSQL_USER || config.mysql.user,
  password: process.env.MYSQL_PASSWORD || config.mysql.password,
  database: process.env.DB_NAME || config.mysql.database,
  port: process.env.MYSQL_PORT || config.mysql.port,
  timezone: 'Asia/Tokyo',
  connectionLimit: 10,
});

const getConnection = async function () {
  return pool
    .then((pool) => pool.getConnection())
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const releaseConnection = function (connection) {
  if (connection !== undefined) {
    pool.then((pool) => pool.releaseConnection(connection)).catch((err) => console.log(err));
  }
};

console.log('MySQL Connection Pool Created.');
module.exports = { poolPromise: pool, getConnection, releaseConnection };
