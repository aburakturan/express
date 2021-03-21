var crypto = require('crypto');

module.exports = {
  WALLETID: crypto.createHash('md5').update(new Date().toISOString().match(/(\d{2}:){2}\d{2}/)[0]).digest('hex')
};

  