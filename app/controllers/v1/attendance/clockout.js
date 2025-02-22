'use strict'

const db = require(__base + 'app/models');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not exists');
    }

    const update = await db.Attendances.update(
      { clockOut: new Date() },
      { where: { userId: req.user.id, clockOut: null } }
    );

    res.status(201).json({ message: 'Clock Out Success', update });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message||error.error });
  }
};