'use strict';

const git = require('./util/git');

// one-line git commands belong in this file instead of in their own file
const aliases = [
  {
    command: 'branch-recent',
    describe: 'List branches in order of most recent',
    alias: 'branch --sort=committerdate'
  },
  {
    command: 'undo',
    describe: 'Undo the last commit',
    alias: 'reset --soft HEAD~1'
  }
];

function loadAliases(yargs, aliasList) {
  aliasList = aliasList || aliases;
  aliasList.forEach((alias) => {
    yargs = yargs.command({
      command: alias.command,
      des: alias.describe,
      handler: () => git.run(alias.alias)
    })
  });
  return yargs;
}

module.exports = {
  load: loadAliases
};
