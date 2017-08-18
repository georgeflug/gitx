'use strict';

const state = require('../util/state');
const git = require('../util/git');
const globals = require('../util/global-args');

function handleState(argv) {
  if (argv.save === 'save') {
    argv.resolve(saveState());
  } else {
    argv.resolve(loadState());
  }
}

async function saveState() {
  const hasChanges = await state.hasChanges();
  if (!hasChanges) {
    if (!globals.silent) {
      console.log('No uncommitted work found, nothing to save');
    }
    return;
  }
  await state.save();
}


const wipLength = ' WIP on '.length;

// TODO: create custom stash message with custom name, branch, commit
//stash@{0}: WIP on develop: e9c03f95 Merge pull request #521 in PROJ/subproj from feature/TKT-9251-cool-new-feature to develop
//stash@{0}: saved-state:develop:e9c03f95:{custom name here or: Merge pull request #521 in PROJ/subproj from feature/TKT-9251-cool-new-feature to develop
async function loadState() {
  if (await state.hasChanges()) {
    await state.save();

    // sanity check
    if (await state.hasChanges()) {
      console.log('Unable to clear the working tree or index');
      return;
    }
  }

  const stashList = await git.run('stash list', {silent: true});
  const first = stashList.split('\n')[0];

  // TODO: fix this can load the state we just saved
  if (!first) {
    console.log('No state to load');
  }

  const parts = first.split(':');
  const stashId = parts[0].slice(parts[0].indexOf('{') + 1, parts[0].indexOf('}'));
  const branchName = parts[1].slice(wipLength, parts[1].length);
  const commit = parts[2].slice(1, parts[2].indexOf(' ', 2));

  console.log('stashId:', stashId);
  console.log('branchName:', branchName);
  console.log('commit:', commit);

  await git.run(`checkout ${branchName}`);
  await git.run(`reset --hard ${commit}`);
  await git.run(`stash pop --index ${stashId}`);
}

module.exports = {
  command: 'state <save|load>',
  describe: 'Checkout [branch] and pull the latest changes',
  handler: handleState
};
