const Token = require('./utils/token');
const Mine = require('./mine');

class Factory {
  constructor(token, objective, pageLength) {
    this.token = new Token(token);
    this.mine = new Mine(objective, pageLength);
  }

  async start() {
    if (await this.token.check()) return this.mine.start(this.token.token);
    return false;
  }
}

module.exports = Factory;
