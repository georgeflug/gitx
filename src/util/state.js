'use strict';

const git = require('./git');

async function hasChanges() {
  return !!(await git.run('status --porcelain', {silent: true}));
}

async function saveState() {
  await git.run('stash -u');
}

async function loadState() {
  await git.run('stash pop 0');
}

module.exports = {
  hasChanges: hasChanges,
  save: saveState,
  load: loadState
};
