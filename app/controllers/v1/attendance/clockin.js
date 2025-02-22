'use strict'

const db = require(__base + 'app/models');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not exists');
    }

    const attend = await db.Attendances.create({ userId: req.user.id, clockIn: new Date() });

    res.status(201).json({ message: 'Clock In Success', attend });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message||error.error });
  }
};