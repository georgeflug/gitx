'use strict';

const ansiEscape = '\x1b';
const ansiControl = ansiEscape + '[';

function AnsiBuffer(stream) {
  if (new.target) {
    this.buffer = '';
    this.stream = stream;
  } else {
    return new AnsiBuffer(stream);
  }
}

AnsiBuffer.prototype.add = function (data) {
  this.buffer += data;
  return this;
};

AnsiBuffer.prototype.dump = function () {
  this.stream.write(this.buffer);
  this.buffer = '';
  return this;
};

AnsiBuffer.prototype.moveFarLeft = function () {
  return this.moveLeft(999);
};

AnsiBuffer.prototype.moveNextLine = function () {
  // use '\n' instead of "ansiEscape + 'E'" because
  // the 'E' escape code fails on Windows
  this.buffer += '\n';
  return this;
};

AnsiBuffer.prototype.eraseLastCharacter = function () {
  return this.moveLeft(1).add(' ').moveLeft(1);
};

AnsiBuffer.prototype.moveUp = function (y) {
  this.buffer += ansiControl + y + 'A';
  return this;
};

AnsiBuffer.prototype.moveDown = function (y) {
  this.buffer += ansiControl + y + 'B';
  return this;
};

AnsiBuffer.prototype.moveLeft = function (x) {
  this.buffer += ansiControl + x + 'D';
  return this;
};

AnsiBuffer.prototype.moveRight = function (x) {
  this.buffer += ansiControl + x + 'C';
  return this;
};

AnsiBuffer.prototype.move = function (x, y) {
  if (x !== 0) {
    if (x > 0) this.moveRight(x); else this.moveLeft(-x);
  }
  if (y !== 0) {
    if (y > 0) this.moveDown(y); else this.moveUp(-y);
  }
  return this;
};

AnsiBuffer.prototype.clearRight = function () {
  this.buffer += ansiControl + 'K';
  return this;
};

AnsiBuffer.prototype.clearDown = function () {
  this.buffer += ansiControl + '0J';
  return this;
};

AnsiBuffer.prototype.clearLine = function () {
  this.buffer += ansiControl + '2K';
  return this;
};

AnsiBuffer.prototype.savePosition = function () {
  this.buffer += ansiEscape + '7';
  return this;
};

AnsiBuffer.prototype.restorePosition = function () {
  this.buffer += ansiEscape + '8';
  return this;
};

function hideCursor() {
  this.buffer += ansiControl + '?25l';
  return this;
}

function showCursor() {
  this.buffer += ansiControl + '?25h';
  return this;
}

module.exports = AnsiBuffer;
