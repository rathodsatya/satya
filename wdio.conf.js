/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
require('ts-node').register({ files: true });
require('dotenv').config();
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const { TestRailHelper } = require('./helpers/testRail');
const { addEnvironment, addAttachment } = require('@wdio/allure-reporter').default;
const dateFormat = require('dateformat');
const now = new Date();
const realVal = now.setHours(now.getHours() + (now.getTimezoneOffset() == 0 ? 2 : 0));
const faker = require('faker');

// by default Google Chrome browser is used
process.env.BROWSER_NAME = process.env.BROWSER_NAME || 'chrome';
process.env.DEFAULT_DOWNLOAD_DIR = path.join(__dirname, 'downloads');
process.env.BASE_URL = process.env.BASE_URL || 'http://websiteranking.ai/';
const isTestRailRun = JSON.parse(process.env.TESTRAIL_RUN || 0);
const headlessMode = JSON.parse(process.env.HEADLESS || 0);
const maxInstances = process.env.INSTANCES ? +process.env.INSTANCES : 1;
const testRunName = `TestRun for ${process.env.PRODUCT} - ${dateFormat(realVal, 'dddd, mmmm dS, yyyy, HH:MM:ss', false)}`;
let testRailRunUrl = null,
    capabilities = [],
    services = [],
    startedAt = null;
// =========
// TestRail configuration
// =========
//
const testRailClient = (module.exports.testRailClient = new TestRailHelper({
    domain: 'https://sar55.testrail.io/', //Testrail domain
    testRailApi: 'index.php?/api/v2/',
    projectId: 1,
    suiteId: 1,
    runName: testRunName
}));

// =========
// Arguments
// =========

let chromeArgs = [
    '--no-sandbox',
    '--disable-extensions',
    '--window-size=2560,1440',
    '--disable-popup-blocking',
    '--disable-dev-shm-usage',
    '--disable-impl-side-painting',
    '--disabled-gpu',
    '--disable-notifications',
    '--disable-plugins',
    '--start-maximized'
];

// ============
// Capabilities
// ============

let chromeCaps = {
    browserName: 'chrome',
    'goog:chromeOptions': {
        binary: "D:\\Development\\Tools\\Binaries\\chrome.exe",
        args: chromeArgs,
        w3c: false,
        prefs: {
            download: {
                default_directory: process.env.DEFAULT_DOWNLOAD_DIR
            },
            'intl.accept_languages': 'en-US'
        }
    }
};

let safari = {
    browserName: 'safari'
};

switch (process.env.BROWSER_NAME.toLowerCase()) {
    case 'chrome':
        capabilities.push(chromeCaps);
        services.push(['chromedriver', 'selenium-standalone', 'devtools']);
        break;
    default:
        throw new Error(
            `Incorrect -> ${process.env.BROWSER_NAME} <-  browser name - please check BROWSER_NAME=??? environment variable. Please use Chrome`
        );
}

if (headlessMode) {
    chromeArgs.push('--headless');
    chromeArgs.push('--force-device-scale-factor=0.95');
}

