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

    // https://github.com/johnwatkins0/postcss-bootstrap-4-grid
    require('postcss-bootstrap-4-grid')({
      gridColumns: 12,
      gridGutterWidth: '24px',
      containerMaxWidths: {
        sm: '540px',
        md: '720px',
        lg: '960px',
        xl: '1140px'
      },
      gridBreakpoints: {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px'
      },
      doOrderClasses: true,
      doOffsetClasses: true
    }),

    require('postcss-svg')({
      dirs: [options.svg.paths]
    })
  ],
});
