'use strict';

const git = require('./git');

async function hasChanges() {
  return !!(await git.run('status --porcelain', {silent: true}));
}

async function isAheadOfRemote() {
  const status = await git.run('status --short --branch', {silent: true});
  return status.indexOf('[ahead') !== -1;
}

function getCurrentBranchName() {
  return git.run('rev-parse --abbrev-ref HEAD', {silent: true});
}

async function saveState() {
  await git.run('stash -u');
}

async function loadState() {
  await git.run('stash pop 0');
}

module.exports = {
  currentBranchName: getCurrentBranchName,
  hasChanges: hasChanges,
  isAheadOfRemote: isAheadOfRemote,
  save: saveState,
  load: loadState
};
