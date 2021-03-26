var express = require('express');
var router = express.Router();

router.use('/musicAPI', require('./musicAPI'));
router.use('/jarvisAPI', require('./jarvisAPI'));
router.use('/tramAPI', require('./tramAPI'));
router.use('/dialogflowAPI', require('./dialogflowAPI'));

module.exports = router;