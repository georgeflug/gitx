'use strict';

const testbed = require('./spec-util/testbed');
const globals = require('../src/util/global-args');

afterAll(function () {
  return testbed.cleanup();
});

globals.verbose = false;
globals.silent = true;
