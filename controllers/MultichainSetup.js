const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/async');
const { exec, spawn } = require('child_process');

const WindowsSetup = asyncHandler(async(req, res, next) => {
    const multichainScript = exec('multichain-setup.bat');

    multichainScript.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      res.write(`stdout: ${data}`);
    });
  
    multichainScript.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      res.write(`stderr: ${data}`);
    });
  
    multichainScript.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      res.write(`child process exited with code ${code}`);
      res.end();
    })
});

const UnixSetup = asyncHandler(async (req, res, next) => {
    const multichainScript = spawn('bash', ['multichain-setup.sh']);

    multichainScript.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      res.write(`stdout: ${data}`);
    });
  
    multichainScript.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      res.write(`stderr: ${data}`);
    });
  
    multichainScript.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      res.write(`child process exited with code ${code}`);
      res.end();
    });
})

exports.WindowsSetup = WindowsSetup;
exports.UnixSetup = UnixSetup;