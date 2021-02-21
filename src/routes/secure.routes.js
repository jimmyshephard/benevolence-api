require('dotenv').config();
const {Router} = require('express');
const {customerProfileRoutes} = require('../customer-profile');
const {secureContributionRoutes} = require('../contribution');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const jwt_decode = require('jwt-decode');
const {JWKS_URI, AUDIENCE, ISSUER, AUTH_NAMESPACE} = process.env;

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: JWKS_URI
  }),
  audience: AUDIENCE,
  issuer: ISSUER,
  algorithms: ['RS256']
});


const router = new Router();

router.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json('Unauthorized');
  }

  const token = req.headers.authorization.replace('Bearer', '').trim();
  const userInfo = jwt_decode(token);

  req.user_email = userInfo[AUTH_NAMESPACE];
  next();
})

router.use(jwtCheck);
router.use('/customer-profile', customerProfileRoutes);
router.use('/', secureContributionRoutes);

module.exports = router;
