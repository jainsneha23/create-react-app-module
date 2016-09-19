import fs from 'fs';
import fse from 'node-fs-extra';
import path from 'path';
import spawn from 'cross-spawn';
import chalk from 'chalk';
import semver from 'semver';
import pathExists from 'path-exists';
import argv from 'minimist';
import Ask from './prompt';

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

const copyFiles = (root, appName) => {
  console.log(chalk.green(
    `Updating React app ${root}.`
  ));

  fse.copy(path.join(__dirname, '../template'), root, (filepath) => {
    return filepath.match(/\/src\//ig) ? false:true;
  },function (err) {
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

const updateApp = (name) => {
  var root = path.resolve(name);
  var appName = path.basename(root);

  if (!pathExists.sync(name)) {
    console.log(`Component ${name} not found. Please create.`);
  } else {
    Ask(`This will overwrite all files other than src.
      Please backup before continuing.
      Continue? (y|n)`, function(answer) {
      if(answer.match(/^y$/i)) {
        checkNodeVersion(root);
        copyFiles(root, appName);
      } else {
        console.log(chalk.blue('Aborted!!!'));
        process.exit(1);
      }
    });
  }
};

const commands = argv(process.argv.slice(2))._;
if (commands.length < 1) {
  console.log(chalk.red(
    'Usage: create-react-app update <project-directory>'
  ));
  process.exit(0);
}
updateApp(commands[0]);
