'use strict';

const git = require('../util/git');

async function checkPull(argv) {
  await git.run(`checkout ${argv.branch}`);
  await git.run('pull');
}

module.exports = {
  command: 'checkPull <branch>',
  aliases: ['checkpull', 'check-pull'],
  describe: 'Checkout [branch] and pull the latest changes',
  handler: checkPull
};
