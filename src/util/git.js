'use strict';

const exec = require('child_process').exec;
const globals = require('./global-args');

const readOnlyCommands = [
  'diff',
  'grep',
  'log',
  'shortlog',
  'show',
  'stash list',
  'status'
];

const stack = [];

async function runGit(gitArgs, opts = {}) {
  stack.push(gitArgs);

  if (globals.verbose || globals.dry) {
    console.log('git ' + gitArgs);
  }

  if (globals.dry) {
    if (isCmdUnsafeForDry(gitArgs)) {
      return '';
    }
  }

  const execOpts = Object.assign({}, globals.execOpts, opts.execOpts);
  const stdout = await execGit(gitArgs, execOpts);

  if (!opts.silent && !globals.silent) {
    console.log(stdout);
  }

  return stdout;
}

function isCmdUnsafeForDry(gitArgs) {
  const argsLower = gitArgs.toLowerCase();
  return readOnlyCommands.every((cmd) => {
    return !argsLower.startsWith(cmd);
  });
}

function execGit(gitArgs, execOpts) {
  return new Promise((resolve, reject) => {
    exec('git ' + gitArgs, execOpts, (err, stdout, stderr) => {
      if (!err) {
        resolve(stdout.trim());
      } else {
        console.log();
        console.log('Failed to run command. Here\'s what we were doing:');
        for (let i = 0; i < stack.length; i++) {
          console.log('  git ' + stack[i]);
        }
        reject(err);
      }
    });
  });
}

module.exports = {
  run: runGit,
};
