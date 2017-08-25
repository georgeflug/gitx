'use strict';

const fs = require('mz/fs');
const cucumber = require('cucumber');
const testbed = require('../util/testbed');

cucumber.defineSupportCode(function fileMappings({When}) {

  When('I call {string}', function (command) {
    return testbed.gitx(command);
  });

});
