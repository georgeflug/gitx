#!/usr/bin/env node

'use strict';

const gitx = require('./gitx');

gitx
  .run(process.argv.slice(2))
  .catch(function (ex) {
    console.log(ex);
  });
