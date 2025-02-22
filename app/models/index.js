'use strict';

const { NODE_ENV = 'development', SEQUELIZE_MAX_POOL } = process.env;
const Sequelize = require('sequelize');
const lodash    = require('lodash');
const config    = require('../../config/db.json')[NODE_ENV];
let db        = {};

let sequelize;

config.pool.max = SEQUELIZE_MAX_POOL || config.pool.max || 5;

sequelize = new Sequelize(process.env[config.use_env_variable], config);

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);


