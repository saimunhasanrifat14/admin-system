const express = require('express');
const router = express.Router();

router.use('/invite', require('./api/invite.api'));
router.use('/auth', require('./api/user.api'));
router.use('/project', require('./api/project.api'));

module.exports = router;
