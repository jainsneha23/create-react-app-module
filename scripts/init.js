#!/usr/bin/env node

import argv from 'minimist';
import spawn from 'cross-spawn';
import chalk from 'chalk';

/**
 * Arguments:
 *  appName the name of the app
 */
const commands = argv(process.argv.slice(2))._;
if (commands.length < 2) {
  console.log(chalk.red(
    'Usage: create-react-app create|update <project-directory>'
  ));
  process.exit(0);
}

const action = commands[0];
const appName = commands[1];

const proc = spawn(
  'node',
  [require.resolve(`./${action}`)].concat(appName),
  { stdio: 'inherit' }
);
proc.on('close', (code) => {
  if (code !== 0) {
    console.error(chalk.red(`create-react-app ${commands.join(' ')} failed`));
    return;
  } else {
    console.log(chalk.green(`create-react-app ${commands.join(' ')} success`));
  }
});
