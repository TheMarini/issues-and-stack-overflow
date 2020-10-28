const Token = require('./utils/token');
const Mine = require('./mine');

class Factory {
  constructor(token, objective, language) {
    this.token = new Token(token);
    this.mine = new Mine(objective, language);
  }

  async start() {
    if (await this.token.check()) return this.mine.start(this.token.token);
    return false;
  }
}

module.exports = Factory;
