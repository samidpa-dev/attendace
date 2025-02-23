'use strict'

const db = require(__base + 'app/models');
const moment = require('moment');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not exists');
    }

    const attendExist = await db.Attendances.findOne({ 
      where: { 
        userId: req.user.id, 
        createdAt: { 
          [db.Sequelize.Op.gte]: moment().tz('Asia/Jakarta').startOf('day'), 
          [db.Sequelize.Op.lte]: moment().tz('Asia/Jakarta').endOf('day') 
          } 
        }
      });

    if (attendExist && attendExist.clockIn) {
      throw new Error('Already clock in');
    }

    if (attendExist &&attendExist.clockOut) {
      throw new Error('Already clock out');
    }

    const attend = await db.Attendances.create({ 
      userId: req.user.id, 
      clockIn: moment().tz('Asia/Jakarta')
    });

    res.status(201).json({ message: 'Clock In Success', attend });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message||error.error });
  }
};