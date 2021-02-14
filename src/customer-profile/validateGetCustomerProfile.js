const DatabaseService = require('../db/database.service');
const dbService = new DatabaseService();
const getCustomerProfileQuery = require('./getCustomeProfileQuery');


const validateGetCustomerProfile = async (req, res, next) => {
  try {

    const {email} = req;
    const {customerProfileId} = req.params;
    const result = await dbService.query(getCustomerProfileQuery, [customerProfileId, email]);

    if (!result || !result.length) {
      return res.status(403).json({message: `You don't have permission to perform this action.`});
    }

    next();

  } catch (e) {
    console.error(e);
    next(err);
  }
}

module.exports = validateGetCustomerProfile;

