const mysql = require('mysql2');

class MySqlConnector {
  connection = null;

  constructor() {
    if (!MySqlConnector.instance) {
      const min = Math.ceil(1000);
      const max = Math.floor(10000000);
      this.id = Math.floor(Math.random() * (max - min) + min);

      const mySqlConnection = mysql
        .createPool({
          connectionLimit: 5,
          host: process.env.DB_HOST,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          dateStrings: true,
        })
        .promise();
      this.connection = mySqlConnection;
      MySqlConnector.instance = this;
    }
    return MySqlConnector.instance;
  }

  getConnection() {
    console.log(`Database connection id: ${this.getId()}`);
    return this.connection;
  }

  getId() {
    return this.id;
  }
}

module.exports = MySqlConnector;
