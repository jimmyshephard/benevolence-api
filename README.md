API for Benevolence Fund Application
=============================== 

## Background

This API supports payments made to authorize.net on behalf of members of Neema Gospel Church. The API is used by the Benevolence UI application to facilitate payments to the benevolent fund. The UI for this application is a single page application that is hosted at the same location as the API.
The current host for this application is FastComet www.fastcomet.com 

## Architecture
- Database - MySQL 8.0
- Backend - Node.js 18.16.0, Express
- UI - Angular 10
- Authorization - Auth0

## Development

Environment variables required for development and production:

- API_LOGIN
- TRANSACTION_KEY
- API_ENVIRONMENT
- DATABASE_URL
- DB_HOST
- DB_PORT
- DB_DATABASE
- DB_USERNAME
- DB_PASSWORD
- JWKS_URI
- AUDIENCE
- ISSUER
- AUTH_NAMESPACE


Starting the application

`npm run start` - starts the application in development mode
