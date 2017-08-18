'use strict';

const fs = require('mz/fs');
const path = require('path');
const process = require('mz/child_process');
const promisify = require('es6-promisify');
const rimraf = promisify(require('rimraf'));

const config = require('./config');
const execOpts = require('./exec-opts');
const globals = require('../../src/util/global-args');
const gitx = require('../../src/gitx');

async function initRepos() {
  setCwd('');
  await eraseRepos();
  await exec('git init --bare origin.git');
  await exec('git clone origin.git local1');

  setCwd('local1');
  await addFile('firstfile', 'First file contents');
  await exec('git add firstfile');
  await exec('git commit -m "First file"');
  await exec('git push');

  setCwd('');
  await exec('git clone origin.git local2');

  setCwd('local1');
}

async function eraseRepos() {
  await rimraf(config.repoRoot);
  await fs.mkdir(config.repoRoot);
}

async function initFiles(files) {
  setCwd('local1');
  for (const file of files) {
    await addFile(file, 'Initial contents');
  }
  await exec('git commit -m "Init Files"');
  await exec('git push');

  setCwd('local2');
  await exec('git pull');

  setCwd('local1');
}

async function addFile(file, data) {
  await fs.writeFile(resolve(file), data);
  await exec('git add ' + file);
}

async function exec(cmd) {
  if (globals.verbose) {
    console.log('exec:', cmd, ';;cwd:', globals.execOpts.cwd);
  }
  const results = await process.exec(cmd, globals.execOpts);

  if (globals.verbose) {
    console.log('exec results:', results);
  }
  return results.join('\n').trim();
}

function runGitX(cmd) {
  return gitx.run(cmd.split(' '));
}

function setCwd(newCwd) {
  globals.execOpts = execOpts.cwd(newCwd);
}

function resolve(file) {
  return path.resolve(globals.execOpts.cwd, file);
}

module.exports = {
  cleanup: eraseRepos,
  exec: exec,
  init: initRepos,
  initFiles: initFiles,
  resolve: resolve,
  setCwd: setCwd,
  gitx: runGitX
};
