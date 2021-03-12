require('dotenv').config();
const {API_LOGIN, TRANSACTION_KEY} = process.env;
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const DatabaseService = require('../db/database.service');
const {CustomerProfileService} = require('../customer-profile');
const {getCustomerProfileQuery,} = require('../customer-profile');
const saveCustomerProfileQuery = require('./saveCustomerProfileQuery');
const getContributionsQuery = require('./getContributionsQuery');


class ContributionService {

  constructor(db, customerProfileService) {
    this.db = db || new DatabaseService();
    this.customerProfileService = customerProfileService || new CustomerProfileService()
  }

  /**
   * Charge a credit card
   * @param req
   * @returns {Promise<{}>}
   */
  chargeCreditCard = async (req) => {
    try {
      const {
        cardnumber, firstname, lastname, description, zip, cardcode,
        expirationdate, amount, createprofile
      } = req.body;

      const email = req.body.email || req.user_email;

      const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(API_LOGIN);
      merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);
      const creditCard = new ApiContracts.CreditCardType();

      creditCard.setCardNumber(cardnumber);
      creditCard.setExpirationDate(expirationdate);
      creditCard.setCardCode(cardcode);

      const paymentType = new ApiContracts.PaymentType();
      paymentType.setCreditCard(creditCard);

      const orderDetails = new ApiContracts.OrderType();
      orderDetails.setInvoiceNumber(`INV-${Math.floor(Math.random() * 100000)}`);
      orderDetails.setDescription(description);

      const billTo = new ApiContracts.CustomerAddressType();
      billTo.setFirstName(firstname);
      billTo.setLastName(lastname);
      billTo.setZip(zip);
      billTo.setEmail(email);

      const transactionRequestType = new ApiContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
      transactionRequestType.setPayment(paymentType);
      transactionRequestType.setAmount(amount);
      transactionRequestType.setOrder(orderDetails);
      transactionRequestType.setBillTo(billTo);

      const customerData = new ApiContracts.CustomerDataType();
      customerData.setEmail(email);

      const createRequest = new ApiContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);

      const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
      // console.log(JSON.stringify(createRequest.getJSON(), null, 2));

      const chargeCreditCardResponse = await new Promise((resolve, reject) => {

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

      if (chargeCreditCardResponse && createprofile && !await this.userHasProfile(email)) {
        const createProfileFromTxResponse = await this.createProfileFromTransaction(chargeCreditCardResponse.transId, email);
        await this.customerProfileService.saveTransaction({
          AMNT: amount,
          TRNSCTN_ID: chargeCreditCardResponse.transId,
          email
        });
        return {...createProfileFromTxResponse, message: 'The transaction was successful'};
      }

      // Save to db
      await this.customerProfileService.saveTransaction({
        AMNT: amount,
        TRNSCTN_ID: chargeCreditCardResponse.transId,
        email
      });

      return chargeCreditCardResponse;

    } catch (e) {
      throw e;
    }
  }


  /**
   *
   * @param email
   * @returns {Promise<boolean>}
   */
  async userHasProfile(email) {
    try {
      const dbResultSet = await this.db.query(getCustomerProfileQuery, [email]) || [];
      return dbResultSet.length > 0;
    } catch (e) {
      throw  e;
    }
  }

  /**
   *
   * @param transactionId,
   * @param email
   * @returns {Promise<unknown>}
   */
  async createProfileFromTransaction(transactionId, email) {
    try {
      console.log(`Creating profile from transaction ${transactionId}`);
      const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();

      merchantAuthenticationType.setName(API_LOGIN);
      merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);

      const createRequest = new ApiContracts.CreateCustomerProfileFromTransactionRequest();

      createRequest.setTransId(transactionId);
      createRequest.setMerchantAuthentication(merchantAuthenticationType);

      const ctrl = new ApiControllers.CreateCustomerProfileFromTransactionController(createRequest.getJSON());

      const response = await new Promise((resolve, reject) => {
        ctrl.execute(async function () {

          const apiResponse = ctrl.getResponse();
          const response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);

          if (response != null) {
            if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
              console.log('Successfully created a customer payment profile with id: ' + response.getCustomerProfileId() +
                ' from a transaction : ' + transactionId);
              resolve(response);
            } else {
              console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
              console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
              reject(response.getMessages().getMessage()[0].getText());
            }
          } else {
            console.log('Null Response.');
            reject({
              message: 'No response received',
            });
          }
        });
      });

      // Save to DB ...

      if (response.customerProfileId) {

        // Save contribution to db ...
        await this.db.query(saveCustomerProfileQuery, [email, response.customerProfileId]);
      }

      return response;

    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @returns {Promise<[]>}
   */
  getYearOptions = async () => {
    try {
      const yearOptions = [];
      const thisYear = new Date().getFullYear();
      yearOptions.push(thisYear);
      for (let i = 1; i < 7; i++) {
        yearOptions.push(yearOptions[i - 1] + 1);
      }
      return yearOptions;
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @param email
   * @returns {Promise<void>}
   */
  getContributions = async (email) => {
    try {
      const resultSet = await this.db.query(getContributionsQuery, [email.toUpperCase()]);
      return resultSet;
    } catch (e) {
      throw e;
    }
  }


}

module.exports = ContributionService;
