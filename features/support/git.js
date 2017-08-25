'use strict';

const expect = require('must');
const cucumber = require('cucumber');
const testbed = require('../util/testbed');
const variables = require('../util/variables');

cucumber.defineSupportCode(function fileMappings({Given, When, Then}) {

  Given('I save the commit hash of the current head to variable {string}', async function (variableName) {
    const commitHash = await getHeadCommitHash();
    variables.store(variableName, commitHash);
  });

  Then('I am on the detached commit {string}', async function (expectedCommitHash) {
    const commitHash = await getHeadCommitHash();
    const expected = variables.interpret(expectedCommitHash);
    expect(commitHash).to.equal(expected);
  });

  When('I add the file {string} to the index', function (fileName) {
    return testbed.exec(`git add ${fileName}`);
  });

  When('I commit my changes', function () {
    let randomMessage = getRandomString();
    return testbed.exec(`git commit -m ${randomMessage}`);
  });

  When('I push my changes', function () {
    return testbed.exec('git push');
  });

  When('I pull the latest changes from the remote', function () {
    return testbed.exec('git pull');
  });

  When('I checkout {string}', function (checkoutTarget) {
    let target = variables.interpret(checkoutTarget);
    return testbed.exec(`git checkout ${target}`);
  });

  When('I reset my changes to the file {string}', function (file) {
    return testbed.exec(`git checkout -- ${file}`);
  });

  Then('No stashes exist', async function () {
    const stashes = await testbed.exec('git stash list');
    expect(stashes).to.be.empty();
  });

  Then('the repo status should contain the text {string}', async function (text) {
    let status = await testbed.exec('git status');
    expect(status).to.contain(text);
  });
});

function getHeadCommitHash() {
  return testbed.exec('git rev-parse --verify HEAD');
}

function getRandomString() {
  return Math.random().toString(36).substring(2);
}