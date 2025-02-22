'use strict'
const jwt = require('jsonwebtoken');


module.exports = async (req, res, next) => {
  try {
    if (!req.User) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: req.User.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message||error.error });
  }
};