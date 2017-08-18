'use strict';

const git = require('../util/git');
const searchList = require('../util/search-list');

async function interactiveCheckout() {
  const branches = await git.run('branch --all --sort=-committerdate', {silent: true});
  const parsedBranches = parseBranches(branches);
  const selection = await searchList.prompt(parsedBranches);
  if (selection) {
    await git.run('checkout ' + selection);
  }
}

function parseBranches(branches) {
  let currentBranch = null;
  const hash = {};
  const list = branches.split('\n').map((branch) => {
    let name = branch.trim();
    if (name.indexOf(' -> ') !== -1) {
      name = name.slice(0, name.indexOf(' -> '));
    }
    if (name.startsWith('*')) {
      currentBranch = name.slice(1).trim();
    }
    if (!name.startsWith('remotes')) {
      hash[name] = true;
    }
    return name;
  }).filter((branch) => {
    if (branch.length === 0) {
      return false;
    }
    if (branch.startsWith('*')) {
      return false;
    }
    if (branch.startsWith('remotes')) {
      const localBranch = branch.slice(branch.indexOf('/', 8) + 1);
      if (hash[localBranch]) {
        return false;
      }
      if (localBranch === currentBranch) {
        return false;
      }
    }
    return true;
  });
  list.unshift(currentBranch);
  return list;
}

module.exports = {
  command: 'checkout',
  describe: 'Interactively choose a branch',
  handler: interactiveCheckout
};
