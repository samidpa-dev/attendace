'use strict'

const bcrypt = require('bcrypt');
const db = require(__base + 'app/models');
const Joi = require('joi');

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

module.exports = async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new Error(error.details[0].message);
    }

    const { username, password } = req.body;
    const existingUser = await db.Users.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.Users.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message||error.error });
  }
};