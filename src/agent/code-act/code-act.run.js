require('module-alias/register');
require('dotenv').config();
const completeCodeAct = require('./code-act');

const run = async () => {
  const task = {
    requirement: `List the files in the working directory, find README.md, read it, and output its content`,
    status: 'pending'
  }
  const context = {}
  const r = await completeCodeAct(task, context);
  console.log('result', r);
  process.exit(0);
}

run();