/* eslint-disable global-require */
const pkg = require('./package.json');

module.exports = ({ file, options, env }) => ({
  parser: 'postcss-comment',

  // The list of plugins for PostCSS
  // https://github.com/postcss/postcss
  plugins: [
    // Transfer @import rule by inlining content, e.g. @import 'normalize.css'
    // https://github.com/postcss/postcss-import
    require('postcss-import')(),

    // add variables support
    // https://github.com/postcss/postcss-simple-vars
    require('postcss-simple-vars')(),

    // Unwraps nested rules like how Sass does it
    // https://github.com/postcss/postcss-nested
    require('postcss-nested')(),

    // https://github.com/postcss/postcss-color-function
    require('postcss-color-function')(),

    // https://github.com/travco/postcss-extend
    require('postcss-extend')(),

    require('postcss-svg')({
      dirs: [options.svg.paths]
    })
  ],
});
