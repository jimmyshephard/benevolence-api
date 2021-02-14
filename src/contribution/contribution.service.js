const {API_LOGIN, TRANSACTION_KEY} = process.env;
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

class ContributionService {

  /**
   * Charge a credit card
   * @param params
   * @returns {Promise<unknown>}
   */
  chargeCreditCard = async (params) => {
    try {
      const {
        cardnumber, firstname, lastname, description, zip, cardcode,
        email, expirationdate, amount, createprofile
      } = params;

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
      orderDetails.setInvoiceNumber(`INV-`);
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

      if (createprofile) {
        // transactionRequestType.setProfile(new ApiContracts.CustomerPaymentProfileType());
      }

      const customerData = new ApiContracts.CustomerDataType();
      customerData.setEmail(email);

      const createRequest = new ApiContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);

      //pretty print request
      console.log(JSON.stringify(createRequest.getJSON(), null, 2));

      const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

      return new Promise((resolve, reject) => {

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

    } catch (e) {
      throw e;
    }
  }


}

module.exports = ContributionService;
