const {API_LOGIN, TRANSACTION_KEY} = process.env;
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const DatabaseService = require('../db/database.service');
const getCustomerProfileQuery = require('./getCustomeProfileQuery');
const saveTransactionQuery = require('./saveTransactionQuery');
const customerProfileQuery = require('./customerProfileQuery');

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

  /**
   *
   * @param params
   * @returns {Promise<unknown>}
   */
  async chargeCustomerProfile(params) {
    try {
      const {amount, paymentprofile, email, customerProfileId} = params;
      const {customerPaymentProfileId} = paymentprofile;

      const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(API_LOGIN);
      merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);

      const profileToCharge = new ApiContracts.CustomerProfilePaymentType();
      profileToCharge.setCustomerProfileId(customerProfileId);

      const paymentProfile = new ApiContracts.PaymentProfile();
      paymentProfile.setPaymentProfileId(customerPaymentProfileId);
      profileToCharge.setPaymentProfile(paymentProfile);

      const orderDetails = new ApiContracts.OrderType();
      orderDetails.setInvoiceNumber(`INV-${Math.floor(Math.random() * 100000)}`);
      orderDetails.setDescription('Benevolence');

      const transactionRequestType = new ApiContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
      transactionRequestType.setProfile(profileToCharge);
      transactionRequestType.setAmount(amount);
      transactionRequestType.setOrder(orderDetails);

      const createRequest = new ApiContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);

      const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

      const response = await new Promise((resolve, reject) => {
        ctrl.execute(function () {

          const apiResponse = ctrl.getResponse();
          const response = new ApiContracts.CreateTransactionResponse(apiResponse);

          if (response != null) {
            if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
              if (response.getTransactionResponse().getMessages() != null) {
                console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
                console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
                console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
                console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
                resolve(response.getTransactionResponse());
              } else {
                console.log('Failed Transaction.');
                if (response.getTransactionResponse().getErrors() != null) {
                  console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                  console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                  reject({
                    message: response.getTransactionResponse().getErrors().getError()[0].getErrorText()
                  });
                }
              }
            } else {
              console.log('Failed Transaction. ');
              if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {

                console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                reject({
                  message: response.getTransactionResponse().getErrors().getError()[0].getErrorText()
                });
              } else {
                console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
                console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
                reject(response.getMessages().getMessage()[0].getText());
              }
            }
          } else {
            console.log('Null Response.');
            reject({
              message: 'No response received',
            });
          }
        });

      });


      await this.saveTransaction({
        AMNT: amount,
        TRNSCTN_ID: response.transId,
        email
      });

      return response;
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @param params
   * @returns {Promise<void>}
   */
  async saveTransaction(params) {
    try {
      const {email, AMNT, TRNSCTN_ID} = params;
      const custProfileRs = await this.db.query(customerProfileQuery, [email]);

      if (custProfileRs && custProfileRs[0] && custProfileRs[0].customerProfileId) {
        console.log(`Saving tx ${TRNSCTN_ID} for ${email}`);
        const CSTMR_PRFL_ID = custProfileRs[0].customerProfileId;

        await this.db.query(saveTransactionQuery, {AMNT, CSTMR_PRFL_ID, TRNSCTN_ID});
      } else {
        console.log(`No profile found for user ${email}`);
      }

    } catch (e) {
      throw e;
    }
  }
}

module.exports = CustomerProfileService;
