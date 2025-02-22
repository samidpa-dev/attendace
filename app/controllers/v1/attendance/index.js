'use strict';

const router = require('express').Router();

router.post(
	'/clockin',
	require('./clockin')
);

router.post(
	'/clockout',
	require('./clockout')
);

module.exports = router;