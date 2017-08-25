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
  const stashList = await git.run('stash list', {silent: true});
  const stashToLoad = stashList.split('\n')[0];

  if (!stashToLoad) {
    console.log('No state to load');
    return;
  }

  const parts = stashToLoad.split(':');
  const branchName = parts[1].slice(wipLength, parts[1].length);
  const commit = parts[2].slice(1, parts[2].indexOf(' ', 2));

  if (await state.isAheadOfRemote()) {
    const currentBranch = await state.currentBranchName();
    if (currentBranch === branchName) {
      console.log('Changing states will cause dangling commits on the current branch.' +
        '\nPush your changes to the remote first.');
      return;
    }
  }

  let whichStash = '0';

  if (await state.hasChanges()) {
    await state.save();
    whichStash = '1';

    // sanity check
    if (await state.hasChanges()) {
      console.log('Unable to clear the working tree or index');
      return;
    }
  }

  if (branchName === '(no branch)') {
    await git.run(`checkout ${commit}`);
  } else {
    await git.run(`checkout ${branchName}`);
    await git.run(`reset --hard ${commit}`);
  }
  await git.run(`stash pop --index ${whichStash}`);
}

module.exports = {
  command: 'state <save|load>',
  describe: 'Reliably stash/unstash changes',
  handler: handleState
};
