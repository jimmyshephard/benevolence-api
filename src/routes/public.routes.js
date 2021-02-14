const {Router} = require('express');
const {publicContributionRoutes} = require('../contribution');

const router = new Router();

router.use('', publicContributionRoutes);

module.exports = router;
