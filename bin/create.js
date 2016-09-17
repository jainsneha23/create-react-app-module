'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _nodeFsExtra = require('node-fs-extra');

var _nodeFsExtra2 = _interopRequireDefault(_nodeFsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _crossSpawn = require('cross-spawn');

var _crossSpawn2 = _interopRequireDefault(_crossSpawn);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _pathExists = require('path-exists');

var _pathExists2 = _interopRequireDefault(_pathExists);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isSafeToCreateProjectIn = function isSafeToCreateProjectIn(root) {
  var validFiles = ['.DS_Store', 'Thumbs.db', '.git', '.gitignore', 'README.md', 'LICENSE'];
  return _fs2.default.readdirSync(root).every(function (file) {
    return validFiles.indexOf(file) >= 0;
  });
};

var checkAppName = function checkAppName(appName) {
  var packageJsonPath = _path2.default.resolve(process.cwd(), 'package.json');
  var packageJson = require(packageJsonPath);
  var dependencies = packageJson.dependencies || {};
  var devDependencies = packageJson.devDependencies || {};
  var allDependencies = Object.keys(dependencies).concat(Object.keys(devDependencies)).sort();

  if (allDependencies.indexOf(appName) >= 0) {
    console.error(_chalk2.default.red('Can\'t use \'' + appName + '\' as the app name because a dependency with the same name exists.\n\n' + ('Following names ' + _chalk2.default.red.bold('must not') + ' be used:\n\n')) + _chalk2.default.cyan(allDependencies.map(function (depName) {
      return '  ' + depName;
    }).join('\n')));
    process.exit(1);
  }
};

var checkNodeVersion = function checkNodeVersion(root) {
  var packageJsonPath = _path2.default.resolve(root, 'package.json');
  var packageJson = require(packageJsonPath);
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!_semver2.default.satisfies(process.version, packageJson.engines.node)) {
    console.error(_chalk2.default.red('You are currently running Node %s but create-react-app requires %s.' + ' Please use a supported version of Node.\n'), process.version, packageJson.engines.node);
    process.exit(1);
  }
};

var run = function run(root, appName) {
  var packageJson = require(_path2.default.join(root, 'package.json'));
  packageJson.name = appName;

  _fs2.default.writeFileSync(_path2.default.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));

  process.chdir(root);

  console.log('Installing packages. This might take a couple minutes.');
  console.log('Installing react-scripts from npm...');
  console.log();

  var args = ['install'];
  var proc = (0, _crossSpawn2.default)('npm', args, { stdio: 'inherit' });
  proc.on('close', function (code) {
    if (code !== 0) {
      console.error(_chalk2.default.red('npm ' + args.join(' ') + ' failed'));
      return;
    } else {
      console.log(_chalk2.default.green('Component ' + appName + ' created successfully'));
    }
  });
};

var createApp = function createApp(name) {
  var root = _path2.default.resolve(name);
  var appName = _path2.default.basename(root);

  checkAppName(appName);

  if (!_pathExists2.default.sync(name)) {
    _fs2.default.mkdirSync(root);
  } else if (!isSafeToCreateProjectIn(root)) {
    console.log(_chalk2.default.red('The directory `' + name + '` contains file(s) that could conflict. Aborting.'));
    process.exit(1);
  }

  checkNodeVersion(root);

  console.log(_chalk2.default.green('Creating a new React app in ' + root + '.'));

  _nodeFsExtra2.default.copy(_path2.default.join(__dirname, '../template'), root, function (err) {
    if (err) return console.error(err);
    console.log('Files copied!');
    run(root, appName);
  });
};

exports.default = createApp;