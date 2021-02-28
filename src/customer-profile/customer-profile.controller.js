const CustomerProfileService = require('./customer-profile.service');
const mock = require('./mock.charge.customer-profile');


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

      return res.json(result);

    } catch (e) {
      console.error(e);

      return res.status(500).json({
        message: typeof e === 'string' ? e : 'Error fetching customer profile'
      });
    }
  };

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  chargeCustomerProfile = async (req, res) => {
    try {
      const result = await this
        .customerProfileService
        .chargeCustomerProfile({...req.body, email: req.user_email});

      return res.json(result);

    } catch (e) {
      console.error(e);

      return res.status(500).json({
        message: typeof e === 'string' ? e : 'Error charging customer profile'
      });
    }
  }

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  updateCustomerPaymentProfile = async (req, res) => {
    try {
      const result = await this
        .customerProfileService
        .updateCustomerPaymentProfile({...req.body, email: req.user_email});

      return res.json(result);

    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: typeof e === 'string' ? e : 'Error updating customer profile'
      });
    }
  }
}

module.exports = CustomerProfileController;
