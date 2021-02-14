const {API_LOGIN, TRANSACTION_KEY} = process.env;
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const DatabaseService = require('../db/database.service');
const getCustomerProfileQuery = require('./getCustomeProfileQuery');

class CustomerProfileService {

  constructor(db) {
    this.db = db || new DatabaseService();
  }

  /**
   * Fetch customer profile from Authorize.Net if the customer has any in the database
   * @param user_email
   * @returns {Promise<object> || Promise<[]>}
   */
  async getCustomerProfile(user_email) {
    try {
      const dbResultSet = await this.db.query(getCustomerProfileQuery, [user_email]) || [];

      if (!dbResultSet.length) {
        console.log(`No customer profiles found for user ${user_email}`);
        return {};
      }

      const {customerProfileId} = dbResultSet[0];

      const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(API_LOGIN);
      merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);

      const getRequest = new ApiContracts.GetCustomerProfileRequest();
      getRequest.setCustomerProfileId(customerProfileId);
      getRequest.setMerchantAuthentication(merchantAuthenticationType);
      const ctrl = new ApiControllers.GetCustomerProfileController(
        getRequest.getJSON());

      const result = await new Promise((resolve, reject) => {
        ctrl.execute(function () {

          const apiResponse = ctrl.getResponse();

          const response = new ApiContracts.GetCustomerProfileResponse(
            apiResponse);

          if (response != null) {
            if (response.getMessages().getResultCode() ==
              ApiContracts.MessageTypeEnum.OK) {

              console.log('Customer profile ID : ' +
                response.getProfile().getCustomerProfileId());
              console.log(
                'Customer Email : ' + response.getProfile().getEmail());
              console.log(
                'Description : ' + response.getProfile().getDescription());
              resolve(response.getProfile());

            } else {
              //console.log('Result Code: ' + response.getMessages().getResultCode());
              console.log('Error Code: ' +
                response.getMessages().getMessage()[0].getCode());
              console.log('Error message: ' +
                response.getMessages().getMessage()[0].getText());
              reject({
                errorCode: response.getMessages().getMessage()[0].getCode(),
                message: response.getMessages().getMessage()[0].getText(),
              });
            }
          } else {
            console.log('Null response.');
            reject({
              message: 'No response received',
            });
          }
        });
      });

      return result;

    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

module.exports = CustomerProfileService;
