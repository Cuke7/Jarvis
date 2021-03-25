var express = require('express');
var router = express.Router();

router.use('/musicAPI', require('./musicAPI'));
router.use('/jarvisAPI', require('./jarvisAPI'));

module.exports = router;