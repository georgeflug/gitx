'use strict';

const cucumber = require('cucumber');
const variables = require('../util/variables');

cucumber.defineSupportCode(function fileMappings({Given}) {

  Given('I save the data {string} to variable {string}', function (data, variable) {
    variables.store(variable, data);
  });

});
