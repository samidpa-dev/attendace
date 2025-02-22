'use strict';

const router = require('express').Router();

router.use(
	'/attendance',
	require('./attendance')
);

module.exports = router;