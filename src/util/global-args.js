'use strict';

const internals = {
  load: loadGlobals,
  dry: false
};

function loadGlobals(yargs) {
  yargs = yargs.option('dry', {
    alias: 'd',
    default: false,
    describe: 'Dry run. Prints git commands instead of executing them (some read-only commands may be executed),',
    type: 'boolean'
  });

  Object.assign(internals, yargs.argv);

  return yargs;
}

module.exports = internals;
