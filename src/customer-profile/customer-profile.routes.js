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
  body('paymentprofile.customerPaymentProfileId').not().isEmpty(),
  body('customerProfileId').not().isEmpty(),
  body('amount').not().isEmpty().isNumeric(),
  validateRequest,
  customerProfileController.chargeCustomerProfile,
);

router.post(
  '/update',
  body('cardnumber').isLength({min: 13}).trim(),
  body('firstname').not().isEmpty().trim(),
  body('lastname').not().isEmpty().trim(),
  body('zip').isNumeric().isLength({min: 5}),
  body('expirationdate').not().isEmpty().trim(),
  body('address').not().isEmpty().trim(),
  body('city').not().isEmpty().trim(),
  body('state').not().isEmpty().trim(),
  body('setDefault').not().isEmpty().isBoolean(),
  body('customerPaymentProfileId').not().isEmpty(),
  body('customerProfileId').not().isEmpty().trim(),
  validateRequest,
  customerProfileController.updateCustomerPaymentProfile,
);

module.exports = router;
