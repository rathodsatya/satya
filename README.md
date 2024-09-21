# Setup and running
### Recommended prerequisites: 

- Node.js v12

- Java Version 8 or above

### To execute tests you should do the following steps:

1.In the terminal window execute ``npm install`` command.

2.Install cross-env package globally, command: ``npm i cross-env -g``

3.Install allure commandline globally, command: ``npm install -g allure-commandline``

4.Copy .env to the root of project directory with correct credentials.

5.You can export the following variables or define it in the .env file:

- HEADLESS (boolean), e.g. ``HEADLESS=false`` - for running Google Chrome browser in the headless mode. ``false`` by default.
- TESTRAIL_RUN (boolean), e.g. ``TESTRAIL_RUN=true`` -  for creating test run in the testRail. ``false`` by default.

6.Execute the following command ``npm run tests`` for run all test scenarios.

7.For run specific test suite execute ``npm run {suite name}`` command, e.g:

``npm run dashboardTests``

or use following to run specific file

``wdio wdio.conf.js --spec ./specs/LANDING/landingPage.spec.ts``

8.Test results will be displayed in html format in ``artifacts/allure-report`` folder.

Execute ``npm run openReport`` command to generate and open a report.
   
### Installing allure commandline:

Allure requires Java 8 or higher

npm install -g allure-commandline

Linux:

- ``sudo apt-add-repository ppa:qameta/allure``
- ``sudo apt-get update`` 
- ``sudo apt-get install allure``

Mac OS X:

- ``brew install allure``

For getting more information please visit https://docs.qameta.io/allure/

### Useful commands from written helpers:
Find missing cases that are not marked as automated in testRail:

- ``node -e "require('./helpers/scenariosHelper').findMissingIds()"``

Get total count of tests:

- ``node -e "require('./helpers/scenariosHelper').getCountOfScenarios()"``

Remove old test runs:

- ``node -e "require('./helpers/scenariosHelper').deleteOldTestRuns()"``

Find duplicated test case ids:

- ``node -e "require('./helpers/scenariosHelper').getDupsScenarios()"``

-------
Fundamentals are:
- [TypeScript](https://www.typescriptlang.org/docs/tutorial.html) - as project language
- [Webdriver i/o](https://webdriver.io/) - as browser control framework
- [MochaJS](https://mochajs.org/) - as test runner
- [Chai](https://www.chaijs.com/) - as assertion library

# Useful Scripts

### All successful test cases in Test Rail

```
var casesTabOne = [];
document.querySelectorAll('tr.row').forEach(row => {
  var status = row.querySelector('.js-status a').innerText.trim();
  var caseId = row.querySelector('.id a').innerText.trim();
  if (status === 'Passed') {
    casesTabOne.push(caseId);
  }
});
console.log(casesTabOne);
```

### Find missing successful test cases in Test Rail
```
var casesTabOne = ["C444", "C445", ...]; // Replace with the actual array from Tab One
var casesTabTwo = [];
document.querySelectorAll('tr.row').forEach(row => {
  var status = row.querySelector('.js-status a').innerText.trim();
  var caseId = row.querySelector('.id a').innerText.trim();
  if (status === 'Passed') {
    casesTabTwo.push(caseId);
  }
});

var missingCases = casesTabOne.filter(caseId => !casesTabTwo.includes(caseId));
console.log("Missing Cases:", missingCases);
```

# TODO Annotators
### Pending bug fix
```
        /**
         * TODO:
         * PENDING DNG#1234
         */
```