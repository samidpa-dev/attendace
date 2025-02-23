'use strict'

const db = require(__base + 'app/models');
const moment = require('moment');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not exists');
    }

    let attend = await db.Attendances.findOne({ 
      where: { 
        userId: req.user.id, 
        createdAt: { 
          [db.Sequelize.Op.gte]: moment().tz('Asia/Jakarta').startOf('day'), 
          [db.Sequelize.Op.lte]: moment().tz('Asia/Jakarta').endOf('day') 
          } 
        }
      });
    if (!attend) {
      attend = await db.Attendances.create({
        userId: req.user.id,
        clockOut: moment().tz('Asia/Jakarta')
      })
    }else{
      if (attend.clockOut) {
        throw new Error('Already clock out');
      }
      attend.clockOut = moment().tz('Asia/Jakarta');
      await attend.save();

      await attend.reload();
    }

    res.status(201).json({ message: 'Clock Out Success', attend });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message||error.error });
  }
};