'use strict';

const git = require('../util/git');

async function checkPull(argv) {
  await git.run(`checkout ${argv.branch}`);
  await git.run('pull');
}

module.exports = {
  command: 'checkoutLatest <branch>',
  aliases: ['checkoutlatest', 'checkout-latest'],
  describe: 'Checkout [branch] and pull the latest changes',
  handler: checkPull
};
