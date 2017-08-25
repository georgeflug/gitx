'use strict';

const cucumber = require('cucumber');
const testbed = require('../util/testbed');
const globals = require('../../src/util/global-args');
const git = require('../../src/util/git');

cucumber.defineSupportCode(function ({AfterAll, Before, BeforeAll}) {

  Before(async function () {
    git.reset();
    await testbed.init();
    await testbed.initFiles(['file1', 'file2']);
  });

  BeforeAll(function () {
    globals.verbose = false;
    globals.silent = true;
  });

  AfterAll(function () {
    return testbed.cleanup();
  });
});
