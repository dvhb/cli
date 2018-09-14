'use strict';

const fs = require('fs');
const path = require('path');
const ip = require('ip');
const pkg = require('../../package');

module.exports.isDirectoryExists = function(dir) {
  try {
    const stats = fs.lstatSync(dir);
    if (stats.isDirectory()) {
      return true;
    }
  } finally {
    /* */
  }
  return false;
};

module.exports.isFileExists = function(file) {
  return fs.existsSync(file);
};

module.exports.isGitExists = function(gitDir) {
  return fs.existsSync(path.resolve(gitDir, '.git'));
};

module.exports.getNetworkIp = function() {
  try {
    const ipAddress = ip.address();
    return ipAddress;
  } catch (err) {
    return null;
  }
};

module.exports.getProjectLogo = function() {
  /* eslint-disable */
  return [
    "     _       _     _                _ _",
    "  __| |_   _| |__ | |__         ___| (_)",
    " / _` \\ \\ / / '_ \\| '_ \\ _____ / __| | |",
    "| (_| |\\ V /| | | | |_) |_____| (__| | |",
    " \\__,_| \\_/ |_| |_|_.__/       \\___|_|_|  v" + pkg.version,
  ].join('\n')
  /* eslint-enable */
};
