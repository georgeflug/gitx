'use strict';

const expect = require('must');
const fs = require('mz/fs');
const cucumber = require('cucumber');
const testbed = require('../util/testbed');

cucumber.defineSupportCode(function fileMappings({When, Then}) {

  When('I append the data {string} to the file {string}', function (data, fileName) {
    let resolvedFileName = testbed.resolve(fileName);
    return fs.appendFile(resolvedFileName, data);
  });

  Then('the file {string} contains the data {string}', async function (fileName, contains) {
    const fileContents = await getContents(fileName);
    expect(fileContents).to.contain(contains);
  });

  Then('the file {string} does not contain the data {string}', async function (fileName, notContains) {
    const fileContents = await getContents(fileName);
    expect(fileContents).to.not.contain(notContains);
  });

  async function getContents(fileName) {
    const file = testbed.resolve(fileName);
    return (await fs.readFile(file)).toString();
  }

});
