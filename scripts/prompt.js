import readline from 'readline';

const Ask = (question, callback) => {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout});
  rl.question(question + '\n', function(answer) {
    rl.close();
    callback(answer);
  });
};

export default Ask;
