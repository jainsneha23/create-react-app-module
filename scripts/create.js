import fs from 'fs';
import fse from 'node-fs-extra';
import path from 'path';
import spawn from 'cross-spawn';
import chalk from 'chalk';
import semver from 'semver';
import pathExists from 'path-exists';
import argv from 'minimist';

const isSafeToCreateProjectIn = (root) => {
  const validFiles = [
    '.DS_Store', 'Thumbs.db', '.git', '.gitignore', 'README.md', 'LICENSE'
  ];
  return fs.readdirSync(root)
    .every(function(file) {
      return validFiles.indexOf(file) >= 0;
    });
};

const checkAppName = (appName) => {
  const packageJsonPath = path.resolve(
    __dirname,
    '../template/package.json'
  );
  const packageJson = require(packageJsonPath);
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  var allDependencies = Object.keys(dependencies).concat(Object.keys(devDependencies)).sort();

  if (allDependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        `Can't use '${appName}' as the app name because a dependency with the same name exists.\n\n` +
        `Following names ${chalk.red.bold('must not')} be used:\n\n`
      ) +
      chalk.cyan(
        allDependencies.map(depName => `  ${depName}`).join('\n')
      )
    );
    process.exit(1);
  }
};

const checkNodeVersion = () => {
  const packageJsonPath = path.resolve(
    __dirname,
    '../template/package.json'
  );
  const packageJson = require(packageJsonPath);
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      chalk.red(
        'You are currently running Node %s but create-react-app requires %s.' +
        ' Please use a supported version of Node.\n'
      ),
      process.version,
      packageJson.engines.node
    );
    process.exit(1);
  }
};

const run = (root, appName) => {
  const packageJson = require(path.join(root, 'package.json'));
  packageJson.name = appName;

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  process.chdir(root);

  console.log('Installing packages. This might take a couple minutes.');
  console.log('Installing react-scripts from npm...');
  console.log();

  const args = ['install'];
  const proc = spawn('npm', args, { stdio: 'inherit' });
  proc.on('close', function(code) {
    if (code !== 0) {
      console.error(chalk.red(`npm ${args.join(' ')} failed`));
      process.exit(1);
    } else {
      console.log(chalk.green(`Component ${appName} created successfully`));
    }
  });
};

const createApp = (name) => {
  var root = path.resolve(name);
  var appName = path.basename(root);

  checkAppName(appName);

  if (!pathExists.sync(name)) {
    fs.mkdirSync(root);
  } else if (!isSafeToCreateProjectIn(root)) {
    console.log(chalk.red('The directory `' + name + '` contains file(s) that could conflict. Aborting.'));
    process.exit(1);
  }

  checkNodeVersion(root);

  console.log(chalk.green(
    `Creating a new React app in ${root}.`
  ));

  fse.copy(path.join(__dirname, '../template'), root, function (err) {
    fse.copySync(path.join(root, '/gitignore.txt'),
      path.join(root, '/.gitignore'));
    fse.removeSync(path.join(root, '/gitignore.txt'));
    fse.copySync(path.join(root, '/npmignore.txt'),
      path.join(root, '/.npmignore'));
    fse.removeSync(path.join(root, '/npmignore.txt'));
    if (err) return console.error(err);
    console.log(chalk.blue('Files copied!'));
    run(root, appName);
  });
};

const commands = argv(process.argv.slice(2))._;
if (commands.length < 1) {
  console.log(chalk.red(
    'Usage: create-react-app create <project-directory>'
  ));
  process.exit(0);
}
createApp(commands[0]);
