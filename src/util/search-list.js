'use strict';

// TODO:
//   cleanup
//   scrollbar?

const process = require('process');
const readline = require('readline');
const AnsiBuffer = require('./ansi-buffer');

const searchText = 'Search:';
const indicator = '> ';
const maxLength = 15;

let searchString = '';
let list = [];
let filteredList = [];
let selectedIndex = 0;
let topItemIndex = 0;
let buffer = new AnsiBuffer(process.stdout);
let oldTtyIsRaw = false;
let isBusy = false;
let resolve = null;
let filterFunc = defaultFilter;

function prompt(itemList) {
  preventDualCalls();
  list = itemList;
  setupStdin();
  displayInitialList();

  return new Promise((res, rej) => {
    resolve = res;
  });
}

function preventDualCalls() {
  if (isBusy) {
    throw "Search list prompt is already active";
  }
  isBusy = true;
}

function setupStdin() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    oldTtyIsRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
  }
  process.stdin.on('keypress', keypressListener);
  process.stdin.resume();
}

function displayInitialList() {
  buffer.add(searchText + ' ');
  filteredList = list;
  printList();
  buffer.dump();
}

function keypressListener(str, key) {
  if (key.ctrl && key.name === 'c') {
    hardExit();

  } else if (key.name === 'escape') {
    softExit();

  } else if (key.name === 'backspace') {
    typeBackspace();

  } else if (key.name === 'up') {
    arrowUp();

  } else if (key.name === 'down') {
    arrowDown();

  } else if (key.name === 'return') {
    softExit(filteredList[selectedIndex]);

  } else if (str) {
    typeCharacter(str);
  }
}

function typeCharacter(str) {
  searchString += str;
  selectedIndex = 0;
  topItemIndex = 0;
  filteredList = filterFunc(filteredList, searchString);
  buffer.add(str);
  printList();
  buffer.dump();
}

function typeBackspace() {
  if (searchString.length > 0) {
    searchString = searchString.slice(0, -1);
    buffer.eraseLastCharacter();
  }
  filteredList = filterFunc(list, searchString);
  printList();
  buffer.dump();
}

function arrowUp() {
  if (selectedIndex > 0) {
    selectedIndex--;
    redrawIndicator(-1);
  } else if (topItemIndex > 0) {
    topItemIndex--;
    printList();
    buffer.dump();
  }
}

function arrowDown() {
  if (selectedIndex < filteredList.length - 1 && selectedIndex < maxLength - 1) {
    selectedIndex++;
    redrawIndicator(1);
  } else if (topItemIndex < filteredList.length - maxLength) {
    topItemIndex++;
    printList();
    buffer.dump();
  }
}

function defaultFilter(source, query) {
  const querySplit = query.toLowerCase().split(' ');
  return source.filter((item) => {
    return querySplit.every((q) => item.toLowerCase().indexOf(q) !== -1);
  });
}

function printList() {
  buffer.moveNextLine()
    .clearDown();

  const max = Math.min(filteredList.length - topItemIndex, maxLength);
  for (let i = 0; i < max; i++) {
    const prefix = (i === selectedIndex) ? indicator : '  ';
    buffer.add(prefix + filteredList[i + topItemIndex] + '\n');
  }

  buffer.move(searchText.length + searchString.length + 1, -1 - max);
}

function redrawIndicator(direction) {
  buffer
    .savePosition()
    .moveDown(selectedIndex - direction + 1)
    .moveFarLeft()
    .add(' ')
    .move(0, direction)
    .moveFarLeft()
    .add(indicator)
    .restorePosition()
    .dump();
}

function hardExit() {
  quit();
  process.exit();
}

function softExit(result) {
  quit();
  resolve(result);
}

function quit() {
  buffer
    .clearDown()
    .clearLine()
    .moveFarLeft()
    .dump();
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(oldTtyIsRaw);
  }
  process.stdin.pause();
  process.stdin.removeListener('keypress', keypressListener);
  isBusy = false;
}

module.exports = {
  prompt: prompt
};
