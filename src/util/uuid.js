const { v4: uuidv4 } = require('uuid');

class uuid {
  generate() {
    return uuidv4();
  }

  random() {
    return Math.floor(Math.random() * 100000);
  }
}

module.exports = new uuid();