exports.config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
    // on a remote machine).
    runner: 'local',
    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs: ['./specs/**/*.ts'],
    suites: {
        dashboardTests: ['./specs/DASHBOARD/*.ts'],
        landingTests: ['./specs/LANDING/*.ts'],
    },
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities,
    // If outputDir is provided WebdriverIO can capture driver session logs
    // it is possible to configure which logTypes to include/exclude.
    // excludeDriverLogs: ['*'], // pass '*' to exclude all driver session logs
    // excludeDriverLogs: ['bugreport', 'server'],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'error',
    deprecationWarnings: false,
    //
    // Set specific log levels per logger
    // loggers:
    // - webdriver, webdriverio
    // - @wdio/applitools-service, @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
    // - @wdio/mocha-framework, @wdio/jasmine-framework
    // - @wdio/local-runner, @wdio/lambda-runner
    // - @wdio/sumologic-reporter
    // - @wdio/cli, @wdio/config, @wdio/sync, @wdio/utils
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    // logLevels: {
    //     webdriver: 'info',
    //     '@wdio/applitools-service': 'info'
    // },
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    sync: true,
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: process.env.BASE_URL,
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 20000,
    //
    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 50000,
    //
    // Default request retries count
    connectionRetryCount: 1,
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    services,
    // services: ['safaridriver', 'selenium-standalone'],
    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: https://webdriver.io/docs/frameworks.html
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'mocha',
    //
    // The number of times to retry the entire specfile when it fails as a whole
    specFileRetries: process.env.RETRIES != 0 ? 1 : 0,
    //
    // Delay in seconds between the spec file retry attempts
    // specFileRetriesDelay: 0,
    //
    // Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
    // specFileRetriesDeferred: false,
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: https://webdriver.io/docs/dot-reporter.html
    reporters: [
        'spec',
        // [
        //     video,
        //     {
        //         saveAllVideos: false, // If true, also saves videos for successful test cases
        //         videoSlowdownMultiplier: 3 // Higher to get slower videos, lower for faster videos [Value 1-100]
        //     }
        // ],
        [
            'allure',
            {
                outputDir: 'artifacts/allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: true,
                disableMochaHooks: true
            }
        ]
    ],

    //
    // Options to be passed to Mocha.
    // See the full list at http://mochajs.org/
    mochaOpts: {
        ui: 'bdd',
        timeout: 9999999,
        retries: process.env.RETRIES
    },
    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */

    onPrepare: async function (config, capabilities) {
        // try {
        //     await exec('rmdir artifacts /s /q');
        // } catch (e) {}
        // // if need to download
        // try {
        //     await exec('rmdir downloads');
        // } catch (e) {}
        // await exec('mkdir downloads');
        //
        // await exec('rm -rf artifacts/*');
        // if need to download
        await exec('rm -rf artifacts/* && mkdir -p downloads && rm -rf downloads/*');

        if (isTestRailRun) {
            /*=== Generate IDs for a new test run in the TestRail ===*/
            let path = [];
            let ids = [];
            let getFiles = function (dir, files_) {
                files_ = files_ || [];

                let files = fs.readdirSync(dir);

                for (let i in files) {
                    let name = dir + '/' + files[i];
                    if (fs.statSync(name).isDirectory()) {
                        getFiles(name, files_);
                    } else {
                        path.push(name);
                    }
                }
            };

            switch (process.env.SUITE_TYPE) {
                case 'file':
                    path = config.suites[config.suite[0]];
                    break;
                case 'folder':
                    getFiles(config.suites[config.suite[0]][0].split('/*')[0]);
                    break;
                case 'all':
                    getFiles(config.specs[0].split('/**')[0]);
                    break;
                case 'product':
                    config.suites[config.suite].forEach((suite) => {
                        getFiles(suite.split('/*')[0]);
                    });
                    break;
            }

            path.forEach((path) => {
                let data = fs.readFileSync(path, 'utf-8');
                try {
                    data.match(/C\d+/g).map((el) => ids.push(+el.slice(1)));
                } catch (ex) {
                    console.log("Error");
                    console.log("Path of error is" + path);
                    console.log(ex);
                }

            });

            let testCaseIds = ids;
            const response = await testRailClient.createRun(testCaseIds);
            process.env.TEST_RAIL_RUN_ID = response.id;
            if (process.env.CI) {
                await exec(`touch .env`);
                await exec(`echo TEST_RAIL_RUN_ID=${process.envTEST_RAIL_RUN_ID} >> .env`);
            }
            testRailRunUrl = response.url;
            startedAt = `Started at: ${dateFormat(realVal, 'HH:MM:ss', false)}`;
            let data = {
                description: `${startedAt}\nStatus: In progress`
            };
            await testRailClient.updateRun(process.env.TEST_RAIL_RUN_ID, data);
        }
    },
    /**
     * Gets executed before a worker process is spawned and can be used to initialise specific service
     * for that worker as well as modify runtime environments in an async fashion.
     * @param  {String} cid      capability id (e.g 0-0)
     * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
     * @param  {[type]} specs    specs to be run in the worker process
     * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
     * @param  {[type]} execArgv list of string arguments passed to the worker process
     */
    // onWorkerStart: function (cid, caps, specs, args, execArgv) {
    // },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    // beforeSession: function (config, capabilities, specs) {
    //     capabilities.name=specs[0].split(/(\\|\/)/g).pop() || undefined;
    // },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    before: function (capabilities, specs) {
        console.log("wdioBefore");
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Hook that gets executed before the suite starts
     * @param {Object} suite suite details
     */
    beforeSuite: function (suite) {
        browser.pause(Math.ceil(Math.random() * 3000)); // Pauses for random seconds
        console.log("beforeSuite");
    },
    /**
     * Function to be executed before a test (in Mocha/Jasmine) starts.
     */
    beforeTest: async function (test, context) {
        console.log("beforeTest");
        addEnvironment('Browser', browser.capabilities.browserName);
        addEnvironment('ENV', browser.config.baseUrl);
        browser.pause(3000); // Pauses for 3 seconds
    },
    /**
     * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
     * beforeEach in Mocha)
     */
    // beforeHook: function (test, context) {
    // },
    /**
     * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
     * afterEach in Mocha)
     */
    // afterHook: function (test, context, { error, result, duration, passed, retries }) {
    // },
    /**
     * Function to be executed after a test (in Mocha/Jasmine).
     */
    afterTest: function (test, context, { error, result, duration, passed, retries }) {
        let image = null;
        let testCaseIds = test.title.match(/C\d+/gm);
        let url;
        try {
            url = browser.getUrl();
        } catch (error) {
            console.log(error, `\nOrccurs after "${test.title}" case`);
        }

        let config = {
            passed,
            runId: process.env.TEST_RAIL_RUN_ID
        };

        if (!passed) {
            let screenShot = browser.takeScreenshot();
            image = new Buffer.from(screenShot, 'base64');
            addAttachment('screenshot', image, 'image/png');
            console.log('\x1b[31m%s\x1b[0m', `    ${error.stack} \n`);
            console.log('\x1b[34m%s\x1b[0m', url);
        }
        if (process.env.TEST_RAIL_RUN_ID && testCaseIds.length > 0) {
            if (error) {
                config.errorMessage = error.message;
                config.url = url;
                config.stack = `    ${error.stack} \n`;
            }
            testCaseIds.forEach((id) => {
                let caseId = id.slice(1);
                config = { ...config, caseId };

                browser.call(async () => {
                    await testRailClient.addCaseResult(config, image);
                });
            });
        }
        try {
            const windows = browser.getWindowHandles();
            windows.forEach((w, i) => {
                if (i !== 0) {
                    browser.switchToWindow(windows[i]);
                    browser.execute('window.sessionStorage.clear(); window.localStorage.clear();');
                    browser.deleteAllCookies();
                    browser.closeWindow();
                }
            });
            browser.switchToWindow(windows[0]);
        } catch (e) { }
    },

    /**
     * Hook that gets executed after the suite has ended
     * @param {Object} suite suite details
     */
    // afterSuite: function (suite) {
    // },
    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    /*
    after: async function (result, capabilities, specs) {  
    },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    onComplete: async function (exitCode, config, capabilities, results) {
        //
        // exec('allure generate --clean ./artifacts/allure-results -o ./artifacts/allure-report');
        //
        // try {
        //     await pWaitFor(() => pathExists(path.join(__dirname, 'artifacts' ,'allure-report', 'data', 'attachments')), {
        //         timeout: 150000
        //     });
        // } catch (e) {
        //     console.log(e);
        // }
        if (process.env.TEST_RAIL_RUN_ID) {
            let time = new Date();
            const timeVal = time.setHours(time.getHours() + (time.getTimezoneOffset() == 0 ? 2 : 0));
            let config = {
                description: `${startedAt}\nFinished at: ${dateFormat(timeVal, 'HH:MM:ss', false)}`
            };
            await testRailClient.updateRun(process.env.TEST_RAIL_RUN_ID, config);
        }
    }
    /**
     * Gets executed when a refresh happens.
     * @param {String} oldSessionId session ID of the old session
     * @param {String} newSessionId session ID of the new session
     */
    //onReload: function(oldSessionId, newSessionId) {
    //}
};