'use strict';

const router = require('express').Router();
const { processInterceptor } = require(__base + 'lib/interceptor');

router.post(
	'/clockin',
  processInterceptor.saveOther('attendance_logs', 'clockin'),
	require('./clockin')
);

router.post(
	'/clockout',
  processInterceptor.saveOther('attendance_logs', 'clockout'),
	require('./clockout')
);

module.exports = router;