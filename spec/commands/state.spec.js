'use strict';

const expect = require('must');
const fs = require('mz/fs');

const testbed = require('../spec-util/testbed');
const state = require('../../src/commands/state');

describe('state', function runTests() {

  beforeEach(async function () {
    await testbed.init();
    await testbed.initFiles(['file1']);
  });

  it('should do nothing when no changes are present', async function () {
    await testbed.gitx('state save');
    await testbed.exec('git status');
    const stashes = await testbed.exec('git stash list');
    expect(stashes).to.be.empty();
  });

  it('should save/load staged files', async function () {
    await testbed.exec('git status');
    await fs.appendFile(testbed.resolve('file1'), 'new line');
    await fs.writeFile(testbed.resolve('newfile'), 'data');

    await testbed.exec('git add file1');
    await testbed.exec('git add newfile');

    await testbed.gitx('state save');
    const changes = await testbed.exec('git status');
    expect(changes).to.contain('nothing to commit');
    expect(changes).to.contain('working tree clean');
  });
});
