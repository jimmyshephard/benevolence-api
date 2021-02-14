const ContributionService = require('./contribution.service');
const mockSuccessResult = require('./mock.success');

class ContributionController {

  constructor(contributionService) {
    this.contributionService = contributionService || new ContributionService();
  }

  chargeCreditCard = async (req, res) => {
    try {
      console.log(`Processing contribution request for ${req.body.email}`);
      // const result = await this.contributionService.chargeCreditCard(req.body);
      return res.json(mockSuccessResult);
    } catch (e) {
      console.error(e);
      return res.status(500).
          json({
            status: 'Failed',
            message: 'Error making credit card contribution',
          });
    }
  };
}

module.exports = ContributionController;
