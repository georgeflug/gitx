'use strict';

let yargs = require('yargs');
const YargsPromise = require('yargs-promise');

const aliases = require('./aliases');
const globals = require('./util/global-args');
const cmdDir = './commands';

yargs = globals.load(yargs);
yargs = aliases.load(yargs);
yargs = yargs.commandDir(cmdDir);
yargs = yargs.help();
yargs = new YargsPromise(yargs);

module.exports = {
  run: function (args) {
    return yargs.parse(args);
  }
};
