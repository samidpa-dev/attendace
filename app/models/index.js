'use strict';

const { NODE_ENV = 'development', SEQUELIZE_MAX_POOL } = process.env;
const Sequelize = require('sequelize');
const lodash    = require('lodash');
const fs        = require('fs');
const path      = require('path');
const basename  = path.basename(module.filename);
const config    = require('../../config/db.json')[NODE_ENV];
let db        = {};

let sequelize;

config.pool.max = SEQUELIZE_MAX_POOL || config.pool.max || 5;

sequelize = new Sequelize(process.env[config.use_env_variable], config);

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
}).forEach(function (file) {
  let model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);


