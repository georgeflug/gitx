'use strict';

const path = require('path');
const config = require('./config');

function getCwdOpts(cwd = '') {
  return {
    cwd: path.resolve(config.repoRoot, cwd)
  };
}

module.exports = {
  cwd: getCwdOpts
};
