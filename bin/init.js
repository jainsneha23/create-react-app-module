'use strict';

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _create = require('./create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Arguments:
 *  appName the name of the app
 *   --verbose - to print logs while init
 */
var commands = (0, _minimist2.default)(process.argv.slice(2))._;
if (commands.length === 0) {
  console.error('Usage: create-react-app <project-directory> [--verbose]');
  process.exit(0);
}

(0, _create2.default)(commands[0]);