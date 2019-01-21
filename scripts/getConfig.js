'use strict';

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const findup = require('findup');
const semverUtils = require('semver-utils');
const prettyjson = require('prettyjson');
const merge = require('lodash/merge');
const isFinite = require('lodash/isFinite');
const isUndefined = require('lodash/isUndefined');
const utils = require('./utils/utils');
const consts = require('./consts');
const DvhbWebpackError = require('./utils/error');

const CONFIG_FILENAME = 'dvhb.config.js';
const DEFAULT_CONFIG = {
  title: 'Dvhb Webpack Starter kit',
  extendEntries: null,
  sourceDir: 'src',
  assetsDir: null,
  svgSpriteDir: 'src/assets/svg-sprite',
  svgInlineDir: 'src/assets/svg-inline',
  distDir: 'dist',
  publicPath: '/',
  viewsDir: 'src/views',
  spa: false,
  staticSite: false,
  serverHost: 'localhost',
  serverHostNetwork: null,
  serverPort: 3000,
  verbose: false,
  extendWebpackConfig: null,
  eslintrc: '.eslintrc',
  babelrc: undefined,
  modernizrrc: 'src/.modernizrrc',
  postcssrc: '.postcssrc.js',
  templateVars: {},
  gzip: {
    src: '**/*.{html,xml,json,css,js,js.map,css.map}',
    options: {},
  },
  appEnv: null, // experimental option
};
const DEPENDENCIES = [
  {
    package: '@babel/core',
    name: 'Babel',
    from: 6,
    to: 7,
  },
  {
    package: 'webpack',
    name: 'Webpack',
    from: 2,
    to: 3,
  },
];

/**
 * Read, parse and validate config file or passed config.
 *
 * @param {object} [options] CLI options (e.g. {verbose: true} or {config: 'filename'}) or all config options.
 * @returns {object}
 */
function getConfig(options) {
  options = options || {};

  let configFilepath;
  let config;

  // Read config options from a file
  configFilepath = findConfig(options.config);
  config = require(configFilepath);

  validateConfig(config);

  const configDir = configFilepath ? path.dirname(configFilepath) : process.cwd();

  validateDependencies(configDir);

  let assetsDir = null;
  if (typeof config.assetsDir === 'string') {
    assetsDir = path.resolve(configDir, config.assetsDir);
    if (!utils.isDirectoryExists(assetsDir)) {
      throw new DvhbWebpackError('DvhbWebpack: "assetsDir" directory not found: ' + assetsDir);
    }
  }
  if (Array.isArray(config.assetsDir)) {
    assetsDir = [];
    config.assetsDir.forEach(function(dir) {
      assetsDir.push(path.resolve(configDir, dir));
    });
  }

  config = merge({}, DEFAULT_CONFIG, config);
  config = merge({}, config, {
    appEnv: options['app-env'],
    env: options.env || 'development',
    verbose: !!options.verbose,
    sourceDir: path.resolve(configDir, config.sourceDir),
    distDir: path.resolve(configDir, config.distDir),
    viewsDir: path.resolve(configDir, config.viewsDir),
    svgSpriteDir: path.resolve(configDir, config.svgSpriteDir),
    svgInlineDir: path.resolve(configDir, config.svgInlineDir),
    assetsDir: assetsDir,
    modernizrrc: path.resolve(configDir, config.modernizrrc),
    configDir,
  });

  if (options.port) {
    config.serverPort = options.port;
  }

  config.serverHostNetwork = utils.getNetworkIp();

  if (fs.existsSync(path.resolve(configDir, config.eslintrc))) {
    config.eslintrc = path.resolve(configDir, config.eslintrc);
  } else {
    config.eslintrc = path.resolve(__dirname, '..', DEFAULT_CONFIG.eslintrc);
  }

  if (fs.existsSync(path.resolve(configDir, config.postcssrc))) {
    config.postcssrc = path.resolve(configDir, config.postcssrc);
  } else {
    config.postcssrc = path.resolve(__dirname, '..', DEFAULT_CONFIG.postcssrc);
  }

  if (fs.existsSync(path.resolve(configDir, config.prettierrc))) {
    config.prettierrc = path.resolve(configDir, config.prettierrc);
  } else {
    config.prettierrc = path.resolve(__dirname, '..', DEFAULT_CONFIG.prettierrc);
  }

  if (fs.existsSync(path.resolve(configDir, config.stylelintrc))) {
    config.stylelintrc = path.resolve(configDir, config.stylelintrc);
  } else {
    config.stylelintrc = path.resolve(__dirname, '..', DEFAULT_CONFIG.stylelintrc);
  }

  if (fs.existsSync(path.resolve(configDir, config.stylelintrcFormat))) {
    config.stylelintrcFormat = path.resolve(configDir, config.stylelintrcFormat);
  } else {
    config.stylelintrcFormat = path.resolve(__dirname, '..', DEFAULT_CONFIG.stylelintrcFormat);
  }

  let babelrcPath = path.resolve(configDir, '.babelrc');
  if (fs.existsSync(babelrcPath)) {
    config.babelrc = babelrcPath;
  }

  if (config.verbose) {
    console.log();
    console.log('Using config file:', configFilepath);
    console.log(prettyjson.render(config));
    console.log();
  }

  return config;
}

