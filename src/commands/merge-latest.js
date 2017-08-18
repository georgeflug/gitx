'use strict';

const git = require('../util/git');

async function mergeLatest(argv) {
  await git.run('fetch');
  await git.run(`merge origin/${argv.branch}`);
}

module.exports = {
  command: 'mergeLatest <branch>',
  aliases: ['mergelatest', 'merge-latest'],
  describe: 'Pull the latest [branch] and merge it into the current branch',
  handler: mergeLatest
};
