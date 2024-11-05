// +------------------------------------------------+
// |           REDTETRIS JEST SETUP FILE            |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This file configures Jest to redirect `console.log` 
    output to a file, allowing for easier debugging 
    and logging of test results. By capturing console 
    logs in a file, you can review the output of your 
    tests in a persistent manner, making it easier to 
    trace issues and review test execution details.

    This setup helps in managing and analyzing logs 
    generated during test runs, especially useful for 
    longer test suites or when debugging complex issues.
*/

// +----------------- REQUIREMENTS -----------------+

const fs = require('fs'); 
const path = require('path');

const logFile = path.join(__dirname, 'logs.txt');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// +-------------------- SETUP --------------------+

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation((message) => {
        logStream.write(`${new Date().toISOString()} - ${message}\n`);
    });
});

afterAll(() => {
    console.log.mockRestore();
    logStream.end();
});

global.console = {
  ...console,
  log: jest.fn(),
};