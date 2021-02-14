const CustomerProfileController = require('./customer-profile.controller');
const {Router} = require('express');
const customerProfileController = new CustomerProfileController();
const router = new Router();

router.get(
  '/',
  customerProfileController.getCustomerProfile,
);

module.exports = router;
