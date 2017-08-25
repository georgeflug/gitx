'use strict';

const vars = {};

function storeVariable(variable, value) {
  vars[variable] = value;
}

function interpretVariable(text) {
  if (isVariable(text)) {
    const parsed = parseVariable(text);
    return vars[parsed];
  }
  return text;
}

function parseVariable(text) {
  // variables take the form: ${variable}
  return text.slice(2, -1);
}

function isVariable(text) {
  return text.startsWith('$');
}

module.exports = {
  store: storeVariable,
  interpret: interpretVariable
};
