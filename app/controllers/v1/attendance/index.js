'use strict';

const router = require('express').Router();
const { processInterceptor } = require(__base + 'lib/interceptor');

router.post(
	'/clockin',
  processInterceptor.saveElastic('attendance_logs', 'clockin'),
	require('./clockin')
);

router.post(
	'/clockout',
  processInterceptor.saveElastic('attendance_logs', 'clockout'),
	require('./clockout')
);

module.exports = router;