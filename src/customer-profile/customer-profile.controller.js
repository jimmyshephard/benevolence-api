const {validationResult} = require('express-validator');
const CustomerProfileService = require('./customer-profile.service');

class CustomerProfileController {

  constructor(customerProfileService) {
    this.customerProfileService = customerProfileService ||
      new CustomerProfileService();
  }

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  getCustomerProfile = async (req, res) => {
    try {
      const {user_email} = req;
      const result = await this.customerProfileService.getCustomerProfile(user_email);

      if (JSON.stringify(result) === '{}') {
        return res.status(404).json({message: 'No customer profiles found'})
      }

      return res.json(result);

    } catch (e) {
      console.error(e);

      return res.status(500).json({
        message: 'Error fetching customer profile'
      });
    }
  };

  /**
   * Return list of customer ids that belong to current user from db
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  getUserCustomerProfiles = async (req, res) => {

  };

  /**
   * Update credit card attached to a customerPaymentProfile
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  updateCustomerPaymentProfile = async (req, res) => {

  };
}

module.exports = CustomerProfileController;
