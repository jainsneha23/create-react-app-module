import argv from 'minimist';
import createApp from './create';

/**
 * Arguments:
 *  appName the name of the app
 *   --verbose - to print logs while init
 */
const commands = argv(process.argv.slice(2))._;
if (commands.length === 0) {
  console.error(
    'Usage: create-react-app <project-directory> [--verbose]'
  );
  process.exit(0);
}

createApp(commands[0]);
