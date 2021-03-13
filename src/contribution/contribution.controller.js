const ContributionService = require('./contribution.service');

class ContributionController {

  constructor(contributionService) {
    this.contributionService = contributionService || new ContributionService();
  }

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  chargeCreditCard = async (req, res) => {
    try {
      const result = await this.contributionService.chargeCreditCard(req);

      return res.json(result);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: typeof e === 'string' ? e : e.message || 'Error making credit card contribution',
      });
    }
  };

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  getYearOptions = async (req, res) => {
    try {

      const result = await this.contributionService.getYearOptions();

      return res.json(result);

    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: 'Error getting year options',
      });
    }
  }

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  getTxDescriptions = async (req, res) => {
    try {

      const result = await this.contributionService.getTxDescriptions();

      return res.json(result);

    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: 'Error getting tx descriptions',
      });
    }
  }


  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  contributions = async (req, res) => {
    try {
      const contributions = await this.contributionService.getContributions(req.user_email);
      return res.json(contributions);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: typeof e === 'string' ? e : e.message || 'Error making credit card contribution',
      });
    }
  };
}

module.exports = ContributionController;
