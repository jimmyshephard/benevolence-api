const ContributionController = require('./contribution.controller');
const {validateRequest} = require('../validators/request.validator');
const {Router} = require('express');
const contributionController = new ContributionController();
const {body} = require('express-validator');
const router = new Router();

router.post(
  '/charge-credit-card',
  body('cardnumber').isLength({min: 13}).trim(),
  body('firstname').not().isEmpty().trim(),
  body('lastname').not().isEmpty().trim(),
  body('description').isLength({min: 5}),
  body('zip').isNumeric().isLength({min: 5}),
  body('cardcode').isNumeric().isLength({min: 3}),
  body('expirationdate').not().isEmpty().trim(),
  body('amount').not().isEmpty().isNumeric(),
  validateRequest,
  contributionController.chargeCreditCard,
);

router.get('/contributions', contributionController.contributions)


module.exports = router;
