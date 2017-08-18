'use strict';

const git = require('../util/git');
const state = require('../util/state');
const fs = require('fs');

const StashedCommitType = {
  Staged: '^2',
  Unstaged: '',
  Untracked: '^3'
};

async function pullLatest(argv) {
  if (await state.hasChanges()) {
    await state.save();
    await git.run('pull');
    try {
      await git.run('stash pop');
    } catch (ex) {
      /* 'stash pop' could fail if the new HEAD has files that were untracked before saving the state.
       * this means you created a new file at the same time someone pushed the same
       * file to the remote. behavior here is not well defined, so work around it as best
       * as we can.
      */
      const unstagedFiles = await getStashedFileList(StashedCommitType.Unstaged);
      const stagedFiles = await getStashedFileList(StashedCommitType.Staged);
      const untrackedFiles = await getStashedFileList(StashedCommitType.Untracked);

      const allFilesLower = unstagedFiles.concat(stagedFiles, untrackedFiles).map((file) => file.toLowerCase());
      const conflicts = untrackedFiles.filter(fs.existsSync);
      const renames = conflicts.map((file) => getRenameForConflict(allFilesLower, file));

      await state.load();

      conflicts.forEach((conflictName, index) => {
        const rename = renames[index];
        fs.renameSync(conflictName, rename);
      });

      await state.save();
      await git.run('pull');
      await git.run('stash pop');

      conflicts.forEach((conflictName, index) => {
        const rename = renames[index];
        // do some merging now....
      });
    }
  } else {
    await git.run('pull');
  }
}

async function getStashedFileList(commitType) {
  return await git.run(`show stash@{0}${commitType} --name-only --format=format:`).split('\n');
}

function getRenameForConflict(allStashedFiles, conflictFile) {
  let i = 0;
  while (true) {
    const rename = conflictFile + '.orig' + (i === 0 ? '' : i);
    if (!fs.existsSync(rename) && allStashedFiles.indexOf(rename.toLowerCase()) === -1) {
      return rename;
    }
  }
}

module.exports = {
  command: 'pullLatest',
  aliases: ['pulllatest', 'pull-latest'],
  describe: 'Pull the latest code into the current branch even if has conflicts with the working changes',
  handler: pullLatest
};