/**
 * Find config file: use file specified in the command line or try to find up the file tree.
 *
 * @param {Object} [file] File name.
 * @return {string} Config absolute file path.
 */
function findConfig(file) {
  if (file) {
    // Custom config location

    const configFilepath = file[0] === '/' || file.match(/^[A-Z]:/) ? file : path.resolve(process.cwd(), file);
    if (!fs.existsSync(configFilepath)) {
      throw new DvhbWebpackError('DvhbWebpack config not found: ' + configFilepath + '.');
    }

    return configFilepath;
  }

  // Search config file in all parent directories

  let configDir;
  try {
    configDir = findup.sync(__dirname, CONFIG_FILENAME);
  } catch (exception) {
    throw new DvhbWebpackError('DvhbWebpack config not found: ' + CONFIG_FILENAME + '.');
  }

  return path.join(configDir, CONFIG_FILENAME);
}

/**
 * Validate config.
 *
 * @param {Object} config Config options.
 */
function validateConfig(config) {
  if (config.extendWebpackConfig && typeof config.extendWebpackConfig !== 'function') {
    throw new DvhbWebpackError('DvhbWebpack: "extendWebpackConfig" option must be a function.');
  }
}

/**
 * Validate project’s Babel and Webpack versions.
 *
 * @param {string} configDir Config file directory.
 */
function validateDependencies(configDir) {
  const packageJsonPath = path.join(findup.sync(configDir, 'package.json'), 'package.json');
  const packageJson = require(packageJsonPath);
  DEPENDENCIES.forEach(validateDependency.bind(null, packageJson));
}

/**
 * Check versions of a project dependency.
 *
 * @param {Object} packageJson package.json.
 * @param {Object} dependency Dependency details.
 */
function validateDependency(packageJson, dependency) {
  const version = findDependency(dependency.package, packageJson);
  if (!version) {
    return;
  }

  let major;
  try {
    major = semverUtils.parseRange(version)[0].major;
  } catch (exception) {
    console.log('DvhbWebpack: cannot parse ' + dependency.name + ' version which is "' + version + '".');
    console.log('DvhbWebpack might not work properly. Please report this issue at ' + consts.BUGS_URL);
    console.log();
  }

  if (major < dependency.from) {
    throw new DvhbWebpackError(
      'DvhbWebpack: ' +
        dependency.name +
        ' ' +
        dependency.from +
        ' is required, ' +
        'you are using version ' +
        major +
        '.',
    );
  } else if (major > dependency.to) {
    console.log(
      'DvhbWebpack: ' +
        dependency.name +
        ' is supported up to version ' +
        dependency.to +
        ', ' +
        'you are using version ' +
        major +
        '.',
    );
    console.log('DvhbWebpack might not work properly, report bugs at ' + consts.BUGS_URL);
    console.log();
  }
}

/**
 * Find package in project’s dependencies or devDependencies.
 *
 * @param {string} name Package name.
 * @param {Object} packageJson package.json.
 * @returns {string}
 */
function findDependency(name, packageJson) {
  if (packageJson.dependencies && packageJson.dependencies[name]) {
    return packageJson.dependencies[name];
  }
  if (packageJson.devDependencies && packageJson.devDependencies[name]) {
    return packageJson.devDependencies[name];
  }
  return null;
}

module.exports = getConfig;
