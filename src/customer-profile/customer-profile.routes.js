const CustomerProfileController = require('./customer-profile.controller');
const {Router} = require('express');
const customerProfileController = new CustomerProfileController();
const {validateRequest} = require('../validators/request.validator');
const {body} = require('express-validator');
const router = new Router();

router.get(
  '/',
  customerProfileController.getCustomerProfile,
);

router.post(
  '/charge',
  body('paymentprofile').not().isEmpty(),
  body('customerProfileId').not().isEmpty(),
  body('amount').not().isEmpty().isNumeric(),
  validateRequest,
  customerProfileController.chargeCustomerProfile,
);

module.exports = router;
